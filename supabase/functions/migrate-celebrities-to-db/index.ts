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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { celebrities } = await req.json();
    
    if (!celebrities || !Array.isArray(celebrities)) {
      return new Response(
        JSON.stringify({ error: 'Invalid celebrities data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Starting migration of ${celebrities.length} celebrities...`);

    // Transform celebrities to match database schema
    const transformedCelebrities = celebrities.map((celeb: any) => ({
      name: celeb.name,
      slug: celeb.slug,
      profession: celeb.profession,
      dob: celeb.dob,
      birthplace: celeb.birthplace,
      country: celeb.country,
      birth_sign: celeb.birth_sign,
      image_url: celeb.image, // Map 'image' to 'image_url'
      bio: celeb.about, // Map 'about' to 'bio'
      before_fame: celeb.before_fame,
      family_life: celeb.family_life,
      associated_with: celeb.associated_with,
      trivia: celeb.trivia || [],
      category_memberships: celeb.category_memberships || [],
      fans_also_viewed: celeb.fans_also_viewed || [],
      social_links: celeb.social_links || {},
      popularity_rank_overall: celeb.popularity_rank_overall,
      popularity_rank_profession: celeb.popularity_rank_profession,
      popularity_score: celeb.popularity_score || 50,
      excerpt: celeb.excerpt,
      meta_description: celeb.meta_description,
      og_title: celeb.og_title,
      og_description: celeb.og_description,
      famous_for: celeb.famous_for,
      region_category: celeb.region_category,
      today_trending: celeb.today_trending || false,
    }));

    // Insert in batches of 100
    const batchSize = 100;
    let successCount = 0;
    let errorCount = 0;
    const errors: any[] = [];

    for (let i = 0; i < transformedCelebrities.length; i += batchSize) {
      const batch = transformedCelebrities.slice(i, i + batchSize);
      
      const { data, error } = await supabaseClient
        .from('explore_famous_birthdays')
        .upsert(batch, { onConflict: 'slug' });

      if (error) {
        console.error(`Error inserting batch ${i / batchSize + 1}:`, error);
        errorCount += batch.length;
        errors.push({ batch: i / batchSize + 1, error: error.message });
      } else {
        successCount += batch.length;
        console.log(`Successfully inserted batch ${i / batchSize + 1}`);
      }
    }

    console.log(`Migration complete. Success: ${successCount}, Errors: ${errorCount}`);

    return new Response(
      JSON.stringify({
        success: true,
        migrated: successCount,
        errors: errorCount,
        errorDetails: errors,
        message: `Successfully migrated ${successCount} celebrities to database`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Migration error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});