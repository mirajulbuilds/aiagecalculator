-- Remove the overly permissive INSERT policy that allows anyone to insert
-- Service role bypasses RLS, so it can still insert security logs
-- Regular users/anonymous users will be blocked
DROP POLICY IF EXISTS "Service role can insert security logs" ON public.security_logs;