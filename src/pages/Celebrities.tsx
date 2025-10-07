import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Users, Search, ArrowLeft, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CelebrityCard } from "@/components/CelebrityCard";
import { CelebrityCardSkeleton } from "@/components/CelebrityCardSkeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Celebrity {
  id: string;
  name: string;
  dateOfBirth: string;
  profession: string;
  bio: string;
  photoUrl: string | null;
  quote: string | null;
  nationality: string | null;
}

const Celebrities = () => {
  const [searchParams] = useSearchParams();
  const userBirthMonth = searchParams.get("birthMonth");
  const userBirthDay = searchParams.get("birthDay");
  
  const [celebrities, setCelebrities] = useState<Celebrity[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProfession, setSelectedProfession] = useState<string>("");
  const [selectedNationality, setSelectedNationality] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCelebrities();
  }, [userBirthMonth, userBirthDay]);

  const fetchCelebrities = async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams();
      if (userBirthMonth) params.append('birthMonth', userBirthMonth);
      if (userBirthDay) params.append('birthDay', userBirthDay);
      if (searchQuery) params.append('search', searchQuery);
      if (selectedProfession) params.append('profession', selectedProfession);
      if (selectedNationality) params.append('nationality', selectedNationality);

      console.log('Fetching celebrities with params:', params.toString());

      // Call edge function to fetch celebrities from external APIs
      const { data, error } = await supabase.functions.invoke('fetch-celebrities', {
        body: {},
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'GET',
      });

      // Use fetch as fallback with proper URL construction
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fetch-celebrities?${params.toString()}`,
        {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch celebrities');
      }

      const result = await response.json();
      setCelebrities(result.celebrities || []);
      
      if (result.celebrities?.length === 0) {
        toast.info("No celebrities found matching your criteria");
      }
    } catch (error) {
      console.error("Error fetching celebrities:", error);
      toast.error("Failed to load celebrities. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchCelebrities();
  };

  // Get unique professions and nationalities for filters
  const professions = Array.from(new Set(celebrities.map(c => c.profession).filter(Boolean)));
  const nationalities = Array.from(new Set(celebrities.map(c => c.nationality).filter(Boolean)));

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
            Explore Famous People Birthdays
          </h1>
          <p className="text-muted-foreground text-lg mb-2">
            Discover celebrities, artists, athletes, and notable personalities
            {userBirthMonth && userBirthDay && " who share your birthday!"}
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>{celebrities.length} famous personalities</span>
          </div>
        </header>

        {/* Search and Filters */}
        <section className="mb-8 space-y-4">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by name, profession, or biography..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10 h-12 bg-card"
            />
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
            <div className="flex items-center gap-2 flex-1">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Select value={selectedProfession} onValueChange={setSelectedProfession}>
                <SelectTrigger className="bg-card">
                  <SelectValue placeholder="Filter by profession" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Professions</SelectItem>
                  {professions.slice(0, 20).map((profession) => (
                    <SelectItem key={profession} value={profession}>
                      {profession}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Select value={selectedNationality} onValueChange={setSelectedNationality}>
              <SelectTrigger className="bg-card flex-1">
                <SelectValue placeholder="Filter by nationality" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Nationalities</SelectItem>
                {nationalities.slice(0, 20).map((nationality) => (
                  <SelectItem key={nationality} value={nationality}>
                    {nationality}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button onClick={handleSearch} className="gap-2">
              <Search className="w-4 h-4" />
              Search
            </Button>
          </div>
        </section>

        {/* Celebrities Grid */}
        {loading ? (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <CelebrityCardSkeleton key={index} />
            ))}
          </section>
        ) : celebrities.length > 0 ? (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {celebrities.map((celebrity) => (
              <CelebrityCard
                key={celebrity.id}
                {...celebrity}
              />
            ))}
          </section>
        ) : (
          <div className="text-center py-12">
            <Users className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-lg text-muted-foreground mb-2">No celebrities found</p>
            <p className="text-sm text-muted-foreground">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>
    </main>
  );
};

export default Celebrities;
