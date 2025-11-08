import "https://deno.land/x/xhr@0.1.0/mod.ts";
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

    const { occasion, date, customPrompt } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build enhanced prompt based on occasion and user input
    let enhancedPrompt = customPrompt;
    
    // Add occasion-specific context
    const occasionContext: Record<string, string> = {
      "Birthday": "Create a vibrant, celebratory birthday themed image with festive elements.",
      "Wedding Anniversary": "Create a romantic, elegant anniversary themed image with sophisticated elements.",
      "Valentine's Day": "Create a romantic Valentine's Day themed image with hearts and loving elements.",
      "Women's Day": "Create an empowering, beautiful Women's Day themed image celebrating femininity and strength.",
      "Mother's Day": "Create a warm, loving Mother's Day themed image with appreciation and love.",
      "Eid Mubarak": "Create a beautiful Islamic Eid celebration themed image with traditional elements.",
      "Puja Greetings": "Create a colorful, festive Hindu Puja themed image with traditional elements.",
      "Christmas": "Create a joyful, festive Christmas themed image with holiday elements.",
      "General Anniversary": "Create an elegant, celebratory anniversary themed image."
    };

    if (occasionContext[occasion]) {
      enhancedPrompt = `${occasionContext[occasion]} ${customPrompt}`;
    }

    // Add date information if provided
    if (date) {
      enhancedPrompt += ` Include the date ${date} in a tasteful way.`;
    }

    // Add quality suffix
    enhancedPrompt += " Ultra high resolution, professional quality, vibrant colors, beautiful composition.";

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
            content: enhancedPrompt
          }
        ],
        modalities: ["image", "text"]
      }),
    });

    if (!response.ok) {
      console.error("AI API error:", response.status);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Service is busy. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Service temporarily unavailable. Please try again later." }),
          { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "Failed to generate greeting image. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();

    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    
    if (!imageUrl) {
      throw new Error("No image generated");
    }

    return new Response(
      JSON.stringify({ imageUrl }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in generate-greeting-image function");
    return new Response(
      JSON.stringify({ error: "Failed to process your request. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
