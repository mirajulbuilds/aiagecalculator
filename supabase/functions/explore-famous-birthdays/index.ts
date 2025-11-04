import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const url = new URL(req.url);
    const dob = url.searchParams.get('dob');
    const region = url.searchParams.get('region');
    const top = url.searchParams.get('top');
    const trending = url.searchParams.get('trending');

    let query = supabase
      .from('explore_famous_birthdays')
      .select('*');

    // Filter by date of birth
    if (dob) {
      query = query.eq('dob', dob);
    }

    // Filter by region/country
    if (region) {
      query = query.or(`country.ilike.%${region}%,region_category.eq.${region}`);
    }

    // Filter by trending
    if (trending === 'true') {
      query = query.eq('today_trending', true);
    }

    // Order by popularity
    query = query.order('popularity_score', { ascending: false });

    // Limit results
    if (top) {
      const limit = parseInt(top);
      if (!isNaN(limit) && limit > 0) {
        query = query.limit(limit);
      }
    }

    const { data, error } = await query;

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        count: data?.length || 0,
        data: data || [] 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in explore-famous-birthdays function:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        data: []
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
