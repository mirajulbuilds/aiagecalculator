import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Search, Calendar, TrendingUp, Users, Music, Trophy, Microscope, Cake, Palette, Cpu, Globe2, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { differenceInYears } from "date-fns";
import { CelebrityProfileModal } from "@/components/CelebrityProfileModal";
import { AdSenseBanner } from "@/components/AdSenseBanner";

interface Celebrity {
  name: string;
  dateOfBirth: string;
  profession: string;
}

const FamousBirthdays: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [bornToday, setBornToday] = useState<Celebrity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [selectedCelebrity, setSelectedCelebrity] = useState<Celebrity | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const today = new Date();
  const todayFormatted = today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const month = today.toLocaleDateString('en-US', { month: 'long' });
  const date = today.getDate();

  useEffect(() => {
    loadBornToday();
  }, []);

  const loadBornToday = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('celebrity-data', {
        body: { type: 'bornTodayLite', month, date }
      });

      if (error) throw error;

      setBornToday(data.data || []);
    } catch (error) {
      console.error('Error loading born today:', error);
      toast.error('Failed to load celebrities born today');
    } finally {
      setLoading(false);
    }
  };

  const handleCelebrityClick = (celebrity: Celebrity) => {
    setSelectedCelebrity(celebrity);
    setIsModalOpen(true);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    toast.info('Search feature coming soon!');
  };

  const calculateAge = (dateOfBirth: string) => {
    return differenceInYears(new Date(), new Date(dateOfBirth));
  };

  const categories = [
    { name: 'Actors', icon: Users, color: 'from-purple-500 to-pink-500' },
    { name: 'Musicians', icon: Music, color: 'from-blue-500 to-cyan-500' },
    { name: 'Athletes', icon: Trophy, color: 'from-green-500 to-emerald-500' },
    { name: 'Scientists & Leaders', icon: Microscope, color: 'from-orange-500 to-red-500' },
    { name: 'Tech Innovators', icon: Cpu, color: 'from-indigo-500 to-violet-500' },
    { name: 'Artists & Painters', icon: Palette, color: 'from-rose-500 to-pink-500' },
    { name: 'World Leaders', icon: Globe2, color: 'from-emerald-500 to-teal-500' },
    { name: 'Internet Personalities', icon: Video, color: 'from-cyan-500 to-blue-500' },
    { name: 'Trending', icon: TrendingUp, color: 'from-yellow-500 to-amber-500' },
  ];

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <React.Fragment>
      <Helmet>
        <title>Famous Birthdays - Celebrity Ages & Birthday Calendar | AiAgeCalc.com</title>
        <meta 
          name="description" 
          content="Discover celebrity ages, birthdays, and profiles. Find out how old your favorite actors, musicians, athletes, and famous personalities are today." 
        />
        <meta name="keywords" content="celebrity ages, famous birthdays, celebrity birthdays, how old is, celebrity profiles, actors ages, musicians birthdays, famous people born today, celebrity age calculator" />
        <link rel="canonical" href="https://aiagecalc.com/famous-birthdays" />
        <meta property="og:title" content="Famous Birthdays - Celebrity Ages & Birthday Calendar" />
        <meta property="og:description" content="Discover celebrity ages, birthdays, and profiles. Find out how old your favorite actors, musicians, athletes, and famous personalities are today." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://aiagecalc.com/famous-birthdays" />

        {/* Structured Data - CollectionPage */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "Famous Birthdays - Celebrity Directory",
            "description": "Comprehensive celebrity birthday database with ages, profiles, and birth dates of famous people including actors, musicians, athletes, scientists, and world leaders.",
            "url": "https://aiagecalc.com/famous-birthdays",
            "mainEntity": {
              "@type": "ItemList",
              "name": `Celebrities Born on ${todayFormatted}`,
              "description": `Famous people celebrating their birthday on ${todayFormatted}`,
              "numberOfItems": bornToday.length,
              "itemListElement": bornToday.slice(0, 10).map((celebrity, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "item": {
                  "@type": "Person",
                  "name": celebrity.name,
                  "birthDate": celebrity.dateOfBirth,
                  "jobTitle": celebrity.profession,
                  "description": `${celebrity.name} - ${celebrity.profession}, age ${calculateAge(celebrity.dateOfBirth)}`,
                }
              }))
            },
            "breadcrumb": {
              "@type": "BreadcrumbList",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "Home",
                  "item": "https://aiagecalc.com/"
                },
                {
                  "@type": "ListItem",
                  "position": 2,
                  "name": "Famous Birthdays",
                  "item": "https://aiagecalc.com/famous-birthdays"
                }
              ]
            }
          })}
        </script>

        {/* Structured Data - WebSite with SearchAction */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "Famous Birthdays - Celebrity Database",
            "url": "https://aiagecalc.com/famous-birthdays",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://aiagecalc.com/famous-birthdays?search={search_term_string}",
              "query-input": "required name=search_term_string"
            }
          })}
        </script>
      </Helmet>

      <main className="min-h-screen bg-background">
        <section className="bg-gradient-to-br from-primary/10 via-accent/5 to-background py-16 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Cake className="w-12 h-12 text-primary" />
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Famous Birthdays
              </h1>
            </div>
            <p className="text-lg text-muted-foreground mb-8">
              Discover celebrity ages, birthdays, and fascinating profiles
            </p>

            <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search for a celebrity..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-32 py-6 text-lg bg-background/80 backdrop-blur"
                  disabled={searching}
                />
                <Button 
                  type="submit" 
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  disabled={searching || !searchQuery.trim()}
                >
                  {searching ? 'Searching...' : 'Search'}
                </Button>
              </div>
            </form>
          </div>
        </section>

        <div className="container mx-auto px-4 py-12 max-w-7xl">
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <Calendar className="w-8 h-8 text-primary" />
              <h2 className="text-3xl font-bold text-foreground">
                Born Today: {todayFormatted}
              </h2>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
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
              <>
                <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {bornToday.slice(0, 6).map((celebrity, index) => {
                    const age = calculateAge(celebrity.dateOfBirth);
                    
                    // Insert ad after 5th card
                    const showAd = index === 4;
                    
                    return (
                      <React.Fragment key={index}>
                        <li>
                          <Card 
                            className="hover:shadow-lg transition-all cursor-pointer group hover:scale-105"
                            onClick={() => handleCelebrityClick(celebrity)}
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
                                  <h3 className="font-bold text-lg text-foreground mb-1 group-hover:text-primary transition-colors truncate">
                                    {celebrity.name}
                                  </h3>
                                  <Badge variant="secondary" className="mb-2">
                                    {celebrity.profession}
                                  </Badge>
                                  <p className="text-sm text-primary font-semibold">
                                    Turning {age} today 🎂
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </li>
                        {showAd && (
                          <li id="ad-in-feed" className="md:col-span-1">
                            <AdSenseBanner format="vertical" />
                          </li>
                        )}
                      </React.Fragment>
                    );
                  })}
                </ul>
              </>
            )}
          </section>

          <section className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <Users className="w-8 h-8 text-primary" />
              <h2 className="text-3xl font-bold text-foreground">Browse by Category</h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <Card
                    key={category.name}
                    className="cursor-pointer hover:shadow-lg transition-all hover:scale-105"
                  >
                    <CardContent className="p-6">
                      <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${category.color} flex items-center justify-center mx-auto mb-4`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-center font-semibold text-foreground text-sm">
                        {category.name}
                      </h3>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-6">
              <Calendar className="w-8 h-8 text-primary" />
              <h2 className="text-3xl font-bold text-foreground">Browse by Month</h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {months.map((month) => (
                <Button
                  key={month}
                  variant="outline"
                  className="h-auto py-4 hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  {month}
                </Button>
              ))}
            </div>
          </section>
        </div>
      </main>

      {selectedCelebrity && (
        <CelebrityProfileModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedCelebrity(null);
          }}
          celebrityName={selectedCelebrity.name}
          dateOfBirth={selectedCelebrity.dateOfBirth}
          profession={selectedCelebrity.profession}
        />
      )}
    </React.Fragment>
  );
};

export default FamousBirthdays;
