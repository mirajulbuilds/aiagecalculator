import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

    console.log('Generating face embedding for image:', imageUrl);

    // Use Gemini Vision to analyze the image and generate face embedding
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-pro',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analyze this image and detect if there is a clear human face visible. If a face is detected, generate a detailed face embedding vector with 128 numerical features representing facial characteristics like:
- Face shape and structure
- Eye spacing and characteristics
- Nose shape and position
- Mouth and jaw structure
- Overall facial proportions
- Skin tone and texture markers

Return ONLY a JSON object in this exact format:
{
  "faceDetected": true/false,
  "embedding": [array of exactly 128 floating point numbers between -1 and 1],
  "confidence": 0.0 to 1.0
}

If no clear face is detected, return:
{
  "faceDetected": false,
  "embedding": null,
  "confidence": 0.0
}

Important: The embedding must be consistent - similar faces should produce similar vectors.`
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
        JSON.stringify({ error: 'Failed to generate face embedding', details: errorText }), 
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

    // Parse the JSON response from AI
    const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const embeddingData = JSON.parse(cleanContent);

    console.log('Face embedding generated:', {
      faceDetected: embeddingData.faceDetected,
      confidence: embeddingData.confidence,
      embeddingLength: embeddingData.embedding?.length
    });

    return new Response(
      JSON.stringify(embeddingData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-face-embedding:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        faceDetected: false,
        embedding: null,
        confidence: 0.0
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});