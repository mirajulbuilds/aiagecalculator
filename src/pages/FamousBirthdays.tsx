import React, { useState, useMemo, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowLeft, Filter, TrendingUp, Instagram, Twitter, Youtube, Facebook, Globe, Calendar, MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { differenceInYears, format } from "date-fns";
import { AdSenseBanner } from "@/components/AdSenseBanner";
import { TrendingBadge } from "@/components/TrendingBadge";
import { PopularityBadge } from "@/components/PopularityBadge";
import { AutocompleteSearch } from "@/components/AutocompleteSearch";
import { CelebrityCard } from "@/components/CelebrityCard";
import celebritiesData from "@/data/explore_famous_birthdays.json";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const ITEMS_PER_PAGE = 50;

const FamousBirthdays: React.FC = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProfession, setSelectedProfession] = useState<string>("all");
  const [selectedCountry, setSelectedCountry] = useState<string>("all");
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"popular" | "trending" | "az" | "recent">("popular");
  const [currentPage, setCurrentPage] = useState(1);
  const [celebrities, setCelebrities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [needsMigration, setNeedsMigration] = useState(false);

  const categories = celebritiesData.categories;

  // Fetch celebrities from database
  useEffect(() => {
    const fetchCelebrities = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('explore_famous_birthdays')
          .select('*');

        if (error) throw error;

        if (!data || data.length === 0) {
          console.log('No celebrities in database, using JSON fallback');
          setNeedsMigration(true);
          setCelebrities(celebritiesData.celebrities.map((c: any) => ({
            ...c,
            image_url: c.image,
            bio: c.about,
            birthdate: c.dob
          })));
        } else {
          console.log(`Loaded ${data.length} celebrities from database`);
          setCelebrities(data.map((c: any) => ({
            ...c,
            birthdate: c.dob,
            image: c.image_url
          })));
          setNeedsMigration(false);
        }
      } catch (error) {
        console.error('Error fetching celebrities:', error);
        toast({
          title: "Error loading celebrities",
          description: "Using local data as fallback",
          variant: "destructive"
        });
        setCelebrities(celebritiesData.celebrities.map((c: any) => ({
          ...c,
          image_url: c.image,
          bio: c.about,
          birthdate: c.dob
        })));
      } finally {
        setIsLoading(false);
      }
    };

    fetchCelebrities();
  }, [toast]);

  // Migrate celebrities to database
  const handleMigration = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('migrate-celebrities-to-db', {
        body: { celebrities: celebritiesData.celebrities }
      });

      if (error) throw error;

      toast({
        title: "Migration successful!",
        description: `Migrated ${data.migrated} celebrities to database`,
      });

      // Reload celebrities from database
      const { data: dbData } = await supabase
        .from('explore_famous_birthdays')
        .select('*');
      
      if (dbData) {
        setCelebrities(dbData.map((c: any) => ({
          ...c,
          birthdate: c.dob,
          image: c.image_url
        })));
        setNeedsMigration(false);
      }
    } catch (error) {
      console.error('Migration error:', error);
      toast({
        title: "Migration failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCelebrities = useMemo(() => {
    let filtered = celebrities.filter((celebrity: any) => {
      const matchesSearch = 
        celebrity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        celebrity.profession.toLowerCase().includes(searchQuery.toLowerCase()) ||
        celebrity.country?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesProfession = selectedProfession === "all" || celebrity.profession === selectedProfession;
      const matchesCountry = selectedCountry === "all" || celebrity.country === selectedCountry;
      
      let matchesMonth = true;
      if (selectedMonth !== "all" && celebrity.birthdate) {
        const birthMonth = format(new Date(celebrity.birthdate), "MMMM");
        matchesMonth = birthMonth === selectedMonth;
      }

      return matchesSearch && matchesProfession && matchesCountry && matchesMonth;
    });

    // Sort based on selected option
    switch (sortBy) {
      case "popular":
        filtered.sort((a: any, b: any) => (b.popularity_score || 0) - (a.popularity_score || 0));
        break;
      case "trending":
        filtered.sort((a: any, b: any) => {
          if (a.trending && !b.trending) return -1;
          if (!a.trending && b.trending) return 1;
          return (b.popularity_score || 0) - (a.popularity_score || 0);
        });
        break;
      case "az":
        filtered.sort((a: any, b: any) => a.name.localeCompare(b.name));
        break;
      case "recent":
        filtered.sort((a: any, b: any) => (b.id || '').toString().localeCompare((a.id || '').toString()));
        break;
    }

    return filtered;
  }, [searchQuery, selectedProfession, selectedCountry, selectedMonth, sortBy, celebrities]);

  const trendingCelebrities = useMemo(() => {
    return celebrities
      .filter((c: any) => c.trending || c.today_trending)
      .sort((a: any, b: any) => (b.popularity_score || 0) - (a.popularity_score || 0))
      .slice(0, 8);
  }, [celebrities]);

  const totalPages = Math.ceil(filteredCelebrities.length / ITEMS_PER_PAGE);
  const paginatedCelebrities = filteredCelebrities.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const calculateAge = (dateOfBirth: string) => {
    return differenceInYears(new Date(), new Date(dateOfBirth));
  };

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case "instagram": return <Instagram className="w-4 h-4" />;
      case "x": return <Twitter className="w-4 h-4" />;
      case "twitter": return <Twitter className="w-4 h-4" />;
      case "youtube": return <Youtube className="w-4 h-4" />;
      case "facebook": return <Facebook className="w-4 h-4" />;
      case "tiktok": return <Globe className="w-4 h-4" />;
      case "website": return <Globe className="w-4 h-4" />;
      default: return null;
    }
  };

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedProfession("all");
    setSelectedCountry("all");
    setSelectedMonth("all");
    setSortBy("popular");
    setCurrentPage(1);
  };

  return (
    <React.Fragment>
      <Helmet>
        <title>Explore Famous Birthdays | Celebrity Birthdays Database | AiAgeCalc.com</title>
        <meta 
          name="description" 
          content="Discover celebrity birthdays from around the world. Explore detailed profiles, birth dates, careers, and achievements of famous people from entertainment, sports, and more." 
        />
        <meta name="keywords" content="celebrity birthdays, famous birthdays, celebrity ages, star birthdays, celebrity profiles, famous people birthdays, celebrity birth dates, celebrity database, famous actors, singers birthdays" />
        <link rel="canonical" href="https://aiagecalc.com/famous-birthdays" />
        {currentPage > 1 && (
          <link rel="prev" href={`https://aiagecalc.com/famous-birthdays?page=${currentPage - 1}`} />
        )}
        {currentPage < totalPages && (
          <link rel="next" href={`https://aiagecalc.com/famous-birthdays?page=${currentPage + 1}`} />
        )}
        
        <meta property="og:title" content="Explore Famous Birthdays | Celebrity Birthdays Database" />
        <meta property="og:description" content="Discover celebrity birthdays from around the world. Explore detailed profiles, birth dates, careers, and achievements of famous people." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://aiagecalc.com/famous-birthdays" />
        <meta property="og:image" content="https://aiagecalc.com/og-image.jpg" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Explore Famous Birthdays | Celebrity Birthdays Database" />
        <meta name="twitter:description" content="Discover celebrity birthdays from around the world. Explore detailed profiles and achievements." />

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "Explore Famous Birthdays - Celebrity Database",
            "description": "Comprehensive celebrity birthday database with profiles, birth dates, professions, careers, and achievements from around the world.",
            "url": "https://aiagecalc.com/famous-birthdays",
            "mainEntity": {
              "@type": "ItemList",
              "name": "Celebrity Birthdays",
              "description": "Famous people and their birthdays",
              "numberOfItems": celebrities.length,
              "itemListElement": paginatedCelebrities.map((celebrity, index) => ({
                "@type": "ListItem",
                "position": (currentPage - 1) * ITEMS_PER_PAGE + index + 1,
                "item": {
                  "@type": "Person",
                  "name": celebrity.name,
                  "birthDate": celebrity.birthdate,
                  "birthPlace": `${celebrity.birthplace}, ${celebrity.country}`,
                  "jobTitle": celebrity.profession,
                  "description": celebrity.excerpt,
                  "image": celebrity.image || celebrity.image_url,
                  "url": `https://aiagecalc.com/celebrity/${celebrity.slug}`
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
                  "name": "Explore Famous Birthdays",
                  "item": "https://aiagecalc.com/famous-birthdays"
                }
              ]
            }
          })}
        </script>
      </Helmet>

      <main className="min-h-screen bg-background">
        {/* Hero Section */}
        <header className="bg-gradient-to-br from-primary/10 via-accent/5 to-background py-8 px-4 border-b">
          <div className="container mx-auto max-w-7xl">
            <Link to="/">
              <Button variant="ghost" className="mb-4 hover:bg-primary/10">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            
            <div className="text-center mb-6">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 text-foreground">
                Explore Famous Birthdays
              </h1>
              <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
                Discover celebrity birthdays from around the world. Explore detailed profiles, birth dates, careers, achievements, and fascinating facts about famous people from entertainment, sports, and beyond.
              </p>
            </div>

            {/* Migration Alert */}
            {needsMigration && (
              <div className="max-w-2xl mx-auto mb-6">
                <Card className="border-warning bg-warning/10">
                  <CardContent className="pt-6">
                    <p className="text-sm text-foreground mb-3">
                      Database needs to be populated with celebrity data. Click below to migrate.
                    </p>
                    <Button onClick={handleMigration} disabled={isLoading} size="sm" variant="default">
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Migrating...
                        </>
                      ) : (
                        'Migrate Data to Database'
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Search Bar with Autocomplete */}
            <div className="max-w-2xl mx-auto">
              <AutocompleteSearch
                celebrities={celebrities}
                value={searchQuery}
                onChange={(value) => {
                  setSearchQuery(value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>
        </header>

        {/* Trending Section */}
        {!isLoading && trendingCelebrities.length > 0 && (
          <div className="container mx-auto px-4 py-8 max-w-7xl">
            <Card>
              <CardHeader>
                <CardTitle className="text-3xl flex items-center gap-2">
                  <TrendingUp className="w-8 h-8 text-red-500" />
                  Trending Now
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {trendingCelebrities.map((celebrity: any) => {
                    const age = celebrity.birthdate ? calculateAge(celebrity.birthdate) : null;
                    return (
                      <Link key={celebrity.id} to={`/celebrity/${celebrity.slug}`}>
                        <Card className="overflow-hidden hover:shadow-xl transition-all group cursor-pointer">
                          <div className="relative">
                            <img 
                              src={celebrity.image || celebrity.image_url || '/placeholder.svg'} 
                              alt={`${celebrity.name}`}
                              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                              loading="lazy"
                              onError={(e) => {
                                e.currentTarget.src = '/placeholder.svg';
                              }}
                            />
                            {(celebrity.trending || celebrity.today_trending) && <TrendingBadge />}
                            {celebrity.popularity_score && <PopularityBadge score={celebrity.popularity_score} />}
                          </div>
                          <CardContent className="p-4">
                            <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors line-clamp-1 mb-1">
                              {celebrity.name}
                            </h3>
                            <div className="flex flex-wrap gap-1 mb-2">
                              <Badge variant="secondary" className="text-xs">
                                {celebrity.profession}
                              </Badge>
                            </div>
                            {age && <p className="text-xs text-muted-foreground">Age: {age} years</p>}
                          </CardContent>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content with Sidebar */}
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left Sidebar - Category Navigation */}
            <aside className="lg:w-64 space-y-4" role="navigation" aria-label="Category filters">
              <Card className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-bold text-base text-foreground flex items-center gap-2">
                    <Filter className="w-4 h-4" aria-hidden="true" />
                    Filters
                  </h2>
                  {(selectedProfession !== "all" || selectedCountry !== "all" || selectedMonth !== "all") && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={resetFilters}
                      className="h-7 text-xs"
                    >
                      Reset
                    </Button>
                  )}
                </div>

                {/* Profession Filter */}
                <div className="mb-4">
                  <h3 className="text-sm font-semibold mb-2 text-foreground">Profession</h3>
                  <select
                    value={selectedProfession}
                    onChange={(e) => {
                      setSelectedProfession(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full p-2 text-sm border rounded-md bg-background text-foreground"
                    aria-label="Filter by profession"
                  >
                    <option value="all">All Professions</option>
                    {categories.professions.map((prof) => (
                      <option key={prof} value={prof}>{prof}</option>
                    ))}
                  </select>
                </div>

                {/* Country Filter */}
                <div className="mb-4">
                  <h3 className="text-sm font-semibold mb-2 text-foreground">Country</h3>
                  <select
                    value={selectedCountry}
                    onChange={(e) => {
                      setSelectedCountry(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full p-2 text-sm border rounded-md bg-background text-foreground"
                    aria-label="Filter by country"
                  >
                    <option value="all">All Countries</option>
                    {categories.countries.map((country) => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                </div>

                {/* Month Filter */}
                <div className="mb-4">
                  <h3 className="text-sm font-semibold mb-2 text-foreground">Birth Month</h3>
                  <select
                    value={selectedMonth}
                    onChange={(e) => {
                      setSelectedMonth(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full p-2 text-sm border rounded-md bg-background text-foreground"
                    aria-label="Filter by birth month"
                  >
                    <option value="all">All Months</option>
                    {categories.months.map((month) => (
                      <option key={month} value={month}>{month}</option>
                    ))}
                  </select>
                </div>
              </Card>
            </aside>

            {/* Center - Main Content */}
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
                <h2 className="text-xl md:text-2xl font-bold text-foreground">
                  {searchQuery ? `Search Results (${filteredCelebrities.length})` : `All Celebrities (${filteredCelebrities.length})`}
                </h2>
                <div className="flex items-center gap-3">
                  <label htmlFor="sort-by" className="text-sm font-medium whitespace-nowrap">Sort by:</label>
                  <select
                    id="sort-by"
                    value={sortBy}
                    onChange={(e) => {
                      setSortBy(e.target.value as any);
                      setCurrentPage(1);
                    }}
                    className="p-2 text-sm border rounded-md bg-background text-foreground"
                    aria-label="Sort celebrities"
                  >
                    <option value="popular">Most Popular</option>
                    <option value="trending">Trending</option>
                    <option value="az">A-Z</option>
                    <option value="recent">Recently Added</option>
                  </select>
                </div>
              </div>

              {filteredCelebrities.length === 0 ? (
                <Card className="p-12 text-center">
                  <p className="text-muted-foreground text-base">
                    {searchQuery ? 'No celebrities found matching your search. Try different keywords or filters.' : 'No celebrity data available. Please check back soon!'}
                  </p>
                </Card>
              ) : (
                <>
                  <ul className="space-y-4 mb-6">
                    {paginatedCelebrities.map((celebrity: any) => {
                      const age = celebrity.birthdate ? calculateAge(celebrity.birthdate) : null;
                      const socialLinks = celebrity.social_links || {};
                      
                      return (
                        <li key={celebrity.id || celebrity.slug}>
                          <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                            <div className="flex flex-col sm:flex-row gap-4 p-4">
                              {/* Image */}
                              <Link to={`/celebrity/${celebrity.slug}`} className="flex-shrink-0">
                                <div className="relative w-full sm:w-32 h-32 rounded-lg overflow-hidden group">
                                  <img 
                                    src={celebrity.image || celebrity.image_url || '/placeholder.svg'} 
                                    alt={celebrity.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    loading="lazy"
                                    onError={(e) => {
                                      e.currentTarget.src = '/placeholder.svg';
                                    }}
                                  />
                                  {(celebrity.trending || celebrity.today_trending) && (
                                    <div className="absolute top-2 left-2">
                                      <TrendingBadge />
                                    </div>
                                  )}
                                </div>
                              </Link>

                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <Link to={`/celebrity/${celebrity.slug}`}>
                                  <h3 className="text-lg font-bold text-foreground hover:text-primary transition-colors mb-2 line-clamp-1">
                                    {celebrity.name}
                                  </h3>
                                </Link>
                                
                                <div className="flex flex-wrap gap-2 mb-3">
                                  <Badge variant="secondary" className="text-xs">
                                    {celebrity.profession}
                                  </Badge>
                                  {celebrity.popularity_score && celebrity.popularity_score >= 80 && (
                                    <Badge variant="default" className="text-xs bg-yellow-500 hover:bg-yellow-600">
                                      ⭐ Popular
                                    </Badge>
                                  )}
                                </div>

                                <div className="space-y-1 text-sm text-muted-foreground mb-3">
                                  {celebrity.birthdate && (
                                    <div className="flex items-center gap-2">
                                      <Calendar className="w-4 h-4" />
                                      <span>
                                        {format(new Date(celebrity.birthdate), "MMMM d, yyyy")}
                                        {age && ` (${age} years old)`}
                                      </span>
                                    </div>
                                  )}
                                  {celebrity.birthplace && celebrity.country && (
                                    <div className="flex items-center gap-2">
                                      <MapPin className="w-4 h-4" />
                                      <span>{celebrity.birthplace}, {celebrity.country}</span>
                                    </div>
                                  )}
                                </div>

                                {celebrity.excerpt && (
                                  <p className="text-sm text-foreground mb-3 line-clamp-2">
                                    {celebrity.excerpt}
                                  </p>
                                )}

                                {/* Social Links */}
                                {Object.keys(socialLinks).length > 0 && (
                                  <div className="flex gap-2 flex-wrap">
                                    {Object.entries(socialLinks).map(([platform, url]) => (
                                      <a 
                                        key={platform}
                                        href={url as string}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-muted-foreground hover:text-primary transition-colors"
                                        aria-label={`${celebrity.name} on ${platform}`}
                                      >
                                        {getSocialIcon(platform)}
                                      </a>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </Card>
                        </li>
                      );
                    })}
                  </ul>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <Pagination className="mt-8">
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious 
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                          />
                        </PaginationItem>
                        
                        {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                          const pageNum = idx + 1;
                          return (
                            <PaginationItem key={pageNum}>
                              <PaginationLink
                                onClick={() => setCurrentPage(pageNum)}
                                isActive={currentPage === pageNum}
                                className="cursor-pointer"
                              >
                                {pageNum}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        })}

                        {totalPages > 5 && (
                          <>
                            {currentPage > 3 && <span className="px-2">...</span>}
                            {currentPage > 5 && (
                              <PaginationItem>
                                <PaginationLink
                                  onClick={() => setCurrentPage(totalPages)}
                                  className="cursor-pointer"
                                >
                                  {totalPages}
                                </PaginationLink>
                              </PaginationItem>
                            )}
                          </>
                        )}

                        <PaginationItem>
                          <PaginationNext 
                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                            className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  )}
                </>
              )}
            </div>
          </div>
          )}
        </div>
      </main>
    </React.Fragment>
  );
};

export default FamousBirthdays;
