import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { petType, dogSize, birthDate } = await req.json();

    if (!petType || !birthDate) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (petType === 'Dog' && !dogSize) {
      return new Response(
        JSON.stringify({ error: 'Dog size is required for dogs' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const prompt = `You are a veterinary expert specializing in pet age calculations. Based on the following information, calculate the pet's human-equivalent age using modern veterinary formulas:

Pet Type: ${petType}
${petType === 'Dog' ? `Dog Size: ${dogSize}` : ''}
Birth Date: ${birthDate}
Today's Date: ${new Date().toISOString().split('T')[0]}

Use these modern veterinary formulas:
- For Cats: First year = 15 human years, second year = 9 human years, each year after = 4 human years
- For Small Dogs (0-20 lbs): First year = 15 human years, second year = 9 human years, each year after = 4 human years
- For Medium Dogs (21-50 lbs): First year = 15 human years, second year = 9 human years, each year after = 5 human years
- For Large Dogs (51+ lbs): First year = 15 human years, second year = 9 human years, each year after = 6 human years

Calculate:
1. The exact age of the pet in years and months from the birth date to today (format: "X years, Y months" or "X months" for pets under 1 year)
2. The human-equivalent age (as a whole number)
3. The life stage based on age:
   - For Cats: "Kitten" (0-1 year), "Young Adult" (1-3 years), "Adult" (3-7 years), "Mature" (7-11 years), "Senior" (11-14 years), "Geriatric" (15+ years)
   - For Small Dogs: "Puppy" (0-1 year), "Young Adult" (1-3 years), "Adult" (3-8 years), "Senior" (8-11 years), "Geriatric" (12+ years)
   - For Medium Dogs: "Puppy" (0-1 year), "Young Adult" (1-3 years), "Adult" (3-7 years), "Senior" (7-10 years), "Geriatric" (11+ years)
   - For Large Dogs: "Puppy" (0-1 year), "Young Adult" (1-3 years), "Adult" (3-6 years), "Senior" (6-9 years), "Geriatric" (10+ years)
4. A short, fun summary (2-3 sentences) explaining the result and what life stage the pet is in

Return your response in this exact JSON format:
{
  "actualAge": "[X years, Y months]",
  "humanAge": [number],
  "lifeStage": "[life stage]",
  "summary_text": "[your fun summary here]"
}`;

    console.log('Calling Lovable AI Gateway...');
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI Gateway error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ error: 'AI service error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiData = await aiResponse.json();
    console.log('AI Response received');

    const content = aiData.choices?.[0]?.message?.content;
    if (!content) {
      console.error('No content in AI response');
      return new Response(
        JSON.stringify({ error: 'Invalid AI response' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('No JSON found in AI response:', content);
      return new Response(
        JSON.stringify({ error: 'Failed to parse AI response' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const parsedResult = JSON.parse(jsonMatch[0]);
    
    if (parsedResult.humanAge === undefined || parsedResult.humanAge === null || 
        !parsedResult.summary_text || !parsedResult.actualAge || !parsedResult.lifeStage) {
      console.error('Missing required fields in AI response:', parsedResult);
      return new Response(
        JSON.stringify({ error: 'Incomplete AI response' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Successfully calculated pet human age:', parsedResult.humanAge);

    return new Response(
      JSON.stringify(parsedResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in get-pet-human-age function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
