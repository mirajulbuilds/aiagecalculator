import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

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
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { batch_size = 5, check_only = false } = await req.json();

    console.log('Starting auto-complete profiles process...');

    // Query incomplete profiles
    const { data: incompleteProfiles, error: queryError } = await supabase
      .from('explore_famous_birthdays')
      .select('*')
      .or('profile_complete.eq.false,image_url.is.null,about_word_count.lt.500')
      .limit(batch_size);

    if (queryError) {
      console.error('Error querying profiles:', queryError);
      throw queryError;
    }

    if (!incompleteProfiles || incompleteProfiles.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'All profiles are complete!',
          incomplete_count: 0,
          processed: 0,
          results: [],
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${incompleteProfiles.length} incomplete profiles`);

    if (check_only) {
      return new Response(
        JSON.stringify({
          success: true,
          incomplete_count: incompleteProfiles.length,
          profiles: incompleteProfiles.map(p => ({
            id: p.id,
            name: p.name,
            has_image: !!p.image_url,
            word_count: p.about_word_count || 0,
            profile_complete: p.profile_complete,
          })),
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Process each incomplete profile
    const results = [];
    for (const profile of incompleteProfiles) {
      console.log(`Processing ${profile.name}...`);
      
      const needsImage = !profile.image_url;
      const needsBio = !profile.bio || (profile.about_word_count || 0) < 500;

      let updateData: any = {};

      // Generate complete profile if needed
      if (needsImage || needsBio) {
        try {
          const profilePrompt = `Generate a comprehensive celebrity profile for ${profile.name}, profession: ${profile.profession}.

CRITICAL REQUIREMENTS:
1. Biography must be EXACTLY 500-800 words
2. Structure must include these 5 sections:

**About**
[Main biographical content - 500+ words covering their life, career, achievements, and impact]

**Before Fame**
[100-150 words about their early life, education, and journey before becoming famous]

**Trivia**
• [Interesting fact 1]
• [Interesting fact 2]
• [Interesting fact 3]
• [Interesting fact 4]
• [Interesting fact 5]

**Family Life**
[100-150 words about their family, relationships, children, and personal life]

**Associated With**
[100-150 words about notable collaborations, co-stars, mentors, or professional relationships]

Use a professional, engaging tone. Be accurate and SEO-friendly. Make it readable and interesting.`;

          const textResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${lovableApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'google/gemini-2.5-flash',
              messages: [{ role: 'user', content: profilePrompt }],
            }),
          });

          if (!textResponse.ok) {
            const errorText = await textResponse.text();
            console.error(`AI text generation failed for ${profile.name}:`, errorText);
            throw new Error(`AI generation failed: ${textResponse.status}`);
          }

          const textData = await textResponse.json();
          const bioContent = textData.choices?.[0]?.message?.content;

          if (bioContent && needsBio) {
            updateData.bio = bioContent;
            
            // Extract sections
            const aboutMatch = bioContent.match(/\*\*About\*\*\s+([\s\S]*?)(?=\*\*Before Fame\*\*|$)/i);
            const beforeFameMatch = bioContent.match(/\*\*Before Fame\*\*\s+([\s\S]*?)(?=\*\*Trivia\*\*|$)/i);
            const triviaMatch = bioContent.match(/\*\*Trivia\*\*\s+([\s\S]*?)(?=\*\*Family Life\*\*|$)/i);
            const familyMatch = bioContent.match(/\*\*Family Life\*\*\s+([\s\S]*?)(?=\*\*Associated With\*\*|$)/i);
            const associatedMatch = bioContent.match(/\*\*Associated With\*\*\s+([\s\S]*?)$/i);

            if (beforeFameMatch) updateData.before_fame = beforeFameMatch[1].trim();
            if (triviaMatch) {
              const triviaItems = triviaMatch[1].trim().split('•').filter((t: string) => t.trim()).map((t: string) => t.trim());
              updateData.trivia = triviaItems;
            }
            if (familyMatch) updateData.family_life = familyMatch[1].trim();
            if (associatedMatch) updateData.associated_with = associatedMatch[1].trim();
          }

          // Generate image if needed
          if (needsImage) {
            const imagePrompt = `Professional portrait photograph of ${profile.name}, ${profile.profession}. High quality, well-lit, professional headshot. Photorealistic style.`;

            const imageResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${lovableApiKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                model: 'google/gemini-2.5-flash-image-preview',
                messages: [{ role: 'user', content: imagePrompt }],
                modalities: ['image', 'text'],
              }),
            });

            if (imageResponse.ok) {
              const imageData = await imageResponse.json();
              const imageUrl = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
              
              if (imageUrl) {
                updateData.image_url = imageUrl;
              }
            } else {
              console.warn(`Image generation failed for ${profile.name}, continuing without image`);
            }
          }

          // Update profile in database
          const { error: updateError } = await supabase
            .from('explore_famous_birthdays')
            .update(updateData)
            .eq('id', profile.id);

          if (updateError) {
            console.error(`Error updating ${profile.name}:`, updateError);
            results.push({
              name: profile.name,
              success: false,
              error: updateError.message,
            });
          } else {
            console.log(`Successfully updated ${profile.name}`);
            results.push({
              name: profile.name,
              success: true,
              updated_image: needsImage && updateData.image_url,
              updated_bio: needsBio,
            });
          }

          // Rate limiting: wait 2 seconds between profiles
          await new Promise(resolve => setTimeout(resolve, 2000));

        } catch (error) {
          console.error(`Error processing ${profile.name}:`, error);
          results.push({
            name: profile.name,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        incomplete_count: incompleteProfiles.length,
        processed: results.length,
        results,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in auto-complete-profiles:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
