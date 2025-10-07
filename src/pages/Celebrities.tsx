import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { differenceInYears, format } from "date-fns";
import { Users, Cake, Search, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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

const Celebrities = () => {
  const [searchParams] = useSearchParams();
  const userBirthMonth = searchParams.get("birthMonth");
  const userBirthDay = searchParams.get("birthDay");
  
  const [celebrities, setCelebrities] = useState<FamousPerson[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("categories")
        .select("*")
        .order("name");

      if (categoriesError) throw categoriesError;
      setCategories(categoriesData || []);

      // Fetch famous people with their categories
      const { data: peopleData, error: peopleError } = await supabase
        .from("famous_people")
        .select(`
          *,
          categories (
            id,
            name
          )
        `)
        .order("name");

      if (peopleError) throw peopleError;
      setCelebrities(peopleData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load celebrities");
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (dateOfBirth: string) => {
    return differenceInYears(new Date(), new Date(dateOfBirth));
  };

  const getNextBirthday = (dateOfBirth: string) => {
    const birthDate = new Date(dateOfBirth);
    const now = new Date();
    const thisYear = now.getFullYear();
    let nextBirthday = new Date(thisYear, birthDate.getMonth(), birthDate.getDate());
    
    if (nextBirthday < now) {
      nextBirthday = new Date(thisYear + 1, birthDate.getMonth(), birthDate.getDate());
    }
    
    return format(nextBirthday, "MMMM d, yyyy");
  };

  const filteredCelebrities = celebrities
    .filter((person) => {
      // Filter by category
      if (selectedCategory && person.category_id !== selectedCategory) {
        return false;
      }
      
      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = person.name.toLowerCase().includes(query);
        const matchesCategory = person.categories?.name.toLowerCase().includes(query);
        if (!matchesName && !matchesCategory) {
          return false;
        }
      }
      
      // Filter by user's birthday if provided
      if (userBirthMonth && userBirthDay) {
        const birthDate = new Date(person.date_of_birth);
        const personMonth = birthDate.getMonth() + 1;
        const personDay = birthDate.getDate();
        return personMonth === parseInt(userBirthMonth) && personDay === parseInt(userBirthDay);
      }
      
      return true;
    });

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
          <p className="text-muted-foreground text-lg mb-2">
            Discover the ages and birthdays of celebrities, artists, athletes, and notable personalities
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>{filteredCelebrities.length} famous personalities</span>
          </div>
        </header>

        {/* Search Bar */}
        <section className="mb-6">
          <div className="relative max-w-2xl mx-auto">
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

        {/* Category Filter */}
        <section className="mb-8">
          <h3 className="text-sm font-medium text-muted-foreground mb-3 text-center">Categories</h3>
          <div className="flex flex-wrap gap-2 justify-center">
            <Badge
              variant={selectedCategory === null ? "default" : "outline"}
              className="cursor-pointer px-4 py-2 text-sm hover:bg-primary/90 transition-colors"
              onClick={() => setSelectedCategory(null)}
            >
              All
            </Badge>
            {categories.map((category) => (
              <Badge
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                className="cursor-pointer px-4 py-2 text-sm hover:bg-primary/90 transition-colors"
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name}
              </Badge>
            ))}
          </div>
        </section>

        {/* Celebrities Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
            <p className="mt-4 text-muted-foreground">Loading celebrities...</p>
          </div>
        ) : (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCelebrities.map((person) => (
              <Card key={person.id} className="hover:shadow-xl transition-all duration-300 cursor-pointer group bg-card/50 backdrop-blur">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    {/* Profile Image */}
                    <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 bg-gradient-primary">
                      {person.photo_url ? (
                        <img
                          src={person.photo_url}
                          alt={person.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Users className="w-8 h-8 text-primary-foreground" />
                        </div>
                      )}
                    </div>

                    {/* Name and Category */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                        {person.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {person.bio ? person.bio.split('.')[0] : 'Notable personality'}
                      </p>
                      {person.categories && (
                        <Badge variant="secondary" className="text-xs">
                          {person.categories.name}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Age and Birthday Info */}
                  <div className="space-y-2 pt-4 border-t border-border">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Current Age:</span>
                      <span className="text-2xl font-bold text-primary">{calculateAge(person.date_of_birth)} years</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Birthday:</span>
                      <span className="text-foreground font-medium">
                        {format(new Date(person.date_of_birth), "MMMM d, yyyy")}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Next Birthday:</span>
                      <span className="text-foreground font-medium">
                        {getNextBirthday(person.date_of_birth)}
                      </span>
                    </div>
                  </div>

                  {/* View Profile Button */}
                  <Link to={`/celebrities/${person.id}`}>
                    <Button 
                      variant="outline" 
                      className="w-full mt-4 gap-2 group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                    >
                      <Users className="w-4 h-4" />
                      View Full Profile
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </section>
        )}

        {!loading && filteredCelebrities.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No celebrities found in this category.</p>
          </div>
        )}
      </div>
    </main>
  );
};

export default Celebrities;
