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

// In-memory rate limiter
const rateLimits = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const limit = rateLimits.get(ip);
  
  // Allow 10 requests per minute per IP
  if (!limit || now > limit.resetTime) {
    rateLimits.set(ip, { count: 1, resetTime: now + 60000 });
    return true;
  }
  
  if (limit.count >= 10) {
    return false; // Rate limit exceeded
  }
  
  limit.count++;
  return true;
}

// Spam detection
function isSpamPattern(details: Record<string, any>): boolean {
  const detailsStr = JSON.stringify(details).toLowerCase();
  
  // Block common spam indicators
  const spamKeywords = ['viagra', 'casino', 'lottery', 'prize', 'winner', 'click here'];
  const hasSpamKeyword = spamKeywords.some(keyword => detailsStr.includes(keyword));
  
  // Block excessive URLs (more than 5)
  const urlCount = (detailsStr.match(/https?:\/\//g) || []).length;
  const hasExcessiveUrls = urlCount > 5;
  
  return hasSpamKeyword || hasExcessiveUrls;
}

// Input validation
function validateSecurityEvent(event: SecurityEvent): { valid: boolean; error?: string } {
  const MAX_DETAILS_SIZE = 5000; // 5KB limit
  
  // Validate event type
  const validEventTypes = ['auth_failure', 'rate_limit', 'csp_violation', 'suspicious_activity'];
  if (!validEventTypes.includes(event.event_type)) {
    return { valid: false, error: `Invalid event_type. Must be one of: ${validEventTypes.join(', ')}` };
  }
  
  // Validate severity
  const validSeverities = ['low', 'medium', 'high', 'critical'];
  if (event.severity && !validSeverities.includes(event.severity)) {
    return { valid: false, error: `Invalid severity. Must be one of: ${validSeverities.join(', ')}` };
  }
  
  // Validate details size
  const detailsSize = JSON.stringify(event.details).length;
  if (detailsSize > MAX_DETAILS_SIZE) {
    return { valid: false, error: `Event details too large (${detailsSize} bytes, max ${MAX_DETAILS_SIZE})` };
  }
  
  // Check for spam patterns
  if (isSpamPattern(event.details)) {
    return { valid: false, error: 'Spam pattern detected' };
  }
  
  return { valid: true };
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
  
  // Rate limiting check
  if (!checkRateLimit(clientIP)) {
    console.warn(`Rate limit exceeded for IP: ${clientIP}`);
    return new Response(
      JSON.stringify({ error: 'Rate limit exceeded. Maximum 10 requests per minute. Try again later.' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 429,
      }
    );
  }

  try {
    // Initialize Supabase client with service role key for logging
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get request details
    const userAgent = req.headers.get('user-agent') || 'unknown';

    // Handle CSP violation reports (sent as JSON with different content-type)
    if (req.headers.get('content-type')?.includes('application/csp-report') || 
        req.headers.get('content-type')?.includes('application/reports+json')) {
      
      const report = await req.json();
      console.log('CSP Violation Report received from:', clientIP);
      
      // Validate CSP report size (prevent abuse)
      const reportSize = JSON.stringify(report).length;
      if (reportSize > 10000) { // 10KB limit for CSP reports
        console.warn(`CSP report too large from ${clientIP}: ${reportSize} bytes`);
        return new Response(JSON.stringify({ error: 'Report too large' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        });
      }
      
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

    // Validate event
    const validation = validateSecurityEvent(event);
    if (!validation.valid) {
      console.warn(`Invalid security event from ${clientIP}: ${validation.error}`);
      return new Response(
        JSON.stringify({ error: validation.error }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
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
