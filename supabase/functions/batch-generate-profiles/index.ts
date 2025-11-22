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

    const { urls, engineChoice } = await req.json();

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return new Response(
        JSON.stringify({ error: "URLs array is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

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

            // CRITICAL FIX: Save generated profile to the database
            console.log(`Saving profile to database: ${generateData.name}`);
            const { data: savedProfile, error: saveError } = await supabase
              .from("celebrities")
              .upsert({
                name: generateData.name,
                profile_slug: generateData.profile_slug,
                date_of_birth: generateData.date_of_birth,
                profession: generateData.profession,
                place_of_birth: generateData.place_of_birth || null,
                zodiac_sign: generateData.zodiac_sign || null,
                profile_image_url: generateData.profile_image_url,
                main_content: generateData.main_content,
                meta_title: generateData.meta_title,
                meta_description: generateData.meta_description,
                popularity_ranks: generateData.popularity_ranks || null,
                known_for_data: generateData.known_for_data || null,
              }, {
                onConflict: 'profile_slug'
              })
              .select()
              .single();

            if (saveError) {
              console.error(`Failed to save profile to database:`, saveError);
              throw new Error(`Generated profile but failed to save: ${saveError.message}`);
            }

            console.log(`✓ Profile saved to database with ID: ${savedProfile.id}`);

            successCount++;
            results.push({
              url,
              status: "success",
              profile: savedProfile,
              message: `Generated and saved to database`
            });

            // Send progress update: success
            const successMessage = JSON.stringify({
              type: "progress",
              index: i,
              total: urls.length,
              url,
              status: "success",
              message: `✓ Successfully generated and saved profile for: ${generateData.name}`,
              profile: savedProfile
            }) + "\n";
            controller.enqueue(encoder.encode(successMessage));

            console.log(`✓ Successfully generated and saved profile for: ${url}`);

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
