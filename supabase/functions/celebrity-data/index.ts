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
    const { type, name, query, date, month, category, dateOfBirth, profession } = await req.json();
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    let systemPrompt = '';
    let userPrompt = '';

    if (type === 'search') {
      systemPrompt = 'You are a celebrity information expert. Provide accurate, comprehensive data about celebrities.';
      userPrompt = `Provide detailed information about the celebrity "${query || name}". Include: full name, date of birth (YYYY-MM-DD format), place of birth, profession, zodiac sign, a 2-3 paragraph biography, and list 4-6 of their most famous works/achievements. Format as JSON with keys: fullName, dateOfBirth, placeOfBirth, profession, zodiacSign, biography, famousWorks (array).`;
    } else if (type === 'bornTodayLite') {
      // Lightweight version - only names, dates, and professions
      systemPrompt = 'You are a celebrity birthday expert.';
      userPrompt = `List 6 famous celebrities born on ${month} ${date}. For each, provide ONLY: name (string), dateOfBirth (string in YYYY-MM-DD format), profession (string). NO descriptions or additional fields. Format as a JSON array with ONLY these 3 keys per object.`;
    } else if (type === 'bornToday') {
      // Full version with rich content - 2-3 sentence summaries
      systemPrompt = 'You are a celebrity birthday expert specializing in engaging biographical content.';
      userPrompt = `List 6 famous celebrities born on ${month} ${date}. For each celebrity, provide:
- name (full name as string)
- dateOfBirth (string in YYYY-MM-DD format with year)
- profession (string)
- summary (2-3 engaging sentences highlighting their most famous achievements, contributions, or why they're well-known. Make it informative and interesting.)

Format as a JSON array. Each celebrity MUST include all 4 fields with substantive content.`;
    } else if (type === 'profile') {
      // Detailed profile for a specific celebrity with comprehensive 300-400 word biography
      systemPrompt = 'You are a professional celebrity biographer. Write comprehensive, engaging, and accurate profiles.';
      userPrompt = `Create a detailed profile for ${name} (${profession}, born ${dateOfBirth}). Include:
- name (full name as string)
- dateOfBirth (YYYY-MM-DD format as string)
- placeOfBirth (city, country as string)
- profession (as string)
- zodiacSign (as string)
- biography (a comprehensive 300-400 word biography covering their early life, career journey, major achievements, impact on their field, and legacy. Write in an engaging narrative style with multiple paragraphs separated by \\n\\n. Make it informative, well-structured, and content-rich.)
- knownFor (array of 4-6 strings describing their most famous works, roles, achievements, or contributions)
- careerHighlights (array of 5-8 strings describing major awards, milestones, breakthrough moments, or significant achievements throughout their career)

Return as a single JSON object with these exact keys. The biography MUST be 300-400 words and provide substantial, high-quality content.`;
    } else if (type === 'category') {
      systemPrompt = 'You are a celebrity categorization expert.';
      userPrompt = `List 12 famous ${category} celebrities. For each, provide ONLY: name, dateOfBirth (YYYY-MM-DD format), profession. NO descriptions. Format as JSON array.`;
    } else if (type === 'month') {
      systemPrompt = 'You are a celebrity birthday calendar expert.';
      userPrompt = `List 20 famous celebrities born in ${month}. For each, provide ONLY: name, dateOfBirth (YYYY-MM-DD format), profession. NO descriptions. Format as JSON array.`;
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `${systemPrompt}\n\n${userPrompt}\n\nIMPORTANT: Return ONLY valid JSON, no markdown formatting or code blocks.`
            }]
          }],
          generationConfig: {
            temperature: 0.4,
            topK: 32,
            topP: 0.95,
            maxOutputTokens: 2048,
          }
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Gemini response:', JSON.stringify(data));
    
    let generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Clean up the response - remove markdown code blocks if present
    generatedText = generatedText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    let parsedData;
    try {
      parsedData = JSON.parse(generatedText);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Generated text:', generatedText);
      throw new Error('Failed to parse AI response as JSON');
    }

    return new Response(JSON.stringify({ data: parsedData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in celebrity-data function:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
