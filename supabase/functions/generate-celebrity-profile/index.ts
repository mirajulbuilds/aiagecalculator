import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, profession, birthdate, birthplace, country } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const prompt = `You are a professional celebrity biographer. Create a realistic, engaging, and ad-safe celebrity profile for a person with these details:

Name: ${name}
Profession: ${profession}
Birth Date: ${birthdate}
Birth Place: ${birthplace}
Country: ${country}

Generate ONLY valid JSON with this EXACT structure (no markdown, no code blocks, just pure JSON):

{
  "about": "A comprehensive 800-1000 word biography covering their career journey, major achievements, impact on their industry, notable works, awards, and cultural influence. Write in an engaging, encyclopedic style similar to Wikipedia. Include specific details about their rise to fame, breakthrough moments, and why they're significant in their field. Make it sound real and professional.",
  "before_fame": "A 100-150 word paragraph about their early life, childhood, education, family background, and what they did before becoming famous. Include realistic details about their upbringing and early interests.",
  "trivia": [
    "Interesting fact 1 about their life, hobbies, or unusual achievements",
    "Interesting fact 2 about their popularity, records, or fun incidents",
    "Interesting fact 3 about awards, recognition, or unique characteristics"
  ],
  "family_life": "A 100-150 word paragraph describing their parents, siblings, relationships, marital status, and children. Make it realistic and respectful. Include family background and personal relationships.",
  "associated_with": "A 100-150 word paragraph mentioning 3-4 other celebrities, directors, or industry figures they've collaborated with or are connected to. Explain the nature of these professional relationships and notable projects together."
}

IMPORTANT: 
- The "about" section MUST be at least 800 words (aim for 800-1000 words)
- All content must be original, realistic, and Google Ads-friendly
- Use proper grammar and engaging storytelling
- Make it sound like a real celebrity biography
- Return ONLY the JSON object, no other text`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
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
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Try to parse the JSON response
    let profileData;
    try {
      // Remove markdown code blocks if present
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      profileData = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse AI-generated profile");
    }

    // Validate the response has required fields
    if (!profileData.about || !profileData.before_fame || !profileData.trivia || 
        !profileData.family_life || !profileData.associated_with) {
      throw new Error("Generated profile is missing required fields");
    }

    // Check word count of about section (rough estimate)
    const wordCount = profileData.about.split(/\s+/).length;
    if (wordCount < 700) {
      console.warn(`About section only has ${wordCount} words, expected 800+`);
    }

    return new Response(
      JSON.stringify(profileData),
      { 
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (error) {
    console.error("Error generating profile:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error occurred" 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
