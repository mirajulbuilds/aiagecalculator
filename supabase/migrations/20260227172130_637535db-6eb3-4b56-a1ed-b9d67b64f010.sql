
-- Update the handle_new_user() trigger to extract display_name and date_of_birth from user metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, display_name, date_of_birth)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'display_name',
    CASE 
      WHEN NEW.raw_user_meta_data ->> 'date_of_birth' IS NOT NULL 
        AND NEW.raw_user_meta_data ->> 'date_of_birth' != ''
      THEN (NEW.raw_user_meta_data ->> 'date_of_birth')::date
      ELSE NULL
    END
  );
  RETURN NEW;
END;
$function$;
