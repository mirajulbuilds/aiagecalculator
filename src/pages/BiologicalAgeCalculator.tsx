import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Brain, Activity, Share2, TrendingUp, TrendingDown, ChevronDown, Camera, Upload, Heart, Loader2, CheckCircle2, Sparkles, ArrowDown, ArrowUp } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { triggerNativeShare } from "@/lib/shareUtils";
import PageTransition from "@/components/PageTransition";
import { Helmet } from "react-helmet-async";
import { SEOFaqSection } from "@/components/SEOFaqSection";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from "recharts";

const processingSteps = [
  { label: "Analyzing health data...", icon: Activity },
  { label: "Calculating biological markers...", icon: Brain },
  { label: "Estimating face age...", icon: Camera },
  { label: "Generating your report...", icon: Sparkles },
];

const BiologicalAgeCalculator = () => {
  const { profile } = useAuth();
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [exercise, setExercise] = useState("");
  const [smoking, setSmoking] = useState("");
  const [alcohol, setAlcohol] = useState("");
  const [sleep, setSleep] = useState([7]);
  const [diet, setDiet] = useState("");
  const [stress, setStress] = useState("");
  const [hydration, setHydration] = useState("");
  const [bloodPressure, setBloodPressure] = useState("");
  const [restingHeartRate, setRestingHeartRate] = useState("");
  const [chronicConditions, setChronicConditions] = useState<string[]>([]);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [faceImage, setFaceImage] = useState<string | null>(null);
  const [faceAge, setFaceAge] = useState<number | null>(null);
  const [faceLoading, setFaceLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [result, setResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const bmi = height && weight ? (parseFloat(weight) / ((parseFloat(height) / 100) ** 2)).toFixed(1) : "";

  useEffect(() => {
    if (profile?.date_of_birth && !age) {
      const dob = new Date(profile.date_of_birth);
      const years = Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
      setAge(years.toString());
    }
    if (profile?.gender && !gender) setGender(profile.gender);
  }, [profile]);

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const maxSize = 512;
          let w = img.width, h = img.height;
          if (w > h) { h = (h / w) * maxSize; w = maxSize; }
          else { w = (w / h) * maxSize; h = maxSize; }
          canvas.width = w;
          canvas.height = h;
          canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL("image/jpeg", 0.7));
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFaceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    setFaceLoading(true);
    try {
      const compressed = await compressImage(file);
      setFaceImage(compressed);
      const { data, error } = await supabase.functions.invoke("estimate-face-age", {
        body: { image: compressed },
      });
      if (error) throw error;
      setFaceAge(data.estimated_age);
      toast.success(`Face age estimated: ${data.estimated_age} years`);
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to analyze face. You can still calculate without it.");
    } finally {
      setFaceLoading(false);
    }
  };

  const toggleCondition = (condition: string) => {
    setChronicConditions((prev) =>
      prev.includes(condition) ? prev.filter((c) => c !== condition) : [...prev, condition]
    );
  };

  const handleCalculate = async () => {
    if (!age || !gender) {
      toast.error("Please fill in at least your age and gender");
      return;
    }
    setLoading(true);
    setResult(null);
    setCurrentStep(0);

    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < processingSteps.length - 1) return prev + 1;
        return prev;
      });
    }, 1500);

    try {
      const { data, error } = await supabase.functions.invoke("calculate-biological-age", {
        body: {
          age: parseInt(age),
          gender, height: height ? parseFloat(height) : null,
          weight: weight ? parseFloat(weight) : null,
          exercise, smoking, alcohol, sleep: sleep[0],
          diet, stress, hydration, blood_pressure: bloodPressure,
          resting_heart_rate: restingHeartRate ? parseInt(restingHeartRate) : null,
          chronic_conditions: chronicConditions,
          face_age: faceAge,
        },
      });
      clearInterval(stepInterval);
      if (error) throw error;
      setCurrentStep(processingSteps.length);
      await new Promise((r) => setTimeout(r, 600));
      setResult(data);
      toast.success("Biological age calculated!");
      setTimeout(() => {
        document.getElementById("bio-result")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 200);
    } catch (error: any) {
      clearInterval(stepInterval);
      console.error(error);
      toast.error(error.message || "Failed to calculate biological age");
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!result) return;
    const diff = result.age_difference;
    const diffText = diff > 0 ? `${diff} years younger` : diff < 0 ? `${Math.abs(diff)} years older` : "exactly my chronological age";
    await triggerNativeShare({
      title: "My Biological Age",
      text: `My biological age is ${result.biological_age}! That's ${diffText} than my real age of ${result.chronological_age}. 🧬`,
      url: window.location.href,
    });
  };

  const isYounger = result?.age_difference > 0;

  const faqItems = [
    { question: "What is biological age?", answer: "Biological age is an estimate of how old your body appears based on lifestyle, health markers, and physical condition, which can differ from your chronological (calendar) age." },
    { question: "How accurate is a biological age calculator?", answer: "While not a clinical diagnosis, our calculator uses AI analysis of lifestyle factors, health metrics, and optionally your face to provide a science-based estimate of biological age." },
    { question: "Can I lower my biological age?", answer: "Yes! Regular exercise, healthy diet, quality sleep, stress management, and avoiding smoking can all help reduce your biological age over time." },
    { question: "What factors affect biological age the most?", answer: "Exercise, diet, sleep quality, stress levels, smoking, and chronic conditions have the biggest impact on biological aging according to research." },
  ];

  return (
    <PageTransition>
      <Helmet>
        <title>Biological Age Calculator – How Old Is Your Body Really? | AiAgeCalc</title>
        <meta name="description" content="Calculate your biological age vs chronological age with our AI-powered tool. Analyze lifestyle, health metrics, and optionally a face photo to discover your true body age." />
        <meta name="keywords" content="biological age calculator, body age, real age calculator, biological vs chronological age, aging calculator, health age" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            {/* Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Brain className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
                Biological Age Calculator
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Discover how old your body really is based on your lifestyle, health data, and optional face analysis
              </p>
            </div>

            {/* Form Card */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Your Health Profile
                </CardTitle>
                <CardDescription>Fill in your details for a personalized biological age estimate</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Basic Info */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="bio-age">Age</Label>
                    <Input id="bio-age" type="number" placeholder="Your age" value={age} onChange={(e) => setAge(e.target.value)} min="1" max="120" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio-gender">Gender</Label>
                    <Select value={gender} onValueChange={setGender}>
                      <SelectTrigger id="bio-gender"><SelectValue placeholder="Select gender" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio-height">Height (cm)</Label>
                    <Input id="bio-height" type="number" placeholder="e.g., 175" value={height} onChange={(e) => setHeight(e.target.value)} min="100" max="250" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio-weight">Weight (kg)</Label>
                    <Input id="bio-weight" type="number" placeholder="e.g., 70" value={weight} onChange={(e) => setWeight(e.target.value)} min="30" max="300" />
                  </div>
                  {bmi && (
                    <div className="md:col-span-2">
                      <p className="text-sm text-muted-foreground">Calculated BMI: <span className="font-semibold text-foreground">{bmi}</span></p>
                    </div>
                  )}
                </div>

                {/* Lifestyle Factors */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Exercise Frequency</Label>
                    <Select value={exercise} onValueChange={setExercise}>
                      <SelectTrigger><SelectValue placeholder="Select exercise frequency" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="rare">1-2 times/week</SelectItem>
                        <SelectItem value="moderate">3-4 times/week</SelectItem>
                        <SelectItem value="frequent">5+ times/week</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Smoking</Label>
                    <Select value={smoking} onValueChange={setSmoking}>
                      <SelectTrigger><SelectValue placeholder="Select smoking habits" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="never">Never</SelectItem>
                        <SelectItem value="former">Former smoker</SelectItem>
                        <SelectItem value="occasional">Occasional</SelectItem>
                        <SelectItem value="regular">Regular</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Alcohol</Label>
                    <Select value={alcohol} onValueChange={setAlcohol}>
                      <SelectTrigger><SelectValue placeholder="Select alcohol consumption" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="light">Light (1-2/week)</SelectItem>
                        <SelectItem value="moderate">Moderate (3-7/week)</SelectItem>
                        <SelectItem value="heavy">Heavy (8+/week)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Diet Quality</Label>
                    <Select value={diet} onValueChange={setDiet}>
                      <SelectTrigger><SelectValue placeholder="Select diet quality" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="poor">Poor</SelectItem>
                        <SelectItem value="fair">Fair</SelectItem>
                        <SelectItem value="good">Good</SelectItem>
                        <SelectItem value="excellent">Excellent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Stress Level</Label>
                    <Select value={stress} onValueChange={setStress}>
                      <SelectTrigger><SelectValue placeholder="Select stress level" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="moderate">Moderate</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="very-high">Very High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Hydration</Label>
                    <Select value={hydration} onValueChange={setHydration}>
                      <SelectTrigger><SelectValue placeholder="Daily water intake" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Under 4 glasses</SelectItem>
                        <SelectItem value="moderate">4-6 glasses</SelectItem>
                        <SelectItem value="good">7-8 glasses</SelectItem>
                        <SelectItem value="excellent">8+ glasses</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Average Sleep: {sleep[0]} hours</Label>
                  <Slider min={3} max={12} step={0.5} value={sleep} onValueChange={setSleep} className="w-full" />
                  <p className="text-xs text-muted-foreground">Recommended: 7-9 hours/night</p>
                </div>

                {/* Advanced Metrics */}
                <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
                  <CollapsibleTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      Advanced Health Metrics (Optional)
                      <ChevronDown className={`w-4 h-4 transition-transform ${advancedOpen ? "rotate-180" : ""}`} />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-4 space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label>Blood Pressure</Label>
                        <Input placeholder="e.g., 120/80" value={bloodPressure} onChange={(e) => setBloodPressure(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label>Resting Heart Rate (bpm)</Label>
                        <Input type="number" placeholder="e.g., 68" value={restingHeartRate} onChange={(e) => setRestingHeartRate(e.target.value)} min="40" max="120" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Label>Chronic Conditions</Label>
                      <div className="grid grid-cols-2 gap-3">
                        {["Diabetes", "Heart disease", "Hypertension", "Family history of chronic illness"].map((c) => (
                          <div key={c} className="flex items-center gap-2">
                            <Checkbox id={c} checked={chronicConditions.includes(c)} onCheckedChange={() => toggleCondition(c)} />
                            <Label htmlFor={c} className="text-sm cursor-pointer">{c}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                {/* Face Upload */}
                <Card className="bg-muted/30 border-dashed">
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center gap-4">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Camera className="w-4 h-4 text-primary" />
                        Optional: Face Age Analysis
                      </div>
                      {faceImage ? (
                        <div className="flex items-center gap-4">
                          <img src={faceImage} alt="Your face" className="w-20 h-20 rounded-full object-cover border-2 border-primary/20" />
                          <div>
                            {faceLoading ? (
                              <p className="text-sm text-muted-foreground flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</p>
                            ) : faceAge ? (
                              <p className="text-sm">Face Age: <span className="font-bold text-primary">{faceAge}</span></p>
                            ) : null}
                            <Button variant="ghost" size="sm" onClick={() => { setFaceImage(null); setFaceAge(null); }}>Remove</Button>
                          </div>
                        </div>
                      ) : (
                        <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={faceLoading} className="gap-2">
                          <Upload className="w-4 h-4" />
                          Upload a Photo
                        </Button>
                      )}
                      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFaceUpload} />
                      <p className="text-xs text-muted-foreground text-center">Upload a front-facing photo to include face age analysis in your results</p>
                    </div>
                  </CardContent>
                </Card>

                <Button onClick={handleCalculate} disabled={loading} className="w-full" size="lg">
                  {loading ? "Calculating..." : "Calculate Biological Age"}
                </Button>
              </CardContent>
            </Card>

            {/* Processing Animation */}
            <AnimatePresence>
              {loading && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-8">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        {processingSteps.map((step, i) => {
                          const StepIcon = step.icon;
                          const isActive = i === currentStep;
                          const isDone = i < currentStep;
                          return (
                            <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.2 }}
                              className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${isActive ? "bg-primary/10" : isDone ? "bg-muted/50" : "opacity-40"}`}
                            >
                              {isDone ? (
                                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                              ) : isActive ? (
                                <Loader2 className="w-5 h-5 text-primary animate-spin flex-shrink-0" />
                              ) : (
                                <StepIcon className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                              )}
                              <span className={`text-sm ${isActive ? "font-medium text-foreground" : isDone ? "text-muted-foreground" : "text-muted-foreground"}`}>
                                {step.label}
                              </span>
                            </motion.div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Results */}
            {result && (
              <motion.div id="bio-result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="space-y-6">
                {/* Motivational Banner */}
                <Card className={`border-2 ${isYounger ? "border-green-500/50 bg-green-500/5" : "border-amber-500/50 bg-amber-500/5"}`}>
                  <CardContent className="pt-6 text-center">
                    <p className={`text-lg font-semibold ${isYounger ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400"}`}>
                      {isYounger ? "🎉 Great job!" : "💪 Room to improve!"} {result.summary}
                    </p>
                  </CardContent>
                </Card>

                {/* Age Comparison Cards */}
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <p className="text-sm text-muted-foreground mb-2">Chronological Age</p>
                      <p className="text-6xl font-bold text-foreground">{result.chronological_age}</p>
                      <p className="text-sm text-muted-foreground mt-1">years old</p>
                    </CardContent>
                  </Card>
                  <Card className={`border-2 ${isYounger ? "border-green-500/30" : "border-amber-500/30"}`}>
                    <CardContent className="pt-6 text-center">
                      <p className="text-sm text-muted-foreground mb-2">Biological Age</p>
                      <p className={`text-6xl font-bold ${isYounger ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400"}`}>
                        {result.biological_age}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">years old</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Age Difference */}
                <Card>
                  <CardContent className="pt-6 flex items-center justify-center gap-3">
                    {isYounger ? (
                      <ArrowDown className="w-6 h-6 text-green-500" />
                    ) : (
                      <ArrowUp className="w-6 h-6 text-amber-500" />
                    )}
                    <span className={`text-2xl font-bold ${isYounger ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400"}`}>
                      {Math.abs(result.age_difference).toFixed(1)} years {isYounger ? "younger" : "older"}
                    </span>
                    <Button variant="outline" size="sm" onClick={handleShare} className="ml-4 gap-2">
                      <Share2 className="w-4 h-4" /> Share
                    </Button>
                  </CardContent>
                </Card>

                {/* Visual Age Bar */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Age Comparison</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="relative h-12 bg-muted rounded-full overflow-hidden">
                      {(() => {
                        const ages = [result.biological_age, result.chronological_age, ...(result.face_age ? [result.face_age] : [])];
                        const min = Math.min(...ages) - 5;
                        const max = Math.max(...ages) + 5;
                        const range = max - min;
                        const pos = (v: number) => ((v - min) / range) * 100;
                        return (
                          <>
                            <div className="absolute top-0 h-full w-1 bg-foreground/60 z-10" style={{ left: `${pos(result.chronological_age)}%` }} />
                            <div className={`absolute top-0 h-full w-1 z-10 ${isYounger ? "bg-green-500" : "bg-amber-500"}`} style={{ left: `${pos(result.biological_age)}%` }} />
                            {result.face_age && (
                              <div className="absolute top-0 h-full w-1 bg-primary/60 z-10" style={{ left: `${pos(result.face_age)}%` }} />
                            )}
                          </>
                        );
                      })()}
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                      <span>Chronological: {result.chronological_age}</span>
                      {result.face_age && <span>Face: {result.face_age}</span>}
                      <span>Biological: {result.biological_age}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Radar Chart */}
                {result.category_scores && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2"><TrendingUp className="w-5 h-5" /> Health Category Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={350}>
                        <RadarChart data={result.category_scores}>
                          <PolarGrid stroke="hsl(var(--border))" />
                          <PolarAngleAxis dataKey="category" tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }} />
                          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: "hsl(var(--muted-foreground))" }} />
                          <Radar name="Score" dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.5} />
                          <Tooltip contentStyle={{ backgroundColor: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}

                {/* Detailed Breakdown */}
                {result.detailed_breakdown && (
                  <div className="grid md:grid-cols-3 gap-4">
                    {[
                      { label: "Cardiovascular Age", value: result.detailed_breakdown.cardiovascular_age, icon: Heart },
                      { label: "Metabolic Age", value: result.detailed_breakdown.metabolic_age, icon: Activity },
                      { label: "Fitness Age", value: result.detailed_breakdown.fitness_age, icon: TrendingUp },
                    ].map((item) => (
                      <Card key={item.label}>
                        <CardContent className="pt-6 text-center">
                          <item.icon className="w-6 h-6 mx-auto mb-2 text-primary" />
                          <p className="text-sm text-muted-foreground">{item.label}</p>
                          <p className="text-3xl font-bold text-foreground">{item.value}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Recommendations */}
                {result.recommendations?.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Personalized Recommendations</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {result.recommendations.map((rec: any, i: number) => (
                        <Card key={i} className="bg-muted/50">
                          <CardContent className="pt-6">
                            <h4 className="font-semibold mb-1 text-primary">{rec.title}</h4>
                            <p className="text-sm text-muted-foreground mb-2">{rec.description}</p>
                            <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">{rec.impact}</span>
                          </CardContent>
                        </Card>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            )}

            <SEOFaqSection faqs={faqItems} title="Biological Age FAQ" description="Common questions about biological age and how it's calculated" />
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};

export default BiologicalAgeCalculator;
