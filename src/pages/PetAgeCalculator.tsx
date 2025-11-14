import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { PawPrint, Share2, Sparkles, Save, Heart, BarChart3, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AdSenseBanner } from "@/components/AdSenseBanner";
import { triggerNativeShare } from "@/lib/shareUtils";
import { usePetStorage } from "@/hooks/usePetStorage";
import { SavedPetCard } from "@/components/SavedPetCard";
import { PetComparison } from "@/components/PetComparison";
import { PetTimeline } from "@/components/PetTimeline";
import { SavedPetWithAge, PetAgeResult } from "@/types/pet";

const PetAgeCalculator = () => {
  const [petType, setPetType] = useState<string>("");
  const [dogSize, setDogSize] = useState<string>("");
  const [petName, setPetName] = useState<string>("");
  const [day, setDay] = useState<string>("");
  const [month, setMonth] = useState<string>("");
  const [year, setYear] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PetAgeResult | null>(null);
  const [activeTab, setActiveTab] = useState("calculator");
  
  const { pets, addPet, removePet } = usePetStorage();
  const [petsWithAges, setPetsWithAges] = useState<SavedPetWithAge[]>([]);

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
    
    // Validate date is not in the future
    const selectedDate = new Date(birthDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate > today) {
      toast.error("Birth date cannot be in the future!");
      return;
    }

    // Validate date is valid (e.g., not Feb 30th)
    const dateCheck = new Date(birthDate);
    if (dateCheck.toString() === 'Invalid Date' || 
        dateCheck.getDate() !== parseInt(day) ||
        dateCheck.getMonth() + 1 !== parseInt(month) ||
        dateCheck.getFullYear() !== parseInt(year)) {
      toast.error("Invalid date combination. Please check your selection.");
      return;
    }

    // Check if pet is too old (over 30 years)
    const ageInYears = (today.getTime() - selectedDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    if (ageInYears > 30) {
      toast.error("Please enter a valid birth date within the last 30 years.");
      return;
    }
    
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

      if (data && data.humanAge !== undefined && data.actualAge && data.lifeStage) {
        setResult({
          humanAge: data.humanAge,
          actualAge: data.actualAge,
          lifeStage: data.lifeStage,
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
    const petNameText = petName ? `${petName}, my ` : `My `;
    const shareText = `${petNameText}${petTypeLower} is ${result.humanAge} in human years! Find out your pet's age at`;
    
    await triggerNativeShare({
      title: "Pet Age Calculator",
      text: shareText,
      url: `${window.location.origin}/pet-age-calculator`
    });
  };

  const handleSavePet = () => {
    if (!petName.trim()) {
      toast.error("Please enter a pet name to save");
      return;
    }

    if (!result) {
      toast.error("Please calculate age first");
      return;
    }

    const birthDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    
    const newPet = addPet({
      name: petName,
      petType: petType as 'Dog' | 'Cat',
      dogSize: petType === 'Dog' ? (dogSize as 'Small' | 'Medium' | 'Large') : undefined,
      birthDate,
    });

    // Add age result to the pets with ages list
    setPetsWithAges(prev => [...prev, { ...newPet, ageResult: result }]);
    
    toast.success(`${petName} has been saved!`);
    setActiveTab("saved");
  };

  const calculatePetAge = async (pet: SavedPetWithAge) => {
    try {
      const { data, error } = await supabase.functions.invoke('get-pet-human-age', {
        body: {
          petType: pet.petType,
          dogSize: pet.dogSize || null,
          birthDate: pet.birthDate
        }
      });

      if (error) throw error;

      if (data && data.humanAge !== undefined && data.actualAge && data.lifeStage) {
        const ageResult: PetAgeResult = {
          humanAge: data.humanAge,
          actualAge: data.actualAge,
          lifeStage: data.lifeStage,
          summary_text: data.summary_text
        };
        
        setPetsWithAges(prev => 
          prev.map(p => p.id === pet.id ? { ...p, ageResult } : p)
        );
        
        toast.success(`Age calculated for ${pet.name}!`);
      }
    } catch (error) {
      console.error("Error calculating pet age:", error);
      toast.error(`Failed to calculate age for ${pet.name}`);
    }
  };

  const handleRemovePet = (id: string) => {
    const pet = petsWithAges.find(p => p.id === id);
    removePet(id);
    setPetsWithAges(prev => prev.filter(p => p.id !== id));
    toast.success(`${pet?.name || 'Pet'} removed`);
  };

  // Initialize pets with ages when pets change
  useEffect(() => {
    const updated = pets.map(pet => {
      const existing = petsWithAges.find(p => p.id === pet.id);
      return existing || pet;
    });
    setPetsWithAges(updated);
  }, [pets]);

  // Get current age in years for timeline
  const getCurrentAgeYears = () => {
    if (!result) return 0;
    const match = result.actualAge.match(/(\d+)\s*year/);
    return match ? parseInt(match[1]) : 0;
  };

  return (
    <>
      <Helmet>
        <title>Pet Age Calculator (Dog & Cat) | AiAgeCalc.com</title>
        <meta name="description" content="Find out your pet's real age in human years. Our AI uses modern veterinary formulas to give you an accurate result for your dog or cat." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in">
            <div className="flex justify-center mb-4">
              <PawPrint className="w-16 h-16 text-primary animate-bounce-gentle" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
              Pet Age Calculator
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Calculate your pet's age, save multiple pets, compare ages, and track health milestones!
            </p>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="calculator" className="flex items-center gap-2">
                <PawPrint className="w-4 h-4" />
                Calculator
              </TabsTrigger>
              <TabsTrigger value="saved" className="flex items-center gap-2">
                <Heart className="w-4 h-4" />
                My Pets ({pets.length})
              </TabsTrigger>
              <TabsTrigger value="comparison" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Compare
              </TabsTrigger>
              <TabsTrigger value="timeline" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Timeline
              </TabsTrigger>
            </TabsList>

            {/* Calculator Tab */}
            <TabsContent value="calculator" className="space-y-8">
              <Card className="border-primary/20 shadow-lg">
                <CardContent className="p-6 space-y-6">
                  {/* Pet Name Input */}
                  <div className="space-y-2">
                    <Label htmlFor="pet-name">Pet Name (Optional)</Label>
                    <Input
                      id="pet-name"
                      placeholder="e.g., Max, Luna, Whiskers..."
                      value={petName}
                      onChange={(e) => setPetName(e.target.value)}
                    />
                  </div>

                  {/* Pet Type */}
                  <div className="space-y-2">
                    <Label>Pet Type</Label>
                    <Select value={petType} onValueChange={(value) => {
                      setPetType(value);
                      if (value !== "Dog") setDogSize("");
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select pet type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Dog">Dog</SelectItem>
                        <SelectItem value="Cat">Cat</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Dog Size */}
                  {petType === "Dog" && (
                    <div className="space-y-2 animate-fade-in">
                      <Label>Dog Size</Label>
                      <Select value={dogSize} onValueChange={setDogSize}>
                        <SelectTrigger>
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

                  {/* Birth Date */}
                  <div className="space-y-2">
                    <Label>Pet's Date of Birth</Label>
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

                  {/* Calculate Button */}
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
                <Card className="border-primary/30 shadow-xl bg-gradient-to-br from-card to-primary/5 animate-fade-in-up">
                  <CardContent className="p-8 space-y-6">
                    <div className="text-center space-y-2">
                      <p className="text-lg text-muted-foreground">
                        {petName || "Your pet"} is...
                      </p>
                      <div className="text-7xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent animate-bounce-gentle">
                        {result.humanAge}
                      </div>
                      <p className="text-2xl font-semibold text-foreground">...in human years!</p>
                    </div>

                    {/* Pet Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-background/50 backdrop-blur rounded-lg p-4 border border-primary/20 text-center">
                        <p className="text-sm text-muted-foreground mb-1">Actual Age</p>
                        <p className="text-xl font-semibold text-foreground">{result.actualAge}</p>
                      </div>
                      <div className="bg-background/50 backdrop-blur rounded-lg p-4 border border-primary/20 text-center">
                        <p className="text-sm text-muted-foreground mb-1">Life Stage</p>
                        <p className="text-xl font-semibold text-foreground">{result.lifeStage}</p>
                      </div>
                    </div>

                    <div className="bg-background/50 backdrop-blur rounded-lg p-6 border border-primary/20">
                      <p className="text-lg text-foreground leading-relaxed">
                        {result.summary_text}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Button 
                        onClick={handleSavePet}
                        variant="outline"
                        size="lg"
                        className="w-full"
                      >
                        <Save className="mr-2 h-5 w-5" />
                        Save This Pet
                      </Button>
                      <Button 
                        onClick={handleShare}
                        size="lg"
                        className="w-full"
                      >
                        <Share2 className="mr-2 h-5 w-5" />
                        Share Result
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Saved Pets Tab */}
            <TabsContent value="saved" className="space-y-6">
              {pets.length === 0 ? (
                <Card className="border-primary/20">
                  <CardContent className="p-12 text-center">
                    <Heart className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-xl font-semibold mb-2">No saved pets yet</h3>
                    <p className="text-muted-foreground mb-6">
                      Calculate a pet's age and click "Save This Pet" to start tracking!
                    </p>
                    <Button onClick={() => setActiveTab("calculator")}>
                      Go to Calculator
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {petsWithAges.map((pet) => (
                    <SavedPetCard
                      key={pet.id}
                      pet={pet}
                      onRemove={handleRemovePet}
                      onCalculate={calculatePetAge}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Comparison Tab */}
            <TabsContent value="comparison">
              <PetComparison pets={petsWithAges} />
            </TabsContent>

            {/* Timeline Tab */}
            <TabsContent value="timeline" className="space-y-6">
              {result && petType ? (
                <PetTimeline
                  petType={petType as 'Dog' | 'Cat'}
                  dogSize={dogSize as 'Small' | 'Medium' | 'Large' | undefined}
                  currentAgeYears={getCurrentAgeYears()}
                />
              ) : (
                <Card className="border-primary/20">
                  <CardContent className="p-12 text-center">
                    <Clock className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-xl font-semibold mb-2">No age calculated yet</h3>
                    <p className="text-muted-foreground mb-6">
                      Calculate your pet's age to see the health milestone timeline
                    </p>
                    <Button onClick={() => setActiveTab("calculator")}>
                      Go to Calculator
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>

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
