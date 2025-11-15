# IP Blocking Integration Guide

## Overview
The IP blocking system allows admins to manually block suspicious IP addresses from accessing edge functions. This guide shows how to integrate IP blocking into your edge functions.

## Components

### 1. Database Table: `blocked_ips`
Stores blocked IP addresses with:
- `ip_address`: The blocked IP
- `reason`: Why it was blocked
- `blocked_by`: Admin user who blocked it
- `expires_at`: Optional expiration date
- RLS policies ensure only admins can manage blocked IPs

### 2. Database Function: `is_ip_blocked(ip_addr TEXT)`
Fast lookup to check if an IP is blocked and not expired.

### 3. Shared Helper: `_shared/ipBlocking.ts`
Provides two functions:
- `checkIPBlocked(ipAddress: string)`: Returns true if IP is blocked
- `logBlockedIPAttempt(ipAddress, functionName)`: Logs the blocked attempt

### 4. Admin UI: `IPBlockingManager` component
Allows admins to:
- View all blocked IPs
- Block new IPs with reason and optional expiration
- Unblock IPs
- Quick-block from suspicious IP alerts

## Integration Steps

### Step 1: Import the IP blocking helper
```typescript
import { checkIPBlocked, logBlockedIPAttempt } from "../_shared/ipBlocking.ts";
```

### Step 2: Add IP block check BEFORE rate limiting
```typescript
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get client IP
    const clientIp = req.headers.get('x-forwarded-for') || 'unknown';

    // Check if IP is blocked (FIRST CHECK)
    const isBlocked = await checkIPBlocked(clientIp);
    if (isBlocked) {
      await logBlockedIPAttempt(clientIp, 'your-function-name');
      return new Response(
        JSON.stringify({ error: 'Access denied' }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Then check rate limiting
    if (!checkRateLimit(clientIp)) {
      // ... rate limit code
    }

    // Rest of your function logic
    // ...
  } catch (error) {
    // Error handling
  }
});
```

## Example: Complete Function with IP Blocking

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { checkIPBlocked, logBlockedIPAttempt } from "../_shared/ipBlocking.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 10;
const RATE_WINDOW = 60000;

function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + RATE_WINDOW });
    return true;
  }
  
  if (record.count >= RATE_LIMIT) return false;
  
  record.count++;
  return true;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const clientIp = req.headers.get('x-forwarded-for') || 'unknown';

    // 1. IP Block Check
    const isBlocked = await checkIPBlocked(clientIp);
    if (isBlocked) {
      await logBlockedIPAttempt(clientIp, 'my-function');
      return new Response(
        JSON.stringify({ error: 'Access denied' }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Rate Limit Check
    if (!checkRateLimit(clientIp)) {
      // Log rate limit violation
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      
      fetch(`${supabaseUrl}/functions/v1/log-security-event`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`
        },
        body: JSON.stringify({
          event_type: 'rate_limit',
          ip_address: clientIp,
          details: {
            function_name: 'my-function',
            timestamp: new Date().toISOString()
          },
          severity: 'medium'
        })
      }).catch(err => console.error('Failed to log rate limit:', err));

      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded' }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Your function logic here
    const { data } = await req.json();
    
    // Process request...
    
    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
```

## Admin Workflow

1. **Detection**: Admin sees suspicious IP in Security Monitoring (5+ violations in 1 hour)
2. **Quick Block**: Clicks "Block IP" button next to suspicious IP
3. **Configuration**: Fills in:
   - IP address (pre-filled)
   - Reason for blocking
   - Optional expiration date
4. **Activation**: IP is immediately blocked across all edge functions
5. **Monitoring**: Blocked access attempts are logged as "suspicious_activity"
6. **Unblocking**: Admin can unblock IPs from the IP Blocking tab

## Best Practices

1. **Always check IP blocking FIRST** before rate limiting
2. **Log blocked attempts** for audit trail
3. **Return 403 Forbidden** for blocked IPs (not 429)
4. **Don't reveal** that the IP is blocked (use generic "Access denied")
5. **Set expiration dates** for temporary blocks
6. **Document reasons** clearly for future reference
7. **Review blocked IPs** periodically to remove false positives

## Security Considerations

- IP blocking happens at the edge function level, not network level
- Determined attackers can use VPNs or proxies to bypass IP blocks
- Combine IP blocking with rate limiting for defense in depth
- Consider implementing CAPTCHA for suspected bot traffic
- Monitor for distributed attacks from multiple IPs
