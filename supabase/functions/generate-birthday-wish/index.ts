import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limiting storage (in-memory, resets on function cold start)
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
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limiting check
    const identifier = req.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(identifier)) {
      return new Response(
        JSON.stringify({ error: 'Too many requests. Please try again later.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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

    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent", {
      method: "POST",
      headers: {
        "x-goog-api-key": GEMINI_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    if (!response.ok) {
      console.error('AI API error:', response.status);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Service is busy. Please try again later." }),
          { 
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }
      
      if (response.status === 403 || response.status === 401) {
        return new Response(
          JSON.stringify({ error: "Authentication failed. Please try again later." }),
          { 
            status: 503,
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "Failed to generate birthday wish. Please try again." }),
        { 
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    const data = await response.json();

    // Extract the base64 image from the response
    const imageData = data.candidates?.[0]?.content?.parts?.find((part: any) => part.inlineData)?.inlineData?.data;
    
    if (!imageData) {
      console.error('No image in response');
      throw new Error("No image generated in response");
    }
    
    const imageUrl = `data:image/png;base64,${imageData}`;
    
    if (!imageUrl) {
      console.error('No image in response');
      throw new Error("No image generated in response");
    }

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
    console.error('Error in generate-birthday-wish function');
    return new Response(
      JSON.stringify({ error: 'Failed to process your request. Please try again.' }),
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
