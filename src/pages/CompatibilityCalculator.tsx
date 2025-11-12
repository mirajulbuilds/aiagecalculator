import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, CalendarIcon, Share2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Helmet } from "react-helmet-async";
import { SITE_CONFIG } from "@/lib/config";
import PageTransition from "@/components/PageTransition";

interface CompatibilityResult {
  total_score: number;
  summary_text: string;
  breakdown: {
    your_zodiac: string;
    their_zodiac: string;
    your_chinese_zodiac: string;
    their_chinese_zodiac: string;
    your_life_path: number;
    their_life_path: number;
  };
}

const CompatibilityCalculator = () => {
  const [day1, setDay1] = useState<string>("");
  const [month1, setMonth1] = useState<string>("");
  const [year1, setYear1] = useState<string>("");
  const [day2, setDay2] = useState<string>("");
  const [month2, setMonth2] = useState<string>("");
  const [year2, setYear2] = useState<string>("");
  const [isCalculating, setIsCalculating] = useState(false);
  const [result, setResult] = useState<CompatibilityResult | null>(null);

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

  const handleCalculate = async () => {
    if (!day1 || !month1 || !year1 || !day2 || !month2 || !year2) {
      toast.error("Please select both birthdays");
      return;
    }

    // Combine dropdown values into date objects for validation
    const birthDate1 = new Date(parseInt(year1), parseInt(month1) - 1, parseInt(day1));
    const birthDate2 = new Date(parseInt(year2), parseInt(month2) - 1, parseInt(day2));

    if (isNaN(birthDate1.getTime()) || isNaN(birthDate2.getTime())) {
      toast.error("Please select valid dates");
      return;
    }

    if (birthDate1 > new Date() || birthDate2 > new Date()) {
      toast.error("Birth dates cannot be in the future");
      return;
    }

    setIsCalculating(true);
    setResult(null);

    try {
      // Format dates as YYYY-MM-DD strings for backend
      const date1String = `${year1}-${month1.padStart(2, '0')}-${day1.padStart(2, '0')}`;
      const date2String = `${year2}-${month2.padStart(2, '0')}-${day2.padStart(2, '0')}`;

      const { data, error } = await supabase.functions.invoke("birthday-compatibility", {
        body: {
          date1: date1String,
          date2: date2String,
        },
      });

      if (error) {
        console.error("Function error:", error);
        throw new Error("Failed to calculate compatibility");
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setResult(data);
      toast.success("Compatibility calculated!");
    } catch (error) {
      console.error("Error calculating compatibility:", error);
      toast.error(error instanceof Error ? error.message : "Failed to calculate compatibility");
    } finally {
      setIsCalculating(false);
    }
  };

  const handleShare = async () => {
    if (!result) return;

    const shareText = `Our birthday compatibility is ${result.total_score}%! Find out yours at`;
    const shareUrl = `${SITE_CONFIG.canonicalUrl}/compatibility-calculator`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: "Birthday Compatibility Calculator",
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
        <title>Birthday Compatibility Calculator | Zodiac, Numerology & More</title>
        <meta
          name="description"
          content="Discover how compatible you are with your partner, friend, or crush based on Zodiac signs, Numerology, and Chinese Zodiac. Free compatibility calculator!"
        />
        <meta
          name="keywords"
          content="birthday compatibility, zodiac compatibility, numerology compatibility, relationship compatibility, love calculator"
        />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Heart className="w-8 h-8 text-primary" />
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Find Your Birthday Compatibility
              </h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover how compatible you are with your partner, friend, or crush based on Zodiac signs, Numerology, and more!
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Input Section */}
            <Card className="bg-card/50 backdrop-blur content-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-primary" />
                  Select Birthdays
                </CardTitle>
                <CardDescription>Choose both birthdays to calculate compatibility</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Your Birthday */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Your Birthday</label>
                  <div className="grid grid-cols-3 gap-2">
                    <Select value={day1} onValueChange={setDay1}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Day" />
                      </SelectTrigger>
                      <SelectContent>
                        {days.map((day) => (
                          <SelectItem key={day} value={day}>
                            {day}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={month1} onValueChange={setMonth1}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Month" />
                      </SelectTrigger>
                      <SelectContent>
                        {months.map((month) => (
                          <SelectItem key={month.value} value={month.value}>
                            {month.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={year1} onValueChange={setYear1}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Year" />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map((year) => (
                          <SelectItem key={year} value={year}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Their Birthday */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Their Birthday</label>
                  <div className="grid grid-cols-3 gap-2">
                    <Select value={day2} onValueChange={setDay2}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Day" />
                      </SelectTrigger>
                      <SelectContent>
                        {days.map((day) => (
                          <SelectItem key={day} value={day}>
                            {day}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={month2} onValueChange={setMonth2}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Month" />
                      </SelectTrigger>
                      <SelectContent>
                        {months.map((month) => (
                          <SelectItem key={month.value} value={month.value}>
                            {month.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={year2} onValueChange={setYear2}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Year" />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map((year) => (
                          <SelectItem key={year} value={year}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  onClick={handleCalculate}
                  disabled={!day1 || !month1 || !year1 || !day2 || !month2 || !year2 || isCalculating}
                  className="w-full main-action-button"
                  size="lg"
                >
                  {isCalculating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Calculating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Calculate Compatibility
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Results Section */}
            <Card className="bg-card/50 backdrop-blur content-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-primary" />
                  Compatibility Result
                </CardTitle>
                <CardDescription>
                  {result ? "Your compatibility score!" : "Select both birthdays to see results"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {result ? (
                  <div className="space-y-6 animate-fade-in">
                    {/* Score */}
                    <div className="text-center py-8">
                      <p className="text-lg text-muted-foreground mb-4">Your Compatibility Score</p>
                      <div className="text-8xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent mb-4">
                        {result.total_score}%
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="bg-primary/5 rounded-lg p-4">
                      <p className="text-sm leading-relaxed">{result.summary_text}</p>
                    </div>

                    {/* Breakdown */}
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Your Signs:</span>
                        <span className="font-medium">
                          {result.breakdown.your_zodiac} • {result.breakdown.your_chinese_zodiac} • Life Path{" "}
                          {result.breakdown.your_life_path}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Their Signs:</span>
                        <span className="font-medium">
                          {result.breakdown.their_zodiac} • {result.breakdown.their_chinese_zodiac} • Life Path{" "}
                          {result.breakdown.their_life_path}
                        </span>
                      </div>
                    </div>

                    <Button variant="outline" className="w-full" onClick={handleShare}>
                      <Share2 className="w-4 h-4 mr-2" />
                      Share Your Score!
                    </Button>

                    <div className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setDay1("");
                          setMonth1("");
                          setYear1("");
                          setDay2("");
                          setMonth2("");
                          setYear2("");
                          setResult(null);
                        }}
                      >
                        Calculate Another
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Heart className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Select both birthdays to discover your compatibility!</p>
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
                <h4 className="font-semibold mb-2">Enter Birthdays</h4>
                <p className="text-sm text-muted-foreground">Select your birthday and their birthday</p>
              </div>
              <div className="text-center">
                <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-primary">2</span>
                </div>
                <h4 className="font-semibold mb-2">AI Analysis</h4>
                <p className="text-sm text-muted-foreground">
                  Our AI analyzes Zodiac, Chinese Zodiac, and Numerology
                </p>
              </div>
              <div className="text-center">
                <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-primary">3</span>
                </div>
                <h4 className="font-semibold mb-2">Get Results</h4>
                <p className="text-sm text-muted-foreground">See your compatibility score and detailed breakdown!</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
    </PageTransition>
  );
};

export default CompatibilityCalculator;
