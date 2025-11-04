-- Create explore_famous_birthdays table
CREATE TABLE public.explore_famous_birthdays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  dob DATE NOT NULL,
  profession TEXT NOT NULL,
  famous_for TEXT,
  country TEXT,
  region_category TEXT CHECK (region_category IN ('Regional', 'Global')),
  bio TEXT,
  image_url TEXT,
  source_url TEXT,
  popularity_score INTEGER DEFAULT 50 CHECK (popularity_score >= 0 AND popularity_score <= 100),
  social_links JSONB DEFAULT '{}'::jsonb,
  today_trending BOOLEAN DEFAULT false,
  ai_summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(name, dob)
);

-- Enable Row Level Security
ALTER TABLE public.explore_famous_birthdays ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (celebrities are public data)
CREATE POLICY "Anyone can view celebrity data"
ON public.explore_famous_birthdays
FOR SELECT
TO public
USING (true);

-- Create policy for authenticated users to insert (for admin/data management)
CREATE POLICY "Authenticated users can insert celebrities"
ON public.explore_famous_birthdays
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Create policy for authenticated users to update
CREATE POLICY "Authenticated users can update celebrities"
ON public.explore_famous_birthdays
FOR UPDATE
TO authenticated
USING (true);

-- Create indexes for common queries
CREATE INDEX idx_famous_birthdays_dob ON public.explore_famous_birthdays(dob);
CREATE INDEX idx_famous_birthdays_country ON public.explore_famous_birthdays(country);
CREATE INDEX idx_famous_birthdays_region_category ON public.explore_famous_birthdays(region_category);
CREATE INDEX idx_famous_birthdays_popularity ON public.explore_famous_birthdays(popularity_score DESC);
CREATE INDEX idx_famous_birthdays_trending ON public.explore_famous_birthdays(today_trending) WHERE today_trending = true;

-- Create trigger for updated_at
CREATE TRIGGER update_explore_famous_birthdays_updated_at
BEFORE UPDATE ON public.explore_famous_birthdays
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();