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

    // Step 1: Generate profile text
    const textPrompt = `You are a professional celebrity biographer. Create a realistic, engaging, and ad-safe celebrity profile for a person with these details:

Name: ${name}
Profession: ${profession}
Birth Date: ${birthdate}
Birth Place: ${birthplace}
Country: ${country}

Generate ONLY valid JSON with this EXACT structure (no markdown, no code blocks, just pure JSON):

{
  "about": "A comprehensive biography covering their career journey, major achievements, impact on their industry, notable works, awards, and cultural influence. Write in an engaging, encyclopedic style similar to FamousBirthdays.com. Include specific details about their rise to fame, breakthrough moments, collaborations, career evolution, controversies (if any), philanthropic work, and why they're significant in their field. Make it sound real and professional with concrete examples and chronological flow. THIS SECTION MUST BE MINIMUM 500 WORDS, ideally 600-800 words - count carefully.",
  "before_fame": "A detailed 100-150 word paragraph about their early life, childhood environment, education, family background, early struggles, and what they did before becoming famous. Include realistic details about their upbringing, early interests, and formative experiences that shaped their career.",
  "trivia": [
    "Interesting fact 1 about their life, hobbies, unusual achievements, or lesser-known talents",
    "Interesting fact 2 about their popularity metrics, records broken, or memorable public incidents",
    "Interesting fact 3 about awards, special recognition, unique characteristics, or surprising connections",
    "Interesting fact 4 about personal interests or unique traits",
    "Interesting fact 5 about cultural impact or legacy"
  ],
  "family_life": "A detailed 100-150 word paragraph describing their parents (names and occupations if relevant), siblings, romantic relationships, marital status, children, and family dynamics. Make it realistic and respectful. Include how family influenced their career and any notable family members.",
  "associated_with": "A detailed 100-150 word paragraph mentioning 3-4 other celebrities, directors, producers, or industry figures they've collaborated with or are connected to. Explain the nature of these professional relationships, specific projects they worked on together, and the impact of these collaborations on their career."
}

CRITICAL REQUIREMENTS: 
- The "about" section MUST be MINIMUM 500 words, ideally 600-800 words. Write multiple detailed paragraphs.
- Break the about section into 3-4 substantial paragraphs covering: early career, breakthrough, peak success, legacy
- Include exactly 5 trivia facts
- All content must be original, realistic, and Google Ads-friendly (no controversial content)
- Use proper grammar, varied sentence structure, and engaging storytelling
- Make it sound like a real FamousBirthdays.com biography with specific examples
- Return ONLY the JSON object, no markdown formatting, no code blocks`;

    const textResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
            content: textPrompt
          }
        ],
        temperature: 0.8,
      }),
    });

    if (!textResponse.ok) {
      if (textResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (textResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await textResponse.text();
      console.error("AI Gateway error:", textResponse.status, errorText);
      throw new Error(`AI Gateway error: ${textResponse.status}`);
    }

    const textData = await textResponse.json();
    const content = textData.choices[0].message.content;
    
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

    // Check word count of about section and REJECT if too short
    const wordCount = profileData.about.split(/\s+/).filter((w: string) => w.length > 0).length;
    console.log(`Generated about section has ${wordCount} words`);
    
    if (wordCount < 500) {
      console.error(`About section only has ${wordCount} words, expected minimum 500`);
      throw new Error(`Generated profile is too short (${wordCount} words). The about section must be at least 500 words. Please try again.`);
    }
    
    if (wordCount > 1000) {
      console.warn(`About section is quite long: ${wordCount} words (recommended 500-800)`);
    }

    // Step 2: Generate profile image using Gemini 2.5 Flash Image
    console.log(`Generating image for ${name}...`);
    const imagePrompt = `Generate a high-quality, professional portrait photograph of ${name}, a ${profession} from ${country}. The image should be a realistic, professional headshot suitable for a celebrity biography page. The person should be well-lit, looking confident and professional, against a neutral or slightly blurred background. Style: professional photography, high resolution, portrait orientation.`;

    const imageResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [
          {
            role: "user",
            content: imagePrompt
          }
        ],
        modalities: ["image", "text"]
      }),
    });

    let imageBase64 = null;
    if (imageResponse.ok) {
      const imageData = await imageResponse.json();
      const images = imageData.choices?.[0]?.message?.images;
      if (images && images.length > 0) {
        imageBase64 = images[0].image_url.url;
        console.log(`Successfully generated image for ${name}`);
      } else {
        console.warn(`No image generated for ${name}, will use fallback`);
      }
    } else {
      console.warn(`Image generation failed with status ${imageResponse.status}, continuing with text-only profile`);
    }

    return new Response(
      JSON.stringify({
        ...profileData,
        image: imageBase64,
        image_generated: !!imageBase64
      }),
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
