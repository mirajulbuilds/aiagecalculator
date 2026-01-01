-- Drop existing overly permissive storage policies
DROP POLICY IF EXISTS "Authenticated users can upload celebrity profile images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update celebrity profile images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete celebrity profile images" ON storage.objects;

-- Create admin-only policies for write operations
CREATE POLICY "Admins can upload celebrity profile images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'celebrity-profiles' AND public.is_admin());

CREATE POLICY "Admins can update celebrity profile images"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'celebrity-profiles' AND public.is_admin());

CREATE POLICY "Admins can delete celebrity profile images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'celebrity-profiles' AND public.is_admin());