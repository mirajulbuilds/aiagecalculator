import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users2 } from "lucide-react";
import { differenceInYears, differenceInMonths, differenceInDays } from "date-fns";
import { toast } from "sonner";

export const AgeDifferenceCalculator = () => {
  const [person1Day, setPerson1Day] = useState<string>("");
  const [person1Month, setPerson1Month] = useState<string>("");
  const [person1Year, setPerson1Year] = useState<string>("");
  const [person2Day, setPerson2Day] = useState<string>("");
  const [person2Month, setPerson2Month] = useState<string>("");
  const [person2Year, setPerson2Year] = useState<string>("");
  const [difference, setDifference] = useState<{ years: number; months: number; days: number } | null>(null);

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

  const calculateDifference = () => {
    if (!person1Day || !person1Month || !person1Year || !person2Day || !person2Month || !person2Year) {
      toast.error("Please select both dates");
      return;
    }

    const person1Date = new Date(parseInt(person1Year), parseInt(person1Month) - 1, parseInt(person1Day));
    const person2Date = new Date(parseInt(person2Year), parseInt(person2Month) - 1, parseInt(person2Day));

    if (isNaN(person1Date.getTime()) || isNaN(person2Date.getTime())) {
      toast.error("Please select valid dates");
      return;
    }

    const olderDate = person1Date < person2Date ? person1Date : person2Date;
    const youngerDate = person1Date < person2Date ? person2Date : person1Date;

    const diffYears = differenceInYears(youngerDate, olderDate);
    const diffMonths = differenceInMonths(youngerDate, olderDate) % 12;

    const afterMonths = new Date(olderDate);
    afterMonths.setFullYear(olderDate.getFullYear() + diffYears);
    afterMonths.setMonth(olderDate.getMonth() + diffMonths);
    const diffDays = differenceInDays(youngerDate, afterMonths);

    setDifference({ years: diffYears, months: diffMonths, days: diffDays });
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
          <div className="grid grid-cols-3 gap-2">
            <Select value={person1Day} onValueChange={setPerson1Day}>
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
            <Select value={person1Month} onValueChange={setPerson1Month}>
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
            <Select value={person1Year} onValueChange={setPerson1Year}>
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

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Person 2's Date of Birth
          </label>
          <div className="grid grid-cols-3 gap-2">
            <Select value={person2Day} onValueChange={setPerson2Day}>
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
            <Select value={person2Month} onValueChange={setPerson2Month}>
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
            <Select value={person2Year} onValueChange={setPerson2Year}>
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
