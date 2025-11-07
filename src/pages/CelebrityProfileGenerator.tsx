import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Download } from "lucide-react";

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
      toast({
        title: "Profile Generated!",
        description: "Celebrity profile has been created successfully.",
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

  const handleDownload = () => {
    if (!generatedProfile) return;

    const fullProfile = {
      ...formData,
      ...generatedProfile,
      id: formData.name.toLowerCase().replace(/\s+/g, "-"),
      slug: formData.name.toLowerCase().replace(/\s+/g, "-"),
      birth_sign: "TBD",
      country_code: "us",
      excerpt: generatedProfile.about.substring(0, 200) + "...",
      image: "/placeholder.svg",
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

          <Button onClick={handleGenerate} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Profile...
              </>
            ) : (
              "Generate Profile"
            )}
          </Button>

          {generatedProfile && (
            <div className="space-y-4 border-t pt-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">Generated Profile</h3>
                <Button onClick={handleDownload} variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Download JSON
                </Button>
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
