import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { differenceInYears, differenceInMonths, differenceInDays, differenceInHours, differenceInMinutes } from "date-fns";
import { Globe, Calendar as CalendarIconComponent, Download, Sparkles, Users, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { AgeDisplayFormats } from "@/components/AgeDisplayFormats";
import { AdSenseBanner } from "@/components/AdSenseBanner";

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
}

const Index = () => {
  const [name, setName] = useState<string>("");
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
  const [birthdayWishImage, setBirthdayWishImage] = useState<string | null>(null);
  const [isGeneratingWish, setIsGeneratingWish] = useState(false);

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
      const birthDate = new Date(parseInt(birthYear), parseInt(birthMonth) - 1, parseInt(birthDay));
      const now = new Date();

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

  const calculateAge = () => {
    if (!birthDay || !birthMonth || !birthYear) {
      toast.error("Please enter your complete birth date");
      return;
    }

    if (!targetDay || !targetMonth || !targetYear) {
      toast.error("Please enter a valid target date");
      return;
    }

    const birthDate = new Date(parseInt(birthYear), parseInt(birthMonth) - 1, parseInt(birthDay));
    
    // For target date, use current time if it's today, otherwise use midnight
    const now = new Date();
    const isToday = parseInt(targetDay) === now.getDate() && 
                    parseInt(targetMonth) === (now.getMonth() + 1) && 
                    parseInt(targetYear) === now.getFullYear();
    
    const targetDate = isToday 
      ? now 
      : new Date(parseInt(targetYear), parseInt(targetMonth) - 1, parseInt(targetDay));

    if (isNaN(birthDate.getTime()) || isNaN(targetDate.getTime())) {
      toast.error("Please enter valid dates");
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
            age: age
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
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-4 flex items-center justify-center gap-3">
            <Sparkles className="w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14" aria-hidden="true" />
            AI Age Calculator
          </h1>
          <p className="text-muted-foreground text-base md:text-lg mb-4">
            Calculate your exact age with precision — and celebrate your special day with a personalized AI birthday wish! 🎉
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
            className="bg-card rounded-2xl shadow-card p-6 md:p-8 mb-6"
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
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col sm:flex-row gap-2 justify-center">
                    <Button
                      onClick={downloadBirthdayWish}
                      className="gap-1.5 bg-gradient-primary hover:opacity-90 h-8 text-xs"
                      size="sm"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download
                    </Button>
                    <Button
                      onClick={() => generateBirthdayWish(
                        new Date(parseInt(birthYear), parseInt(birthMonth) - 1, parseInt(birthDay)),
                        result.years
                      )}
                      variant="outline"
                      className="gap-1.5 h-8 text-xs"
                      size="sm"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      New Wish
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-center gap-2 pt-2 border-t border-border/50">
                    <Share2 className="w-3.5 h-3.5 text-muted-foreground" aria-hidden="true" />
                    <span className="text-xs text-muted-foreground">Share:</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const shareText = `Check out my personalized birthday wish! 🎉 Calculate your age at ${window.location.origin}`;
                        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`, '_blank');
                      }}
                      className="h-7 px-2 gap-1"
                    >
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                      <span className="text-xs">X</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const shareText = `Check out my personalized birthday wish! 🎉 Calculate your age at ${window.location.origin}`;
                        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin)}&quote=${encodeURIComponent(shareText)}`, '_blank');
                      }}
                      className="h-7 px-2 gap-1"
                    >
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                      </svg>
                      <span className="text-xs">Facebook</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const shareText = `Check out my personalized birthday wish! 🎉 Calculate your age at ${window.location.origin}`;
                        window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
                      }}
                      className="h-7 px-2 gap-1"
                    >
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                      </svg>
                      <span className="text-xs">WhatsApp</span>
                    </Button>
                  </div>
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
