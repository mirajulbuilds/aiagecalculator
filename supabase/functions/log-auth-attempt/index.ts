import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.74.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://lovable.app',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Credentials': 'true'
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const origin = req.headers.get('origin') || req.headers.get('referer') || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';
    const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    
    const { email, success, reason } = await req.json();
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    // Determine event type and severity based on reason
    const isUnauthorizedDomain = reason && reason.includes('Unauthorized domain');
    const eventType = isUnauthorizedDomain ? 'unauthorized_domain_access' : 'auth_attempt';
    const severity = isUnauthorizedDomain ? 'critical' : (success ? 'low' : 'medium');
    
    const { error } = await supabase.from('security_logs').insert({
      event_type: eventType,
      severity: severity,
      ip_address: ipAddress,
      user_agent: userAgent,
      details: {
        email,
        origin,
        success,
        reason: reason || null,
        timestamp: new Date().toISOString()
      }
    });

    if (error) {
      console.error('Error logging auth attempt:', error);
    }
    
    return new Response(
      JSON.stringify({ logged: true }), 
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
    
  } catch (error) {
    console.error('Error in log-auth-attempt:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
