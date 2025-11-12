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
    const { birthDate } = await req.json();

    if (!birthDate) {
      return new Response(
        JSON.stringify({ error: "Birth date is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
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
    const prompt = `You are a creative historian and storyteller with expertise in past lives and reincarnation. Based on the user's Zodiac Sign (${zodiacSign}) and Life Path Number (${lifePathNumber}), generate a short, fun, and engaging 'Past Life' story (approximately 100-150 words).

Guidelines:
- Make it positive, intriguing, and shareable
- Start with an engaging hook that captures attention
- Include specific details about who they were (profession, era, location)
- Connect their past life to their current zodiac traits and life path
- End with an uplifting message about how that past life influences them today
- Keep the tone mystical yet fun and believable
- Use vivid, sensory language

Write the story in second person ("You were...") to make it personal and immersive.`;

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
            content: "You are a creative storyteller specializing in past life narratives. You create engaging, positive, and mystical stories that connect astrological and numerological insights to historical characters and eras.",
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
