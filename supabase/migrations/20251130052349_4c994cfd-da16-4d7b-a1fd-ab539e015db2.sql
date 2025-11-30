-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_regenerate_celebrity_sitemap ON public.celebrities;

-- Create trigger to automatically regenerate celebrity sitemap on changes
CREATE TRIGGER trigger_regenerate_celebrity_sitemap
  AFTER INSERT OR UPDATE OR DELETE ON public.celebrities
  FOR EACH STATEMENT
  EXECUTE FUNCTION public.regenerate_sitemap();

-- Add comment to document the trigger
COMMENT ON TRIGGER trigger_regenerate_celebrity_sitemap ON public.celebrities IS 
  'Automatically regenerates the celebrity sitemap whenever celebrities are added, updated, or deleted';