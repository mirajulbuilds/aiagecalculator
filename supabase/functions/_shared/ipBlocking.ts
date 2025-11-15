// Shared IP blocking check for edge functions
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

/**
 * Check if an IP address is blocked
 * Returns true if blocked, false if allowed
 */
export async function checkIPBlocked(ipAddress: string): Promise<boolean> {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Supabase credentials not configured');
      return false; // Don't block if we can't check
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Use the database function to check if IP is blocked
    const { data, error } = await supabase.rpc('is_ip_blocked', {
      ip_addr: ipAddress
    });

    if (error) {
      console.error('Error checking IP block status:', error);
      return false; // Don't block on error
    }

    return data === true;
  } catch (error) {
    console.error('Exception checking IP block:', error);
    return false; // Don't block on exception
  }
}

/**
 * Log security event when blocked IP attempts access
 */
export async function logBlockedIPAttempt(ipAddress: string, functionName: string): Promise<void> {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) return;

    await fetch(`${supabaseUrl}/functions/v1/log-security-event`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({
        event_type: 'suspicious_activity',
        ip_address: ipAddress,
        details: {
          function_name: functionName,
          reason: 'Blocked IP attempted access',
          timestamp: new Date().toISOString()
        },
        severity: 'high'
      })
    });
  } catch (error) {
    console.error('Failed to log blocked IP attempt:', error);
  }
}
