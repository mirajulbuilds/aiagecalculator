import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { SITE_CONFIG } from '@/lib/config';

const SITEMAP_URLS = [
  { id: 'index', label: 'Sitemap Index', url: `${SITE_CONFIG.canonicalUrl}/sitemap-index.xml` },
  { id: 'static', label: 'Static Pages', url: `${SITE_CONFIG.canonicalUrl}/sitemap-static.xml` },
  { id: 'celebrities', label: 'Celebrity Profiles', url: `${SITE_CONFIG.canonicalUrl}/sitemap-celebrities.xml` },
  { id: 'categories', label: 'Categories', url: `${SITE_CONFIG.canonicalUrl}/sitemap-categories.xml` },
  { id: 'blog', label: 'Blog Posts', url: `${SITE_CONFIG.canonicalUrl}/sitemap-blog.xml` },
];

export const GSCSitemapSubmitter = () => {
  const [selectedSitemaps, setSelectedSitemaps] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const { toast } = useToast();

  const toggleSitemap = (sitemapId: string) => {
    setSelectedSitemaps(prev =>
      prev.includes(sitemapId)
        ? prev.filter(id => id !== sitemapId)
        : [...prev, sitemapId]
    );
  };

  const selectAll = () => {
    setSelectedSitemaps(SITEMAP_URLS.map(s => s.id));
  };

  const deselectAll = () => {
    setSelectedSitemaps([]);
  };

  const handleSubmit = async () => {
    if (selectedSitemaps.length === 0) {
      toast({
        title: 'No sitemaps selected',
        description: 'Please select at least one sitemap to submit.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const sitemapUrls = selectedSitemaps.map(
        id => SITEMAP_URLS.find(s => s.id === id)?.url
      ).filter(Boolean);

      const { data, error } = await supabase.functions.invoke('submit-sitemap-to-gsc', {
        body: { 
          sitemapUrls,
          submittedBy: user?.id 
        },
      });

      if (error) throw error;

      const successCount = data.results.filter((r: any) => r.success).length;
      const failCount = data.results.length - successCount;

      if (failCount === 0) {
        toast({
          title: 'Success',
          description: `Successfully submitted ${successCount} sitemap(s) to Google Search Console.`,
        });
      } else {
        toast({
          title: 'Partial Success',
          description: `Submitted ${successCount} sitemap(s), ${failCount} failed. Check logs for details.`,
          variant: 'default',
        });
      }

      setSelectedSitemaps([]);
    } catch (error) {
      console.error('Error submitting sitemaps:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to submit sitemaps',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('regenerate-all-sitemaps', {
        body: {},
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: 'Sitemaps Regenerated',
          description: data.message,
        });
      } else {
        toast({
          title: 'Partial Success',
          description: data.message,
          variant: 'default',
        });
      }
    } catch (error) {
      console.error('Error regenerating sitemaps:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to regenerate sitemaps',
        variant: 'destructive',
      });
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Sitemap Management
        </CardTitle>
        <CardDescription>
          Regenerate sitemaps from database and submit to Google Search Console
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Regenerate Sitemaps Section */}
        <div className="p-4 border rounded-lg bg-muted/30">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Regenerate All Sitemaps
          </h4>
          <p className="text-sm text-muted-foreground mb-3">
            Regenerate all sitemaps from the database to include all 1,338+ celebrities, blog posts, and categories.
          </p>
          <Button
            onClick={handleRegenerate}
            disabled={isRegenerating}
            variant="secondary"
            className="w-full"
          >
            {isRegenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Regenerating...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Regenerate All Sitemaps
              </>
            )}
          </Button>
        </div>

        {/* Submit to GSC Section */}
        <div className="space-y-2">
          <h4 className="font-medium">Submit to Google Search Console</h4>
          <div className="flex gap-2 mb-3">
            <Button onClick={selectAll} variant="outline" size="sm">
              Select All
            </Button>
            <Button onClick={deselectAll} variant="outline" size="sm">
              Deselect All
            </Button>
          </div>

          {SITEMAP_URLS.map(sitemap => (
            <div key={sitemap.id} className="flex items-center space-x-2">
              <Checkbox
                id={sitemap.id}
                checked={selectedSitemaps.includes(sitemap.id)}
                onCheckedChange={() => toggleSitemap(sitemap.id)}
              />
              <label
                htmlFor={sitemap.id}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                {sitemap.label}
              </label>
              <span className="text-xs text-muted-foreground ml-auto">
                {sitemap.url}
              </span>
            </div>
          ))}
        </div>

        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || selectedSitemaps.length === 0}
          className="w-full"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Submit to Google Search Console
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
