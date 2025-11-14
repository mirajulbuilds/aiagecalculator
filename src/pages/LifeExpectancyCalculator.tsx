import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Calendar, Heart, Activity, Wine, Cigarette, MapPin, Share2, TrendingUp, Plus, Lightbulb, AlertCircle, CheckCircle } from "lucide-react";
import { useLifeExpectancyComparison } from "@/contexts/LifeExpectancyComparisonContext";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
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
    recommendations?: Array<{
      title: string;
      description: string;
      impact: string;
      priority: "high" | "medium" | "low";
      category: string;
    }>;
  } | null>(null);
  const [scenarioLabel, setScenarioLabel] = useState<string>("");
  const {
    addToComparison
  } = useLifeExpectancyComparison();
  const days = Array.from({
    length: 31
  }, (_, i) => i + 1);
  const months = [{
    value: "1",
    label: "January"
  }, {
    value: "2",
    label: "February"
  }, {
    value: "3",
    label: "March"
  }, {
    value: "4",
    label: "April"
  }, {
    value: "5",
    label: "May"
  }, {
    value: "6",
    label: "June"
  }, {
    value: "7",
    label: "July"
  }, {
    value: "8",
    label: "August"
  }, {
    value: "9",
    label: "September"
  }, {
    value: "10",
    label: "October"
  }, {
    value: "11",
    label: "November"
  }, {
    value: "12",
    label: "December"
  }];
  const currentYear = new Date().getFullYear();
  const years = Array.from({
    length: 100
  }, (_, i) => currentYear - i);

  // Chart data for visualizations
  const genderData = [{
    gender: "Male",
    average: 76,
    optimal: 82,
    yourAge: gender === "Male" ? result?.estimated_age || 0 : 0
  }, {
    gender: "Female",
    average: 81,
    optimal: 87,
    yourAge: gender === "Female" ? result?.estimated_age || 0 : 0
  }];
  const lifestyleData = [{
    factor: "Never Smoked",
    impact: 84
  }, {
    factor: "Regular Exercise",
    impact: 83
  }, {
    factor: "Moderate Alcohol",
    impact: 81
  }, {
    factor: "Healthy Diet",
    impact: 82
  }, {
    factor: "Good Sleep",
    impact: 80
  }, {
    factor: "Low Stress",
    impact: 81
  }];
  const ageGroupData = [{
    age: "20-30",
    male: 78,
    female: 83
  }, {
    age: "30-40",
    male: 77,
    female: 82
  }, {
    age: "40-50",
    male: 76,
    female: 81
  }, {
    age: "50-60",
    male: 75,
    female: 80
  }, {
    age: "60-70",
    male: 73,
    female: 78
  }, {
    age: "70-80",
    male: 70,
    female: 75
  }];
  const countries = ["Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kosovo", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"];
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
      const {
        data,
        error
      } = await supabase.functions.invoke('get-life-expectancy', {
        body: {
          birthDate,
          gender,
          country,
          smoking,
          exercise,
          alcohol
        }
      });
      if (error) throw error;
      if (data && data.estimated_age && data.summary_text) {
        setResult({
          estimated_age: data.estimated_age,
          summary_text: data.summary_text,
          recommendations: data.recommendations || []
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
          text: shareText
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
  const handleAddToComparison = () => {
    if (!result) return;
    const label = scenarioLabel.trim() || `Scenario ${Date.now()}`;
    const birthDate = `${birthYear}-${birthMonth.padStart(2, '0')}-${birthDay.padStart(2, '0')}`;
    addToComparison({
      id: Date.now().toString(),
      label,
      birthDate,
      gender,
      country,
      smoking,
      exercise,
      alcohol,
      estimatedAge: result.estimated_age,
      summary: result.summary_text
    });
    setScenarioLabel("");
  };
  return <>
      <Helmet>
        <title>Life Expectancy Calculator | How Long Will I Live?</title>
        <meta name="description" content="Calculate your estimated life expectancy based on lifestyle factors using AI-powered predictions. Get personalized insights about your potential longevity." />
      </Helmet>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-4 py-[22px] md:text-5xl">
            AI Life Expectancy Calculator
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Answer a few questions about your lifestyle, and our AI will give you an estimate of your potential life expectancy.
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
                    {days.map(day => <SelectItem key={day} value={day.toString()}>
                        {day}
                      </SelectItem>)}
                  </SelectContent>
                </Select>

                <Select value={birthMonth} onValueChange={setBirthMonth}>
                  <SelectTrigger>
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map(month => <SelectItem key={month.value} value={month.value}>
                        {month.label}
                      </SelectItem>)}
                  </SelectContent>
                </Select>

                <Select value={birthYear} onValueChange={setBirthYear}>
                  <SelectTrigger>
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map(year => <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>)}
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
                  {countries.map(countryName => <SelectItem key={countryName} value={countryName}>
                      {countryName}
                    </SelectItem>)}
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
            <Button onClick={handleCalculate} disabled={isLoading} className="main-action-button w-full" size="lg">
              {isLoading ? "Calculating..." : "Calculate My Life Expectancy"}
            </Button>
          </CardContent>
        </Card>

        {/* Result Card */}
        {result && <Card className="content-card animate-fade-in">
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

              {result.recommendations && result.recommendations.length > 0 && <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-primary" />
                    <h3 className="text-xl font-semibold">Personalized Recommendations</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Follow these evidence-based suggestions to maximize your life expectancy
                  </p>
                  
                  <div className="grid gap-3">
                    {result.recommendations.map((rec, index) => <Card key={index} className={`border-l-4 ${rec.priority === "high" ? "border-l-destructive" : rec.priority === "medium" ? "border-l-warning" : "border-l-primary"}`}>
                        <CardContent className="p-4 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                {rec.priority === "high" ? <AlertCircle className="w-4 h-4 text-destructive" /> : rec.priority === "medium" ? <AlertCircle className="w-4 h-4 text-warning" /> : <CheckCircle className="w-4 h-4 text-primary" />}
                                <h4 className="font-semibold">{rec.title}</h4>
                              </div>
                              <p className="text-sm text-muted-foreground leading-relaxed">
                                {rec.description}
                              </p>
                            </div>
                            <div className="text-right shrink-0">
                              <div className="text-xs font-medium text-muted-foreground uppercase mb-1">
                                Impact
                              </div>
                              <div className="text-sm font-bold text-primary">
                                {rec.impact}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 pt-2 border-t border-border">
                            <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full font-medium">
                              {rec.category}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${rec.priority === "high" ? "bg-destructive/10 text-destructive" : rec.priority === "medium" ? "bg-warning/10 text-warning" : "bg-primary/10 text-primary"}`}>
                              {rec.priority} priority
                            </span>
                          </div>
                        </CardContent>
                      </Card>)}
                  </div>
                </div>}

              <div className="flex flex-col gap-3">
                <Button onClick={handleShare} variant="outline" className="gap-2" size="lg">
                  <Share2 className="w-4 h-4" />
                  Share Result
                </Button>
                
                <div className="flex gap-2">
                  <input type="text" value={scenarioLabel} onChange={e => setScenarioLabel(e.target.value)} placeholder="Name this scenario (optional)" className="flex-1 px-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
                  <Button onClick={handleAddToComparison} className="gap-2" size="lg">
                    <Plus className="w-4 h-4" />
                    Add to Compare
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>}

        {/* Data Visualization Charts */}
        {result && <div className="space-y-6 mt-8">
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <h2 className="text-2xl font-bold">Life Expectancy Insights</h2>
              </div>
              <p className="text-muted-foreground">Explore how different factors affect longevity</p>
            </div>

            {/* Gender Comparison Chart */}
            <Card className="border-2 border-primary/20">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">Life Expectancy by Gender</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Comparing average, optimal, and your estimated life expectancy
                </p>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={genderData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="gender" className="text-xs" />
                    <YAxis className="text-xs" domain={[60, 90]} />
                    <Tooltip contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }} />
                    <Legend />
                    <Bar dataKey="average" fill="hsl(var(--muted))" name="Global Average" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="optimal" fill="hsl(var(--primary))" name="Optimal Health" radius={[8, 8, 0, 0]} />
                    {result && <Bar dataKey="yourAge" fill="hsl(var(--chart-2))" name="Your Estimate" radius={[8, 8, 0, 0]} />}
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Lifestyle Factors Chart */}
            <Card className="border-2 border-primary/20">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">Impact of Lifestyle Factors</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  How healthy habits can increase your life expectancy
                </p>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={lifestyleData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" domain={[75, 85]} className="text-xs" />
                    <YAxis dataKey="factor" type="category" width={120} className="text-xs" />
                    <Tooltip contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }} />
                    <Bar dataKey="impact" fill="hsl(var(--primary))" name="Life Expectancy (years)" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Age Group Trends Chart */}
            <Card className="border-2 border-primary/20">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">Life Expectancy Trends by Age Group</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Life expectancy estimates based on current age and gender
                </p>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={ageGroupData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="age" className="text-xs" />
                    <YAxis domain={[65, 85]} className="text-xs" />
                    <Tooltip contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }} />
                    <Legend />
                    <Line type="monotone" dataKey="male" stroke="hsl(var(--chart-1))" strokeWidth={3} name="Male" dot={{
                  r: 5
                }} activeDot={{
                  r: 7
                }} />
                    <Line type="monotone" dataKey="female" stroke="hsl(var(--chart-2))" strokeWidth={3} name="Female" dot={{
                  r: 5
                }} activeDot={{
                  r: 7
                }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="text-center text-sm text-muted-foreground p-4 bg-muted/30 rounded-lg">
              <p>
                <strong>Note:</strong> These charts display general trends based on population averages. 
                Individual results may vary based on genetics, environment, and personal health choices.
              </p>
            </div>
          </div>}
      </div>
    </>;
};
export default LifeExpectancyCalculator;