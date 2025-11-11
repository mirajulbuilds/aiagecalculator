-- Create a function to get celebrities by birth month and day
CREATE OR REPLACE FUNCTION public.get_celebrities_by_birthday(
  birth_month INTEGER,
  birth_day INTEGER
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  profile_slug TEXT,
  profession TEXT,
  date_of_birth DATE,
  profile_image_url TEXT,
  popularity_ranks JSONB,
  place_of_birth TEXT,
  zodiac_sign TEXT,
  meta_title TEXT,
  meta_description TEXT,
  main_content TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.name,
    c.profile_slug,
    c.profession,
    c.date_of_birth,
    c.profile_image_url,
    c.popularity_ranks,
    c.place_of_birth,
    c.zodiac_sign,
    c.meta_title,
    c.meta_description,
    c.main_content,
    c.created_at,
    c.updated_at
  FROM public.celebrities c
  WHERE 
    EXTRACT(MONTH FROM c.date_of_birth) = birth_month 
    AND EXTRACT(DAY FROM c.date_of_birth) = birth_day;
END;
$$;