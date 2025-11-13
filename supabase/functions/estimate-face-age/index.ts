import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 10; // requests per window
const RATE_WINDOW = 60000; // 1 minute in milliseconds

function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + RATE_WINDOW });
    return true;
  }

  if (record.count >= RATE_LIMIT) {
    return false;
  }

  record.count++;
  return true;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limiting check
    const clientIp = req.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(clientIp)) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { imageUrl } = await req.json();
    
    if (!imageUrl) {
      return new Response(
        JSON.stringify({ error: 'Image URL is required' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log('Analyzing face for age estimation...');

    // Use Gemini Vision to analyze the image and estimate age
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analyze this image and detect the primary person's face. Based on their facial features, skin texture, wrinkles, facial structure, and overall appearance, provide your best estimate of their age.

CRITICAL INSTRUCTIONS:
- Return ONLY a valid JSON object
- Do NOT include any markdown formatting, code blocks, or extra text
- The JSON must be parseable
- If multiple faces are present, analyze the most prominent one
- If no clear face is detected, return: {"error": "No clear face detected"}
- If you can estimate the age, return: {"estimatedAge": <number>}

Examples of CORRECT responses:
{"estimatedAge": 28}
{"estimatedAge": 45}
{"error": "No clear face detected"}

Examples of INCORRECT responses (DO NOT DO THIS):
\`\`\`json
{"estimatedAge": 28}
\`\`\`
Here is my estimate: {"estimatedAge": 28}

Return your response now:`
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl
                }
              }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to analyze image', details: errorText }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      console.error('No content in AI response:', data);
      return new Response(
        JSON.stringify({ error: 'Invalid AI response' }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Raw AI response:', content);

    // Parse the JSON response from AI
    // Remove any markdown code blocks if present
    let cleanContent = content.trim();
    
    // Remove markdown code blocks
    cleanContent = cleanContent.replace(/```json\n?/g, '');
    cleanContent = cleanContent.replace(/```\n?/g, '');
    
    // Remove any leading/trailing text
    const jsonMatch = cleanContent.match(/\{[^}]+\}/);
    if (jsonMatch) {
      cleanContent = jsonMatch[0];
    }
    
    console.log('Cleaned content:', cleanContent);

    let ageData;
    try {
      ageData = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('JSON parse error:', parseError, 'Content:', cleanContent);
      return new Response(
        JSON.stringify({ error: 'Failed to parse AI response. Please try again.' }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if error was returned
    if (ageData.error) {
      console.log('Face detection failed:', ageData.error);
      return new Response(
        JSON.stringify({ error: ageData.error }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate estimated age
    if (!ageData.estimatedAge || typeof ageData.estimatedAge !== 'number') {
      console.error('Invalid age data:', ageData);
      return new Response(
        JSON.stringify({ error: 'Could not determine age from image' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Successfully estimated age:', ageData.estimatedAge);

    return new Response(
      JSON.stringify(ageData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in estimate-face-age:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});