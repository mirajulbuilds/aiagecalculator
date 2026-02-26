import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Calendar, Baby, Heart, Share2, Sparkles, Dog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AdSenseBanner } from "@/components/AdSenseBanner";
import { SEOFaqSection } from "@/components/SEOFaqSection";

const DueDateCalculator = () => {
  const [calculationMethod, setCalculationMethod] = useState<string>("");
  const [day, setDay] = useState<string>("");
  const [month, setMonth] = useState<string>("");
  const [year, setYear] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    estimatedDueDate: string;
    weeksPregnant: string;
    currentTrimester: string;
    babyZodiacSign: string;
    isDogPregnancy?: boolean;
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
  const years = Array.from({ length: 2 }, (_, i) => currentYear - i);

  const isDogMethod = calculationMethod === "DogMating";

  const getDateLabel = () => {
    switch (calculationMethod) {
      case "LMP": return "Date of Last Menstrual Period (LMP)";
      case "Conception": return "Date of Conception";
      case "IVF_Day3": return "IVF Transfer Date (Day 3 Embryo)";
      case "IVF_Day5": return "FET/IVF Transfer Date (Day 5 Blastocyst)";
      case "DogMating": return "Dog Mating Date";
      default: return "Select Date";
    }
  };

  const handleCalculate = async () => {
    if (!calculationMethod || !day || !month || !year) {
      toast.error("Please fill in all fields");
      return;
    }

    const inputDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    
    setIsLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('get-due-date', {
        body: {
          calculationMethod,
          inputDate
        }
      });

      if (error) throw error;

      if (data && data.estimatedDueDate) {
        setResult({
          estimatedDueDate: data.estimatedDueDate,
          weeksPregnant: data.weeksPregnant,
          currentTrimester: data.currentTrimester,
          babyZodiacSign: data.babyZodiacSign,
          isDogPregnancy: data.isDogPregnancy || false,
        });
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Error calculating due date:", error);
      toast.error("Failed to calculate due date. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    if (!result) return;

    const subject = isDogMethod ? "puppy" : "baby";
    const shareText = `My estimated ${subject} due date is ${result.estimatedDueDate}! Find out yours at ${window.location.origin}/due-date-calculator`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Due Date Calculator",
          text: shareText
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
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
        <title>Baby Due Date Calculator - By IVF, FET, Conception & LMP | AiAgeCalc</title>
        <meta name="description" content="Free baby due date calculator. Calculate your due date from conception, by IVF transfer date, FET, or last menstrual period. Also includes dog due date calculator and canine pregnancy calculator." />
        <meta name="keywords" content="due date calculator by ivf, calculate my due date from conception, baby due date calculator, conception to due date calculator, dog due date calculator, canine due date calculator, fet due date calculator" />
      </Helmet>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-4">
            Due Date Calculator
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Calculate your estimated due date using LMP, conception date, IVF/FET transfer date, or find your dog's due date.
          </p>
          <p className="text-sm text-muted-foreground mt-2 italic">
            *This is an estimate and not medical or veterinary advice. Always consult with your healthcare provider or veterinarian.*
          </p>
        </div>

        {/* Input Card */}
        <Card className="content-card mb-6">
          <CardContent className="p-6 space-y-6">
            {/* Calculation Method */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-3">
                <Sparkles className="w-4 h-4 text-primary" />
                Calculation Method
              </label>
              <Select value={calculationMethod} onValueChange={setCalculationMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select calculation method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LMP">Last Menstrual Period (LMP)</SelectItem>
                  <SelectItem value="Conception">Conception Date</SelectItem>
                  <SelectItem value="IVF_Day3">IVF Transfer Date (Day 3 Embryo)</SelectItem>
                  <SelectItem value="IVF_Day5">FET / IVF Transfer Date (Day 5 Blastocyst)</SelectItem>
                  <SelectItem value="DogMating">🐕 Dog / Canine Mating Date</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Input */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-3">
                {isDogMethod ? <Dog className="w-4 h-4 text-primary" /> : <Calendar className="w-4 h-4 text-primary" />}
                {getDateLabel()}
              </label>
              <div className="grid grid-cols-3 gap-3">
                <Select value={day} onValueChange={setDay}>
                  <SelectTrigger>
                    <SelectValue placeholder="Day" />
                  </SelectTrigger>
                  <SelectContent>
                    {days.map(d => (
                      <SelectItem key={d} value={d.toString()}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={month} onValueChange={setMonth}>
                  <SelectTrigger>
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map(m => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={year} onValueChange={setYear}>
                  <SelectTrigger>
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map(y => (
                      <SelectItem key={y} value={y.toString()}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Calculate Button */}
            <Button 
              onClick={handleCalculate} 
              disabled={isLoading} 
              className="main-action-button w-full" 
              size="lg"
            >
              {isLoading ? "Calculating..." : isDogMethod ? "Calculate Puppy Due Date" : "Calculate My Due Date"}
            </Button>
          </CardContent>
        </Card>

        {/* Result Card */}
        {result && (
          <Card className="content-card animate-fade-in mb-6">
            <CardContent className="p-6 space-y-6">
              <div className="text-center space-y-6">
                {/* Due Date */}
                <div className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    {result.isDogPregnancy ? <Dog className="w-6 h-6 text-primary" /> : <Baby className="w-6 h-6 text-primary" />}
                    <p className="text-sm font-medium text-muted-foreground">
                      {result.isDogPregnancy ? "Estimated Puppy Due Date" : "Your Estimated Due Date"}
                    </p>
                  </div>
                  <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    {result.estimatedDueDate}
                  </div>
                </div>

                {/* Progress Info */}
                <div className={`grid grid-cols-1 ${result.isDogPregnancy ? 'md:grid-cols-2' : 'md:grid-cols-3'} gap-4`}>
                  <Card className="border-2 border-primary/20">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Calendar className="w-5 h-5 text-primary" />
                        <p className="text-xs font-medium text-muted-foreground uppercase">
                          {result.isDogPregnancy ? "Progress" : "You Are"}
                        </p>
                      </div>
                      <p className="text-xl font-bold text-foreground">{result.weeksPregnant}</p>
                      <p className="text-sm text-muted-foreground">{result.isDogPregnancy ? "Along" : "Pregnant"}</p>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-primary/20">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Heart className="w-5 h-5 text-primary" />
                        <p className="text-xs font-medium text-muted-foreground uppercase">
                          {result.isDogPregnancy ? "Stage" : "Trimester"}
                        </p>
                      </div>
                      <p className="text-xl font-bold text-foreground">{result.currentTrimester}</p>
                      <p className="text-sm text-muted-foreground">{result.isDogPregnancy ? "of Pregnancy" : "Trimester"}</p>
                    </CardContent>
                  </Card>

                  {!result.isDogPregnancy && (
                    <Card className="border-2 border-primary/20">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <Sparkles className="w-5 h-5 text-primary" />
                          <p className="text-xs font-medium text-muted-foreground uppercase">Zodiac Sign</p>
                        </div>
                        <p className="text-xl font-bold text-foreground">{result.babyZodiacSign}</p>
                        <p className="text-sm text-muted-foreground">Baby's Sign</p>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Share Button */}
                <Button 
                  onClick={handleShare} 
                  className="gap-2 w-full" 
                  size="lg"
                >
                  <Share2 className="w-4 h-4" />
                  Share Result
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* AdSense Banner */}
        {result && (
          <div className="mt-8">
            <AdSenseBanner 
              adSlot="due-date-result"
              format="horizontal"
            />
          </div>
        )}

        {/* SEO FAQ Section */}
        <SEOFaqSection
          title="Baby Due Date Calculator FAQ"
          description="Our baby due date calculator helps you estimate when your baby will arrive using multiple calculation methods including last menstrual period (LMP), conception date, IVF transfer date, FET, and dog/canine pregnancy."
          faqs={[
            {
              question: "How do I calculate my due date from conception?",
              answer: "To calculate your due date from conception, add 266 days (38 weeks) to your conception date. Our calculator does this automatically — simply select 'Conception Date' as your calculation method and enter the date. This is the most accurate method if you know your exact conception date."
            },
            {
              question: "How does the due date calculator by IVF work?",
              answer: "For IVF pregnancies, the due date is calculated based on the embryo transfer date. For a Day 3 embryo transfer, we add 263 days. For a Day 5 blastocyst or FET transfer, we add 261 days. Simply select the appropriate IVF method in our calculator for accurate results."
            },
            {
              question: "What is a FET due date calculator?",
              answer: "A FET (Frozen Embryo Transfer) due date calculator estimates your due date based on when the frozen embryo was transferred. Since the embryo is typically a Day 5 blastocyst, you add 261 days to the transfer date. Select 'FET / IVF Transfer Date (Day 5 Blastocyst)' in our calculator."
            },
            {
              question: "How does the dog due date calculator work?",
              answer: "Dog pregnancy (gestation) typically lasts about 63 days (approximately 9 weeks) from the mating date. Select 'Dog / Canine Mating Date' as the calculation method, enter the mating date, and our calculator will estimate when the puppies will arrive, along with the current stage of pregnancy."
            },
            {
              question: "How accurate is the baby due date calculator?",
              answer: "Due date calculations are estimates — only about 5% of babies are born on their exact due date. Most babies arrive within 2 weeks before or after the estimated date. The conception date method is generally more accurate than the LMP method. Always confirm with your healthcare provider."
            },
            {
              question: "What is the difference between LMP and conception date methods?",
              answer: "The LMP (Last Menstrual Period) method adds 280 days to the first day of your last period. The Conception Date method adds 266 days to the actual conception date. The conception method is more accurate but requires knowing your exact conception date."
            }
          ]}
          relatedTools={[
            { name: "Age Calculator", path: "/" },
            { name: "Pet Age Calculator", path: "/pet-age-calculator" },
            { name: "Compatibility Calculator", path: "/compatibility-calculator" },
          ]}
        />
      </div>
    </>
  );
};

export default DueDateCalculator;
