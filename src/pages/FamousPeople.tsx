import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Users, Calendar, ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { differenceInYears, differenceInDays, format } from "date-fns";

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

  useEffect(() => {
    fetchCategories();
    fetchPeople();
  }, []);

  useEffect(() => {
    filterPeople();
  }, [people, selectedCategory, searchQuery]);

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

    setFilteredPeople(filtered);
  };

  const calculateAge = (dateOfBirth: string) => {
    return differenceInYears(new Date(), new Date(dateOfBirth));
  };

  const getNextBirthday = (dateOfBirth: string) => {
    const birthDate = new Date(dateOfBirth);
    const now = new Date();
    const currentYear = now.getFullYear();
    
    let nextBirthday = new Date(currentYear, birthDate.getMonth(), birthDate.getDate());
    
    if (nextBirthday < now) {
      nextBirthday = new Date(currentYear + 1, birthDate.getMonth(), birthDate.getDate());
    }

    const daysUntil = differenceInDays(nextBirthday, now);
    
    if (daysUntil === 0) return "Today! 🎉";
    if (daysUntil === 1) return "Tomorrow";
    return `In ${daysUntil} days`;
  };

  return (
    <main className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Back Button */}
        <div className="mb-6">
          <Link to="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Calculator
            </Button>
          </Link>
        </div>

        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
            Famous People Birthdays
          </h1>
          <p className="text-muted-foreground text-lg mb-4">
            Discover the ages and birthdays of celebrities, artists, athletes, and notable personalities
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>{filteredPeople.length} famous {filteredPeople.length === 1 ? 'personality' : 'personalities'}</span>
          </div>
        </header>

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

        {/* Category Pills */}
        <section className="mb-8">
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
        </section>

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
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPeople.map((person) => (
              <Card key={person.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={person.photo_url || undefined} alt={person.name} />
                      <AvatarFallback>
                        <Users className="w-8 h-8" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold mb-1 truncate">{person.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{person.bio.split('.')[0]}</p>
                      {person.categories?.name && (
                        <Badge variant="secondary" className="text-xs">{person.categories.name}</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 pt-0">
                  <div className="bg-muted/50 rounded-lg p-3">
                    <div className="text-sm text-muted-foreground mb-1">Current Age:</div>
                    <div className="text-2xl font-bold text-primary">
                      {calculateAge(person.date_of_birth)} years
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="text-muted-foreground mb-1">Birthday:</div>
                      <div className="font-medium">
                        {format(new Date(person.date_of_birth), 'MMMM d, yyyy')}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground mb-1">Next Birthday:</div>
                      <div className="font-medium">
                        {getNextBirthday(person.date_of_birth)}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {person.bio}
                  </p>
                </CardContent>
                <CardFooter>
                  <Link to={`/famous-people/${person.id}`} className="w-full">
                    <Button variant="outline" className="w-full gap-2">
                      <Users className="w-4 h-4" />
                      View Full Profile
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
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
      </div>
    </main>
  );
};

export default FamousPeople;
