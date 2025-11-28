import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

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
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const baseUrl = 'https://aiagecalc.com';

    console.log('Fetching celebrities from database...');
    
    const { data: celebrities, error } = await supabase
      .from('celebrities')
      .select('profile_slug, updated_at')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    console.log(`Found ${celebrities?.length || 0} celebrity profiles`);

    let urlEntries = '';
    
    if (celebrities && celebrities.length > 0) {
      celebrities.forEach(celebrity => {
        const lastmod = celebrity.updated_at 
          ? new Date(celebrity.updated_at).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0];
        
        urlEntries += `
  <url>
    <loc>${baseUrl}/people/${celebrity.profile_slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
      });
    }

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urlEntries}
</urlset>`;

    console.log('Celebrity sitemap generated successfully');
    
    // Submit to Google Search Console in the background
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const sitemapUrl = `${baseUrl}/sitemap-celebrities.xml`;
    
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
    console.error('Error generating celebrity sitemap:', error);
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