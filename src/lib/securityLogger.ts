import { supabase } from "@/integrations/supabase/client";

export type SecurityEventType = 'auth_failure' | 'rate_limit' | 'csp_violation' | 'suspicious_activity';
export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';

interface LogSecurityEventParams {
  event_type: SecurityEventType;
  user_id?: string;
  details: Record<string, any>;
  severity?: SeverityLevel;
}

/**
 * Log a security event to the security monitoring system
 * This function is fire-and-forget and will not throw errors
 */
export const logSecurityEvent = async (params: LogSecurityEventParams): Promise<void> => {
  try {
    await supabase.functions.invoke('log-security-event', {
      body: {
        event_type: params.event_type,
        user_id: params.user_id,
        details: params.details,
        severity: params.severity || 'medium'
      }
    });
  } catch (error) {
    // Log to console but don't throw - logging failures shouldn't break the app
    console.error('Failed to log security event:', error);
  }
};

/**
 * Log an authentication failure
 */
export const logAuthFailure = (email: string, error: string) => {
  return logSecurityEvent({
    event_type: 'auth_failure',
    details: {
      email,
      error,
      timestamp: new Date().toISOString()
    },
    severity: 'medium'
  });
};

/**
 * Log suspicious activity
 */
export const logSuspiciousActivity = (description: string, details: Record<string, any>) => {
  return logSecurityEvent({
    event_type: 'suspicious_activity',
    details: {
      description,
      ...details,
      timestamp: new Date().toISOString()
    },
    severity: 'high'
  });
};
