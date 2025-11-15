import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

    const blogPosts = [
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

    let urlEntries = '';
    
    blogPosts.forEach(post => {
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