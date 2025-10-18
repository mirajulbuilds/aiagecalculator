import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Rocket } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const planets = [
  { name: "Mercury", days: 88, emoji: "☿️" },
  { name: "Venus", days: 225, emoji: "♀️" },
  { name: "Mars", days: 687, emoji: "♂️" },
  { name: "Jupiter", days: 4333, emoji: "♃" },
];

export const PlanetAgeCalculator = () => {
  const [birthDate, setBirthDate] = useState<Date>();
  const [results, setResults] = useState<{ planet: string; age: number; emoji: string }[]>([]);

  const calculatePlanetAge = () => {
    if (!birthDate) {
      toast.error("Please select your birth date");
      return;
    }

    const today = new Date();
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
