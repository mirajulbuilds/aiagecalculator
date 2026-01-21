import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    const results: { sitemap: string; success: boolean; error?: string }[] = [];
    
    // List of sitemap generation functions to call
    const sitemapFunctions = [
      'generate-sitemap-celebrities',
      'generate-sitemap-blog',
      'generate-sitemap-categories',
      'generate-sitemap-static',
      'generate-sitemap-index',
    ];
    
    console.log('Starting regeneration of all sitemaps...');
    
    // Call each sitemap generation function
    for (const funcName of sitemapFunctions) {
      try {
        console.log(`Regenerating ${funcName}...`);
        
        const response = await fetch(`${supabaseUrl}/functions/v1/${funcName}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseAnonKey}`,
          },
          body: JSON.stringify({}),
        });
        
        if (response.ok) {
          results.push({ sitemap: funcName, success: true });
          console.log(`Successfully regenerated ${funcName}`);
        } else {
          const errorText = await response.text();
          results.push({ sitemap: funcName, success: false, error: errorText });
          console.error(`Failed to regenerate ${funcName}: ${errorText}`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        results.push({ sitemap: funcName, success: false, error: errorMessage });
        console.error(`Error regenerating ${funcName}:`, error);
      }
    }
    
    const successCount = results.filter(r => r.success).length;
    const failCount = results.length - successCount;
    
    console.log(`Sitemap regeneration complete: ${successCount} succeeded, ${failCount} failed`);
    
    return new Response(
      JSON.stringify({
        success: failCount === 0,
        message: `Regenerated ${successCount}/${results.length} sitemaps`,
        results,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in regenerate-all-sitemaps:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
