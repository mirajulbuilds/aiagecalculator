import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Calendar, Users, Cake } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { differenceInYears, differenceInMonths, differenceInDays, format } from "date-fns";

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

const FamousPeopleProfile = () => {
  const { id } = useParams<{ id: string }>();
  const [person, setPerson] = useState<FamousPerson | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchPerson();
    }
  }, [id]);

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

  const calculateAge = (dateOfBirth: string) => {
    const birthDate = new Date(dateOfBirth);
    const now = new Date();
    
    const years = differenceInYears(now, birthDate);
    const months = differenceInMonths(now, birthDate) % 12;
    const days = differenceInDays(
      now,
      new Date(birthDate.getFullYear() + years, birthDate.getMonth() + months, birthDate.getDate())
    );

    return { years, months, days };
  };

  const getNextBirthday = (dateOfBirth: string) => {
    const birthDate = new Date(dateOfBirth);
    const now = new Date();
    const currentYear = now.getFullYear();
    
    let nextBirthday = new Date(currentYear, birthDate.getMonth(), birthDate.getDate());
    
    if (nextBirthday < now) {
      nextBirthday = new Date(currentYear + 1, birthDate.getMonth(), birthDate.getDate());
    }

    const daysUntil = differenceInDays(nextBirthday, now);
    
    return {
      date: format(nextBirthday, 'MMMM d, yyyy'),
      daysUntil
    };
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <Skeleton className="h-8 w-32 mb-8" />
          <Card className="overflow-hidden">
            <Skeleton className="h-96 w-full" />
            <CardHeader>
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  if (!person) {
    return (
      <main className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <Link to="/famous-people">
            <Button variant="ghost" size="sm" className="gap-2 mb-8">
              <ArrowLeft className="w-4 h-4" />
              Back to Famous People
            </Button>
          </Link>
          <div className="text-center py-12">
            <Users className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-lg text-muted-foreground">Person not found</p>
          </div>
        </div>
      </main>
    );
  }

  const age = calculateAge(person.date_of_birth);
  const nextBirthday = getNextBirthday(person.date_of_birth);

  return (
    <main className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Back Button */}
        <Link to="/famous-people">
          <Button variant="ghost" size="sm" className="gap-2 mb-8">
            <ArrowLeft className="w-4 h-4" />
            Back to Famous People
          </Button>
        </Link>

        {/* Profile Card */}
        <Card className="overflow-hidden">
          {/* Header Image */}
          <div className="relative h-96 bg-muted">
            {person.photo_url ? (
              <img
                src={person.photo_url}
                alt={person.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Users className="w-24 h-24 text-muted-foreground/50" />
              </div>
            )}
          </div>

          <CardHeader className="space-y-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{person.name}</h1>
              {person.categories?.name && (
                <Badge variant="secondary" className="text-base px-3 py-1">
                  {person.categories.name}
                </Badge>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Biography */}
            <div>
              <h2 className="text-xl font-semibold mb-2">Biography</h2>
              <p className="text-muted-foreground leading-relaxed">{person.bio}</p>
            </div>

            <Separator />

            {/* Birthday Info */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Birthday Information</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <Card className="bg-muted/50">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-2">
                      <Calendar className="w-5 h-5 text-primary" />
                      <h3 className="font-medium">Date of Birth</h3>
                    </div>
                    <p className="text-lg">
                      {format(new Date(person.date_of_birth), 'MMMM d, yyyy')}
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-muted/50">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-2">
                      <Cake className="w-5 h-5 text-primary" />
                      <h3 className="font-medium">Next Birthday</h3>
                    </div>
                    <p className="text-lg">{nextBirthday.date}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {nextBirthday.daysUntil === 0 
                        ? "Today! 🎉" 
                        : `In ${nextBirthday.daysUntil} ${nextBirthday.daysUntil === 1 ? 'day' : 'days'}`
                      }
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            <Separator />

            {/* Age Calculation */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Current Age</h2>
              <Card className="bg-gradient-to-br from-primary/10 via-accent/20 to-primary/5 border-primary/20">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                        {age.years}
                      </div>
                      <div className="text-sm font-medium text-muted-foreground">
                        Years
                      </div>
                    </div>
                    <div>
                      <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                        {age.months}
                      </div>
                      <div className="text-sm font-medium text-muted-foreground">
                        Months
                      </div>
                    </div>
                    <div>
                      <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                        {age.days}
                      </div>
                      <div className="text-sm font-medium text-muted-foreground">
                        Days
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default FamousPeopleProfile;
