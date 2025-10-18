import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { differenceInYears, differenceInMonths, differenceInDays, differenceInHours, differenceInMinutes } from "date-fns";
import { Globe, Calendar as CalendarIconComponent, Download, Sparkles, Users, Share2, Rocket, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { AgeDisplayFormats } from "@/components/AgeDisplayFormats";
import { AdditionalAgeInfo } from "@/components/AdditionalAgeInfo";
import { AgeDifferenceCalculator } from "@/components/AgeDifferenceCalculator";
import { AgeAtDateCalculator } from "@/components/AgeAtDateCalculator";
import { AdSenseBanner } from "@/components/AdSenseBanner";
import FamousBirthdayMatches from "@/components/FamousBirthdayMatches";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";

interface AgeResult {
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalDays: number;
  totalHours: number;
  totalMinutes: number;
  totalSeconds: number;
  nextBirthdayDays: number;
  zodiacSign: string;
  zodiacSymbol: string;
}

const Index = () => {
  const [birthDay, setBirthDay] = useState<string>("");
  const [birthMonth, setBirthMonth] = useState<string>("");
  const [birthYear, setBirthYear] = useState<string>("");
  
  const currentDate = new Date();
  const [targetDay, setTargetDay] = useState<string>(currentDate.getDate().toString());
  const [targetMonth, setTargetMonth] = useState<string>((currentDate.getMonth() + 1).toString());
  const [targetYear, setTargetYear] = useState<string>(currentDate.getFullYear().toString());
  
  const [result, setResult] = useState<AgeResult | null>(null);
  const [timezone, setTimezone] = useState<string>("");
  const [liveAge, setLiveAge] = useState<AgeResult | null>(null);
  const [planetAges, setPlanetAges] = useState<{ planet: string; age: number; emoji: string }[]>([]);
  const [activeTab, setActiveTab] = useState<string>("calculator");
  const [showMorePlanets, setShowMorePlanets] = useState<boolean>(false);
  
  // AI Greetings state
  const [selectedOccasion, setSelectedOccasion] = useState('');
  const [occasionDay, setOccasionDay] = useState('');
  const [occasionMonth, setOccasionMonth] = useState('');
  const [occasionYear, setOccasionYear] = useState('');
  const [greetingPrompt, setGreetingPrompt] = useState('');
  const [generatedGreeting, setGeneratedGreeting] = useState('');
  const [isGeneratingGreeting, setIsGeneratingGreeting] = useState(false);

  useEffect(() => {
    // Detect user's timezone
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setTimezone(userTimezone);
  }, []);

  // Live age update every second
  useEffect(() => {
    if (!birthDay || !birthMonth || !birthYear || !result) {
      return;
    }

    const updateLiveAge = () => {
      const now = new Date();
      const birthDate = new Date(parseInt(birthYear), parseInt(birthMonth) - 1, parseInt(birthDay));

      if (isNaN(birthDate.getTime()) || birthDate > now) {
        return;
      }

      const years = differenceInYears(now, birthDate);
      const months = differenceInMonths(now, birthDate) % 12;
      
      const afterMonths = new Date(birthDate);
      afterMonths.setFullYear(birthDate.getFullYear() + years);
      afterMonths.setMonth(birthDate.getMonth() + months);
      const days = differenceInDays(now, afterMonths);
      
      const afterDays = new Date(afterMonths);
      afterDays.setDate(afterMonths.getDate() + days);
      const hours = differenceInHours(now, afterDays);
      
      const afterHours = new Date(afterDays);
      afterHours.setHours(afterDays.getHours() + hours);
      const minutes = differenceInMinutes(now, afterHours);
      
      const afterMinutes = new Date(afterHours);
      afterMinutes.setMinutes(afterHours.getMinutes() + minutes);
      const seconds = Math.floor((now.getTime() - afterMinutes.getTime()) / 1000);

      const totalDays = differenceInDays(now, birthDate);
      const totalHours = differenceInHours(now, birthDate);
      const totalMinutes = differenceInMinutes(now, birthDate);
      const totalSeconds = Math.floor((now.getTime() - birthDate.getTime()) / 1000);

      // Calculate next birthday for live age
      const nextBirthdayDays = calculateNextBirthday(parseInt(birthMonth), parseInt(birthDay));
      const zodiac = getZodiacSign(parseInt(birthMonth), parseInt(birthDay));

      setLiveAge({
        years,
        months,
        days,
        hours,
        minutes,
        seconds,
        totalDays,
        totalHours,
        totalMinutes,
        totalSeconds,
        nextBirthdayDays,
        zodiacSign: zodiac.sign,
        zodiacSymbol: zodiac.symbol,
      });
    };

    updateLiveAge();
    const interval = setInterval(updateLiveAge, 1000);

    return () => clearInterval(interval);
  }, [birthDay, birthMonth, birthYear, result]);

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

  const getZodiacSign = (month: number, day: number): { sign: string; symbol: string } => {
    const zodiacData: { [key: string]: { sign: string; symbol: string } } = {
      capricorn: { sign: "Capricorn", symbol: "♑" },
      aquarius: { sign: "Aquarius", symbol: "♒" },
      pisces: { sign: "Pisces", symbol: "♓" },
      aries: { sign: "Aries", symbol: "♈" },
      taurus: { sign: "Taurus", symbol: "♉" },
      gemini: { sign: "Gemini", symbol: "♊" },
      cancer: { sign: "Cancer", symbol: "♋" },
      leo: { sign: "Leo", symbol: "♌" },
      virgo: { sign: "Virgo", symbol: "♍" },
      libra: { sign: "Libra", symbol: "♎" },
      scorpio: { sign: "Scorpio", symbol: "♏" },
      sagittarius: { sign: "Sagittarius", symbol: "♐" },
    };

    if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return zodiacData.aries;
    if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return zodiacData.taurus;
    if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return zodiacData.gemini;
    if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return zodiacData.cancer;
    if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return zodiacData.leo;
    if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return zodiacData.virgo;
    if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return zodiacData.libra;
    if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return zodiacData.scorpio;
    if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return zodiacData.sagittarius;
    if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return zodiacData.capricorn;
    if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return zodiacData.aquarius;
    return zodiacData.pisces;
  };

  const calculateNextBirthday = (birthMonth: number, birthDay: number): number => {
    const today = new Date();
    const currentYear = today.getFullYear();
    
    // Create this year's birthday
    let nextBirthday = new Date(currentYear, birthMonth - 1, birthDay);
    
    // If birthday has passed this year, use next year
    if (nextBirthday < today) {
      nextBirthday = new Date(currentYear + 1, birthMonth - 1, birthDay);
    }
    
    // Calculate days difference
    const diffTime = nextBirthday.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  const calculateAge = () => {
    if (!birthDay || !birthMonth || !birthYear) {
      toast.error("Please select your birth date");
      return;
    }

    if (!targetDay || !targetMonth || !targetYear) {
      toast.error("Please select a target date");
      return;
    }

    const birthDate = new Date(parseInt(birthYear), parseInt(birthMonth) - 1, parseInt(birthDay));
    const targetDate = new Date(parseInt(targetYear), parseInt(targetMonth) - 1, parseInt(targetDay));

    if (isNaN(birthDate.getTime()) || isNaN(targetDate.getTime())) {
      toast.error("Please select valid dates");
      return;
    }

    if (birthDate > targetDate) {
      toast.error("Birth date cannot be after the target date");
      return;
    }

    // Calculate differences
    const years = differenceInYears(targetDate, birthDate);
    const months = differenceInMonths(targetDate, birthDate) % 12;
    
    // For days, we need to account for the months already counted
    const afterMonths = new Date(birthDate);
    afterMonths.setFullYear(birthDate.getFullYear() + years);
    afterMonths.setMonth(birthDate.getMonth() + months);
    const days = differenceInDays(targetDate, afterMonths);
    
    // For hours and minutes, calculate from the last complete day
    const afterDays = new Date(afterMonths);
    afterDays.setDate(afterMonths.getDate() + days);
    const hours = differenceInHours(targetDate, afterDays);
    
    const afterHours = new Date(afterDays);
    afterHours.setHours(afterDays.getHours() + hours);
    const minutes = differenceInMinutes(targetDate, afterHours);
    
    const afterMinutes = new Date(afterHours);
    afterMinutes.setMinutes(afterHours.getMinutes() + minutes);
    const seconds = Math.floor((targetDate.getTime() - afterMinutes.getTime()) / 1000);

    // Calculate totals
    const totalDays = differenceInDays(targetDate, birthDate);
    const totalHours = differenceInHours(targetDate, birthDate);
    const totalMinutes = differenceInMinutes(targetDate, birthDate);
    const totalSeconds = Math.floor((targetDate.getTime() - birthDate.getTime()) / 1000);

    // Calculate next birthday countdown
    const nextBirthdayDays = calculateNextBirthday(parseInt(birthMonth), parseInt(birthDay));

    // Get zodiac sign
    const zodiac = getZodiacSign(parseInt(birthMonth), parseInt(birthDay));

    // Calculate planet ages
    const planets = [
      { name: "Moon", days: 27.3, emoji: "🌙" },
      { name: "Mercury", days: 88, emoji: "☿️" },
      { name: "Venus", days: 225, emoji: "♀️" },
      { name: "Mars", days: 687, emoji: "♂️" },
      { name: "Jupiter", days: 4333, emoji: "♃" },
      { name: "Saturn", days: 10759, emoji: "♄" },
      { name: "Uranus", days: 30687, emoji: "⛢" },
      { name: "Neptune", days: 60190, emoji: "♆" },
      { name: "Pluto", days: 90560, emoji: "♇" },
      { name: "Ceres", days: 1682, emoji: "⚳" },
      { name: "Eris", days: 203830, emoji: "⯰" },
      { name: "Sun", days: 27, emoji: "☀️" },
    ];
    
    const earthDays = totalDays;
    const calculatedPlanetAges = planets.map(planet => ({
      planet: planet.name,
      age: Number((earthDays / planet.days).toFixed(2)),
      emoji: planet.emoji,
    }));

    setPlanetAges(calculatedPlanetAges);

    setResult({
      years,
      months,
      days,
      hours,
      minutes,
      seconds,
      totalDays,
      totalHours,
      totalMinutes,
      totalSeconds,
      nextBirthdayDays,
      zodiacSign: zodiac.sign,
      zodiacSymbol: zodiac.symbol,
    });

    toast.success("Age calculated successfully!");
  };


  return (
    <main className="min-h-screen bg-background px-4 sm:px-6 md:px-8 py-4 sm:py-8">
      {/* Structured Data for SEO */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "AI Age Calculator",
          "description": "Calculate your exact age in years, months, days, hours, minutes, and seconds with our free AI age calculator tool",
          "url": "https://aiagecalculator.lovable.app/",
          "mainEntity": {
            "@type": "SoftwareApplication",
            "name": "AI Age Calculator",
            "applicationCategory": "UtilityApplication",
            "offers": {
              "@type": "Offer",
              "price": "0"
            }
          }
        })}
      </script>
      
      <div className="max-w-5xl mx-auto flex flex-col xl:flex-row gap-4 xl:gap-6">
        {/* Main Content */}
        <div className="flex-1 w-full max-w-3xl mx-auto xl:mx-0">
        {/* Top Banner Ad */}
        <AdSenseBanner format="large-horizontal" className="mb-6" />
        
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-4">
            Unlock the Secrets of Your Birthday
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
            Find your Zodiac sign, countdown to your next birthday, and even discover your age on Mars—all right here.
          </p>
        </header>

        {/* Timezone Section */}
        {timezone && (
          <div className="text-center mb-4">
            <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <Globe className="w-4 h-4" />
              <span>Timezone: <span className="font-medium">{timezone}</span></span>
            </div>
          </div>
        )}

        {/* Famous People Section */}
        <div className="text-center mb-8">
          <Link to="/famous-people">
            <Button variant="outline" className="gap-2">
              <Users className="w-4 h-4" />
              Explore Famous People Birthdays
            </Button>
          </Link>
        </div>

        {/* Tabbed Calculator Interface */}
        <section 
          className="bg-card rounded-2xl shadow-card p-6 md:p-8 mb-6"
          aria-label="Age calculators"
        >
          <Tabs defaultValue="calculator" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6 h-auto">
              <TabsTrigger 
                value="calculator" 
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
              >
                Age Calculator
              </TabsTrigger>
              <TabsTrigger 
                value="difference"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
              >
                Age Difference
              </TabsTrigger>
              <TabsTrigger 
                value="specific"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
              >
                Specific Date
              </TabsTrigger>
              <TabsTrigger 
                value="greetings"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
              >
                AI Greetings
              </TabsTrigger>
            </TabsList>

            {/* Main Age Calculator Tab */}
            <TabsContent value="calculator" className="animate-fade-in space-y-0">
              <div>
          <div className="flex items-center gap-2 mb-6">
            <CalendarIconComponent className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">Enter Your Details to See the Magic</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Birth Date Input */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Date of Birth
              </label>
              <div className="grid grid-cols-3 gap-2">
                <Select value={birthDay} onValueChange={setBirthDay}>
                  <SelectTrigger className="h-12 bg-muted">
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
                <Select value={birthMonth} onValueChange={setBirthMonth}>
                  <SelectTrigger className="h-12 bg-muted">
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
                  <SelectTrigger className="h-12 bg-muted">
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

            {/* Target Date Input */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Calculate Age Until
              </label>
              <div className="grid grid-cols-3 gap-2">
                <Select value={targetDay} onValueChange={setTargetDay}>
                  <SelectTrigger className="h-12 bg-muted">
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
                <Select value={targetMonth} onValueChange={setTargetMonth}>
                  <SelectTrigger className="h-12 bg-muted">
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
                <Select value={targetYear} onValueChange={setTargetYear}>
                  <SelectTrigger className="h-12 bg-muted">
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
          </div>

          {/* Calculate Button */}
          <Button
            onClick={calculateAge}
            className="w-full h-12 bg-gradient-primary text-primary-foreground font-medium text-base hover:opacity-90 transition-opacity"
            size="lg"
          >
            Calculate Age
          </Button>

          {/* What You'll Discover Section - Show before calculation */}
          {!result && activeTab === "calculator" && (
            <div className="mt-8 p-6 bg-accent/30 rounded-xl border border-border animate-fade-in">
              <h3 className="text-xl font-semibold text-foreground mb-4 text-center">
                Here's What You'll Discover:
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-muted-foreground">
                  <span className="text-2xl">📅</span>
                  <div>
                    <strong className="text-foreground">Next Birthday:</strong> How many days are left?
                  </div>
                </li>
                <li className="flex items-start gap-3 text-muted-foreground">
                  <span className="text-2xl">✨</span>
                  <div>
                    <strong className="text-foreground">Your Zodiac Sign:</strong> The mystery of your personality.
                  </div>
                </li>
                <li className="flex items-start gap-3 text-muted-foreground">
                  <span className="text-2xl">⏳</span>
                  <div>
                    <strong className="text-foreground">Life Statistics:</strong> How many total minutes have you lived?
                  </div>
                </li>
                <li className="flex items-start gap-3 text-muted-foreground">
                  <span className="text-2xl">🪐</span>
                  <div>
                    <strong className="text-foreground">Age on Planets:</strong> What is your age on Mars?
                  </div>
                </li>
              </ul>
            </div>
            )}
              </div>
              
              {/* SEO Content for Age Calculator */}
              <div className="mt-8 p-6 bg-accent/20 rounded-xl border border-border">
                <h2 className="text-2xl font-bold text-foreground mb-3">
                  More Than Just an Age Calculator
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Go beyond simple age calculation. Our tool not only tells you your precise age in years, months, and days but also reveals fun life statistics like your total time on Earth in hours and minutes. Discover your Zodiac sign and get an exciting <strong>birthday countdown</strong> to your next celebration. It's the ultimate tool for understanding your life's timeline.
                </p>
              </div>
            </TabsContent>

            {/* Age Difference Calculator Tab */}
            <TabsContent value="difference" className="animate-fade-in">
              <AgeDifferenceCalculator />
              
              {/* SEO Content for Age Difference */}
              <div className="mt-8 p-6 bg-accent/20 rounded-xl border border-border">
                <h2 className="text-2xl font-bold text-foreground mb-3">
                  Easily Compare Ages with Our Age Difference Calculator
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Ever wondered about the exact age gap between you and a friend, family member, or colleague? Our <strong>Age Difference Calculator</strong> makes it simple. Just enter two dates of birth to get a precise calculation of the difference in years, months, and days. Perfect for event planning, historical comparisons, or just for fun!
                </p>
              </div>
            </TabsContent>

            {/* Specific Date Calculator Tab */}
            <TabsContent value="specific" className="animate-fade-in">
              <AgeAtDateCalculator />
              
              {/* SEO Content for Specific Date */}
              <div className="mt-8 p-6 bg-accent/20 rounded-xl border border-border">
                <h2 className="text-2xl font-bold text-foreground mb-3">
                  Travel Through Time and Space
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  What was your exact age during a historic event? How old will you be in 2050? Our <strong>Age at a Specific Date</strong> tool lets you find out instantly. Plus, take an interstellar journey with our <strong>Age on Other Planets calculator</strong>. Discover your age on Mars, Jupiter, the Moon, and more in a stunning visual experience. It's a fun and educational tool for space enthusiasts of all ages.
                </p>
              </div>
            </TabsContent>

            {/* AI Greetings Tab */}
            <TabsContent value="greetings" className="animate-fade-in">
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-primary mb-2">AI Greetings Generator</h2>
                  <p className="text-muted-foreground">
                    Create beautiful custom greeting images for any special occasion
                  </p>
                </div>

                {/* Step 1: Occasion Selector */}
                <div className="space-y-2">
                  <Label htmlFor="occasion" className="text-lg font-semibold">
                    1. Choose an Occasion
                  </Label>
                  <select
                    id="occasion"
                    value={selectedOccasion}
                    onChange={(e) => {
                      setSelectedOccasion(e.target.value);
                      // Reset date if occasion doesn't need it
                      if (!['Birthday', 'Wedding Anniversary', 'General Anniversary'].includes(e.target.value)) {
                        setOccasionDay('');
                        setOccasionMonth('');
                        setOccasionYear('');
                      }
                    }}
                    className="w-full p-3 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">Select an occasion...</option>
                    <option value="Birthday">Birthday</option>
                    <option value="Wedding Anniversary">Wedding Anniversary</option>
                    <option value="Valentine's Day">Valentine's Day</option>
                    <option value="Women's Day">Women's Day</option>
                    <option value="Mother's Day">Mother's Day</option>
                    <option value="Eid Mubarak">Eid Mubarak</option>
                    <option value="Puja Greetings">Puja Greetings</option>
                    <option value="Christmas">Christmas</option>
                    <option value="General Anniversary">General Anniversary</option>
                  </select>
                </div>

                {/* Step 2: Conditional Date Picker */}
                {selectedOccasion && ['Birthday', 'Wedding Anniversary', 'General Anniversary'].includes(selectedOccasion) && (
                  <div className="space-y-2 animate-fade-in">
                    <Label htmlFor="occasion-date" className="text-lg font-semibold">
                      2. Select a Date (Optional)
                    </Label>
                    <div className="grid grid-cols-3 gap-2">
                      <Select value={occasionDay} onValueChange={setOccasionDay}>
                        <SelectTrigger className="h-12 bg-muted">
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
                      <Select value={occasionMonth} onValueChange={setOccasionMonth}>
                        <SelectTrigger className="h-12 bg-muted">
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
                      <Select value={occasionYear} onValueChange={setOccasionYear}>
                        <SelectTrigger className="h-12 bg-muted">
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
                )}

                {/* Step 3: Custom Prompt */}
                <div className="space-y-2">
                  <Label htmlFor="greeting-prompt" className="text-lg font-semibold">
                    {selectedOccasion && ['Birthday', 'Wedding Anniversary', 'General Anniversary'].includes(selectedOccasion) ? '3' : '2'}. Describe the Image You Want
                  </Label>
                  <Textarea
                    id="greeting-prompt"
                    value={greetingPrompt}
                    onChange={(e) => setGreetingPrompt(e.target.value)}
                    placeholder="e.g., A beautiful birthday cake with 'Happy Birthday Alex' on it, surrounded by blue and silver balloons."
                    className="w-full min-h-[120px] bg-muted resize-y"
                  />
                </div>

                {/* Generate Button */}
                <Button
                  onClick={async () => {
                    if (!selectedOccasion || !greetingPrompt) {
                      toast.error("Please select an occasion and describe your image.");
                      return;
                    }

                    setIsGeneratingGreeting(true);
                    setGeneratedGreeting('');

                    try {
                      // Format date if selected
                      let formattedDate = '';
                      if (occasionDay && occasionMonth && occasionYear) {
                        const monthName = months.find(m => m.value === occasionMonth)?.label || '';
                        formattedDate = `${monthName} ${occasionDay}, ${occasionYear}`;
                      }

                      const { data, error } = await supabase.functions.invoke('generate-greeting-image', {
                        body: {
                          occasion: selectedOccasion,
                          date: formattedDate,
                          customPrompt: greetingPrompt,
                        },
                      });

                      // Check if there's an error from Supabase SDK
                      if (error) {
                        // If data contains an error message, use that
                        if (data && data.error) {
                          throw new Error(data.error);
                        }
                        throw error;
                      }

                      // Check if response contains an error message
                      if (data && data.error) {
                        throw new Error(data.error);
                      }

                      // Check if we got a valid image URL
                      if (!data || !data.imageUrl) {
                        throw new Error("No image was generated. Please try again.");
                      }

                      setGeneratedGreeting(data.imageUrl);
                      toast.success("Your greeting image has been generated!");
                    } catch (error) {
                      console.error('Error generating image:', error);
                      let errorMessage = "Failed to generate image. Please try again.";
                      
                      if (error instanceof Error) {
                        errorMessage = error.message;
                      }
                      
                      // Add helpful context for payment errors
                      if (errorMessage.includes("Payment required") || errorMessage.includes("credits")) {
                        errorMessage += " You can add credits in Settings → Workspace → Usage.";
                      }
                      
                      toast.error(errorMessage, {
                        duration: 6000,
                      });
                    } finally {
                      setIsGeneratingGreeting(false);
                    }
                  }}
                  disabled={isGeneratingGreeting || !selectedOccasion || !greetingPrompt}
                  className="w-full h-12 text-lg"
                >
                  {isGeneratingGreeting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Generating Your Image...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      Generate Image
                    </>
                  )}
                </Button>

                {/* Image Result Area */}
                {isGeneratingGreeting && (
                  <div className="flex flex-col items-center justify-center py-12 space-y-4 animate-fade-in">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <p className="text-muted-foreground text-lg">Generating your image, please wait...</p>
                  </div>
                )}

                {generatedGreeting && !isGeneratingGreeting && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="relative rounded-lg overflow-hidden border-2 border-primary/20 bg-muted">
                      <img
                        src={generatedGreeting}
                        alt="Generated greeting"
                        className="w-full h-auto"
                      />
                    </div>
                    <Button
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = generatedGreeting;
                        link.download = `${selectedOccasion.toLowerCase().replace(/\s+/g, '-')}-greeting.png`;
                        link.click();
                        toast.success("Image downloaded successfully!");
                      }}
                      className="w-full"
                      variant="outline"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download Image
                    </Button>
                  </div>
                )}
              </div>
              
              {/* SEO Content for AI Greetings */}
              <div className="mt-8 p-6 bg-accent/20 rounded-xl border border-border">
                <h2 className="text-2xl font-bold text-foreground mb-3">
                  Create Unique AI-Powered Greeting Images
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Say goodbye to generic wishes! With our <strong>AI Greetings Image Generator</strong>, you can create beautiful, custom images for any occasion. Generate personalized <strong>birthday wishes</strong>, romantic wedding anniversary cards, Eid Mubarak greetings, or festive Christmas images. Just choose an occasion, describe your idea, and let our AI bring your vision to life.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </section>

        {/* Traditional Age Section */}
        {result && activeTab === "calculator" && (
          <section 
            className="bg-card rounded-2xl shadow-card p-6 md:p-8 mb-6 animate-fade-in"
            aria-label="Traditional age"
          >
            <div className="flex items-center justify-center gap-2 mb-6">
              <CalendarIconComponent className="w-6 h-6 text-primary" />
              <h2 className="text-xl md:text-2xl font-bold text-foreground">
                Traditional Age
              </h2>
            </div>
            
            <div className="bg-gradient-to-br from-primary/10 via-accent/20 to-primary/5 rounded-2xl p-8 shadow-lg border border-primary/20">
              <div className="grid grid-cols-3 gap-6 md:gap-8">
                <div className="text-center">
                  <div className="text-5xl md:text-6xl lg:text-7xl font-bold text-primary mb-3">
                    {result.years}
                  </div>
                  <div className="text-sm md:text-base font-medium text-muted-foreground">
                    Years
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-5xl md:text-6xl lg:text-7xl font-bold text-primary mb-3">
                    {result.months}
                  </div>
                  <div className="text-sm md:text-base font-medium text-muted-foreground">
                    Months
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-5xl md:text-6xl lg:text-7xl font-bold text-primary mb-3">
                    {result.days}
                  </div>
                  <div className="text-sm md:text-base font-medium text-muted-foreground">
                    Days
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Additional Age Info Section */}
        {result && activeTab === "calculator" && (
          <AdditionalAgeInfo 
            nextBirthdayDays={result.nextBirthdayDays}
            zodiacSign={result.zodiacSign}
            zodiacSymbol={result.zodiacSymbol}
          />
        )}

        {/* Planet Ages Section */}
        {planetAges.length > 0 && activeTab === "calculator" && (
          <section className="bg-card rounded-2xl shadow-card p-6 md:p-8 mb-6 animate-fade-in">
            <div className="flex items-center gap-2 mb-6">
              <Rocket className="w-5 h-5 text-primary" />
              <h3 className="text-xl font-semibold text-foreground">Your Age on Other Planets & Moon</h3>
            </div>
            
            {/* Initially Visible - First 4 Bodies (2x2 Grid) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              {planetAges.slice(0, 4).map((result, index) => {
                // Import planet images dynamically based on name
                const planetImages: Record<string, string> = {
                  'Moon': new URL('../assets/planets/moon.jpg', import.meta.url).href,
                  'Mercury': new URL('../assets/planets/mercury.jpg', import.meta.url).href,
                  'Venus': new URL('../assets/planets/venus.jpg', import.meta.url).href,
                  'Mars': new URL('../assets/planets/mars.jpg', import.meta.url).href,
                  'Jupiter': new URL('../assets/planets/jupiter.jpg', import.meta.url).href,
                  'Saturn': new URL('../assets/planets/saturn.jpg', import.meta.url).href,
                  'Uranus': new URL('../assets/planets/uranus.jpg', import.meta.url).href,
                  'Neptune': new URL('../assets/planets/neptune.jpg', import.meta.url).href,
                  'Pluto': new URL('../assets/planets/pluto.jpg', import.meta.url).href,
                  'Ceres': new URL('../assets/planets/ceres.jpg', import.meta.url).href,
                  'Eris': new URL('../assets/planets/eris.jpg', import.meta.url).href,
                  'Sun': new URL('../assets/planets/sun.jpg', import.meta.url).href,
                };

                return (
                  <div
                    key={result.planet}
                    className="group relative rounded-2xl overflow-hidden bg-gradient-to-br from-background via-card to-accent/20 transition-all duration-500 hover:scale-105 hover:shadow-2xl animate-fade-in p-8"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* Card Content Container */}
                    <div className="flex flex-col items-center justify-center space-y-4">
                      {/* Planet Name */}
                      <h4 className="text-2xl font-bold text-foreground text-center">
                        {result.planet}
                      </h4>
                      
                      {/* Rotating Planet Image - Circular Frame */}
                      <div className="relative w-40 h-40 rounded-full overflow-hidden shadow-2xl">
                        <div 
                          className="absolute inset-0 w-full h-full"
                          style={{
                            animation: 'spin 35s linear infinite',
                          }}
                        >
                          <img
                            src={planetImages[result.planet]}
                            alt={`Image of ${result.planet === 'Moon' ? 'The Moon' : result.planet === 'Sun' ? 'The Sun' : `the ${result.planet === 'Ceres' || result.planet === 'Eris' ? 'dwarf planet' : 'planet'} ${result.planet}`}${result.planet === 'Saturn' ? ' with its rings' : ''}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                      
                      {/* Age Display */}
                      <div className="flex flex-col items-center space-y-1">
                        <div className="text-5xl font-bold text-primary">
                          {result.age}
                        </div>
                        <div className="text-lg text-muted-foreground">
                          years old here!
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* "See More" Button */}
            <div className="flex justify-center mb-6">
              <Button
                onClick={() => setShowMorePlanets(!showMorePlanets)}
                variant="outline"
                className="gap-2"
              >
                <Rocket className="w-4 h-4" />
                {showMorePlanets ? "Show Less" : "See More Celestial Bodies"}
              </Button>
            </div>

            {/* Expandable Section - Additional 7 Bodies */}
            {showMorePlanets && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                {planetAges.slice(4).map((result, index) => {
                  const planetImages: Record<string, string> = {
                    'Moon': new URL('../assets/planets/moon.jpg', import.meta.url).href,
                    'Mercury': new URL('../assets/planets/mercury.jpg', import.meta.url).href,
                    'Venus': new URL('../assets/planets/venus.jpg', import.meta.url).href,
                    'Mars': new URL('../assets/planets/mars.jpg', import.meta.url).href,
                    'Jupiter': new URL('../assets/planets/jupiter.jpg', import.meta.url).href,
                    'Saturn': new URL('../assets/planets/saturn.jpg', import.meta.url).href,
                    'Uranus': new URL('../assets/planets/uranus.jpg', import.meta.url).href,
                    'Neptune': new URL('../assets/planets/neptune.jpg', import.meta.url).href,
                    'Pluto': new URL('../assets/planets/pluto.jpg', import.meta.url).href,
                    'Ceres': new URL('../assets/planets/ceres.jpg', import.meta.url).href,
                    'Eris': new URL('../assets/planets/eris.jpg', import.meta.url).href,
                    'Sun': new URL('../assets/planets/sun.jpg', import.meta.url).href,
                  };

                  return (
                    <div
                      key={result.planet}
                      className="group relative rounded-2xl overflow-hidden bg-gradient-to-br from-background via-card to-accent/20 transition-all duration-500 hover:scale-105 hover:shadow-2xl animate-fade-in p-8"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      {/* Card Content Container */}
                      <div className="flex flex-col items-center justify-center space-y-4">
                        {/* Planet Name */}
                        <h4 className="text-2xl font-bold text-foreground text-center">
                          {result.planet}
                        </h4>
                        
                        {/* Rotating Planet Image - Circular Frame */}
                        <div className="relative w-40 h-40 rounded-full overflow-hidden shadow-2xl">
                          <div 
                            className="absolute inset-0 w-full h-full"
                            style={{
                              animation: 'spin 35s linear infinite',
                            }}
                          >
                            <img
                              src={planetImages[result.planet]}
                              alt={`Image of ${result.planet === 'Moon' ? 'The Moon' : result.planet === 'Sun' ? 'The Sun' : `the ${result.planet === 'Ceres' || result.planet === 'Eris' ? 'dwarf planet' : 'planet'} ${result.planet}`}${result.planet === 'Saturn' ? ' with its rings' : ''}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                        
                        {/* Age Display */}
                        <div className="flex flex-col items-center space-y-1">
                          <div className="text-5xl font-bold text-primary">
                            {result.age}
                          </div>
                          <div className="text-lg text-muted-foreground">
                            years old here!
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}


        {/* Ad Banner */}
        {result && activeTab === "calculator" && (
          <AdSenseBanner format="large-horizontal" className="mb-6" />
        )}

        {/* Live Age Display */}
        {liveAge && activeTab === "calculator" && (
          <section 
            className="bg-gradient-primary rounded-2xl shadow-card p-6 md:p-8 mb-6 text-primary-foreground"
            aria-label="Live age counter"
          >
            <div className="text-center mb-4">
              <h2 className="text-xl md:text-2xl font-semibold mb-1">
                Your Current Age (Live)
              </h2>
              <p className="text-sm opacity-90">Updating in real-time every second</p>
            </div>
            
            <div className="grid grid-cols-3 gap-3 md:gap-4">
              <div className="bg-white/10 backdrop-blur rounded-xl p-3 md:p-4 text-center">
                <div className="text-2xl md:text-3xl lg:text-4xl font-bold mb-1">
                  {liveAge.years}
                </div>
                <div className="text-xs md:text-sm opacity-90">
                  Years
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-3 md:p-4 text-center">
                <div className="text-2xl md:text-3xl lg:text-4xl font-bold mb-1">
                  {liveAge.months}
                </div>
                <div className="text-xs md:text-sm opacity-90">
                  Months
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-3 md:p-4 text-center">
                <div className="text-2xl md:text-3xl lg:text-4xl font-bold mb-1">
                  {liveAge.days}
                </div>
                <div className="text-xs md:text-sm opacity-90">
                  Days
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-3 md:p-4 text-center">
                <div className="text-2xl md:text-3xl lg:text-4xl font-bold mb-1">
                  {liveAge.hours}
                </div>
                <div className="text-xs md:text-sm opacity-90">
                  Hours
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-3 md:p-4 text-center">
                <div className="text-2xl md:text-3xl lg:text-4xl font-bold mb-1 tabular-nums">
                  {liveAge.minutes}
                </div>
                <div className="text-xs md:text-sm opacity-90">
                  Minutes
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-3 md:p-4 text-center">
                <div className="text-2xl md:text-3xl lg:text-4xl font-bold mb-1 tabular-nums">
                  {liveAge.seconds}
                </div>
                <div className="text-xs md:text-sm opacity-90">
                  Seconds
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Age Display Formats */}
        {result && activeTab === "calculator" && (
          <AgeDisplayFormats result={result} timezone={timezone} />
        )}

        {/* Famous People Born on This Date */}
        {result && birthMonth && birthDay && activeTab === "calculator" && (
          <FamousBirthdayMatches 
            birthMonth={parseInt(birthMonth)} 
            birthDay={parseInt(birthDay)} 
          />
        )}

        {/* Bottom Ad Banner */}
        {result && activeTab === "calculator" && (
          <AdSenseBanner format="horizontal" className="mt-6" />
        )}
        </div>

        {/* Right Sidebar Ads - Hidden on mobile/tablet */}
        <aside className="hidden xl:flex xl:flex-col w-full xl:w-[320px] space-y-6 xl:sticky xl:top-20 xl:self-start">
          <AdSenseBanner format="vertical" />
          <AdSenseBanner format="square" />
        </aside>
      </div>
      
      {/* Bottom Page Ad - Always visible */}
      <div className="max-w-7xl mx-auto mt-6">
        <AdSenseBanner format="large-horizontal" />
      </div>
    </main>
  );
};

export default Index;
