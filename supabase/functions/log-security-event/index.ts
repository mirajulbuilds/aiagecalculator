import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.74.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SecurityEvent {
  event_type: 'auth_failure' | 'rate_limit' | 'csp_violation' | 'suspicious_activity';
  user_id?: string;
  ip_address?: string;
  user_agent?: string;
  details: Record<string, any>;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role key for logging
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get request details
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    // Handle CSP violation reports (sent as JSON with different content-type)
    if (req.headers.get('content-type')?.includes('application/csp-report') || 
        req.headers.get('content-type')?.includes('application/reports+json')) {
      
      const report = await req.json();
      console.log('CSP Violation Report:', report);
      
      // Extract CSP violation details
      const cspReport = report['csp-report'] || report;
      
      const { error: logError } = await supabase
        .from('security_logs')
        .insert({
          event_type: 'csp_violation',
          ip_address: clientIP,
          user_agent: userAgent,
          severity: 'medium',
          details: {
            blocked_uri: cspReport['blocked-uri'] || cspReport.blockedURI,
            violated_directive: cspReport['violated-directive'] || cspReport.violatedDirective,
            document_uri: cspReport['document-uri'] || cspReport.documentURI,
            original_policy: cspReport['original-policy'] || cspReport.originalPolicy,
            source_file: cspReport['source-file'] || cspReport.sourceFile,
            line_number: cspReport['line-number'] || cspReport.lineNumber,
          }
        });

      if (logError) {
        console.error('Failed to log CSP violation:', logError);
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // Handle regular security events
    const event: SecurityEvent = await req.json();

    // Validate event type
    const validEventTypes = ['auth_failure', 'rate_limit', 'csp_violation', 'suspicious_activity'];
    if (!validEventTypes.includes(event.event_type)) {
      throw new Error(`Invalid event_type. Must be one of: ${validEventTypes.join(', ')}`);
    }

    // Validate severity
    const validSeverities = ['low', 'medium', 'high', 'critical'];
    if (event.severity && !validSeverities.includes(event.severity)) {
      throw new Error(`Invalid severity. Must be one of: ${validSeverities.join(', ')}`);
    }

    // Insert security log
    const { error: insertError } = await supabase
      .from('security_logs')
      .insert({
        event_type: event.event_type,
        user_id: event.user_id || null,
        ip_address: event.ip_address || clientIP,
        user_agent: event.user_agent || userAgent,
        details: event.details,
        severity: event.severity || 'medium',
      });

    if (insertError) {
      console.error('Failed to insert security log:', insertError);
      throw insertError;
    }

    console.log(`Security event logged: ${event.event_type} - Severity: ${event.severity || 'medium'}`);

    return new Response(
      JSON.stringify({ success: true, message: 'Security event logged successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in log-security-event function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
