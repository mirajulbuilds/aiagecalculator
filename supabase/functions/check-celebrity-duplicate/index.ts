import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Levenshtein distance for name similarity
function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}

function calculateNameSimilarity(name1: string, name2: string): number {
  const n1 = name1.toLowerCase().trim();
  const n2 = name2.toLowerCase().trim();
  
  const distance = levenshteinDistance(n1, n2);
  const maxLength = Math.max(n1.length, n2.length);
  
  return maxLength === 0 ? 100 : ((maxLength - distance) / maxLength) * 100;
}

function cosineSimilarity(embedding1: number[], embedding2: number[]): number {
  if (!embedding1 || !embedding2 || embedding1.length !== embedding2.length) {
    return 0;
  }

  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;

  for (let i = 0; i < embedding1.length; i++) {
    dotProduct += embedding1[i] * embedding2[i];
    norm1 += embedding1[i] * embedding1[i];
    norm2 += embedding2[i] * embedding2[i];
  }

  if (norm1 === 0 || norm2 === 0) {
    return 0;
  }

  return (dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2))) * 100;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, faceEmbedding } = await req.json();

    if (!name) {
      return new Response(
        JSON.stringify({ error: "Celebrity name is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log("Checking for duplicates of:", name);

    // Fetch all celebrities for comparison
    const { data: celebrities, error } = await supabase
      .from("celebrities")
      .select("id, name, profile_slug, face_embedding, profile_image_url");

    if (error) {
      throw error;
    }

    const duplicates = [];

    for (const celebrity of celebrities || []) {
      // Check name similarity
      const nameSimilarity = calculateNameSimilarity(name, celebrity.name);
      
      // Check face similarity if embeddings are available
      let faceSimilarity = 0;
      if (faceEmbedding && celebrity.face_embedding) {
        const userEmbedding = Array.isArray(faceEmbedding) ? faceEmbedding : faceEmbedding.embedding;
        const celebEmbedding = Array.isArray(celebrity.face_embedding) ? celebrity.face_embedding : celebrity.face_embedding.embedding;
        
        if (userEmbedding && celebEmbedding) {
          faceSimilarity = cosineSimilarity(userEmbedding, celebEmbedding);
        }
      }

      // Consider it a potential duplicate if:
      // - Name similarity > 85% OR
      // - Face similarity > 80%
      if (nameSimilarity > 85 || faceSimilarity > 80) {
        duplicates.push({
          id: celebrity.id,
          name: celebrity.name,
          profileSlug: celebrity.profile_slug,
          profileImageUrl: celebrity.profile_image_url,
          nameSimilarity: Math.round(nameSimilarity),
          faceSimilarity: Math.round(faceSimilarity),
          overallScore: Math.round(Math.max(nameSimilarity, faceSimilarity))
        });
      }
    }

    // Sort by overall score (highest first)
    duplicates.sort((a, b) => b.overallScore - a.overallScore);

    console.log(`Found ${duplicates.length} potential duplicates`);

    return new Response(
      JSON.stringify({
        isDuplicate: duplicates.length > 0,
        duplicates: duplicates.slice(0, 5), // Return top 5 matches
        message: duplicates.length > 0 
          ? `Found ${duplicates.length} potential duplicate(s)` 
          : "No duplicates found"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in check-celebrity-duplicate:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
