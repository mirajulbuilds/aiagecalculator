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
    const currentDate = new Date().toISOString().split('T')[0];

    const zodiacSigns = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 
                         'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'];
    
    const birthMonths = ['january', 'february', 'march', 'april', 'may', 'june',
                         'july', 'august', 'september', 'october', 'november', 'december'];
    
    const professions = ['actor', 'musician', 'athlete', 'influencer'];

    let urlEntries = '';
    
    // Add zodiac pages
    zodiacSigns.forEach(sign => {
      urlEntries += `
  <url>
    <loc>${baseUrl}/zodiac/${sign}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
    });

    // Add birth month pages
    birthMonths.forEach(month => {
      urlEntries += `
  <url>
    <loc>${baseUrl}/birth-month/${month}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;
    });

    // Add profession pages
    professions.forEach(profession => {
      urlEntries += `
  <url>
    <loc>${baseUrl}/profession/${profession}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`;
    });

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urlEntries}
</urlset>`;

    console.log('Categories sitemap generated successfully');
    
    return new Response(sitemap, {
      headers: corsHeaders,
      status: 200,
    });

  } catch (error) {
    console.error('Error generating categories sitemap:', error);
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