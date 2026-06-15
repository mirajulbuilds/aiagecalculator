import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { validateInput, createValidationErrorResponse, birthDateSchema } from "../_shared/validation.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limiting check
    const clientIp = req.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(clientIp)) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { birthDate } = await req.json();

    // Validate input with Zod
    const requestSchema = z.object({
      birthDate: birthDateSchema
    });

    const validation = validateInput(requestSchema, { birthDate });
    if (!validation.success) {
      return createValidationErrorResponse(validation.errors, validation.fieldErrors, corsHeaders);
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse the date
    const date = new Date(birthDate);
    const month = date.getMonth() + 1;
    const day = date.getDate();

    // Calculate Zodiac Sign
    const zodiacSign = getZodiacSign(month, day);

    // Calculate Life Path Number
    const lifePathNumber = calculateLifePathNumber(birthDate);

    console.log(`Processing birth date: ${birthDate}`);
    console.log(`Zodiac Sign: ${zodiacSign}, Life Path Number: ${lifePathNumber}`);

    // Generate past life story using Lovable AI
    const prompt = `Create a captivating 'past life' story for someone whose Zodiac Sign is ${zodiacSign} and Life Path Number is ${lifePathNumber}. Write a vivid, engaging 2-3 paragraph narrative (150-200 words) about who they were in a past life — their era, profession, personality, and a memorable moment. Make it mystical yet believable, positive, and shareable. Write in second person ('You were...').`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          {
            role: "system",
            content: "You are a mystical storyteller who creates engaging, imaginative past life narratives based on astrology and numerology. Your stories are vivid, positive, and shareable.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.9,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI API error:", aiResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: "Failed to generate past life story" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await aiResponse.json();
    const pastLifeStory = aiData.choices[0].message.content;

    console.log("Successfully generated past life story");

    return new Response(
      JSON.stringify({ past_life_story: pastLifeStory }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in past-life-generator:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function getZodiacSign(month: number, day: number): string {
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return "Aries";
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return "Taurus";
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return "Gemini";
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return "Cancer";
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return "Leo";
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return "Virgo";
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return "Libra";
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return "Scorpio";
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return "Sagittarius";
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return "Capricorn";
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return "Aquarius";
  return "Pisces";
}

function calculateLifePathNumber(birthDate: string): number {
  // Remove all non-digit characters and sum the digits
  const digits = birthDate.replace(/\D/g, "");
  
  let sum = 0;
  for (const digit of digits) {
    sum += parseInt(digit);
  }
  
  // Reduce to single digit (unless it's 11, 22, or 33 - master numbers)
  while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
    const temp = sum.toString();
    sum = 0;
    for (const digit of temp) {
      sum += parseInt(digit);
    }
  }
  
  return sum;
}
