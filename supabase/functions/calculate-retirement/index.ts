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
    const { currentAge, currentSavings, monthlyIncome, monthlyExpenses, desiredRetirementIncome, investmentReturn, lifestylePreference } = await req.json();

    console.log('Calculating retirement with params:', { currentAge, currentSavings, monthlyIncome, monthlyExpenses, desiredRetirementIncome, investmentReturn, lifestylePreference });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const prompt = `Based on the following financial data, act as a financial advisor and calculate when this person can retire:

Current Age: ${currentAge}
Current Retirement Savings: $${currentSavings}
Monthly Income: $${monthlyIncome}
Monthly Expenses: $${monthlyExpenses}
Desired Monthly Retirement Income: $${desiredRetirementIncome}
Expected Annual Investment Return: ${investmentReturn}%
Desired Retirement Lifestyle: ${lifestylePreference}

Please analyze this data and provide:
1. The estimated retirement age (as a whole number)
2. A short (3-4 sentences), encouraging summary that explains:
   - Whether their retirement goals are realistic
   - Key factors affecting their retirement timeline
   - One actionable tip to improve their retirement outlook

Return your response in this exact JSON format:
{
  "retirement_age": <number>,
  "summary_text": "<your summary here>"
}`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-pro',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    console.log('AI response:', JSON.stringify(aiData));

    const content = aiData.choices[0].message.content;
    
    // Extract JSON from the response (handling markdown code blocks)
    let jsonStr = content;
    if (content.includes('```json')) {
      jsonStr = content.split('```json')[1].split('```')[0].trim();
    } else if (content.includes('```')) {
      jsonStr = content.split('```')[1].split('```')[0].trim();
    }

    const parsedResult = JSON.parse(jsonStr);
    const retirementAge = parsedResult.retirement_age;
    const yearsToRetirement = Math.max(0, retirementAge - currentAge);

    return new Response(
      JSON.stringify({
        retirement_age: retirementAge,
        years_to_retirement: yearsToRetirement,
        summary_text: parsedResult.summary_text,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in calculate-retirement function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error occurred' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
