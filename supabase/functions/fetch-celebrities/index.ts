import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Celebrity {
  id: string;
  name: string;
  dateOfBirth: string;
  profession: string;
  bio: string;
  photoUrl: string | null;
  quote: string | null;
  nationality: string | null;
}

async function fetchCelebritiesFromWikidata(birthMonth?: number, birthDay?: number): Promise<Celebrity[]> {
  try {
    // Build SPARQL query to fetch celebrities
    let dateFilter = '';
    if (birthMonth && birthDay) {
      // Format: --MM-DD for filtering by month and day
      const monthStr = birthMonth.toString().padStart(2, '0');
      const dayStr = birthDay.toString().padStart(2, '0');
      dateFilter = `FILTER(SUBSTR(STR(?birthDate), 6, 5) = "--${monthStr}-${dayStr}")`;
    }

    const sparqlQuery = `
      SELECT DISTINCT ?person ?personLabel ?birthDate ?occupationLabel ?description ?image ?nationalityLabel WHERE {
        ?person wdt:P31 wd:Q5;
                wdt:P569 ?birthDate;
                wdt:P106 ?occupation.
        ${dateFilter}
        OPTIONAL { ?person wdt:P18 ?image. }
        OPTIONAL { ?person wdt:P27 ?nationality. }
        SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
      }
      ORDER BY DESC(?birthDate)
      LIMIT 50
    `;

    const wikidataUrl = `https://query.wikidata.org/sparql?query=${encodeURIComponent(sparqlQuery)}&format=json`;
    
    const response = await fetch(wikidataUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'LovableCelebrityApp/1.0'
      }
    });

    if (!response.ok) {
      console.error('Wikidata API error:', response.status);
      return [];
    }

    const data = await response.json();
    
    // Transform Wikidata results into our Celebrity format
    const celebrities: Celebrity[] = data.results.bindings.map((item: any) => ({
      id: item.person.value.split('/').pop(),
      name: item.personLabel?.value || 'Unknown',
      dateOfBirth: item.birthDate?.value?.split('T')[0] || '',
      profession: item.occupationLabel?.value || 'Notable Person',
      bio: item.description?.value || 'Notable personality',
      photoUrl: item.image?.value || null,
      nationality: item.nationalityLabel?.value || null,
      quote: null // Will be filled with random quotes
    }));

    // Fetch random quotes from quotable.io
    const quotesResponse = await fetch('https://api.quotable.io/quotes/random?limit=50');
    const quotes = quotesResponse.ok ? await quotesResponse.json() : [];

    // Assign random quotes to celebrities
    celebrities.forEach((celebrity, index) => {
      if (quotes[index]) {
        celebrity.quote = quotes[index].content;
      }
    });

    return celebrities;
  } catch (error) {
    console.error('Error fetching celebrities:', error);
    return [];
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const birthMonth = url.searchParams.get('birthMonth');
    const birthDay = url.searchParams.get('birthDay');
    const search = url.searchParams.get('search');
    const profession = url.searchParams.get('profession');
    const nationality = url.searchParams.get('nationality');

    console.log('Fetching celebrities with params:', { birthMonth, birthDay, search, profession, nationality });

    // Fetch celebrities from Wikidata
    let celebrities = await fetchCelebritiesFromWikidata(
      birthMonth ? parseInt(birthMonth) : undefined,
      birthDay ? parseInt(birthDay) : undefined
    );

    // Apply additional filters
    if (search) {
      const searchLower = search.toLowerCase();
      celebrities = celebrities.filter(c => 
        c.name.toLowerCase().includes(searchLower) ||
        c.profession.toLowerCase().includes(searchLower) ||
        (c.bio && c.bio.toLowerCase().includes(searchLower))
      );
    }

    if (profession) {
      const professionLower = profession.toLowerCase();
      celebrities = celebrities.filter(c => 
        c.profession.toLowerCase().includes(professionLower)
      );
    }

    if (nationality) {
      const nationalityLower = nationality.toLowerCase();
      celebrities = celebrities.filter(c => 
        c.nationality && c.nationality.toLowerCase().includes(nationalityLower)
      );
    }

    console.log(`Returning ${celebrities.length} celebrities`);

    return new Response(
      JSON.stringify({ celebrities }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    );
  } catch (error) {
    console.error('Error in fetch-celebrities function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage, celebrities: [] }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    );
  }
});
