-- Fix security warnings by setting search_path for functions

-- Update calculate_about_word_count function with proper search_path
CREATE OR REPLACE FUNCTION calculate_about_word_count(bio_text text)
RETURNS integer
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF bio_text IS NULL OR bio_text = '' THEN
    RETURN 0;
  END IF;
  RETURN array_length(regexp_split_to_array(trim(bio_text), '\s+'), 1);
END;
$$;

-- Update validate_celebrity_profile function with proper search_path
CREATE OR REPLACE FUNCTION validate_celebrity_profile()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
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