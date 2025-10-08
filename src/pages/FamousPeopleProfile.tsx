import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { differenceInYears, differenceInMonths, differenceInDays, differenceInHours, differenceInMinutes, differenceInSeconds, format } from "date-fns";
import { AdSenseBanner } from "@/components/AdSenseBanner";

interface FamousPerson {
  id: string;
  name: string;
  date_of_birth: string;
  bio: string;
  photo_url: string | null;
  category_id: string | null;
  categories?: {
    name: string;
  };
}

interface AgeData {
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalDays: number;
  totalHours: number;
  totalMinutes: number;
}

const FamousPeopleProfile = () => {
  const { id } = useParams<{ id: string }>();
  const [person, setPerson] = useState<FamousPerson | null>(null);
  const [liveAge, setLiveAge] = useState<AgeData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchPerson();
    }
  }, [id]);

  useEffect(() => {
    if (!person) return;

    const updateLiveAge = () => {
      const birthDate = new Date(person.date_of_birth);
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
      const seconds = differenceInSeconds(now, afterMinutes);

      const totalDays = differenceInDays(now, birthDate);
      const totalHours = differenceInHours(now, birthDate);
      const totalMinutes = differenceInMinutes(now, birthDate);

      setLiveAge({
        years,
        months,
        days,
        hours,
        minutes,
        seconds,
        totalDays,
        totalHours,
        totalMinutes
      });
    };

    updateLiveAge();
    const interval = setInterval(updateLiveAge, 1000);

    return () => clearInterval(interval);
  }, [person]);

  const fetchPerson = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('famous_people')
        .select(`
          *,
          categories (
            name
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setPerson(data);
    } catch (error) {
      console.error('Error fetching person:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4 max-w-5xl">
          <Skeleton className="h-8 w-32 mb-8" />
          <div className="space-y-6">
            <Card>
              <div className="p-8">
                <div className="flex items-start gap-6 mb-6">
                  <Skeleton className="h-32 w-32 rounded-full" />
                  <div className="flex-1 space-y-3">
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-6 w-1/2" />
                  </div>
                </div>
                <Skeleton className="h-32 w-full" />
              </div>
            </Card>
          </div>
        </div>
      </main>
    );
  }

  if (!person || !liveAge) {
    return (
      <main className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4 max-w-5xl">
          <Link to="/famous-people">
            <Button variant="ghost" size="sm" className="gap-2 mb-8">
              <ArrowLeft className="w-4 h-4" />
              Back to Famous People
            </Button>
          </Link>
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">Person not found</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background py-8">
      {/* Structured Data for SEO */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Person",
          "name": person.name,
          "birthDate": person.date_of_birth,
          "description": person.bio,
          "image": person.photo_url,
          "jobTitle": person.categories?.name,
          "url": `https://aiagecalculator.lovable.app/famous-people/${person.id}`
        })}
      </script>
      
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Back Button */}
        <nav aria-label="Breadcrumb" className="mb-8">
          <Link to="/famous-people">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              Back to Famous People
            </Button>
          </Link>
        </nav>

        {/* Top Ad Banner */}
        <AdSenseBanner format="horizontal" className="mb-6" />

        {/* Profile Header */}
        <Card className="mb-6">
          <CardContent className="pt-8">
            <div className="flex flex-col md:flex-row items-start gap-6 mb-6">
               <Avatar className="w-32 h-32">
                 <AvatarImage src={person.photo_url || undefined} alt={`${person.name} profile photo`} />
                 <AvatarFallback className="text-4xl">
                   {person.name.split(' ').map(n => n[0]).join('')}
                 </AvatarFallback>
               </Avatar>
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
                  {person.name}
                </h1>
                <p className="text-lg text-muted-foreground mb-3">
                  {person.bio.split('.')[0]}
                </p>
                <div className="flex flex-wrap gap-2">
                  {person.categories?.name && (
                    <Badge variant="secondary" className="text-sm">
                      {person.categories.name}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <p className="text-muted-foreground leading-relaxed">
              {person.bio}
            </p>
          </CardContent>
        </Card>

        {/* Mid-Page Ad */}
        <AdSenseBanner format="large-horizontal" className="mb-6" />

        {/* Current Age */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-6 justify-center">
              <Calendar className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">Current Age</h2>
            </div>
            
            {/* Years, Months, Days */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <Card className="bg-primary/10 border-primary/20">
                <CardContent className="pt-6 text-center">
                  <div className="text-5xl font-bold text-primary mb-2">
                    {liveAge.years}
                  </div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Years
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-muted/50">
                <CardContent className="pt-6 text-center">
                  <div className="text-5xl font-bold mb-2">
                    {liveAge.months}
                  </div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Months
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-primary/10 border-primary/20">
                <CardContent className="pt-6 text-center">
                  <div className="text-5xl font-bold text-primary mb-2">
                    {liveAge.days}
                  </div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Days
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Hours, Minutes, Seconds */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="bg-muted/30">
                <CardContent className="pt-4 text-center">
                  <div className="text-3xl font-bold mb-1">
                    {liveAge.hours}
                  </div>
                  <div className="text-xs font-medium text-muted-foreground">
                    Hours
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-muted/30">
                <CardContent className="pt-4 text-center">
                  <div className="text-3xl font-bold mb-1">
                    {liveAge.minutes}
                  </div>
                  <div className="text-xs font-medium text-muted-foreground">
                    Minutes
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-muted/30">
                <CardContent className="pt-4 text-center">
                  <div className="text-3xl font-bold mb-1">
                    {liveAge.seconds}
                  </div>
                  <div className="text-xs font-medium text-muted-foreground">
                    Seconds
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Birthday Details and Time Lived */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-6">
                <Calendar className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold">Birthday Details</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Date of Birth:</div>
                  <div className="text-lg font-medium">
                    {format(new Date(person.date_of_birth), 'EEEE, MMMM d, yyyy')}
                  </div>
                </div>
                <Separator />
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Age in Days:</div>
                  <div className="text-lg font-medium">
                    {liveAge.totalDays.toLocaleString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-6">
                <Clock className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold">Time Lived</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Total Hours:</div>
                  <div className="text-lg font-medium">
                    {liveAge.totalHours.toLocaleString()}
                  </div>
                </div>
                <Separator />
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Total Minutes:</div>
                  <div className="text-lg font-medium">
                    {liveAge.totalMinutes.toLocaleString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Ad Banner */}
        <AdSenseBanner format="horizontal" className="mt-8" />
      </div>
    </main>
  );
};

export default FamousPeopleProfile;
