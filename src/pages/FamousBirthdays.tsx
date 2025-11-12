import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Search, Calendar, Star, TrendingUp, Cake, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AdSenseBanner } from "@/components/AdSenseBanner";
import PageTransition from "@/components/PageTransition";

interface Celebrity {
  id: string;
  name: string;
  profile_slug: string;
  profession: string;
  date_of_birth: string;
  profile_image_url: string;
  popularity_ranks: any;
}

const FamousBirthdays = () => {
  const navigate = useNavigate();
  const [trendingCelebrities, setTrendingCelebrities] = useState<Celebrity[]>([]);
  const [bornToday, setBornToday] = useState<Celebrity[]>([]);
  const [bornTomorrow, setBornTomorrow] = useState<Celebrity[]>([]);
  const [professions, setProfessions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  useEffect(() => {
    loadCelebrities();
  }, []);

  const loadCelebrities = async () => {
    setLoading(true);

    // Get visitor's local date
    const today = new Date();
    const localTodayMonth = today.getMonth() + 1;
    const localTodayDay = today.getDate();

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const localTomorrowMonth = tomorrow.getMonth() + 1;
    const localTomorrowDay = tomorrow.getDate();

    try {
      // Fetch trending celebrities (top 12 by popularity)
      const { data: trending, error: trendingError } = await supabase
        .from("celebrities")
        .select("*")
        .not("popularity_ranks", "is", null)
        .order("popularity_ranks->most_popular", { ascending: true })
        .limit(12);

      if (trendingError) {
        console.error("Error fetching trending celebrities:", trendingError);
      } else {
        setTrendingCelebrities(trending || []);
      }

      // Fetch celebrities born today using proper date extraction
      const { data: todayData, error: todayError } = await supabase
        .rpc("get_celebrities_by_birthday", {
          birth_month: localTodayMonth,
          birth_day: localTodayDay,
        });

      if (todayError) {
        console.error("Error fetching today's birthdays:", todayError);
      } else {
        setBornToday(todayData || []);
      }

      // Fetch celebrities born tomorrow using proper date extraction
      const { data: tomorrowData, error: tomorrowError } = await supabase
        .rpc("get_celebrities_by_birthday", {
          birth_month: localTomorrowMonth,
          birth_day: localTomorrowDay,
        });

      if (tomorrowError) {
        console.error("Error fetching tomorrow's birthdays:", tomorrowError);
      } else {
        setBornTomorrow(tomorrowData || []);
      }

      // Fetch unique professions
      const { data: professionsData, error: professionsError } = await supabase
        .from("celebrities")
        .select("profession")
        .order("profession");

      if (professionsError) {
        console.error("Error fetching professions:", professionsError);
      } else {
        // Get unique professions
        const uniqueProfessions = [...new Set(professionsData?.map(c => c.profession) || [])];
        setProfessions(uniqueProfessions);
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
    <PageTransition>
    <>
      <Helmet>
        <title>Famous Birthdays - Discover Celebrity Ages & Birthdays</title>
        <meta
          name="description"
          content="Explore famous birthdays, celebrity ages, and trending stars. Discover who was born today and learn about your favorite celebrities."
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-primary/10 to-background py-12 md:py-16 border-b border-border">
          <div className="container mx-auto px-4 max-w-6xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-center text-foreground mb-6">
              Discover Famous Birthdays
            </h1>
            <p className="text-lg md:text-xl text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
              Explore celebrity ages, birthdays, and fascinating facts about your favorite stars
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search for a celebrity..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-12 pr-4 py-6 text-lg"
                  />
                </div>
                <Button 
                  type="submit" 
                  size="lg" 
                  className="px-8 py-6"
                  disabled={!searchQuery.trim()}
                >
                  Search
                </Button>
              </form>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 max-w-6xl py-12 space-y-16">
          {/* Trending Celebrities Section */}
          <section>
            <div className="flex items-center gap-3 mb-8">
              <TrendingUp className="w-8 h-8 text-primary" />
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Trending Celebrities This Week
              </h2>
            </div>
            
            {trendingCelebrities.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {trendingCelebrities.map((celebrity) => (
                  <CelebrityCard key={celebrity.id} celebrity={celebrity} />
                ))}
              </div>
            ) : (
              <div className="bg-card rounded-2xl shadow-card p-8 text-center">
                <p className="text-muted-foreground">
                  No trending celebrities available yet. Check back soon!
                </p>
              </div>
            )}
          </section>

          {/* AdSense Banner */}
          <div className="my-8">
            <AdSenseBanner format="horizontal" adSlot="leaderboard" />
          </div>

          {/* Today's Birthdays Section */}
          <section>
            <div className="flex items-center gap-3 mb-8">
              <Cake className="w-8 h-8 text-primary" />
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Today's Birthdays
              </h2>
            </div>

            {bornToday.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {bornToday.map((celebrity) => (
                  <CelebrityCard key={celebrity.id} celebrity={celebrity} />
                ))}
              </div>
            ) : (
              <div className="bg-card rounded-2xl shadow-card p-8 text-center">
                <p className="text-muted-foreground">
                  No celebrities found for today. Check back tomorrow!
                </p>
              </div>
            )}
          </section>

          {/* Born Tomorrow Section */}
          <section>
            <div className="flex items-center gap-3 mb-8">
              <Calendar className="w-8 h-8 text-primary" />
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Tomorrow's Birthdays
              </h2>
            </div>

            {bornTomorrow.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {bornTomorrow.map((celebrity) => (
                  <CelebrityCard key={celebrity.id} celebrity={celebrity} />
                ))}
              </div>
            ) : (
              <div className="bg-card rounded-2xl shadow-card p-8 text-center">
                <p className="text-muted-foreground">
                  No celebrities found for tomorrow. Check back later!
                </p>
              </div>
            )}
          </section>

          {/* Browse by Profession */}
          <section>
            <div className="flex items-center gap-3 mb-8">
              <Star className="w-8 h-8 text-primary" />
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Browse by Profession
              </h2>
            </div>

            {professions.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {professions.map((profession) => (
                  <Link
                    key={profession}
                    to={`/profession/${profession.toLowerCase().replace(/\s+/g, "-")}`}
                    className="group bg-card rounded-xl shadow-card p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border border-border interactive-element text-center"
                  >
                    <h3 className="font-bold text-foreground text-lg group-hover:text-primary transition-colors">
                      {profession}
                    </h3>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-card rounded-2xl shadow-card p-8 text-center">
                <p className="text-muted-foreground">
                  Loading professions...
                </p>
              </div>
            )}
          </section>

          {/* Browse by Zodiac Sign */}
          <section>
            <div className="flex items-center gap-3 mb-8">
              <Star className="w-8 h-8 text-primary" />
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Browse by Zodiac Sign
              </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[
                { name: "Aries", symbol: "♈" },
                { name: "Taurus", symbol: "♉" },
                { name: "Gemini", symbol: "♊" },
                { name: "Cancer", symbol: "♋" },
                { name: "Leo", symbol: "♌" },
                { name: "Virgo", symbol: "♍" },
                { name: "Libra", symbol: "♎" },
                { name: "Scorpio", symbol: "♏" },
                { name: "Sagittarius", symbol: "♐" },
                { name: "Capricorn", symbol: "♑" },
                { name: "Aquarius", symbol: "♒" },
                { name: "Pisces", symbol: "♓" }
              ].map((zodiac) => (
                <Link
                  key={zodiac.name}
                  to={`/zodiac/${zodiac.name.toLowerCase()}`}
                  className="group bg-card rounded-xl shadow-card p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border border-border interactive-element text-center"
                >
                  <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">
                    {zodiac.symbol}
                  </div>
                  <h3 className="font-bold text-foreground text-lg group-hover:text-primary transition-colors">
                    {zodiac.name}
                  </h3>
                </Link>
              ))}
            </div>
          </section>

          {/* Browse by Birth Month */}
          <section>
            <div className="flex items-center gap-3 mb-8">
              <Sparkles className="w-8 h-8 text-primary" />
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Browse by Birth Month
              </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[
                "January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
              ].map((month) => (
                <Link
                  key={month}
                  to={`/birth-month/${month.toLowerCase()}`}
                  className="group bg-card rounded-xl shadow-card p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border border-border interactive-element text-center"
                >
                  <h3 className="font-bold text-foreground text-lg group-hover:text-primary transition-colors">
                    {month}
                  </h3>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
    </PageTransition>
  );
};

export default FamousBirthdays;
