import { Calendar, Star } from "lucide-react";

interface AdditionalAgeInfoProps {
  nextBirthdayDays: number;
  zodiacSign: string;
  zodiacSymbol: string;
}

export const AdditionalAgeInfo = ({ 
  nextBirthdayDays, 
  zodiacSign, 
  zodiacSymbol 
}: AdditionalAgeInfoProps) => {
  return (
    <section 
      className="bg-card rounded-2xl shadow-card p-6 md:p-8 mb-6"
      aria-label="Additional age information"
    >
      <div className="text-center mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          Additional Info
        </h2>
        <p className="text-sm text-muted-foreground">
          More insights about your birthday
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Next Birthday Countdown */}
        <div className="bg-gradient-to-br from-primary/10 via-accent/20 to-primary/5 rounded-xl p-6 md:p-8 text-center border border-primary/20">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">
              Next Birthday
            </h3>
          </div>
          <div className="mb-3">
            <div className="text-5xl md:text-6xl font-bold text-primary mb-2 tabular-nums">
              {nextBirthdayDays}
            </div>
            <div className="text-base md:text-lg text-muted-foreground">
              {nextBirthdayDays === 1 ? 'Day' : 'Days'} Away
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            {nextBirthdayDays === 0 
              ? "🎉 Happy Birthday! 🎉" 
              : `Your next birthday is in ${nextBirthdayDays} ${nextBirthdayDays === 1 ? 'day' : 'days'}!`
            }
          </p>
        </div>

        {/* Zodiac Sign */}
        <div className="bg-gradient-to-br from-accent/20 via-primary/10 to-accent/10 rounded-xl p-6 md:p-8 text-center border border-accent/30">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Star className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">
              Zodiac Sign
            </h3>
          </div>
          <div className="mb-3">
            <div className="text-6xl md:text-7xl mb-3" role="img" aria-label={zodiacSign}>
              {zodiacSymbol}
            </div>
            <div className="text-2xl md:text-3xl font-bold text-primary">
              {zodiacSign}
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Your Western Zodiac Sign
          </p>
        </div>
      </div>
    </section>
  );
};
