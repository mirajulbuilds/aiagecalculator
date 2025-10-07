import { useState } from "react";
import { format, differenceInYears, differenceInMonths, differenceInDays, differenceInHours, differenceInMinutes } from "date-fns";
import { CalendarIcon, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";

interface AgeResult {
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
}

const Index = () => {
  const [birthDate, setBirthDate] = useState<Date>();
  const [targetDate, setTargetDate] = useState<Date>(new Date());
  const [result, setResult] = useState<AgeResult | null>(null);

  const calculateAge = () => {
    if (!birthDate) {
      toast.error("Please select your birth date");
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
          <p className="text-muted-foreground text-lg">
            Calculate your exact age in years, months, days, hours, and minutes
          </p>
        </header>

        {/* Calculator Card */}
        <section 
          className="bg-card rounded-3xl shadow-card p-6 md:p-8 mb-6 animate-scale-in"
          aria-label="Age calculation form"
        >
          <div className="space-y-6">
            {/* Birth Date Input */}
            <div>
              <label htmlFor="birth-date" className="block text-sm font-medium text-foreground mb-2">
                Date of Birth *
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="birth-date"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal h-12",
                      !birthDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {birthDate ? format(birthDate, "PPP") : <span>Pick your birth date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={birthDate}
                    onSelect={setBirthDate}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                    disabled={(date) => date > new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Target Date Input */}
            <div>
              <label htmlFor="target-date" className="block text-sm font-medium text-foreground mb-2">
                Calculate Age To
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="target-date"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal h-12"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(targetDate, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={targetDate}
                    onSelect={(date) => date && setTargetDate(date)}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
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
          <p>Fast, accurate, and easy to use on any device</p>
        </footer>
      </div>
    </main>
  );
};

export default Index;
