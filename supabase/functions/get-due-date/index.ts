import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { calculationMethod, inputDate } = await req.json();

    console.log("Calculating due date with data:", {
      calculationMethod,
      inputDate
    });

    // Validate inputs
    if (!calculationMethod || !inputDate) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
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
    const prompt = `You are an OB/GYN calculations expert. Based on the following data:
- Calculation Method: ${calculationMethod}
- Input Date: ${inputDate}

Calculate the following:
1. estimatedDueDate: If method is 'LMP', add 280 days to the input date. If method is 'Conception', add 266 days to the input date. Format as a readable date like "August 20, 2026".
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
        model: "google/gemini-2.5-pro",
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
    if (!result.estimatedDueDate || !result.weeksPregnant || !result.currentTrimester || !result.babyZodiacSign) {
      console.error("Missing required fields in AI response:", result);
      return new Response(
        JSON.stringify({ error: "Invalid AI response format" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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
