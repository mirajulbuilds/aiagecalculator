-- Revoke blanket EXECUTE from anon/authenticated on all internal helpers
REVOKE EXECUTE ON FUNCTION public.cleanup_expired_ip_blocks() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.cleanup_old_security_logs() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_ip_blocked(text) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.insert_redirect_log(text, text, text, text, text) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.regenerate_sitemap() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.regenerate_blog_sitemap() FROM anon, authenticated;

-- Admin-guarded helpers: signed-in only (each verifies the caller's role internally)
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_super_admin() FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_my_2fa_status() FROM anon;
REVOKE EXECUTE ON FUNCTION public.reset_user_2fa(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.log_admin_action(text, text, uuid, text, jsonb, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.insert_gsc_submission_log(text, text, jsonb, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_celebrity_face_embedding(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_celebrities_without_embeddings(integer) FROM anon;