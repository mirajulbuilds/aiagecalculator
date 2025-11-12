import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper function to scrape website content
async function scrapeWebsite(url: string) {
  console.log("Scraping URL:", url);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch URL: ${response.status}`);
  }
  const html = await response.text();
  return html;
}

// Helper function to extract data based on source type
function extractDataFromHTML(html: string, sourceType: string) {
  console.log("Extracting data for source type:", sourceType);
  
  // Simple text extraction - remove HTML tags
  const textContent = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Extract celebrity name from title or first heading
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
  const name = titleMatch?.[1]?.split('|')[0]?.trim() || h1Match?.[1]?.trim() || "Unknown";

  // Try to extract image URL
  let imageUrl = null;
  const imgMatch = html.match(/<img[^>]*src=["']([^"']+)["'][^>]*>/i);
  if (imgMatch?.[1]) {
    imageUrl = imgMatch[1];
    // Make absolute URL if relative
    if (imageUrl.startsWith('/')) {
      const urlObj = new URL(html.match(/<base[^>]*href=["']([^"']+)["']/i)?.[1] || sourceType);
      imageUrl = urlObj.origin + imageUrl;
    }
  }

  return {
    name,
    rawText: textContent.substring(0, 5000), // Limit to 5000 chars
    imageUrl,
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { profileURL, sourceType, manualImageBase64 } = await req.json();

    if (!profileURL) {
      return new Response(
        JSON.stringify({ error: "Profile URL is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Scraping and generating profile for:", profileURL, "Source:", sourceType);

    // Step 1: Scrape the website
    const html = await scrapeWebsite(profileURL);
    const { name: celebrityName, rawText, imageUrl: scrapedImageUrl } = extractDataFromHTML(html, sourceType);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let profileImageUrl = null;

    // Step 2: Handle images with 2-tier logic
    // TIER 1: Manual Image Upload (highest priority)
    if (manualImageBase64) {
      console.log("TIER 1: Using manual image provided by user");
      try {
        const base64Data = manualImageBase64.split(",")[1] || manualImageBase64;
        const imageBuffer = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));
        const fileName = `${profileURL.replace(/[^a-z0-9]/gi, '-')}-manual-${Date.now()}.png`;

        const { error: uploadError } = await supabase.storage
          .from("celebrity-profiles")
          .upload(fileName, imageBuffer, {
            contentType: "image/png",
          });

        if (uploadError) {
          console.error("Manual image upload failed:", uploadError);
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from("celebrity-profiles")
            .getPublicUrl(fileName);
          profileImageUrl = publicUrl;
          console.log("Manual image uploaded successfully:", profileImageUrl);
        }
      } catch (error) {
        console.error("Manual image processing error:", error);
      }
    }

    // TIER 2: Try to download and upload scraped image
    if (!profileImageUrl && scrapedImageUrl) {
      console.log("TIER 2: Downloading image from scraped URL:", scrapedImageUrl);
      try {
        const imageResponse = await fetch(scrapedImageUrl);
        if (imageResponse.ok) {
          const imageBuffer = new Uint8Array(await imageResponse.arrayBuffer());
          const contentType = imageResponse.headers.get("content-type") || "image/jpeg";
          const ext = contentType.split("/")[1] || "jpg";
          const fileName = `${profileURL.replace(/[^a-z0-9]/gi, '-')}-scraped-${Date.now()}.${ext}`;

          const { error: uploadError } = await supabase.storage
            .from("celebrity-profiles")
            .upload(fileName, imageBuffer, {
              contentType,
            });

          if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage
              .from("celebrity-profiles")
              .getPublicUrl(fileName);
            profileImageUrl = publicUrl;
            console.log("Scraped image uploaded successfully:", profileImageUrl);
          }
        }
      } catch (error) {
        console.error("Failed to download/upload scraped image:", error);
      }
    }

    // If no image found, profileImageUrl remains null (no fake images)

    // Step 3: Use AI to rewrite and generate structured content
    console.log("Generating content with AI using scraped data");
    const contentResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
            content: `You are a professional celebrity biographer and journalist. Write in an engaging, human-like style that reads like a well-researched magazine article or biography book. Use storytelling techniques, vivid descriptions, and maintain a professional yet personable tone. Format content with proper HTML tags: <h2> for section headings, <p> for paragraphs, <ul> and <li> for lists, <strong> for emphasis, and <em> for subtle emphasis.`,
          },
          {
            role: "user",
            content: `I've scraped content about ${celebrityName} from ${profileURL}. Here's the raw text:

${rawText}

Please rewrite this information into a comprehensive, engaging profile. Write in a compelling, journalistic style - NOT a dry list of facts. The biography should flow naturally and tell the story of this person's life and career.

Required content:
1. A rich, detailed 250+ word biography (minimum 250 words, aim for 500+) with these sections:
   - <h2>About</h2>: Opening overview and current status
   - <h2>Before Fame</h2>: Early life, childhood, education
   - <h2>Career Highlights</h2>: Major achievements and notable works
   - <h2>Trivia</h2>: Interesting facts and lesser-known details (use <ul> and <li> tags)
   - <h2>Family Life</h2>: Personal relationships and family background
   
2. Their profession/occupation (be specific, e.g., "Academy Award-winning actress" not just "actress")
3. Date of birth (YYYY-MM-DD format)
4. Place of birth (city, state/region, country)
5. Zodiac sign
6. Popularity rankings (generate realistic numbers between 1-10000)
7. SEO-optimized meta title (max 60 chars, include name and key achievement)
8. SEO-optimized meta description (CRITICAL: max 160 chars, compelling and informative)
9. URL-friendly slug (lowercase, hyphenated)
10. "Known For" data: Extract the most famous works, movies, TV shows, or achievements (3-6 items) as a JSON array with:
    - "title": The name of the work/achievement
    - "year": The year (if available)
    - "imageURL": Leave empty string "" (we'll add images later)
    Example: [{"title": "Titanic", "year": "1997", "imageURL": ""}, {"title": "Inception", "year": "2010", "imageURL": ""}]

Make the writing feel human, warm, and professionally crafted.`,
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
                    description: "Minimum 250 words HTML-formatted biography written in engaging, human-like journalistic style with <h2> section headings for: About, Before Fame, Career Highlights, Trivia (with <ul> and <li>), and Family Life",
                  },
                  name: {
                    type: "string",
                    description: "Celebrity's full name",
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
                  meta_description: { 
                    type: "string",
                    description: "CRITICAL: Must be 160 characters or less for SEO"
                  },
                  profile_slug: { type: "string" },
                  known_for_data: {
                    type: "array",
                    description: "Array of famous works/achievements with title, year, and imageURL",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        year: { type: "string" },
                        imageURL: { type: "string" }
                      }
                    }
                  },
                },
                required: [
                  "main_content",
                  "name",
                  "profession",
                  "date_of_birth",
                  "place_of_birth",
                  "zodiac_sign",
                  "popularity_ranks",
                  "meta_title",
                  "meta_description",
                  "profile_slug",
                  "known_for_data",
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

    // Ensure meta_description is 160 chars or less
    if (generatedProfile.meta_description && generatedProfile.meta_description.length > 160) {
      generatedProfile.meta_description = generatedProfile.meta_description.substring(0, 157) + "...";
    }

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
