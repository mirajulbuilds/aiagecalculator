import { useEffect, useState } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { differenceInYears, differenceInMonths, differenceInDays, differenceInHours, differenceInMinutes, format } from "date-fns";
import { ArrowLeft, Calendar as CalendarIcon, Cake, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

interface CelebrityData {
  fullName: string;
  dateOfBirth: string;
  placeOfBirth?: string;
  profession: string;
  zodiacSign?: string;
  biography: string;
  famousWorks?: string[];
}

const CelebrityProfile = () => {
  const { name } = useParams();
  const location = useLocation();
  const [celebrity, setCelebrity] = useState<CelebrityData | null>(location.state?.celebrityData || null);
  const [loading, setLoading] = useState(!location.state?.celebrityData && !location.state?.fromSearch);
  const [liveAge, setLiveAge] = useState<any>(null);

  useEffect(() => {
    if (!celebrity && name && !location.state?.fromSearch) {
      loadCelebrityData();
    }
  }, [name, celebrity]);

  const loadCelebrityData = async () => {
    try {
      setLoading(true);
      const searchName = name?.split('-').join(' ') || '';
      const { data, error } = await supabase.functions.invoke('celebrity-data', {
        body: { type: 'search', query: searchName }
      });

      if (error) throw error;

      setCelebrity(data.data);
    } catch (error) {
      console.error('Error loading celebrity:', error);
      toast.error('Failed to load celebrity data');
    } finally {
      setLoading(false);
    }
  };

  const calculateDetailedAge = (dateOfBirth: string) => {
    const birthDate = new Date(dateOfBirth);
    const now = new Date();

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

    // Calculate next birthday
    const nextBirthday = new Date(now.getFullYear(), birthDate.getMonth(), birthDate.getDate());
    if (nextBirthday < now) {
      nextBirthday.setFullYear(now.getFullYear() + 1);
    }
    const nextBirthdayDays = differenceInDays(nextBirthday, now);
    const nextBirthdayHours = differenceInHours(nextBirthday, now) % 24;
    const nextBirthdayMinutes = differenceInMinutes(nextBirthday, now) % 60;

    return { 
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
      nextBirthdayHours,
      nextBirthdayMinutes
    };
  };

  // Live update every second
  useEffect(() => {
    if (!celebrity) return;
    
    const updateAge = () => {
      setLiveAge(calculateDetailedAge(celebrity.dateOfBirth));
    };
    
    updateAge();
    const interval = setInterval(updateAge, 1000);

    return () => clearInterval(interval);
  }, [celebrity]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!celebrity) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Celebrity not found</p>
          <Link to="/famous-birthdays">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Famous Birthdays
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const ageDetails = liveAge || calculateDetailedAge(celebrity.dateOfBirth);
  const formattedName = celebrity.fullName.toLowerCase().replace(/\s+/g, '-');

  return (
    <>
      <Helmet>
        <title>How Old is {celebrity.fullName}? | Age & Birthday Countdown | AiAgeCalc.com</title>
        <meta 
          name="description" 
          content={`Find out the exact age of ${celebrity.fullName}, born on ${format(new Date(celebrity.dateOfBirth), "MMMM d, yyyy")}. See a live age counter, a countdown to their next birthday, and key facts about their life and career.`}
        />
        <meta name="keywords" content={`${celebrity.fullName} age, ${celebrity.fullName} birthday, how old is ${celebrity.fullName}, ${celebrity.profession}`} />
        <link rel="canonical" href={`https://aiagecalc.com/celebrity/${formattedName}`} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Person",
            "name": celebrity.fullName,
            "birthDate": celebrity.dateOfBirth,
            "jobTitle": celebrity.profession,
            "description": celebrity.biography.substring(0, 150),
            "image": `https://ui-avatars.com/api/?name=${encodeURIComponent(celebrity.fullName)}&size=400&background=random`
          })}
        </script>
      </Helmet>

      <main className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Back Button */}
          <div className="mb-6">
            <Link to="/famous-birthdays">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Famous Birthdays
              </Button>
            </Link>
          </div>

          {/* Profile Header Card */}
          <Card className="mb-8 bg-gradient-to-br from-card via-card to-accent/20">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                {/* Large Profile Image */}
                <Avatar className="w-40 h-40 border-4 border-primary/20">
                  <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(celebrity.fullName)}&size=200&background=random`} alt={celebrity.fullName} />
                  <AvatarFallback className="bg-gradient-primary text-primary-foreground text-4xl">
                    {celebrity.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </AvatarFallback>
                </Avatar>

                {/* Profile Details */}
                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-4xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-3">
                    {celebrity.fullName}
                  </h1>
                  
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-4">
                    <Badge variant="secondary" className="text-sm px-3 py-1">
                      {celebrity.profession}
                    </Badge>
                    {celebrity.zodiacSign && (
                      <Badge variant="outline" className="text-sm px-3 py-1">
                        {celebrity.zodiacSign}
                      </Badge>
                    )}
                  </div>

                  {celebrity.placeOfBirth && (
                    <div className="flex items-center gap-2 justify-center md:justify-start text-muted-foreground mb-4">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">Born in {celebrity.placeOfBirth}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Live Age Counter */}
          <div className="mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Cake className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">Live Age Counter</h2>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-4">
              <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                <CardContent className="p-6 text-center">
                  <div className="text-5xl md:text-6xl font-bold text-primary mb-2">
                    {ageDetails.years}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">Years</div>
                </CardContent>
              </Card>
              
              <Card className="bg-card/50">
                <CardContent className="p-6 text-center">
                  <div className="text-5xl md:text-6xl font-bold text-foreground mb-2">
                    {ageDetails.months}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">Months</div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-accent/30 to-accent/10">
                <CardContent className="p-6 text-center">
                  <div className="text-5xl md:text-6xl font-bold text-primary mb-2">
                    {ageDetails.days}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">Days</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Card className="bg-card/30">
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-foreground mb-1">
                    {ageDetails.hours}
                  </div>
                  <div className="text-xs text-muted-foreground">Hours</div>
                </CardContent>
              </Card>
              
              <Card className="bg-card/30">
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-foreground mb-1">
                    {ageDetails.minutes}
                  </div>
                  <div className="text-xs text-muted-foreground">Minutes</div>
                </CardContent>
              </Card>
              
              <Card className="bg-card/30">
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-foreground mb-1 tabular-nums">
                    {ageDetails.seconds}
                  </div>
                  <div className="text-xs text-muted-foreground">Seconds</div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Next Birthday Countdown */}
          <Card className="mb-8 bg-gradient-to-br from-accent/10 to-accent/5">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <CalendarIcon className="w-5 h-5 text-primary" />
                <h3 className="text-xl font-bold text-foreground">Next Birthday Countdown</h3>
              </div>
              <p className="text-2xl font-semibold text-primary">
                Next birthday in {ageDetails.nextBirthdayDays} Days, {ageDetails.nextBirthdayHours} Hours, {ageDetails.nextBirthdayMinutes} Minutes
              </p>
            </CardContent>
          </Card>

          {/* Detailed Information */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Birthday Details */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CalendarIcon className="w-5 h-5 text-primary" />
                  <h3 className="text-xl font-bold text-foreground">Birthday Details</h3>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-sm text-muted-foreground">Full Name:</span>
                    <span className="text-sm font-semibold text-foreground">
                      {celebrity.fullName}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-sm text-muted-foreground">Date of Birth:</span>
                    <span className="text-sm font-semibold text-foreground">
                      {format(new Date(celebrity.dateOfBirth), "EEEE, MMMM d, yyyy")}
                    </span>
                  </div>

                  {celebrity.placeOfBirth && (
                    <div className="flex justify-between items-center py-2 border-b border-border">
                      <span className="text-sm text-muted-foreground">Place of Birth:</span>
                      <span className="text-sm font-semibold text-foreground">
                        {celebrity.placeOfBirth}
                      </span>
                    </div>
                  )}

                  {celebrity.zodiacSign && (
                    <div className="flex justify-between items-center py-2 border-b border-border">
                      <span className="text-sm text-muted-foreground">Zodiac Sign:</span>
                      <span className="text-sm font-semibold text-foreground">
                        {celebrity.zodiacSign}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Time Lived */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CalendarIcon className="w-5 h-5 text-primary" />
                  <h3 className="text-xl font-bold text-foreground">Time Lived</h3>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-sm text-muted-foreground">Total Days:</span>
                    <span className="text-sm font-semibold text-foreground">
                      {ageDetails.totalDays.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-sm text-muted-foreground">Total Hours:</span>
                    <span className="text-sm font-semibold text-foreground">
                      {ageDetails.totalHours.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-sm text-muted-foreground">Total Minutes:</span>
                    <span className="text-sm font-semibold text-foreground">
                      {ageDetails.totalMinutes.toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Biography */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-foreground mb-4">Biography</h3>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {celebrity.biography}
              </p>
            </CardContent>
          </Card>

          {/* Known For */}
          {celebrity.famousWorks && celebrity.famousWorks.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-foreground mb-4">Known For</h3>
                <ul className="space-y-2">
                  {celebrity.famousWorks.map((work, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span className="text-muted-foreground">{work}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </>
  );
};

export default CelebrityProfile;
