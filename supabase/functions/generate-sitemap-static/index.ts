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
    const baseUrl = Deno.env.get('SITE_BASE_URL') || 'https://aiagecalc.com';
    const currentDate = new Date().toISOString().split('T')[0];

    // Note: /search is excluded as it's a utility page that should not be indexed
    const staticPages = [
      { url: '/', priority: '1.0', changefreq: 'daily' },
      { url: '/about', priority: '0.8', changefreq: 'monthly' },
      { url: '/blog', priority: '0.8', changefreq: 'weekly' },
      { url: '/privacy-policy', priority: '0.3', changefreq: 'yearly' },
      { url: '/ai-face-age', priority: '0.9', changefreq: 'weekly' },
      { url: '/look-alike-finder', priority: '0.9', changefreq: 'weekly' },
      { url: '/due-date-calculator', priority: '0.8', changefreq: 'weekly' },
      { url: '/compatibility-calculator', priority: '0.8', changefreq: 'weekly' },
      { url: '/life-expectancy-calculator', priority: '0.8', changefreq: 'weekly' },
      { url: '/retirement-calculator', priority: '0.8', changefreq: 'weekly' },
      { url: '/health-score-calculator', priority: '0.8', changefreq: 'weekly' },
      { url: '/pet-age-calculator', priority: '0.8', changefreq: 'weekly' },
      { url: '/past-life-generator', priority: '0.8', changefreq: 'weekly' },
      { url: '/famous-birthdays', priority: '0.9', changefreq: 'daily' },
    ];

    let urlEntries = '';
    
    staticPages.forEach(page => {
      urlEntries += `
  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
    });

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urlEntries}
</urlset>`;

    console.log('Static sitemap generated successfully');
    
    // Submit to Google Search Console in the background
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const sitemapUrl = `${baseUrl}/sitemap-static.xml`;
    
    if (supabaseUrl && supabaseAnonKey) {
      fetch(`${supabaseUrl}/functions/v1/submit-sitemap-to-gsc`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({ sitemapUrls: [sitemapUrl] }),
      }).catch(err => console.error('Failed to submit sitemap to GSC:', err));
    }
    
    return new Response(sitemap, {
      headers: corsHeaders,
      status: 200,
    });

  } catch (error) {
    console.error('Error generating static sitemap:', error);
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