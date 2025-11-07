-- Extend explore_famous_birthdays table with additional columns for complete profile data
ALTER TABLE public.explore_famous_birthdays
ADD COLUMN IF NOT EXISTS slug text,
ADD COLUMN IF NOT EXISTS birthplace text,
ADD COLUMN IF NOT EXISTS birth_sign text,
ADD COLUMN IF NOT EXISTS excerpt text,
ADD COLUMN IF NOT EXISTS before_fame text,
ADD COLUMN IF NOT EXISTS trivia jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS family_life text,
ADD COLUMN IF NOT EXISTS associated_with text,
ADD COLUMN IF NOT EXISTS category_memberships jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS fans_also_viewed jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS meta_description text,
ADD COLUMN IF NOT EXISTS og_title text,
ADD COLUMN IF NOT EXISTS og_description text,
ADD COLUMN IF NOT EXISTS popularity_rank_overall integer,
ADD COLUMN IF NOT EXISTS popularity_rank_profession integer,
ADD COLUMN IF NOT EXISTS about_word_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS profile_complete boolean DEFAULT false;

-- Create index on slug for faster lookups
CREATE INDEX IF NOT EXISTS idx_explore_famous_birthdays_slug ON public.explore_famous_birthdays(slug);

-- Create index on profile_complete for auto-complete queries
CREATE INDEX IF NOT EXISTS idx_explore_famous_birthdays_profile_complete ON public.explore_famous_birthdays(profile_complete);

-- Function to calculate word count in about section
CREATE OR REPLACE FUNCTION calculate_about_word_count(bio_text text)
RETURNS integer
LANGUAGE plpgsql
AS $$
BEGIN
  IF bio_text IS NULL OR bio_text = '' THEN
    RETURN 0;
  END IF;
  RETURN array_length(regexp_split_to_array(trim(bio_text), '\s+'), 1);
END;
$$;

-- Function to validate and update profile completeness
CREATE OR REPLACE FUNCTION validate_celebrity_profile()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  word_count integer;
  is_complete boolean;
BEGIN
  -- Calculate word count
  word_count := calculate_about_word_count(NEW.bio);
  NEW.about_word_count := word_count;
  
  -- Check if profile is complete
  is_complete := (
    NEW.image_url IS NOT NULL AND NEW.image_url != '' AND
    NEW.bio IS NOT NULL AND word_count >= 500 AND
    NEW.name IS NOT NULL AND
    NEW.dob IS NOT NULL
  );
  
  NEW.profile_complete := is_complete;
  
  RETURN NEW;
END;
$$;

-- Create trigger to auto-validate profiles
DROP TRIGGER IF EXISTS check_profile_completeness ON public.explore_famous_birthdays;
CREATE TRIGGER check_profile_completeness
BEFORE INSERT OR UPDATE ON public.explore_famous_birthdays
FOR EACH ROW
EXECUTE FUNCTION validate_celebrity_profile();

-- Update existing records to calculate completeness
UPDATE public.explore_famous_birthdays
SET updated_at = now()
WHERE profile_complete IS NULL OR about_word_count IS NULL;