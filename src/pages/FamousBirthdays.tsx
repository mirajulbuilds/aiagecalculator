import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { SEOHead } from "@/components/SEOHead";
import { Search, Calendar, Star, TrendingUp, Cake, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AdSenseBanner } from "@/components/AdSenseBanner";
import PageTransition from "@/components/PageTransition";
import { CelebrityCard } from "@/components/CelebrityCard";
import ScrollFadeIn from "@/components/ScrollFadeIn";
import ParallaxSection from "@/components/ParallaxSection";
import { useRenderState } from "@/lib/renderState";

interface Celebrity {
  id: string;
  name: string;
  profile_slug: string;
  profession: string;
  date_of_birth: string;
  profile_image_url: string;
  popularity_ranks: any;
}

const STATIC_PROFESSIONS = [
  { name: "Actor", slug: "actor" },
  { name: "Musician", slug: "musician" },
  { name: "TikTok Star", slug: "tiktok-star" },
  { name: "YouTube Star", slug: "youtube-star" },
  { name: "Model", slug: "model" },
  { name: "Athlete", slug: "athlete" },
  { name: "Entrepreneur", slug: "entrepreneur" },
  { name: "Director", slug: "director" },
  { name: "Writer", slug: "writer" },
  { name: "Politician", slug: "politician" },
  { name: "Scientist", slug: "scientist" },
  { name: "TV Host", slug: "tv-host" },
];

const FamousBirthdays = () => {
  const navigate = useNavigate();
  const [trendingCelebrities, setTrendingCelebrities] = useState<Celebrity[]>([]);
  const [bornToday, setBornToday] = useState<Celebrity[]>([]);
  const [bornTomorrow, setBornTomorrow] = useState<Celebrity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  useRenderState(loading);

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
// ৫ মিনিটের ক্যাশ — একই সেশনে বারবার হিট করবে না
    const cached = sessionStorage.getItem("fb_cache");
    if (cached) {
      try {
        const c = JSON.parse(cached);
        if (Date.now() - c.t < 5 * 60 * 1000 && c.day === new Date().getDate()) {
          setTrendingCelebrities(c.trending || []);
          setBornToday(c.today || []);
          setBornTomorrow(c.tomorrow || []);
          setLoading(false);
          return;
        }
      } catch {}
    }

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
      .select("name,profession,profile_slug,profile_image_url,date_of_birth,zodiac_sign,popularity_ranks")

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
      sessionStorage.setItem("fb_cache", JSON.stringify({
        t: Date.now(), day: new Date().getDate(),
        trending: trending || [], today: todayData || [], tomorrow: tomorrowData || [],
      }));
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
          <ParallaxSection speed={0.3}>
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
                      className="!pl-12 pr-4 py-6 text-lg"
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
          </ParallaxSection>
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
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6 lg:gap-6">
                {trendingCelebrities.map((celebrity, index) => (
                  <ScrollFadeIn key={celebrity.id} delay={index * 100}>
                    <CelebrityCard celebrity={celebrity} />
                  </ScrollFadeIn>
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
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6 lg:gap-6">
                {bornToday.map((celebrity, index) => (
                  <ScrollFadeIn key={celebrity.id} delay={index * 100}>
                    <CelebrityCard celebrity={celebrity} />
                  </ScrollFadeIn>
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
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6 lg:gap-6">
                {bornTomorrow.map((celebrity, index) => (
                  <ScrollFadeIn key={celebrity.id} delay={index * 100}>
                    <CelebrityCard celebrity={celebrity} />
                  </ScrollFadeIn>
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

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {STATIC_PROFESSIONS.map((profession, index) => (
                <ScrollFadeIn key={profession.slug} delay={index * 80}>
                  <Link
                    to={`/profession/${profession.slug}`}
                    className="group bg-card rounded-xl shadow-card p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border border-border interactive-element text-center block"
                  >
                    <h3 className="font-bold text-foreground text-lg group-hover:text-primary transition-colors">
                      {profession.name}
                    </h3>
                  </Link>
                </ScrollFadeIn>
              ))}
            </div>
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
