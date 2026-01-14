-- Drop the admin_2fa_safe view as it's redundant and flagged as insecure
-- Admin 2FA management uses SECURITY DEFINER functions instead
DROP VIEW IF EXISTS public.admin_2fa_safe;