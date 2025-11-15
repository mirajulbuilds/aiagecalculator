import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

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

    const { target_age } = await req.json();

    if (target_age === undefined || target_age === null) {
      return new Response(
        JSON.stringify({ error: 'Missing target_age parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate target_age is a reasonable number
    if (typeof target_age !== 'number' || target_age < 0 || target_age > 120) {
      return new Response(
        JSON.stringify({ error: 'Invalid target_age. Must be between 0 and 120' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase configuration');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Calculate the birth year range for the target age
    const currentYear = new Date().getFullYear();
    const currentDate = new Date();
    const birthYearStart = currentYear - target_age - 1;
    const birthYearEnd = currentYear - target_age;

    console.log(`Looking for celebrities aged ${target_age}, born between ${birthYearStart} and ${birthYearEnd}`);

    // Query celebrities with calculated age matching target_age
    const { data: celebrities, error } = await supabase
      .from('celebrities')
      .select('name, profile_slug, date_of_birth, popularity_ranks')
      .gte('date_of_birth', `${birthYearStart}-01-01`)
      .lte('date_of_birth', `${birthYearEnd}-12-31`)
      .not('popularity_ranks', 'is', null);

    if (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to query database' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Filter celebrities to exact age match (accounting for birth month/day)
    const exactAgeMatches = (celebrities || []).filter(celeb => {
      const birthDate = new Date(celeb.date_of_birth);
      let age = currentYear - birthDate.getFullYear();
      
      // Adjust age if birthday hasn't occurred yet this year
      const birthdayThisYear = new Date(currentYear, birthDate.getMonth(), birthDate.getDate());
      if (currentDate < birthdayThisYear) {
        age--;
      }
      
      return age === target_age;
    });

    console.log(`Found ${exactAgeMatches.length} celebrities aged ${target_age}`);

    // Sort by popularity (if available) and take top 3
    const sortedCelebrities = exactAgeMatches.sort((a, b) => {
      const aRank = a.popularity_ranks?.most_popular || 999999;
      const bRank = b.popularity_ranks?.most_popular || 999999;
      return aRank - bRank;
    });

    const topCelebrities = sortedCelebrities.slice(0, 3).map(celeb => ({
      name: celeb.name,
      profile_slug: celeb.profile_slug
    }));

    return new Response(
      JSON.stringify({ celebrities: topCelebrities }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in get-celebrities-by-age function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
