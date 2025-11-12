import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Star, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { CelebrityCard } from "@/components/CelebrityCard";

interface Celebrity {
  id: string;
  name: string;
  profile_slug: string;
  profession: string;
  date_of_birth: string;
  profile_image_url: string;
  popularity_ranks: any;
  zodiac_sign: string;
}

const ZodiacPage = () => {
  const { signName } = useParams<{ signName: string }>();
  const [celebrities, setCelebrities] = useState<Celebrity[]>([]);
  const [loading, setLoading] = useState(true);

  const capitalizeSign = (name: string) => {
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  };

  useEffect(() => {
    if (signName) {
      loadCelebrities();
    }
  }, [signName]);

  const loadCelebrities = async () => {
    if (!signName) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("celebrities")
        .select("*")
        .ilike("zodiac_sign", capitalizeSign(signName))
        .order("popularity_ranks->most_popular", { ascending: true });

      if (error) {
        console.error("Error fetching celebrities:", error);
      } else {
        setCelebrities(data || []);
      }
    } catch (error) {
      console.error("Error loading celebrities:", error);
    } finally {
      setLoading(false);
    }
  };


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
        <title>{capitalizeSign(signName || "")} Celebrities - Famous Birthdays</title>
        <meta
          name="description"
          content={`Discover famous ${capitalizeSign(signName || "")} celebrities, their ages, birthdays, and personality traits. Browse our complete list of ${capitalizeSign(signName || "")} stars.`}
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
              <Star className="w-8 h-8 text-primary" />
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                {capitalizeSign(signName || "")} Celebrities
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
              <Star className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h2 className="text-2xl font-bold text-foreground mb-2">
                No celebrities found
              </h2>
              <p className="text-muted-foreground mb-6">
                We couldn't find any {capitalizeSign(signName || "")} celebrities in our database.
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

export default ZodiacPage;
