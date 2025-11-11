-- Create storage bucket for celebrity profile images
INSERT INTO storage.buckets (id, name, public)
VALUES ('celebrity-profiles', 'celebrity-profiles', true);

-- Create RLS policy for public read access
CREATE POLICY "Anyone can view celebrity profile images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'celebrity-profiles');

-- Create RLS policy for authenticated users to upload
CREATE POLICY "Authenticated users can upload celebrity profile images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'celebrity-profiles');

-- Create RLS policy for authenticated users to update
CREATE POLICY "Authenticated users can update celebrity profile images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'celebrity-profiles');

-- Create RLS policy for authenticated users to delete
CREATE POLICY "Authenticated users can delete celebrity profile images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'celebrity-profiles');