-- 1. is_admin should include super_admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin')
$$;

-- 2. Celebrities: hide biometric face_embedding column from anon/authenticated
REVOKE SELECT ON public.celebrities FROM anon, authenticated;
GRANT SELECT (id, name, profile_image_url, main_content, profession, date_of_birth,
              place_of_birth, zodiac_sign, popularity_ranks, meta_title, meta_description,
              profile_slug, created_at, updated_at, known_for_data)
  ON public.celebrities TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.celebrities TO authenticated;
GRANT ALL ON public.celebrities TO service_role;

CREATE OR REPLACE FUNCTION public.get_celebrity_face_embedding(_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE v jsonb;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  SELECT face_embedding INTO v FROM public.celebrities WHERE id = _id;
  RETURN v;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_celebrities_without_embeddings(_limit integer DEFAULT 50)
RETURNS TABLE(id uuid, name text, profile_image_url text)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  RETURN QUERY
  SELECT c.id, c.name, c.profile_image_url
  FROM public.celebrities c
  WHERE c.face_embedding IS NULL
  ORDER BY c.name
  LIMIT _limit;
END;
$$;

-- 3. admin_2fa: no client reads at all (secrets server-side only)
DROP POLICY IF EXISTS "Users can view their own 2FA record" ON public.admin_2fa;

CREATE OR REPLACE FUNCTION public.get_admin_2fa_overview()
RETURNS TABLE(user_id uuid, is_enrolled boolean, enrolled_at timestamptz,
              last_verified_at timestamptz, created_at timestamptz, updated_at timestamptz)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  RETURN QUERY
  SELECT a.user_id, a.is_enrolled, a.enrolled_at, a.last_verified_at, a.created_at, a.updated_at
  FROM public.admin_2fa a;
END;
$$;

-- 4. Lock down SECURITY DEFINER function execution
REVOKE EXECUTE ON FUNCTION public.cleanup_expired_ip_blocks() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.cleanup_old_security_logs() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.regenerate_sitemap() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.regenerate_blog_sitemap() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_ip_blocked(text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.insert_redirect_log(text, text, text, text, text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.insert_gsc_submission_log(text, text, jsonb, text) FROM PUBLIC, anon, authenticated;

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_super_admin() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_my_2fa_status() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.log_admin_action(text, text, uuid, text, jsonb, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.reset_user_2fa(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_celebrities_by_birthday(integer, integer) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_celebrity_face_embedding(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_celebrities_without_embeddings(integer) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_admin_2fa_overview() FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_super_admin() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_my_2fa_status() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.log_admin_action(text, text, uuid, text, jsonb, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.reset_user_2fa(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_celebrities_by_birthday(integer, integer) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_celebrity_face_embedding(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_celebrities_without_embeddings(integer) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_admin_2fa_overview() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_ip_blocked(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.insert_redirect_log(text, text, text, text, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.insert_gsc_submission_log(text, text, jsonb, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.cleanup_expired_ip_blocks() TO service_role;
GRANT EXECUTE ON FUNCTION public.cleanup_old_security_logs() TO service_role;

-- 5. Storage: public buckets should not be listable
DROP POLICY IF EXISTS "Anyone can view celebrity images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view celebrity profile images" ON storage.objects;