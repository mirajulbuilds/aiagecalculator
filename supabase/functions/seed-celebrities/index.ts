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

    const { celebrities } = await req.json();

    if (!celebrities || !Array.isArray(celebrities)) {
      throw new Error('Invalid request: celebrities array required');
    }

    let inserted = 0;
    let duplicates = 0;
    let errors = 0;

    for (const celebrity of celebrities) {
      const record = {
        name: celebrity.name || celebrity.fullName,
        dob: celebrity.dateOfBirth || celebrity.dob,
        profession: celebrity.profession,
        famous_for: celebrity.knownFor?.[0] || celebrity.famousFor || null,
        country: celebrity.placeOfBirth?.split(',').pop()?.trim() || celebrity.country || null,
        region_category: 'Global',
        bio: celebrity.biography || celebrity.bio || null,
        image_url: celebrity.imageUrl || celebrity.image || null,
        source_url: celebrity.slug ? `https://aiagecalc.com/celebrity/${celebrity.slug}` : null,
        popularity_score: 75, // Default high score for curated celebrities
        social_links: {},
        today_trending: false,
        ai_summary: celebrity.biography?.substring(0, 200) || null,
      };

      const { error } = await supabase
        .from('explore_famous_birthdays')
        .insert(record);

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          duplicates++;
        } else {
          console.error('Insert error:', error, 'for celebrity:', record.name);
          errors++;
        }
      } else {
        inserted++;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        summary: {
          total_processed: celebrities.length,
          inserted,
          duplicates,
          errors,
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in seed-celebrities function:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
