-- Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Add admin-only policies for user_roles
CREATE POLICY "Admins can view all roles"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert roles"
  ON public.user_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles"
  ON public.user_roles
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Add audit and publishing fields to explore_famous_birthdays
ALTER TABLE public.explore_famous_birthdays
ADD COLUMN IF NOT EXISTS published BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id);

-- Update RLS policies for celebrity data
DROP POLICY IF EXISTS "Authenticated users can insert celebrities" ON public.explore_famous_birthdays;
DROP POLICY IF EXISTS "Authenticated users can update celebrities" ON public.explore_famous_birthdays;

CREATE POLICY "Admins can insert celebrities"
  ON public.explore_famous_birthdays
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update celebrities"
  ON public.explore_famous_birthdays
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete celebrities"
  ON public.explore_famous_birthdays
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Update public view policy to only show published celebrities
DROP POLICY IF EXISTS "Anyone can view celebrity data" ON public.explore_famous_birthdays;

CREATE POLICY "Anyone can view published celebrities"
  ON public.explore_famous_birthdays
  FOR SELECT
  USING (published = true OR public.has_role(auth.uid(), 'admin'));

-- Create storage bucket for celebrity images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'celebrity-images',
  'celebrity-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for celebrity images
CREATE POLICY "Anyone can view celebrity images"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'celebrity-images');

CREATE POLICY "Admins can upload celebrity images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'celebrity-images' 
    AND public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can update celebrity images"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'celebrity-images' 
    AND public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can delete celebrity images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'celebrity-images' 
    AND public.has_role(auth.uid(), 'admin')
  );