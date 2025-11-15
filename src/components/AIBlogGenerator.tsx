import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import RichTextEditor from "@/components/RichTextEditor";
import { logAdminAction } from "@/lib/auditLogger";

interface AIBlogGeneratorProps {
  session: Session | null;
}

export const AIBlogGenerator = ({ session }: AIBlogGeneratorProps) => {
  const [blogTopic, setBlogTopic] = useState<string>("");
  const [blogTitle, setBlogTitle] = useState<string>("");
  const [featuredImageIdea, setFeaturedImageIdea] = useState<string>("");
  const [inBodyImageIdeas, setInBodyImageIdeas] = useState<string>("");
  const [generatedBlogData, setGeneratedBlogData] = useState<any>(null);
  const [isGeneratingBlog, setIsGeneratingBlog] = useState(false);
  const [isSavingBlog, setIsSavingBlog] = useState(false);

  const handleGenerateBlog = async () => {
    if (!blogTopic.trim()) {
      toast.error("Please enter a blog topic");
      return;
    }

    setIsGeneratingBlog(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-blog-post', {
        body: {
          topic: blogTopic,
          title: blogTitle,
          featured_image_idea: featuredImageIdea,
          in_body_image_ideas: inBodyImageIdeas
        }
      });

      if (error) throw error;

      setGeneratedBlogData(data);
      toast.success("Blog post generated successfully!");
    } catch (error: any) {
      console.error("Blog generation error:", error);
      toast.error(error.message || "Failed to generate blog post");
    } finally {
      setIsGeneratingBlog(false);
    }
  };

  const handleSaveBlog = async () => {
    if (!session) {
      toast.error("You must be logged in");
      return;
    }

    setIsSavingBlog(true);
    try {
      const { error } = await supabase
        .from('blog_posts')
        .insert({
          title: generatedBlogData.title,
          slug: generatedBlogData.slug,
          meta_title: generatedBlogData.meta_title,
          meta_description: generatedBlogData.meta_description,
          main_content: generatedBlogData.main_content,
          featured_image_url: generatedBlogData.featured_image_url,
          body_images_data: generatedBlogData.body_images_data || [],
          author_id: session.user.id,
          published_at: new Date().toISOString()
        });

      if (error) throw error;

      await logAdminAction({
        action_type: 'create',
        resource_type: 'celebrity',
        resource_id: undefined,
        resource_name: generatedBlogData.title,
        changes: { after: { title: generatedBlogData.title, slug: generatedBlogData.slug } }
      });

      toast.success("Blog post published successfully!");
      setGeneratedBlogData(null);
      setBlogTopic("");
      setBlogTitle("");
      setFeaturedImageIdea("");
      setInBodyImageIdeas("");
    } catch (error: any) {
      console.error("Save error:", error);
      toast.error(error.message || "Failed to save blog post");
    } finally {
      setIsSavingBlog(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Blog Post Generator with Images</CardTitle>
        <CardDescription>
          Generate complete blog posts with AI, including featured images and in-body illustrations.
          Perfect for creating engaging content about age calculations, birthdays, and zodiac topics.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Blog Generation Form */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="blogTopic">Blog Topic / Main Idea *</Label>
            <Textarea
              id="blogTopic"
              value={blogTopic}
              onChange={(e) => setBlogTopic(e.target.value)}
              placeholder="e.g., How to calculate your zodiac sign based on your birthday"
              rows={3}
            />
            <p className="text-sm text-muted-foreground">
              Describe what you want the blog post to be about. Be specific for better results.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="blogTitle">Title (Optional)</Label>
              <Input
                id="blogTitle"
                value={blogTitle}
                onChange={(e) => setBlogTitle(e.target.value)}
                placeholder="e.g., Understanding Your Zodiac Sign"
              />
              <p className="text-sm text-muted-foreground">
                Leave blank to let AI generate an SEO-optimized title.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="featuredImageIdea">Featured Image Idea (Optional)</Label>
              <Input
                id="featuredImageIdea"
                value={featuredImageIdea}
                onChange={(e) => setFeaturedImageIdea(e.target.value)}
                placeholder="e.g., A vibrant zodiac wheel"
              />
              <p className="text-sm text-muted-foreground">
                Description for the main blog image.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="inBodyImageIdeas">In-Body Image Ideas (Optional)</Label>
            <Input
              id="inBodyImageIdeas"
              value={inBodyImageIdeas}
              onChange={(e) => setInBodyImageIdeas(e.target.value)}
              placeholder="e.g., zodiac wheel diagram, birthday cake, age calculator"
            />
            <p className="text-sm text-muted-foreground">
              Describe 2-3 images for the blog body, separated by commas.
            </p>
          </div>

          <Button
            onClick={handleGenerateBlog}
            disabled={isGeneratingBlog || !blogTopic.trim()}
            size="lg"
            className="w-full"
          >
            {isGeneratingBlog && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Generate Blog Draft
          </Button>
        </div>

        {/* Review & Publish Section */}
        {generatedBlogData && (
          <div className="space-y-6 pt-6 border-t">
            <h3 className="text-xl font-semibold text-foreground">
              Review & Publish
            </h3>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={generatedBlogData.title}
                  onChange={(e) => setGeneratedBlogData({...generatedBlogData, title: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label>Slug</Label>
                <Input
                  value={generatedBlogData.slug}
                  onChange={(e) => setGeneratedBlogData({...generatedBlogData, slug: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label>Meta Title</Label>
                <Input
                  value={generatedBlogData.meta_title}
                  onChange={(e) => setGeneratedBlogData({...generatedBlogData, meta_title: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label>Meta Description</Label>
                <Textarea
                  value={generatedBlogData.meta_description}
                  onChange={(e) => setGeneratedBlogData({...generatedBlogData, meta_description: e.target.value})}
                  rows={3}
                />
              </div>
            </div>

            {/* Featured Image Display */}
            {generatedBlogData.featured_image_url && (
              <div className="space-y-2">
                <Label>Featured Image</Label>
                <div className="border rounded-lg p-4 bg-muted">
                  <img
                    src={generatedBlogData.featured_image_url}
                    alt="Featured"
                    className="w-full max-w-md mx-auto rounded-lg"
                  />
                </div>
              </div>
            )}

            {/* Body Images Display */}
            {generatedBlogData.body_images_data && generatedBlogData.body_images_data.length > 0 && (
              <div className="space-y-2">
                <Label>In-Body Images ({generatedBlogData.body_images_data.length})</Label>
                <div className="grid gap-4 md:grid-cols-3">
                  {generatedBlogData.body_images_data.map((img: any, idx: number) => (
                    <div key={idx} className="border rounded-lg p-3 bg-muted space-y-2">
                      <img
                        src={img.url}
                        alt={img.description}
                        className="w-full rounded"
                      />
                      <p className="text-xs text-muted-foreground">
                        <strong>Placement:</strong> {img.placement}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {img.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Content Editor */}
            <div className="space-y-2">
              <Label>Article Content</Label>
              <RichTextEditor
                value={generatedBlogData.main_content}
                onChange={(value) => setGeneratedBlogData({...generatedBlogData, main_content: value})}
              />
            </div>

            {/* Save Button */}
            <Button
              onClick={handleSaveBlog}
              disabled={isSavingBlog}
              size="lg"
              className="w-full"
            >
              {isSavingBlog && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save & Publish Blog Post
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
