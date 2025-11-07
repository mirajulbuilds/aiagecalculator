import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowLeft, Plus, Sparkles, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const CelebrityAdmin: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [generatingBio, setGeneratingBio] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    profession: "",
    birthdate: "",
    birthplace: "",
    country: "",
    countryCode: "",
    knownFor: "",
    image: "",
    excerpt: "",
  });

  const [generatedBio, setGeneratedBio] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const generateBio = async () => {
    if (!formData.name || !formData.profession || !formData.birthdate) {
      toast({
        title: "Missing Information",
        description: "Please fill in at least name, profession, and birthdate to generate a bio.",
        variant: "destructive"
      });
      return;
    }

    setGeneratingBio(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-celebrity-bio', {
        body: {
          name: formData.name,
          profession: formData.profession,
          birthdate: formData.birthdate,
          birthplace: formData.birthplace,
          country: formData.country,
          knownFor: formData.knownFor
        }
      });

      if (error) throw error;

      if (data?.success) {
        setGeneratedBio(data.biography);
        toast({
          title: "Biography Generated!",
          description: `Generated ${data.wordCount} words using AI.`,
        });
      }
    } catch (error) {
      console.error('Error generating bio:', error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate biography",
        variant: "destructive"
      });
    } finally {
      setGeneratingBio(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Here you would typically save to your database
      // For now, we'll just show a success message
      console.log('Celebrity data:', {
        ...formData,
        bio: generatedBio
      });

      toast({
        title: "Celebrity Profile Created!",
        description: `${formData.name}'s profile has been created successfully.`,
      });

      // Reset form
      setFormData({
        name: "",
        profession: "",
        birthdate: "",
        birthplace: "",
        country: "",
        countryCode: "",
        knownFor: "",
        image: "",
        excerpt: "",
      });
      setGeneratedBio("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create celebrity profile",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <React.Fragment>
      <Helmet>
        <title>Celebrity Admin - Add New Profile | Famous Birthdays CMS</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <main className="min-h-screen bg-background">
        <header className="bg-gradient-to-br from-primary/10 via-accent/5 to-background py-6 px-4 border-b">
          <div className="container mx-auto max-w-4xl">
            <Link to="/famous-birthdays">
              <Button variant="ghost" className="mb-4 hover:bg-primary/10">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Famous Birthdays
              </Button>
            </Link>
            
            <div className="text-center">
              <h1 className="text-3xl md:text-4xl font-bold mb-2 text-foreground flex items-center justify-center gap-2">
                <Plus className="w-8 h-8" />
                Celebrity Admin Panel
              </h1>
              <p className="text-muted-foreground">
                Add new celebrity profiles with AI-generated biographies
              </p>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Card>
            <CardHeader>
              <CardTitle>Create New Celebrity Profile</CardTitle>
              <CardDescription>
                Fill in the celebrity information and use AI to generate a comprehensive 700+ word biography
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g., Taylor Swift"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="profession">Profession *</Label>
                    <Input
                      id="profession"
                      name="profession"
                      value={formData.profession}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g., Singer-Songwriter"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="birthdate">Birth Date *</Label>
                    <Input
                      id="birthdate"
                      name="birthdate"
                      type="date"
                      value={formData.birthdate}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="birthplace">Birthplace</Label>
                    <Input
                      id="birthplace"
                      name="birthplace"
                      value={formData.birthplace}
                      onChange={handleInputChange}
                      placeholder="e.g., Los Angeles, California"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      placeholder="e.g., United States"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="countryCode">Country Code (2 letters)</Label>
                    <Input
                      id="countryCode"
                      name="countryCode"
                      value={formData.countryCode}
                      onChange={handleInputChange}
                      placeholder="e.g., US"
                      maxLength={2}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="knownFor">Known For (helps AI generate better bio)</Label>
                  <Textarea
                    id="knownFor"
                    name="knownFor"
                    value={formData.knownFor}
                    onChange={handleInputChange}
                    placeholder="e.g., Grammy Award-winning albums, acting roles, achievements..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image">Profile Image URL</Label>
                  <Input
                    id="image"
                    name="image"
                    value={formData.image}
                    onChange={handleInputChange}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="excerpt">Short Excerpt (150-200 characters)</Label>
                  <Textarea
                    id="excerpt"
                    name="excerpt"
                    value={formData.excerpt}
                    onChange={handleInputChange}
                    placeholder="Brief description shown on celebrity cards..."
                    rows={2}
                  />
                </div>

                <div className="border-t pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">AI-Generated Biography</h3>
                      <p className="text-sm text-muted-foreground">
                        Generate a comprehensive 700+ word SEO-optimized biography using AI
                      </p>
                    </div>
                    <Button
                      type="button"
                      onClick={generateBio}
                      disabled={generatingBio || !formData.name || !formData.profession || !formData.birthdate}
                      variant="outline"
                    >
                      {generatingBio ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Generate Bio with AI
                        </>
                      )}
                    </Button>
                  </div>

                  {generatedBio && (
                    <div className="bg-accent/30 p-4 rounded-md border">
                      <div 
                        dangerouslySetInnerHTML={{ __html: generatedBio }}
                        className="prose prose-sm max-w-none"
                      />
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-6">
                  <Button
                    type="submit"
                    disabled={loading || !formData.name || !formData.profession || !formData.birthdate}
                    className="flex-1"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Celebrity Profile
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setFormData({
                        name: "",
                        profession: "",
                        birthdate: "",
                        birthplace: "",
                        country: "",
                        countryCode: "",
                        knownFor: "",
                        image: "",
                        excerpt: "",
                      });
                      setGeneratedBio("");
                    }}
                  >
                    Clear Form
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </React.Fragment>
  );
};

export default CelebrityAdmin;
