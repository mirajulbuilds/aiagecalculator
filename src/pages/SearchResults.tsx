import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Search, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import PageTransition from "@/components/PageTransition";
import { CelebrityCard } from "@/components/CelebrityCard";

interface Celebrity {
  id: string;
  name: string;
  profile_slug: string;
  profession: string;
  date_of_birth: string;
  profile_image_url: string;
  popularity_ranks: any;
}

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("query") || "";
  const [celebrities, setCelebrities] = useState<Celebrity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (query) {
      searchCelebrities();
    } else {
      setLoading(false);
    }
  }, [query]);

  const searchCelebrities = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("celebrities")
        .select("*")
        .ilike("name", `%${query}%`)
        .order("popularity_ranks->most_popular", { ascending: true })
        .limit(50);

      if (error) {
        console.error("Error searching celebrities:", error);
      } else {
        setCelebrities(data || []);
      }
    } catch (error) {
      console.error("Error loading search results:", error);
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Searching...</p>
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
    <>
      <Helmet>
        <title>{query ? `Search Results for "${query}"` : 'Search'} - Famous Birthdays</title>
        <meta
          name="description"
          content={query ? `Search results for ${query}. Find celebrities, their ages, and birthdays.` : 'Search for celebrities and their birthdays.'}
        />
        {/* Prevent empty search pages from being indexed - fixes soft 404 errors */}
        {!query && <meta name="robots" content="noindex, nofollow" />}
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

          {/* Search Heading */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Search className="w-8 h-8 text-primary" />
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                Search Results for "{query}"
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
              <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h2 className="text-2xl font-bold text-foreground mb-2">
                No celebrities found
              </h2>
              <p className="text-muted-foreground mb-6">
                We couldn't find any celebrities matching "{query}". Try a different search term.
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
    </PageTransition>
  );
};

export default SearchResults;
