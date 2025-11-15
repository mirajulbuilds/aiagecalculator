-- Create a trigger function that calls the edge function to regenerate sitemap
CREATE OR REPLACE FUNCTION public.regenerate_sitemap()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  request_id bigint;
BEGIN
  -- Call the generate-sitemap edge function via pg_net
  SELECT net.http_post(
    url := 'https://ryetajignnzczcybyggr.supabase.co/functions/v1/generate-sitemap',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := '{}'::jsonb
  ) INTO request_id;
  
  RETURN NEW;
END;
$$;

-- Create trigger on celebrities table for INSERT, UPDATE, DELETE
DROP TRIGGER IF EXISTS trigger_regenerate_sitemap_on_insert ON public.celebrities;
CREATE TRIGGER trigger_regenerate_sitemap_on_insert
AFTER INSERT ON public.celebrities
FOR EACH ROW
EXECUTE FUNCTION public.regenerate_sitemap();

DROP TRIGGER IF EXISTS trigger_regenerate_sitemap_on_update ON public.celebrities;
CREATE TRIGGER trigger_regenerate_sitemap_on_update
AFTER UPDATE ON public.celebrities
FOR EACH ROW
EXECUTE FUNCTION public.regenerate_sitemap();

DROP TRIGGER IF EXISTS trigger_regenerate_sitemap_on_delete ON public.celebrities;
CREATE TRIGGER trigger_regenerate_sitemap_on_delete
AFTER DELETE ON public.celebrities
FOR EACH ROW
EXECUTE FUNCTION public.regenerate_sitemap();