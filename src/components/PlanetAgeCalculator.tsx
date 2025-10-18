import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Rocket } from "lucide-react";
import { differenceInDays } from "date-fns";
import { toast } from "sonner";

const planets = [
  { name: "Mercury", days: 88, emoji: "☿️" },
  { name: "Venus", days: 225, emoji: "♀️" },
  { name: "Mars", days: 687, emoji: "♂️" },
  { name: "Jupiter", days: 4333, emoji: "♃" },
];

export const PlanetAgeCalculator = () => {
  const [birthDay, setBirthDay] = useState<string>("");
  const [birthMonth, setBirthMonth] = useState<string>("");
  const [birthYear, setBirthYear] = useState<string>("");
  const [results, setResults] = useState<{ planet: string; age: number; emoji: string }[]>([]);

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

  const calculatePlanetAge = () => {
    if (!birthDay || !birthMonth || !birthYear) {
      toast.error("Please select your birth date");
      return;
    }

    const birthDate = new Date(parseInt(birthYear), parseInt(birthMonth) - 1, parseInt(birthDay));
    const today = new Date();
    
    if (isNaN(birthDate.getTime())) {
      toast.error("Please select a valid date");
      return;
    }

    if (birthDate > today) {
      toast.error("Birth date cannot be in the future");
      return;
    }

    const earthDays = differenceInDays(today, birthDate);
    const planetAges = planets.map(planet => ({
      planet: planet.name,
      age: Number((earthDays / planet.days).toFixed(2)),
      emoji: planet.emoji,
    }));

    setResults(planetAges);
    toast.success("Planet ages calculated!");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Rocket className="w-5 h-5 text-primary" />
        <h3 className="text-xl font-semibold text-foreground">Age on Other Planets</h3>
      </div>

      <div className="space-y-4">
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

        <Button
          onClick={calculatePlanetAge}
          className="w-full h-12 bg-gradient-primary text-primary-foreground font-medium"
        >
          Calculate Planet Ages
        </Button>
      </div>

      {results.length > 0 && (
        <div className="grid md:grid-cols-2 gap-4 animate-fade-in">
          {results.map((result) => (
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
      )}
    </div>
  );
};
