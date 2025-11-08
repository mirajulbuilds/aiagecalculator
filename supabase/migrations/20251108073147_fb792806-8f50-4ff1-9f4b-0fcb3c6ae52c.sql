-- Delete all objects from the celebrity-images bucket first
DELETE FROM storage.objects WHERE bucket_id = 'celebrity-images';

-- Now drop the celebrity-images storage bucket
DELETE FROM storage.buckets WHERE id = 'celebrity-images';

-- Drop storage policies that depend on has_role function
DROP POLICY IF EXISTS "Admins can upload celebrity images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update celebrity images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete celebrity images" ON storage.objects;
DROP POLICY IF EXISTS "Celebrity images are publicly accessible" ON storage.objects;

-- Drop RLS policies from explore_famous_birthdays table
DROP POLICY IF EXISTS "Anyone can view published celebrities" ON public.explore_famous_birthdays;
DROP POLICY IF EXISTS "Admins can insert celebrities" ON public.explore_famous_birthdays;
DROP POLICY IF EXISTS "Admins can update celebrities" ON public.explore_famous_birthdays;
DROP POLICY IF EXISTS "Admins can delete celebrities" ON public.explore_famous_birthdays;

-- Drop RLS policies from user_roles table
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;

-- Drop triggers
DROP TRIGGER IF EXISTS update_explore_famous_birthdays_updated_at ON public.explore_famous_birthdays;
DROP TRIGGER IF EXISTS validate_profile_trigger ON public.explore_famous_birthdays;

-- Drop tables
DROP TABLE IF EXISTS public.explore_famous_birthdays CASCADE;
DROP TABLE IF EXISTS public.user_roles CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS public.calculate_about_word_count(text);
DROP FUNCTION IF EXISTS public.validate_celebrity_profile();
DROP FUNCTION IF EXISTS public.has_role(uuid, app_role);

-- Drop enum type
DROP TYPE IF EXISTS public.app_role CASCADE;