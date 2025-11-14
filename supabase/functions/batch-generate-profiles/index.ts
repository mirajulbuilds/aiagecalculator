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

    // Create a readable stream for real-time progress updates
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        const results = [];
        let successCount = 0;
        let failedCount = 0;

        for (let i = 0; i < urls.length; i++) {
          const urlData = urls[i];
          const { url, sourceType } = urlData;
          
          try {
            // Send progress update: started
            const startMessage = JSON.stringify({
              type: "progress",
              index: i,
              total: urls.length,
              url,
              status: "processing",
              message: `Processing ${i + 1}/${urls.length}: ${url}`
            }) + "\n";
            controller.enqueue(encoder.encode(startMessage));

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

            successCount++;
            results.push({
              url,
              status: "success",
              profile: generateData
            });

            // Send progress update: success
            const successMessage = JSON.stringify({
              type: "progress",
              index: i,
              total: urls.length,
              url,
              status: "success",
              message: `✓ Successfully generated profile for: ${url}`,
              profile: generateData
            }) + "\n";
            controller.enqueue(encoder.encode(successMessage));

            console.log(`✓ Successfully generated profile for: ${url}`);

            // Small delay between requests
            await new Promise(resolve => setTimeout(resolve, 2000));

          } catch (error) {
            failedCount++;
            console.error(`✗ Failed to generate profile for ${url}:`, error);
            
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            results.push({
              url,
              status: "failed",
              error: errorMessage
            });

            // Send progress update: failed
            const failMessage = JSON.stringify({
              type: "progress",
              index: i,
              total: urls.length,
              url,
              status: "failed",
              message: `✗ Failed: ${errorMessage}`,
              error: errorMessage
            }) + "\n";
            controller.enqueue(encoder.encode(failMessage));
          }
        }

        // Send final summary
        const summaryMessage = JSON.stringify({
          type: "complete",
          success: true,
          total: urls.length,
          succeeded: successCount,
          failed: failedCount,
          results
        }) + "\n";
        controller.enqueue(encoder.encode(summaryMessage));

        console.log(`Batch complete: ${successCount} succeeded, ${failedCount} failed`);
        controller.close();
      }
    });

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive"
      }
    });

  } catch (error) {
    console.error("Error in batch-generate-profiles:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
