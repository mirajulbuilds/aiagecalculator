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
  return (
    <div className="space-y-6">
      {/* Total Days Section */}
      <section 
        className="bg-card rounded-2xl shadow-card p-6 md:p-8"
        aria-label="Total days lived"
      >
        <div className="text-center mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Total Days You Lived in the World
          </h2>
          <p className="text-sm text-muted-foreground">
            Complete days since birth
          </p>
        </div>
        
        <div className="bg-accent/20 rounded-xl p-8 md:p-12">
          <div className="text-center">
            <div className="text-6xl md:text-7xl lg:text-8xl font-bold text-primary mb-4 tabular-nums">
              {result.totalDays.toLocaleString()}
            </div>
            <div className="text-xl md:text-2xl text-muted-foreground mb-3">
              Days
            </div>
            <p className="text-sm text-muted-foreground">
              That's {result.years} years worth of days!
            </p>
          </div>
        </div>
      </section>

      {/* Total Time Lived Section */}
      <section 
        className="bg-card rounded-2xl shadow-card p-6 md:p-8"
        aria-label="Total time lived"
      >
        <div className="text-center mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Total Time Lived
          </h2>
          <p className="text-sm text-muted-foreground">
            Every hour and minute counts
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-accent/10 rounded-xl p-6 md:p-8 text-center">
            <div className="text-5xl md:text-6xl font-bold text-foreground mb-3 tabular-nums">
              {result.totalHours.toLocaleString()}
            </div>
            <div className="text-lg md:text-xl text-muted-foreground mb-2">
              Total Hours
            </div>
            <p className="text-xs md:text-sm text-muted-foreground">
              {result.totalDays.toLocaleString()} days
            </p>
          </div>
          <div className="bg-accent/20 rounded-xl p-6 md:p-8 text-center">
            <div className="text-5xl md:text-6xl font-bold text-primary mb-3 tabular-nums">
              {result.totalMinutes.toLocaleString()}
            </div>
            <div className="text-lg md:text-xl text-muted-foreground mb-2">
              Total Minutes
            </div>
            <p className="text-xs md:text-sm text-muted-foreground">
              {result.totalHours.toLocaleString()} hours
            </p>
          </div>
        </div>

        {/* Total Seconds */}
        <div className="bg-accent/10 rounded-xl p-6 text-center">
          <div className="text-4xl md:text-5xl font-bold text-primary mb-2 tabular-nums">
            {result.totalSeconds.toLocaleString()}
          </div>
          <div className="text-base md:text-lg text-muted-foreground mb-1">
            Total Seconds
          </div>
          {timezone && (
            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mt-2">
              <Globe className="w-3 h-3" />
              <span>{timezone}</span>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
