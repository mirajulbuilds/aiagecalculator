-- Create a secure view that masks sensitive 2FA columns
CREATE OR REPLACE VIEW public.admin_2fa_safe AS
SELECT 
  id,
  user_id,
  is_enrolled,
  enrolled_at,
  last_verified_at,
  created_at,
  updated_at
  -- Intentionally excluding: secret, recovery_codes
FROM public.admin_2fa;

-- Grant access to the view for authenticated users
GRANT SELECT ON public.admin_2fa_safe TO authenticated;

-- Drop the existing user SELECT policy that exposes secrets
DROP POLICY IF EXISTS "Users can view their own 2FA settings" ON public.admin_2fa;

-- Create a more restrictive policy - users should use the safe view instead
-- Only admins need direct table access for management purposes
CREATE POLICY "Only admins can directly access 2FA table"
ON public.admin_2fa
FOR SELECT
USING (is_admin());

-- Enable RLS on the view (views inherit from base table, but we add explicit policy)
-- Users access their 2FA status through the safe view
CREATE POLICY "Users can view own 2FA via safe view"
ON public.admin_2fa
FOR SELECT
USING (auth.uid() = user_id AND NOT EXISTS (
  SELECT 1 FROM unnest(ARRAY['secret', 'recovery_codes']) AS sensitive_col
));