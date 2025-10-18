import * as React from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Globe, MapPin, Calendar, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { differenceInYears, format } from "date-fns";
import { getCelebrityPhoto } from "@/lib/famous-people-photos";

interface FamousPerson {
  name: string;
  dateOfBirth: string;
  occupation: string[];
  nationality: string;
  description: string;
  wikipediaUrl?: string;
  imageUrl?: string;
  aiFunFact?: string;
}

interface FamousBirthdayMatchesProps {
  birthMonth: number;
  birthDay: number;
}

const FamousBirthdayMatches = ({ birthMonth, birthDay }: FamousBirthdayMatchesProps) => {
  const [globalPeople, setGlobalPeople] = React.useState<FamousPerson[]>([]);
  const [regionalPeople, setRegionalPeople] = React.useState<FamousPerson[]>([]);
  const [userRegion, setUserRegion] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // Use browser language as fallback region detection (no external API)
    const browserLanguage = navigator.language;
    if (browserLanguage.includes('-')) {
      const region = browserLanguage.split('-')[1];
      setUserRegion(region);
    }
  }, []);

  React.useEffect(() => {
    if (birthMonth && birthDay) {
      fetchFamousPeople();
    }
  }, [birthMonth, birthDay, userRegion]);

  const fetchFamousPeople = async () => {
    try {
      setLoading(true);
      
      // Call edge function to fetch real-time data from Wikidata + AI enhancements
      const { data, error } = await supabase.functions.invoke('fetch-famous-birthdays', {
        body: { 
          birthMonth, 
          birthDay,
          userRegion 
        }
      });

      if (error) throw error;

      setGlobalPeople(data.global || []);
      setRegionalPeople(data.regional || []);
      
      // Show warning only if all sources failed
      if (data.error && data.source === 'all-failed') {
        toast.warning(data.error);
      }
      
      console.log(`Loaded ${data.global?.length || 0} global and ${data.regional?.length || 0} regional celebrities from ${data.source}`);
      
    } catch (error) {
      console.error('Error fetching famous people:', error);
      toast.error('Failed to load birthday matches. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (dateOfBirth: string) => {
    return differenceInYears(new Date(), new Date(dateOfBirth));
  };

  const PersonCard = ({ person }: { person: FamousPerson }) => {
    const age = calculateAge(person.dateOfBirth);
    const avatarUrl = person.imageUrl || getCelebrityPhoto(person.name) || 
      `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name)}&size=256&background=random&bold=true`;

    return (
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        <CardHeader className="pb-3">
          <div className="flex items-start gap-4">
            <Avatar className="w-16 h-16 border-2 border-primary/20">
              <AvatarImage 
                src={avatarUrl}
                alt={`${person.name} - ${person.occupation.join(', ') || 'Famous Person'}`}
                className="object-cover"
              />
              <AvatarFallback className="text-lg font-bold bg-gradient-to-br from-primary/30 to-primary/10">
                {person.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg mb-1 truncate">{person.name}</CardTitle>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {person.occupation.slice(0, 2).map((occ, idx) => (
                  <Badge key={idx} variant="default" className="text-xs">
                    {occ}
                  </Badge>
                ))}
                {person.nationality && (
                  <Badge variant="secondary" className="text-xs">
                    {person.nationality}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="w-3 h-3" />
                <span>Born in {format(new Date(person.dateOfBirth), 'yyyy')}</span>
                <span>•</span>
                <span>{age} years old</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <CardDescription className="line-clamp-2 text-sm mb-3">
            {person.description}
          </CardDescription>
          {person.aiFunFact && (
            <div className="mb-3 p-2 bg-primary/5 rounded-lg border border-primary/10">
              <div className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-xs text-muted-foreground italic">{person.aiFunFact}</p>
              </div>
            </div>
          )}
          {person.wikipediaUrl && (
            <a href={person.wikipediaUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="w-full gap-2">
                <Users className="w-3.5 h-3.5" />
                View Wikipedia Profile
              </Button>
            </a>
          )}
        </CardContent>
      </Card>
    );
  };

  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="pb-3">
            <div className="flex items-start gap-4">
              <Skeleton className="w-16 h-16 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-16 w-full mb-3" />
            <Skeleton className="h-8 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );

  if (loading) {
    return (
      <section className="bg-card rounded-2xl shadow-card p-6 md:p-8 mb-6">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="w-6 h-6 text-primary animate-pulse" />
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              🎂 Famous People Born on This Date
            </h2>
          </div>
          <p className="text-muted-foreground">
            Loading celebrities who share your birthday...
          </p>
        </div>
        <LoadingSkeleton />
      </section>
    );
  }

  if (globalPeople.length === 0) {
    return null; // Don't show section if no matches
  }

  return (
    <section className="bg-card rounded-2xl shadow-card p-6 md:p-8 mb-6">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles className="w-6 h-6 text-primary" />
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            🎂 Famous People Born on {format(new Date(2000, birthMonth - 1, birthDay), 'MMMM d')}
          </h2>
        </div>
        <p className="text-muted-foreground text-lg">
          Discover who shares your birthday!
        </p>
      </div>

      <Tabs defaultValue={regionalPeople.length > 0 ? "regional" : "global"} className="w-full">
        <TabsList className="grid w-full max-w-md mx-auto mb-6" style={{ gridTemplateColumns: regionalPeople.length > 0 ? '1fr 1fr' : '1fr' }}>
          {regionalPeople.length > 0 && (
            <TabsTrigger value="regional" className="gap-2">
              <MapPin className="w-4 h-4" />
              📍 Regional ({regionalPeople.length})
            </TabsTrigger>
          )}
          <TabsTrigger value="global" className="gap-2">
            <Globe className="w-4 h-4" />
            🌍 Global ({globalPeople.length})
          </TabsTrigger>
        </TabsList>

        {regionalPeople.length > 0 && (
          <TabsContent value="regional" className="mt-0">
            <div className="mb-4 text-center">
              <p className="text-sm text-muted-foreground">
                {userRegion ? `Celebrities from ${userRegion}` : 'Regional celebrities'}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {regionalPeople.map((person, index) => (
                <PersonCard key={`regional-${person.name}-${index}`} person={person} />
              ))}
            </div>
          </TabsContent>
        )}

        <TabsContent value="global" className="mt-0">
          <div className="mb-4 text-center">
            <p className="text-sm text-muted-foreground">
              Well-known international figures
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {globalPeople.map((person, index) => (
              <PersonCard key={`global-${person.name}-${index}`} person={person} />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-6 text-center">
        <Link to="/famous-people">
          <Button variant="outline" className="gap-2">
            <Users className="w-4 h-4" />
            Explore All Famous People
          </Button>
        </Link>
      </div>
    </section>
  );
};

export default FamousBirthdayMatches;
