import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { differenceInYears, differenceInMonths, differenceInDays, differenceInHours, differenceInMinutes } from "date-fns";
import { Globe, Calendar as CalendarIconComponent, Download, Sparkles, Share2, Rocket, Loader2, ChevronDown, ChevronUp, Star } from "lucide-react";
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
import { BirthdayFacts } from "@/components/BirthdayFacts";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import PageTransition from "@/components/PageTransition";
import ParallaxSection from "@/components/ParallaxSection";
import moonImg from '../assets/planets/moon.jpg';
import mercuryImg from '../assets/planets/mercury.jpg';
import venusImg from '../assets/planets/venus.jpg';
import marsImg from '../assets/planets/mars.jpg';
import jupiterImg from '../assets/planets/jupiter.jpg';
import saturnImg from '../assets/planets/saturn.jpg';
import uranusImg from '../assets/planets/uranus.jpg';
import neptuneImg from '../assets/planets/neptune.jpg';
import plutoImg from '../assets/planets/pluto.jpg';
import ceresImg from '../assets/planets/ceres.jpg';
import erisImg from '../assets/planets/eris.jpg';

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
  const [hasCalculatorResults, setHasCalculatorResults] = useState(false);
  const [timezone, setTimezone] = useState<string>("");
  const [liveAge, setLiveAge] = useState<AgeResult | null>(null);
  const [planetAges, setPlanetAges] = useState<{ name: string; age: number; imageURL: string; group: string }[]>([]);
  const [activeTab, setActiveTab] = useState<string>("calculator");
  const [showMorePlanets, setShowMorePlanets] = useState<boolean>(false);
  
  // AI Greetings state
  const [selectedOccasion, setSelectedOccasion] = useState('');
  const [occasionDay, setOccasionDay] = useState('');
  const [occasionMonth, setOccasionMonth] = useState('');
  const [occasionYear, setOccasionYear] = useState('');
  const [greetingPrompt, setGreetingPrompt] = useState('');
  const [generatedGreeting, setGeneratedGreeting] = useState('');
  const [watermarkedGreeting, setWatermarkedGreeting] = useState('');
  const [isGeneratingGreeting, setIsGeneratingGreeting] = useState(false);

  // On Your Birthday state
  const [birthdayDay, setBirthdayDay] = useState('');
  const [birthdayMonth, setBirthdayMonth] = useState('');
  const [birthdayYear, setBirthdayYear] = useState('');
  const [birthdayInfo, setBirthdayInfo] = useState<any>(null);
  const [isLoadingBirthdayInfo, setIsLoadingBirthdayInfo] = useState(false);

  // Life Milestones state
  const [milestonesDay, setMilestonesDay] = useState('');
  const [milestonesMonth, setMilestonesMonth] = useState('');
  const [milestonesYear, setMilestonesYear] = useState('');
  const [milestones, setMilestones] = useState<any>(null);

  // AI Gift Advisor state
  const [giftRecipient, setGiftRecipient] = useState('');
  const [giftOccasion, setGiftOccasion] = useState('');
  const [giftAge, setGiftAge] = useState('');
  const [giftInterests, setGiftInterests] = useState('');
  const [giftIdeas, setGiftIdeas] = useState<any[]>([]);
  const [isGeneratingGifts, setIsGeneratingGifts] = useState(false);

  // Watermark utility function
  const addWatermarkToImage = (imageUrl: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        // Create canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        // Set canvas size to match image
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw the original image
        ctx.drawImage(img, 0, 0);
        
        // Add watermark text
        const watermarkText = 'aiagecalc.com';
        const fontSize = Math.max(16, Math.floor(img.width / 30)); // Responsive font size
        const padding = fontSize;
        
        ctx.font = `${fontSize}px sans-serif`;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'bottom';
        
        // Draw watermark in bottom-right corner
        ctx.fillText(watermarkText, canvas.width - padding, canvas.height - padding);
        
        // Convert canvas to data URL
        const watermarkedImageUrl = canvas.toDataURL('image/png');
        resolve(watermarkedImageUrl);
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      
      img.src = imageUrl;
    });
  };

  // Share or download function
  const handleShareImage = async () => {
    if (!watermarkedGreeting) {
      toast.error("No image to share");
      return;
    }

    try {
      // Convert data URL to blob
      const response = await fetch(watermarkedGreeting);
      const blob = await response.blob();
      const file = new File([blob], 'greeting-from-aiagecalc.com.png', { type: 'image/png' });

      // Check if Web Share API is supported with files
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        // Use Web Share API (mobile and some desktop browsers)
        await navigator.share({
          files: [file],
          title: 'AI Greeting',
          text: 'Check out this image I created on aiagecalc.com!'
        });
        toast.success("Shared successfully!");
      } else {
        // Fallback: Download the image
        const link = document.createElement('a');
        link.href = watermarkedGreeting;
        link.download = `${selectedOccasion.toLowerCase().replace(/\s+/g, '-')}-greeting-aiagecalc.png`;
        link.click();
        toast.success("Image downloaded successfully!");
      }
    } catch (error) {
      console.error('Error sharing/downloading image:', error);
      // If sharing fails, fallback to download
      const link = document.createElement('a');
      link.href = watermarkedGreeting;
      link.download = `${selectedOccasion.toLowerCase().replace(/\s+/g, '-')}-greeting-aiagecalc.png`;
      link.click();
      toast.success("Image downloaded successfully!");
    }
  };

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

    // Calculate planet ages using single structured data source with local images
    const celestialData = [
      {
        group: "visible",
        name: "The Moon",
        imageURL: moonImg,
        orbitalPeriod: 27.3
      },
      {
        group: "visible",
        name: "Mercury",
        imageURL: mercuryImg,
        orbitalPeriod: 88
      },
      {
        group: "visible",
        name: "Venus",
        imageURL: venusImg,
        orbitalPeriod: 225
      },
      {
        group: "visible",
        name: "Mars",
        imageURL: marsImg,
        orbitalPeriod: 687
      },
      {
        group: "hidden",
        name: "Jupiter",
        imageURL: jupiterImg,
        orbitalPeriod: 4333
      },
      {
        group: "hidden",
        name: "Saturn",
        imageURL: saturnImg,
        orbitalPeriod: 10759
      },
      {
        group: "hidden",
        name: "Uranus",
        imageURL: uranusImg,
        orbitalPeriod: 30687
      },
      {
        group: "hidden",
        name: "Neptune",
        imageURL: neptuneImg,
        orbitalPeriod: 60190
      },
      {
        group: "hidden",
        name: "Pluto",
        imageURL: plutoImg,
        orbitalPeriod: 90560
      },
      {
        group: "hidden",
        name: "Ceres",
        imageURL: ceresImg,
        orbitalPeriod: 1682
      },
      {
        group: "hidden",
        name: "Eris",
        imageURL: erisImg,
        orbitalPeriod: 203830
      }
    ];
    
    const earthDays = totalDays;
    const calculatedPlanetAges = celestialData.map(body => ({
      name: body.name,
      age: Number((earthDays / body.orbitalPeriod).toFixed(2)),
      imageURL: body.imageURL,
      group: body.group,
    }));

    setPlanetAges(calculatedPlanetAges);

    setHasCalculatorResults(true);
    
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
    <PageTransition>
    <main className="min-h-screen bg-background px-3 sm:px-6 md:px-8 py-4 sm:py-8 relative overflow-hidden">
      {/* Parallax Background Layers */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Layer 1 - Slowest moving circles */}
        <ParallaxSection speed={0.1} className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-40 right-20 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        </ParallaxSection>
        
        {/* Layer 2 - Medium speed gradients */}
        <ParallaxSection speed={0.2} className="absolute inset-0">
          <div className="absolute top-40 right-10 w-64 h-64 bg-secondary/10 rounded-full blur-2xl" />
          <div className="absolute bottom-20 left-32 w-80 h-80 bg-primary/8 rounded-full blur-3xl" />
        </ParallaxSection>
        
        {/* Layer 3 - Faster moving small elements */}
        <ParallaxSection speed={0.35} className="absolute inset-0">
          <div className="absolute top-60 left-1/4 w-48 h-48 bg-accent/8 rounded-full blur-2xl" />
          <div className="absolute bottom-60 right-1/4 w-56 h-56 bg-primary/6 rounded-full blur-2xl" />
        </ParallaxSection>
      </div>
      
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
      
      <div className="w-full max-w-[1200px] mx-auto px-0 sm:px-4 box-border relative z-10">
      <div className="max-w-5xl mx-auto flex flex-col xl:flex-row gap-4 xl:gap-6">
        {/* Main Content */}
        <div className="flex-1 w-full max-w-3xl mx-auto xl:mx-0">
        {/* Top Banner Ad */}
        {/* <AdSenseBanner format="large-horizontal" className="mb-6" /> */}
        
        {/* Hero Section with Enhanced Parallax */}
        <div className="relative mb-8">
          {/* Additional decorative parallax elements for hero */}
          <ParallaxSection speed={0.15} className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-10 -left-10 w-32 h-32 border-2 border-primary/20 rounded-full" />
            <div className="absolute -top-5 -right-5 w-24 h-24 border-2 border-accent/20 rounded-full" />
          </ParallaxSection>
          
          <ParallaxSection speed={0.25}>
            <header className="text-center relative z-10">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-4 animate-fade-in">
                Unlock the Secrets of Your Birthday
              </h1>
              <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: '0.1s' }}>
                Find your Zodiac sign, countdown to your next birthday, and even discover your age on Mars—all right here.
              </p>
              
              {/* Famous Birthdays CTA */}
              <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center items-stretch">
                <Link to="/famous-birthdays" className="flex-1 sm:flex-initial">
                  <Button 
                    size="lg" 
                    className="interactive-element gap-2 bg-gradient-to-r from-primary to-primary/80 w-full sm:w-auto whitespace-normal sm:whitespace-nowrap text-center hover-scale"
                  >
                    <Star className="w-5 h-5 flex-shrink-0" />
                    <span className="block sm:inline">Explore Famous Birthdays</span>
                  </Button>
                </Link>
                <Link to="/look-alike-finder" className="flex-1 sm:flex-initial">
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="interactive-element gap-2 border-2 border-primary hover:bg-primary/10 w-full sm:w-auto whitespace-normal sm:whitespace-nowrap text-center hover-scale"
                  >
                    <Sparkles className="w-5 h-5 flex-shrink-0" />
                    <span className="block sm:inline">Find Your Celebrity Twin</span>
                  </Button>
                </Link>
                <Link to="/ai-face-age" className="flex-1 sm:flex-initial">
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="interactive-element gap-2 border-2 border-purple-600 hover:bg-purple-600/10 w-full sm:w-auto whitespace-normal sm:whitespace-nowrap text-center hover-scale"
                  >
                    <Rocket className="w-5 h-5 flex-shrink-0" />
                    <span className="block sm:inline">AI Face Age Calculator</span>
                  </Button>
                </Link>
              </div>
            </header>
          </ParallaxSection>
        </div>

        {/* Timezone Section */}
        {timezone && (
          <div className="text-center mb-4">
            <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <Globe className="w-4 h-4" />
              <span>Timezone: <span className="font-medium">{timezone}</span></span>
            </div>
          </div>
        )}


        {/* Tabbed Calculator Interface */}
        <section 
          className="bg-card rounded-2xl shadow-card p-6 md:p-8 mb-6 hover-lift"
          aria-label="Age calculators"
        >
          <Tabs defaultValue="calculator" value={activeTab} onValueChange={setActiveTab} className="w-full">
            {/* Mobile-Only Dropdown */}
            <div className="mobile-tool-dropdown mb-6 md:hidden">
              <Select value={activeTab} onValueChange={setActiveTab}>
              <SelectTrigger className="h-12 bg-card text-foreground border-2 border-primary/20">
                <SelectValue placeholder="Select a tool" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="calculator">📅 Age Calculator</SelectItem>
                  <SelectItem value="difference">↔️ Age Difference</SelectItem>
                  <SelectItem value="specific">🗓️ Specific Date</SelectItem>
                  <SelectItem value="greetings">🎁 AI Greetings</SelectItem>
                  <SelectItem value="birthday">🎂 On Your Birthday</SelectItem>
                  <SelectItem value="milestones">🚩 Life Milestones</SelectItem>
                  <SelectItem value="gift-advisor">💡 AI Gift Advisor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Desktop Sidebar Layout */}
            <div className="tool-app-layout">
              {/* Sidebar */}
              <div id="tool-sidebar">
                <nav className="space-y-1">
                  <button
                    onClick={() => setActiveTab("calculator")}
                    className={cn(
                      "tool-sidebar-link w-full transition-all duration-200 hover:scale-105",
                      activeTab === "calculator" && "active"
                    )}
                  >
                    <span className="tool-icon">📅</span>
                    <span className="tool-label">Age Calculator</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("difference")}
                    className={cn(
                      "tool-sidebar-link w-full transition-all duration-200 hover:scale-105",
                      activeTab === "difference" && "active"
                    )}
                  >
                    <span className="tool-icon">↔️</span>
                    <span className="tool-label">Age Difference</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("specific")}
                    className={cn(
                      "tool-sidebar-link w-full transition-all duration-200 hover:scale-105",
                      activeTab === "specific" && "active"
                    )}
                  >
                    <span className="tool-icon">🗓️</span>
                    <span className="tool-label">Specific Date</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("greetings")}
                    className={cn(
                      "tool-sidebar-link w-full transition-all duration-200 hover:scale-105",
                      activeTab === "greetings" && "active"
                    )}
                  >
                    <span className="tool-icon">🎁</span>
                    <span className="tool-label">AI Greetings</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("birthday")}
                    className={cn(
                      "tool-sidebar-link w-full transition-all duration-200 hover:scale-105",
                      activeTab === "birthday" && "active"
                    )}
                  >
                    <span className="tool-icon">🎂</span>
                    <span className="tool-label">On Your Birthday</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("milestones")}
                    className={cn(
                      "tool-sidebar-link w-full transition-all duration-200 hover:scale-105",
                      activeTab === "milestones" && "active"
                    )}
                  >
                    <span className="tool-icon">🚩</span>
                    <span className="tool-label">Life Milestones</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("gift-advisor")}
                    className={cn(
                      "tool-sidebar-link w-full transition-all duration-200 hover:scale-105",
                      activeTab === "gift-advisor" && "active"
                    )}
                  >
                    <span className="tool-icon">💡</span>
                    <span className="tool-label">AI Gift Advisor</span>
                  </button>
                  
                  {/* Separator */}
                  <div className="border-t border-border my-2"></div>
                  
                  {/* External Tool Links */}
                  <Link
                    to="/look-alike-finder"
                    className="tool-sidebar-link w-full"
                  >
                    <span className="tool-icon">👯</span>
                    <span className="tool-label">Look-Alike Finder</span>
                  </Link>
                  <Link
                    to="/ai-face-age"
                    className="tool-sidebar-link w-full"
                  >
                    <span className="tool-icon">🤖</span>
                    <span className="tool-label">AI Face Age</span>
                  </Link>
                  <Link
                    to="/compatibility-calculator"
                    className="tool-sidebar-link w-full"
                  >
                    <span className="tool-icon">💖</span>
                    <span className="tool-label">Compatibility</span>
                  </Link>
                  <Link
                    to="/past-life-generator"
                    className="tool-sidebar-link w-full"
                  >
                    <span className="tool-icon">🌀</span>
                    <span className="tool-label">Past Life</span>
                  </Link>
                </nav>
              </div>

              {/* Content Area */}
              <div id="tool-content-area">

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
            <div className="mt-8 mb-[50px] p-6 pb-10 bg-accent/30 rounded-xl border border-border animate-fade-in">
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
            </TabsContent>

            {/* Age Difference Calculator Tab */}
            <TabsContent value="difference" className="animate-fade-in">
              <AgeDifferenceCalculator />
              
              {/* SEO Content for Age Difference */}
              <article className="mt-20 p-8 bg-accent/20 rounded-xl border border-border">
                <h2 className="text-3xl font-bold text-foreground mb-6">
                  Understanding Age Gaps: More Than Just Numbers
                </h2>
                
                <div className="space-y-6 text-muted-foreground leading-relaxed">
                  <p>
                    Age differences between people create fascinating dynamics in relationships, workplaces, and families. While the gap might seem like simple mathematics, the implications and social perceptions around age differences have evolved throughout history and vary dramatically across cultures. Understanding these gaps helps us appreciate the diverse perspectives and experiences that different generations bring to our lives.
                  </p>

                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-3">Common Uses for Age Difference Calculators</h3>
                    <p>
                      People calculate age differences for numerous practical and personal reasons. Parents often track the age gap between siblings to understand developmental stages and plan family activities. In romantic relationships, couples may be curious about their age difference, especially in an era where traditional norms are being questioned. Employers use age gap information to manage multi-generational workplaces effectively, ensuring that team members from Baby Boomers to Gen Z can collaborate productively. Genealogy enthusiasts calculate age differences to verify family histories and understand ancestor relationships. Even fans of celebrities frequently compare ages of their favorite stars, adding context to career achievements and personal milestones. Whether for practical planning, historical research, or simple curiosity, age difference calculators serve as valuable tools in our daily lives.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-3">The Psychology of Age Gaps in Relationships</h3>
                    <p>
                      Age gaps in romantic relationships have been studied extensively by psychologists and sociologists. Research suggests that small age differences (1-3 years) are most common and typically involve fewer challenges. Larger gaps can bring both benefits and challenges. Partners with significant age differences often bring complementary life experiences, with one partner offering youthful energy and fresh perspectives while the other contributes wisdom and stability. However, these relationships may face unique hurdles, including different life stages, varying cultural references, and potential social judgment. Interestingly, studies show that relationship satisfaction depends less on the age gap itself and more on shared values, communication quality, and emotional maturity. What matters most isn't the numbers but the genuine connection between partners.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-3">Famous Age Gaps in History</h3>
                    <p>
                      Throughout history, significant age gaps have characterized many notable relationships and partnerships. Benjamin Franklin was 70 when he helped draft the Declaration of Independence alongside the 33-year-old Thomas Jefferson—a 37-year gap that bridged revolutionary ideas across generations. In the arts, Pablo Picasso was 45 years older than his final partner Jacqueline Roque, yet their relationship lasted 20 years until his death. The business world has seen transformative partnerships with substantial age differences, such as Warren Buffett mentoring younger investors decades his junior. Even in politics, age differences between leaders and their deputies often reflect strategic balancing of experience with fresh perspectives. These historical examples remind us that meaningful connections and productive collaborations transcend age, with each generation offering unique contributions to shared endeavors.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-3">Making Sense of the Numbers</h3>
                    <p>
                      When you calculate an age difference, you're not just computing years—you're exploring the gap between different eras of experience, technology, and cultural shifts. Someone born in 1970 grew up in a vastly different world than someone born in 2000, with contrasting technological landscapes, social norms, and global events shaping their worldviews. These differences can enrich relationships through diverse perspectives or create communication challenges that require understanding and patience. Our age difference calculator helps you quantify these gaps precisely, providing context for the generational bridges we build every day in families, friendships, and communities. Understanding the exact difference in years, months, and days can foster empathy and appreciation for the unique journeys each person has traveled.
                    </p>
                  </div>
                </div>
              </article>
            </TabsContent>

            {/* Specific Date Calculator Tab */}
            <TabsContent value="specific" className="animate-fade-in">
              <AgeAtDateCalculator />
              
              {/* SEO Content for Specific Date */}
              <div className="mt-20 p-6 bg-accent/20 rounded-xl border border-border hover-lift">
                <h2 className="text-2xl font-bold text-foreground mb-3">
                  Travel Through Time and Space
                </h2>
                <p className="text-foreground leading-relaxed">
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
                    setWatermarkedGreeting('');

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
                      
                      // Automatically apply watermark
                      try {
                        const watermarked = await addWatermarkToImage(data.imageUrl);
                        setWatermarkedGreeting(watermarked);
                        toast.success("Your greeting image has been generated!");
                      } catch (watermarkError) {
                        console.error('Error adding watermark:', watermarkError);
                        // If watermarking fails, still show the original image
                        setWatermarkedGreeting(data.imageUrl);
                        toast.success("Your greeting image has been generated!");
                      }
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

                {watermarkedGreeting && !isGeneratingGreeting && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="relative rounded-lg overflow-hidden border-2 border-primary/20 bg-muted">
                      <img
                        src={watermarkedGreeting}
                        alt="Generated greeting with watermark"
                        className="w-full h-auto"
                      />
                    </div>
                    <Button
                      onClick={handleShareImage}
                      className="w-full h-12 text-lg"
                    >
                      <Share2 className="mr-2 h-5 w-5" />
                      Share Image
                    </Button>
                  </div>
                )}
              </div>
              
              {/* SEO Content for AI Greetings */}
              <div className="mt-20 p-6 bg-accent/20 rounded-xl border border-border hover-lift">
                <h2 className="text-2xl font-bold text-foreground mb-3">
                  Create Unique AI-Powered Greeting Images
                </h2>
                <p className="text-foreground leading-relaxed">
                  Say goodbye to generic wishes! With our <strong>AI Greetings Image Generator</strong>, you can create beautiful, custom images for any occasion. Generate personalized <strong>birthday wishes</strong>, romantic wedding anniversary cards, Eid Mubarak greetings, or festive Christmas images. Just choose an occasion, describe your idea, and let our AI bring your vision to life.
                </p>
              </div>
            </TabsContent>

            {/* On Your Birthday Tab */}
            <TabsContent value="birthday" className="animate-fade-in">
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-primary mb-2">Discover Your Birthday</h2>
                  <p className="text-muted-foreground">
                    Find out what was happening in the world on the day you were born
                  </p>
                </div>

                {/* Date Input */}
                <div className="space-y-2">
                  <Label htmlFor="birthday-date" className="text-lg font-semibold">
                    Enter Your Birth Date
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Select value={birthdayDay} onValueChange={setBirthdayDay}>
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
                    <Select value={birthdayMonth} onValueChange={setBirthdayMonth}>
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
                    <Select value={birthdayYear} onValueChange={setBirthdayYear}>
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

                {/* Discover Button */}
                <Button
                  onClick={async () => {
                    if (!birthdayDay || !birthdayMonth || !birthdayYear) {
                      toast.error("Please select your complete birth date");
                      return;
                    }
                    
                    setIsLoadingBirthdayInfo(true);
                    setBirthdayInfo(null);
                    
                    const birthDate = `${birthdayYear}-${birthdayMonth.padStart(2, '0')}-${birthdayDay.padStart(2, '0')}`;
                    
                    try {
                      const { data, error } = await supabase.functions.invoke('birthday-facts', {
                        body: { birthDate }
                      });

                      if (error) {
                        console.error('Error fetching birthday facts:', error);
                        toast.error(error.message || 'Failed to load birthday facts');
                      } else if (data?.error) {
                        toast.error(data.error);
                      } else {
                        setBirthdayInfo(data);
                        toast.success("Birthday information loaded!");
                      }
                    } catch (error: any) {
                      console.error('Error:', error);
                      toast.error('Failed to load birthday facts');
                    } finally {
                      setIsLoadingBirthdayInfo(false);
                    }
                  }}
                  disabled={isLoadingBirthdayInfo}
                  className="w-full h-12 text-lg"
                >
                  {isLoadingBirthdayInfo ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Discovering...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      Discover Your Birthday
                    </>
                  )}
                </Button>

                {/* Results Display */}
                <BirthdayFacts
                  facts={birthdayInfo}
                  loading={isLoadingBirthdayInfo}
                />
              </div>

              {/* SEO Content */}
              <div className="mt-20 p-6 bg-accent/20 rounded-xl border border-border hover-lift">
                <h2 className="text-2xl font-bold text-foreground mb-3">
                  Explore Your Birthday History
                </h2>
                <p className="text-foreground leading-relaxed">
                  Discover fascinating facts about the day you were born! Find out what was the <strong>#1 song</strong>, top movie, famous people who share your birthday, and <strong>historical events</strong> that happened on your special day. It's a fun way to connect with history and see what made your birthday unique.
                </p>
              </div>
            </TabsContent>

            {/* Life Milestones Tab */}
            <TabsContent value="milestones" className="animate-fade-in">
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-primary mb-2">Life Milestones Calculator</h2>
                  <p className="text-muted-foreground">
                    Discover fascinating milestones in your life journey
                  </p>
                </div>

                {/* Date Input */}
                <div className="space-y-2">
                  <Label htmlFor="milestones-date" className="text-lg font-semibold">
                    Enter Your Birth Date
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Select value={milestonesDay} onValueChange={setMilestonesDay}>
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
                    <Select value={milestonesMonth} onValueChange={setMilestonesMonth}>
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
                    <Select value={milestonesYear} onValueChange={setMilestonesYear}>
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

                {/* Calculate Button */}
                <Button
                  onClick={() => {
                    if (!milestonesDay || !milestonesMonth || !milestonesYear) {
                      toast.error("Please select your complete birth date");
                      return;
                    }

                    const birthDate = new Date(parseInt(milestonesYear), parseInt(milestonesMonth) - 1, parseInt(milestonesDay));
                    const now = new Date();
                    const ageInDays = differenceInDays(now, birthDate);
                    const ageInSeconds = ageInDays * 24 * 60 * 60;
                    
                    // Calculate 10,000th day
                    const tenThousandthDay = new Date(birthDate);
                    tenThousandthDay.setDate(tenThousandthDay.getDate() + 10000);
                    
                    // Calculate billionth second
                    const billionthSecond = new Date(birthDate.getTime() + (1000000000 * 1000));
                    
                    // Calculate heartbeats (75 bpm average)
                    const totalHeartbeats = Math.floor(ageInSeconds * 75 / 60);
                    
                    // Calculate moon trips (238,855 miles to moon, 3 miles per day walking)
                    const totalMilesWalked = ageInDays * 3;
                    const moonTrips = (totalMilesWalked / 238855).toFixed(2);

                    setMilestones({
                      tenThousandthDay: tenThousandthDay.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
                      billionthSecond: billionthSecond.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
                      heartbeats: totalHeartbeats.toLocaleString(),
                      moonTrips: moonTrips
                    });

                    toast.success("Milestones calculated!");
                  }}
                  className="w-full h-12 text-lg"
                >
                  <Rocket className="mr-2 h-5 w-5" />
                  Calculate Milestones
                </Button>

                {/* Results Display */}
                {milestones && (
                  <div className="grid gap-4 animate-fade-in">
                    <div className="p-6 bg-primary/10 rounded-xl border border-primary/20">
                      <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
                        🎉 Your 10,000th Day
                      </h3>
                      <p className="text-muted-foreground">
                        You celebrated (or will celebrate) your 10,000th day on Earth on <strong>{milestones.tenThousandthDay}</strong>
                      </p>
                    </div>

                    <div className="p-6 bg-accent/20 rounded-xl border border-border">
                      <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
                        ⏰ Your One Billionth Second
                      </h3>
                      <p className="text-muted-foreground">
                        You turned (or will turn) one billion seconds old on <strong>{milestones.billionthSecond}</strong>
                      </p>
                    </div>

                    <div className="p-6 bg-primary/10 rounded-xl border border-primary/20">
                      <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
                        💓 Total Heartbeats
                      </h3>
                      <p className="text-muted-foreground">
                        Your heart has beaten approximately <strong>{milestones.heartbeats}</strong> times so far!
                      </p>
                    </div>

                    <div className="p-6 bg-accent/20 rounded-xl border border-border">
                      <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
                        🚶 Trip to the Moon
                      </h3>
                      <p className="text-muted-foreground">
                        Based on average walking distance, you have traveled enough to walk to the Moon <strong>{milestones.moonTrips}</strong> times!
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* SEO Content */}
              <article className="mt-20 p-8 bg-accent/20 rounded-xl border border-border">
                <h2 className="text-3xl font-bold text-foreground mb-6">
                  Celebrating Your Life's Hidden Milestones
                </h2>
                
                <div className="space-y-6 text-muted-foreground leading-relaxed">
                  <p>
                    Beyond the traditional milestone birthdays—16, 18, 21, 30, 50—lie countless hidden markers that make life's journey extraordinary. These overlooked milestones, measured in days, seconds, heartbeats, and metaphorical distances, offer fresh perspectives on the time we've been given and create unique opportunities for celebration and reflection.
                  </p>

                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-3">The Magic of Your 10,000th Day</h3>
                    <p>
                      Your 10,000th day on Earth represents approximately 27 years and 5 months of life—a milestone often overlooked yet deeply meaningful. This day marks nearly three decades of experiences, relationships, and personal growth. In many cultures, round numbers hold special significance, and 10,000 is particularly revered in Asian traditions as a symbol of completeness and abundance. Celebrating this day acknowledges that you've accumulated 240,000 hours of memories, learned countless lessons, and weathered many seasons of change. Unlike age-based milestones that everyone celebrates at different points in their life, your 10,000th day is uniquely yours, a personal marker that invites reflection on your journey so far. Whether you've already passed this milestone or have it ahead, calculating and marking this day can become a meaningful personal tradition.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-3">Your One Billion Second Celebration</h3>
                    <p>
                      Reaching one billion seconds alive is a milestone worth throwing a party for—it occurs at approximately 31 years and 8 months of age. This remarkable marker puts your life into a cosmic perspective, reminding you that you've existed for one billion individual moments, each one a tiny building block in the cathedral of your existence. Time measured in seconds feels immediate and precious, making this milestone particularly poignant. Consider that a billion of anything is difficult to visualize—if you counted one number per second, it would take over 31 years to count to a billion. Yet you've lived every single one of those seconds, experiencing joys, sorrows, mundane routines, and extraordinary surprises. Celebrating your billionth second acknowledges not just the passage of time but your persistence, resilience, and the beautiful accumulation of moments that comprise a life well-lived.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-3">Other Unique Milestones Worth Tracking</h3>
                    <p>
                      Beyond days and seconds, numerous other milestones offer fascinating perspectives on your life. Your heart has been beating constantly since before you were born, and calculating your total heartbeats—approximately 75 beats per minute—reveals millions or even billions of faithful rhythms that have sustained your life. If you've been walking an average of three miles per day, you might discover you've traveled far enough to have walked to the Moon and back! Other milestones include your 1,000th full moon, which occurs around age 83, or your 500th month birthday at roughly 41 years old. Some people celebrate their "golden birthday" when they turn the same age as their birth date (turning 24 on the 24th), while others mark their "half-birthday" six months from their actual birthday. These creative milestones transform ordinary days into special occasions and remind us that every moment of life deserves recognition.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-3">Why These Milestones Matter</h3>
                    <p>
                      Celebrating unconventional milestones serves a deeper purpose than mere novelty—it cultivates gratitude and mindfulness about our finite time on Earth. Traditional milestone birthdays come infrequently and can sometimes feel burdened by societal expectations and age-related anxieties. In contrast, milestones like your 5,000th day or 100-millionth second are personal, unexpected, and joyful. They encourage us to pay attention to time's passage in new ways, making each day feel more significant. By marking these hidden milestones, we create more opportunities for celebration, reflection, and appreciation of our journey. They remind us that life isn't just about the big moments—it's about the accumulated seconds, heartbeats, and steps that weave together into the tapestry of our unique existence.
                    </p>
                  </div>
                </div>
              </article>
            </TabsContent>

            {/* AI Gift Advisor Tab */}
            <TabsContent value="gift-advisor" className="animate-fade-in">
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-primary mb-2">AI Gift Advisor</h2>
                  <p className="text-muted-foreground">
                    Get personalized gift recommendations powered by AI
                  </p>
                </div>

                {/* Form Inputs */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="gift-recipient" className="text-lg font-semibold">
                      Who is the gift for?
                    </Label>
                    <Select value={giftRecipient} onValueChange={setGiftRecipient}>
                      <SelectTrigger className="h-12 bg-muted">
                        <SelectValue placeholder="Select recipient" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="friend">Friend</SelectItem>
                        <SelectItem value="partner">Partner</SelectItem>
                        <SelectItem value="father">Father</SelectItem>
                        <SelectItem value="mother">Mother</SelectItem>
                        <SelectItem value="sibling">Sibling</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gift-occasion" className="text-lg font-semibold">
                      What is the occasion?
                    </Label>
                    <Select value={giftOccasion} onValueChange={setGiftOccasion}>
                      <SelectTrigger className="h-12 bg-muted">
                        <SelectValue placeholder="Select occasion" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="birthday">Birthday</SelectItem>
                        <SelectItem value="anniversary">Anniversary</SelectItem>
                        <SelectItem value="valentines">Valentine's Day</SelectItem>
                        <SelectItem value="christmas">Christmas</SelectItem>
                        <SelectItem value="graduation">Graduation</SelectItem>
                        <SelectItem value="thankyou">Thank You</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gift-age" className="text-lg font-semibold">
                      What is their age?
                    </Label>
                    <Input
                      id="gift-age"
                      type="number"
                      value={giftAge}
                      onChange={(e) => setGiftAge(e.target.value)}
                      placeholder="e.g., 30"
                      className="h-12 bg-muted"
                      min="1"
                      max="120"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gift-interests" className="text-lg font-semibold">
                      What are their interests?
                    </Label>
                    <Textarea
                      id="gift-interests"
                      value={giftInterests}
                      onChange={(e) => setGiftInterests(e.target.value)}
                      placeholder="e.g., technology, reading, gardening, cooking"
                      className="min-h-[100px] bg-muted resize-y"
                    />
                  </div>
                </div>

                {/* Generate Button */}
                <Button
                  onClick={async () => {
                    if (!giftRecipient || !giftOccasion || !giftAge || !giftInterests) {
                      toast.error("Please fill in all fields");
                      return;
                    }

                    setIsGeneratingGifts(true);
                    setGiftIdeas([]);

                    try {
                      const { data, error } = await supabase.functions.invoke('ai-gift-advisor', {
                        body: {
                          recipient: giftRecipient,
                          occasion: giftOccasion,
                          age: giftAge,
                          interests: giftInterests
                        }
                      });

                      if (error) {
                        throw error;
                      }

                      if (data?.error) {
                        toast.error(data.error);
                        return;
                      }

                      if (data && data.giftIdeas) {
                        setGiftIdeas(data.giftIdeas);
                        toast.success("Gift ideas generated successfully!");
                      } else {
                        throw new Error("No gift ideas returned");
                      }
                    } catch (error: any) {
                      console.error('Error generating gift ideas:', error);
                      const errorMessage = error?.message || "Failed to generate gift ideas. Please try again.";
                      toast.error(errorMessage);
                    } finally {
                      setIsGeneratingGifts(false);
                    }
                  }}
                  disabled={isGeneratingGifts}
                  className="w-full h-12 text-lg"
                >
                  {isGeneratingGifts ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Generating Ideas...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      Get Gift Ideas
                    </>
                  )}
                </Button>

                {/* Results Display */}
                {giftIdeas.length > 0 && (
                  <div className="space-y-4 animate-fade-in">
                    <h3 className="text-xl font-semibold text-center mb-4">
                      Your Personalized Gift Ideas
                    </h3>
                    {giftIdeas.map((idea, index) => (
                      <div key={index} className="p-6 bg-primary/10 rounded-xl border border-primary/20">
                        <h4 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
                          🎁 {idea.name}
                        </h4>
                        <p className="text-muted-foreground">
                          {idea.description}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* SEO Content */}
              <div className="mt-20 p-6 bg-accent/20 rounded-xl border border-border hover-lift">
                <h2 className="text-2xl font-bold text-foreground mb-3">
                  AI-Powered Gift Recommendations
                </h2>
                <p className="text-foreground leading-relaxed">
                  Struggling to find the perfect gift? Let our <strong>AI Gift Advisor</strong> help! Simply provide details about the recipient, occasion, and their interests, and get <strong>personalized gift recommendations</strong> tailored to their unique personality. From birthdays to anniversaries, find thoughtful and creative gift ideas in seconds.
                </p>
              </div>
            </TabsContent>
              </div> {/* Close #tool-content-area */}
            </div> {/* Close .tool-app-layout */}
          </Tabs>
        </section>

        {/* Traditional Age Section */}
        {result && activeTab === "calculator" && (
          <section 
            className="bg-card rounded-2xl shadow-card p-6 md:p-8 mb-6 animate-fade-in hover-lift"
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

        {/* Planet Ages Section - Dynamic Rendering */}
        {planetAges.length > 0 && activeTab === "calculator" && (
          <section className="bg-card rounded-2xl shadow-card p-6 md:p-8 mb-6 animate-fade-in hover-lift">
            <div className="flex items-center gap-2 mb-4">
              <Rocket className="w-5 h-5 text-primary" />
              <h3 className="text-xl font-semibold text-foreground">My Age in the Universe</h3>
            </div>
            
            {/* Initially Visible Bodies - 2x2 Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {planetAges.filter(p => p.group === "visible").map((planet, index) => (
                <div 
                  key={planet.name}
                  className="group relative rounded-2xl overflow-hidden transition-all duration-500 hover:scale-105 animate-fade-in" 
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-background via-card to-accent/30" />
                  <div className="absolute inset-0 bg-black/20" />
                  <div className="relative flex flex-col items-center justify-center space-y-6 p-8 md:p-10">
                    <h4 className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg text-center z-10">
                      {planet.name}
                    </h4>
                    <div className="relative w-44 h-44 md:w-48 md:h-48">
                      <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl animate-pulse" />
                      <div className="relative w-full h-full rounded-full overflow-hidden shadow-2xl border-2 border-primary/30">
                        <div className="absolute inset-0 w-full h-full animate-planet-rotate">
                          <img
                            src={planet.imageURL}
                            alt={`Image of ${planet.name}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-center space-y-1 z-10">
                      <div className="text-5xl md:text-6xl font-bold text-white drop-shadow-lg">
                        {planet.age}
                      </div>
                      <div className="text-lg md:text-xl text-white/90 drop-shadow">
                        years old here!
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Toggle Button for Hidden Bodies */}
            <div className="flex justify-center mb-6">
              <button
                onClick={() => setShowMorePlanets(!showMorePlanets)}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 flex items-center gap-2 font-medium"
              >
                {showMorePlanets ? (
                  <>
                    <ChevronUp className="w-5 h-5" />
                    Hide Other Celestial Bodies
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-5 h-5" />
                    See More Celestial Bodies
                  </>
                )}
              </button>
            </div>

            {/* Hidden Celestial Bodies - Grid */}
            {showMorePlanets && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                {planetAges.filter(p => p.group === "hidden").map((planet, index) => (
                  <div 
                    key={planet.name}
                    className="group relative rounded-2xl overflow-hidden transition-all duration-500 hover:scale-105 animate-fade-in" 
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-background via-card to-accent/30" />
                    <div className="absolute inset-0 bg-black/20" />
                    <div className="relative flex flex-col items-center justify-center space-y-6 p-8 md:p-10">
                      <h4 className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg text-center z-10">
                        {planet.name}
                      </h4>
                      <div className="relative w-44 h-44 md:w-48 md:h-48">
                        <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl animate-pulse" />
                        <div className="relative w-full h-full rounded-full overflow-hidden shadow-2xl border-2 border-primary/30">
                          <div className="absolute inset-0 w-full h-full animate-planet-rotate">
                            <img
                              src={planet.imageURL}
                              alt={`Image of ${planet.name}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-center space-y-1 z-10">
                        <div className="text-5xl md:text-6xl font-bold text-white drop-shadow-lg">
                          {planet.age}
                        </div>
                        <div className="text-lg md:text-xl text-white/90 drop-shadow">
                          years old here!
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}


        {/* Ad Banner */}
        {/* {result && activeTab === "calculator" && (
          <AdSenseBanner format="large-horizontal" className="mb-6" />
        )} */}

        {/* Live Age Display */}
        {liveAge && activeTab === "calculator" && (
          <section 
            className="bg-gradient-primary rounded-2xl shadow-card p-6 md:p-8 mb-6 text-primary-foreground hover-glow"
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


        {/* Bottom Ad Banner */}
        {/* {result && activeTab === "calculator" && (
          <AdSenseBanner format="horizontal" className="mt-6" />
        )} */}
        </div>

        {/* Right Sidebar Ads - Hidden on mobile/tablet */}
        {/* <aside className="hidden xl:flex xl:flex-col w-full xl:w-[320px] space-y-6 xl:sticky xl:top-20 xl:self-start">
          <AdSenseBanner format="vertical" />
          <AdSenseBanner format="square" />
        </aside> */}
      </div>
      
      {/* SEO Content for Age Calculator - Hidden after results */}
      {!hasCalculatorResults && (
        <article className="max-w-7xl mx-auto mt-20 p-8 bg-accent/20 rounded-xl border border-border hover-lift">
        <h2 className="text-3xl font-bold text-foreground mb-6">
          The Complete Guide to Understanding Your Age
        </h2>
        
        <div className="space-y-6 text-foreground leading-relaxed">
          <p>
            Age is more than just a number—it's a fascinating journey through time that tells the story of your existence. While most people know their age in years, our comprehensive age calculator reveals the incredible details of your life's timeline in ways you've never imagined.
          </p>

          <div>
            <h3 className="text-xl font-semibold text-foreground mb-3">The History of Age Calculation</h3>
            <p>
              Humans have been tracking age for thousands of years, though the methods have evolved dramatically. Ancient civilizations like the Egyptians and Babylonians developed some of the earliest calendar systems to mark the passage of time. The concept of celebrating birthdays, however, is relatively modern. For centuries, only royalty and the wealthy celebrated birth anniversaries, while common people often didn't know their exact birth date. Today, with precise timekeeping and calendar systems, we can calculate age down to the exact second, revealing fascinating patterns in our life journey.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-foreground mb-3">Why Days and Seconds Matter</h3>
            <p>
              Knowing your age in days and seconds isn't just a novelty—it offers a fresh perspective on your life. When you discover you've lived over 10,000 days or that you're approaching your one-billionth second, these milestones become meaningful markers worth celebrating. This granular view of time helps us appreciate each moment more deeply. Parents often track their baby's age in days during the first year, and this precision continues to be meaningful throughout life. Whether you're counting down to a special event or reflecting on how many hours you've experienced, these smaller units of time make the abstract concept of age tangible and real.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-foreground mb-3">Your Age and Zodiac Connection</h3>
            <p>
              Your birth date determines not only your chronological age but also your zodiac sign, which has fascinated humanity for millennia. The zodiac system divides the year into twelve astrological signs, each associated with specific personality traits and characteristics. From Aries' bold leadership to Pisces' creative sensitivity, your zodiac sign adds another dimension to understanding who you are. While astrology may not be scientifically proven, millions find meaning in exploring how their sign's traits align with their personality. Our age calculator automatically reveals your zodiac sign, connecting your precise age with this ancient system of celestial influence.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-foreground mb-3">Celebrating Every Moment</h3>
            <p>
              Beyond traditional birthday celebrations, knowing your exact age in various formats opens up new opportunities for marking life's passage. You can celebrate your 5,000th day on Earth, your 500-millionth second, or even your half-birthday. These unique milestones create special moments to pause and reflect on your journey. Understanding your age in hours and minutes also puts life's brevity into perspective, encouraging us to make each moment count. Whether you're planning a special celebration, satisfying curiosity, or simply gaining a new appreciation for the time you've been given, our age calculator transforms simple arithmetic into a meaningful exploration of your personal timeline.
            </p>
          </div>
        </div>
      </article>
      )}
      </div>
      
      {/* Bottom Page Ad - Always visible */}
      {/* <div className="max-w-7xl mx-auto mt-6 mb-8">
        <AdSenseBanner format="large-horizontal" />
      </div> */}
    </main>
    </PageTransition>
  );
};

export default Index;
