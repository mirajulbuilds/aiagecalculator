import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Share2, History } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Helmet } from "react-helmet-async";
import { SITE_CONFIG } from "@/lib/config";
import PageTransition from "@/components/PageTransition";

const PastLifeGenerator = () => {
  const [day, setDay] = useState<string>("");
  const [month, setMonth] = useState<string>("");
  const [year, setYear] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [pastLifeStory, setPastLifeStory] = useState<string>("");

  const months = [
    { value: "1", label: "January" },
    { value: "2", label: "February" },
    { value: "3", label: "March" },
    { value: "4", label: "April" },
    { value: "5", label: "May" },
    { value: "6", label: "June" },
    { value: "7", label: "July" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString());
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1899 }, (_, i) => (currentYear - i).toString());

  const handleGenerate = async () => {
    if (!day || !month || !year) {
      toast.error("Please select your complete birth date");
      return;
    }

    // Validate date
    const birthDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    if (isNaN(birthDate.getTime())) {
      toast.error("Please select a valid date");
      return;
    }

    if (birthDate > new Date()) {
      toast.error("Birth date cannot be in the future");
      return;
    }

    setIsGenerating(true);
    setPastLifeStory("");

    try {
      // Format date as YYYY-MM-DD
      const dateString = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

      const { data, error } = await supabase.functions.invoke("past-life-generator", {
        body: { birthDate: dateString },
      });

      if (error) {
        console.error("Function error:", error);
        throw new Error("Failed to generate past life story");
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setPastLifeStory(data.past_life_story);
      toast.success("Your past life has been revealed!");
    } catch (error) {
      console.error("Error generating past life:", error);
      toast.error(error instanceof Error ? error.message : "Failed to generate past life story");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = async () => {
    if (!pastLifeStory) return;

    const shareText = `My AI past life story is amazing! Find out yours at`;
    const shareUrl = `${SITE_CONFIG.canonicalUrl}/past-life-generator`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: "Past Life Generator",
          text: shareText,
          url: shareUrl,
        });
        toast.success("Shared successfully!");
      } else {
        await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
        toast.success("Link copied to clipboard!");
      }
    } catch (error) {
      console.error("Error sharing:", error);
      try {
        await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
        toast.success("Link copied to clipboard!");
      } catch (clipboardError) {
        toast.error("Failed to share");
      }
    }
  };

  return (
    <PageTransition>
    <>
      <Helmet>
        <title>What Was I in My Past Life? | AI Past Life Generator</title>
        <meta
          name="description"
          content="Discover your past life! Enter your date of birth, and our AI will generate a unique and surprising story based on your birthday and Zodiac sign."
        />
        <meta
          name="keywords"
          content="past life, past life generator, reincarnation, zodiac, numerology, past life story"
        />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <History className="w-8 h-8 text-primary" />
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                What Was Your Past Life?
              </h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover your past life! Enter your date of birth, and our AI will generate a unique and surprising story
              based on your birthday and Zodiac sign.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Input Section */}
            <Card className="bg-card/50 backdrop-blur content-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Enter Your Birth Date
                </CardTitle>
                <CardDescription>Select your date of birth to reveal your past life</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date of Birth</label>
                  <div className="grid grid-cols-3 gap-2">
                    <Select value={day} onValueChange={setDay}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Day" />
                      </SelectTrigger>
                      <SelectContent>
                        {days.map((d) => (
                          <SelectItem key={d} value={d}>
                            {d}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={month} onValueChange={setMonth}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Month" />
                      </SelectTrigger>
                      <SelectContent>
                        {months.map((m) => (
                          <SelectItem key={m.value} value={m.value}>
                            {m.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={year} onValueChange={setYear}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Year" />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map((y) => (
                          <SelectItem key={y} value={y}>
                            {y}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={!day || !month || !year || isGenerating}
                  className="w-full main-action-button"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Consulting the archives...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Reveal My Past Life
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Results Section */}
            <Card className="bg-card/50 backdrop-blur content-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="w-5 h-5 text-primary" />
                  Your Past Life Story
                </CardTitle>
                <CardDescription>
                  {pastLifeStory ? "Your past life has been revealed!" : "Enter your birth date to see results"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pastLifeStory ? (
                  <div className="space-y-6 animate-fade-in">
                    <div className="bg-primary/5 rounded-lg p-6">
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{pastLifeStory}</p>
                    </div>

                    <Button variant="outline" className="w-full" onClick={handleShare}>
                      <Share2 className="w-4 h-4 mr-2" />
                      Share Your Past Life!
                    </Button>

                    <div className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setDay("");
                          setMonth("");
                          setYear("");
                          setPastLifeStory("");
                        }}
                      >
                        Try Another Date
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <History className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Enter your birth date to discover your past life!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* How It Works */}
          <Card className="mt-8 bg-gradient-to-br from-primary/5 to-purple-600/5">
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-primary">1</span>
                </div>
                <h4 className="font-semibold mb-2">Enter Birthday</h4>
                <p className="text-sm text-muted-foreground">Select your complete date of birth</p>
              </div>
              <div className="text-center">
                <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-primary">2</span>
                </div>
                <h4 className="font-semibold mb-2">AI Analysis</h4>
                <p className="text-sm text-muted-foreground">Our AI analyzes your Zodiac sign and Life Path Number</p>
              </div>
              <div className="text-center">
                <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-primary">3</span>
                </div>
                <h4 className="font-semibold mb-2">Get Your Story</h4>
                <p className="text-sm text-muted-foreground">Receive your unique, AI-generated past life story!</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
    </PageTransition>
  );
};

export default PastLifeGenerator;
