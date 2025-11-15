-- Create security_logs table for monitoring
CREATE TABLE IF NOT EXISTS public.security_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL CHECK (event_type IN ('auth_failure', 'rate_limit', 'csp_violation', 'suspicious_activity')),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address TEXT,
  user_agent TEXT,
  details JSONB,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add index for faster queries
CREATE INDEX idx_security_logs_event_type ON public.security_logs(event_type);
CREATE INDEX idx_security_logs_created_at ON public.security_logs(created_at DESC);
CREATE INDEX idx_security_logs_severity ON public.security_logs(severity);
CREATE INDEX idx_security_logs_user_id ON public.security_logs(user_id);

-- Enable RLS
ALTER TABLE public.security_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view security logs
CREATE POLICY "Admins can view all security logs"
ON public.security_logs
FOR SELECT
USING (public.is_admin());

-- Allow the service role to insert logs (via edge functions)
CREATE POLICY "Service role can insert security logs"
ON public.security_logs
FOR INSERT
WITH CHECK (true);

-- Create a function to clean up old logs (keep last 90 days)
CREATE OR REPLACE FUNCTION public.cleanup_old_security_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.security_logs
  WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$;

-- Add comment for documentation
COMMENT ON TABLE public.security_logs IS 'Stores security events for monitoring authentication failures, rate limits, and CSP violations';