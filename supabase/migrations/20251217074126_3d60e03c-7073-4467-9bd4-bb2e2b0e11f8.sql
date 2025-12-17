-- Fix: Set the view to use SECURITY INVOKER (safer - uses querying user's permissions)
ALTER VIEW public.admin_2fa_safe SET (security_invoker = on);