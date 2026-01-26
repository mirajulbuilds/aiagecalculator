import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GoogleServiceAccount {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
}

async function getAccessToken(credentials: GoogleServiceAccount): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const expiry = now + 3600;

  const header = { alg: "RS256", typ: "JWT" };
  const claimSet = {
    iss: credentials.client_email,
    scope: "https://www.googleapis.com/auth/webmasters",
    aud: credentials.token_uri,
    exp: expiry,
    iat: now,
  };

  const encoder = new TextEncoder();
  const base64url = (data: string) => {
    return btoa(data).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  };

  const encodedHeader = base64url(JSON.stringify(header));
  const encodedClaims = base64url(JSON.stringify(claimSet));
  const signatureInput = `${encodedHeader}.${encodedClaims}`;

  const privateKey = credentials.private_key.replace(/\\n/g, '\n');
  const keyData = privateKey
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .replace(/\s/g, '');
  
  const binaryKey = Uint8Array.from(atob(keyData), c => c.charCodeAt(0));
  
  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    binaryKey,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    encoder.encode(signatureInput)
  );

  const signatureArray = Array.from(new Uint8Array(signature));
  const signatureString = String.fromCharCode(...signatureArray);
  const encodedSignature = base64url(signatureString);

  const jwt = `${signatureInput}.${encodedSignature}`;

  const tokenResponse = await fetch(credentials.token_uri, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  if (!tokenResponse.ok) {
    const error = await tokenResponse.text();
    throw new Error(`Failed to get access token: ${error}`);
  }

  const tokenData = await tokenResponse.json();
  return tokenData.access_token;
}

function sanitizeResponseMetadata(siteUrl: string, propertyType: string): Record<string, string> {
  return {
    siteUrl: siteUrl,
    propertyType: propertyType,
    timestamp: new Date().toISOString(),
    source: 'scheduled-refresh'
  };
}

async function submitSitemap(siteUrl: string, sitemapUrl: string, accessToken: string) {
  const encodedSiteUrl = encodeURIComponent(siteUrl);
  const encodedSitemapUrl = encodeURIComponent(sitemapUrl);
  
  const url = `https://www.googleapis.com/webmasters/v3/sites/${encodedSiteUrl}/sitemaps/${encodedSitemapUrl}`;
  
  console.log(`Submitting to GSC API: ${url}`);

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to submit sitemap: ${response.status} ${error}`);
  }

  return { success: true };
}

async function regenerateSitemap(supabaseUrl: string, functionName: string): Promise<boolean> {
  const url = `${supabaseUrl}/functions/v1/${functionName}`;
  console.log(`Regenerating sitemap: ${functionName}`);
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (!response.ok) {
      console.error(`Failed to regenerate ${functionName}: ${response.status}`);
      await response.text(); // Consume body
      return false;
    }
    
    await response.text(); // Consume body
    console.log(`Successfully regenerated: ${functionName}`);
    return true;
  } catch (error) {
    console.error(`Error regenerating ${functionName}:`, error);
    return false;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('=== Scheduled Sitemap Refresh Started ===');
  console.log(`Timestamp: ${new Date().toISOString()}`);

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  const baseUrl = Deno.env.get('SITE_BASE_URL') || 'https://aiagecalc.com';
  const siteUrl = 'sc-domain:aiagecalc.com';
  const propertyType = 'Domain';

  // Sitemap generators to call
  const sitemapGenerators = [
    'generate-sitemap-celebrities',
    'generate-sitemap-blog',
    'generate-sitemap-categories',
    'generate-sitemap-static',
    'generate-sitemap-index'
  ];

  // Sitemap URLs to submit to GSC
  const sitemapUrls = [
    `${baseUrl}/sitemap-index.xml`,
    `${baseUrl}/sitemap-celebrities.xml`,
    `${baseUrl}/sitemap-blog.xml`,
    `${baseUrl}/sitemap-categories.xml`,
    `${baseUrl}/sitemap-static.xml`
  ];

  const results: { step: string; success: boolean; error?: string }[] = [];

  try {
    // Phase 1: Regenerate all sitemaps
    console.log('--- Phase 1: Regenerating Sitemaps ---');
    for (const generator of sitemapGenerators) {
      const success = await regenerateSitemap(supabaseUrl, generator);
      results.push({ step: `regenerate-${generator}`, success });
    }

    // Phase 2: Submit to Google Search Console
    console.log('--- Phase 2: Submitting to GSC ---');
    
    const credentialsJson = Deno.env.get('GOOGLE_SEARCH_CONSOLE_CREDENTIALS');
    if (!credentialsJson) {
      throw new Error('GOOGLE_SEARCH_CONSOLE_CREDENTIALS not configured');
    }

    const credentials: GoogleServiceAccount = JSON.parse(credentialsJson);
    const accessToken = await getAccessToken(credentials);

    for (const sitemapUrl of sitemapUrls) {
      try {
        await submitSitemap(siteUrl, sitemapUrl, accessToken);
        results.push({ step: `submit-${sitemapUrl}`, success: true });
        console.log(`Successfully submitted: ${sitemapUrl}`);
        
        // Log successful submission
        await supabase.rpc('insert_gsc_submission_log', {
          p_sitemap_url: sitemapUrl,
          p_submission_status: 'success',
          p_response_data: sanitizeResponseMetadata(siteUrl, propertyType),
          p_error_message: null
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        results.push({ step: `submit-${sitemapUrl}`, success: false, error: errorMessage });
        console.error(`Failed to submit ${sitemapUrl}:`, errorMessage);
        
        // Log failed submission
        await supabase.rpc('insert_gsc_submission_log', {
          p_sitemap_url: sitemapUrl,
          p_submission_status: 'failed',
          p_response_data: sanitizeResponseMetadata(siteUrl, propertyType),
          p_error_message: errorMessage
        });
      }
    }

    console.log('=== Scheduled Sitemap Refresh Completed ===');
    console.log(`Results: ${JSON.stringify(results)}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        timestamp: new Date().toISOString(),
        results 
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in scheduled-sitemap-refresh:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: errorMessage,
        results 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
