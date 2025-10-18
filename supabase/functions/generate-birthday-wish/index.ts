import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, birthDate, age, customPrompt } = await req.json();
    
    // Input validation
    if (name && (typeof name !== 'string' || name.length > 100)) {
      return new Response(
        JSON.stringify({ error: "Name must be a string with maximum 100 characters" }),
        { 
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    if (!birthDate || typeof birthDate !== 'string') {
      return new Response(
        JSON.stringify({ error: "Birth date is required and must be a string" }),
        { 
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(birthDate)) {
      return new Response(
        JSON.stringify({ error: "Birth date must be in YYYY-MM-DD format" }),
        { 
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Validate that the date is valid
    const parsedDate = new Date(birthDate);
    if (isNaN(parsedDate.getTime())) {
      return new Response(
        JSON.stringify({ error: "Invalid birth date" }),
        { 
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    if (typeof age !== 'number' || age < 0 || age > 150) {
      return new Response(
        JSON.stringify({ error: "Age must be a number between 0 and 150" }),
        { 
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    console.log('Generating birthday wish for:', { name, birthDate, age });

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    // Format the birth date nicely - parse date components directly without timezone conversion
    const [year, month, day] = birthDate.split('-').map(Number);
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                        'July', 'August', 'September', 'October', 'November', 'December'];
    const formattedDate = `${monthNames[month - 1]} ${day}, ${year}`;

    // Create a concise prompt for a birthday wish message that will be displayed on an image
    const nameText = name ? name : 'you';
    const defaultPrompt = `Write a heartfelt and joyful birthday wish for ${nameText} who is turning ${age} years old and was born on ${formattedDate}. 
    
    Keep it short (maximum 50 words), warm, personal, and celebratory. Focus on wishing them happiness, success, and wonderful memories. 
    
    Do not include the name or age in the message as those will be displayed separately on the birthday card. Just write the wish itself.`;
    
    // Use custom prompt if provided, otherwise use default
    const prompt = customPrompt 
      ? `${customPrompt}
      
      Keep the message short (maximum 50 words) and suitable for a birthday card.`
      : defaultPrompt;

    console.log('Calling Gemini API with prompt...');

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.9,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192,
          }
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { 
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }
      
      throw new Error(`Gemini API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log('Received response from Gemini API');

    // Extract the generated text from Gemini response
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!generatedText) {
      console.error('No text in response:', JSON.stringify(data));
      throw new Error("No content generated in response");
    }

    console.log('Successfully generated birthday wish message');

    return new Response(
      JSON.stringify({ 
        message: generatedText,
        success: true
      }),
      { 
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        } 
      }
    );
  } catch (error) {
    console.error('Error in generate-birthday-wish function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        } 
      }
    );
  }
});
