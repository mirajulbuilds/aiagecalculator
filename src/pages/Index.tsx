import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { differenceInYears, differenceInMonths, differenceInDays, differenceInHours, differenceInMinutes } from "date-fns";
import { Globe, Calendar as CalendarIconComponent, Download, Sparkles, Share2, Rocket, Loader2 } from "lucide-react";
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

    // Calculate planet ages using single structured data source
    const celestialData = [
      {
        group: "visible",
        name: "The Moon",
        imageURL: "https://solarsystem.nasa.gov/system/resources/detail_files/1628_PIA00405.jpg",
        orbitalPeriod: 27.3
      },
      {
        group: "visible",
        name: "Mercury",
        imageURL: "https://solarsystem.nasa.gov/system/resources/detail_files/771_PIA16853.jpg",
        orbitalPeriod: 88
      },
      {
        group: "visible",
        name: "Venus",
        imageURL: "https://solarsystem.nasa.gov/system/resources/detail_files/793_PIA00271.jpg",
        orbitalPeriod: 225
      },
      {
        group: "visible",
        name: "Mars",
        imageURL: "https://solarsystem.nasa.gov/system/resources/detail_files/683_mars-globe-valles-marineris-enhanced-full2.jpg",
        orbitalPeriod: 687
      },
      {
        group: "hidden",
        name: "Jupiter",
        imageURL: "https://solarsystem.nasa.gov/system/resources/detail_files/803_PIA21776.jpg",
        orbitalPeriod: 4333
      },
      {
        group: "hidden",
        name: "Saturn",
        imageURL: "https://solarsystem.nasa.gov/system/stellar_items/image_files/38_saturn_1600x900.jpg",
        orbitalPeriod: 10759
      },
      {
        group: "hidden",
        name: "Uranus",
        imageURL: "https://solarsystem.nasa.gov/system/resources/detail_files/599_PIA18182.jpg",
        orbitalPeriod: 30687
      },
      {
        group: "hidden",
        name: "Neptune",
        imageURL: "https://solarsystem.nasa.gov/system/resources/detail_files/612_PIA01492.jpg",
        orbitalPeriod: 60190
      },
      {
        group: "hidden",
        name: "Pluto",
        imageURL: "https://solarsystem.nasa.gov/system/resources/detail_files/933_pluto_natural_color_20150713.jpg",
        orbitalPeriod: 90560
      },
      {
        group: "hidden",
        name: "Ceres",
        imageURL: "https://solarsystem.nasa.gov/system/resources/detail_files/2493_Ceres_-_Main_Belt_Grand_Tour.jpg",
        orbitalPeriod: 1682
      },
      {
        group: "hidden",
        name: "Eris",
        imageURL: "https://solarsystem.nasa.gov/system/resources/detail_files/2500_PIA20473_Eris_and_Dysnomia.jpg",
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


        {/* Tabbed Calculator Interface */}
        <section 
          className="bg-card rounded-2xl shadow-card p-6 md:p-8 mb-6"
          aria-label="Age calculators"
        >
          <Tabs defaultValue="calculator" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="mb-6">
              <TabsList className="w-full h-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-1">
                <TabsTrigger 
                  value="calculator" 
                  className="bg-gradient-to-r from-muted via-muted/60 to-muted bg-[length:200%_auto] bg-[position:0%_center] hover:bg-[position:100%_center] data-[state=active]:from-primary data-[state=active]:via-primary/80 data-[state=active]:to-primary data-[state=active]:text-primary-foreground transition-all duration-500 w-full justify-center py-3 md:py-2 text-sm"
                >
                  Age Calculator
                </TabsTrigger>
                <TabsTrigger 
                  value="difference"
                  className="bg-gradient-to-r from-muted via-muted/60 to-muted bg-[length:200%_auto] bg-[position:0%_center] hover:bg-[position:100%_center] data-[state=active]:from-primary data-[state=active]:via-primary/80 data-[state=active]:to-primary data-[state=active]:text-primary-foreground transition-all duration-500 w-full justify-center py-3 md:py-2 text-sm"
                >
                  Age Difference
                </TabsTrigger>
                <TabsTrigger 
                  value="specific"
                  className="bg-gradient-to-r from-muted via-muted/60 to-muted bg-[length:200%_auto] bg-[position:0%_center] hover:bg-[position:100%_center] data-[state=active]:from-primary data-[state=active]:via-primary/80 data-[state=active]:to-primary data-[state=active]:text-primary-foreground transition-all duration-500 w-full justify-center py-3 md:py-2 text-sm"
                >
                  Specific Date
                </TabsTrigger>
                <TabsTrigger 
                  value="greetings"
                  className="bg-gradient-to-r from-muted via-muted/60 to-muted bg-[length:200%_auto] bg-[position:0%_center] hover:bg-[position:100%_center] data-[state=active]:from-primary data-[state=active]:via-primary/80 data-[state=active]:to-primary data-[state=active]:text-primary-foreground transition-all duration-500 w-full justify-center py-3 md:py-2 text-sm"
                >
                  AI Greetings
                </TabsTrigger>
                <TabsTrigger 
                  value="birthday"
                  className="bg-gradient-to-r from-muted via-muted/60 to-muted bg-[length:200%_auto] bg-[position:0%_center] hover:bg-[position:100%_center] data-[state=active]:from-primary data-[state=active]:via-primary/80 data-[state=active]:to-primary data-[state=active]:text-primary-foreground transition-all duration-500 w-full justify-center py-3 md:py-2 text-sm"
                >
                  On Your Birthday
                </TabsTrigger>
                <TabsTrigger 
                  value="milestones"
                  className="bg-gradient-to-r from-muted via-muted/60 to-muted bg-[length:200%_auto] bg-[position:0%_center] hover:bg-[position:100%_center] data-[state=active]:from-primary data-[state=active]:via-primary/80 data-[state=active]:to-primary data-[state=active]:text-primary-foreground transition-all duration-500 w-full justify-center py-3 md:py-2 text-sm"
                >
                  Life Milestones
                </TabsTrigger>
                <TabsTrigger 
                  value="gift-advisor"
                  className="bg-gradient-to-r from-muted via-muted/60 to-muted bg-[length:200%_auto] bg-[position:0%_center] hover:bg-[position:100%_center] data-[state=active]:from-primary data-[state=active]:via-primary/80 data-[state=active]:to-primary data-[state=active]:text-primary-foreground transition-all duration-500 w-full justify-center py-3 md:py-2 text-sm"
                >
                  AI Gift Advisor
                </TabsTrigger>
                <Link 
                  to="/famous-birthdays"
                  className="bg-gradient-to-r from-muted via-muted/60 to-muted bg-[length:200%_auto] bg-[position:0%_center] hover:bg-[position:100%_center] transition-all duration-500 w-full justify-center py-3 md:py-2 text-sm flex items-center"
                >
                  Famous Birthdays
                </Link>
              </TabsList>
            </div>

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
              
              {/* SEO Content for Age Calculator */}
              <div className="mt-20 p-6 bg-accent/20 rounded-xl border border-border">
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
              <div className="mt-20 p-6 bg-accent/20 rounded-xl border border-border">
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
              <div className="mt-20 p-6 bg-accent/20 rounded-xl border border-border">
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
              <div className="mt-20 p-6 bg-accent/20 rounded-xl border border-border">
                <h2 className="text-2xl font-bold text-foreground mb-3">
                  Create Unique AI-Powered Greeting Images
                </h2>
                <p className="text-muted-foreground leading-relaxed">
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
              <div className="mt-20 p-6 bg-accent/20 rounded-xl border border-border">
                <h2 className="text-2xl font-bold text-foreground mb-3">
                  Explore Your Birthday History
                </h2>
                <p className="text-muted-foreground leading-relaxed">
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
              <div className="mt-20 p-6 bg-accent/20 rounded-xl border border-border">
                <h2 className="text-2xl font-bold text-foreground mb-3">
                  Track Your Life Milestones
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Celebrate the amazing milestones of your life! Calculate your <strong>10,000th day</strong>, discover when you'll turn <strong>one billion seconds old</strong>, see how many times your heart has beaten, and find out how many times you could have walked to the Moon. These fun calculations give you a unique perspective on your life journey.
                </p>
              </div>
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
              <div className="mt-20 p-6 bg-accent/20 rounded-xl border border-border">
                <h2 className="text-2xl font-bold text-foreground mb-3">
                  AI-Powered Gift Recommendations
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Struggling to find the perfect gift? Let our <strong>AI Gift Advisor</strong> help! Simply provide details about the recipient, occasion, and their interests, and get <strong>personalized gift recommendations</strong> tailored to their unique personality. From birthdays to anniversaries, find thoughtful and creative gift ideas in seconds.
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
            
            {/* Initially Visible Bodies */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              {planetAges.filter(body => body.group === "visible").map((body, index) => (
                <div
                  key={body.name}
                  className="group relative rounded-2xl overflow-hidden bg-gradient-to-br from-background via-card to-accent/20 transition-all duration-500 hover:scale-105 hover:shadow-2xl animate-fade-in p-8"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Card Content Container */}
                  <div className="flex flex-col items-center justify-center space-y-4">
                    {/* Planet Name */}
                    <h4 className="text-2xl font-bold text-foreground text-center">
                      {body.name}
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
                          src={body.imageURL}
                          alt={`Image of ${body.name}`}
                          className="w-full h-full object-cover"
                          crossOrigin="anonymous"
                          onError={(e) => {
                            // Fallback to local assets if NASA images fail
                            const target = e.currentTarget;
                            const localImages: Record<string, string> = {
                              'The Moon': new URL('../assets/planets/moon.jpg', import.meta.url).href,
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
                            };
                            if (localImages[body.name] && target.src !== localImages[body.name]) {
                              target.src = localImages[body.name];
                            }
                          }}
                        />
                      </div>
                    </div>
                    
                    {/* Age Display */}
                    <div className="flex flex-col items-center space-y-1">
                      <div className="text-5xl font-bold text-primary">
                        {body.age}
                      </div>
                      <div className="text-lg text-muted-foreground">
                        years old here!
                      </div>
                    </div>
                  </div>
                </div>
              ))}
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

            {/* Expandable Section - Hidden Bodies */}
            {showMorePlanets && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                {planetAges.filter(body => body.group === "hidden").map((body, index) => (
                  <div
                    key={body.name}
                    className="group relative rounded-2xl overflow-hidden bg-gradient-to-br from-background via-card to-accent/20 transition-all duration-500 hover:scale-105 hover:shadow-2xl animate-fade-in p-8"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* Card Content Container */}
                    <div className="flex flex-col items-center justify-center space-y-4">
                      {/* Planet Name */}
                      <h4 className="text-2xl font-bold text-foreground text-center">
                        {body.name}
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
                            src={body.imageURL}
                            alt={`Image of ${body.name}`}
                            className="w-full h-full object-cover"
                            crossOrigin="anonymous"
                            onError={(e) => {
                              // Fallback to local assets if NASA images fail
                              const target = e.currentTarget;
                              const localImages: Record<string, string> = {
                                'The Moon': new URL('../assets/planets/moon.jpg', import.meta.url).href,
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
                              };
                              if (localImages[body.name] && target.src !== localImages[body.name]) {
                                target.src = localImages[body.name];
                              }
                            }}
                          />
                        </div>
                      </div>
                      
                      {/* Age Display */}
                      <div className="flex flex-col items-center space-y-1">
                        <div className="text-5xl font-bold text-primary">
                          {body.age}
                        </div>
                        <div className="text-lg text-muted-foreground">
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
