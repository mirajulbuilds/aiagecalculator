import { useState, useEffect } from "react";
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
  id: string;
  name: string;
  date_of_birth: string;
  bio: string;
  photo_url: string | null;
  nationality: string | null;
  occupation: string | null;
  category_id: string | null;
  categories?: {
    name: string;
  };
}

interface FamousBirthdayMatchesProps {
  birthMonth: number;
  birthDay: number;
}

const FamousBirthdayMatches = ({ birthMonth, birthDay }: FamousBirthdayMatchesProps) => {
  const [globalPeople, setGlobalPeople] = useState<FamousPerson[]>([]);
  const [regionalPeople, setRegionalPeople] = useState<FamousPerson[]>([]);
  const [userRegion, setUserRegion] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    detectUserRegion();
  }, []);

  useEffect(() => {
    if (birthMonth && birthDay) {
      fetchFamousPeople();
    }
  }, [birthMonth, birthDay, userRegion]);

  const detectUserRegion = async () => {
    try {
      // Try to get user's country from IP using a free geolocation service
      const response = await fetch('https://ipapi.co/json/');
      if (response.ok) {
        const data = await response.json();
        setUserRegion(data.country_name || null);
      }
    } catch (error) {
      console.error('Error detecting region:', error);
      // Fallback to browser language/region
      const browserLanguage = navigator.language;
      if (browserLanguage.includes('-')) {
        const region = browserLanguage.split('-')[1];
        setUserRegion(region);
      }
    }
  };

  const fetchFamousPeople = async () => {
    try {
      setLoading(true);
      
      // Fetch all people born on this date
      const { data, error } = await supabase
        .from('famous_people')
        .select(`
          *,
          categories (
            name
          )
        `)
        .not('date_of_birth', 'is', null)
        .order('name');

      if (error) throw error;

      // Filter people born on the same month and day
      const matchingPeople = (data || []).filter((person) => {
        const birthDate = new Date(person.date_of_birth);
        return birthDate.getMonth() + 1 === birthMonth && birthDate.getDate() === birthDay;
      });

      // Sort by age (older first)
      matchingPeople.sort((a, b) => {
        const ageA = differenceInYears(new Date(), new Date(a.date_of_birth));
        const ageB = differenceInYears(new Date(), new Date(b.date_of_birth));
        return ageB - ageA;
      });

      // Set global people (top 5)
      setGlobalPeople(matchingPeople.slice(0, 5));

      // Filter regional people based on user's region
      if (userRegion) {
        const regional = matchingPeople.filter((person) => 
          person.nationality?.toLowerCase().includes(userRegion.toLowerCase()) ||
          person.nationality === userRegion
        );
        setRegionalPeople(regional.slice(0, 5));
      } else {
        setRegionalPeople([]);
      }
    } catch (error) {
      console.error('Error fetching famous people:', error);
      toast.error('Failed to load birthday matches');
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (dateOfBirth: string) => {
    return differenceInYears(new Date(), new Date(dateOfBirth));
  };

  const PersonCard = ({ person }: { person: FamousPerson }) => {
    const age = calculateAge(person.date_of_birth);
    const avatarUrl = getCelebrityPhoto(person.name) || 
      `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name)}&size=256&background=random&bold=true`;

    return (
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        <CardHeader className="pb-3">
          <div className="flex items-start gap-4">
            <Avatar className="w-16 h-16 border-2 border-primary/20">
              <AvatarImage 
                src={avatarUrl}
                alt={`${person.name} - ${person.occupation || person.categories?.name || 'Famous Person'}`}
                className="object-cover"
              />
              <AvatarFallback className="text-lg font-bold bg-gradient-to-br from-primary/30 to-primary/10">
                {person.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg mb-1 truncate">{person.name}</CardTitle>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {person.occupation && (
                  <Badge variant="default" className="text-xs">
                    {person.occupation}
                  </Badge>
                )}
                {person.categories?.name && (
                  <Badge variant="secondary" className="text-xs">
                    {person.categories.name}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="w-3 h-3" />
                <span>Born in {format(new Date(person.date_of_birth), 'yyyy')}</span>
                <span>•</span>
                <span>{age} years old</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <CardDescription className="line-clamp-2 text-sm mb-3">
            {person.bio}
          </CardDescription>
          <Link to={`/famous-people/${person.id}`}>
            <Button variant="outline" size="sm" className="w-full gap-2">
              <Users className="w-3.5 h-3.5" />
              View Profile
            </Button>
          </Link>
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
              {regionalPeople.map((person) => (
                <PersonCard key={person.id} person={person} />
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
            {globalPeople.map((person) => (
              <PersonCard key={person.id} person={person} />
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
