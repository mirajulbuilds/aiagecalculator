import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { urls, engineChoice } = await req.json();

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return new Response(
        JSON.stringify({ error: "URLs array is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`Starting batch generation for ${urls.length} profiles with engine: ${engineChoice || 'lovable-ai'}`);

    const results = [];

    for (const urlData of urls) {
      const { url, sourceType } = urlData;
      
      try {
        console.log(`Processing: ${url}`);

        // Call the generate-celebrity-profile function
        const { data: generateData, error: generateError } = await supabase.functions.invoke(
          "generate-celebrity-profile",
          {
            body: {
              profileURL: url,
              sourceType: sourceType || "famousbirthdays",
              engine_choice: engineChoice || "lovable-ai"
            }
          }
        );

        if (generateError) {
          throw generateError;
        }

        results.push({
          url,
          status: "success",
          profile: generateData
        });

        console.log(`✓ Successfully generated profile for: ${url}`);

        // Small delay between requests to avoid overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (error) {
        console.error(`✗ Failed to generate profile for ${url}:`, error);
        results.push({
          url,
          status: "failed",
          error: error instanceof Error ? error.message : "Unknown error"
        });
      }
    }

    const successCount = results.filter(r => r.status === "success").length;
    const failedCount = results.filter(r => r.status === "failed").length;

    console.log(`Batch complete: ${successCount} succeeded, ${failedCount} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        total: urls.length,
        succeeded: successCount,
        failed: failedCount,
        results
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in batch-generate-profiles:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
