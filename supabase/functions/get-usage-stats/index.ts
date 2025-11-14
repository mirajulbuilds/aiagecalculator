import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Pricing estimates (as of 2025)
const PRICING = {
  'lovable-ai': 0.01, // $0.01 per generation (estimate)
  'gemini-api': 0.005 // $0.005 per generation (Gemini 2.0 Flash estimate)
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { startDate, endDate } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log("Fetching usage statistics");

    // Build the query
    let query = supabase
      .from("profile_generations")
      .select("*");

    if (startDate) {
      query = query.gte("created_at", startDate);
    }
    
    if (endDate) {
      query = query.lte("created_at", endDate);
    }

    const { data: generations, error } = await query.order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    // Calculate statistics
    const stats = {
      total: generations?.length || 0,
      byEngine: {
        'lovable-ai': 0,
        'gemini-api': 0
      },
      byStatus: {
        success: 0,
        failed: 0,
        duplicate: 0
      },
      costEstimate: {
        'lovable-ai': 0,
        'gemini-api': 0,
        total: 0
      },
      recentGenerations: [] as any[]
    };

    generations?.forEach((gen: any) => {
      // Count by engine
      if (gen.engine_used === 'lovable-ai') {
        stats.byEngine['lovable-ai']++;
        stats.costEstimate['lovable-ai'] += PRICING['lovable-ai'];
      } else if (gen.engine_used === 'gemini-api') {
        stats.byEngine['gemini-api']++;
        stats.costEstimate['gemini-api'] += PRICING['gemini-api'];
      }

      // Count by status
      if (gen.generation_status === 'success') {
        stats.byStatus.success++;
      } else if (gen.generation_status === 'failed') {
        stats.byStatus.failed++;
      } else if (gen.generation_status === 'duplicate') {
        stats.byStatus.duplicate++;
      }
    });

    stats.costEstimate.total = stats.costEstimate['lovable-ai'] + stats.costEstimate['gemini-api'];
    stats.recentGenerations = generations?.slice(0, 10) || [];

    console.log("Usage stats calculated:", {
      total: stats.total,
      lovableAI: stats.byEngine['lovable-ai'],
      geminiAPI: stats.byEngine['gemini-api']
    });

    return new Response(
      JSON.stringify(stats),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in get-usage-stats:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
