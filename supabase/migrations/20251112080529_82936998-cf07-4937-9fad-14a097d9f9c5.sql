-- Add face_embedding column to celebrities table
ALTER TABLE public.celebrities 
ADD COLUMN face_embedding JSONB;

COMMENT ON COLUMN public.celebrities.face_embedding IS 'AI-generated face embedding vector for celebrity look-alike matching';