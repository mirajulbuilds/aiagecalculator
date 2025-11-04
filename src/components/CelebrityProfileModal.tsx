import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Calendar, MapPin, Star, Trophy, X, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { differenceInYears, differenceInMonths, differenceInDays, differenceInHours, differenceInMinutes, differenceInSeconds } from "date-fns";
import { AdSenseBanner } from "@/components/AdSenseBanner";
import { Button } from "@/components/ui/button";

interface CelebrityProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  celebrityName: string;
  dateOfBirth: string;
  profession: string;
}

interface CelebrityProfile {
  name: string;
  dateOfBirth: string;
  placeOfBirth: string;
  profession: string;
  zodiacSign: string;
  biography: string;
  knownFor: string[];
  careerHighlights: string[];
}

export const CelebrityProfileModal: React.FC<CelebrityProfileModalProps> = ({
  isOpen,
  onClose,
  celebrityName,
  dateOfBirth,
  profession,
}) => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<CelebrityProfile | null>(null);
  const [liveAge, setLiveAge] = useState({
    years: 0,
    months: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [nextBirthday, setNextBirthday] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
  });

  useEffect(() => {
    if (isOpen && celebrityName) {
      loadFullProfile();
    }
  }, [isOpen, celebrityName]);

  useEffect(() => {
    if (!profile?.dateOfBirth) return;

    const updateLiveAge = () => {
      const now = new Date();
      const birthDate = new Date(profile.dateOfBirth);

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
      const seconds = differenceInSeconds(now, afterMinutes);

      setLiveAge({ years, months, days, hours, minutes, seconds });

      // Calculate next birthday
      const currentYear = now.getFullYear();
      let nextBirthdayDate = new Date(currentYear, birthDate.getMonth(), birthDate.getDate());
      
      if (nextBirthdayDate < now) {
        nextBirthdayDate = new Date(currentYear + 1, birthDate.getMonth(), birthDate.getDate());
      }

      const birthdayDays = Math.floor((nextBirthdayDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const birthdayHours = Math.floor(((nextBirthdayDate.getTime() - now.getTime()) % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const birthdayMinutes = Math.floor(((nextBirthdayDate.getTime() - now.getTime()) % (1000 * 60 * 60)) / (1000 * 60));

      setNextBirthday({ 
        days: birthdayDays, 
        hours: birthdayHours, 
        minutes: birthdayMinutes 
      });
    };

    updateLiveAge();
    const interval = setInterval(updateLiveAge, 1000);

    return () => clearInterval(interval);
  }, [profile?.dateOfBirth]);

  const loadFullProfile = async () => {
    try {
      setLoading(true);
      
      // Query the Supabase database directly
      const { data: celebData, error } = await supabase
        .from('explore_famous_birthdays')
        .select('*')
        .eq('name', celebrityName)
        .maybeSingle();

      if (error) throw error;

      if (celebData) {
        // Map database fields to profile structure
        setProfile({
          name: celebData.name,
          dateOfBirth: celebData.dob,
          placeOfBirth: celebData.country || 'Unknown',
          profession: celebData.profession,
          zodiacSign: getZodiacSign(new Date(celebData.dob)),
          biography: celebData.bio || celebData.ai_summary || 'Biography not available.',
          knownFor: celebData.famous_for ? [celebData.famous_for] : [],
          careerHighlights: []
        });
      } else {
        toast.error('Celebrity profile not found');
      }
    } catch (error) {
      console.error('Error loading celebrity profile:', error);
      toast.error('Failed to load celebrity profile');
    } finally {
      setLoading(false);
    }
  };

  const getZodiacSign = (date: Date): string => {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return "Aries";
    if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return "Taurus";
    if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return "Gemini";
    if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return "Cancer";
    if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return "Leo";
    if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return "Virgo";
    if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return "Libra";
    if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return "Scorpio";
    if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return "Sagittarius";
    if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return "Capricorn";
    if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return "Aquarius";
    return "Pisces";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  return (
    <>
      {profile && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              "name": profile.name,
              "birthDate": profile.dateOfBirth,
              "jobTitle": profile.profession,
              "description": profile.biography.split('\n\n')[0],
              "birthPlace": profile.placeOfBirth,
            })
          }}
        />
      )}
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <Button
          variant="ghost"
          size="sm"
          className="absolute left-4 top-4 gap-2"
          onClick={onClose}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Directory
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4 rounded-full"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <p className="text-lg text-muted-foreground">Fetching Profile...</p>
          </div>
        ) : profile ? (
          <article className="space-y-6">
            <DialogHeader>
              <div className="flex flex-col md:flex-row items-start gap-6">
                <Avatar className="w-32 h-32 border-4 border-primary/20">
                  <AvatarImage src={(profile as any).image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&size=256&background=random`} />
                  <AvatarFallback className="bg-gradient-primary text-primary-foreground text-3xl">
                    {profile.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <DialogTitle className="text-3xl md:text-4xl font-bold mb-2">
                    {profile.name}
                  </DialogTitle>
                  <Badge variant="secondary" className="text-base px-3 py-1 mb-3">
                    {profile.profession}
                  </Badge>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span className="text-muted-foreground">Born:</span>
                      <span className="font-semibold">{formatDate(profile.dateOfBirth)}</span>
                    </div>
                    {profile.placeOfBirth && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-primary" />
                        <span className="text-muted-foreground">Place:</span>
                        <span className="font-semibold">{profile.placeOfBirth}</span>
                      </div>
                    )}
                    {profile.zodiacSign && (
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-primary" />
                        <span className="text-muted-foreground">Zodiac:</span>
                        <span className="font-semibold">{profile.zodiacSign}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </DialogHeader>

            <section>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-primary" />
                Real-Time Age & Birthday Countdown
              </h2>
              <Card>
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary">{liveAge.years}</div>
                      <div className="text-sm text-muted-foreground">Years</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary">{liveAge.months}</div>
                      <div className="text-sm text-muted-foreground">Months</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary">{liveAge.days}</div>
                      <div className="text-sm text-muted-foreground">Days</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary">{liveAge.hours}</div>
                      <div className="text-sm text-muted-foreground">Hours</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary">{liveAge.minutes}</div>
                      <div className="text-sm text-muted-foreground">Minutes</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary">{liveAge.seconds}</div>
                      <div className="text-sm text-muted-foreground">Seconds</div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="font-semibold mb-2 text-center">Next Birthday Countdown</h3>
                    <div className="flex justify-center gap-6 text-center">
                      <div>
                        <div className="text-2xl font-bold text-primary">{nextBirthday.days}</div>
                        <div className="text-xs text-muted-foreground">Days</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-primary">{nextBirthday.hours}</div>
                        <div className="text-xs text-muted-foreground">Hours</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-primary">{nextBirthday.minutes}</div>
                        <div className="text-xs text-muted-foreground">Minutes</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Ad placeholder for in-profile ad */}
            {/* <div id="ad-in-profile" className="my-6">
              <AdSenseBanner format="large-horizontal" />
            </div> */}

            <section>
              <h2 className="text-2xl font-bold mb-4">Biography</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                {profile.biography.split('\n\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </section>

            {profile.knownFor && profile.knownFor.length > 0 && (
              <section>
                <h3 className="text-xl font-bold mb-3">Known For</h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  {profile.knownFor.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </section>
            )}

            {profile.careerHighlights && profile.careerHighlights.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-primary" />
                  Career Highlights & Awards
                </h2>
                <ul className="space-y-2">
                  {profile.careerHighlights.map((highlight, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Trophy className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{highlight}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </article>
        ) : (
          <div className="py-16 text-center">
            <p className="text-lg text-muted-foreground">Failed to load profile</p>
          </div>
        )}
        </DialogContent>
      </Dialog>
    </>
  );
};
