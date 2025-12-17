-- Remove the ineffective policy that tries to filter columns (which doesn't work in RLS)
DROP POLICY IF EXISTS "Users can view own 2FA via safe view" ON public.admin_2fa;

-- Users should ONLY access their 2FA status through the admin_2fa_safe view
-- The view already excludes secret and recovery_codes columns
-- Admins can access the table directly for management (existing policy)