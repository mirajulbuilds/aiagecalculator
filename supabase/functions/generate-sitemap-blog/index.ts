import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/xml',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const baseUrl = 'https://aiagecalc.com';

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch published blog posts from database
    const { data: dbPosts, error } = await supabase
      .from('blog_posts')
      .select('slug, updated_at, published_at')
      .not('published_at', 'is', null)
      .order('published_at', { ascending: false });

    if (error) {
      console.error('Error fetching blog posts:', error);
    }

    // Static blog posts
    const staticPosts = [
      {
        slug: 'unique-birthday-traditions-around-world',
        lastmod: '2025-01-15',
        priority: '0.7'
      },
      {
        slug: 'zodiac-personality-beyond-horoscope',
        lastmod: '2025-01-10',
        priority: '0.7'
      },
      {
        slug: 'science-of-age-on-mars',
        lastmod: '2025-01-05',
        priority: '0.7'
      }
    ];

    // Map database posts to sitemap format
    const dbPostsFormatted = (dbPosts || []).map(post => ({
      slug: post.slug,
      lastmod: post.updated_at?.split('T')[0] || post.published_at?.split('T')[0] || new Date().toISOString().split('T')[0],
      priority: '0.7'
    }));

    // Combine all posts
    const allPosts = [...dbPostsFormatted, ...staticPosts];

    let urlEntries = '';
    
    allPosts.forEach(post => {
      urlEntries += `
  <url>
    <loc>${baseUrl}/blog/${post.slug}</loc>
    <lastmod>${post.lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${post.priority}</priority>
  </url>`;
    });

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urlEntries}
</urlset>`;

    console.log('Blog sitemap generated successfully');
    
    return new Response(sitemap, {
      headers: corsHeaders,
      status: 200,
    });

  } catch (error) {
    console.error('Error generating blog sitemap:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});