-- Create function to regenerate blog sitemap
CREATE OR REPLACE FUNCTION public.regenerate_blog_sitemap()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  request_id bigint;
BEGIN
  -- Call the generate-sitemap-blog edge function via pg_net
  SELECT net.http_post(
    url := 'https://ryetajignnzczcybyggr.supabase.co/functions/v1/generate-sitemap-blog',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := '{}'::jsonb
  ) INTO request_id;
  
  RETURN NEW;
END;
$$;

-- Create trigger to automatically regenerate blog sitemap on changes
CREATE TRIGGER trigger_regenerate_blog_sitemap
  AFTER INSERT OR UPDATE OR DELETE ON public.blog_posts
  FOR EACH STATEMENT
  EXECUTE FUNCTION public.regenerate_blog_sitemap();

-- Add comment to document the trigger
COMMENT ON TRIGGER trigger_regenerate_blog_sitemap ON public.blog_posts IS 
  'Automatically regenerates the blog sitemap whenever blog posts are added, updated, deleted, or published';

COMMENT ON FUNCTION public.regenerate_blog_sitemap() IS 
  'Triggers regeneration of the blog sitemap by calling the generate-sitemap-blog edge function';