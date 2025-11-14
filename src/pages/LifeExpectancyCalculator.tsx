import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Calendar, Heart, Activity, Wine, Cigarette, MapPin, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const LifeExpectancyCalculator = () => {
  const [birthDay, setBirthDay] = useState<string>("");
  const [birthMonth, setBirthMonth] = useState<string>("");
  const [birthYear, setBirthYear] = useState<string>("");
  const [gender, setGender] = useState<string>("");
  const [country, setCountry] = useState<string>("");
  const [smoking, setSmoking] = useState<string>("");
  const [exercise, setExercise] = useState<string>("");
  const [alcohol, setAlcohol] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    estimated_age: number;
    summary_text: string;
  } | null>(null);

  const days = Array.from({ length: 31 }, (_, i) => i + 1);
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
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

  const handleCalculate = async () => {
    // Validate inputs
    if (!birthDay || !birthMonth || !birthYear || !gender || !country || !smoking || !exercise || !alcohol) {
      toast.error("Please fill in all fields");
      return;
    }

    const birthDate = `${birthYear}-${birthMonth.padStart(2, '0')}-${birthDay.padStart(2, '0')}`;

    setIsLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('get-life-expectancy', {
        body: {
          birthDate,
          gender,
          country,
          smoking,
          exercise,
          alcohol,
        },
      });

      if (error) throw error;

      if (data && data.estimated_age && data.summary_text) {
        setResult({
          estimated_age: data.estimated_age,
          summary_text: data.summary_text,
        });
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Error calculating life expectancy:", error);
      toast.error("Failed to calculate life expectancy. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    if (!result) return;

    const shareText = `My estimated life expectancy is ${result.estimated_age}! Find out yours at ${window.location.origin}/life-expectancy-calculator`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Life Expectancy Calculator",
          text: shareText,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(shareText);
        toast.success("Copied to clipboard!");
      } catch (error) {
        toast.error("Failed to copy to clipboard");
      }
    }
  };

  return (
    <>
      <Helmet>
        <title>Life Expectancy Calculator | How Long Will I Live?</title>
        <meta
          name="description"
          content="Calculate your estimated life expectancy based on lifestyle factors using AI-powered predictions. Get personalized insights about your potential longevity."
        />
      </Helmet>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-4">
            AI Life Expectancy Calculator
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Answer a few questions about your lifestyle, and our AI (powered by Gemini 2.5 Pro) will give you an estimate of your potential life expectancy.
          </p>
          <p className="text-sm text-muted-foreground mt-2 italic">
            *This is for entertainment purposes only and is not medical advice.*
          </p>
        </div>

        {/* Input Card */}
        <Card className="content-card mb-6">
          <CardContent className="p-6 space-y-6">
            {/* Date of Birth */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-3">
                <Calendar className="w-4 h-4 text-primary" />
                Date of Birth
              </label>
              <div className="grid grid-cols-3 gap-3">
                <Select value={birthDay} onValueChange={setBirthDay}>
                  <SelectTrigger>
                    <SelectValue placeholder="Day" />
                  </SelectTrigger>
                  <SelectContent>
                    {days.map((day) => (
                      <SelectItem key={day} value={day.toString()}>
                        {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={birthMonth} onValueChange={setBirthMonth}>
                  <SelectTrigger>
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

                <Select value={birthYear} onValueChange={setBirthYear}>
                  <SelectTrigger>
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Gender */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-3">
                <Heart className="w-4 h-4 text-primary" />
                Gender
              </label>
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Country */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-3">
                <MapPin className="w-4 h-4 text-primary" />
                Country
              </label>
              <Select value={country} onValueChange={setCountry}>
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USA">USA</SelectItem>
                  <SelectItem value="UK">UK</SelectItem>
                  <SelectItem value="Canada">Canada</SelectItem>
                  <SelectItem value="Australia">Australia</SelectItem>
                  <SelectItem value="Germany">Germany</SelectItem>
                  <SelectItem value="France">France</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Smoking Habits */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-3">
                <Cigarette className="w-4 h-4 text-primary" />
                Smoking Habits
              </label>
              <Select value={smoking} onValueChange={setSmoking}>
                <SelectTrigger>
                  <SelectValue placeholder="Select smoking habits" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Never Smoked">Never Smoked</SelectItem>
                  <SelectItem value="Current Smoker">Current Smoker</SelectItem>
                  <SelectItem value="Former Smoker">Former Smoker</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Exercise Frequency */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-3">
                <Activity className="w-4 h-4 text-primary" />
                Exercise Frequency
              </label>
              <Select value={exercise} onValueChange={setExercise}>
                <SelectTrigger>
                  <SelectValue placeholder="Select exercise frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Regularly">Regularly</SelectItem>
                  <SelectItem value="Sometimes">Sometimes</SelectItem>
                  <SelectItem value="Rarely/Never">Rarely/Never</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Alcohol Consumption */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-3">
                <Wine className="w-4 h-4 text-primary" />
                Alcohol Consumption
              </label>
              <Select value={alcohol} onValueChange={setAlcohol}>
                <SelectTrigger>
                  <SelectValue placeholder="Select alcohol consumption" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Rarely/None">Rarely/None</SelectItem>
                  <SelectItem value="Moderately">Moderately</SelectItem>
                  <SelectItem value="Heavily">Heavily</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Calculate Button */}
            <Button
              onClick={handleCalculate}
              disabled={isLoading}
              className="main-action-button w-full"
              size="lg"
            >
              {isLoading ? "Calculating..." : "Calculate My Life Expectancy"}
            </Button>
          </CardContent>
        </Card>

        {/* Result Card */}
        {result && (
          <Card className="content-card animate-fade-in">
            <CardContent className="p-6 text-center space-y-6">
              <div>
                <p className="text-muted-foreground text-sm mb-2">Your Estimated Life Expectancy</p>
                <div className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  {result.estimated_age}
                </div>
                <p className="text-muted-foreground text-sm mt-2">years old</p>
              </div>

              <div className="p-4 bg-primary/5 rounded-lg">
                <p className="text-foreground leading-relaxed">{result.summary_text}</p>
              </div>

              <Button
                onClick={handleShare}
                variant="outline"
                className="gap-2"
                size="lg"
              >
                <Share2 className="w-4 h-4" />
                Share Result
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
};

export default LifeExpectancyCalculator;
