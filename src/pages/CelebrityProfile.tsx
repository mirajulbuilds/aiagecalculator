import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { differenceInYears, differenceInMonths, differenceInDays, format } from "date-fns";
import { ArrowLeft, Calendar, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Category {
  id: string;
  name: string;
}

interface FamousPerson {
  id: string;
  name: string;
  date_of_birth: string;
  bio: string | null;
  photo_url: string | null;
  category_id: string | null;
  categories: Category | null;
}

const CelebrityProfile = () => {
  const { id } = useParams<{ id: string }>();
  const [celebrity, setCelebrity] = useState<FamousPerson | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchCelebrity();
    }
  }, [id]);

  const fetchCelebrity = async () => {
    try {
      const { data, error } = await supabase
        .from("famous_people")
        .select(`
          *,
          categories (
            id,
            name
          )
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      setCelebrity(data);
    } catch (error) {
      console.error("Error fetching celebrity:", error);
      toast.error("Failed to load celebrity profile");
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

    const totalDays = differenceInDays(now, birthDate);

    return { years, months, days, totalDays };
  };

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

  const age = calculateDetailedAge(celebrity.date_of_birth);

  return (
    <main className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Back Button */}
        <Link to="/celebrities" className="inline-block mb-6">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Celebrities
          </Button>
        </Link>

        {/* Profile Header */}
        <div className="bg-card rounded-2xl shadow-card p-6 md:p-8 mb-6">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Profile Image */}
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden flex-shrink-0 bg-muted mx-auto md:mx-0">
              {celebrity.photo_url ? (
                <img
                  src={celebrity.photo_url}
                  alt={celebrity.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Users className="w-20 h-20 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Basic Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                {celebrity.name}
              </h1>
              
              {celebrity.categories && (
                <Badge variant="secondary" className="mb-4">
                  {celebrity.categories.name}
                </Badge>
              )}

              <div className="flex items-center justify-center md:justify-start gap-2 text-muted-foreground mb-4">
                <Calendar className="w-5 h-5" />
                <span>Born: {format(new Date(celebrity.date_of_birth), "MMMM d, yyyy")}</span>
              </div>

              {celebrity.bio && (
                <p className="text-foreground leading-relaxed">
                  {celebrity.bio}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Age Display */}
        <div className="bg-gradient-to-br from-primary/10 via-accent/20 to-primary/5 rounded-2xl shadow-card p-6 md:p-8 mb-6 border border-primary/20">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Calendar className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">Current Age</h2>
          </div>

          <div className="grid grid-cols-3 gap-4 md:gap-6">
            <div className="text-center">
              <div className="text-5xl md:text-6xl font-bold text-primary mb-2">
                {age.years}
              </div>
              <div className="text-sm md:text-base text-muted-foreground">
                Years
              </div>
            </div>
            <div className="text-center">
              <div className="text-5xl md:text-6xl font-bold text-primary mb-2">
                {age.months}
              </div>
              <div className="text-sm md:text-base text-muted-foreground">
                Months
              </div>
            </div>
            <div className="text-center">
              <div className="text-5xl md:text-6xl font-bold text-primary mb-2">
                {age.days}
              </div>
              <div className="text-sm md:text-base text-muted-foreground">
                Days
              </div>
            </div>
          </div>
        </div>

        {/* Total Days */}
        <div className="bg-card rounded-2xl shadow-card p-6 md:p-8">
          <h2 className="text-xl font-bold text-foreground mb-4 text-center">
            Total Days Lived
          </h2>
          <div className="bg-accent/20 rounded-xl p-6 text-center">
            <div className="text-5xl md:text-6xl font-bold text-primary mb-2">
              {age.totalDays.toLocaleString()}
            </div>
            <div className="text-muted-foreground">Days</div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default CelebrityProfile;
