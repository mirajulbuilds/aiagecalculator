import { useState, useEffect } from "react";
import { differenceInYears, differenceInMonths, differenceInDays, differenceInHours, differenceInMinutes } from "date-fns";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Sparkles } from "lucide-react";

interface CelebrityAgeInfoProps {
  dateOfBirth: string; // ISO date string (YYYY-MM-DD)
  name: string;
}

interface LiveAge {
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
  nextBirthdayDays: number;
  zodiacSign: string;
  zodiacSymbol: string;
}

export const CelebrityAgeInfo = ({ dateOfBirth, name }: CelebrityAgeInfoProps) => {
  const [liveAge, setLiveAge] = useState<LiveAge | null>(null);

  const getZodiacSign = (month: number, day: number): { sign: string; symbol: string } => {
    const zodiacData: { [key: string]: { sign: string; symbol: string } } = {
      capricorn: { sign: "Capricorn", symbol: "♑" },
      aquarius: { sign: "Aquarius", symbol: "♒" },
      pisces: { sign: "Pisces", symbol: "♓" },
      aries: { sign: "Aries", symbol: "♈" },
      taurus: { sign: "Taurus", symbol: "♉" },
      gemini: { sign: "Gemini", symbol: "♊" },
      cancer: { sign: "Cancer", symbol: "♋" },
      leo: { sign: "Leo", symbol: "♌" },
      virgo: { sign: "Virgo", symbol: "♍" },
      libra: { sign: "Libra", symbol: "♎" },
      scorpio: { sign: "Scorpio", symbol: "♏" },
      sagittarius: { sign: "Sagittarius", symbol: "♐" },
    };

    if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return zodiacData.aries;
    if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return zodiacData.taurus;
    if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return zodiacData.gemini;
    if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return zodiacData.cancer;
    if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return zodiacData.leo;
    if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return zodiacData.virgo;
    if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return zodiacData.libra;
    if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return zodiacData.scorpio;
    if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return zodiacData.sagittarius;
    if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return zodiacData.capricorn;
    if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return zodiacData.aquarius;
    return zodiacData.pisces;
  };

  const calculateNextBirthday = (birthDate: Date): number => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const birthMonth = birthDate.getMonth();
    const birthDay = birthDate.getDate();
    
    let nextBirthday = new Date(currentYear, birthMonth, birthDay);
    
    if (nextBirthday < today) {
      nextBirthday = new Date(currentYear + 1, birthMonth, birthDay);
    }
    
    const diffTime = nextBirthday.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  useEffect(() => {
    if (!dateOfBirth) return;

    const updateLiveAge = () => {
      const now = new Date();
      const birthDate = new Date(dateOfBirth);

      if (isNaN(birthDate.getTime()) || birthDate > now) {
        return;
      }

      const years = differenceInYears(now, birthDate);
      const months = differenceInMonths(now, birthDate) % 12;
      
      const afterMonths = new Date(birthDate);
      afterMonths.setFullYear(birthDate.getFullYear() + years);
      afterMonths.setMonth(birthDate.getMonth() + months);
      const days = differenceInDays(now, afterMonths);
      
      const afterDays = new Date(afterMonths);
      afterDays.setDate(afterMonths.getDate() + days);
      const hours = differenceInHours(now, afterDays);
      
      const afterHours = new Date(afterDays);
      afterHours.setHours(afterDays.getHours() + hours);
      const minutes = differenceInMinutes(now, afterHours);
      
      const afterMinutes = new Date(afterHours);
      afterMinutes.setMinutes(afterHours.getMinutes() + minutes);
      const seconds = Math.floor((now.getTime() - afterMinutes.getTime()) / 1000);

      const totalDays = differenceInDays(now, birthDate);
      const totalHours = differenceInHours(now, birthDate);
      const totalMinutes = differenceInMinutes(now, birthDate);
      const totalSeconds = Math.floor((now.getTime() - birthDate.getTime()) / 1000);

      const nextBirthdayDays = calculateNextBirthday(birthDate);
      const zodiac = getZodiacSign(birthDate.getMonth() + 1, birthDate.getDate());

      setLiveAge({
        years,
        months,
        days,
        hours,
        minutes,
        seconds,
        totalDays,
        totalHours,
        totalMinutes,
        totalSeconds,
        nextBirthdayDays,
        zodiacSign: zodiac.sign,
        zodiacSymbol: zodiac.symbol,
      });
    };

    updateLiveAge();
    const interval = setInterval(updateLiveAge, 1000);

    return () => clearInterval(interval);
  }, [dateOfBirth]);

  if (!liveAge) return null;

  return (
    <div className="space-y-6 my-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Live Age & Birthday Info
        </h2>
        <p className="text-muted-foreground">Real-time age counter and zodiac information</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Current Age Card */}
        <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Current Age</h3>
          </div>
          <div className="space-y-2">
            <div className="text-4xl font-bold text-primary">
              {liveAge.years}
            </div>
            <p className="text-sm text-muted-foreground">years old</p>
            <div className="pt-2 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Months:</span>
                <span className="font-medium">{liveAge.months}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Days:</span>
                <span className="font-medium">{liveAge.days}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Hours:</span>
                <span className="font-medium">{liveAge.hours}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Minutes:</span>
                <span className="font-medium">{liveAge.minutes}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Seconds:</span>
                <span className="font-medium animate-pulse">{liveAge.seconds}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Total Days Lived Card */}
        <Card className="p-6 bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-secondary" />
            <h3 className="font-semibold">Total Days Lived</h3>
          </div>
          <div className="space-y-2">
            <div className="text-4xl font-bold text-secondary">
              {liveAge.totalDays.toLocaleString()}
            </div>
            <p className="text-sm text-muted-foreground">days on Earth</p>
            <div className="pt-2 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Hours:</span>
                <span className="font-medium">{liveAge.totalHours.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Minutes:</span>
                <span className="font-medium">{liveAge.totalMinutes.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Seconds:</span>
                <span className="font-medium animate-pulse">{liveAge.totalSeconds.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Next Birthday & Zodiac Card */}
        <Card className="p-6 bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-accent" />
            <h3 className="font-semibold">Birthday & Zodiac</h3>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Next Birthday</p>
              <div className="text-3xl font-bold text-accent">
                {liveAge.nextBirthdayDays}
              </div>
              <p className="text-sm text-muted-foreground">days away</p>
            </div>
            <div className="pt-2 border-t border-border">
              <p className="text-sm text-muted-foreground mb-2">Zodiac Sign</p>
              <Badge variant="secondary" className="text-lg">
                {liveAge.zodiacSymbol} {liveAge.zodiacSign}
              </Badge>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-4 bg-muted/50">
        <p className="text-sm text-center text-muted-foreground">
          <Sparkles className="w-4 h-4 inline mr-1" />
          Age updates automatically every second
        </p>
      </Card>
    </div>
  );
};
