import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { differenceInYears, differenceInMonths, differenceInDays, differenceInHours, differenceInMinutes } from "date-fns";
import { Globe, Calendar as CalendarIconComponent, Download, Sparkles, Users, Share2, Rocket } from "lucide-react";
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
  const [name, setName] = useState<string>("");
  const [birthDay, setBirthDay] = useState<string>("1");
  const [birthMonth, setBirthMonth] = useState<string>("1");
  const [birthYear, setBirthYear] = useState<string>("2000");
  
  const currentDate = new Date();
  const [targetDay, setTargetDay] = useState<string>(currentDate.getDate().toString());
  const [targetMonth, setTargetMonth] = useState<string>((currentDate.getMonth() + 1).toString());
  const [targetYear, setTargetYear] = useState<string>(currentDate.getFullYear().toString());
  
  const [result, setResult] = useState<AgeResult | null>(null);
  const [timezone, setTimezone] = useState<string>("");
  const [liveAge, setLiveAge] = useState<AgeResult | null>(null);
  const [birthdayWishImage, setBirthdayWishImage] = useState<string | null>(null);
  const [isGeneratingWish, setIsGeneratingWish] = useState(false);
  const [customPrompt, setCustomPrompt] = useState<string>("");
  const [planetAges, setPlanetAges] = useState<{ planet: string; age: number; emoji: string }[]>([]);

  useEffect(() => {
    // Detect user's timezone
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setTimezone(userTimezone);
    
    // Auto-calculate with default example date on initial load
    calculateAge();
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
      { name: "Mercury", days: 88, emoji: "☿️" },
      { name: "Venus", days: 225, emoji: "♀️" },
      { name: "Mars", days: 687, emoji: "♂️" },
      { name: "Jupiter", days: 4333, emoji: "♃" },
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
    
    // Generate birthday wish image
    generateBirthdayWish(birthDate, years);
  };

  const generateBirthdayWish = async (birthDate: Date, age: number) => {
    setIsGeneratingWish(true);
    setBirthdayWishImage(null);
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-birthday-wish`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            name: name || undefined,
            birthDate: `${birthDate.getFullYear()}-${String(birthDate.getMonth() + 1).padStart(2, '0')}-${String(birthDate.getDate()).padStart(2, '0')}`,
            age: age,
            customPrompt: customPrompt || undefined
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 429) {
          toast.error("Rate limit exceeded. Please try again in a moment.");
        } else if (response.status === 402) {
          toast.error("Please add credits to your Lovable workspace to generate birthday wishes.");
        } else {
          throw new Error(errorData.error || 'Failed to generate birthday wish');
        }
        return;
      }

      const data = await response.json();
      if (data.imageUrl) {
        setBirthdayWishImage(data.imageUrl);
        toast.success("Birthday wish generated! 🎉");
      } else {
        throw new Error('No image URL received');
      }
    } catch (error) {
      console.error('Error generating birthday wish:', error);
      toast.error("Failed to generate birthday wish. Please try again.");
    } finally {
      setIsGeneratingWish(false);
    }
  };

  const addWatermarkToImage = async (imageDataUrl: string): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        // Draw the original image
        ctx.drawImage(img, 0, 0);
        
        // Add watermark
        const fontSize = Math.max(14, img.width * 0.02); // Responsive font size, min 14px
        ctx.font = `${fontSize}px Inter, Roboto, sans-serif`;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'bottom';
        
        const padding = 20;
        ctx.fillText('aiagecalc.com', canvas.width - padding, canvas.height - padding);
        
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob'));
          }
        }, 'image/png');
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = imageDataUrl;
    });
  };

  const shareImage = async () => {
    if (!birthdayWishImage) return;
    
    try {
      // Add watermark to image
      const imageBlob = await addWatermarkToImage(birthdayWishImage);
      const file = new File([imageBlob], 'birthday-wish.png', { type: 'image/png' });
      
      // Check if Web Share API is supported
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Birthday Wish',
          text: 'Check out this personalized birthday wish! 🎉',
        });
        toast.success("🎉 Image shared successfully!");
      } else {
        // Fallback: download the image
        const url = URL.createObjectURL(imageBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `birthday-wish-${name || 'celebration'}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success("Image downloaded successfully! You can now share it manually");
      }
    } catch (error) {
      console.error('Error sharing image:', error);
      toast.error("Failed to share image. Please try again.");
    }
  };

  const downloadBirthdayWish = () => {
    if (!birthdayWishImage) return;
    
    try {
      const link = document.createElement('a');
      link.href = birthdayWishImage;
      link.download = `birthday-wish-${name || 'celebration'}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Birthday wish downloaded!");
    } catch (error) {
      console.error('Error downloading image:', error);
      toast.error("Failed to download image. Please try right-clicking and saving.");
    }
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
            Your Age is More Than Just a Number
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
            Discover surprising life stats, your next birthday countdown, and your Zodiac sign with a single click!
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

        {/* Calculator Card */}
        <section 
          className="bg-card rounded-2xl shadow-card p-6 md:p-8 mb-6"
          aria-label="Age calculation form"
        >
          <div className="flex items-center gap-2 mb-6">
            <CalendarIconComponent className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">Enter Your Details</h2>
          </div>

          {/* Name Input (Optional) */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-foreground mb-2">
              Your Name (Optional - for personalized birthday wish)
            </label>
            <Input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-12 bg-muted"
            />
          </div>

          {/* Custom Prompt Input (Optional) */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-foreground mb-2">
              Custom Birthday Wish Prompt (Optional)
            </label>
            <Textarea
              placeholder="E.g., 'Create a birthday wish with space theme and rockets' or 'Make it elegant with gold accents'"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              className="min-h-[80px] bg-muted resize-none"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Add your own creative touch to the birthday wish image
            </p>
          </div>

          {/* CTA Text */}
          <div className="text-center mb-6 p-4 bg-primary/10 rounded-lg border border-primary/20">
            <p className="text-base md:text-lg font-semibold text-foreground">
              This is just an example. Now, enter your own birthday to see the magic!
            </p>
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
        </section>

        {/* Traditional Age Section */}
        {result && (
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
        {result && (
          <AdditionalAgeInfo 
            nextBirthdayDays={result.nextBirthdayDays}
            zodiacSign={result.zodiacSign}
            zodiacSymbol={result.zodiacSymbol}
          />
        )}

        {/* Planet Ages Section */}
        {planetAges.length > 0 && (
          <section className="bg-card rounded-2xl shadow-card p-6 md:p-8 mb-6 animate-fade-in">
            <div className="flex items-center gap-2 mb-6">
              <Rocket className="w-5 h-5 text-primary" />
              <h3 className="text-xl font-semibold text-foreground">Your Age on Other Planets</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {planetAges.map((result) => (
                <div
                  key={result.planet}
                  className="bg-gradient-to-br from-primary/10 via-accent/20 to-primary/5 rounded-xl p-6 text-center border border-primary/20"
                >
                  <div className="text-4xl mb-2">{result.emoji}</div>
                  <div className="text-2xl font-bold text-primary mb-1">
                    {result.age}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    years old on {result.planet}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* AI Birthday Wish Section */}
        {result && (
          <section 
            className="bg-gradient-to-br from-card via-accent/10 to-card rounded-xl shadow-sm p-3 md:p-4 mb-6"
            aria-label="AI generated birthday wish"
          >
            <div className="flex items-center justify-center gap-1.5 mb-3">
              <Sparkles className="w-4 h-4 text-primary" />
              <h2 className="text-base md:text-lg font-semibold text-foreground">
                Your Personalized Birthday Wish
              </h2>
            </div>

            {isGeneratingWish ? (
              <div className="flex flex-col items-center justify-center py-6 space-y-2">
                <div className="relative">
                  <div className="w-10 h-10 border-3 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                  <Sparkles className="w-5 h-5 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <p className="text-xs text-muted-foreground text-center animate-pulse">
                  Creating your birthday wish...
                </p>
              </div>
            ) : birthdayWishImage ? (
              <div className="space-y-3 animate-fade-in">
                <div className="relative rounded-md overflow-hidden shadow-sm border border-primary/20 max-w-xl mx-auto">
                  <img 
                    src={birthdayWishImage} 
                    alt="Personalized birthday wish"
                    className="w-full h-auto"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex flex-col sm:flex-row gap-2 justify-center">
                    <Button
                      onClick={shareImage}
                      className="gap-1.5 bg-gradient-primary hover:opacity-90 h-9 text-sm"
                      size="sm"
                    >
                      <Share2 className="w-4 h-4" />
                      Share Image
                    </Button>
                    <Button
                      onClick={downloadBirthdayWish}
                      variant="outline"
                      className="gap-1.5 h-9 text-sm"
                      size="sm"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </Button>
                    <Button
                      onClick={() => {
                        if (birthDay && birthMonth && birthYear) {
                          const birthDate = new Date(parseInt(birthYear), parseInt(birthMonth) - 1, parseInt(birthDay));
                          generateBirthdayWish(birthDate, result.years);
                        }
                      }}
                      variant="outline"
                      className="gap-1.5 h-9 text-sm"
                      size="sm"
                    >
                      <Sparkles className="w-4 h-4" />
                      New Wish
                    </Button>
                  </div>
                  <p className="text-xs text-center text-muted-foreground">
                    Share on WhatsApp, Instagram, Messenger, or download to share manually
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-xs text-muted-foreground">
                <p>Birthday wish will appear after calculating age</p>
              </div>
            )}
          </section>
        )}

        {/* Ad Banner */}
        {result && (
          <AdSenseBanner format="large-horizontal" className="mb-6" />
        )}

        {/* Live Age Display */}
        {liveAge && (
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
        {result && (
          <AgeDisplayFormats result={result} timezone={timezone} />
        )}

        {/* Additional Calculators Section */}
        <section className="bg-card rounded-2xl shadow-card p-6 md:p-8 mb-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              More Age Calculators
            </h2>
            <p className="text-sm text-muted-foreground">
              Explore different ways to calculate and compare ages
            </p>
          </div>

          <Tabs defaultValue="difference" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="difference">Age Difference</TabsTrigger>
              <TabsTrigger value="specific">Specific Date</TabsTrigger>
            </TabsList>
            
            <TabsContent value="difference" className="animate-fade-in">
              <AgeDifferenceCalculator />
            </TabsContent>
            
            <TabsContent value="specific" className="animate-fade-in">
              <AgeAtDateCalculator />
            </TabsContent>
          </Tabs>
        </section>

        {/* Famous People Born on This Date */}
        {result && birthMonth && birthDay && (
          <FamousBirthdayMatches 
            birthMonth={parseInt(birthMonth)} 
            birthDay={parseInt(birthDay)} 
          />
        )}

        {/* Bottom Ad Banner */}
        {result && (
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
