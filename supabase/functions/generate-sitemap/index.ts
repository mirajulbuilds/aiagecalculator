import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/xml',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all celebrities from the database
    const { data: celebrities, error } = await supabase
      .from('celebrities')
      .select('profile_slug, updated_at')
      .order('profile_slug');

    if (error) {
      console.error('Error fetching celebrities:', error);
      throw error;
    }

    const baseUrl = Deno.env.get('SITE_BASE_URL') || 'https://aiagecalc.com';
    const currentDate = new Date().toISOString().split('T')[0];

    // Static pages with their priorities and change frequencies
    const staticPages = [
      { loc: `${baseUrl}/`, priority: '1.0', changefreq: 'weekly', lastmod: currentDate },
      { loc: `${baseUrl}/famous-birthdays`, priority: '0.9', changefreq: 'daily', lastmod: currentDate },
      { loc: `${baseUrl}/explore-famous-birthdays`, priority: '0.9', changefreq: 'weekly', lastmod: currentDate },
      { loc: `${baseUrl}/blog`, priority: '0.8', changefreq: 'weekly', lastmod: currentDate },
      { loc: `${baseUrl}/blog/unique-birthday-traditions-around-world`, priority: '0.7', changefreq: 'monthly', lastmod: '2025-01-15' },
      { loc: `${baseUrl}/blog/zodiac-personality-beyond-horoscope`, priority: '0.7', changefreq: 'monthly', lastmod: '2025-01-10' },
      { loc: `${baseUrl}/blog/science-of-age-on-mars`, priority: '0.7', changefreq: 'monthly', lastmod: '2025-01-05' },
      { loc: `${baseUrl}/about`, priority: '0.6', changefreq: 'monthly', lastmod: currentDate },
      { loc: `${baseUrl}/privacy-policy`, priority: '0.5', changefreq: 'monthly', lastmod: currentDate },
      { loc: `${baseUrl}/search`, priority: '0.7', changefreq: 'weekly', lastmod: currentDate },
      { loc: `${baseUrl}/ai-face-age`, priority: '0.8', changefreq: 'monthly', lastmod: currentDate },
      { loc: `${baseUrl}/look-alike-finder`, priority: '0.8', changefreq: 'monthly', lastmod: currentDate },
      { loc: `${baseUrl}/due-date-calculator`, priority: '0.7', changefreq: 'monthly', lastmod: currentDate },
      { loc: `${baseUrl}/compatibility-calculator`, priority: '0.7', changefreq: 'monthly', lastmod: currentDate },
      { loc: `${baseUrl}/past-life-generator`, priority: '0.7', changefreq: 'monthly', lastmod: currentDate },
      { loc: `${baseUrl}/life-expectancy-calculator`, priority: '0.7', changefreq: 'monthly', lastmod: currentDate },
      { loc: `${baseUrl}/retirement-calculator`, priority: '0.7', changefreq: 'monthly', lastmod: currentDate },
      { loc: `${baseUrl}/health-score-calculator`, priority: '0.7', changefreq: 'monthly', lastmod: currentDate },
      { loc: `${baseUrl}/compare`, priority: '0.7', changefreq: 'monthly', lastmod: currentDate },
      { loc: `${baseUrl}/compare-life-expectancy`, priority: '0.7', changefreq: 'monthly', lastmod: currentDate },
      { loc: `${baseUrl}/pet-age-calculator`, priority: '0.7', changefreq: 'monthly', lastmod: currentDate },
    ];

    // Zodiac sign pages
    const zodiacSigns = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'];
    const zodiacPages = zodiacSigns.map(sign => ({
      loc: `${baseUrl}/zodiac/${sign}`,
      priority: '0.7',
      changefreq: 'weekly',
      lastmod: currentDate
    }));

    // Birth month pages
    const months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
    const monthPages = months.map(month => ({
      loc: `${baseUrl}/birth-month/${month}`,
      priority: '0.7',
      changefreq: 'weekly',
      lastmod: currentDate
    }));

    // Profession pages (sample - add more as needed)
    const professions = ['actor', 'actress', 'musician', 'athlete', 'politician', 'entrepreneur', 'director', 'producer'];
    const professionPages = professions.map(profession => ({
      loc: `${baseUrl}/profession/${profession}`,
      priority: '0.7',
      changefreq: 'weekly',
      lastmod: currentDate
    }));

    // Celebrity profile pages
    const celebrityPages = celebrities?.map(celebrity => ({
      loc: `${baseUrl}/people/${celebrity.profile_slug}`,
      priority: '0.8',
      changefreq: 'monthly',
      lastmod: celebrity.updated_at ? new Date(celebrity.updated_at).toISOString().split('T')[0] : currentDate
    })) || [];

    // Combine all pages
    const allPages = [...staticPages, ...zodiacPages, ...monthPages, ...professionPages, ...celebrityPages];

    // Generate XML sitemap
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(page => `  <url>
    <loc>${page.loc}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    return new Response(sitemap, {
      headers: corsHeaders,
      status: 200,
    });

  } catch (error) {
    console.error('Error generating sitemap:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
