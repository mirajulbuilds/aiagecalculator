-- Create blocked_ips table for IP address blocking
CREATE TABLE IF NOT EXISTS public.blocked_ips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address TEXT NOT NULL UNIQUE,
  reason TEXT NOT NULL,
  blocked_by UUID NOT NULL,
  blocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.blocked_ips ENABLE ROW LEVEL SECURITY;

-- Only admins can view blocked IPs
CREATE POLICY "Admins can view blocked IPs"
  ON public.blocked_ips
  FOR SELECT
  USING (is_admin());

-- Only admins can insert blocked IPs
CREATE POLICY "Admins can insert blocked IPs"
  ON public.blocked_ips
  FOR INSERT
  WITH CHECK (is_admin());

-- Only admins can delete blocked IPs (unblock)
CREATE POLICY "Admins can delete blocked IPs"
  ON public.blocked_ips
  FOR DELETE
  USING (is_admin());

-- Create index for fast IP lookup
CREATE INDEX idx_blocked_ips_ip_address ON public.blocked_ips(ip_address);
CREATE INDEX idx_blocked_ips_expires_at ON public.blocked_ips(expires_at) WHERE expires_at IS NOT NULL;

-- Function to check if an IP is blocked
CREATE OR REPLACE FUNCTION public.is_ip_blocked(ip_addr TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.blocked_ips
    WHERE ip_address = ip_addr
      AND (expires_at IS NULL OR expires_at > NOW())
  );
END;
$$;

-- Function to cleanup expired blocks (can be called by a cron job)
CREATE OR REPLACE FUNCTION public.cleanup_expired_ip_blocks()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.blocked_ips
  WHERE expires_at IS NOT NULL AND expires_at < NOW();
END;
$$;