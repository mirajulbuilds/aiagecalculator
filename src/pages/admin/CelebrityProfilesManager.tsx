import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import DOMPurify from "dompurify";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logAdminAction } from "@/lib/auditLogger";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
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
import { CalendarIcon, Loader2, Trash2, ArrowLeft, Upload } from "lucide-react";
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext } from "@/components/ui/pagination";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import RichTextEditor from "@/components/RichTextEditor";
import { BulkSEORegenerator } from "@/components/BulkSEORegenerator";

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

const CelebrityProfilesManager = () => {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [zodiacSign, setZodiacSign] = useState<string>("");
  const [popularityRanks, setPopularityRanks] = useState<any>(null);
  const [knownForData, setKnownForData] = useState<string>("");
  const [faceEmbedding, setFaceEmbedding] = useState<string>("");
  const [editingProfileId, setEditingProfileId] = useState<string | null>(null);
  
  // All Profiles Data Table state
  const [allProfiles, setAllProfiles] = useState<CelebrityData[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<CelebrityData[]>([]);
  const [tableSearchQuery, setTableSearchQuery] = useState<string>("");
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 50;
  
  // Delete confirmation state
  const [profileToDelete, setProfileToDelete] = useState<{ id: string; name: string } | null>(null);
  
  // Unsaved changes dialog state
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    setValue,
    watch,
    reset,
  } = useForm<CelebrityFormData>({
    resolver: zodResolver(celebritySchema),
  });

  const mainContent = watch("mainContent");

  // Fetch celebrity profiles with pagination
  const fetchAllProfiles = async () => {
    setIsLoadingProfiles(true);
    try {
      // Get total count
      const { count, error: countError } = await supabase
        .from("celebrities")
        .select("*", { count: 'exact', head: true });

      if (countError) {
        console.error("Error fetching count:", countError);
        toast.error("Failed to load profile count");
        return;
      }

      setTotalCount(count || 0);

      // Calculate pagination range
      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;

      // Fetch paginated data
      const { data, error } = await supabase
        .from("celebrities")
        .select("*")
        .order("name")
        .range(from, to);

      if (error) {
        console.error("Error fetching profiles:", error);
        toast.error("Failed to load celebrity profiles");
        return;
      }

      setAllProfiles(data || []);
      setFilteredProfiles(data || []);
    } catch (error) {
      console.error("Error loading profiles:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoadingProfiles(false);
    }
  };

  // Filter profiles based on search query
  useEffect(() => {
    if (!tableSearchQuery.trim()) {
      setFilteredProfiles(allProfiles);
      return;
    }

    const query = tableSearchQuery.toLowerCase();
    const filtered = allProfiles.filter(profile => 
      profile.name.toLowerCase().includes(query) ||
      profile.profession.toLowerCase().includes(query) ||
      profile.profile_slug.toLowerCase().includes(query)
    );
    setFilteredProfiles(filtered);
  }, [tableSearchQuery, allProfiles]);

  // Load profiles when page changes
  useEffect(() => {
    fetchAllProfiles();
  }, [currentPage]);

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
    
    // Set editing profile ID
    setEditingProfileId(profile.id);
    
    toast.success(`Loaded profile: ${profile.name}`);
    
    // Scroll to form
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  const handleDeleteProfile = async () => {
    if (!profileToDelete) return;
    
    // Get profile data before deletion for audit log
    const profileData = allProfiles.find(p => p.id === profileToDelete.id);

    setIsDeleting(true);
    
    try {
      const { error } = await supabase
        .from("celebrities")
        .delete()
        .eq("id", profileToDelete.id);

      if (error) {
        console.error("Delete error:", error);
        toast.error("Failed to delete profile");
        return;
      }

      await logAdminAction({
        action_type: "delete",
        resource_type: "celebrity",
        resource_id: profileToDelete.id,
        resource_name: profileToDelete.name,
      });

      toast.success("Profile deleted successfully");
      
      // Refresh the profiles list and reset to first page
      setCurrentPage(1);
      fetchAllProfiles();
      
      // Reset the form if we were editing this profile
      if (editingProfileId === profileToDelete.id) {
        reset();
        setEditingProfileId(null);
        setImagePreview("");
        setZodiacSign("");
        setPopularityRanks(null);
        setKnownForData("");
        setFaceEmbedding("");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsDeleting(false);
      setProfileToDelete(null);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProfileImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handlePreview = () => {
    const sanitizedContent = DOMPurify.sanitize(mainContent || "");
    const previewData = {
      name: watch("name"),
      profileSlug: watch("profileSlug"),
      mainContent: sanitizedContent,
      metaTitle: watch("metaTitle"),
      metaDescription: watch("metaDescription"),
      profession: watch("profession"),
      dateOfBirth: watch("dateOfBirth"),
      placeOfBirth: watch("placeOfBirth"),
      imagePreview,
      zodiacSign,
    };

    const previewWindow = window.open("/celebrity-preview", "_blank");
    if (previewWindow) {
      setTimeout(() => {
        previewWindow.postMessage({ type: "CELEBRITY_PREVIEW", data: previewData }, "*");
      }, 500);
    }
  };

  const onSubmit = async (data: CelebrityFormData) => {
    setIsSaving(true);

    try {
      let imageUrl = imagePreview;

      // Upload image if a new one was selected
      if (profileImage) {
        const fileExt = profileImage.name.split('.').pop();
        const fileName = `${data.profileSlug}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError, data: uploadData } = await supabase.storage
          .from('celebrity-profiles')
          .upload(filePath, profileImage, { upsert: true });

        if (uploadError) {
          console.error("Upload error:", uploadError);
          toast.error("Failed to upload image");
          return;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('celebrity-profiles')
          .getPublicUrl(filePath);

        imageUrl = publicUrl;
      }

      const sanitizedContent = DOMPurify.sanitize(data.mainContent);

      const profileData = {
        name: data.name,
        profile_slug: data.profileSlug,
        date_of_birth: data.dateOfBirth.toISOString().split('T')[0],
        profession: data.profession,
        place_of_birth: data.placeOfBirth || null,
        main_content: sanitizedContent,
        meta_title: data.metaTitle,
        meta_description: data.metaDescription,
        profile_image_url: imageUrl,
        zodiac_sign: zodiacSign || null,
        popularity_ranks: popularityRanks || null,
        known_for_data: knownForData ? JSON.parse(knownForData) : null,
        face_embedding: faceEmbedding ? JSON.parse(faceEmbedding) : null,
      };

      if (editingProfileId) {
        // Update existing profile
        const { error } = await supabase
          .from("celebrities")
          .update(profileData)
          .eq("id", editingProfileId);

        if (error) {
          console.error("Update error:", error);
          toast.error("Failed to update profile");
          return;
        }

        await logAdminAction({
          action_type: "update",
          resource_type: "celebrity",
          resource_id: editingProfileId,
          resource_name: data.name,
        });

        toast.success("Profile updated successfully!");
      } else {
        // Create new profile
        const { error } = await supabase
          .from("celebrities")
          .insert([profileData]);

        if (error) {
          console.error("Insert error:", error);
          toast.error("Failed to save profile");
          return;
        }

        await logAdminAction({
          action_type: "create",
          resource_type: "celebrity",
          resource_name: data.name,
        });

        toast.success("Profile created successfully!");
      }

      // Reset form and refresh list
      reset();
      setEditingProfileId(null);
      setProfileImage(null);
      setImagePreview("");
      setZodiacSign("");
      setPopularityRanks(null);
      setKnownForData("");
      setFaceEmbedding("");
      setCurrentPage(1);
      fetchAllProfiles();

    } catch (error) {
      console.error("Save error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  const handleBackClick = () => {
    if (isDirty) {
      setShowUnsavedDialog(true);
    } else {
      navigate("/celebrity-content-engine");
    }
  };

  const handleConfirmNavigation = () => {
    setShowUnsavedDialog(false);
    navigate("/celebrity-content-engine");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        {/* Breadcrumb Navigation */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/system-control-panel-x4y5z6">Admin Panel</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/celebrity-content-engine">Content Engine</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Manage Profiles</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              onClick={handleBackClick}
              variant="outline"
              size="sm"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Content Engine
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Manage All Celebrity Profiles</h1>
              <p className="text-muted-foreground mt-1">View, edit, and delete existing profiles</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">{totalCount}</div>
            <div className="text-xs text-muted-foreground">Total Profiles</div>
          </div>
        </div>

        {/* Bulk SEO Regeneration Tool */}
        <BulkSEORegenerator />

        {/* ALL PROFILES DATA TABLE */}
        <div className="p-6 border-2 border-primary/20 rounded-lg bg-card/50 space-y-4 mb-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-foreground">
              All Celebrity Profiles
            </h2>
            <div className="text-sm text-muted-foreground">
              Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} profiles
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <Label htmlFor="tableSearch">Search Profiles</Label>
              <Input
                id="tableSearch"
                type="text"
                value={tableSearchQuery}
                onChange={(e) => setTableSearchQuery(e.target.value)}
                placeholder="Search by name, profession, or slug..."
                className="max-w-sm"
              />
            </div>
            <Button
              type="button"
              onClick={() => {
                setCurrentPage(1);
                fetchAllProfiles();
              }}
              variant="outline"
              size="sm"
            >
              Refresh
            </Button>
          </div>

          {/* Loading State */}
          {isLoadingProfiles && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {/* Data Table */}
          {!isLoadingProfiles && (
            <div className="rounded-md border">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                        Image
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                        Name
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                        Profession
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                        Date of Birth
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                        Slug
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProfiles.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="h-24 text-center text-muted-foreground">
                          {tableSearchQuery ? "No profiles match your search." : "No profiles found."}
                        </td>
                      </tr>
                    ) : (
                      filteredProfiles.map((profile) => (
                        <tr key={profile.id} className="border-b transition-colors hover:bg-muted/50">
                          <td className="p-4 align-middle">
                            <img 
                              src={profile.profile_image_url} 
                              alt={profile.name}
                              className="h-12 w-12 rounded-full object-cover"
                            />
                          </td>
                          <td className="p-4 align-middle font-medium">
                            {profile.name}
                          </td>
                          <td className="p-4 align-middle text-muted-foreground">
                            {profile.profession}
                          </td>
                          <td className="p-4 align-middle text-muted-foreground">
                            {new Date(profile.date_of_birth).toLocaleDateString()}
                          </td>
                          <td className="p-4 align-middle text-sm text-muted-foreground">
                            {profile.profile_slug}
                          </td>
                          <td className="p-4 align-middle">
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                onClick={() => handleLoadProfile(profile)}
                                variant="default"
                                size="sm"
                              >
                                Edit
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
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination Controls */}
              {filteredProfiles.length > 0 && totalCount > 0 && (
                <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/50">
                  <p className="text-sm text-muted-foreground">
                    Page {currentPage} of {Math.ceil(totalCount / itemsPerPage)}
                  </p>
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => setCurrentPage(prev => Math.min(Math.ceil(totalCount / itemsPerPage), prev + 1))}
                          className={currentPage >= Math.ceil(totalCount / itemsPerPage) ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </div>
          )}
        </div>

        {/* EDIT FORM */}
        {editingProfileId && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="p-6 border border-border rounded-lg bg-card space-y-6">
              <h2 className="text-2xl font-semibold text-foreground">
                Edit Profile: {watch("name")}
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
                <Label htmlFor="profileImage">Profile Image</Label>
                <Input
                  id="profileImage"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
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
                  placeholder="Profile content..."
                />
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
                  maxLength={160}
                />
                {errors.metaDescription && (
                  <p className="text-sm text-destructive">{errors.metaDescription.message}</p>
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
                {errors.profession && (
                  <p className="text-sm text-destructive">{errors.profession.message}</p>
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
                        !watch("dateOfBirth") && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {watch("dateOfBirth") ? format(watch("dateOfBirth"), "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={watch("dateOfBirth")}
                      onSelect={(date) => date && setValue("dateOfBirth", date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {errors.dateOfBirth && (
                  <p className="text-sm text-destructive">{errors.dateOfBirth.message}</p>
                )}
              </div>

              {/* Place of Birth */}
              <div className="space-y-2">
                <Label htmlFor="placeOfBirth">Place of Birth</Label>
                <Input
                  id="placeOfBirth"
                  {...register("placeOfBirth")}
                  placeholder="e.g., Norwalk, Connecticut"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <Button
                  type="button"
                  onClick={handlePreview}
                  variant="outline"
                  disabled={!watch("name") || !mainContent}
                >
                  Preview Changes
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    reset();
                    setEditingProfileId(null);
                    setImagePreview("");
                    setZodiacSign("");
                    setPopularityRanks(null);
                    setKnownForData("");
                    setFaceEmbedding("");
                  }}
                  variant="ghost"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </form>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!profileToDelete} onOpenChange={(open) => !open && setProfileToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the profile for <strong>{profileToDelete?.name}</strong>.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProfile}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Unsaved Changes Confirmation Dialog */}
      <AlertDialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes in the form. Are you sure you want to leave this page? 
              All unsaved changes will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Stay on Page</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmNavigation}>
              Leave Page
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CelebrityProfilesManager;
