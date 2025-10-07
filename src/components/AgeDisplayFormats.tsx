import { useState } from "react";
import { Globe } from "lucide-react";

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

interface AgeDisplayFormatsProps {
  result: AgeResult;
  timezone: string;
}

export const AgeDisplayFormats = ({ result, timezone }: AgeDisplayFormatsProps) => {
  const [displayFormat, setDisplayFormat] = useState<"detailed" | "days" | "hours">("detailed");

  return (
    <section 
      className="bg-card rounded-2xl shadow-card p-6 md:p-8"
      aria-label="Age display formats"
    >
      <div className="flex items-start justify-between mb-6">
        <h2 className="text-xl font-semibold text-foreground">
          View Your Age:
        </h2>
        {timezone && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Globe className="w-3 h-3" />
            <span>{timezone}</span>
          </div>
        )}
      </div>

      {/* Display Format Selector */}
      <div className="flex justify-center mb-6">
        <div className="inline-flex bg-muted rounded-lg p-1 gap-1">
          <button
            onClick={() => setDisplayFormat("detailed")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              displayFormat === "detailed"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Traditional Age
          </button>
          <button
            onClick={() => setDisplayFormat("days")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              displayFormat === "days"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Total Days
          </button>
          <button
            onClick={() => setDisplayFormat("hours")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              displayFormat === "hours"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Hours & Minutes
          </button>
        </div>
      </div>

      {/* Detailed Format - Traditional Age */}
      {displayFormat === "detailed" && (
        <div className="bg-accent/30 rounded-xl p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 md:gap-6">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-foreground mb-2">
                {result.years}
              </div>
              <div className="text-sm text-muted-foreground">
                Years
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-foreground mb-2">
                {result.months}
              </div>
              <div className="text-sm text-muted-foreground">
                Months
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-foreground mb-2">
                {result.days}
              </div>
              <div className="text-sm text-muted-foreground">
                Days
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Total Days Format */}
      {displayFormat === "days" && (
        <div className="bg-accent/30 rounded-xl p-8 md:p-12">
          <div className="text-center">
            <div className="text-6xl md:text-7xl lg:text-8xl font-bold text-foreground mb-4 tabular-nums">
              {result.totalDays.toLocaleString()}
            </div>
            <div className="text-lg md:text-xl text-muted-foreground">
              Total Days Lived
            </div>
          </div>
        </div>
      )}

      {/* Hours & Minutes Format */}
      {displayFormat === "hours" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-accent/30 rounded-xl p-6 md:p-8 text-center">
            <div className="text-5xl md:text-6xl font-bold text-foreground mb-3 tabular-nums">
              {result.totalHours.toLocaleString()}
            </div>
            <div className="text-base md:text-lg text-muted-foreground">
              Total Hours
            </div>
          </div>
          <div className="bg-accent/30 rounded-xl p-6 md:p-8 text-center">
            <div className="text-5xl md:text-6xl font-bold text-foreground mb-3 tabular-nums">
              {result.totalMinutes.toLocaleString()}
            </div>
            <div className="text-base md:text-lg text-muted-foreground">
              Total Minutes
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
