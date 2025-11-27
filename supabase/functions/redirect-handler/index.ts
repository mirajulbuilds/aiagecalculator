import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const pathname = url.pathname;

    console.log('Redirect handler checking path:', pathname);

    // Handle /celebrity/* redirects (except /celebrity/preview)
    if (pathname.startsWith('/celebrity/') && pathname !== '/celebrity/preview') {
      const slug = pathname.replace('/celebrity/', '');
      const newUrl = `${url.origin}/people/${slug}`;
      
      console.log('Redirecting from:', pathname, 'to:', newUrl);
      
      return new Response(null, {
        status: 301,
        headers: {
          ...corsHeaders,
          'Location': newUrl,
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    }

    // Handle /famous-birthdays/* redirects (person pages only, not the main directory)
    if (pathname.startsWith('/famous-birthdays/') && pathname !== '/famous-birthdays' && pathname !== '/famous-birthdays/') {
      const slug = pathname.replace('/famous-birthdays/', '');
      const newUrl = `${url.origin}/people/${slug}`;
      
      console.log('Redirecting from:', pathname, 'to:', newUrl);
      
      return new Response(null, {
        status: 301,
        headers: {
          ...corsHeaders,
          'Location': newUrl,
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    }

    // No redirect needed
    return new Response(
      JSON.stringify({ message: 'No redirect needed' }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Redirect handler error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
