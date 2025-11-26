import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify admin access
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!roleData || roleData.role !== 'admin') {
      throw new Error('Admin access required');
    }

    console.log('Starting bulk SEO regeneration...');

    // Fetch all celebrities
    const { data: celebrities, error: fetchError } = await supabase
      .from('celebrities')
      .select('id, name, profession, date_of_birth, main_content')
      .order('created_at', { ascending: true });

    if (fetchError) {
      console.error('Error fetching celebrities:', fetchError);
      throw fetchError;
    }

    console.log(`Found ${celebrities?.length || 0} celebrities to update`);

    const results = {
      total: celebrities?.length || 0,
      updated: 0,
      failed: 0,
      errors: [] as any[]
    };

    // Process each celebrity
    for (const celebrity of celebrities || []) {
      try {
        console.log(`Processing ${celebrity.name}...`);

        // Generate new SEO meta with AI
        const prompt = `Generate SEO-optimized meta title and description for this celebrity profile.

Celebrity: ${celebrity.name}
Profession: ${celebrity.profession}
Date of Birth: ${celebrity.date_of_birth}

CRITICAL SEO REQUIREMENTS:

Meta Title Strategy - Choose ONE pattern that best fits:
1. "How Old is ${celebrity.name}? Exact Age, Birthday & Bio (2025)"
2. "${celebrity.name} Age: Birthday, Zodiac Sign & Height | AiAgeCalc"
3. "${celebrity.name} Bio: Age, Height, Family & Facts (Updated)"
Max 60 characters.

Meta Description Strategy - Write a compelling hook under 160 chars:
- Pattern 1: "Curious about ${celebrity.name}'s real age? Find out exactly how old they are today, their birthday, zodiac sign, and fun facts. Click to see!"
- Pattern 2: "Discover ${celebrity.name}'s age, net worth, and career highlights. Is ${celebrity.name} older than you think? Calculate your age difference here!"

Return ONLY valid JSON with this structure:
{
  "meta_title": "your generated title here",
  "meta_description": "your generated description here"
}`;

        const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${lovableApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [
              {
                role: 'user',
                content: prompt
              }
            ],
            temperature: 0.7,
          }),
        });

        if (!aiResponse.ok) {
          throw new Error(`AI API error: ${aiResponse.status}`);
        }

        const aiData = await aiResponse.json();
        const generatedText = aiData.choices[0].message.content;

        // Extract JSON from response
        const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('No valid JSON in AI response');
        }

        const seoData = JSON.parse(jsonMatch[0]);

        // Update celebrity profile
        const { error: updateError } = await supabase
          .from('celebrities')
          .update({
            meta_title: seoData.meta_title,
            meta_description: seoData.meta_description,
            updated_at: new Date().toISOString()
          })
          .eq('id', celebrity.id);

        if (updateError) {
          throw updateError;
        }

        results.updated++;
        console.log(`✓ Updated ${celebrity.name}`);

      } catch (error) {
        results.failed++;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        results.errors.push({
          name: celebrity.name,
          error: errorMessage
        });
        console.error(`✗ Failed to update ${celebrity.name}:`, error);
      }

      // Small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('Bulk regeneration complete:', results);

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in bulk-regenerate-seo:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
