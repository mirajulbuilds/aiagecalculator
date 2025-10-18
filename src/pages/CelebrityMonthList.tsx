import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { differenceInYears } from "date-fns";

interface Celebrity {
  name: string;
  dateOfBirth: string;
  profession: string;
  description: string;
}

const CelebrityMonthList = () => {
  const { month } = useParams();
  const navigate = useNavigate();
  const [celebrities, setCelebrities] = useState<Celebrity[]>([]);
  const [loading, setLoading] = useState(true);

  const monthName = month?.charAt(0).toUpperCase() + month?.slice(1) || '';

  useEffect(() => {
    loadCelebrities();
  }, [month]);

  const loadCelebrities = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('celebrity-data', {
        body: { type: 'month', month: monthName }
      });

      if (error) throw error;

      setCelebrities(data.data || []);
    } catch (error) {
      console.error('Error loading celebrities:', error);
      toast.error('Failed to load celebrities');
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (dateOfBirth: string) => {
    return differenceInYears(new Date(), new Date(dateOfBirth));
  };

  return (
    <>
      <Helmet>
        <title>Famous Birthdays in {monthName} - Celebrity Ages | AiAgeCalc.com</title>
        <meta 
          name="description" 
          content={`Discover celebrities born in ${monthName}. Find out the ages and birthdays of famous people born this month.`}
        />
      </Helmet>

      <main className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="mb-8">
            <Link to="/famous-birthdays">
              <Button variant="ghost" size="sm" className="gap-2 mb-4">
                <ArrowLeft className="w-4 h-4" />
                Back to Famous Birthdays
              </Button>
            </Link>

            <div className="flex items-center gap-3">
              <Calendar className="w-10 h-10 text-primary" />
              <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Born in {monthName}
              </h1>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(15)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 rounded-full bg-muted" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-3/4" />
                        <div className="h-3 bg-muted rounded w-1/2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {celebrities.map((celebrity, index) => {
                const age = calculateAge(celebrity.dateOfBirth);
                return (
                  <Card 
                    key={index}
                    className="hover:shadow-lg transition-shadow cursor-pointer group"
                    onClick={() => navigate(`/celebrity/${celebrity.name.toLowerCase().replace(/\s+/g, '-')}`, {
                      state: { 
                        celebrityData: {
                          fullName: celebrity.name,
                          dateOfBirth: celebrity.dateOfBirth,
                          profession: celebrity.profession,
                          biography: celebrity.description
                        }
                      }
                    })}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <Avatar className="w-20 h-20 border-2 border-primary/20 group-hover:border-primary transition-colors">
                          <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(celebrity.name)}&size=128&background=random`} />
                          <AvatarFallback className="bg-gradient-primary text-primary-foreground text-lg">
                            {celebrity.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-lg text-foreground mb-1 group-hover:text-primary transition-colors">
                            {celebrity.name}
                          </h3>
                          <Badge variant="secondary" className="mb-2">
                            {celebrity.profession}
                          </Badge>
                          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                            {celebrity.description}
                          </p>
                          <p className="text-sm text-primary font-semibold">
                            Age: {age}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default CelebrityMonthList;
