import { useState, useEffect } from "react";
import { differenceInYears, differenceInMonths, differenceInDays, differenceInHours, differenceInMinutes } from "date-fns";
import { Sparkles, Globe } from "lucide-react";
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

interface AgeResult {
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
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

  useEffect(() => {
    // Detect user's timezone
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setTimezone(userTimezone);
  }, []);

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
    const targetDate = new Date(parseInt(targetYear), parseInt(targetMonth) - 1, parseInt(targetDay));

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
    
    const hours = differenceInHours(targetDate, birthDate) % 24;
    const minutes = differenceInMinutes(targetDate, birthDate) % 60;

    setResult({
      years,
      months,
      days,
      hours,
      minutes,
    });

    toast.success("Age calculated successfully!");
  };

  return (
    <main className="min-h-screen bg-gradient-bg flex items-center justify-center p-4">
      <div className="w-full max-w-2xl animate-fade-in">
        {/* Header */}
        <header className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-2xl mb-4 shadow-elegant">
            <Sparkles className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3 bg-gradient-primary bg-clip-text text-transparent">
            Age Calculator
          </h1>
          <p className="text-muted-foreground text-lg mb-3">
            Calculate your exact age in years, months, days, hours, and minutes
          </p>
          {timezone && (
            <div className="inline-flex items-center gap-2 bg-accent px-4 py-2 rounded-full text-sm text-accent-foreground">
              <Globe className="w-4 h-4" />
              <span>Your timezone: <span className="font-medium">{timezone}</span></span>
            </div>
          )}
        </header>

        {/* Calculator Card */}
        <section 
          className="bg-card rounded-3xl shadow-card p-6 md:p-8 mb-6 animate-scale-in"
          aria-label="Age calculation form"
        >
          <div className="space-y-6">
            {/* Birth Date Input */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-3">
                Date of Birth *
              </label>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label htmlFor="birth-day" className="text-xs text-muted-foreground mb-1 block">
                    Day
                  </label>
                  <Select value={birthDay} onValueChange={setBirthDay}>
                    <SelectTrigger id="birth-day" className="h-12">
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
                </div>
                <div>
                  <label htmlFor="birth-month" className="text-xs text-muted-foreground mb-1 block">
                    Month
                  </label>
                  <Select value={birthMonth} onValueChange={setBirthMonth}>
                    <SelectTrigger id="birth-month" className="h-12">
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
                </div>
                <div>
                  <label htmlFor="birth-year" className="text-xs text-muted-foreground mb-1 block">
                    Year
                  </label>
                  <Select value={birthYear} onValueChange={setBirthYear}>
                    <SelectTrigger id="birth-year" className="h-12">
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

            {/* Target Date Input */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-3">
                Calculate Age To
              </label>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label htmlFor="target-day" className="text-xs text-muted-foreground mb-1 block">
                    Day
                  </label>
                  <Select value={targetDay} onValueChange={setTargetDay}>
                    <SelectTrigger id="target-day" className="h-12">
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
                </div>
                <div>
                  <label htmlFor="target-month" className="text-xs text-muted-foreground mb-1 block">
                    Month
                  </label>
                  <Select value={targetMonth} onValueChange={setTargetMonth}>
                    <SelectTrigger id="target-month" className="h-12">
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
                </div>
                <div>
                  <label htmlFor="target-year" className="text-xs text-muted-foreground mb-1 block">
                    Year
                  </label>
                  <Select value={targetYear} onValueChange={setTargetYear}>
                    <SelectTrigger id="target-year" className="h-12">
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
              className="w-full h-12 bg-gradient-primary text-primary-foreground font-semibold text-lg shadow-elegant hover:shadow-elegant/50 transition-all"
              size="lg"
            >
              Calculate Age
            </Button>
          </div>
        </section>

        {/* Results Card */}
        {result && (
          <article 
            className="bg-card rounded-3xl shadow-card p-6 md:p-8 animate-scale-in"
            aria-label="Calculated age results"
          >
            <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
              Your Exact Age
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-accent rounded-2xl p-4 text-center">
                <div className="text-3xl md:text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-1">
                  {result.years}
                </div>
                <div className="text-sm text-muted-foreground font-medium">
                  {result.years === 1 ? "Year" : "Years"}
                </div>
              </div>
              <div className="bg-accent rounded-2xl p-4 text-center">
                <div className="text-3xl md:text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-1">
                  {result.months}
                </div>
                <div className="text-sm text-muted-foreground font-medium">
                  {result.months === 1 ? "Month" : "Months"}
                </div>
              </div>
              <div className="bg-accent rounded-2xl p-4 text-center">
                <div className="text-3xl md:text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-1">
                  {result.days}
                </div>
                <div className="text-sm text-muted-foreground font-medium">
                  {result.days === 1 ? "Day" : "Days"}
                </div>
              </div>
              <div className="bg-accent rounded-2xl p-4 text-center">
                <div className="text-3xl md:text-4xl font-bold bg-gradient-accent bg-clip-text text-transparent mb-1">
                  {result.hours}
                </div>
                <div className="text-sm text-muted-foreground font-medium">
                  {result.hours === 1 ? "Hour" : "Hours"}
                </div>
              </div>
              <div className="bg-accent rounded-2xl p-4 text-center col-span-2 md:col-span-1">
                <div className="text-3xl md:text-4xl font-bold bg-gradient-accent bg-clip-text text-transparent mb-1">
                  {result.minutes}
                </div>
                <div className="text-sm text-muted-foreground font-medium">
                  {result.minutes === 1 ? "Minute" : "Minutes"}
                </div>
              </div>
            </div>
          </article>
        )}

        {/* Footer */}
        <footer className="text-center mt-8 text-muted-foreground text-sm">
          <p>All calculations are performed in your local timezone for accuracy</p>
        </footer>
      </div>
    </main>
  );
};

export default Index;
