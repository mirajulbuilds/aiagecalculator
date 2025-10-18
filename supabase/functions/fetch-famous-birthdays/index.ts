import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WikidataPerson {
  name: string;
  dateOfBirth: string;
  occupation: string[];
  nationality: string;
  description: string;
  wikipediaUrl?: string;
  imageUrl?: string;
  aiFunFact?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { birthMonth, birthDay, userRegion } = await req.json();

    console.log(`Fetching famous people born on ${birthMonth}-${birthDay}`);

    // Query Wikidata for people born on this date (reduced limit for faster response)
    const wikidataQuery = `
      SELECT DISTINCT ?person ?personLabel ?birth ?occupationLabel ?countryLabel ?description ?image WHERE {
        ?person wdt:P31 wd:Q5;
                wdt:P569 ?birth.
        FILTER(MONTH(?birth) = ${birthMonth} && DAY(?birth) = ${birthDay})
        OPTIONAL { ?person wdt:P106 ?occupation. }
        OPTIONAL { ?person wdt:P27 ?country. }
        OPTIONAL { ?person wdt:P18 ?image. }
        OPTIONAL { 
          ?person schema:description ?description.
          FILTER(LANG(?description) = "en")
        }
        SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
      }
      LIMIT 50
    `;

    const wikidataUrl = `https://query.wikidata.org/sparql?query=${encodeURIComponent(wikidataQuery)}&format=json`;
    
    // Add timeout and retry logic for Wikidata API
    let wikidataData;
    let lastError;
    const maxRetries = 2;
    const timeoutMs = 15000; // 15 second timeout per attempt
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
        
        const wikidataResponse = await fetch(wikidataUrl, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'FamousBirthdayApp/1.0'
          },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);

        if (!wikidataResponse.ok) {
          throw new Error(`Wikidata API error: ${wikidataResponse.status}`);
        }

        wikidataData = await wikidataResponse.json();
        break; // Success, exit retry loop
      } catch (error) {
        lastError = error;
        console.log(`Attempt ${attempt + 1} failed:`, error instanceof Error ? error.message : 'Unknown error');
        
        if (attempt < maxRetries) {
          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        }
      }
    }
    
    // If all retries failed, use AI fallback to generate celebrity data
    if (!wikidataData) {
      console.error('All Wikidata API attempts failed, using AI fallback:', lastError);
      
      const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
      if (LOVABLE_API_KEY) {
        try {
          const aiPrompt = `List 5 famous people born on ${["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][birthMonth]} ${birthDay}. For each person provide: full name, birth year, main occupation(s), nationality, and a brief description (1 sentence). Format as JSON array with fields: name, dateOfBirth (YYYY-MM-DD format), occupation (array), nationality, description.`;
          
          const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${LOVABLE_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'google/gemini-2.5-flash',
              messages: [
                { role: 'system', content: 'You are a helpful assistant that provides accurate historical information about famous people. Always respond with valid JSON.' },
                { role: 'user', content: aiPrompt }
              ],
            }),
          });

          if (aiResponse.ok) {
            const aiData = await aiResponse.json();
            const content = aiData.choices?.[0]?.message?.content;
            if (content) {
              // Extract JSON from response (handle markdown code blocks)
              let jsonStr = content.trim();
              if (jsonStr.startsWith('```json')) {
                jsonStr = jsonStr.slice(7);
              }
              if (jsonStr.startsWith('```')) {
                jsonStr = jsonStr.slice(3);
              }
              if (jsonStr.endsWith('```')) {
                jsonStr = jsonStr.slice(0, -3);
              }
              
              const aiPeople = JSON.parse(jsonStr.trim());
              
              return new Response(
                JSON.stringify({ 
                  global: aiPeople,
                  regional: [],
                  source: 'ai-fallback',
                  timestamp: new Date().toISOString()
                }),
                { 
                  headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                  status: 200
                }
              );
            }
          }
        } catch (aiError) {
          console.error('AI fallback also failed:', aiError);
        }
      }
      
      // If AI fallback also fails, return empty
      return new Response(
        JSON.stringify({ 
          global: [],
          regional: [],
          error: 'Unable to fetch celebrity data at this time. Please try again later.',
          source: 'all-failed',
          timestamp: new Date().toISOString()
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    }
    console.log(`Found ${wikidataData.results.bindings.length} people from Wikidata`);

    // Process and structure the data
    const peopleMap = new Map<string, WikidataPerson>();
    
    for (const binding of wikidataData.results.bindings) {
      const personId = binding.person.value;
      const name = binding.personLabel.value;
      
      if (!peopleMap.has(personId)) {
        peopleMap.set(personId, {
          name,
          dateOfBirth: binding.birth.value,
          occupation: [],
          nationality: binding.countryLabel?.value || '',
          description: binding.description?.value || '',
          imageUrl: binding.image?.value,
          wikipediaUrl: `https://en.wikipedia.org/wiki/${encodeURIComponent(name.replace(/ /g, '_'))}`
        });
      }
      
      // Add occupation if present
      if (binding.occupationLabel?.value) {
        const person = peopleMap.get(personId)!;
        if (!person.occupation.includes(binding.occupationLabel.value)) {
          person.occupation.push(binding.occupationLabel.value);
        }
      }
    }

    let people = Array.from(peopleMap.values());
    
    // Sort by birth year (older first) and limit to most notable
    people.sort((a, b) => {
      const yearA = new Date(a.dateOfBirth).getFullYear();
      const yearB = new Date(b.dateOfBirth).getFullYear();
      return yearA - yearB;
    });

    // Separate into regional and global
    const regional = userRegion 
      ? people.filter(p => p.nationality.toLowerCase().includes(userRegion.toLowerCase())).slice(0, 5)
      : [];
    
    const global = people.slice(0, 5);

    // Enhance with AI-generated fun facts (for top 3 global celebrities)
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (LOVABLE_API_KEY && global.length > 0) {
      console.log('Enhancing top celebrities with AI fun facts...');
      
      for (let i = 0; i < Math.min(3, global.length); i++) {
        try {
          const person = global[i];
          const aiPrompt = `Generate a single interesting and lesser-known fun fact about ${person.name} (${person.occupation.join(', ')}). Keep it under 30 words, fascinating, and appropriate for all ages. Start directly with the fact, no introduction.`;
          
          const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${LOVABLE_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'google/gemini-2.5-flash',
              messages: [
                { role: 'system', content: 'You are a helpful assistant that provides interesting facts about famous people.' },
                { role: 'user', content: aiPrompt }
              ],
            }),
          });

          if (aiResponse.ok) {
            const aiData = await aiResponse.json();
            const funFact = aiData.choices?.[0]?.message?.content;
            if (funFact) {
              global[i] = { ...person, aiFunFact: funFact };
            }
          }
        } catch (error) {
          console.error(`Error generating fun fact for ${global[i].name}:`, error);
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        global,
        regional,
        source: 'wikidata',
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in fetch-famous-birthdays:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        global: [],
        regional: []
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
