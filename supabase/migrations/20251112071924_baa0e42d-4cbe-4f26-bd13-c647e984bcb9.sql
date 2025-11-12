-- Add known_for_data column to celebrities table for storing carousel data
ALTER TABLE public.celebrities 
ADD COLUMN known_for_data JSONB NULL;

COMMENT ON COLUMN public.celebrities.known_for_data IS 'JSON array storing "Known For" items (movies, TV shows, etc.) with title, imageURL, and year for the carousel display';