
-- Restrict admin_2fa SELECT to own row only
DROP POLICY IF EXISTS "Admins can view all 2FA status" ON public.admin_2fa;
DROP POLICY IF EXISTS "Only admins can directly access 2FA table" ON public.admin_2fa;

CREATE POLICY "Users can view their own 2FA record"
ON public.admin_2fa
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Deny UPDATE/DELETE on profile_generations to preserve audit trail
CREATE POLICY "Deny updates to generation logs"
ON public.profile_generations
FOR UPDATE
TO authenticated, anon
USING (false)
WITH CHECK (false);

CREATE POLICY "Deny deletes to generation logs"
ON public.profile_generations
FOR DELETE
TO authenticated, anon
USING (false);
