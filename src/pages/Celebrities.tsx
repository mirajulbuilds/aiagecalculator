import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { differenceInYears } from "date-fns";
import { Users, Cake } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  const [celebrities, setCelebrities] = useState<FamousPerson[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
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

  const filteredCelebrities = selectedCategory
    ? celebrities.filter((person) => person.category_id === selectedCategory)
    : celebrities;

  return (
    <main className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Users className="w-8 h-8 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">
              Famous Birthdays
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Discover the ages of celebrities and notable people
          </p>
        </header>

        {/* Category Filter */}
        <section className="mb-8">
          <div className="flex flex-wrap gap-2 justify-center">
            <Badge
              variant={selectedCategory === null ? "default" : "outline"}
              className="cursor-pointer px-4 py-2 text-sm"
              onClick={() => setSelectedCategory(null)}
            >
              All Categories
            </Badge>
            {categories.map((category) => (
              <Badge
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                className="cursor-pointer px-4 py-2 text-sm"
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
              <Link key={person.id} to={`/celebrities/${person.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Profile Image */}
                      <div className="w-20 h-20 rounded-full overflow-hidden flex-shrink-0 bg-muted">
                        {person.photo_url ? (
                          <img
                            src={person.photo_url}
                            alt={person.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Users className="w-10 h-10 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold text-foreground mb-1 truncate">
                          {person.name}
                        </h3>
                        
                        {person.categories && (
                          <Badge variant="secondary" className="mb-2">
                            {person.categories.name}
                          </Badge>
                        )}

                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Cake className="w-4 h-4" />
                          <span>{calculateAge(person.date_of_birth)} years old</span>
                        </div>

                        {person.bio && (
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                            {person.bio}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
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
