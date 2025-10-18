import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock } from "lucide-react";
import { differenceInYears, differenceInMonths, differenceInDays } from "date-fns";
import { toast } from "sonner";

export const AgeAtDateCalculator = () => {
  const [birthDay, setBirthDay] = useState<string>("");
  const [birthMonth, setBirthMonth] = useState<string>("");
  const [birthYear, setBirthYear] = useState<string>("");
  const [targetDay, setTargetDay] = useState<string>("");
  const [targetMonth, setTargetMonth] = useState<string>("");
  const [targetYear, setTargetYear] = useState<string>("");
  const [result, setResult] = useState<{ years: number; months: number; days: number } | null>(null);

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
  const years = Array.from({ length: 150 }, (_, i) => (currentYear + 50 - i).toString());

  const calculateAgeAtDate = () => {
    if (!birthDay || !birthMonth || !birthYear || !targetDay || !targetMonth || !targetYear) {
      toast.error("Please select both dates");
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

    const ageYears = differenceInYears(targetDate, birthDate);
    const ageMonths = differenceInMonths(targetDate, birthDate) % 12;

    const afterMonths = new Date(birthDate);
    afterMonths.setFullYear(birthDate.getFullYear() + ageYears);
    afterMonths.setMonth(birthDate.getMonth() + ageMonths);
    const ageDays = differenceInDays(targetDate, afterMonths);

    setResult({ years: ageYears, months: ageMonths, days: ageDays });
    toast.success("Age calculated successfully!");
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

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Calculate Age on this Date
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

      <Button
        onClick={calculateAgeAtDate}
        className="w-full h-12 bg-gradient-primary text-primary-foreground font-medium"
      >
        Calculate Age
      </Button>

      {result && (
        <div className="bg-gradient-to-br from-primary/10 via-accent/20 to-primary/5 rounded-xl p-8 text-center border border-primary/20 animate-fade-in">
          <p className="text-sm text-muted-foreground mb-4">
            On the selected date, your age {targetYear && parseInt(targetYear) > new Date().getFullYear() ? "will be" : "was"}
          </p>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-4xl font-bold text-primary mb-1">{result.years}</div>
              <div className="text-sm text-muted-foreground">Years</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-1">{result.months}</div>
              <div className="text-sm text-muted-foreground">Months</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-1">{result.days}</div>
              <div className="text-sm text-muted-foreground">Days</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
