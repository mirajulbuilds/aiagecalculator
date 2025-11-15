import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { validateInput, createValidationErrorResponse, ageSchema, genderEnum, bmiSchema, smokingHabitsEnum, exerciseFrequencyEnum, alcoholConsumptionEnum, sleepQualityEnum, dietQualityEnum, stressLevelEnum } from "../_shared/validation.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limiting storage (in-memory, resets on function cold start)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 60; // requests per window
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

    const { age, gender, smoking, exercise, alcohol, sleep, diet, stress, bmi } = await req.json();

    console.log("Calculating health score with data:", {
      age,
      gender,
      smoking,
      exercise,
      alcohol,
      sleep,
      diet,
      stress,
      bmi
    });

    // Validate input with Zod
    const requestSchema = z.object({
      age: ageSchema,
      gender: genderEnum,
      bmi: bmiSchema,
      smoking: smokingHabitsEnum,
      exercise: exerciseFrequencyEnum,
      alcohol: alcoholConsumptionEnum,
      sleep: sleepQualityEnum,
      diet: dietQualityEnum,
      stress: stressLevelEnum
    });

    const validation = validateInput(requestSchema, { age, gender, smoking, exercise, alcohol, sleep, diet, stress, bmi });
    if (!validation.success) {
      return createValidationErrorResponse(validation.errors, validation.fieldErrors);
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create AI prompt
    const prompt = `Based on the following health data:
- Age: ${age}
- Gender: ${gender}
- BMI: ${bmi}
- Smoking Habits: ${smoking}
- Exercise Frequency: ${exercise}
- Alcohol Consumption: ${alcohol}
- Sleep Hours: ${sleep}
- Diet Quality: ${diet}
- Stress Level: ${stress}

Act as a health analyst and wellness expert. Calculate a comprehensive health score (0-100) based on these lifestyle factors. Then provide:
1. A brief summary (2-3 sentences) about their overall health status
2. Category scores for: Physical Fitness, Nutrition, Mental Health, Sleep Quality, Lifestyle Habits (each 0-100)
3. 3-5 prioritized recommendations with titles, descriptions, priority level (high/medium/low), and potential impact score
4. Comparison data showing how they compare to average scores in their age/gender category

Return ONLY a valid JSON object in this exact format (no additional text):
{
  "health_score": 75,
  "summary": "Your overall health is good with room for improvement...",
  "category_scores": [
    {"category": "Physical Fitness", "score": 80},
    {"category": "Nutrition", "score": 70},
    {"category": "Mental Health", "score": 65},
    {"category": "Sleep Quality", "score": 75},
    {"category": "Lifestyle Habits", "score": 70}
  ],
  "recommendations": [
    {
      "title": "Increase Exercise Frequency",
      "description": "Aim for 30 minutes of moderate activity 5 days per week",
      "priority": "high",
      "impact_score": 10
    }
  ],
  "comparison_data": [
    {"category": "Overall Health", "your_score": 75, "average_score": 68},
    {"category": "Fitness Level", "your_score": 80, "average_score": 65},
    {"category": "Nutrition", "your_score": 70, "average_score": 72}
  ]
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
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
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
    console.log("AI response received:", aiData);

    const aiResponse = aiData.choices?.[0]?.message?.content;
    if (!aiResponse) {
      console.error("No content in AI response");
      return new Response(
        JSON.stringify({ error: "Invalid AI response" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse the AI response (it should be JSON)
    let result;
    try {
      // Try to extract JSON from the response
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

    // Validate the result
    if (!result.health_score || !result.summary) {
      console.error("Missing required fields in AI response:", result);
      return new Response(
        JSON.stringify({ error: "Invalid AI response format" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("Successfully calculated health score:", result);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Error in calculate-health-score function:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
