import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { validateInput, createValidationErrorResponse, ageSchema, moneySchema, percentageSchema } from "../_shared/validation.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limiting storage (in-memory, resets on function cold start)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 60; // requests per window
const RATE_WINDOW = 60000; // 1 minute in milliseconds

function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + RATE_WINDOW });
    return true;
  }
  
  if (record.count >= RATE_LIMIT) {
    return false;
  }
  
  record.count++;
  return true;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limiting check
    const identifier = req.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(identifier)) {
      return new Response(
        JSON.stringify({ error: 'Too many requests. Please try again later.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { currentAge, currentSavings, monthlyIncome, monthlyExpenses, desiredRetirementIncome, investmentReturn, lifestylePreference } = await req.json();

    console.log('Calculating retirement with params:', { currentAge, currentSavings, monthlyIncome, monthlyExpenses, desiredRetirementIncome, investmentReturn, lifestylePreference });

    // Validate input with Zod
    const requestSchema = z.object({
      currentAge: ageSchema,
      currentSavings: moneySchema,
      monthlyIncome: moneySchema,
      monthlyExpenses: moneySchema,
      desiredRetirementIncome: moneySchema,
      investmentReturn: percentageSchema.refine(val => val >= -20 && val <= 30, "Investment return must be between -20% and 30%"),
      lifestylePreference: z.enum(["modest", "comfortable", "luxurious"], {
        errorMap: () => ({ message: "Lifestyle preference must be one of: modest, comfortable, luxurious" })
      })
    });

    const validation = validateInput(requestSchema, { currentAge, currentSavings, monthlyIncome, monthlyExpenses, desiredRetirementIncome, investmentReturn, lifestylePreference });
    if (!validation.success) {
      return createValidationErrorResponse(validation.errors, validation.fieldErrors, corsHeaders);
    }

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
