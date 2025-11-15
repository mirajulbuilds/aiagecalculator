-- Update trigger function to regenerate the celebrity sitemap specifically
CREATE OR REPLACE FUNCTION public.regenerate_sitemap()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  request_id bigint;
BEGIN
  -- Call the generate-sitemap-celebrities edge function via pg_net
  SELECT net.http_post(
    url := 'https://ryetajignnzczcybyggr.supabase.co/functions/v1/generate-sitemap-celebrities',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := '{}'::jsonb
  ) INTO request_id;
  
  RETURN NEW;
END;
$$;