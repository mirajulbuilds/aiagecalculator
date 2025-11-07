import { useState, useEffect } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Helmet } from "react-helmet-async";
import { Loader2, LogOut, Plus, Save, Eye, Upload, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Celebrity {
  id?: string;
  name: string;
  dob: string;
  birthplace: string;
  country: string;
  profession: string;
  image_url: string;
  bio: string | null;
  before_fame: string | null;
  trivia: string | null;
  family_life: string | null;
  associated_with: string | null;
  social_links: Record<string, string> | null;
  published: boolean;
  slug: string;
  excerpt: string | null;
  birth_sign: string | null;
}

const AdminDashboard = () => {
  const { user, isAdmin, loading: authLoading, signOut } = useAdminAuth();
  const [celebrities, setCelebrities] = useState<Celebrity[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedCelebrity, setSelectedCelebrity] = useState<Celebrity | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUploading, setImageUploading] = useState(false);

  const [formData, setFormData] = useState<Celebrity>({
    name: "",
    dob: "",
    birthplace: "",
    country: "",
    profession: "",
    image_url: "",
    bio: "",
    before_fame: "",
    trivia: "",
    family_life: "",
    associated_with: "",
    social_links: { instagram: "", twitter: "", facebook: "" },
    published: true,
    slug: "",
    excerpt: "",
    birth_sign: ""
  });

  useEffect(() => {
    if (isAdmin) {
      fetchCelebrities();
    }
  }, [isAdmin]);

  const fetchCelebrities = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("explore_famous_birthdays")
        .select("*")
        .order("name");

      if (error) throw error;
      
      // Map database data to Celebrity interface
      const mappedData: Celebrity[] = (data || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        dob: item.dob,
        birthplace: item.birthplace,
        country: item.country,
        profession: item.profession,
        image_url: item.image_url,
        bio: item.bio,
        before_fame: item.before_fame,
        trivia: typeof item.trivia === 'string' ? item.trivia : null,
        family_life: item.family_life,
        associated_with: item.associated_with,
        social_links: item.social_links,
        published: item.published,
        slug: item.slug,
        excerpt: item.excerpt,
        birth_sign: item.birth_sign
      }));
      
      setCelebrities(mappedData);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch celebrities");
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleInputChange = (field: keyof Celebrity, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      if (field === "name") {
        updated.slug = generateSlug(value);
      }
      return updated;
    });
  };

  const handleSocialLinkChange = (platform: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      social_links: { ...prev.social_links, [platform]: value }
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setImageFile(file);
    setImageUploading(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("celebrity-images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("celebrity-images")
        .getPublicUrl(filePath);

      handleInputChange("image_url", publicUrl);
      toast.success("Image uploaded successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to upload image");
    } finally {
      setImageUploading(false);
    }
  };

  const handleSave = async (withAI: boolean = false) => {
    if (!formData.name || !formData.dob || !formData.profession) {
      toast.error("Please fill in required fields: Name, Birth Date, and Profession");
      return;
    }

    setSaving(true);

    try {
      const dataToSave = {
        ...formData,
        updated_by: user?.id,
        created_by: formData.id ? undefined : user?.id,
      };

      if (formData.id) {
        // Update existing
        const { error } = await supabase
          .from("explore_famous_birthdays")
          .update(dataToSave)
          .eq("id", formData.id);

        if (error) throw error;
        toast.success("Celebrity updated successfully");
      } else {
        // Insert new
        const { error } = await supabase
          .from("explore_famous_birthdays")
          .insert([dataToSave]);

        if (error) throw error;
        toast.success("Celebrity created successfully");
      }

      if (withAI) {
        toast.info("AI enhancement feature coming soon!");
      }

      resetForm();
      fetchCelebrities();
    } catch (error: any) {
      toast.error(error.message || "Failed to save celebrity");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (celebrity: any) => {
    // Convert trivia from jsonb to string if needed
    let triviaText = "";
    if (celebrity.trivia) {
      if (typeof celebrity.trivia === 'string') {
        triviaText = celebrity.trivia;
      } else if (Array.isArray(celebrity.trivia)) {
        triviaText = celebrity.trivia.join("\n");
      }
    }

    setFormData({
      id: celebrity.id,
      name: celebrity.name || "",
      dob: celebrity.dob || "",
      birthplace: celebrity.birthplace || "",
      country: celebrity.country || "",
      profession: celebrity.profession || "",
      image_url: celebrity.image_url || "",
      bio: celebrity.bio || "",
      before_fame: celebrity.before_fame || "",
      trivia: triviaText,
      family_life: celebrity.family_life || "",
      associated_with: celebrity.associated_with || "",
      social_links: typeof celebrity.social_links === 'object' && celebrity.social_links !== null 
        ? celebrity.social_links 
        : { instagram: "", twitter: "", facebook: "" },
      published: celebrity.published ?? true,
      slug: celebrity.slug || "",
      excerpt: celebrity.excerpt || "",
      birth_sign: celebrity.birth_sign || ""
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this celebrity?")) return;

    try {
      const { error } = await supabase
        .from("explore_famous_birthdays")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Celebrity deleted successfully");
      fetchCelebrities();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete celebrity");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      dob: "",
      birthplace: "",
      country: "",
      profession: "",
      image_url: "",
      bio: "",
      before_fame: "",
      trivia: "",
      family_life: "",
      associated_with: "",
      social_links: { instagram: "", twitter: "", facebook: "" },
      published: true,
      slug: "",
      excerpt: "",
      birth_sign: ""
    });
    setImageFile(null);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <>
      <Helmet>
        <title>Celebrity Manager - Admin Dashboard</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="border-b bg-card">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold">Celebrity Manager</h1>
            <Button variant="outline" onClick={signOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Celebrity List */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>All Celebrities</CardTitle>
                <CardDescription>{celebrities.length} total</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={resetForm} className="w-full mb-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Celebrity
                </Button>
                <ScrollArea className="h-[600px]">
                  <div className="space-y-2">
                    {loading ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin" />
                      </div>
                    ) : (
                      celebrities.map((celebrity) => (
                        <div
                          key={celebrity.id}
                          className="p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                          onClick={() => handleEdit(celebrity)}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="font-medium">{celebrity.name}</p>
                              <p className="text-sm text-muted-foreground">{celebrity.profession}</p>
                              {!celebrity.published && (
                                <span className="text-xs bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 px-2 py-0.5 rounded">
                                  Draft
                                </span>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(celebrity.id!);
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Edit Form */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>{formData.id ? "Edit Celebrity" : "Add New Celebrity"}</CardTitle>
                <CardDescription>
                  Fill in the details below. Required fields are marked with *
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="basic">Basic Info</TabsTrigger>
                    <TabsTrigger value="content">Content</TabsTrigger>
                    <TabsTrigger value="social">Social</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                  </TabsList>

                  <TabsContent value="basic" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        placeholder="Taylor Swift"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="dob">Birth Date *</Label>
                        <Input
                          id="dob"
                          type="date"
                          value={formData.dob}
                          onChange={(e) => handleInputChange("dob", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="birth_sign">Birth Sign</Label>
                        <Input
                          id="birth_sign"
                          value={formData.birth_sign}
                          onChange={(e) => handleInputChange("birth_sign", e.target.value)}
                          placeholder="Sagittarius"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="birthplace">Birth Place</Label>
                        <Input
                          id="birthplace"
                          value={formData.birthplace}
                          onChange={(e) => handleInputChange("birthplace", e.target.value)}
                          placeholder="West Reading, PA"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="country">Country</Label>
                        <Input
                          id="country"
                          value={formData.country}
                          onChange={(e) => handleInputChange("country", e.target.value)}
                          placeholder="United States"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="profession">Profession *</Label>
                      <Select
                        value={formData.profession}
                        onValueChange={(value) => handleInputChange("profession", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select profession" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pop Singer">Pop Singer</SelectItem>
                          <SelectItem value="Movie Actor">Movie Actor</SelectItem>
                          <SelectItem value="Movie Actress">Movie Actress</SelectItem>
                          <SelectItem value="TV Actor">TV Actor</SelectItem>
                          <SelectItem value="TV Actress">TV Actress</SelectItem>
                          <SelectItem value="Rapper">Rapper</SelectItem>
                          <SelectItem value="Entrepreneur">Entrepreneur</SelectItem>
                          <SelectItem value="Soccer Player">Soccer Player</SelectItem>
                          <SelectItem value="Basketball Player">Basketball Player</SelectItem>
                          <SelectItem value="Instagram Star">Instagram Star</SelectItem>
                          <SelectItem value="YouTuber">YouTuber</SelectItem>
                          <SelectItem value="TikTok Star">TikTok Star</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="image">Profile Image</Label>
                      <div className="flex gap-2">
                        <Input
                          id="image"
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          disabled={imageUploading}
                        />
                        {imageUploading && <Loader2 className="h-5 w-5 animate-spin" />}
                      </div>
                      {formData.image_url && (
                        <img
                          src={formData.image_url}
                          alt="Preview"
                          className="mt-2 h-32 w-32 object-cover rounded-lg"
                        />
                      )}
                      <p className="text-xs text-muted-foreground">Or enter image URL below</p>
                      <Input
                        value={formData.image_url}
                        onChange={(e) => handleInputChange("image_url", e.target.value)}
                        placeholder="https://..."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="excerpt">Excerpt (Short Description)</Label>
                      <Textarea
                        id="excerpt"
                        value={formData.excerpt}
                        onChange={(e) => handleInputChange("excerpt", e.target.value)}
                        placeholder="Brief introduction..."
                        rows={2}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="content" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="bio">About (Biography)</Label>
                      <Textarea
                        id="bio"
                        value={formData.bio}
                        onChange={(e) => handleInputChange("bio", e.target.value)}
                        placeholder="Detailed biography..."
                        rows={6}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="before_fame">Before Fame</Label>
                      <Textarea
                        id="before_fame"
                        value={formData.before_fame}
                        onChange={(e) => handleInputChange("before_fame", e.target.value)}
                        placeholder="Early life and career beginnings..."
                        rows={4}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="trivia">Trivia</Label>
                      <Textarea
                        id="trivia"
                        value={formData.trivia}
                        onChange={(e) => handleInputChange("trivia", e.target.value)}
                        placeholder="Interesting facts..."
                        rows={4}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="family_life">Family Life</Label>
                      <Textarea
                        id="family_life"
                        value={formData.family_life}
                        onChange={(e) => handleInputChange("family_life", e.target.value)}
                        placeholder="Family background and relationships..."
                        rows={4}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="associated_with">Associated With</Label>
                      <Textarea
                        id="associated_with"
                        value={formData.associated_with}
                        onChange={(e) => handleInputChange("associated_with", e.target.value)}
                        placeholder="Notable collaborations and relationships..."
                        rows={3}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="social" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="instagram">Instagram</Label>
                      <Input
                        id="instagram"
                        value={formData.social_links.instagram || ""}
                        onChange={(e) => handleSocialLinkChange("instagram", e.target.value)}
                        placeholder="https://instagram.com/username"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="twitter">Twitter/X</Label>
                      <Input
                        id="twitter"
                        value={formData.social_links.twitter || ""}
                        onChange={(e) => handleSocialLinkChange("twitter", e.target.value)}
                        placeholder="https://twitter.com/username"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="facebook">Facebook</Label>
                      <Input
                        id="facebook"
                        value={formData.social_links.facebook || ""}
                        onChange={(e) => handleSocialLinkChange("facebook", e.target.value)}
                        placeholder="https://facebook.com/username"
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="settings" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="slug">URL Slug (auto-generated)</Label>
                      <Input
                        id="slug"
                        value={formData.slug}
                        onChange={(e) => handleInputChange("slug", e.target.value)}
                        placeholder="taylor-swift"
                      />
                      <p className="text-xs text-muted-foreground">
                        Profile URL: /celebrity/{formData.slug}
                      </p>
                    </div>

                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <Label htmlFor="published">Published</Label>
                        <p className="text-sm text-muted-foreground">
                          Make this profile visible to the public
                        </p>
                      </div>
                      <Switch
                        id="published"
                        checked={formData.published}
                        onCheckedChange={(checked) => handleInputChange("published", checked)}
                      />
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="flex gap-2 mt-6">
                  <Button onClick={() => handleSave(false)} disabled={saving} className="flex-1">
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Quick Save (Free)
                      </>
                    )}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setPreviewOpen(true)}
                    disabled={!formData.name}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Preview
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleSave(true)}
                    disabled={saving}
                  >
                    AI Enhance
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Profile Preview</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[70vh]">
            <div className="space-y-6 p-6">
              {formData.image_url && (
                <img
                  src={formData.image_url}
                  alt={formData.name}
                  className="w-full h-64 object-cover rounded-lg"
                />
              )}
              <div>
                <h2 className="text-3xl font-bold">{formData.name}</h2>
                <p className="text-muted-foreground">{formData.profession}</p>
                {formData.dob && (
                  <p className="text-sm">Born: {new Date(formData.dob).toLocaleDateString()}</p>
                )}
              </div>
              {formData.excerpt && (
                <p className="text-lg">{formData.excerpt}</p>
              )}
              {formData.bio && (
                <div>
                  <h3 className="text-xl font-semibold mb-2">About</h3>
                  <p className="whitespace-pre-wrap">{formData.bio}</p>
                </div>
              )}
              {formData.before_fame && (
                <div>
                  <h3 className="text-xl font-semibold mb-2">Before Fame</h3>
                  <p className="whitespace-pre-wrap">{formData.before_fame}</p>
                </div>
              )}
              {formData.trivia && (
                <div>
                  <h3 className="text-xl font-semibold mb-2">Trivia</h3>
                  <p className="whitespace-pre-wrap">{formData.trivia}</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminDashboard;
