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
    const { birthDate, celebrities } = await req.json();

    if (!birthDate || !celebrities || celebrities.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: birthDate and celebrities' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log('Generating birthday card for:', birthDate);
    console.log('With celebrities:', celebrities.map((c: any) => c.name).join(', '));

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Create celebrity names list
    const celebrityList = celebrities.slice(0, 4).map((c: any) => 
      `${c.name} (${c.profession})`
    ).join(', ');

    // Generate image prompt
    const prompt = `Create a beautiful, modern social media card with a gradient background (purple to blue). 
    
    The card should have:
    - A large, elegant title at the top: "🎂 Birthday Twins!"
    - Below that, prominently display the date: "${birthDate}"
    - A subtitle: "I share my birthday with these amazing celebrities:"
    - List these names in an elegant font: ${celebrityList}
    - At the bottom, add the branding: "aiagecalc.com" with a small sparkle emoji ✨
    
    Style: Modern, clean, Instagram-friendly, high quality, professional typography, vibrant gradient colors (purple #8B5CF6 to blue), celebration theme with subtle confetti or star decorations. 
    
    Make it visually stunning and share-worthy for social media!`;

    console.log('Sending request to Lovable AI...');

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        modalities: ["image", "text"]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI API error:', errorText);
      throw new Error(`Lovable AI API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log('Received response from Lovable AI');

    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageUrl) {
      console.error('No image URL in response:', JSON.stringify(data));
      throw new Error('Failed to generate image - no image URL in response');
    }

    console.log('Successfully generated birthday card image');

    return new Response(
      JSON.stringify({ 
        imageUrl,
        message: 'Birthday card generated successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('Error generating birthday card:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate birthday card',
        details: errorMessage
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
