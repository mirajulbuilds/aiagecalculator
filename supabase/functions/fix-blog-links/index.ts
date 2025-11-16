import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Function to sanitize URLs in HTML
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
    // Verify admin authorization
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: isAdmin, error: adminError } = await supabaseClient.rpc("is_admin");
    
    if (adminError || !isAdmin) {
      console.error("Admin check failed:", adminError);
      return new Response(
        JSON.stringify({ error: "Unauthorized: Admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Starting blog links fix...");

    // Fetch all blog posts
    const { data: posts, error: fetchError } = await supabase
      .from('blog_posts')
      .select('id, slug, main_content');

    if (fetchError) {
      throw new Error(`Failed to fetch posts: ${fetchError.message}`);
    }

    if (!posts || posts.length === 0) {
      return new Response(
        JSON.stringify({ 
          message: 'No blog posts found',
          fixed: 0
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log(`Found ${posts.length} blog posts to check`);

    let fixedCount = 0;
    const fixedPosts: string[] = [];

    // Process each post
    for (const post of posts) {
      const originalContent = post.main_content;
      const sanitizedContent = sanitizeInternalLinks(originalContent);

      // Only update if content changed
      if (originalContent !== sanitizedContent) {
        const { error: updateError } = await supabase
          .from('blog_posts')
          .update({ main_content: sanitizedContent })
          .eq('id', post.id);

        if (updateError) {
          console.error(`Error updating post ${post.slug}:`, updateError);
        } else {
          fixedCount++;
          fixedPosts.push(post.slug);
          console.log(`Fixed links in: ${post.slug}`);
        }
      }
    }

    console.log(`Fixed ${fixedCount} blog posts`);

    return new Response(
      JSON.stringify({ 
        message: `Successfully fixed ${fixedCount} blog post${fixedCount !== 1 ? 's' : ''}`,
        fixed: fixedCount,
        posts: fixedPosts,
        total: posts.length
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in fix-blog-links function:', error);
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
