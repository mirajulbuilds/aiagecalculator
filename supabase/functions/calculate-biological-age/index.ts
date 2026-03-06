import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      age, gender, height, weight, exercise, smoking, alcohol,
      sleep, diet, stress, hydration, blood_pressure, resting_heart_rate,
      chronic_conditions, face_age,
    } = await req.json();

    if (!age || !gender) {
      return new Response(JSON.stringify({ error: "Age and gender are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const bmi = height && weight ? (weight / ((height / 100) ** 2)).toFixed(1) : "unknown";

    const prompt = `You are a biological age estimation AI. Given the following user health data, calculate their estimated biological age and provide a detailed breakdown.

User Data:
- Chronological Age: ${age}
- Gender: ${gender}
- Height: ${height || "not provided"} cm
- Weight: ${weight || "not provided"} kg
- BMI: ${bmi}
- Exercise: ${exercise || "not provided"}
- Smoking: ${smoking || "not provided"}
- Alcohol: ${alcohol || "not provided"}
- Sleep: ${sleep || "not provided"} hours/night
- Diet Quality: ${diet || "not provided"}
- Stress Level: ${stress || "not provided"}
- Hydration: ${hydration || "not provided"}
- Blood Pressure: ${blood_pressure || "not provided"}
- Resting Heart Rate: ${resting_heart_rate || "not provided"} bpm
- Chronic Conditions: ${chronic_conditions && chronic_conditions.length > 0 ? chronic_conditions.join(", ") : "none reported"}
- Face Age (from photo analysis): ${face_age || "not provided"}

Respond ONLY with a valid JSON object (no markdown, no code fences) with this exact structure:
{
  "biological_age": <number - estimated biological age>,
  "chronological_age": ${age},
  "age_difference": <number - positive means younger (good), negative means older (bad)>,
  "face_age": ${face_age || "null"},
  "summary": "<string - 2-3 sentence motivational summary about their biological age>",
  "category_scores": [
    {"category": "Cardiovascular", "score": <0-100>},
    {"category": "Fitness", "score": <0-100>},
    {"category": "Nutrition", "score": <0-100>},
    {"category": "Sleep", "score": <0-100>},
    {"category": "Mental Health", "score": <0-100>},
    {"category": "Lifestyle", "score": <0-100>}
  ],
  "recommendations": [
    {"title": "<string>", "description": "<string>", "impact": "<string - e.g. Could reduce bio age by 1-2 years>"}
  ],
  "detailed_breakdown": {
    "cardiovascular_age": <number>,
    "metabolic_age": <number>,
    "fitness_age": <number>
  }
}

Be realistic and scientific. Base the biological age on established research about how lifestyle factors affect aging. The biological age should typically be within ±15 years of chronological age.`;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a biological age estimation expert. Always respond with valid JSON only." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Service credits exhausted. Please try again later." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      throw new Error("AI service error");
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content;

    if (!content) throw new Error("No response from AI");

    // Clean markdown fences if present
    const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const result = JSON.parse(cleaned);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("calculate-biological-age error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
