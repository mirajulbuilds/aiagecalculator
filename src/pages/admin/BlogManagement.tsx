import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2, Pencil, Trash2, Search, Eye } from "lucide-react";
import { format } from "date-fns";
import RichTextEditor from "@/components/RichTextEditor";
import { logAdminAction } from "@/lib/auditLogger";

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
  const [isLoading, setIsLoading] = useState(true);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<BlogPost | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
    // Filter blog posts based on search query
    if (!searchQuery.trim()) {
      setFilteredPosts(blogPosts);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = blogPosts.filter(
        (post) =>
          post.title.toLowerCase().includes(query) ||
          post.slug.toLowerCase().includes(query) ||
          post.meta_description.toLowerCase().includes(query)
      );
      setFilteredPosts(filtered);
    }
  }, [searchQuery, blogPosts]);

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
              Blog Posts Management
            </h1>
            <p className="text-muted-foreground">
              View, edit, and manage all published blog posts
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Blog Posts ({filteredPosts.length})</CardTitle>
            <div className="flex gap-3 items-center mt-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by title, slug, or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
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
                {searchQuery ? "No blog posts match your search" : "No blog posts found"}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Slug</TableHead>
                      <TableHead>Published</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPosts.map((post) => (
                      <TableRow key={post.id}>
                        <TableCell className="font-medium">{post.title}</TableCell>
                        <TableCell className="text-muted-foreground">
                          /{post.slug}
                        </TableCell>
                        <TableCell>
                          {post.published_at ? (
                            <span className="text-green-600 dark:text-green-400">
                              {format(new Date(post.published_at), "MMM d, yyyy")}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">Draft</span>
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
      </div>

      {/* Edit Dialog */}
      {editingPost && (
        <Dialog open={true} onOpenChange={() => setEditingPost(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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
