import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { PawPrint, Share2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AdSenseBanner } from "@/components/AdSenseBanner";
import { triggerNativeShare } from "@/lib/shareUtils";

const PetAgeCalculator = () => {
  const [petType, setPetType] = useState<string>("");
  const [dogSize, setDogSize] = useState<string>("");
  const [day, setDay] = useState<string>("");
  const [month, setMonth] = useState<string>("");
  const [year, setYear] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    humanAge: number;
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
  const years = Array.from({ length: 30 }, (_, i) => currentYear - i);

  const handleCalculate = async () => {
    if (!petType || !day || !month || !year) {
      toast.error("Please fill in all fields");
      return;
    }

    if (petType === "Dog" && !dogSize) {
      toast.error("Please select your dog's size");
      return;
    }

    const birthDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    
    setIsLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('get-pet-human-age', {
        body: {
          petType,
          dogSize: petType === "Dog" ? dogSize : null,
          birthDate
        }
      });

      if (error) throw error;

      if (data && data.humanAge !== undefined) {
        setResult({
          humanAge: data.humanAge,
          summary_text: data.summary_text
        });
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Error calculating pet age:", error);
      toast.error("Failed to calculate pet age. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    if (!result) return;

    const petTypeLower = petType.toLowerCase();
    const shareText = `My ${petTypeLower} is ${result.humanAge} in human years! Find out your pet's age at`;
    
    await triggerNativeShare({
      title: "Pet Age Calculator",
      text: shareText,
      url: `${window.location.origin}/pet-age-calculator`
    });
  };

  return (
    <>
      <Helmet>
        <title>Pet Age Calculator (Dog & Cat) | AiAgeCalc.com</title>
        <meta name="description" content="Find out your pet's real age in human years. Our AI uses modern veterinary formulas to give you an accurate result for your dog or cat." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in">
            <div className="flex justify-center mb-4">
              <PawPrint className="w-16 h-16 text-primary animate-bounce-gentle" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
              Pet Age Calculator
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Find out your pet's real age in human years. Our AI uses modern veterinary formulas to give you an accurate result for your dog or cat.
            </p>
          </div>

          {/* Input Card */}
          <Card className="mb-8 animate-fade-in-up border-primary/20 shadow-lg">
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Pet Type</label>
                <Select value={petType} onValueChange={(value) => {
                  setPetType(value);
                  if (value !== "Dog") setDogSize("");
                }}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select pet type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Dog">Dog</SelectItem>
                    <SelectItem value="Cat">Cat</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {petType === "Dog" && (
                <div className="space-y-2 animate-fade-in">
                  <label className="text-sm font-medium">Dog Size</label>
                  <Select value={dogSize} onValueChange={setDogSize}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select dog size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Small">Small (0-20 lbs)</SelectItem>
                      <SelectItem value="Medium">Medium (21-50 lbs)</SelectItem>
                      <SelectItem value="Large">Large (51+ lbs)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Pet's Date of Birth</label>
                <div className="grid grid-cols-3 gap-4">
                  <Select value={day} onValueChange={setDay}>
                    <SelectTrigger>
                      <SelectValue placeholder="Day" />
                    </SelectTrigger>
                    <SelectContent>
                      {days.map((d) => (
                        <SelectItem key={d} value={String(d)}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={month} onValueChange={setMonth}>
                    <SelectTrigger>
                      <SelectValue placeholder="Month" />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((m) => (
                        <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={year} onValueChange={setYear}>
                    <SelectTrigger>
                      <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((y) => (
                        <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                onClick={handleCalculate} 
                disabled={isLoading}
                className="w-full"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Sparkles className="mr-2 h-5 w-5 animate-spin" />
                    Calculating...
                  </>
                ) : (
                  <>
                    <PawPrint className="mr-2 h-5 w-5" />
                    Calculate Pet's Human Age
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Result Card */}
          {result && (
            <Card className="mb-8 animate-fade-in-up border-primary/30 shadow-xl bg-gradient-to-br from-card to-primary/5">
              <CardContent className="p-8 text-center space-y-6">
                <div className="space-y-2">
                  <p className="text-lg text-muted-foreground">Your pet is...</p>
                  <div className="text-7xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent animate-bounce-gentle">
                    {result.humanAge}
                  </div>
                  <p className="text-2xl font-semibold text-foreground">...in human years!</p>
                </div>

                <div className="bg-background/50 backdrop-blur rounded-lg p-6 border border-primary/20">
                  <p className="text-lg text-foreground leading-relaxed">
                    {result.summary_text}
                  </p>
                </div>

                <Button 
                  onClick={handleShare}
                  size="lg"
                  className="w-full"
                >
                  <Share2 className="mr-2 h-5 w-5" />
                  Share Result
                </Button>
              </CardContent>
            </Card>
          )}

          {/* AdSense */}
          {result && (
            <div className="mt-8 animate-fade-in">
              <AdSenseBanner 
                adSlot="your-ad-slot-id"
                format="horizontal"
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default PetAgeCalculator;
