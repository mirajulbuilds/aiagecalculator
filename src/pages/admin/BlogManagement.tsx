import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2, Pencil, Trash2, Search, Eye, FileText, Upload, X } from "lucide-react";
import { format } from "date-fns";
import RichTextEditor from "@/components/RichTextEditor";
import { logAdminAction } from "@/lib/auditLogger";
import { AIBlogGenerator } from "@/components/AIBlogGenerator";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  meta_title: string;
  meta_description: string;
  main_content: string;
  featured_image_url: string | null;
  body_images_data: any;
  author_id: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

const BlogManagement = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");
  const [isLoading, setIsLoading] = useState(true);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<BlogPost | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedPosts, setSelectedPosts] = useState<Set<string>>(new Set());
  const [isBulkActionLoading, setIsBulkActionLoading] = useState(false);
  const [imageUploadLoading, setImageUploadLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (session) {
      loadBlogPosts();
    }
  }, [session]);

  useEffect(() => {
    // Filter blog posts based on search query and status
    let filtered = blogPosts;

    // Status filter
    if (statusFilter === "published") {
      filtered = filtered.filter((post) => post.published_at !== null);
    } else if (statusFilter === "draft") {
      filtered = filtered.filter((post) => post.published_at === null);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(query) ||
          post.slug.toLowerCase().includes(query) ||
          post.meta_description.toLowerCase().includes(query)
      );
    }

    setFilteredPosts(filtered);
  }, [searchQuery, statusFilter, blogPosts]);

  const loadBlogPosts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setBlogPosts(data || []);
      setFilteredPosts(data || []);
    } catch (error: any) {
      console.error("Error loading blog posts:", error);
      toast.error("Failed to load blog posts");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (post: BlogPost) => {
    setEditingPost({ ...post });
  };

  const handleSaveEdit = async () => {
    if (!editingPost || !session) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("blog_posts")
        .update({
          title: editingPost.title,
          slug: editingPost.slug,
          meta_title: editingPost.meta_title,
          meta_description: editingPost.meta_description,
          main_content: editingPost.main_content,
          featured_image_url: editingPost.featured_image_url,
          published_at: editingPost.published_at,
        })
        .eq("id", editingPost.id);

      if (error) throw error;

      await logAdminAction({
        action_type: "update",
        resource_type: "celebrity",
        resource_id: editingPost.id,
        resource_name: editingPost.title,
        changes: {
          before: { title: blogPosts.find((p) => p.id === editingPost.id)?.title },
          after: { title: editingPost.title },
        },
      });

      toast.success("Blog post updated successfully");
      setEditingPost(null);
      loadBlogPosts();
    } catch (error: any) {
      console.error("Save error:", error);
      toast.error(error.message || "Failed to update blog post");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!postToDelete || !session) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("blog_posts")
        .delete()
        .eq("id", postToDelete.id);

      if (error) throw error;

      await logAdminAction({
        action_type: "delete",
        resource_type: "celebrity",
        resource_id: postToDelete.id,
        resource_name: postToDelete.title,
        changes: {
          before: { title: postToDelete.title, slug: postToDelete.slug },
        },
      });

      toast.success("Blog post deleted successfully");
      setDeleteDialogOpen(false);
      setPostToDelete(null);
      loadBlogPosts();
    } catch (error: any) {
      console.error("Delete error:", error);
      toast.error(error.message || "Failed to delete blog post");
    } finally {
      setIsDeleting(false);
    }
  };

  const togglePostSelection = (postId: string) => {
    const newSelection = new Set(selectedPosts);
    if (newSelection.has(postId)) {
      newSelection.delete(postId);
    } else {
      newSelection.add(postId);
    }
    setSelectedPosts(newSelection);
  };

  const toggleSelectAll = () => {
    if (selectedPosts.size === filteredPosts.length) {
      setSelectedPosts(new Set());
    } else {
      setSelectedPosts(new Set(filteredPosts.map((p) => p.id)));
    }
  };

  const handleBulkPublish = async () => {
    if (selectedPosts.size === 0) return;

    setIsBulkActionLoading(true);
    try {
      const { error } = await supabase
        .from("blog_posts")
        .update({ published_at: new Date().toISOString() })
        .in("id", Array.from(selectedPosts));

      if (error) throw error;

      toast.success(`Published ${selectedPosts.size} post(s)`);
      setSelectedPosts(new Set());
      loadBlogPosts();
    } catch (error: any) {
      console.error("Bulk publish error:", error);
      toast.error("Failed to publish posts");
    } finally {
      setIsBulkActionLoading(false);
    }
  };

  const handleBulkUnpublish = async () => {
    if (selectedPosts.size === 0) return;

    setIsBulkActionLoading(true);
    try {
      const { error } = await supabase
        .from("blog_posts")
        .update({ published_at: null })
        .in("id", Array.from(selectedPosts));

      if (error) throw error;

      toast.success(`Unpublished ${selectedPosts.size} post(s)`);
      setSelectedPosts(new Set());
      loadBlogPosts();
    } catch (error: any) {
      console.error("Bulk unpublish error:", error);
      toast.error("Failed to unpublish posts");
    } finally {
      setIsBulkActionLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedPosts.size === 0) return;

    if (!confirm(`Are you sure you want to delete ${selectedPosts.size} post(s)? This cannot be undone.`)) {
      return;
    }

    setIsBulkActionLoading(true);
    try {
      const { error } = await supabase
        .from("blog_posts")
        .delete()
        .in("id", Array.from(selectedPosts));

      if (error) throw error;

      toast.success(`Deleted ${selectedPosts.size} post(s)`);
      setSelectedPosts(new Set());
      loadBlogPosts();
    } catch (error: any) {
      console.error("Bulk delete error:", error);
      toast.error("Failed to delete posts");
    } finally {
      setIsBulkActionLoading(false);
    }
  };

  const handleTogglePublish = async (post: BlogPost) => {
    try {
      const newPublishedAt = post.published_at ? null : new Date().toISOString();
      const { error } = await supabase
        .from("blog_posts")
        .update({ published_at: newPublishedAt })
        .eq("id", post.id);

      if (error) throw error;

      toast.success(newPublishedAt ? "Post published" : "Post unpublished");
      loadBlogPosts();
    } catch (error: any) {
      console.error("Toggle publish error:", error);
      toast.error("Failed to update post status");
    }
  };

  const handleFeaturedImageUpload = async (file: File) => {
    if (!editingPost) return;

    setImageUploadLoading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `blog/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('celebrity-profiles')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('celebrity-profiles')
        .getPublicUrl(filePath);

      setEditingPost({ ...editingPost, featured_image_url: publicUrl });
      toast.success("Image uploaded successfully");
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image");
    } finally {
      setImageUploadLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button
            onClick={() => navigate("/system-control-panel-x4y5z6")}
            variant="outline"
            size="icon"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Blog Management
            </h1>
            <p className="text-muted-foreground">
              Create, manage, and publish blog posts with AI
            </p>
          </div>
        </div>

        <Tabs defaultValue="manage" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="manage">
              <FileText className="h-4 w-4 mr-2" />
              Manage Posts
            </TabsTrigger>
            <TabsTrigger value="create">
              <Upload className="h-4 w-4 mr-2" />
              Create with AI
            </TabsTrigger>
          </TabsList>

          {/* Manage Posts Tab */}
          <TabsContent value="manage">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <CardTitle>All Blog Posts ({filteredPosts.length})</CardTitle>
                  
                  {selectedPosts.size > 0 && (
                    <div className="flex gap-2">
                      <Button
                        onClick={handleBulkPublish}
                        disabled={isBulkActionLoading}
                        size="sm"
                        variant="outline"
                      >
                        Publish Selected ({selectedPosts.size})
                      </Button>
                      <Button
                        onClick={handleBulkUnpublish}
                        disabled={isBulkActionLoading}
                        size="sm"
                        variant="outline"
                      >
                        Unpublish Selected
                      </Button>
                      <Button
                        onClick={handleBulkDelete}
                        disabled={isBulkActionLoading}
                        size="sm"
                        variant="destructive"
                      >
                        Delete Selected
                      </Button>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center mt-4">
                  <div className="flex-1 relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by title, slug, or description..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-full"
                    />
                  </div>
                  
                  <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Posts</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="draft">Drafts</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button onClick={loadBlogPosts} variant="outline">
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : filteredPosts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {searchQuery || statusFilter !== "all" ? "No blog posts match your filters" : "No blog posts found"}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">
                            <Checkbox
                              checked={selectedPosts.size === filteredPosts.length && filteredPosts.length > 0}
                              onCheckedChange={toggleSelectAll}
                            />
                          </TableHead>
                          <TableHead>Title</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredPosts.map((post) => (
                          <TableRow key={post.id}>
                            <TableCell>
                              <Checkbox
                                checked={selectedPosts.has(post.id)}
                                onCheckedChange={() => togglePostSelection(post.id)}
                              />
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{post.title}</div>
                                <div className="text-sm text-muted-foreground">/{post.slug}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {post.published_at ? (
                                <Badge variant="default" className="bg-green-500">
                                  Published
                                </Badge>
                              ) : (
                                <Badge variant="secondary">Draft</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {format(new Date(post.created_at), "MMM d, yyyy")}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => window.open(`/blog/${post.slug}`, "_blank")}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleTogglePublish(post)}
                                >
                                  {post.published_at ? "Unpublish" : "Publish"}
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEdit(post)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setPostToDelete(post);
                                    setDeleteDialogOpen(true);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Create with AI Tab */}
          <TabsContent value="create">
            <AIBlogGenerator session={session} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Dialog */}
      {editingPost && (
        <Dialog open={true} onOpenChange={() => setEditingPost(null)}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Blog Post</DialogTitle>
              <DialogDescription>
                Make changes to the blog post and save when done.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="edit-title">Title</Label>
                  <Input
                    id="edit-title"
                    value={editingPost.title}
                    onChange={(e) =>
                      setEditingPost({ ...editingPost, title: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-slug">Slug</Label>
                  <Input
                    id="edit-slug"
                    value={editingPost.slug}
                    onChange={(e) =>
                      setEditingPost({ ...editingPost, slug: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-meta-title">Meta Title</Label>
                  <Input
                    id="edit-meta-title"
                    value={editingPost.meta_title}
                    onChange={(e) =>
                      setEditingPost({ ...editingPost, meta_title: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-meta-desc">Meta Description</Label>
                  <Textarea
                    id="edit-meta-desc"
                    value={editingPost.meta_description}
                    onChange={(e) =>
                      setEditingPost({
                        ...editingPost,
                        meta_description: e.target.value,
                      })
                    }
                    rows={3}
                  />
                </div>
              </div>

              {/* Featured Image Upload */}
              <div className="space-y-2">
                <Label>Featured Image</Label>
                {editingPost.featured_image_url ? (
                  <div className="relative">
                    <img
                      src={editingPost.featured_image_url}
                      alt="Featured"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() =>
                        setEditingPost({ ...editingPost, featured_image_url: null })
                      }
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed rounded-lg p-8 text-center">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFeaturedImageUpload(file);
                      }}
                      disabled={imageUploadLoading}
                      className="hidden"
                      id="featured-image-upload"
                    />
                    <Label
                      htmlFor="featured-image-upload"
                      className="cursor-pointer flex flex-col items-center gap-2"
                    >
                      {imageUploadLoading ? (
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      ) : (
                        <>
                          <Upload className="h-8 w-8 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            Click to upload featured image
                          </span>
                        </>
                      )}
                    </Label>
                  </div>
                )}
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={editingPost.published_at ? "published" : "draft"}
                  onValueChange={(value) =>
                    setEditingPost({
                      ...editingPost,
                      published_at: value === "published" ? new Date().toISOString() : null,
                    })
                  }
                >
                  <SelectTrigger id="edit-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Content</Label>
                <RichTextEditor
                  value={editingPost.main_content}
                  onChange={(value) =>
                    setEditingPost({ ...editingPost, main_content: value })
                  }
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingPost(null)}>
                Cancel
              </Button>
              <Button onClick={handleSaveEdit} disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Blog Post</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{postToDelete?.title}"? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setPostToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BlogManagement;
