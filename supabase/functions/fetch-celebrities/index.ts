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
    // Simplified SPARQL query - fetch recent notable people
    let dateFilter = '';
    let limit = 20;
    
    if (birthMonth && birthDay) {
      // More specific query when filtering by birth date
      const monthStr = birthMonth.toString().padStart(2, '0');
      const dayStr = birthDay.toString().padStart(2, '0');
      dateFilter = `FILTER(MONTH(?birthDate) = ${birthMonth} && DAY(?birthDate) = ${birthDay})`;
      limit = 50;
    }

    // Simplified query focusing on well-known people with images
    const sparqlQuery = `
      SELECT DISTINCT ?person ?personLabel ?birthDate ?occupationLabel ?image WHERE {
        ?person wdt:P31 wd:Q5;
                wdt:P569 ?birthDate;
                wdt:P106 ?occupation;
                wdt:P18 ?image.
        ${dateFilter}
        FILTER(YEAR(?birthDate) > 1900 && YEAR(?birthDate) < 2010)
        SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
      }
      ORDER BY DESC(?birthDate)
      LIMIT ${limit}
    `;

    const wikidataUrl = `https://query.wikidata.org/sparql?query=${encodeURIComponent(sparqlQuery)}&format=json`;
    
    console.log('Querying Wikidata...');
    
    const response = await fetch(wikidataUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'LovableCelebrityApp/1.0'
      },
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });

    if (!response.ok) {
      console.error('Wikidata API error:', response.status);
      return getFallbackCelebrities(birthMonth, birthDay);
    }

    const data = await response.json();
    
    if (!data.results?.bindings || data.results.bindings.length === 0) {
      console.log('No results from Wikidata, using fallback');
      return getFallbackCelebrities(birthMonth, birthDay);
    }
    
    console.log(`Wikidata returned ${data.results.bindings.length} results`);
    
    // Transform Wikidata results into our Celebrity format
    const celebrities: Celebrity[] = data.results.bindings.map((item: any) => ({
      id: item.person.value.split('/').pop(),
      name: item.personLabel?.value || 'Unknown',
      dateOfBirth: item.birthDate?.value?.split('T')[0] || '',
      profession: item.occupationLabel?.value || 'Notable Person',
      bio: `${item.occupationLabel?.value || 'Notable personality'}`,
      photoUrl: item.image?.value || null,
      nationality: null,
      quote: null
    }));

    // Fetch random quotes from quotable.io
    try {
      const quotesResponse = await fetch(`https://api.quotable.io/quotes/random?limit=${celebrities.length}`);
      if (quotesResponse.ok) {
        const quotes = await quotesResponse.json();
        celebrities.forEach((celebrity, index) => {
          if (quotes[index]) {
            celebrity.quote = quotes[index].content;
          }
        });
      }
    } catch (error) {
      console.error('Error fetching quotes:', error);
    }

    return celebrities;
  } catch (error) {
    console.error('Error fetching celebrities:', error);
    return getFallbackCelebrities(birthMonth, birthDay);
  }
}

// Fallback data when API fails
function getFallbackCelebrities(birthMonth?: number, birthDay?: number): Celebrity[] {
  const fallbackData: Celebrity[] = [
    {
      id: '1',
      name: 'Dwayne Johnson',
      dateOfBirth: '1972-05-02',
      profession: 'Actor, Producer',
      bio: 'American actor, producer, businessman and former professional wrestler',
      photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Dwayne_Johnson_2%2C_2013.jpg/440px-Dwayne_Johnson_2%2C_2013.jpg',
      nationality: 'American',
      quote: 'Success isn\'t always about greatness. It\'s about consistency.'
    },
    {
      id: '2',
      name: 'Roger Federer',
      dateOfBirth: '1981-08-08',
      profession: 'Tennis Player',
      bio: 'Swiss former professional tennis player',
      photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Roger_Federer_%2826876366866%29_%28cropped_2%29.jpg/440px-Roger_Federer_%2826876366866%29_%28cropped_2%29.jpg',
      nationality: 'Swiss',
      quote: 'I fear no one, but respect everyone.'
    },
    {
      id: '3',
      name: 'Barack Obama',
      dateOfBirth: '1961-08-04',
      profession: 'Politician',
      bio: '44th President of the United States',
      photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/President_Barack_Obama.jpg/440px-President_Barack_Obama.jpg',
      nationality: 'American',
      quote: 'Change will not come if we wait for some other person or some other time.'
    },
    {
      id: '4',
      name: 'Meghan Markle',
      dateOfBirth: '1981-08-04',
      profession: 'Actress, Duchess',
      bio: 'American actress and member of the British royal family',
      photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Meghan_Markle_and_Prince_Harry_in_Dublin_2018.jpg/440px-Meghan_Markle_and_Prince_Harry_in_Dublin_2018.jpg',
      nationality: 'American',
      quote: 'With fame comes opportunity, but it also includes responsibility.'
    },
    {
      id: '5',
      name: 'Charlize Theron',
      dateOfBirth: '1975-08-07',
      profession: 'Actress, Producer',
      bio: 'South African and American actress and producer',
      photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Charlize-theron-IMG_6045.jpg/440px-Charlize-theron-IMG_6045.jpg',
      nationality: 'South African',
      quote: 'I think that life is about growth. You continue to grow and evolve.'
    },
    {
      id: '6',
      name: 'Chris Hemsworth',
      dateOfBirth: '1983-08-11',
      profession: 'Actor',
      bio: 'Australian actor best known for playing Thor in the Marvel Cinematic Universe',
      photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Chris_Hemsworth_by_Gage_Skidmore_2_%28cropped%29.jpg/440px-Chris_Hemsworth_by_Gage_Skidmore_2_%28cropped%29.jpg',
      nationality: 'Australian',
      quote: 'The more conflict and contrast you have with a character, the more interesting.'
    },
    {
      id: '7',
      name: 'Halle Berry',
      dateOfBirth: '1966-08-14',
      profession: 'Actress',
      bio: 'American actress and former fashion model',
      photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Halle_Berry_by_Gage_Skidmore_3.jpg/440px-Halle_Berry_by_Gage_Skidmore_3.jpg',
      nationality: 'American',
      quote: 'I\'m done with trying to be perfect. A perfect body belongs to somebody else.'
    },
    {
      id: '8',
      name: 'Jennifer Lawrence',
      dateOfBirth: '1990-08-15',
      profession: 'Actress',
      bio: 'American actress known for The Hunger Games series',
      photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Jennifer_Lawrence_SDCC_2015_X-Men.jpg/440px-Jennifer_Lawrence_SDCC_2015_X-Men.jpg',
      nationality: 'American',
      quote: 'I\'m a woman that\'s living in this world of everybody telling everyone how they should look.'
    },
    {
      id: '9',
      name: 'Robert De Niro',
      dateOfBirth: '1943-08-17',
      profession: 'Actor',
      bio: 'American actor and producer regarded as one of the greatest actors of all time',
      photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Robert_De_Niro_Cannes_2016.jpg/440px-Robert_De_Niro_Cannes_2016.jpg',
      nationality: 'American',
      quote: 'The talent is in the choices.'
    },
    {
      id: '10',
      name: 'Madonna',
      dateOfBirth: '1958-08-16',
      profession: 'Singer, Actress',
      bio: 'American singer-songwriter and actress known as the "Queen of Pop"',
      photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Madonna_Rebel_Heart_Tour_2015_-_Stockholm_%2823051472299%29_%28cropped%29.jpg/440px-Madonna_Rebel_Heart_Tour_2015_-_Stockholm_%2823051472299%29_%28cropped%29.jpg',
      nationality: 'American',
      quote: 'I\'m tough, ambitious, and I know exactly what I want.'
    }
  ];

  // Filter by birth date if provided
  if (birthMonth && birthDay) {
    return fallbackData.filter(person => {
      const date = new Date(person.dateOfBirth);
      return date.getMonth() + 1 === birthMonth && date.getDate() === birthDay;
    });
  }

  return fallbackData;
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
