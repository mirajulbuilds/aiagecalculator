-- Add unique constraint to slug column for upsert operations
ALTER TABLE public.explore_famous_birthdays 
ADD CONSTRAINT explore_famous_birthdays_slug_key UNIQUE (slug);