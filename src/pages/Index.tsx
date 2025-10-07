import { useState, useEffect } from "react";
import { differenceInYears, differenceInMonths, differenceInDays, differenceInHours, differenceInMinutes } from "date-fns";
import { Globe, Calendar as CalendarIconComponent } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  totalDays: number;
  totalHours: number;
  totalMinutes: number;
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
    
    // For hours and minutes, calculate from the last complete day
    const afterDays = new Date(afterMonths);
    afterDays.setDate(afterMonths.getDate() + days);
    const hours = differenceInHours(targetDate, afterDays);
    const minutes = differenceInMinutes(targetDate, afterDays) % 60;

    // Calculate totals
    const totalDays = differenceInDays(targetDate, birthDate);
    const totalHours = differenceInHours(targetDate, birthDate);
    const totalMinutes = differenceInMinutes(targetDate, birthDate);

    setResult({
      years,
      months,
      days,
      hours,
      minutes,
      totalDays,
      totalHours,
      totalMinutes,
    });

    toast.success("Age calculated successfully!");
  };

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-4">
            Age Calculator
          </h1>
          <p className="text-muted-foreground text-base md:text-lg mb-4">
            Calculate your exact age with precision down to minutes
          </p>
          {timezone && (
            <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <Globe className="w-4 h-4" />
              <span>Timezone: <span className="font-medium">{timezone}</span></span>
            </div>
          )}
        </header>

        {/* Calculator Card */}
        <section 
          className="bg-card rounded-2xl shadow-card p-6 md:p-8 mb-6"
          aria-label="Age calculation form"
        >
          <div className="flex items-center gap-2 mb-6">
            <CalendarIconComponent className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">Enter Your Details</h2>
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

        {/* Results Card */}
        {result && (
          <div className="space-y-6">
            <section 
              className="bg-card rounded-2xl shadow-card p-6 md:p-8"
              aria-label="Calculated age results"
            >
              <h2 className="text-2xl font-semibold text-foreground mb-6 text-center">
                Your Age
              </h2>
              
              {/* Years, Months, Days */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-muted rounded-xl p-4 text-center">
                  <div className="text-4xl md:text-5xl font-bold text-primary mb-1">
                    {result.years}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Years
                  </div>
                </div>
                <div className="bg-muted rounded-xl p-4 text-center">
                  <div className="text-4xl md:text-5xl font-bold text-primary mb-1">
                    {result.months}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Months
                  </div>
                </div>
                <div className="bg-muted rounded-xl p-4 text-center">
                  <div className="text-4xl md:text-5xl font-bold text-primary mb-1">
                    {result.days}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Days
                  </div>
                </div>
              </div>

              {/* Hours, Minutes */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted rounded-xl p-4 text-center">
                  <div className="text-4xl md:text-5xl font-bold text-foreground mb-1">
                    {result.hours}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Hours
                  </div>
                </div>
                <div className="bg-muted rounded-xl p-4 text-center">
                  <div className="text-4xl md:text-5xl font-bold text-foreground mb-1">
                    {result.minutes}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Minutes
                  </div>
                </div>
              </div>
            </section>

            {/* Total Time Lived */}
            <section 
              className="bg-card rounded-2xl shadow-card p-6 md:p-8"
              aria-label="Total time lived"
            >
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-xl font-semibold text-foreground">
                  Total Time Lived:
                </h2>
                {timezone && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Globe className="w-3 h-3" />
                    <span>{timezone}</span>
                  </div>
                )}
              </div>
              
              <div className="bg-accent/30 rounded-xl p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center justify-between md:justify-start md:gap-3">
                    <span className="text-sm text-muted-foreground">Total Days:</span>
                    <span className="text-lg font-semibold text-foreground">
                      {result.totalDays.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between md:justify-start md:gap-3">
                    <span className="text-sm text-muted-foreground">Total Hours:</span>
                    <span className="text-lg font-semibold text-foreground">
                      {result.totalHours.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between md:justify-start md:gap-3">
                    <span className="text-sm text-muted-foreground">Total Minutes:</span>
                    <span className="text-lg font-semibold text-foreground">
                      {result.totalMinutes.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  );
};

export default Index;
