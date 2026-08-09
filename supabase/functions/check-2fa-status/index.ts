import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.74.0";
import { isAllowedOrigin, parseOrigin } from "../_shared/allowedOrigins.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Credentials': 'true'
};


serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // SECURITY: Validate origin domain
    const originDomain = parseOrigin(req);
    console.log('🔍 Parsed origin domain:', originDomain);

    if (originDomain && !isAllowedOrigin(originDomain)) {
      console.error('❌ Blocked request from unauthorized domain:', originDomain);
      return new Response(
        JSON.stringify({ error: 'Authentication not allowed from this domain' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Service-role client: admin_2fa is intentionally unreadable from the browser
    const admin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user is admin or super_admin
    const { data: roleRows } = await admin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .in('role', ['admin', 'super_admin']);

    if (!roleRows || roleRows.length === 0) {
      console.log('ℹ️ User is not admin, returning non-admin status');
      return new Response(
        JSON.stringify({ 
          is_admin: false,
          is_enrolled: false,
          requires_enrollment: false
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get 2FA enrollment status (service role - no secret is returned)
    const { data: twoFAData, error: twoFAError } = await admin
      .from('admin_2fa')
      .select('is_enrolled, enrolled_at')
      .eq('user_id', user.id)
      .maybeSingle();

    if (twoFAError) {
      console.error('Error reading admin_2fa:', twoFAError);
    }


    const isEnrolled = twoFAData?.is_enrolled || false;

    const response = {
      is_admin: true,
      is_enrolled: isEnrolled,
      requires_enrollment: !isEnrolled,
      enrolled_at: twoFAData?.enrolled_at || null
    };

    console.log('✅ Returning admin status:', response);

    return new Response(
      JSON.stringify(response),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in check-2fa-status:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});