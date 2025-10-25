import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Search, Calendar, TrendingUp, Users, Music, Trophy, Microscope, Cake, Palette, Cpu, Globe2, Video, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { differenceInYears } from "date-fns";
import { AdSenseBanner } from "@/components/AdSenseBanner";
import { featuredCelebrities } from "@/data/celebrities";

const FamousBirthdays: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
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
            "name": "Trending Celebrities",
            "description": "Most popular celebrities and their profiles",
            "numberOfItems": featuredCelebrities.length,
            "itemListElement": featuredCelebrities.map((celebrity, index) => ({
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
          <div className="container mx-auto max-w-4xl">
            <Link to="/">
              <Button variant="ghost" className="mb-6 hover:bg-primary/10">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <div className="text-center">
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
                />
                <Button 
                  type="submit" 
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                >
                  Search
                </Button>
              </div>
            </form>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-12 max-w-7xl">
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="w-8 h-8 text-primary" />
              <h2 className="text-3xl font-bold text-foreground">Trending Celebrities This Week</h2>
            </div>

            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredCelebrities.slice(0, 8).map((celebrity) => {
                const age = calculateAge(celebrity.dateOfBirth);
                return (
                  <li key={celebrity.id}>
                    <Link to={`/famous-birthdays/${celebrity.slug}`}>
                      <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group hover:-translate-y-1 h-full bg-gradient-to-br from-card via-card to-accent/5">
                        <CardContent className="p-0">
                          <div className="relative h-48 overflow-hidden bg-gradient-to-br from-primary/10 to-accent/10">
                            <img 
                              src={celebrity.photoUrl} 
                              alt={celebrity.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent"></div>
                          </div>
                          <div className="p-6 text-center">
                            <h3 className="font-bold text-xl text-foreground mb-2 group-hover:text-primary transition-colors">
                              {celebrity.name}
                            </h3>
                            <Badge variant="secondary" className="mb-3 text-sm">
                              {celebrity.profession.split(',')[0]}
                            </Badge>
                            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                              <Cake className="w-4 h-4" />
                              <span>Age {age}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </li>
                );
              })}
            </ul>
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

    </React.Fragment>
  );
};

export default FamousBirthdays;
