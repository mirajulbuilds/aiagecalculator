-- Deny anonymous access to security_logs
CREATE POLICY "Deny anonymous access"
ON public.security_logs
FOR ALL
TO anon
USING (false);

-- Deny anonymous access to admin_2fa
CREATE POLICY "Deny anonymous access"
ON public.admin_2fa
FOR ALL
TO anon
USING (false);

-- Deny anonymous access to blocked_ips
CREATE POLICY "Deny anonymous access"
ON public.blocked_ips
FOR ALL
TO anon
USING (false);

-- Deny anonymous access to admin_audit_logs
CREATE POLICY "Deny anonymous access"
ON public.admin_audit_logs
FOR ALL
TO anon
USING (false);