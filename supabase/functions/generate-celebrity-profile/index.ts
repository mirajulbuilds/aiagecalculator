import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { celebrityName, optionalHint, manualImageBase64 } = await req.json();

    if (!celebrityName) {
      return new Response(
        JSON.stringify({ error: "Celebrity name is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Generating profile for:", celebrityName);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let profileImageUrl = "";

    // TIER 1: Manual Image
    if (manualImageBase64) {
      console.log("Using manual image provided by user");
      profileImageUrl = manualImageBase64; // Will be handled by client upload
    } else {
      // TIER 2 & 3: AI Find or Generate
      console.log("Generating AI image for celebrity");
      try {
        const imageResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash-image-preview",
            messages: [
              {
                role: "user",
                content: `Generate a professional, high-quality portrait photograph of ${celebrityName}. The image should be realistic, well-lit, and suitable for a celebrity profile page. ${optionalHint || ""}`,
              },
            ],
            modalities: ["image", "text"],
          }),
        });

        if (!imageResponse.ok) {
          throw new Error(`Image generation failed: ${imageResponse.status}`);
        }

        const imageData = await imageResponse.json();
        const generatedImageBase64 = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

        if (generatedImageBase64) {
          // Upload to Supabase Storage
          const base64Data = generatedImageBase64.split(",")[1];
          const imageBuffer = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));
          const fileName = `${celebrityName.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}.png`;

          const { data: uploadData, error: uploadError } = await supabase.storage
            .from("celebrity-profiles")
            .upload(fileName, imageBuffer, {
              contentType: "image/png",
            });

          if (uploadError) {
            console.error("Failed to upload image:", uploadError);
            profileImageUrl = "https://via.placeholder.com/400x400?text=Celebrity+Photo";
          } else {
            const { data: { publicUrl } } = supabase.storage
              .from("celebrity-profiles")
              .getPublicUrl(fileName);
            profileImageUrl = publicUrl;
          }
        } else {
          profileImageUrl = "https://via.placeholder.com/400x400?text=Celebrity+Photo";
        }
      } catch (error) {
        console.error("Image generation error:", error);
        profileImageUrl = "https://via.placeholder.com/400x400?text=Celebrity+Photo";
      }
    }

    // Generate all content using AI with structured output
    console.log("Generating content with AI");
    const contentResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a celebrity biography writer. Generate comprehensive, accurate, and engaging content about celebrities. Format the main content with proper HTML tags including <h2> for section headings, <p> for paragraphs, <ul> and <li> for lists, and <strong> for emphasis.`,
          },
          {
            role: "user",
            content: `Generate a complete profile for ${celebrityName}. ${optionalHint ? `Additional context: ${optionalHint}` : ""}
            
Include:
1. A comprehensive 500+ word biography with sections: About, Before Fame, Career Highlights, Trivia, and Family Life (use <h2> tags for headings)
2. Their profession/occupation
3. Date of birth (YYYY-MM-DD format)
4. Place of birth
5. Zodiac sign
6. Popularity rankings (generate realistic numbers)
7. SEO-optimized meta title (max 60 chars)
8. SEO-optimized meta description (max 160 chars)
9. URL-friendly slug`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_celebrity_profile",
              description: "Generate complete celebrity profile data",
              parameters: {
                type: "object",
                properties: {
                  main_content: {
                    type: "string",
                    description: "500+ word HTML-formatted biography with <h2> section headings",
                  },
                  profession: { type: "string" },
                  date_of_birth: {
                    type: "string",
                    description: "Date in YYYY-MM-DD format",
                  },
                  place_of_birth: { type: "string" },
                  zodiac_sign: { type: "string" },
                  popularity_ranks: {
                    type: "object",
                    properties: {
                      most_popular: { type: "number" },
                      age_rank: { type: "number" },
                      name_rank: { type: "number" },
                    },
                  },
                  meta_title: { type: "string" },
                  meta_description: { type: "string" },
                  profile_slug: { type: "string" },
                },
                required: [
                  "main_content",
                  "profession",
                  "date_of_birth",
                  "place_of_birth",
                  "zodiac_sign",
                  "popularity_ranks",
                  "meta_title",
                  "meta_description",
                  "profile_slug",
                ],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: {
          type: "function",
          function: { name: "generate_celebrity_profile" },
        },
      }),
    });

    if (!contentResponse.ok) {
      const errorText = await contentResponse.text();
      console.error("Content generation failed:", errorText);
      throw new Error(`Content generation failed: ${contentResponse.status}`);
    }

    const contentData = await contentResponse.json();
    console.log("Content generated successfully");

    const toolCall = contentData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error("No tool call in response");
    }

    const generatedProfile = JSON.parse(toolCall.function.arguments);

    // Return complete profile data
    const completeProfile = {
      profile_image_url: profileImageUrl,
      ...generatedProfile,
    };

    console.log("Profile generation complete:", completeProfile.profile_slug);

    return new Response(JSON.stringify(completeProfile), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in generate-celebrity-profile:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
