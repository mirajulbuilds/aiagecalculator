import { useEffect, useState } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { differenceInYears, differenceInMonths, differenceInDays, differenceInHours, differenceInMinutes, format } from "date-fns";
import { ArrowLeft, Users, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

interface FamousPerson {
  id: string;
  name: string;
  dateOfBirth: string;
  profession: string;
  bio: string | null;
  photoUrl: string | null;
  quote: string | null;
  nationality: string | null;
}

const CelebrityProfile = () => {
  const { id } = useParams();
  const location = useLocation();
  const [person, setPerson] = useState<FamousPerson | null>(location.state?.celebrity || null);
  const [loading, setLoading] = useState(!location.state?.celebrity);

  useEffect(() => {
    if (!person && id) {
      // If no data passed via state, we could fetch from API here
      // For now, redirect back to celebrities list
      toast.error("Celebrity data not found");
    }
  }, [id, person]);

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
      totalSeconds 
    };
  };

  // Live update every second
  useEffect(() => {
    if (!person) return;
    
    const interval = setInterval(() => {
      setPerson(prev => prev ? { ...prev } : null);
    }, 1000);

    return () => clearInterval(interval);
  }, [person]);

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

  if (!person) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Celebrity not found</p>
          <Link to="/celebrities">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Celebrities
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const ageDetails = calculateDetailedAge(person.dateOfBirth);

  return (
    <main className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Back Button */}
        <div className="mb-6">
          <Link to="/celebrities">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to All Celebrities
            </Button>
          </Link>
        </div>

        {/* Profile Header Card */}
        <Card className="mb-8 bg-gradient-to-br from-card via-card to-accent/20">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              {/* Large Profile Image */}
              <Avatar className="w-40 h-40 border-4 border-primary/20">
                <AvatarImage src={person.photoUrl || undefined} alt={person.name} />
                <AvatarFallback className="bg-gradient-primary text-primary-foreground text-4xl">
                  <Users className="w-20 h-20" />
                </AvatarFallback>
              </Avatar>

              {/* Profile Details */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-3">
                  {person.name}
                </h1>
                
                <p className="text-lg text-muted-foreground mb-4">
                  {person.bio || 'Notable personality'}
                </p>

                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  <Badge variant="secondary" className="text-sm px-3 py-1">
                    {person.profession}
                  </Badge>
                  {person.nationality && (
                    <Badge variant="outline" className="text-sm px-3 py-1">
                      {person.nationality}
                    </Badge>
                  )}
                  {person.quote && (
                    <div className="w-full mt-4 p-4 bg-muted/50 rounded-lg border-l-2 border-primary">
                      <p className="text-sm italic text-muted-foreground">
                        "{person.quote}"
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Age Section */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <CalendarIcon className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">Current Age</h2>
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

        {/* Birthday Details and Time Lived */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Birthday Details */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <CalendarIcon className="w-5 h-5 text-primary" />
                <h3 className="text-xl font-bold text-foreground">Birthday Details</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Date of Birth:</span>
                  <span className="text-sm font-semibold text-foreground">
                    {format(new Date(person.dateOfBirth), "EEEE, MMMM d, yyyy")}
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Age in Days:</span>
                  <span className="text-sm font-semibold text-foreground">
                    {ageDetails.totalDays.toLocaleString()}
                  </span>
                </div>
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
      </div>
    </main>
  );
};

export default CelebrityProfile;
