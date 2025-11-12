import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Calendar, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

interface Celebrity {
  id: string;
  name: string;
  profile_slug: string;
  profession: string;
  date_of_birth: string;
  profile_image_url: string;
  popularity_ranks: any;
}

const BirthMonthPage = () => {
  const { monthName } = useParams<{ monthName: string }>();
  const [celebrities, setCelebrities] = useState<Celebrity[]>([]);
  const [loading, setLoading] = useState(true);

  const monthNameToNumber = (name: string): number => {
    const months: { [key: string]: number } = {
      january: 1, february: 2, march: 3, april: 4,
      may: 5, june: 6, july: 7, august: 8,
      september: 9, october: 10, november: 11, december: 12
    };
    return months[name.toLowerCase()] || 0;
  };

  const capitalizeMonth = (name: string) => {
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  };

  useEffect(() => {
    if (monthName) {
      loadCelebrities();
    }
  }, [monthName]);

  const loadCelebrities = async () => {
    if (!monthName) return;
    
    const monthNumber = monthNameToNumber(monthName);
    if (monthNumber === 0) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .rpc("get_celebrities_by_birthday", {
          birth_month: monthNumber,
          birth_day: 0 // Pass 0 to get all days in the month
        });

      if (error) {
        console.error("Error fetching celebrities:", error);
        // Fallback: fetch all and filter client-side
        const { data: allData, error: allError } = await supabase
          .from("celebrities")
          .select("*")
          .order("popularity_ranks->most_popular", { ascending: true });

        if (allError) {
          console.error("Error in fallback fetch:", allError);
        } else {
          const filtered = (allData || []).filter(celebrity => {
            const date = new Date(celebrity.date_of_birth);
            return date.getMonth() + 1 === monthNumber;
          });
          setCelebrities(filtered);
        }
      } else {
        // Filter for the entire month since RPC might return specific day
        const allCelebrities = await supabase
          .from("celebrities")
          .select("*")
          .order("popularity_ranks->most_popular", { ascending: true });
        
        if (allCelebrities.data) {
          const filtered = allCelebrities.data.filter(celebrity => {
            const date = new Date(celebrity.date_of_birth);
            return date.getMonth() + 1 === monthNumber;
          });
          setCelebrities(filtered);
        }
      }
    } catch (error) {
      console.error("Error loading celebrities:", error);
    } finally {
      setLoading(false);
    }
  };

  const CelebrityCard = ({ celebrity }: { celebrity: Celebrity }) => (
    <Link
      to={`/people/${celebrity.profile_slug}`}
      className="group bg-card rounded-2xl shadow-card overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border border-border interactive-element"
    >
      <div className="aspect-square overflow-hidden">
        <img
          src={celebrity.profile_image_url}
          alt={celebrity.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
      </div>
      <div className="p-4">
        <h3 className="font-bold text-foreground text-lg mb-1 group-hover:text-primary transition-colors">
          {celebrity.name}
        </h3>
        <p className="text-sm text-muted-foreground">{celebrity.profession}</p>
      </div>
    </Link>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading celebrities...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Celebrities Born in {capitalizeMonth(monthName || "")} - Famous Birthdays</title>
        <meta
          name="description"
          content={`Discover celebrities born in ${capitalizeMonth(monthName || "")}. Browse famous birthdays, ages, and fascinating facts about stars born this month.`}
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 max-w-6xl py-8">
          {/* Back Button */}
          <Link to="/famous-birthdays">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Famous Birthdays
            </Button>
          </Link>

          {/* Page Heading */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="w-8 h-8 text-primary" />
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                Celebrities Born in {capitalizeMonth(monthName || "")}
              </h1>
            </div>
            <p className="text-muted-foreground">
              Found {celebrities.length} {celebrities.length === 1 ? 'celebrity' : 'celebrities'}
            </p>
          </div>

          {/* Results Grid */}
          {celebrities.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {celebrities.map((celebrity) => (
                <CelebrityCard key={celebrity.id} celebrity={celebrity} />
              ))}
            </div>
          ) : (
            <div className="bg-card rounded-2xl shadow-card p-12 text-center">
              <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h2 className="text-2xl font-bold text-foreground mb-2">
                No celebrities found
              </h2>
              <p className="text-muted-foreground mb-6">
                We couldn't find any celebrities born in {capitalizeMonth(monthName || "")}.
              </p>
              <Link to="/famous-birthdays">
                <Button>
                  Browse All Celebrities
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default BirthMonthPage;
