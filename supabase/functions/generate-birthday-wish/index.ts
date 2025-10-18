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

    // Create a detailed prompt for the birthday wish image
    const nameText = name ? `Happy Birthday ${name}!` : 'Happy Birthday!';
    const defaultPrompt = `Create a beautiful, festive birthday celebration image with an elegant design. 
    Include the following text prominently and clearly:
    "${nameText}"
    "Born on ${formattedDate}"
    "Celebrating ${age} wonderful years!"
    "Wishing you joy, success, and endless happiness!"
    
    The image should have:
    - Colorful balloons, confetti, and festive decorations
    - A modern, joyful aesthetic with vibrant colors
    - Beautiful typography that's easy to read
    - Celebratory elements like stars, sparkles, or fireworks
    - A warm and uplifting atmosphere
    - Professional design quality
    Make it look like a premium birthday greeting card with all text clearly visible and beautifully styled.`;
    
    // Use custom prompt if provided, otherwise use default
    const prompt = customPrompt 
      ? `${customPrompt}

      Important information to include:
      ${nameText}
      Born on ${formattedDate}
      Celebrating ${age} wonderful years!
      
      Make sure the text is clearly visible and beautifully styled.`
      : defaultPrompt;

    console.log('Calling Gemini API with prompt...');

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent?key=${GEMINI_API_KEY}`, {
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
          responseModalities: ["TEXT", "IMAGE"]
        }
      })
    });

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

    // Extract the base64 image from the response
    const imageData = data.candidates?.[0]?.content?.parts?.find((part: any) => part.inlineData)?.inlineData?.data;
    
    if (!imageData) {
      console.error('No image in response:', JSON.stringify(data));
      throw new Error("No image generated in response");
    }
    
    const imageUrl = `data:image/png;base64,${imageData}`;
    
    if (!imageUrl) {
      console.error('No image in response:', JSON.stringify(data));
      throw new Error("No image generated in response");
    }

    console.log('Successfully generated birthday wish image');

    return new Response(
      JSON.stringify({ imageUrl }),
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
