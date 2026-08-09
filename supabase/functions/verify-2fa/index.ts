import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.74.0";
import * as OTPAuth from "https://esm.sh/otpauth@9.1.4";
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
    const origin = req.headers.get('origin') || req.headers.get('referer') || '';
    let originDomain = '';
    try {
      originDomain = new URL(origin).origin;
    } catch {
      originDomain = '';
    }
    
    if (!isAllowedOrigin(originDomain)) {
      console.error('Blocked request from unauthorized domain:', originDomain);
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

    const { code, isEnrollment, recoveryCode } = await req.json();

    if (!code && !recoveryCode) {
      return new Response(
        JSON.stringify({ error: 'Verification code or recovery code required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user's 2FA settings
    const { data: twoFAData, error: twoFAError } = await supabase
      .from('admin_2fa')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (twoFAError || !twoFAData || !twoFAData.secret) {
      return new Response(
        JSON.stringify({ error: '2FA not initialized' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let isValid = false;

    // Check recovery code first if provided
    if (recoveryCode) {
      const recoveryCodes = twoFAData.recovery_codes || [];
      isValid = recoveryCodes.includes(recoveryCode);

      if (isValid) {
        // Remove used recovery code
        const updatedCodes = recoveryCodes.filter((c: string) => c !== recoveryCode);
        await supabase
          .from('admin_2fa')
          .update({ 
            recovery_codes: updatedCodes,
            last_verified_at: new Date().toISOString()
          })
          .eq('user_id', user.id);
      }
    } else {
      // Verify TOTP code
      const secret = OTPAuth.Secret.fromBase32(twoFAData.secret);
      const totp = new OTPAuth.TOTP({
        issuer: 'AgeCalculator Admin',
        label: user.email || 'Admin User',
        algorithm: 'SHA1',
        digits: 6,
        period: 30,
        secret: secret,
      });

      // Verify with window of 1 (allows codes from previous/next 30s window)
      const delta = totp.validate({ token: code, window: 1 });
      isValid = delta !== null;

      if (isValid) {
        await supabase
          .from('admin_2fa')
          .update({ last_verified_at: new Date().toISOString() })
          .eq('user_id', user.id);
      }
    }

    if (!isValid) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid verification code',
          valid: false 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If this is enrollment verification, mark as enrolled
    if (isEnrollment) {
      await supabase
        .from('admin_2fa')
        .update({ 
          is_enrolled: true,
          enrolled_at: new Date().toISOString()
        })
        .eq('user_id', user.id);
    }

    return new Response(
      JSON.stringify({ 
        valid: true,
        message: isEnrollment ? '2FA successfully enrolled' : '2FA verified'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in verify-2fa:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});