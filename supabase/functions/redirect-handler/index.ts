import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;

// Helper function to log redirect for analytics
async function logRedirect(
  oldUrl: string,
  newUrl: string,
  redirectType: string,
  userAgent: string | null,
  ipAddress: string | null
) {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    await supabase.from('redirect_logs').insert({
      old_url: oldUrl,
      new_url: newUrl,
      redirect_type: redirectType,
      user_agent: userAgent,
      ip_address: ipAddress,
    });
    console.log('Redirect logged:', { oldUrl, newUrl, redirectType });
  } catch (error) {
    console.error('Failed to log redirect:', error);
    // Don't fail the redirect if logging fails
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const pathname = url.pathname;
    const userAgent = req.headers.get('user-agent');
    const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip');

    console.log('Redirect handler checking path:', pathname);

    // Handle /celebrity/* redirects (except /celebrity/preview)
    if (pathname.startsWith('/celebrity/') && pathname !== '/celebrity/preview') {
      const slug = pathname.replace('/celebrity/', '');
      const newUrl = `${url.origin}/people/${slug}`;
      
      console.log('Redirecting from:', pathname, 'to:', newUrl);
      
      // Log redirect for analytics (non-blocking)
      logRedirect(pathname, `/people/${slug}`, 'celebrity', userAgent, ipAddress);
      
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
      
      // Log redirect for analytics (non-blocking)
      logRedirect(pathname, `/people/${slug}`, 'famous-birthdays', userAgent, ipAddress);
      
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
