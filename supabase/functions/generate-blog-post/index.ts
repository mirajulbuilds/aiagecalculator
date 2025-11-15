import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Function to sanitize URLs in generated HTML
function sanitizeInternalLinks(html: string): string {
  if (!html) return html;
  
  // Pattern to match backend URLs (lovableproject.com or any staging URLs)
  const backendUrlPattern = /https?:\/\/[a-f0-9-]+\.lovableproject\.com(\/[^"'\s<>]*)/gi;
  
  // Replace backend URLs with public domain + path
  let sanitized = html.replace(backendUrlPattern, 'https://aiagecalc.com$1');
  
  return sanitized;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { topic, title, featured_image_idea, in_body_image_ideas, engine_choice } = await req.json();
    
    console.log("Generating blog post for topic:", topic, "using engine:", engine_choice);

    // Determine which AI engine to use
    const useGeminiDirect = engine_choice === "gemini";
    let apiKey: string;
    let apiEndpoint: string;
    let modelName: string;

    if (useGeminiDirect) {
      // Use direct Gemini API
      apiKey = Deno.env.get("GEMINI_API_KEY") || "";
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not configured. Please add it in project secrets.");
      }
      apiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`;
      modelName = "gemini-2.0-flash-exp";
    } else {
      // Use Lovable AI (default)
      apiKey = Deno.env.get("LOVABLE_API_KEY") || "";
      if (!apiKey) {
        throw new Error("LOVABLE_API_KEY is not configured");
      }
      apiEndpoint = "https://ai.gateway.lovable.dev/v1/chat/completions";
      modelName = "google/gemini-2.5-flash";
    }

    // Step 1: Generate blog article content with SEO
    const articlePrompt = `You are an expert content writer for AiAgeCalc.com, a website about age calculations, birthdays, zodiac signs, and celebrity ages.

Write a comprehensive, SEO-optimized blog article about: "${topic}"${title ? ` with the title "${title}"` : ''}

Requirements:
- Create engaging, informative content (800-1200 words)
- Use proper HTML formatting with <h2>, <h3>, <p>, <ul>, <ol>, <strong>, <em> tags
- Include 3-5 H2 headings with related subheadings
- Make it SEO-friendly with natural keyword integration
- Write in a friendly, conversational tone
- Include practical examples and actionable insights

CRITICAL - Link Formatting Rules:
- The site's public domain is https://aiagecalc.com
- For ALL internal links (pages on this site), use FULL absolute URLs with the domain
- Examples of CORRECT internal links:
  * <a href="https://aiagecalc.com/">home page</a>
  * <a href="https://aiagecalc.com/famous-birthdays">Famous Birthdays</a>
  * <a href="https://aiagecalc.com/blog">blog</a>
  * <a href="https://aiagecalc.com/zodiac">zodiac calculator</a>
  * <a href="https://aiagecalc.com/compatibility-calculator">Birthday Compatibility</a>
- NEVER use relative URLs (starting with just /)
- NEVER use lovableproject.com or any backend domains
- External links (to other websites) should use full https:// URLs with target="_blank" rel="noopener noreferrer"

Return ONLY a JSON object with this exact structure:
{
  "title": "Catchy article title (60 chars max)",
  "slug": "url-friendly-slug",
  "meta_title": "SEO meta title (60 chars max)",
  "meta_description": "SEO meta description (150-160 chars)",
  "main_content": "Full HTML article content"
}`;

    let articleResponse: Response;
    
    if (useGeminiDirect) {
      // Direct Gemini API call
      articleResponse = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are an expert SEO content writer. Always respond with valid JSON only.\n\n${articlePrompt}`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 8192,
          }
        }),
      });
    } else {
      // Lovable AI call
      articleResponse = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: modelName,
          messages: [
            { role: "system", content: "You are an expert SEO content writer. Always respond with valid JSON only." },
            { role: "user", content: articlePrompt }
          ],
        }),
      });
    }

    if (!articleResponse.ok) {
      const errorText = await articleResponse.text();
      console.error("Article generation error:", articleResponse.status, errorText);
      throw new Error(`Article generation failed: ${errorText}`);
    }

    const articleData = await articleResponse.json();
    let articleText: string;
    
    if (useGeminiDirect) {
      // Parse Gemini direct API response
      articleText = articleData.candidates?.[0]?.content?.parts?.[0]?.text || "";
    } else {
      // Parse Lovable AI response
      articleText = articleData.choices?.[0]?.message?.content || "";
    }
    
    if (!articleText) {
      throw new Error("No article content generated");
    }

    // Parse the JSON response
    let parsedArticle;
    try {
      // Remove markdown code blocks if present
      const cleanedText = articleText.replace(/```json\s*|\s*```/g, '').trim();
      parsedArticle = JSON.parse(cleanedText);
    } catch (e) {
      console.error("Failed to parse article JSON:", articleText);
      throw new Error("Invalid article format returned by AI");
    }

    console.log("Article generated successfully");

    // Step 2: Generate featured image if requested
    let generatedFeaturedImageUrl = null;
    if (featured_image_idea && featured_image_idea.trim()) {
      console.log("Generating featured image:", featured_image_idea);
      
      const imagePrompt = `Create a professional, vibrant featured image for a blog post about ${topic}. ${featured_image_idea}. High quality, visually appealing, suitable for a blog hero image.`;
      
      // Only Lovable AI supports image generation currently
      if (!useGeminiDirect) {
        const imageResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash-image-preview",
            messages: [
              { role: "user", content: imagePrompt }
            ],
            modalities: ["image", "text"]
          }),
        });

        if (imageResponse.ok) {
          const imageData = await imageResponse.json();
          const imageUrl = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
          if (imageUrl) {
            generatedFeaturedImageUrl = imageUrl;
            console.log("Featured image generated successfully");
          }
        } else {
          console.warn("Featured image generation failed, continuing without it");
        }
      } else {
        console.log("Image generation not supported with direct Gemini API, skipping featured image");
      }
    }

    // Step 3: Generate in-body images if requested (only with Lovable AI)
    const generatedBodyImagesData: Array<{url: string; placement: string; description: string}> = [];
    if (in_body_image_ideas && in_body_image_ideas.trim() && !useGeminiDirect) {
      const imageIdeas = in_body_image_ideas.split(',').map((idea: string) => idea.trim()).filter(Boolean);
      console.log("Generating", imageIdeas.length, "body images");

      for (let i = 0; i < Math.min(imageIdeas.length, 3); i++) {
        const idea = imageIdeas[i];
        
        try {
          const bodyImagePrompt = `Create a relevant, high-quality image for a blog post about ${topic}. ${idea}. Professional, clear, and visually engaging.`;
          
          const bodyImageResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "google/gemini-2.5-flash-image-preview",
              messages: [
                { role: "user", content: bodyImagePrompt }
              ],
              modalities: ["image", "text"]
            }),
          });

          if (bodyImageResponse.ok) {
            const bodyImageData = await bodyImageResponse.json();
            const bodyImageUrl = bodyImageData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
            
            if (bodyImageUrl) {
              // Suggest placement based on index
              const placements = ['after_h2_1', 'after_h2_2', 'after_h2_3'];
              generatedBodyImagesData.push({
                url: bodyImageUrl,
                placement: placements[i] || `after_h2_${i + 1}`,
                description: idea
              });
              console.log(`Body image ${i + 1} generated successfully`);
            }
          }
        } catch (error) {
          console.warn(`Failed to generate body image ${i + 1}:`, error);
        }
      }
    }

    return new Response(
      JSON.stringify({
        ...parsedArticle,
        main_content: sanitizeInternalLinks(parsedArticle.main_content),
        featured_image_url: generatedFeaturedImageUrl,
        body_images_data: generatedBodyImagesData
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in generate-blog-post function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        details: error instanceof Error ? error.stack : undefined
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
