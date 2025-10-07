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
    const { name, birthDate, age } = await req.json();
    
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

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Format the birth date nicely - parse date components to avoid timezone issues
    const [year, month, day] = birthDate.split('-').map(Number);
    const date = new Date(year, month - 1, day); // month is 0-indexed
    const formattedDate = date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });

    // Create a detailed prompt for the birthday wish image
    const nameText = name ? `Happy Birthday ${name}!` : 'Happy Birthday!';
    const prompt = `Create a beautiful, festive birthday celebration image with an elegant design. 
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

    console.log('Calling Lovable AI with prompt...');

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        modalities: ["image", "text"]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { 
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your Lovable workspace." }),
          { 
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }
      
      throw new Error(`AI Gateway error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log('Received response from Lovable AI');

    // Extract the base64 image from the response
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    
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
