-- Remove user direct access policies from admin_2fa table
-- All 2FA operations should go through edge functions (using service role)
DROP POLICY IF EXISTS "Users can update their own 2FA settings" ON public.admin_2fa;
DROP POLICY IF EXISTS "Users can insert their own 2FA settings" ON public.admin_2fa;

-- The admin_2fa_safe is a VIEW, not a table, so we need to handle it correctly
-- Views inherit security from underlying tables when using SECURITY INVOKER
-- The view was already set to SECURITY INVOKER, which means:
-- - Access is controlled by the admin_2fa table's RLS policies
-- - Since we removed user SELECT policies, users can't access via the view either

-- Create a SECURITY DEFINER function for users to safely check their own 2FA status
-- This function only returns non-sensitive enrollment information
CREATE OR REPLACE FUNCTION public.get_my_2fa_status()
RETURNS TABLE (
  is_enrolled boolean,
  enrolled_at timestamp with time zone,
  last_verified_at timestamp with time zone
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    is_enrolled,
    enrolled_at,
    last_verified_at
  FROM public.admin_2fa
  WHERE user_id = auth.uid()
  LIMIT 1;
$$;