import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CalendarIcon, Loader2, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import RichTextEditor from "@/components/RichTextEditor";
import { useAdminCheck } from "@/hooks/useAdminCheck";

const celebritySchema = z.object({
  name: z.string().min(1, "Celebrity name is required").max(100),
  profileSlug: z
    .string()
    .min(1, "Profile slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase with hyphens only"),
  dateOfBirth: z.date({ required_error: "Date of birth is required" }),
  profession: z.string().min(1, "Profession is required").max(100),
  placeOfBirth: z.string().max(200).optional(),
  aiHint: z.string().optional(),
  mainContent: z.string().min(100, "Main content must be at least 100 characters"),
  metaTitle: z.string().min(1, "SEO meta title is required").max(60),
  metaDescription: z.string().min(1, "SEO meta description is required").max(160),
});

type CelebrityFormData = z.infer<typeof celebritySchema>;

interface CelebrityData {
  id: string;
  name: string;
  profile_slug: string;
  date_of_birth: string;
  profession: string;
  place_of_birth: string | null;
  main_content: string;
  meta_title: string;
  meta_description: string;
  profile_image_url: string;
  zodiac_sign: string | null;
  popularity_ranks: any;
  known_for_data: any;
  face_embedding: any;
}

const AdminPanel = () => {
  const navigate = useNavigate();
  
  // Admin authentication check with proper role verification
  const { isAdmin, isLoading: isCheckingAdmin } = useAdminCheck();
  
  const [session, setSession] = useState<Session | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [zodiacSign, setZodiacSign] = useState<string>("");
  const [popularityRanks, setPopularityRanks] = useState<any>(null);
  const [knownForData, setKnownForData] = useState<string>("");
  const [faceEmbedding, setFaceEmbedding] = useState<string>("");
  
  // Tab state
  const [activeTab, setActiveTab] = useState<string>("scrape");
  
  // Tab 1: Scrape state
  const [sourceType, setSourceType] = useState<string>("famousbirthdays");
  const [profileUrl, setProfileUrl] = useState<string>("");
  const [selectedEngine, setSelectedEngine] = useState<string>("lovable-ai");

  // Search & Edit state
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<CelebrityData[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Delete confirmation state
  const [profileToDelete, setProfileToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CelebrityFormData>({
    resolver: zodResolver(celebritySchema),
  });

  const mainContent = watch("mainContent") || "";
  const dateOfBirth = watch("dateOfBirth");

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };


  const handlePreview = () => {
    // Validate required fields before preview
    const currentName = watch("name");
    const currentSlug = watch("profileSlug");
    
    if (!currentName || currentName.trim().length === 0) {
      toast.error("Please enter a celebrity name before previewing");
      return;
    }

    if (!currentSlug || currentSlug.trim().length === 0) {
      toast.error("Please generate content or add a profile slug before previewing");
      return;
    }

    // Create preview data object with all current form values
    const previewData = {
      name: currentName,
      date_of_birth: watch("dateOfBirth")?.toISOString().split('T')[0] || "",
      profession: watch("profession") || "Unknown",
      place_of_birth: watch("placeOfBirth") || "",
      zodiac_sign: zodiacSign || "",
      profile_slug: currentSlug,
      profile_image_url: imagePreview || "https://via.placeholder.com/400x400?text=Celebrity+Photo",
      main_content: watch("mainContent") || "<p>No content available</p>",
      meta_title: watch("metaTitle") || currentName,
      meta_description: watch("metaDescription") || `Learn about ${currentName}`,
      popularity_ranks: popularityRanks,
      is_preview: true, // Flag to indicate this is preview data
    };

    // Save to sessionStorage (persists across new tabs)
    sessionStorage.setItem("temp_profile_preview", JSON.stringify(previewData));
    
    // Open preview in new tab
    window.open(`/people/${currentSlug}`, "_blank");
  };

  const onSubmit = async (data: CelebrityFormData) => {
    if (!session) {
      toast.error("You must be logged in");
      return;
    }

    setIsSaving(true);

    try {
      let imageUrl = "";

      // Upload image if provided
      if (profileImage) {
        const fileExt = profileImage.name.split(".").pop();
        const fileName = `${data.profileSlug}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("celebrity-profiles")
          .upload(filePath, profileImage);

        if (uploadError) {
          toast.error("Failed to upload image: " + uploadError.message);
          setIsSaving(false);
          return;
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("celebrity-profiles").getPublicUrl(filePath);

        imageUrl = publicUrl;
      } else if (imagePreview) {
        // Use AI-generated image URL
        imageUrl = imagePreview;
      } else {
        // Fallback placeholder
        imageUrl = "https://via.placeholder.com/400x400?text=Celebrity+Photo";
      }

      // STEP 1: Check if profile already exists (UPSERT logic)
      const { data: existingProfile, error: findError } = await supabase
        .from("celebrities")
        .select("id")
        .eq("profile_slug", data.profileSlug)
        .maybeSingle();

      if (findError) {
        toast.error("Error checking for existing profile: " + findError.message);
        setIsSaving(false);
        return;
      }

      // Parse known_for_data JSON
      let parsedKnownForData = null;
      if (knownForData && knownForData.trim()) {
        try {
          parsedKnownForData = JSON.parse(knownForData);
        } catch (e) {
          toast.error("Invalid JSON in Known For Data field");
          setIsSaving(false);
          return;
        }
      }

      // Parse face_embedding JSON
      let parsedFaceEmbedding = null;
      if (faceEmbedding && faceEmbedding.trim()) {
        try {
          parsedFaceEmbedding = JSON.parse(faceEmbedding);
        } catch (e) {
          toast.error("Invalid JSON in Face Embedding field");
          setIsSaving(false);
          return;
        }
      }

      const profileData = {
        name: data.name,
        profile_slug: data.profileSlug,
        date_of_birth: format(data.dateOfBirth, "yyyy-MM-dd"),
        profession: data.profession,
        place_of_birth: data.placeOfBirth || null,
        main_content: data.mainContent,
        meta_title: data.metaTitle,
        meta_description: data.metaDescription,
        profile_image_url: imageUrl,
        zodiac_sign: zodiacSign || null,
        popularity_ranks: popularityRanks || null,
        known_for_data: parsedKnownForData,
        face_embedding: parsedFaceEmbedding,
      };

      // STEP 2: Conditional Logic - CREATE or UPDATE
      if (!existingProfile) {
        // CREATE NEW PROFILE
        const { error: insertError } = await supabase
          .from("celebrities")
          .insert(profileData);

        if (insertError) {
          toast.error("Failed to create profile: " + insertError.message);
          setIsSaving(false);
          return;
        }

        toast.success("Success! New profile has been CREATED.");
      } else {
        // UPDATE EXISTING PROFILE
        const { error: updateError } = await supabase
          .from("celebrities")
          .update(profileData)
          .eq("id", existingProfile.id);

        if (updateError) {
          toast.error("Failed to update profile: " + updateError.message);
          setIsSaving(false);
          return;
        }

        toast.success("Success! Profile has been UPDATED.");
      }
      
      // Reset form
      setValue("name", "");
      setValue("profileSlug", "");
      setValue("mainContent", "");
      setValue("metaTitle", "");
      setValue("metaDescription", "");
      setValue("profession", "");
      setValue("placeOfBirth", "");
      setValue("dateOfBirth", undefined as any);
      setValue("aiHint", "");
      setProfileImage(null);
      setImagePreview("");
      setZodiacSign("");
      setPopularityRanks(null);
      setKnownForData("");
    } catch (error) {
      console.error("Error saving celebrity:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  // Show loading while checking admin status
  if (isCheckingAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  // Show access denied if not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-destructive mb-4">Access Denied</h1>
          <p className="text-muted-foreground">You do not have permission to access this page.</p>
        </div>
      </div>
    );
  }

  const handleGenerateContent = async () => {
    if (!profileUrl || profileUrl.trim().length === 0) {
      toast.error("Please provide a profile URL");
      return;
    }

    setIsGenerating(true);

    try {
      console.log("Calling scrape function with URL:", profileUrl, "Source:", sourceType);
      
      // Convert image preview to base64 if it's a file
      let imageBase64 = null;
      if (profileImage) {
        const reader = new FileReader();
        imageBase64 = await new Promise<string>((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(profileImage);
        });
      } else if (imagePreview && imagePreview.startsWith('data:')) {
        imageBase64 = imagePreview;
      }

      const { data, error } = await supabase.functions.invoke("generate-celebrity-profile", {
        body: {
          profileURL: profileUrl,
          sourceType: sourceType,
          manualImageBase64: imageBase64,
          engine_choice: selectedEngine,
        },
      });

      if (error) {
        console.error("Function error:", error);
        throw error;
      }

      console.log("Generated data:", data);

      // Auto-fill all fields with generated data in Tab 2
      setValue("name", data.name);
      setValue("profileSlug", data.profile_slug);
      setValue("mainContent", data.main_content);
      setValue("metaTitle", data.meta_title);
      setValue("metaDescription", data.meta_description);
      setValue("profession", data.profession);
      setValue("placeOfBirth", data.place_of_birth);
      setValue("dateOfBirth", new Date(data.date_of_birth));

      // Set the profile image URL (null if no image found)
      if (data.profile_image_url) {
        setImagePreview(data.profile_image_url);
      }

      // Set additional AI-generated fields
      setZodiacSign(data.zodiac_sign || "");
      setPopularityRanks(data.popularity_ranks || null);
      setKnownForData(data.known_for_data ? JSON.stringify(data.known_for_data, null, 2) : "");

      // Generate face embedding from profile image
      if (data.profile_image_url) {
        try {
          console.log("Generating face embedding for profile image...");
          const { data: embeddingData, error: embeddingError } = await supabase.functions.invoke(
            'generate-face-embedding',
            {
              body: { imageUrl: data.profile_image_url }
            }
          );

          if (embeddingError) {
            console.error("Face embedding error:", embeddingError);
            toast.warning("Profile generated but face embedding failed");
          } else if (embeddingData && embeddingData.faceDetected) {
            setFaceEmbedding(JSON.stringify(embeddingData, null, 2));
            console.log("Face embedding generated successfully");
          } else {
            console.log("No face detected in image");
            setFaceEmbedding("");
          }
        } catch (embeddingError) {
          console.error("Error generating face embedding:", embeddingError);
        }
      }

      toast.success("Draft generated! Please review and edit in the Manual Editor tab.");
      
      // Auto-switch to Manual Editor tab
      setActiveTab("manual");
    } catch (error) {
      console.error("Error generating content:", error);
      toast.error("Failed to generate content. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSearchProfiles = async () => {
    if (!searchQuery || searchQuery.trim().length === 0) {
      toast.error("Please enter a celebrity name to search");
      return;
    }

    setIsSearching(true);
    try {
      const { data, error } = await supabase
        .from("celebrities")
        .select("*")
        .ilike("name", `%${searchQuery}%`)
        .order("name");

      if (error) {
        console.error("Search error:", error);
        toast.error("Failed to search profiles");
        setSearchResults([]);
        return;
      }

      setSearchResults(data || []);
      
      if (data && data.length === 0) {
        toast.info("No profiles found matching your search");
      } else if (data) {
        toast.success(`Found ${data.length} profile(s)`);
      }
    } catch (error) {
      console.error("Error searching profiles:", error);
      toast.error("An unexpected error occurred");
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleLoadProfile = (profile: CelebrityData) => {
    // Populate all form fields with the loaded profile data
    setValue("name", profile.name);
    setValue("profileSlug", profile.profile_slug);
    setValue("mainContent", profile.main_content);
    setValue("metaTitle", profile.meta_title);
    setValue("metaDescription", profile.meta_description);
    setValue("profession", profile.profession);
    setValue("placeOfBirth", profile.place_of_birth || "");
    setValue("dateOfBirth", new Date(profile.date_of_birth));
    
    // Set profile image
    setImagePreview(profile.profile_image_url);
    
    // Set additional fields
    setZodiacSign(profile.zodiac_sign || "");
    setPopularityRanks(profile.popularity_ranks || null);
    setKnownForData(profile.known_for_data ? JSON.stringify(profile.known_for_data, null, 2) : "");
    setFaceEmbedding(profile.face_embedding ? JSON.stringify(profile.face_embedding, null, 2) : "");
    
    // Clear search results after loading
    setSearchResults([]);
    setSearchQuery("");
    
    toast.success(`Loaded profile: ${profile.name}`);
  };

  const handleDeleteProfile = async () => {
    if (!profileToDelete) return;

    setIsDeleting(true);
    
    try {
      const { error } = await supabase
        .from("celebrities")
        .delete()
        .eq("id", profileToDelete.id);

      if (error) {
        console.error("Delete error:", error);
        toast.error("Failed to delete profile: " + error.message);
        return;
      }

      toast.success(`Profile "${profileToDelete.name}" has been permanently deleted`);
      
      // Remove from search results
      setSearchResults(searchResults.filter(p => p.id !== profileToDelete.id));
      
      // Close modal and clear state
      setProfileToDelete(null);
      
      // Optionally re-run search to refresh results
      if (searchQuery.trim().length > 0) {
        handleSearchProfiles();
      }
    } catch (error) {
      console.error("Error deleting profile:", error);
      toast.error("An unexpected error occurred while deleting");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
          Celebrity Profile Content Engine
        </h1>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="scrape">Scrape & Auto-Generate</TabsTrigger>
            <TabsTrigger value="manual">Manual Editor / Review Drafts</TabsTrigger>
          </TabsList>

          {/* TAB 1: SCRAPE & AUTO-GENERATE */}
          <TabsContent value="scrape" className="space-y-6">
            <div className="p-6 border border-border rounded-lg bg-card space-y-6">
              <h2 className="text-2xl font-semibold text-foreground">
                Create Profile from URL (Automated)
              </h2>

              {/* Select Source Type */}
              <div className="space-y-2">
                <Label htmlFor="sourceType">Select Source Type *</Label>
                <Select value={sourceType} onValueChange={setSourceType}>
                  <SelectTrigger id="sourceType">
                    <SelectValue placeholder="Select source type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="famousbirthdays">FamousBirthdays.com</SelectItem>
                    <SelectItem value="wikipedia">Wikipedia.org</SelectItem>
                    <SelectItem value="other">Other (General Article)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Profile URL */}
              <div className="space-y-2">
                <Label htmlFor="profileUrl">Profile URL *</Label>
                <Input
                  id="profileUrl"
                  type="text"
                  value={profileUrl}
                  onChange={(e) => setProfileUrl(e.target.value)}
                  placeholder="Paste the full URL here..."
                  required
                />
              </div>

              {/* AI Engine Selection */}
              <div className="space-y-2">
                <Label htmlFor="aiEngine">Select AI Engine *</Label>
                <Select value={selectedEngine} onValueChange={setSelectedEngine}>
                  <SelectTrigger id="aiEngine">
                    <SelectValue placeholder="Select AI engine" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lovable-ai">Lovable AI (Uses Project Credits)</SelectItem>
                    <SelectItem value="gemini-api">My Gemini API (Uses My API Key)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {selectedEngine === "lovable-ai" 
                    ? "Uses built-in AI credits from your Lovable project" 
                    : "Uses your personal Google Gemini API key for direct API access"}
                </p>
              </div>

              {/* Generate Button */}
              <Button
                type="button"
                onClick={handleGenerateContent}
                disabled={isGenerating}
                className="w-full"
                size="lg"
              >
                {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Generate & Review Draft
              </Button>
            </div>
          </TabsContent>

          {/* TAB 2: MANUAL EDITOR / REVIEW DRAFTS */}
          <TabsContent value="manual" className="space-y-6">
            {/* SEARCH & EDIT SECTION */}
            <div className="p-6 border-2 border-primary/20 rounded-lg bg-card/50 space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">
                Find an Existing Profile to Edit
              </h2>
              
              <div className="flex gap-3">
                <div className="flex-1">
                  <Label htmlFor="searchQuery">Search by Celebrity Name</Label>
                  <Input
                    id="searchQuery"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Type a celebrity name..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSearchProfiles();
                      }
                    }}
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    type="button"
                    onClick={handleSearchProfiles}
                    disabled={isSearching}
                    className="min-w-[120px]"
                  >
                    {isSearching && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Search
                  </Button>
                </div>
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h3 className="text-lg font-semibold text-foreground">
                    Search Results ({searchResults.length})
                  </h3>
                  <div className="max-h-[400px] overflow-y-auto space-y-2">
                    {searchResults.map((profile) => (
                      <div
                        key={profile.id}
                        className="flex items-center justify-between p-4 border border-border rounded-lg bg-background hover:bg-accent/5 transition-colors"
                      >
                        <div className="flex-1">
                          <p className="font-semibold text-foreground">{profile.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {profile.profession} • {new Date(profile.date_of_birth).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Slug: {profile.profile_slug}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            onClick={() => handleLoadProfile(profile)}
                            variant="default"
                            size="sm"
                          >
                            Load for Editing
                          </Button>
                          <Button
                            type="button"
                            onClick={() => setProfileToDelete({ id: profile.id, name: profile.name })}
                            variant="outline"
                            size="sm"
                            className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="p-6 border border-border rounded-lg bg-card space-y-6">
                <h2 className="text-2xl font-semibold text-foreground">
                  Create or Review Profile (Full Control)
                </h2>

                {/* Celebrity Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Celebrity Name *</Label>
                  <Input
                    id="name"
                    {...register("name")}
                    placeholder="e.g., Charli D'Amelio"
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name.message}</p>
                  )}
                </div>

                {/* Manual Profile Image */}
                <div className="space-y-2">
                  <Label htmlFor="profileImage">Manual Profile Image (Optional)</Label>
                  <Input
                    id="profileImage"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                  <p className="text-sm text-muted-foreground">
                    Upload a photo if you want to override the AI.
                  </p>
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="mt-2 w-32 h-32 object-cover rounded"
                    />
                  )}
                </div>

                {/* Profile Slug */}
                <div className="space-y-2">
                  <Label htmlFor="profileSlug">Profile URL Slug *</Label>
                  <Input
                    id="profileSlug"
                    {...register("profileSlug")}
                    placeholder="e.g., charli-d-amelio"
                  />
                  <p className="text-sm text-muted-foreground">
                    AI will generate this. You can edit.
                  </p>
                  {errors.profileSlug && (
                    <p className="text-sm text-destructive">{errors.profileSlug.message}</p>
                  )}
                </div>

                {/* Rich Text Editor */}
                <div className="space-y-2">
                  <Label>Main Article Content (250+ Words) *</Label>
                  <RichTextEditor
                    value={mainContent}
                    onChange={(value) => setValue("mainContent", value)}
                    placeholder="AI will generate the article here. You MUST review and edit this text."
                  />
                  <p className="text-sm text-muted-foreground">
                    AI will generate the 250+ word article here. You MUST review and edit this text.
                  </p>
                  {errors.mainContent && (
                    <p className="text-sm text-destructive">{errors.mainContent.message}</p>
                  )}
                </div>

                {/* SEO Meta Title */}
                <div className="space-y-2">
                  <Label htmlFor="metaTitle">SEO Meta Title *</Label>
                  <Input
                    id="metaTitle"
                    {...register("metaTitle")}
                    placeholder="Max 60 characters"
                    maxLength={60}
                  />
                  <p className="text-sm text-muted-foreground">
                    AI will generate this. You can edit.
                  </p>
                  {errors.metaTitle && (
                    <p className="text-sm text-destructive">{errors.metaTitle.message}</p>
                  )}
                </div>

                {/* SEO Meta Description */}
                <div className="space-y-2">
                  <Label htmlFor="metaDescription">SEO Meta Description *</Label>
                  <Textarea
                    id="metaDescription"
                    {...register("metaDescription")}
                    placeholder="Max 160 characters"
                    rows={3}
                    maxLength={160}
                  />
                  <p className="text-sm text-muted-foreground">
                    AI will generate this. You can edit.
                  </p>
                  {errors.metaDescription && (
                    <p className="text-sm text-destructive">
                      {errors.metaDescription.message}
                    </p>
                  )}
                </div>

                {/* Date of Birth */}
                <div className="space-y-2">
                  <Label>Date of Birth *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !dateOfBirth && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateOfBirth ? format(dateOfBirth, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dateOfBirth}
                        onSelect={(date) => setValue("dateOfBirth", date as Date)}
                        disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  <p className="text-sm text-muted-foreground">
                    AI will auto-fill this. Please verify and correct if needed.
                  </p>
                  {errors.dateOfBirth && (
                    <p className="text-sm text-destructive">{errors.dateOfBirth.message}</p>
                  )}
                </div>

                {/* Profession */}
                <div className="space-y-2">
                  <Label htmlFor="profession">Profession *</Label>
                  <Input
                    id="profession"
                    {...register("profession")}
                    placeholder="e.g., TikTok Star"
                  />
                  <p className="text-sm text-muted-foreground">
                    AI will auto-fill this. Please verify and correct if needed.
                  </p>
                  {errors.profession && (
                    <p className="text-sm text-destructive">{errors.profession.message}</p>
                  )}
                </div>

                {/* Place of Birth */}
                <div className="space-y-2">
                  <Label htmlFor="placeOfBirth">Place of Birth</Label>
                  <Input
                    id="placeOfBirth"
                    {...register("placeOfBirth")}
                    placeholder="e.g., Ashland, Kentucky"
                  />
                  <p className="text-sm text-muted-foreground">
                    AI will auto-fill this. Please verify and correct if needed.
                  </p>
                </div>

                {/* Known For Data (Auto-filled by AI) */}
                <div className="space-y-2">
                  <Label htmlFor="knownForData">Known For (JSON Data)</Label>
                  <Textarea
                    id="knownForData"
                    value={knownForData}
                    onChange={(e) => setKnownForData(e.target.value)}
                    placeholder='[{"title": "Titanic", "imageURL": "...", "year": "1997"}]'
                    rows={6}
                    className="font-mono text-xs"
                  />
                  <p className="text-sm text-muted-foreground">
                    The AI generates this automatically. It will be used to build the 'Known For' carousel. You can edit if needed.
                  </p>
                </div>

                {/* Face Embedding (Auto-filled by AI) */}
                <div className="space-y-2">
                  <Label htmlFor="faceEmbedding">Face Embedding (AI Generated)</Label>
                  <Textarea
                    id="faceEmbedding"
                    value={faceEmbedding}
                    onChange={(e) => setFaceEmbedding(e.target.value)}
                    placeholder='{"faceDetected": true, "embedding": [...], "confidence": 0.95}'
                    rows={4}
                    className="font-mono text-xs bg-muted"
                    readOnly
                  />
                  <p className="text-sm text-muted-foreground">
                    AI-generated numerical representation of the celebrity's face for look-alike matching. Leave as is.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <Button
                    type="button"
                    onClick={handlePreview}
                    variant="outline"
                    className="flex-1"
                    size="lg"
                  >
                    Preview Changes
                  </Button>
                  <Button type="submit" disabled={isSaving} className="flex-1" size="lg">
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save & Publish Profile
                  </Button>
                </div>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Confirmation Modal */}
      <AlertDialog open={!!profileToDelete} onOpenChange={(open) => !open && setProfileToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Permanent Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete this profile? This action cannot be undone.
              {profileToDelete && (
                <span className="block mt-2 font-semibold text-foreground">
                  You are about to delete: {profileToDelete.name}
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProfile}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Yes, Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminPanel;
