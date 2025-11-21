import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Eye, Edit3, Calendar as CalendarIcon, User, FileText, Clock } from "lucide-react";
import RichTextEditor from "@/components/RichTextEditor";
import { logAdminAction } from "@/lib/auditLogger";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import DOMPurify from "dompurify";
import { cn } from "@/lib/utils";

interface AIBlogGeneratorProps {
  session: Session | null;
}

export const AIBlogGenerator = ({ session }: AIBlogGeneratorProps) => {
  const [blogTopic, setBlogTopic] = useState<string>("");
  const [blogTitle, setBlogTitle] = useState<string>("");
  const [featuredImageIdea, setFeaturedImageIdea] = useState<string>("");
  const [inBodyImage1Idea, setInBodyImage1Idea] = useState<string>("");
  const [inBodyImage2Idea, setInBodyImage2Idea] = useState<string>("");
  const [inBodyImage3Idea, setInBodyImage3Idea] = useState<string>("");
  const [aiEngine, setAiEngine] = useState<string>("lovable");
  const [generatedBlogData, setGeneratedBlogData] = useState<any>(null);
  const [isGeneratingBlog, setIsGeneratingBlog] = useState(false);
  const [isSavingBlog, setIsSavingBlog] = useState(false);
  const [previewMode, setPreviewMode] = useState<"edit" | "preview">("edit");
  const [publicationMode, setPublicationMode] = useState<"immediate" | "draft" | "scheduled">("immediate");
  const [scheduledDate, setScheduledDate] = useState<Date>();

  const handleGenerateBlog = async () => {
    // Input validation
    if (!blogTopic.trim()) {
      toast.error("Please enter a blog topic");
      return;
    }

    if (blogTopic.length < 10) {
      toast.error("Blog topic must be at least 10 characters");
      return;
    }

    if (blogTopic.length > 2500) {
      toast.error("Blog topic must be less than 2500 characters");
      return;
    }

    if (blogTitle && blogTitle.length > 200) {
      toast.error("Blog title must be less than 200 characters");
      return;
    }

    if (featuredImageIdea && featuredImageIdea.length > 300) {
      toast.error("Featured image idea must be less than 300 characters");
      return;
    }

    if (inBodyImage1Idea && inBodyImage1Idea.length > 300) {
      toast.error("In-body image 1 idea must be less than 300 characters");
      return;
    }

    if (inBodyImage2Idea && inBodyImage2Idea.length > 300) {
      toast.error("In-body image 2 idea must be less than 300 characters");
      return;
    }

    if (inBodyImage3Idea && inBodyImage3Idea.length > 300) {
      toast.error("In-body image 3 idea must be less than 300 characters");
      return;
    }

    setIsGeneratingBlog(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-blog-post', {
        body: {
          topic: blogTopic,
          title: blogTitle,
          featured_image_idea: featuredImageIdea,
          in_body_image_1: inBodyImage1Idea,
          in_body_image_2: inBodyImage2Idea,
          in_body_image_3: inBodyImage3Idea,
          engine_choice: aiEngine
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

    // Validate scheduled date if scheduling
    if (publicationMode === "scheduled") {
      if (!scheduledDate) {
        toast.error("Please select a scheduled date");
        return;
      }
      if (scheduledDate < new Date()) {
        toast.error("Scheduled date must be in the future");
        return;
      }
    }

    setIsSavingBlog(true);
    try {
      // Determine published_at value based on publication mode
      let publishedAt: string | null = null;
      if (publicationMode === "immediate") {
        publishedAt = new Date().toISOString();
      } else if (publicationMode === "scheduled") {
        publishedAt = scheduledDate!.toISOString();
      }
      // For draft mode, publishedAt stays null

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
          published_at: publishedAt
        });

      if (error) throw error;

      await logAdminAction({
        action_type: 'create',
        resource_type: 'blog_post',
        resource_id: undefined,
        resource_name: generatedBlogData.title,
        changes: { after: { title: generatedBlogData.title, slug: generatedBlogData.slug, publication_mode: publicationMode } }
      });

      const successMessage = 
        publicationMode === "draft" ? "Blog post saved as draft!" :
        publicationMode === "scheduled" ? `Blog post scheduled for ${format(scheduledDate!, "PPP 'at' p")}` :
        "Blog post published successfully!";

      toast.success(successMessage);
      setGeneratedBlogData(null);
      setBlogTopic("");
      setBlogTitle("");
      setFeaturedImageIdea("");
      setInBodyImage1Idea("");
      setInBodyImage2Idea("");
      setInBodyImage3Idea("");
      setPublicationMode("immediate");
      setScheduledDate(undefined);
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
            <Label htmlFor="aiEngine">Select AI Engine *</Label>
            <Select value={aiEngine} onValueChange={setAiEngine}>
              <SelectTrigger>
                <SelectValue placeholder="Choose AI engine" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lovable">Lovable AI (Uses Project Credits)</SelectItem>
                <SelectItem value="gemini">My Gemini API (Uses My API Key)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Choose between Lovable AI (uses project credits) or your own Gemini API key.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="blogTitle">Blog Title (Optional)</Label>
            <Input
              id="blogTitle"
              value={blogTitle}
              onChange={(e) => setBlogTitle(e.target.value.slice(0, 200))}
              placeholder="e.g., Understanding Your Zodiac Sign"
              maxLength={200}
            />
            <p className="text-sm text-muted-foreground">
              Leave blank to let AI generate an SEO-optimized title. ({blogTitle.length}/200)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="blogTopic">Blog Topic / Main Idea *</Label>
            <Textarea
              id="blogTopic"
              value={blogTopic}
              onChange={(e) => setBlogTopic(e.target.value.slice(0, 2500))}
              placeholder="e.g., How to calculate your zodiac sign based on your birthday"
              rows={6}
              maxLength={2500}
            />
            <p className="text-sm text-muted-foreground">
              Describe what you want the blog post to be about. Be specific for better results. ({blogTopic.length}/2500)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="featuredImageIdea">Featured Image Idea (Optional)</Label>
            <Input
              id="featuredImageIdea"
              value={featuredImageIdea}
              onChange={(e) => setFeaturedImageIdea(e.target.value.slice(0, 300))}
              placeholder="e.g., A vibrant zodiac wheel"
              maxLength={300}
            />
            <p className="text-sm text-muted-foreground">
              Description for the main blog image. ({featuredImageIdea.length}/300)
            </p>
          </div>

          <div className="space-y-4">
            <Label>In-Body Image Ideas (Optional)</Label>
            <div className="space-y-3">
              <div className="space-y-2">
                <Input
                  id="inBodyImage1Idea"
                  value={inBodyImage1Idea}
                  onChange={(e) => setInBodyImage1Idea(e.target.value.slice(0, 300))}
                  placeholder="e.g., A zodiac wheel diagram"
                  maxLength={300}
                />
                <p className="text-xs text-muted-foreground">
                  In-Body Image 1 Idea ({inBodyImage1Idea.length}/300)
                </p>
              </div>

              <div className="space-y-2">
                <Input
                  id="inBodyImage2Idea"
                  value={inBodyImage2Idea}
                  onChange={(e) => setInBodyImage2Idea(e.target.value.slice(0, 300))}
                  placeholder="e.g., A birthday cake illustration"
                  maxLength={300}
                />
                <p className="text-xs text-muted-foreground">
                  In-Body Image 2 Idea ({inBodyImage2Idea.length}/300)
                </p>
              </div>

              <div className="space-y-2">
                <Input
                  id="inBodyImage3Idea"
                  value={inBodyImage3Idea}
                  onChange={(e) => setInBodyImage3Idea(e.target.value.slice(0, 300))}
                  placeholder="e.g., An age calculator interface"
                  maxLength={300}
                />
                <p className="text-xs text-muted-foreground">
                  In-Body Image 3 Idea ({inBodyImage3Idea.length}/300)
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Describe specific images to be inserted into the article.
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
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-foreground">
                Review & Publish
              </h3>
              <Tabs value={previewMode} onValueChange={(v) => setPreviewMode(v as "edit" | "preview")}>
                <TabsList>
                  <TabsTrigger value="edit" className="flex items-center gap-2">
                    <Edit3 className="w-4 h-4" />
                    Edit
                  </TabsTrigger>
                  <TabsTrigger value="preview" className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    Preview
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {previewMode === "edit" ? (
              <>
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
              </>
            ) : (
              /* Preview Mode */
              <Card className="overflow-hidden border-2">
                {generatedBlogData.featured_image_url && (
                  <div className="aspect-[21/9] overflow-hidden">
                    <img 
                      src={generatedBlogData.featured_image_url} 
                      alt={generatedBlogData.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-8 md:p-12">
                  <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    {generatedBlogData.title}
                  </h1>
                  
                  <div className="flex flex-wrap gap-4 mb-8 text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">{new Date().toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span className="text-sm">AI Age Calculator Team</span>
                    </div>
                  </div>

                  <div 
                    className="prose prose-lg max-w-none dark:prose-invert
                      prose-headings:font-bold prose-headings:text-foreground
                      prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-4
                      prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-3
                      prose-p:text-foreground/90 prose-p:leading-relaxed
                      prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                      prose-strong:text-foreground prose-strong:font-semibold
                      prose-ul:text-foreground/90 prose-ol:text-foreground/90
                      prose-li:marker:text-primary
                      prose-blockquote:border-l-primary prose-blockquote:text-foreground/80
                      prose-code:text-primary prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded
                      prose-img:rounded-lg prose-img:shadow-lg"
                    dangerouslySetInnerHTML={{ 
                      __html: DOMPurify.sanitize(generatedBlogData.main_content) 
                    }}
                  />
                </div>
              </Card>
            )}

            {/* Publication Options */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-lg">Publication Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="publicationMode">Publication Mode</Label>
                  <Select value={publicationMode} onValueChange={(v: any) => setPublicationMode(v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose publication mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          <span>Publish Immediately</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="draft">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          <span>Save as Draft</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="scheduled">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>Schedule for Later</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {publicationMode === "scheduled" && (
                  <div className="space-y-2">
                    <Label>Schedule Date & Time</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !scheduledDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {scheduledDate ? format(scheduledDate, "PPP 'at' p") : "Pick a date and time"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={scheduledDate}
                          onSelect={setScheduledDate}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                        <div className="p-3 border-t">
                          <Label className="text-xs text-muted-foreground mb-2 block">Time</Label>
                          <Input
                            type="time"
                            value={scheduledDate ? format(scheduledDate, "HH:mm") : ""}
                            onChange={(e) => {
                              if (scheduledDate && e.target.value) {
                                const [hours, minutes] = e.target.value.split(':');
                                const newDate = new Date(scheduledDate);
                                newDate.setHours(parseInt(hours), parseInt(minutes));
                                setScheduledDate(newDate);
                              }
                            }}
                          />
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                )}

                <Button
                  onClick={handleSaveBlog}
                  disabled={isSavingBlog || (publicationMode === "scheduled" && !scheduledDate)}
                  size="lg"
                  className="w-full"
                >
                  {isSavingBlog && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {publicationMode === "draft" && "Save as Draft"}
                  {publicationMode === "scheduled" && "Schedule Blog Post"}
                  {publicationMode === "immediate" && "Publish Now"}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
