import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.47.10';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Calculate cosine similarity between two vectors
function cosineSimilarity(vec1: number[], vec2: number[]): number {
  if (vec1.length !== vec2.length) {
    throw new Error('Vectors must have the same length');
  }

  let dotProduct = 0;
  let mag1 = 0;
  let mag2 = 0;

  for (let i = 0; i < vec1.length; i++) {
    dotProduct += vec1[i] * vec2[i];
    mag1 += vec1[i] * vec1[i];
    mag2 += vec2[i] * vec2[i];
  }

  mag1 = Math.sqrt(mag1);
  mag2 = Math.sqrt(mag2);

  if (mag1 === 0 || mag2 === 0) {
    return 0;
  }

  return dotProduct / (mag1 * mag2);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userEmbedding } = await req.json();

    if (!userEmbedding || !Array.isArray(userEmbedding)) {
      return new Response(
        JSON.stringify({ error: 'Valid user embedding array is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Fetching celebrities with face embeddings...');

    // Fetch all celebrities that have face embeddings
    const { data: celebrities, error: fetchError } = await supabase
      .from('celebrities')
      .select('id, name, profile_slug, profile_image_url, face_embedding, profession')
      .not('face_embedding', 'is', null);

    if (fetchError) {
      console.error('Database error:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch celebrities', details: fetchError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!celebrities || celebrities.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No celebrities with face embeddings found in database' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Comparing against ${celebrities.length} celebrities...`);

    // Calculate similarity scores for all celebrities
    const matches = celebrities
      .map(celebrity => {
        try {
          const celebEmbedding = celebrity.face_embedding?.embedding;
          
          if (!celebEmbedding || !Array.isArray(celebEmbedding)) {
            console.log(`Skipping ${celebrity.name} - invalid embedding`);
            return null;
          }

          const similarity = cosineSimilarity(userEmbedding, celebEmbedding);
          const similarityPercentage = Math.round(similarity * 100);

          return {
            id: celebrity.id,
            name: celebrity.name,
            profileSlug: celebrity.profile_slug,
            profileImageUrl: celebrity.profile_image_url,
            profession: celebrity.profession,
            similarity: similarity,
            similarityPercentage: similarityPercentage
          };
        } catch (error) {
          console.error(`Error calculating similarity for ${celebrity.name}:`, error);
          return null;
        }
      })
      .filter(match => match !== null)
      .sort((a, b) => b!.similarity - a!.similarity);

    if (matches.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Could not find any valid matches' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Return top 5 matches
    const topMatches = matches.slice(0, 5);

    console.log('Top match:', topMatches[0]);

    return new Response(
      JSON.stringify({ 
        bestMatch: topMatches[0],
        topMatches: topMatches,
        totalCompared: celebrities.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in find-celebrity-match:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});