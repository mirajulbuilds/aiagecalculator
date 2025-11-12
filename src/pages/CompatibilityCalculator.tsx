import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Heart, CalendarIcon, Share2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Helmet } from "react-helmet-async";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { SITE_CONFIG } from "@/lib/config";

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
  const [date1, setDate1] = useState<Date>();
  const [date2, setDate2] = useState<Date>();
  const [isCalculating, setIsCalculating] = useState(false);
  const [result, setResult] = useState<CompatibilityResult | null>(null);

  const handleCalculate = async () => {
    if (!date1 || !date2) {
      toast.error("Please select both birthdays");
      return;
    }

    setIsCalculating(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("birthday-compatibility", {
        body: {
          date1: format(date1, "yyyy-MM-dd"),
          date2: format(date2, "yyyy-MM-dd"),
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
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !date1 && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date1 ? format(date1, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={date1}
                        onSelect={setDate1}
                        disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Their Birthday */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Their Birthday</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !date2 && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date2 ? format(date2, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={date2}
                        onSelect={setDate2}
                        disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <Button
                  onClick={handleCalculate}
                  disabled={!date1 || !date2 || isCalculating}
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
                          setDate1(undefined);
                          setDate2(undefined);
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
  );
};

export default CompatibilityCalculator;
