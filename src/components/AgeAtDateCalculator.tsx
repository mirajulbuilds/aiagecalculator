import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Clock } from "lucide-react";
import { format, differenceInYears, differenceInMonths, differenceInDays } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const AgeAtDateCalculator = () => {
  const [birthDate, setBirthDate] = useState<Date>();
  const [targetDate, setTargetDate] = useState<Date>();
  const [ageAtDate, setAgeAtDate] = useState<{ years: number; months: number; days: number } | null>(null);

  const calculateAgeAtDate = () => {
    if (!birthDate || !targetDate) {
      toast.error("Please select both dates");
      return;
    }

    if (birthDate > targetDate) {
      toast.error("Birth date cannot be after the target date");
      return;
    }

    const years = differenceInYears(targetDate, birthDate);
    const months = differenceInMonths(targetDate, birthDate) % 12;

    const afterMonths = new Date(birthDate);
    afterMonths.setFullYear(birthDate.getFullYear() + years);
    afterMonths.setMonth(birthDate.getMonth() + months);
    const days = differenceInDays(targetDate, afterMonths);

    setAgeAtDate({ years, months, days });
    toast.success("Age calculated!");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-primary" />
        <h3 className="text-xl font-semibold text-foreground">Age at a Specific Date</h3>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Your Date of Birth
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal h-12 bg-muted",
                  !birthDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {birthDate ? format(birthDate, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={birthDate}
                onSelect={setBirthDate}
                disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Calculate Age on this Date
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal h-12 bg-muted",
                  !targetDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {targetDate ? format(targetDate, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={targetDate}
                onSelect={setTargetDate}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <Button
        onClick={calculateAgeAtDate}
        className="w-full h-12 bg-gradient-primary text-primary-foreground font-medium"
      >
        Calculate Age
      </Button>

      {ageAtDate && (
        <div className="bg-gradient-to-br from-primary/10 via-accent/20 to-primary/5 rounded-xl p-8 text-center border border-primary/20 animate-fade-in">
          <p className="text-sm text-muted-foreground mb-4">
            On {targetDate && format(targetDate, "PPP")}, your age {targetDate && targetDate > new Date() ? "will be" : "was"}
          </p>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-4xl font-bold text-primary mb-1">{ageAtDate.years}</div>
              <div className="text-sm text-muted-foreground">Years</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-1">{ageAtDate.months}</div>
              <div className="text-sm text-muted-foreground">Months</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-1">{ageAtDate.days}</div>
              <div className="text-sm text-muted-foreground">Days</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
