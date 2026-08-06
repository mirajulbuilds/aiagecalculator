CREATE TABLE public.celebrity_face_embeddings (
  celebrity_id uuid PRIMARY KEY REFERENCES public.celebrities(id) ON DELETE CASCADE,
  embedding jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.celebrity_face_embeddings TO authenticated;
GRANT ALL ON public.celebrity_face_embeddings TO service_role;

ALTER TABLE public.celebrity_face_embeddings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view face embeddings"
  ON public.celebrity_face_embeddings FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can insert face embeddings"
  ON public.celebrity_face_embeddings FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update face embeddings"
  ON public.celebrity_face_embeddings FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins can delete face embeddings"
  ON public.celebrity_face_embeddings FOR DELETE TO authenticated USING (public.is_admin());
CREATE POLICY "Deny anonymous access"
  ON public.celebrity_face_embeddings AS RESTRICTIVE FOR ALL TO anon USING (false);

CREATE TRIGGER update_celebrity_face_embeddings_updated_at
  BEFORE UPDATE ON public.celebrity_face_embeddings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.celebrity_face_embeddings (celebrity_id, embedding)
SELECT id, face_embedding FROM public.celebrities WHERE face_embedding IS NOT NULL
ON CONFLICT (celebrity_id) DO NOTHING;

ALTER TABLE public.celebrities DROP COLUMN face_embedding;

-- restore normal table-level grants now that the biometric column is gone
GRANT SELECT ON public.celebrities TO anon, authenticated;

-- refresh admin helpers to read the new table
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
  SELECT embedding INTO v FROM public.celebrity_face_embeddings WHERE celebrity_id = _id;
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
  LEFT JOIN public.celebrity_face_embeddings e ON e.celebrity_id = c.id
  WHERE e.celebrity_id IS NULL
  ORDER BY c.name
  LIMIT _limit;
END;
$$;