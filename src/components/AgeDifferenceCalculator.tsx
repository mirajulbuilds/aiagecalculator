import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Users2 } from "lucide-react";
import { format, differenceInYears, differenceInMonths, differenceInDays } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const AgeDifferenceCalculator = () => {
  const [person1Date, setPerson1Date] = useState<Date>();
  const [person2Date, setPerson2Date] = useState<Date>();
  const [difference, setDifference] = useState<{ years: number; months: number; days: number } | null>(null);

  const calculateDifference = () => {
    if (!person1Date || !person2Date) {
      toast.error("Please select both dates");
      return;
    }

    const olderDate = person1Date < person2Date ? person1Date : person2Date;
    const youngerDate = person1Date < person2Date ? person2Date : person1Date;

    const years = differenceInYears(youngerDate, olderDate);
    const months = differenceInMonths(youngerDate, olderDate) % 12;

    const afterMonths = new Date(olderDate);
    afterMonths.setFullYear(olderDate.getFullYear() + years);
    afterMonths.setMonth(olderDate.getMonth() + months);
    const days = differenceInDays(youngerDate, afterMonths);

    setDifference({ years, months, days });
    toast.success("Age difference calculated!");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Users2 className="w-5 h-5 text-primary" />
        <h3 className="text-xl font-semibold text-foreground">Age Difference Calculator</h3>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Person 1's Date of Birth
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal h-12 bg-muted",
                  !person1Date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {person1Date ? format(person1Date, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={person1Date}
                onSelect={setPerson1Date}
                disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Person 2's Date of Birth
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal h-12 bg-muted",
                  !person2Date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {person2Date ? format(person2Date, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={person2Date}
                onSelect={setPerson2Date}
                disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <Button
        onClick={calculateDifference}
        className="w-full h-12 bg-gradient-primary text-primary-foreground font-medium"
      >
        Calculate Difference
      </Button>

      {difference && (
        <div className="bg-gradient-to-br from-primary/10 via-accent/20 to-primary/5 rounded-xl p-8 text-center border border-primary/20 animate-fade-in">
          <p className="text-sm text-muted-foreground mb-4">The age difference is</p>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-4xl font-bold text-primary mb-1">{difference.years}</div>
              <div className="text-sm text-muted-foreground">Years</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-1">{difference.months}</div>
              <div className="text-sm text-muted-foreground">Months</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-1">{difference.days}</div>
              <div className="text-sm text-muted-foreground">Days</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
