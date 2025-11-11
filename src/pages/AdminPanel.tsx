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
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import RichTextEditor from "@/components/RichTextEditor";

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

const AdminPanel = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

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
      if (!session) {
        navigate("/auth-gateway-key-a1b2c3");
      }
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        navigate("/auth-gateway-key-a1b2c3");
      }
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

  const handleGenerateContent = async () => {
    setIsGenerating(true);
    toast.info("AI content generation will be implemented in the next phase");
    setIsGenerating(false);
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
      } else {
        // Placeholder for AI image generation
        imageUrl = "https://via.placeholder.com/400x400?text=Celebrity+Photo";
      }

      // Insert celebrity data
      const { error: insertError } = await supabase.from("celebrities").insert({
        name: data.name,
        profile_slug: data.profileSlug,
        date_of_birth: format(data.dateOfBirth, "yyyy-MM-dd"),
        profession: data.profession,
        place_of_birth: data.placeOfBirth || null,
        main_content: data.mainContent,
        meta_title: data.metaTitle,
        meta_description: data.metaDescription,
        profile_image_url: imageUrl,
      });

      if (insertError) {
        toast.error("Failed to save celebrity: " + insertError.message);
        setIsSaving(false);
        return;
      }

      toast.success("Celebrity profile saved successfully!");
      // Reset form or redirect
    } catch (error) {
      console.error("Error saving celebrity:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
          Celebrity Content Management System
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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

          {/* Profile Slug */}
          <div className="space-y-2">
            <Label htmlFor="profileSlug">Profile URL Slug (Unique) *</Label>
            <Input
              id="profileSlug"
              {...register("profileSlug")}
              placeholder="e.g., charli-d-amelio (no spaces, all lowercase)"
            />
            {errors.profileSlug && (
              <p className="text-sm text-destructive">{errors.profileSlug.message}</p>
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
          </div>

          {/* Manual Image Upload */}
          <div className="space-y-2">
            <Label htmlFor="profileImage">Manual Profile Image (Optional)</Label>
            <Input
              id="profileImage"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
            />
            <p className="text-sm text-muted-foreground">
              Use this to override the AI. If left empty, the AI will try to find an image.
            </p>
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Preview"
                className="mt-2 w-32 h-32 object-cover rounded"
              />
            )}
          </div>

          {/* AI Hint */}
          <div className="space-y-2">
            <Label htmlFor="aiHint">Optional Hint for AI</Label>
            <Textarea
              id="aiHint"
              {...register("aiHint")}
              placeholder="Provide specific details or links if the AI struggles to find the correct celebrity."
              rows={3}
            />
          </div>

          {/* AI Generate Button */}
          <Button
            type="button"
            onClick={handleGenerateContent}
            disabled={isGenerating}
            variant="secondary"
            className="w-full"
          >
            {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Generate AI Content (Step 1)
          </Button>

          {/* Rich Text Editor */}
          <div className="space-y-2">
            <Label>Main Content (Biography, Trivia, etc.) *</Label>
            <RichTextEditor
              value={mainContent}
              onChange={(value) => setValue("mainContent", value)}
              placeholder="Click 'Generate AI Content' to fill this, or write manually."
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
              rows={3}
              maxLength={160}
            />
            {errors.metaDescription && (
              <p className="text-sm text-destructive">
                {errors.metaDescription.message}
              </p>
            )}
          </div>

          {/* Save Button */}
          <Button type="submit" disabled={isSaving} className="w-full" size="lg">
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save & Publish Profile (Step 2)
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AdminPanel;
