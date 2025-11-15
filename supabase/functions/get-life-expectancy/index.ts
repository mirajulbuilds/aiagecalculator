import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
      console.log(`Rate limit exceeded for ${identifier}`);
      
      // Log rate limit violation using createClient
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      
      // Fire and forget - don't wait for logging
      fetch(`${supabaseUrl}/functions/v1/log-security-event`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`
        },
        body: JSON.stringify({
          event_type: 'rate_limit',
          ip_address: identifier,
          details: {
            function: 'get-life-expectancy',
            limit: RATE_LIMIT,
            window_ms: RATE_WINDOW
          },
          severity: 'medium'
        })
      }).catch(err => console.error('Failed to log rate limit:', err));
      
      return new Response(
        JSON.stringify({ error: 'Too many requests. Please try again later.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { birthDate, gender, country, smoking, exercise, alcohol } = await req.json();

    console.log("Calculating life expectancy with data:", {
      birthDate,
      gender,
      country,
      smoking,
      exercise,
      alcohol
    });

    // Validate inputs
    if (!birthDate || !gender || !country || !smoking || !exercise || !alcohol) {
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
    const prompt = `Based on the following data:
- Birth Date: ${birthDate}
- Gender: ${gender}
- Country: ${country}
- Smoking Habits: ${smoking}
- Exercise Frequency: ${exercise}
- Alcohol Consumption: ${alcohol}

Act as a data scientist and health analyst. 

1. Calculate the user's estimated life expectancy as a single number (e.g., 82)
2. Write a short (2-3 sentences), positive, and encouraging summary about their potential longevity
3. Provide 3-5 specific, actionable lifestyle recommendations to maximize their life expectancy. Each recommendation should:
   - Target the area that needs most improvement based on their current inputs
   - Be specific and actionable (not generic advice)
   - Explain the potential impact in years gained or percentage improvement
   - Include a priority level (high, medium, low)
   - Include a category (smoking, exercise, alcohol, diet, sleep, stress, or other)

Return ONLY a valid JSON object in this exact format (no additional text):
{
  "estimated_age": 82,
  "summary_text": "You are on a great track for a long life...",
  "recommendations": [
    {
      "title": "Quit smoking immediately",
      "description": "Stopping smoking now could add 7-10 years to your life expectancy and dramatically reduce heart disease risk.",
      "impact": "+7-10 years",
      "priority": "high",
      "category": "smoking"
    }
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
    if (!result.estimated_age || !result.summary_text || !result.recommendations) {
      console.error("Missing required fields in AI response:", result);
      return new Response(
        JSON.stringify({ error: "Invalid AI response format" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("Successfully calculated life expectancy:", result);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Error in get-life-expectancy function:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
