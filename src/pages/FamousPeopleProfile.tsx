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
import { Sparkles } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { getCelebrityPhoto } from "@/lib/famous-people-photos";

interface FamousPerson {
  id: string;
  name: string;
  date_of_birth: string;
  bio: string;
  photo_url: string | null;
  category_id: string | null;
  birth_place?: string | null;
  nationality?: string | null;
  occupation?: string | null;
  notable_works?: string | null;
  achievements?: string | null;
  awards?: string | null;
  death_date?: string | null;
  fun_facts?: string | null;
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

  // Generate consistent avatar URL using imported photos or UI Avatars fallback
  const avatarUrl = getCelebrityPhoto(person.name) || `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name)}&size=512&background=random&bold=true`;
  
  const pageTitle = `${person.name} Age, Birthday & Biography - AI Age Calculator`;
  const pageDescription = `${person.name} is ${liveAge.years} years old. Born on ${format(new Date(person.date_of_birth), 'MMMM d, yyyy')}${person.birth_place ? ` in ${person.birth_place}` : ''}. ${person.bio.slice(0, 150)}...`;

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:image" content={avatarUrl} />
        <meta property="og:type" content="profile" />
        <meta property="og:url" content={`https://aiagecalculator.lovable.app/famous-people/${person.id}`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={avatarUrl} />
        <link rel="canonical" href={`https://aiagecalculator.lovable.app/famous-people/${person.id}`} />
      </Helmet>
      
      <main className="min-h-screen bg-background py-8">
        {/* Structured Data for SEO */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Person",
            "name": person.name,
            "birthDate": person.date_of_birth,
            "deathDate": person.death_date || undefined,
            "birthPlace": person.birth_place || undefined,
            "nationality": person.nationality || undefined,
            "description": person.bio,
            "image": avatarUrl,
            "jobTitle": person.occupation || person.categories?.name,
            "award": person.awards || undefined,
            "knowsAbout": person.notable_works || undefined,
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
        <Card className="mb-6 overflow-hidden">
          <CardContent className="pt-8">
            <div className="flex flex-col md:flex-row items-start gap-8 mb-6">
              <div className="relative group">
                <Avatar className="w-32 h-32 md:w-40 md:h-40 border-4 border-primary/20 shadow-lg transition-transform group-hover:scale-105">
                  <AvatarImage 
                    src={avatarUrl} 
                    alt={`${person.name} - ${person.occupation || person.categories?.name || 'Famous Person'}`} 
                    className="object-cover"
                  />
                  <AvatarFallback className="text-5xl font-bold bg-gradient-to-br from-primary/30 to-primary/10">
                    {person.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
              </div>
              
              <div className="flex-1 space-y-4">
                <div>
                  <h1 className="text-3xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-3">
                    {person.name}
                  </h1>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {person.occupation && (
                      <Badge variant="default" className="text-sm px-3 py-1">
                        {person.occupation}
                      </Badge>
                    )}
                    {person.categories?.name && (
                      <Badge variant="secondary" className="text-sm px-3 py-1">
                        {person.categories.name}
                      </Badge>
                    )}
                    {person.nationality && (
                      <Badge variant="outline" className="text-sm px-3 py-1">
                        {person.nationality}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mb-4">
                    {person.birth_place && (
                      <div className="flex items-start gap-2">
                        <span className="text-muted-foreground font-medium">Born:</span>
                        <span className="text-foreground">
                          {format(new Date(person.date_of_birth), 'MMMM d, yyyy')} in {person.birth_place}
                        </span>
                      </div>
                    )}
                    {person.death_date && (
                      <div className="flex items-start gap-2">
                        <span className="text-muted-foreground font-medium">Died:</span>
                        <span className="text-foreground">
                          {format(new Date(person.death_date), 'MMMM d, yyyy')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-muted-foreground leading-relaxed text-base">
                  {person.bio}
                </p>
              </div>
            </div>
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

        {/* Additional Information Sections */}
        <div className="grid gap-6 mb-6">
          {person.notable_works && (
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Notable Works
                </h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {person.notable_works}
                </p>
              </CardContent>
            </Card>
          )}
          
          {person.achievements && (
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold mb-4">Key Achievements</h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {person.achievements}
                </p>
              </CardContent>
            </Card>
          )}
          
          {person.awards && (
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold mb-4">Awards & Recognition</h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {person.awards}
                </p>
              </CardContent>
            </Card>
          )}
          
          {person.fun_facts && (
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold mb-4">Interesting Facts</h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {person.fun_facts}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

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
                {person.birth_place && (
                  <>
                    <Separator />
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Place of Birth:</div>
                      <div className="text-lg font-medium">{person.birth_place}</div>
                    </div>
                  </>
                )}
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
                <Separator />
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Total Seconds:</div>
                  <div className="text-lg font-medium">
                    {(liveAge.totalMinutes * 60).toLocaleString()}
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
    </>
  );
};

export default FamousPeopleProfile;
