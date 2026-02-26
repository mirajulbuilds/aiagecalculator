import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { validateInput, createValidationErrorResponse, dateSchema } from "../_shared/validation.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limiting storage (in-memory, resets on function cold start)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 60;
const RATE_WINDOW = 60000;

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

const calculationMethodEnum = z.enum(["LMP", "Conception", "IVF_Day3", "IVF_Day5", "DogMating"], {
  errorMap: () => ({ message: "Calculation method must be one of: LMP, Conception, IVF_Day3, IVF_Day5, DogMating" })
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const identifier = req.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(identifier)) {
      return new Response(
        JSON.stringify({ error: 'Too many requests. Please try again later.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { calculationMethod, inputDate } = await req.json();

    console.log("Calculating due date with data:", { calculationMethod, inputDate });

    const requestSchema = z.object({
      calculationMethod: calculationMethodEnum,
      inputDate: dateSchema.refine((date) => {
        const d = new Date(date);
        const now = new Date();
        const threeYearsAgo = new Date(now.getFullYear() - 3, now.getMonth(), now.getDate());
        return d >= threeYearsAgo && d <= now;
      }, "Input date must be within the last 3 years")
    });

    const validation = validateInput(requestSchema, { calculationMethod, inputDate });
    if (!validation.success) {
      return createValidationErrorResponse(validation.errors, validation.fieldErrors, corsHeaders);
    }

    const isDogPregnancy = calculationMethod === "DogMating";

    // For dog pregnancy, calculate locally (no AI needed - it's straightforward)
    if (isDogPregnancy) {
      const matingDate = new Date(inputDate);
      const dueDate = new Date(matingDate);
      dueDate.setDate(dueDate.getDate() + 63); // 63 days gestation

      const now = new Date();
      const diffMs = now.getTime() - matingDate.getTime();
      const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const weeks = Math.floor(totalDays / 7);
      const days = totalDays % 7;

      let stage = "Early";
      if (totalDays <= 21) stage = "Early (Weeks 1-3)";
      else if (totalDays <= 42) stage = "Middle (Weeks 4-6)";
      else stage = "Late (Weeks 7-9)";

      const dueDateFormatted = dueDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

      return new Response(
        JSON.stringify({
          estimatedDueDate: dueDateFormatted,
          weeksPregnant: `${weeks} Weeks & ${days} Days`,
          currentTrimester: stage,
          babyZodiacSign: "",
          isDogPregnancy: true,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Human pregnancy - use AI
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let daysToAdd = 280; // LMP default
    let methodDesc = "Last Menstrual Period (LMP)";
    switch (calculationMethod) {
      case "Conception":
        daysToAdd = 266;
        methodDesc = "Conception Date";
        break;
      case "IVF_Day3":
        daysToAdd = 263;
        methodDesc = "IVF Day 3 Embryo Transfer";
        break;
      case "IVF_Day5":
        daysToAdd = 261;
        methodDesc = "IVF Day 5 Blastocyst / FET Transfer";
        break;
    }

    const prompt = `You are an OB/GYN calculations expert. Based on the following data:
- Calculation Method: ${methodDesc}
- Input Date: ${inputDate}
- Days to add for due date: ${daysToAdd}

Calculate the following:
1. estimatedDueDate: Add ${daysToAdd} days to the input date. Format as a readable date like "August 20, 2026".
2. weeksPregnant: Calculate the number of weeks and days from the input date to today's date. Format as "X Weeks & Y Days" (e.g., "8 Weeks & 2 Days").
3. currentTrimester: Determine if it's the "First", "Second", or "Third" trimester based on weeks pregnant (First: 0-13 weeks, Second: 14-27 weeks, Third: 28+ weeks).
4. babyZodiacSign: Determine the zodiac sign based on the estimated due date, including the emoji symbol (e.g., "Leo ♌").

Return ONLY a valid JSON object in this exact format (no additional text):
{
  "estimatedDueDate": "August 20, 2026",
  "weeksPregnant": "8 Weeks & 2 Days",
  "currentTrimester": "First",
  "babyZodiacSign": "Leo ♌"
}`;

    console.log("Sending request to AI with prompt");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ error: "AI service error" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiData = await response.json();
    const aiResponse = aiData.choices?.[0]?.message?.content;
    if (!aiResponse) {
      return new Response(
        JSON.stringify({ error: "Invalid AI response" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let result;
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        result = JSON.parse(aiResponse);
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError, "Response:", aiResponse);
      return new Response(
        JSON.stringify({ error: "Failed to parse AI response" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!result.estimatedDueDate || !result.weeksPregnant || !result.currentTrimester || !result.babyZodiacSign) {
      return new Response(
        JSON.stringify({ error: "Invalid AI response format" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    result.isDogPregnancy = false;
    console.log("Successfully calculated due date:", result);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Error in get-due-date function:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
