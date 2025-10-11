import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Users, Calendar, ArrowLeft, Search, Sparkles, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { differenceInYears, differenceInDays, format } from "date-fns";

import { AdSenseBanner } from "@/components/AdSenseBanner";

interface Category {
  id: string;
  name: string;
}

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

const FamousPeople = () => {
  const [people, setPeople] = useState<FamousPerson[]>([]);
  const [filteredPeople, setFilteredPeople] = useState<FamousPerson[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"name" | "age" | "birthday">("name");

  useEffect(() => {
    fetchCategories();
    fetchPeople();
  }, []);

  useEffect(() => {
    filterPeople();
  }, [people, selectedCategory, searchQuery, sortBy]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    }
  };

  const fetchPeople = async () => {
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
        .order('name');

      if (error) throw error;
      setPeople(data || []);
    } catch (error) {
      console.error('Error fetching famous people:', error);
      toast.error('Failed to load famous people');
    } finally {
      setLoading(false);
    }
  };

  const filterPeople = () => {
    let filtered = people;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category_id === selectedCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.bio.toLowerCase().includes(query) ||
        p.categories?.name.toLowerCase().includes(query)
      );
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      } else if (sortBy === "age") {
        return calculateAge(b.date_of_birth) - calculateAge(a.date_of_birth);
      } else {
        const daysA = getDaysUntilBirthday(a.date_of_birth);
        const daysB = getDaysUntilBirthday(b.date_of_birth);
        return daysA - daysB;
      }
    });

    setFilteredPeople(filtered);
  };

  const calculateAge = (dateOfBirth: string) => {
    return differenceInYears(new Date(), new Date(dateOfBirth));
  };

  const getDaysUntilBirthday = (dateOfBirth: string) => {
    const birthDate = new Date(dateOfBirth);
    const now = new Date();
    const currentYear = now.getFullYear();
    
    let nextBirthday = new Date(currentYear, birthDate.getMonth(), birthDate.getDate());
    
    if (nextBirthday < now) {
      nextBirthday = new Date(currentYear + 1, birthDate.getMonth(), birthDate.getDate());
    }

    return differenceInDays(nextBirthday, now);
  };

  const getNextBirthday = (dateOfBirth: string) => {
    const daysUntil = getDaysUntilBirthday(dateOfBirth);
    
    if (daysUntil === 0) return "Today! 🎉";
    if (daysUntil === 1) return "Tomorrow";
    return `In ${daysUntil} days`;
  };

  return (
    <main className="min-h-screen bg-background py-4 sm:py-8">
      {/* Structured Data for SEO */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": "Famous People Birthdays",
          "description": "Discover the ages and birthdays of celebrities, artists, athletes, and notable personalities",
          "url": "https://aiagecalculator.lovable.app/famous-people",
          "mainEntity": {
            "@type": "ItemList",
            "itemListElement": filteredPeople.slice(0, 10).map((person, index) => ({
              "@type": "ListItem",
              "position": index + 1,
              "item": {
                "@type": "Person",
                "name": person.name,
                "birthDate": person.date_of_birth,
                "description": person.bio
              }
            }))
          }
        })}
      </script>
      
      <div className="container mx-auto px-2 sm:px-4 max-w-7xl flex flex-col xl:flex-row gap-4 xl:gap-6">
        {/* Main Content */}
        <div className="flex-1 w-full">
        {/* Back Button */}
        <nav className="mb-6" aria-label="Breadcrumb">
          <Link to="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              Back to Calculator
            </Button>
          </Link>
        </nav>

        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
            Famous People Birthdays
          </h1>
          <p className="text-muted-foreground text-lg mb-6">
            Discover the ages and birthdays of celebrities, artists, athletes, and notable personalities
          </p>
          <div className="flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-muted-foreground">{people.length} personalities</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-muted-foreground">{categories.length} categories</span>
            </div>
          </div>
        </header>

        {/* Top Ad Banner */}
        <AdSenseBanner format="large-horizontal" className="mb-8" />

        {/* Search Bar */}
        <section className="mb-6 max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by name or profession..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 bg-card"
            />
          </div>
        </section>

        {/* Filters and Sorting */}
        <section className="mb-8 space-y-4">
          <div>
            <div className="text-sm font-medium text-muted-foreground mb-3 text-center">
              Categories
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button
                variant={selectedCategory === "all" ? "default" : "outline"}
                onClick={() => setSelectedCategory("all")}
                className="rounded-full"
                size="sm"
              >
                All
              </Button>
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category.id)}
                  className="rounded-full"
                  size="sm"
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-muted-foreground mb-3 text-center">
              Sort by
            </div>
            <div className="flex items-center justify-center gap-2">
              <Button
                variant={sortBy === "name" ? "default" : "outline"}
                onClick={() => setSortBy("name")}
                size="sm"
                className="rounded-full"
              >
                Name
              </Button>
              <Button
                variant={sortBy === "age" ? "default" : "outline"}
                onClick={() => setSortBy("age")}
                size="sm"
                className="rounded-full"
              >
                Age
              </Button>
              <Button
                variant={sortBy === "birthday" ? "default" : "outline"}
                onClick={() => setSortBy("birthday")}
                size="sm"
                className="rounded-full"
              >
                <Sparkles className="w-3 h-3 mr-1" aria-hidden="true" />
                Upcoming
              </Button>
            </div>
          </div>
        </section>

        {/* Mid-Page Ad Banner */}
        <AdSenseBanner format="large-horizontal" className="mb-8" />

        {/* People Grid */}
        {loading ? (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <Skeleton className="h-64 w-full" />
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-16 w-full" />
                </CardContent>
              </Card>
            ))}
          </section>
        ) : filteredPeople.length > 0 ? (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPeople.map((person, index) => {
              const age = calculateAge(person.date_of_birth);
              const daysUntil = getDaysUntilBirthday(person.date_of_birth);
              const isBirthdaySoon = daysUntil <= 7;
              
              return (
                <>
                  <Link key={person.id} to={`/famous-people/${person.id}`}>
                    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full group relative">
                      {isBirthdaySoon && (
                        <div className="absolute top-3 right-3 z-10 bg-primary text-primary-foreground text-xs px-2.5 py-1 rounded-full font-semibold animate-pulse flex items-center gap-1">
                          <Sparkles className="w-3 h-3" aria-hidden="true" />
                          Soon!
                        </div>
                      )}
                        <div className="relative h-56 bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 overflow-hidden">
                            <Avatar className="absolute inset-0 w-full h-full rounded-none">
                                <AvatarImage 
                                    src={person.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name)}&size=512&background=random&bold=true`} 
                                    alt={`${person.name} - Famous ${person.categories?.name || 'Person'}`} 
                                    className="object-cover group-hover:scale-110 transition-transform duration-300" 
                                />
                                <AvatarFallback className="rounded-none text-5xl font-bold bg-gradient-to-br from-primary/30 to-primary/10">
                                    {person.name.split(" ").map((n) => n[0]).join("")}
                                </AvatarFallback>
                            </Avatar>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        </div>
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center justify-between gap-2 text-lg">
                          <span className="truncate">{person.name}</span>
                          {person.categories?.name && (
                            <Badge variant="secondary" className="text-xs shrink-0">
                              {person.categories.name}
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription className="line-clamp-2 text-sm min-h-[2.5rem]">
                          {person.bio}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2 pt-0">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                          <span className="truncate">
                            {format(new Date(person.date_of_birth), "MMM d, yyyy")}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-2 text-sm">
                            <Users className="h-3.5 w-3.5 text-muted-foreground shrink-0" aria-hidden="true" />
                            <span className="font-semibold text-foreground">{age} years</span>
                          </div>
                          <div className={`flex items-center gap-1.5 text-xs ${isBirthdaySoon ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>
                            <Sparkles className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                            <span>{daysUntil}d</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                  
                  {/* Insert ad cards every 8 cards */}
                  {(index + 1) % 8 === 0 && index !== filteredPeople.length - 1 && (
                    <Card key={`ad-${index}`} className="bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 border-primary/20 overflow-hidden">
                      <CardContent className="p-6 flex flex-col items-center justify-center min-h-[400px]">
                        <div className="text-xs text-muted-foreground mb-3 uppercase tracking-wider">Advertisement</div>
                        <AdSenseBanner format="square" />
                      </CardContent>
                    </Card>
                  )}
                </>
              );
            })}
          </section>
        ) : (
          <div className="text-center py-12">
            <Users className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-lg text-muted-foreground mb-2">No famous people found</p>
            <p className="text-sm text-muted-foreground">
              Try selecting a different category
            </p>
          </div>
        )}

        {/* Bottom Ad Banner */}
        <AdSenseBanner format="horizontal" className="mt-8" />
        </div>

        {/* Right Sidebar Ads - Hidden on mobile/tablet */}
        <aside className="hidden xl:flex xl:flex-col w-full xl:w-[320px] space-y-6 xl:sticky xl:top-8 xl:self-start">
          <AdSenseBanner format="vertical" />
          <AdSenseBanner format="square" />
        </aside>
      </div>
    </main>
  );
};

export default FamousPeople;
