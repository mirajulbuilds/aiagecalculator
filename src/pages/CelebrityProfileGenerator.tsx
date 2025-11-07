import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Download, CheckCircle2, XCircle, Upload, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const CelebrityProfileGenerator: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    profession: "",
    birthdate: "",
    birthplace: "",
    country: "",
  });
  const [generatedProfile, setGeneratedProfile] = useState<any>(null);
  const [customImage, setCustomImage] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!formData.name || !formData.profession || !formData.birthdate || !formData.birthplace || !formData.country) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-celebrity-profile", {
        body: formData,
      });

      if (error) {
        throw error;
      }

      setGeneratedProfile(data);
      const textGenerated = data.about ? "✓" : "✗";
      const imageGenerated = data.image_generated ? "✓" : "✗";
      toast({
        title: "Profile Generated!",
        description: `Text: ${textGenerated} | Image: ${imageGenerated}`,
      });
    } catch (error: any) {
      console.error("Error:", error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadJSON = () => {
    if (!generatedProfile) return;

    const imageToUse = customImage || generatedProfile.image || "/placeholder.svg";

    const fullProfile = {
      ...formData,
      ...generatedProfile,
      id: formData.name.toLowerCase().replace(/\s+/g, "-"),
      slug: formData.name.toLowerCase().replace(/\s+/g, "-"),
      birth_sign: "TBD",
      country_code: "us",
      excerpt: generatedProfile.about.substring(0, 200) + "...",
      image: imageToUse,
      social_links: {
        instagram: `https://instagram.com/${formData.name.toLowerCase().replace(/\s+/g, "")}`,
        twitter: `https://twitter.com/${formData.name.toLowerCase().replace(/\s+/g, "")}`,
      },
      popularity_score: 500,
      trending: false,
    };

    const dataStr = JSON.stringify(fullProfile, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${formData.name.toLowerCase().replace(/\s+/g, "-")}-profile.json`;
    link.click();
  };

  const handleDownloadImage = () => {
    if (!generatedProfile?.image && !customImage) return;

    const imageToDownload = customImage || generatedProfile.image;
    const link = document.createElement("a");
    link.href = imageToDownload;
    link.download = `${formData.name.toLowerCase().replace(/\s+/g, "-")}.png`;
    link.click();
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Celebrity Profile Generator</CardTitle>
          <p className="text-muted-foreground">
            Generate AI-powered celebrity profiles with 800+ word biographies
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Taylor Swift"
              />
            </div>
            <div>
              <Label htmlFor="profession">Profession</Label>
              <Input
                id="profession"
                value={formData.profession}
                onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                placeholder="e.g., Singer-Songwriter"
              />
            </div>
            <div>
              <Label htmlFor="birthdate">Birth Date</Label>
              <Input
                id="birthdate"
                type="date"
                value={formData.birthdate}
                onChange={(e) => setFormData({ ...formData, birthdate: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="birthplace">Birth Place</Label>
              <Input
                id="birthplace"
                value={formData.birthplace}
                onChange={(e) => setFormData({ ...formData, birthplace: e.target.value })}
                placeholder="e.g., Los Angeles, CA"
              />
            </div>
            <div>
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                placeholder="e.g., United States"
              />
            </div>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Credit Usage:</strong> Each generation uses 2 credits (1 for text + 1 for image). 
              Make sure all information is correct before generating.
            </AlertDescription>
          </Alert>

          <Button onClick={handleGenerate} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Profile (Text + Image)...
              </>
            ) : (
              "Generate Profile (2 Credits)"
            )}
          </Button>

          {generatedProfile && (
            <div className="space-y-4 border-t pt-6">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <h3 className="text-xl font-bold">Generated Profile</h3>
                <div className="flex gap-2">
                  <Button onClick={handleDownloadJSON} variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Download JSON
                  </Button>
                  {(generatedProfile.image || customImage) && (
                    <Button onClick={handleDownloadImage} variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Download Image
                    </Button>
                  )}
                </div>
              </div>

              {/* Generation Status */}
              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-2">
                  {generatedProfile.about ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                  <span>Text Generated</span>
                </div>
                <div className="flex items-center gap-2">
                  {generatedProfile.image_generated || customImage ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                  <span>Image Generated</span>
                </div>
              </div>

              {/* Image Preview and Upload */}
              <div className="space-y-2">
                <Label>Profile Image</Label>
                {(generatedProfile.image || customImage) ? (
                  <div className="relative">
                    <img 
                      src={customImage || generatedProfile.image} 
                      alt={formData.name}
                      className="w-full max-w-md h-64 object-cover rounded-lg border"
                    />
                    <Label htmlFor="image-upload" className="absolute bottom-2 right-2">
                      <Button variant="secondary" size="sm" asChild>
                        <span className="cursor-pointer">
                          <Upload className="w-4 h-4 mr-2" />
                          Replace Image
                        </span>
                      </Button>
                    </Label>
                    <Input 
                      id="image-upload"
                      type="file" 
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </div>
                ) : (
                  <div className="border-2 border-dashed rounded-lg p-8 text-center">
                    <p className="text-muted-foreground mb-4">No image generated. Upload one manually:</p>
                    <Label htmlFor="image-upload">
                      <Button variant="outline" asChild>
                        <span className="cursor-pointer">
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Image
                        </span>
                      </Button>
                    </Label>
                    <Input 
                      id="image-upload"
                      type="file" 
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">About ({generatedProfile.about.split(/\s+/).length} words)</h4>
                  <Textarea
                    value={generatedProfile.about}
                    readOnly
                    className="min-h-[300px] font-mono text-sm"
                  />
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Before Fame</h4>
                  <Textarea
                    value={generatedProfile.before_fame}
                    readOnly
                    className="min-h-[100px] font-mono text-sm"
                  />
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Trivia</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {generatedProfile.trivia.map((item: string, index: number) => (
                      <li key={index} className="text-sm">{item}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Family Life</h4>
                  <Textarea
                    value={generatedProfile.family_life}
                    readOnly
                    className="min-h-[100px] font-mono text-sm"
                  />
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Associated With</h4>
                  <Textarea
                    value={generatedProfile.associated_with}
                    readOnly
                    className="min-h-[100px] font-mono text-sm"
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CelebrityProfileGenerator;
