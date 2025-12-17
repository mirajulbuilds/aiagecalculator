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
  const expiry = now + 3600; // 1 hour

  const header = {
    alg: "RS256",
    typ: "JWT",
  };

  const claimSet = {
    iss: credentials.client_email,
    scope: "https://www.googleapis.com/auth/webmasters",
    aud: credentials.token_uri,
    exp: expiry,
    iat: now,
  };

  const encoder = new TextEncoder();
  const base64url = (data: string) => {
    return btoa(data)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  };

  const encodedHeader = base64url(JSON.stringify(header));
  const encodedClaims = base64url(JSON.stringify(claimSet));
  const signatureInput = `${encodedHeader}.${encodedClaims}`;

  // Import the private key
  const privateKey = credentials.private_key.replace(/\\n/g, '\n');
  const keyData = privateKey
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .replace(/\s/g, '');
  
  const binaryKey = Uint8Array.from(atob(keyData), c => c.charCodeAt(0));
  
  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    binaryKey,
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-256',
    },
    false,
    ['sign']
  );

  // Sign the JWT
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    encoder.encode(signatureInput)
  );

  const signatureArray = Array.from(new Uint8Array(signature));
  const signatureString = String.fromCharCode(...signatureArray);
  const encodedSignature = base64url(signatureString);

  const jwt = `${signatureInput}.${encodedSignature}`;

  // Exchange JWT for access token
  const tokenResponse = await fetch(credentials.token_uri, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
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

// Sanitize response data to only include safe metadata (no tokens, keys, or sensitive info)
function sanitizeResponseMetadata(siteUrl: string, propertyType: string): Record<string, string> {
  return {
    siteUrl: siteUrl,
    propertyType: propertyType,
    timestamp: new Date().toISOString()
  };
}

async function submitSitemap(siteUrl: string, sitemapUrl: string, accessToken: string) {
  const encodedSiteUrl = encodeURIComponent(siteUrl);
  const encodedSitemapUrl = encodeURIComponent(sitemapUrl);
  
  const url = `https://www.googleapis.com/webmasters/v3/sites/${encodedSiteUrl}/sitemaps/${encodedSitemapUrl}`;
  
  console.log(`Submitting to GSC API: ${url}`);
  console.log(`Site URL format: ${siteUrl}`);

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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sitemapUrls, submittedBy } = await req.json();
    
    // Initialize Supabase client for logging
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    if (!sitemapUrls || !Array.isArray(sitemapUrls)) {
      return new Response(
        JSON.stringify({ error: 'sitemapUrls array is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const credentialsJson = Deno.env.get('GOOGLE_SEARCH_CONSOLE_CREDENTIALS');
    if (!credentialsJson) {
      throw new Error('GOOGLE_SEARCH_CONSOLE_CREDENTIALS not configured');
    }

    const credentials: GoogleServiceAccount = JSON.parse(credentialsJson);
    const accessToken = await getAccessToken(credentials);
    
    const siteUrl = 'sc-domain:aiagecalc.com';
    const propertyType = 'Domain';
    const results = [];

    for (const sitemapUrl of sitemapUrls) {
      try {
        await submitSitemap(siteUrl, sitemapUrl, accessToken);
        results.push({ sitemapUrl, success: true });
        console.log(`Successfully submitted sitemap: ${sitemapUrl}`);
        
        // Log successful submission with sanitized metadata only (no raw API response data)
        await supabase.from('gsc_submission_logs').insert({
          sitemap_url: sitemapUrl,
          submission_status: 'success',
          submitted_by: submittedBy || null,
          response_data: sanitizeResponseMetadata(siteUrl, propertyType)
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        results.push({ sitemapUrl, success: false, error: errorMessage });
        console.error(`Failed to submit sitemap ${sitemapUrl}:`, errorMessage);
        
        // Log failed submission with sanitized metadata only (no raw API response data)
        await supabase.from('gsc_submission_logs').insert({
          sitemap_url: sitemapUrl,
          submission_status: 'failed',
          error_message: errorMessage,
          submitted_by: submittedBy || null,
          response_data: sanitizeResponseMetadata(siteUrl, propertyType)
        });
      }
    }

    return new Response(
      JSON.stringify({ results }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in submit-sitemap-to-gsc:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
