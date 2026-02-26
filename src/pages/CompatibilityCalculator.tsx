import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Heart, CalendarIcon, Share2, Sparkles, Hash } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Helmet } from "react-helmet-async";
import { SEOHead } from "@/components/SEOHead";
import { SITE_CONFIG } from "@/lib/config";
import PageTransition from "@/components/PageTransition";
import { triggerNativeShare } from "@/lib/shareUtils";
import { SEOFaqSection } from "@/components/SEOFaqSection";

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
    your_name_number?: number;
    their_name_number?: number;
  };
}

// Calculate name number from a name using Pythagorean numerology
function calculateNameNumber(name: string): number {
  const charMap: Record<string, number> = {
    a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9,
    j: 1, k: 2, l: 3, m: 4, n: 5, o: 6, p: 7, q: 8, r: 9,
    s: 1, t: 2, u: 3, v: 4, w: 5, x: 6, y: 7, z: 8,
  };
  let sum = 0;
  for (const char of name.toLowerCase()) {
    if (charMap[char]) sum += charMap[char];
  }
  while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
    sum = sum.toString().split("").map(Number).reduce((a, b) => a + b, 0);
  }
  return sum;
}

const CompatibilityCalculator = () => {
  const [day1, setDay1] = useState<string>("");
  const [month1, setMonth1] = useState<string>("");
  const [year1, setYear1] = useState<string>("");
  const [day2, setDay2] = useState<string>("");
  const [month2, setMonth2] = useState<string>("");
  const [year2, setYear2] = useState<string>("");
  const [name1, setName1] = useState<string>("");
  const [name2, setName2] = useState<string>("");
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
      const date1String = `${year1}-${month1.padStart(2, '0')}-${day1.padStart(2, '0')}`;
      const date2String = `${year2}-${month2.padStart(2, '0')}-${day2.padStart(2, '0')}`;

      const { data, error } = await supabase.functions.invoke("birthday-compatibility", {
        body: {
          date1: date1String,
          date2: date2String,
          name1: name1.trim() || undefined,
          name2: name2.trim() || undefined,
        },
      });

      if (error) {
        console.error("Function error:", error);
        throw new Error("Failed to calculate compatibility");
      }

      if (data.error) {
        throw new Error(data.error);
      }

      // Add name numbers client-side if names provided
      if (name1.trim() && name2.trim()) {
        data.breakdown.your_name_number = calculateNameNumber(name1.trim());
        data.breakdown.their_name_number = calculateNameNumber(name2.trim());
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

    await triggerNativeShare({
      title: "Birthday Compatibility Calculator",
      text: `Our birthday compatibility is ${result.total_score}%! Find out yours.`,
      url: `${SITE_CONFIG.canonicalUrl}/compatibility-calculator`,
    });
  };

  return (
    <PageTransition>
    <>
      <SEOHead
        title="Love Calculator & Compatibility Test - Zodiac, Synastry & Life Path"
        description="Free love calculator and compatibility test! Check zodiac compatibility, Chinese love zodiac matches, synastry calculator, life path calculator, and name number calculator. AI-powered astrology compatibility."
        keywords="love calculator, compatibility test, astrology compatibility, zodiac compatibility test, chinese love zodiac, chinese zodiac sign matches, synastry calculator, life path calculator, name number calculator"
        type="website"
      />

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
              Discover how compatible you are based on Zodiac signs, Numerology, Name Numbers, and more!
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Input Section */}
            <Card className="bg-card/50 backdrop-blur content-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-primary" />
                  Select Birthdays & Names
                </CardTitle>
                <CardDescription>Enter birthdays and optionally names for name number analysis</CardDescription>
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
                          <SelectItem key={day} value={day}>{day}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={month1} onValueChange={setMonth1}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Month" />
                      </SelectTrigger>
                      <SelectContent>
                        {months.map((month) => (
                          <SelectItem key={month.value} value={month.value}>{month.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={year1} onValueChange={setYear1}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Year" />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map((year) => (
                          <SelectItem key={year} value={year}>{year}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Input
                    placeholder="Your name (optional, for name number)"
                    value={name1}
                    onChange={(e) => setName1(e.target.value)}
                    maxLength={100}
                  />
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
                          <SelectItem key={day} value={day}>{day}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={month2} onValueChange={setMonth2}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Month" />
                      </SelectTrigger>
                      <SelectContent>
                        {months.map((month) => (
                          <SelectItem key={month.value} value={month.value}>{month.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={year2} onValueChange={setYear2}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Year" />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map((year) => (
                          <SelectItem key={year} value={year}>{year}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Input
                    placeholder="Their name (optional, for name number)"
                    value={name2}
                    onChange={(e) => setName2(e.target.value)}
                    maxLength={100}
                  />
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
                    <div className="space-y-3 text-sm">
                      <h4 className="font-semibold text-foreground flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-primary" /> Zodiac & Numerology Breakdown
                      </h4>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Western Zodiac:</span>
                        <span className="font-medium">{result.breakdown.your_zodiac} × {result.breakdown.their_zodiac}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Chinese Zodiac:</span>
                        <span className="font-medium">{result.breakdown.your_chinese_zodiac} × {result.breakdown.their_chinese_zodiac}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Life Path Numbers:</span>
                        <span className="font-medium">{result.breakdown.your_life_path} × {result.breakdown.their_life_path}</span>
                      </div>
                      {result.breakdown.your_name_number && result.breakdown.their_name_number && (
                        <div className="flex justify-between border-t border-primary/10 pt-2">
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Hash className="w-3 h-3" /> Name Numbers:
                          </span>
                          <span className="font-medium">{result.breakdown.your_name_number} × {result.breakdown.their_name_number}</span>
                        </div>
                      )}
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
                          setDay1(""); setMonth1(""); setYear1("");
                          setDay2(""); setMonth2(""); setYear2("");
                          setName1(""); setName2("");
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
                <h4 className="font-semibold mb-2">Enter Birthdays & Names</h4>
                <p className="text-sm text-muted-foreground">Select birthdays and optionally enter names for name number analysis</p>
              </div>
              <div className="text-center">
                <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-primary">2</span>
                </div>
                <h4 className="font-semibold mb-2">AI Analysis</h4>
                <p className="text-sm text-muted-foreground">
                  Our AI analyzes Zodiac, Chinese Zodiac, Life Path & Name Numbers
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

          {/* SEO FAQ Section */}
          <SEOFaqSection
            title="Love Calculator & Astrology Compatibility FAQ"
            description="Our love calculator combines Western zodiac compatibility, Chinese love zodiac, synastry analysis, life path numbers, and name numerology into one comprehensive compatibility test. Discover your cosmic connection!"
            faqs={[
              {
                question: "How does the love calculator work?",
                answer: "Our love calculator analyzes multiple compatibility factors: Western zodiac sign compatibility, Chinese zodiac sign matches, life path number compatibility (from numerology), and name number analysis. The AI combines these factors into a single compatibility score with a detailed breakdown."
              },
              {
                question: "What is a synastry calculator?",
                answer: "A synastry calculator compares the astrological charts of two people to determine their compatibility. Our tool performs synastry analysis by comparing zodiac signs, life path numbers, and Chinese zodiac animals to give you a comprehensive compatibility picture."
              },
              {
                question: "How does Chinese love zodiac compatibility work?",
                answer: "The Chinese zodiac assigns one of 12 animals based on your birth year. Certain Chinese zodiac sign matches are considered more compatible than others. For example, Rat and Dragon are highly compatible, while Rat and Horse may face challenges. Our calculator includes this analysis automatically."
              },
              {
                question: "What is a life path calculator?",
                answer: "A life path calculator determines your life path number by adding all digits of your birthdate until you get a single digit (1-9) or a master number (11, 22, 33). This number reveals your core personality traits and is used in numerology compatibility analysis."
              },
              {
                question: "What is a name number calculator?",
                answer: "A name number calculator converts letters in your name to numbers using Pythagorean numerology (A=1, B=2, ..., I=9, J=1, etc.) and reduces them to a single digit or master number. Enter your names in our calculator to see your name numbers and how they interact for compatibility."
              },
              {
                question: "Is this compatibility test accurate?",
                answer: "Our compatibility test uses traditional astrology and numerology systems that have been used for centuries. While no compatibility test can predict relationship outcomes with certainty, it provides fun and insightful analysis based on time-tested astrological principles."
              }
            ]}
            relatedTools={[
              { name: "Past Life Generator", path: "/past-life-generator" },
              { name: "Famous Birthdays", path: "/famous-birthdays" },
              { name: "Age Calculator", path: "/" },
            ]}
          />
        </div>
      </div>
    </>
    </PageTransition>
  );
};

export default CompatibilityCalculator;
