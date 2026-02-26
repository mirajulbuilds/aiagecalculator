import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { validateInput, createValidationErrorResponse, ageSchema, moneySchema, percentageSchema } from "../_shared/validation.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 60;
const RATE_WINDOW = 60000;

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
    const identifier = req.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(identifier)) {
      return new Response(
        JSON.stringify({ error: 'Too many requests. Please try again later.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { currentAge, currentSavings, monthlyIncome, monthlyExpenses, desiredRetirementIncome, investmentReturn, lifestylePreference, includeSocialSecurity, estimatedSSMonthly } = await req.json();

    console.log('Calculating retirement with params:', { currentAge, currentSavings, monthlyIncome, monthlyExpenses, desiredRetirementIncome, investmentReturn, lifestylePreference, includeSocialSecurity, estimatedSSMonthly });

    const requestSchema = z.object({
      currentAge: ageSchema,
      currentSavings: moneySchema,
      monthlyIncome: moneySchema,
      monthlyExpenses: moneySchema,
      desiredRetirementIncome: moneySchema,
      investmentReturn: percentageSchema.refine(val => val >= -20 && val <= 30, "Investment return must be between -20% and 30%"),
      lifestylePreference: z.enum(["modest", "comfortable", "luxurious"], {
        errorMap: () => ({ message: "Lifestyle preference must be one of: modest, comfortable, luxurious" })
      }),
      includeSocialSecurity: z.boolean().optional().default(false),
      estimatedSSMonthly: moneySchema.optional().default(0),
    });

    const validation = validateInput(requestSchema, { currentAge, currentSavings, monthlyIncome, monthlyExpenses, desiredRetirementIncome, investmentReturn, lifestylePreference, includeSocialSecurity: includeSocialSecurity || false, estimatedSSMonthly: estimatedSSMonthly || 0 });
    if (!validation.success) {
      return createValidationErrorResponse(validation.errors, validation.fieldErrors, corsHeaders);
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const ssSection = includeSocialSecurity 
      ? `\nExpected Monthly Social Security Benefit: $${estimatedSSMonthly} (starting at age 62-67)`
      : `\nSocial Security: Not included in this analysis`;

    const prompt = `Based on the following financial data, act as a financial advisor and calculate when this person can retire:

Current Age: ${currentAge}
Current Retirement Savings: $${currentSavings}
Monthly Income: $${monthlyIncome}
Monthly Expenses: $${monthlyExpenses}
Desired Monthly Retirement Income: $${desiredRetirementIncome}
Expected Annual Investment Return: ${investmentReturn}%
Desired Retirement Lifestyle: ${lifestylePreference}${ssSection}

Please analyze this data and provide:
1. The estimated retirement age (as a whole number)
2. A short (3-4 sentences), encouraging summary explaining whether their retirement goals are realistic, key factors, and one actionable tip
3. The safe monthly withdrawal amount at retirement (using the 4% rule on projected savings)
4. How many years their savings will last at their desired withdrawal rate
5. If social security is included, a brief note on how it affects the plan

Return your response in this exact JSON format:
{
  "retirement_age": <number>,
  "summary_text": "<your summary here>",
  "monthly_withdrawal": "<formatted dollar amount, e.g. $3,200>",
  "savings_last_years": <number>,
  "social_security_note": "<brief note about social security impact, or null if not included>"
}`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [{ role: 'user', content: prompt }],
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
        monthly_withdrawal: parsedResult.monthly_withdrawal || null,
        savings_last_years: parsedResult.savings_last_years || null,
        social_security_note: parsedResult.social_security_note || null,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in calculate-retirement function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
