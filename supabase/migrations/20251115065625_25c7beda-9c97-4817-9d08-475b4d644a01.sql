-- Create table to track admin 2FA enrollment and store recovery codes
CREATE TABLE public.admin_2fa (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  is_enrolled boolean NOT NULL DEFAULT false,
  secret text,
  recovery_codes text[], -- Encrypted recovery codes
  enrolled_at timestamp with time zone,
  last_verified_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_2fa ENABLE ROW LEVEL SECURITY;

-- Users can only view and manage their own 2FA settings
CREATE POLICY "Users can view their own 2FA settings"
ON public.admin_2fa FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own 2FA settings"
ON public.admin_2fa FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own 2FA settings"
ON public.admin_2fa FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Admins can view all 2FA enrollment status (for security monitoring)
CREATE POLICY "Admins can view all 2FA status"
ON public.admin_2fa FOR SELECT
TO authenticated
USING (is_admin());

-- Index for performance
CREATE INDEX idx_admin_2fa_user ON public.admin_2fa(user_id);
CREATE INDEX idx_admin_2fa_enrolled ON public.admin_2fa(is_enrolled);

-- Trigger to update updated_at
CREATE TRIGGER update_admin_2fa_updated_at
BEFORE UPDATE ON public.admin_2fa
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();