-- Create the celebrities table
CREATE TABLE public.celebrities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  profile_image_url TEXT NOT NULL,
  main_content TEXT NOT NULL,
  profession TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  place_of_birth TEXT,
  zodiac_sign TEXT,
  popularity_ranks JSONB,
  meta_title TEXT NOT NULL,
  meta_description TEXT NOT NULL,
  profile_slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.celebrities ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (celebrity profiles are public)
CREATE POLICY "Anyone can view celebrity profiles" 
ON public.celebrities 
FOR SELECT 
USING (true);

-- Create policy for authenticated admin insert
CREATE POLICY "Authenticated users can insert celebrities" 
ON public.celebrities 
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Create policy for authenticated admin update
CREATE POLICY "Authenticated users can update celebrities" 
ON public.celebrities 
FOR UPDATE 
TO authenticated
USING (true);

-- Create policy for authenticated admin delete
CREATE POLICY "Authenticated users can delete celebrities" 
ON public.celebrities 
FOR DELETE 
TO authenticated
USING (true);

-- Create index on profile_slug for fast lookups
CREATE INDEX idx_celebrities_profile_slug ON public.celebrities(profile_slug);

-- Create index on date_of_birth for birthday queries
CREATE INDEX idx_celebrities_date_of_birth ON public.celebrities(date_of_birth);

-- Create index on name for search functionality
CREATE INDEX idx_celebrities_name ON public.celebrities(name);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_celebrities_updated_at
BEFORE UPDATE ON public.celebrities
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();