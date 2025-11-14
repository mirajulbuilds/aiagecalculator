import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Heart, Activity, Share2, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { triggerNativeShare } from "@/lib/shareUtils";
import PageTransition from "@/components/PageTransition";
import { Helmet } from "react-helmet-async";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

const HealthScoreCalculator = () => {
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [smoking, setSmoking] = useState("");
  const [exercise, setExercise] = useState("");
  const [alcohol, setAlcohol] = useState("");
  const [sleep, setSleep] = useState([7]);
  const [diet, setDiet] = useState("");
  const [stress, setStress] = useState("");
  const [bmi, setBmi] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleCalculate = async () => {
    if (!age || !gender || !smoking || !exercise || !alcohol || !diet || !stress || !bmi) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("calculate-health-score", {
        body: {
          age,
          gender,
          smoking,
          exercise,
          alcohol,
          sleep: sleep[0],
          diet,
          stress,
          bmi
        }
      });

      if (error) throw error;

      setResult(data);
      toast.success("Health score calculated!");
      
      setTimeout(() => {
        document.getElementById("result-card")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch (error: any) {
      console.error("Error calculating health score:", error);
      toast.error(error.message || "Failed to calculate health score");
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!result) return;
    
    const shareText = `My Health Score is ${result.health_score}/100! 🎯`;
    const shareUrl = window.location.href;
    
    await triggerNativeShare({
      title: "My Health Score",
      text: shareText,
      url: shareUrl,
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "hsl(var(--success))";
    if (score >= 60) return "hsl(var(--warning))";
    return "hsl(var(--destructive))";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Needs Improvement";
  };

  return (
    <PageTransition>
      <Helmet>
        <title>Health Score Calculator - Comprehensive Wellness Rating | AiAgeCalc</title>
        <meta name="description" content="Calculate your comprehensive health score based on lifestyle factors. Get personalized wellness recommendations and track your health metrics." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Heart className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
                Health Score Calculator
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Get a comprehensive wellness rating based on your lifestyle factors and receive personalized health recommendations
              </p>
            </div>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Your Health Profile
                </CardTitle>
                <CardDescription>
                  Enter your information to calculate your health score
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      placeholder="Enter your age"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      min="1"
                      max="120"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select value={gender} onValueChange={setGender}>
                      <SelectTrigger id="gender">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bmi">BMI (Body Mass Index)</Label>
                    <Input
                      id="bmi"
                      type="number"
                      placeholder="e.g., 22.5"
                      value={bmi}
                      onChange={(e) => setBmi(e.target.value)}
                      step="0.1"
                      min="10"
                      max="50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="smoking">Smoking Habits</Label>
                    <Select value={smoking} onValueChange={setSmoking}>
                      <SelectTrigger id="smoking">
                        <SelectValue placeholder="Select smoking habits" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="never">Never smoked</SelectItem>
                        <SelectItem value="former">Former smoker</SelectItem>
                        <SelectItem value="occasional">Occasional smoker</SelectItem>
                        <SelectItem value="regular">Regular smoker</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="exercise">Exercise Frequency</Label>
                    <Select value={exercise} onValueChange={setExercise}>
                      <SelectTrigger id="exercise">
                        <SelectValue placeholder="Select exercise frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="rare">1-2 times per week</SelectItem>
                        <SelectItem value="moderate">3-4 times per week</SelectItem>
                        <SelectItem value="frequent">5+ times per week</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="alcohol">Alcohol Consumption</Label>
                    <Select value={alcohol} onValueChange={setAlcohol}>
                      <SelectTrigger id="alcohol">
                        <SelectValue placeholder="Select alcohol consumption" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="light">Light (1-2 drinks per week)</SelectItem>
                        <SelectItem value="moderate">Moderate (3-7 drinks per week)</SelectItem>
                        <SelectItem value="heavy">Heavy (8+ drinks per week)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="diet">Diet Quality</Label>
                    <Select value={diet} onValueChange={setDiet}>
                      <SelectTrigger id="diet">
                        <SelectValue placeholder="Select diet quality" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="poor">Poor (mostly processed foods)</SelectItem>
                        <SelectItem value="fair">Fair (mixed diet)</SelectItem>
                        <SelectItem value="good">Good (balanced diet)</SelectItem>
                        <SelectItem value="excellent">Excellent (whole foods, balanced)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="stress">Stress Level</Label>
                    <Select value={stress} onValueChange={setStress}>
                      <SelectTrigger id="stress">
                        <SelectValue placeholder="Select stress level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="moderate">Moderate</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="very-high">Very High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sleep">Average Sleep Hours: {sleep[0]} hours</Label>
                  <Slider
                    id="sleep"
                    min={3}
                    max={12}
                    step={0.5}
                    value={sleep}
                    onValueChange={setSleep}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">Recommended: 7-9 hours per night</p>
                </div>

                <Button
                  onClick={handleCalculate}
                  disabled={loading}
                  className="w-full"
                  size="lg"
                >
                  {loading ? "Calculating..." : "Calculate Health Score"}
                </Button>
              </CardContent>
            </Card>

            {result && (
              <motion.div
                id="result-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="mb-8 border-2" style={{ borderColor: getScoreColor(result.health_score) }}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Heart className="w-6 h-6" style={{ color: getScoreColor(result.health_score) }} />
                        Your Health Score
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleShare}
                        className="gap-2"
                      >
                        <Share2 className="w-4 h-4" />
                        Share
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="text-center">
                      <div className="inline-flex flex-col items-center justify-center w-48 h-48 rounded-full border-8 mb-4" style={{ borderColor: getScoreColor(result.health_score) }}>
                        <span className="text-6xl font-bold" style={{ color: getScoreColor(result.health_score) }}>
                          {result.health_score}
                        </span>
                        <span className="text-xl text-muted-foreground">/ 100</span>
                        <span className="text-sm font-semibold mt-2" style={{ color: getScoreColor(result.health_score) }}>
                          {getScoreLabel(result.health_score)}
                        </span>
                      </div>
                      <p className="text-lg text-muted-foreground">{result.summary}</p>
                    </div>

                    {result.category_scores && (
                      <div className="space-y-4">
                        <h3 className="text-xl font-semibold flex items-center gap-2">
                          <TrendingUp className="w-5 h-5" />
                          Health Category Breakdown
                        </h3>
                        <ResponsiveContainer width="100%" height={400}>
                          <RadarChart data={result.category_scores}>
                            <PolarGrid stroke="hsl(var(--border))" />
                            <PolarAngleAxis dataKey="category" tick={{ fill: "hsl(var(--foreground))" }} />
                            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: "hsl(var(--muted-foreground))" }} />
                            <Radar name="Score" dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.6} />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: "hsl(var(--popover))", 
                                border: "1px solid hsl(var(--border))",
                                borderRadius: "8px"
                              }}
                            />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    )}

                    {result.recommendations && result.recommendations.length > 0 && (
                      <div className="space-y-4">
                        <h3 className="text-xl font-semibold">Personalized Recommendations</h3>
                        <div className="grid gap-4">
                          {result.recommendations.map((rec: any, index: number) => (
                            <Card key={index} className="bg-muted/50">
                              <CardContent className="pt-6">
                                <h4 className="font-semibold mb-2 text-primary">{rec.title}</h4>
                                <p className="text-sm text-muted-foreground">{rec.description}</p>
                                <div className="mt-2 flex items-center gap-2">
                                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">
                                    {rec.priority} priority
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    Impact: +{rec.impact_score} points
                                  </span>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}

                    {result.comparison_data && (
                      <div className="space-y-4">
                        <h3 className="text-xl font-semibold">How You Compare</h3>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={result.comparison_data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis dataKey="category" tick={{ fill: "hsl(var(--foreground))" }} />
                            <YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: "hsl(var(--popover))", 
                                border: "1px solid hsl(var(--border))",
                                borderRadius: "8px"
                              }}
                            />
                            <Legend />
                            <Bar dataKey="your_score" fill="hsl(var(--primary))" name="Your Score" />
                            <Bar dataKey="average_score" fill="hsl(var(--muted))" name="Average Score" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};

export default HealthScoreCalculator;
