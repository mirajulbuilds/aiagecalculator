import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Whitelist of allowed domains for scraping
const ALLOWED_DOMAINS = [
  'famousbirthdays.com',
  'www.famousbirthdays.com',
  'wikipedia.org',
  'en.wikipedia.org',
  'www.wikipedia.org'
];

// Validate URL to prevent SSRF attacks
function validateUrl(urlString: string): { valid: boolean; error?: string; url?: URL } {
  try {
    const url = new URL(urlString);
    
    // Only allow HTTP/HTTPS protocols
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return { valid: false, error: 'Only HTTP and HTTPS protocols are allowed' };
    }
    
    // Check if domain is whitelisted
    const hostname = url.hostname.toLowerCase();
    const isAllowed = ALLOWED_DOMAINS.some(domain => 
      hostname === domain || hostname.endsWith('.' + domain)
    );
    
    if (!isAllowed) {
      return { 
        valid: false, 
        error: `Domain not allowed. Supported sources: ${ALLOWED_DOMAINS.join(', ')}` 
      };
    }
    
    // Block internal/private IP addresses
    const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (ipv4Pattern.test(hostname)) {
      const parts = hostname.split('.').map(Number);
      
      // Check for localhost (127.0.0.0/8)
      if (parts[0] === 127) {
        return { valid: false, error: 'Access to localhost is not allowed' };
      }
      
      // Check for private networks
      if (
        parts[0] === 10 || // 10.0.0.0/8
        (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) || // 172.16.0.0/12
        (parts[0] === 192 && parts[1] === 168) // 192.168.0.0/16
      ) {
        return { valid: false, error: 'Access to private networks is not allowed' };
      }
    }
    
    // Block localhost variations
    if (hostname === 'localhost' || hostname.endsWith('.local')) {
      return { valid: false, error: 'Access to localhost is not allowed' };
    }
    
    return { valid: true, url };
  } catch (error) {
    return { valid: false, error: 'Invalid URL format' };
  }
}

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

// Helper function to extract data based on source type with source-aware image extraction
function extractDataFromHTML(html: string, sourceType: string, baseUrl: string) {
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

  // Source-aware image extraction
  let imageUrl = null;
  
  // Wikipedia-specific extraction
  if (sourceType === 'wikipedia') {
    console.log("Using Wikipedia-specific image extraction");
    const infoboxMatch = html.match(/<table[^>]*class=["'][^"']*infobox[^"']*["'][^>]*>([\s\S]*?)<\/table>/i);
    if (infoboxMatch) {
      const infoboxHtml = infoboxMatch[1];
      const imgRegex = /<img[^>]*src=["']([^"']+)["'][^>]*>/gi;
      const images = [];
      let match;
      
      while ((match = imgRegex.exec(infoboxHtml)) !== null) {
        const src = match[1];
        if (src.includes('upload.wikimedia.org') && !src.includes('icon') && !src.includes('logo') && !src.includes('Commons-logo')) {
          const widthMatch = match[0].match(/width=["']?(\d+)/i);
          const width = widthMatch ? parseInt(widthMatch[1]) : 0;
          images.push({ src, width });
        }
      }
      
      if (images.length > 0) {
        images.sort((a, b) => b.width - a.width);
        imageUrl = images[0].src;
        if (imageUrl.includes('/thumb/')) {
          imageUrl = imageUrl.replace(/\/thumb(\/.*?)\/\d+px-.*$/, '$1');
        }
        console.log("Found Wikipedia infobox image:", imageUrl);
      }
    }
  }
  
  // FamousBirthdays-specific extraction
  if (!imageUrl && sourceType === 'famousbirthdays') {
    console.log("Using FamousBirthdays-specific image extraction");
    
    // Method 1: Look for bio-photo or profile-image class
    let fbMatch = html.match(/<img[^>]*class=["'][^"']*(?:bio-photo|profile-image|main-photo|celebrity-photo)[^"']*["'][^>]*src=["']([^"']+)["'][^>]*>/i);
    if (!fbMatch) {
      // Method 2: Look for src attribute first, then check class
      fbMatch = html.match(/<img[^>]*src=["']([^"']+)["'][^>]*class=["'][^"']*(?:bio-photo|profile-image|main-photo|celebrity-photo)[^"']*["'][^>]*>/i);
    }
    
    if (fbMatch) {
      imageUrl = fbMatch[1];
      console.log("Found FamousBirthdays profile image (method 1/2):", imageUrl);
    } else {
      // Method 3: Look for images in specific containers
      const bioSectionMatch = html.match(/<div[^>]*class=["'][^"']*(?:bio-container|profile-header|celebrity-info)[^"']*["'][^>]*>([\s\S]*?)<\/div>/i);
      if (bioSectionMatch) {
        const bioHtml = bioSectionMatch[1];
        const imgRegex = /<img[^>]*src=["']([^"']+)["'][^>]*>/i;
        const imgMatch = bioHtml.match(imgRegex);
        
        if (imgMatch) {
          const src = imgMatch[1];
          // Skip tiny images and ads
          if (!src.includes('ads') && !src.includes('banner') && !src.includes('1x1')) {
            imageUrl = src;
            console.log("Found FamousBirthdays image in bio section:", imageUrl);
          }
        }
      }
    }
    
    // Method 4: Look for Open Graph image meta tag (often reliable for FamousBirthdays)
    if (!imageUrl) {
      const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["'][^>]*>/i);
      if (ogImageMatch) {
        imageUrl = ogImageMatch[1];
        console.log("Found FamousBirthdays OG image:", imageUrl);
      }
    }
    
    // Method 5: Look for images with specific size attributes (typically profile images are larger)
    if (!imageUrl) {
      const imgRegex = /<img[^>]*src=["']([^"']+)["'][^>]*>/gi;
      const images = [];
      let match;
      
      while ((match = imgRegex.exec(html)) !== null) {
        const fullImgTag = match[0];
        const src = match[1];
        
        // Skip common non-profile patterns
        if (src.includes('logo') || src.includes('icon') || src.includes('ads') || src.includes('banner')) {
          continue;
        }
        
        // Look for images with reasonable dimensions
        const widthMatch = fullImgTag.match(/width=["']?(\d+)/i);
        const heightMatch = fullImgTag.match(/height=["']?(\d+)/i);
        const width = widthMatch ? parseInt(widthMatch[1]) : 0;
        const height = heightMatch ? parseInt(heightMatch[1]) : 0;
        
        // FamousBirthdays profile images are typically 200x200 or larger
        if ((width >= 200 && height >= 200) || (width === 0 && height === 0)) {
          images.push({ src, width, height, size: width * height });
        }
      }
      
      if (images.length > 0) {
        // Prefer square images (typical for profile photos)
        const squareImages = images.filter(img => {
          const ratio = img.width > 0 && img.height > 0 ? img.width / img.height : 1;
          return ratio >= 0.8 && ratio <= 1.2;
        });
        
        const targetImages = squareImages.length > 0 ? squareImages : images;
        targetImages.sort((a, b) => b.size - a.size);
        imageUrl = targetImages[0].src;
        console.log("Found FamousBirthdays image by size:", imageUrl);
      }
    }
  }
  
  // Fallback: Improved generic extraction
  if (!imageUrl) {
    console.log("Using fallback image extraction");
    const imgRegex = /<img[^>]*src=["']([^"']+)["'][^>]*>/gi;
    const images = [];
    const skipPatterns = [/logo/i, /icon/i, /banner/i, /sprite/i, /1x1/];
    let match;
    
    while ((match = imgRegex.exec(html)) !== null) {
      const src = match[1];
      if (skipPatterns.some(pattern => pattern.test(src))) continue;
      
      const widthMatch = match[0].match(/width=["']?(\d+)/i);
      const width = widthMatch ? parseInt(widthMatch[1]) : 0;
      if (width > 0 && width < 100) continue;
      
      images.push({ src, width });
    }
    
    if (images.length > 0) {
      images.sort((a, b) => b.width - a.width);
      imageUrl = images[0].src;
    }
  }
  
  // Make absolute URL if relative
  if (imageUrl && imageUrl.startsWith('/')) {
    try {
      const urlObj = new URL(baseUrl);
      imageUrl = urlObj.origin + imageUrl;
    } catch (error) {
      console.error("Error constructing absolute URL:", error);
      imageUrl = null;
    }
  }
  
  // Ensure HTTPS for Wikimedia URLs
  if (imageUrl && imageUrl.includes('wikimedia.org') && imageUrl.startsWith('http://')) {
    imageUrl = imageUrl.replace('http://', 'https://');
  }

  console.log("Final extracted image URL:", imageUrl);

  return {
    name,
    rawText: textContent.substring(0, 5000),
    imageUrl,
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  let profileURL = "";
  let engine_choice = "lovable-ai";
  let celebrityName = "Unknown";

  try {
    const body = await req.json();
    profileURL = body.profileURL;
    engine_choice = body.engine_choice || "lovable-ai";
    const sourceType = body.sourceType;
    const manualImageBase64 = body.manualImageBase64;

    if (!profileURL) {
      return new Response(
        JSON.stringify({ error: "Profile URL is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate the URL before proceeding
    const validation = validateUrl(profileURL);
    if (!validation.valid) {
      console.error("URL validation failed:", validation.error);
      return new Response(
        JSON.stringify({ error: validation.error }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Scraping and generating profile for:", profileURL, "Source:", sourceType);

    // Step 1: Scrape the website
    const html = await scrapeWebsite(profileURL);
    const scrapedData = extractDataFromHTML(html, sourceType, profileURL);
    celebrityName = scrapedData.name;
    const rawText = scrapedData.rawText;
    const scrapedImageUrl = scrapedData.imageUrl;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

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
    console.log("Generating content with AI using scraped data, engine:", engine_choice || "lovable-ai");
    
    let contentResponse;
    
    // Conditional Logic: Choose between Lovable AI or Direct Gemini API
    if (engine_choice === "gemini-api") {
      // OPTION 2: Use Direct Gemini API with user's API key
      console.log("Using Direct Gemini API");
      const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
      
      if (!GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is not configured in secrets");
      }
      
      contentResponse = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=" + GEMINI_API_KEY,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [
                  {
                    text: `You are a professional celebrity biographer and journalist. I've scraped content about ${celebrityName} from ${profileURL}. Here's the raw text:

${rawText}

Please generate a comprehensive celebrity profile with the following structure (return ONLY valid JSON, no markdown):

{
  "main_content": "Minimum 250 words HTML-formatted biography with sections: <h2>About</h2>, <h2>Before Fame</h2>, <h2>Career Highlights</h2>, <h2>Trivia</h2> (with <ul> and <li>), <h2>Family Life</h2>",
  "name": "Celebrity's full name",
  "profession": "Specific profession (e.g., 'Academy Award-winning actress')",
  "date_of_birth": "YYYY-MM-DD format",
  "place_of_birth": "City, state/region, country",
  "zodiac_sign": "Zodiac sign",
  "popularity_ranks": {
    "most_popular": number between 1-10000,
    "age_rank": number between 1-10000,
    "name_rank": number between 1-10000
  },
  "meta_title": "SEO title max 60 chars with name and achievement",
  "meta_description": "CRITICAL: max 160 chars, compelling and informative",
  "profile_slug": "url-friendly-slug-lowercase-hyphenated",
  "known_for_data": [
    {"title": "Work title", "year": "Year", "imageURL": ""}
  ]
}

Return ONLY the JSON object, no other text.`
                  }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.8,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 8192,
            }
          }),
        }
      );
    } else {
      // OPTION 1: Use Lovable AI (Default)
      console.log("Using Lovable AI Gateway");
      contentResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
    }

    if (!contentResponse.ok) {
      const errorText = await contentResponse.text();
      console.error("Content generation failed:", errorText);
      throw new Error(`Content generation failed: ${contentResponse.status}`);
    }

    const contentData = await contentResponse.json();
    console.log("Content generated successfully");

    let generatedProfile;
    
    if (engine_choice === "gemini-api") {
      // Parse Gemini API response format
      const geminiText = contentData.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!geminiText) {
        throw new Error("No content in Gemini response");
      }
      
      // Remove markdown code blocks if present
      const cleanedText = geminiText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      generatedProfile = JSON.parse(cleanedText);
      console.log("Parsed Gemini API response");
    } else {
      // Parse Lovable AI response format
      const toolCall = contentData.choices?.[0]?.message?.tool_calls?.[0];
      if (!toolCall) {
        throw new Error("No tool call in response");
      }
      generatedProfile = JSON.parse(toolCall.function.arguments);
      console.log("Parsed Lovable AI response");
    }

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

    // Log usage to profile_generations table
    try {
      const { error: logError } = await supabase.from("profile_generations").insert({
        celebrity_name: generatedProfile.name,
        source_url: profileURL,
        engine_used: engine_choice === "gemini-api" ? "gemini-api" : "lovable-ai",
        generation_status: "success",
      });

      if (logError) {
        console.error("Failed to log generation:", logError);
      }
    } catch (logErr) {
      console.error("Error logging generation:", logErr);
    }

    return new Response(JSON.stringify(completeProfile), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in generate-celebrity-profile:", error);
    
    // Log failed generation
    try {
      const { error: logError } = await supabase.from("profile_generations").insert({
        celebrity_name: celebrityName.substring(0, 100),
        source_url: profileURL || "Unknown",
        engine_used: engine_choice === "gemini-api" ? "gemini-api" : "lovable-ai",
        generation_status: "failed",
        error_message: error instanceof Error ? error.message.substring(0, 500) : "Unknown error",
      });

      if (logError) {
        console.error("Failed to log error:", logError);
      }
    } catch (logErr) {
      console.error("Error logging failed generation:", logErr);
    }
    
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
