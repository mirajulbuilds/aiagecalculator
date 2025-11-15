import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { validateInput, createValidationErrorResponse, birthDateSchema } from "../_shared/validation.ts";
import { checkIPBlocked, logBlockedIPAttempt } from "../_shared/ipBlocking.ts";

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

// Calculate Western Zodiac sign
function getWesternZodiac(month: number, day: number): string {
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

// Calculate Chinese Zodiac sign
function getChineseZodiac(year: number): string {
  const animals = ["Rat", "Ox", "Tiger", "Rabbit", "Dragon", "Snake", "Horse", "Goat", "Monkey", "Rooster", "Dog", "Pig"];
  return animals[(year - 4) % 12];
}

// Calculate Life Path Number
function getLifePathNumber(dateStr: string): number {
  const digits = dateStr.replace(/-/g, "").split("").map(Number);
  let sum = digits.reduce((a, b) => a + b, 0);
  
  while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
    sum = sum.toString().split("").map(Number).reduce((a, b) => a + b, 0);
  }
  
  return sum;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get client IP
    const clientIp = req.headers.get('x-forwarded-for') || 'unknown';

    // Check if IP is blocked
    const isBlocked = await checkIPBlocked(clientIp);
    if (isBlocked) {
      await logBlockedIPAttempt(clientIp, 'birthday-compatibility');
      return new Response(
        JSON.stringify({ error: 'Access denied' }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Rate limiting check
    if (!checkRateLimit(clientIp)) {
      // Log rate limit violation
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      
      fetch(`${supabaseUrl}/functions/v1/log-security-event`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`
        },
        body: JSON.stringify({
          event_type: 'rate_limit',
          ip_address: clientIp,
          details: {
            function_name: 'birthday-compatibility',
            timestamp: new Date().toISOString()
          },
          severity: 'medium'
        })
      }).catch(err => console.error('Failed to log rate limit:', err));

      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { date1, date2 } = await req.json();

    // Validate input with Zod
    const requestSchema = z.object({
      date1: birthDateSchema,
      date2: birthDateSchema
    });

    const validation = validateInput(requestSchema, { date1, date2 });
    if (!validation.success) {
      return createValidationErrorResponse(validation.errors, validation.fieldErrors);
    }

    const d1 = new Date(date1);
    const d2 = new Date(date2);

    // Calculate all the attributes
    const yourZodiac = getWesternZodiac(d1.getMonth() + 1, d1.getDate());
    const theirZodiac = getWesternZodiac(d2.getMonth() + 1, d2.getDate());
    const yourChineseZodiac = getChineseZodiac(d1.getFullYear());
    const theirChineseZodiac = getChineseZodiac(d2.getFullYear());
    const yourLifePath = getLifePathNumber(date1);
    const theirLifePath = getLifePathNumber(date2);

    console.log("Calculated attributes:", {
      yourZodiac,
      theirZodiac,
      yourChineseZodiac,
      theirChineseZodiac,
      yourLifePath,
      theirLifePath,
    });

    // Call Lovable AI to get compatibility analysis
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

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
            content: "You are a compatibility expert who analyzes relationships based on Western Zodiac, Chinese Zodiac, and Numerology. Provide compatibility scores and engaging summaries.",
          },
          {
            role: "user",
            content: `Analyze the compatibility between:
Person 1: ${yourZodiac} (Western), ${yourChineseZodiac} (Chinese), Life Path ${yourLifePath}
Person 2: ${theirZodiac} (Western), ${theirChineseZodiac} (Chinese), Life Path ${theirLifePath}

Calculate three separate compatibility scores (0-100):
1. Western Zodiac compatibility between ${yourZodiac} and ${theirZodiac}
2. Chinese Zodiac compatibility between ${yourChineseZodiac} and ${theirChineseZodiac}
3. Numerology compatibility between Life Path ${yourLifePath} and ${theirLifePath}

Then provide an engaging, fun, human-like summary (2-3 sentences) explaining the overall compatibility.`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "calculate_compatibility",
              description: "Calculate compatibility scores and generate summary",
              parameters: {
                type: "object",
                properties: {
                  zodiac_score: {
                    type: "number",
                    description: "Western zodiac compatibility score (0-100)",
                  },
                  chinese_score: {
                    type: "number",
                    description: "Chinese zodiac compatibility score (0-100)",
                  },
                  numerology_score: {
                    type: "number",
                    description: "Numerology life path compatibility score (0-100)",
                  },
                  summary_text: {
                    type: "string",
                    description: "Engaging, fun summary of the compatibility (2-3 sentences)",
                  },
                },
                required: ["zodiac_score", "chinese_score", "numerology_score", "summary_text"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "calculate_compatibility" } },
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI API error:", aiResponse.status, errorText);
      throw new Error("Failed to get AI compatibility analysis");
    }

    const aiData = await aiResponse.json();
    console.log("AI response:", JSON.stringify(aiData));

    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error("No tool call in AI response");
    }

    const compatibility = JSON.parse(toolCall.function.arguments);
    
    // Calculate total score
    const totalScore = Math.round(
      (compatibility.zodiac_score + compatibility.chinese_score + compatibility.numerology_score) / 3
    );

    const result = {
      total_score: totalScore,
      summary_text: compatibility.summary_text,
      breakdown: {
        your_zodiac: yourZodiac,
        their_zodiac: theirZodiac,
        your_chinese_zodiac: yourChineseZodiac,
        their_chinese_zodiac: theirChineseZodiac,
        your_life_path: yourLifePath,
        their_life_path: theirLifePath,
      },
    };

    console.log("Final result:", result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in birthday-compatibility function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
