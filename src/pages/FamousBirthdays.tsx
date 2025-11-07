import React, { useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowLeft, Filter, TrendingUp, Instagram, Twitter, Youtube, Facebook, Globe, Calendar, MapPin } from "lucide-react";
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

const ITEMS_PER_PAGE = 50;

const FamousBirthdays: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProfession, setSelectedProfession] = useState<string>("all");
  const [selectedCountry, setSelectedCountry] = useState<string>("all");
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"popular" | "trending" | "az" | "recent">("popular");
  const [currentPage, setCurrentPage] = useState(1);

  const celebrities = celebritiesData.celebrities;
  const categories = celebritiesData.categories;

  const filteredCelebrities = useMemo(() => {
    let filtered = celebrities.filter((celebrity: any) => {
      const matchesSearch = 
        celebrity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        celebrity.profession.toLowerCase().includes(searchQuery.toLowerCase()) ||
        celebrity.country.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesProfession = selectedProfession === "all" || celebrity.profession === selectedProfession;
      const matchesCountry = selectedCountry === "all" || celebrity.country === selectedCountry;
      
      let matchesMonth = true;
      if (selectedMonth !== "all") {
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
        filtered.sort((a: any, b: any) => b.id.localeCompare(a.id));
        break;
    }

    return filtered;
  }, [searchQuery, selectedProfession, selectedCountry, selectedMonth, sortBy, celebrities]);

  const trendingCelebrities = useMemo(() => {
    return celebrities
      .filter((c: any) => c.trending)
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
                  "image": celebrity.image,
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

        {/* Top Ad Banner */}
        <div className="container mx-auto px-4 py-4 max-w-7xl" id="ad-top">
          <AdSenseBanner 
            adSlot="1234567890"
            format="horizontal"
          />
        </div>

        {/* Trending Section */}
        {trendingCelebrities.length > 0 && (
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
                    const age = calculateAge(celebrity.birthdate);
                    return (
                      <Link key={celebrity.id} to={`/celebrity/${celebrity.slug}`}>
                        <Card className="overflow-hidden hover:shadow-xl transition-all group cursor-pointer">
                          <div className="relative">
                            <img 
                              src={celebrity.image} 
                              alt={`${celebrity.name}`}
                              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                              loading="lazy"
                            />
                            {celebrity.trending && <TrendingBadge />}
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
                            <p className="text-xs text-muted-foreground">Age: {age} years</p>
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
                    {paginatedCelebrities.map((celebrity: any, index) => {
                      const age = calculateAge(celebrity.birthdate);
                      const birthDate = format(new Date(celebrity.birthdate), 'MMMM d, yyyy');
                      
                      // Insert inline ad after 5th item
                      const items = [];
                      items.push(
                        <li key={celebrity.id}>
                          <Link to={`/celebrity/${celebrity.slug}`}>
                            <Card className="overflow-hidden hover:shadow-lg transition-all duration-200 group cursor-pointer">
                              <CardContent className="p-0">
                                <article className="flex flex-col sm:flex-row gap-4 p-4">
                                  <div className="relative w-full sm:w-40 h-40 flex-shrink-0 overflow-hidden rounded-md">
                                    <img 
                                      src={celebrity.image} 
                                      alt={`${celebrity.name} profile picture`}
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                      loading="lazy"
                                      width="160"
                                      height="160"
                                    />
                                    {celebrity.trending && <TrendingBadge />}
                                    {celebrity.popularity_score && <PopularityBadge score={celebrity.popularity_score} />}
                                  </div>
                                  
                                  <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-lg text-foreground mb-1 group-hover:text-primary transition-colors line-clamp-1">
                                      {celebrity.name}
                                    </h3>
                                    
                                    <div className="flex flex-wrap gap-2 mb-2">
                                      <Badge variant="secondary" className="text-xs">
                                        {celebrity.profession}
                                      </Badge>
                                      <Badge variant="outline" className="text-xs">
                                        {celebrity.country}
                                      </Badge>
                                    </div>
                                    
                                    <div className="space-y-1 text-sm text-muted-foreground mb-2">
                                      <div className="flex items-center gap-2">
                                        <Calendar className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
                                        <span>{birthDate} • Age: {age} years • {celebrity.birth_sign}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <MapPin className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
                                        <span className="line-clamp-1">{celebrity.birthplace}</span>
                                      </div>
                                    </div>
                                    
                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                      {celebrity.excerpt}
                                    </p>

                                    {celebrity.social_links && Object.keys(celebrity.social_links).length > 0 && (
                                      <div className="flex gap-3 mt-3">
                                        {Object.entries(celebrity.social_links).map(([platform, url]) => (
                                          <a
                                            key={platform}
                                            href={url as string}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-muted-foreground hover:text-primary transition-colors"
                                            onClick={(e) => e.stopPropagation()}
                                            aria-label={`${celebrity.name} on ${platform}`}
                                          >
                                            {getSocialIcon(platform)}
                                          </a>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </article>
                              </CardContent>
                            </Card>
                          </Link>
                        </li>
                      );

                      // Add inline ad after 5th item on first page
                      if (index === 4 && currentPage === 1) {
                        items.push(
                          <li key="inline-ad" id="ad-inline" className="my-4">
                            <AdSenseBanner 
                              adSlot="5544332211"
                              format="horizontal"
                            />
                          </li>
                        );
                      }

                      return items;
                    })}
                  </ul>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <nav aria-label="Pagination">
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious 
                              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                              className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                              aria-label="Go to previous page"
                            />
                          </PaginationItem>
                          
                          {[...Array(Math.min(5, totalPages))].map((_, i) => {
                            let pageNum;
                            if (totalPages <= 5) {
                              pageNum = i + 1;
                            } else if (currentPage <= 3) {
                              pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                              pageNum = totalPages - 4 + i;
                            } else {
                              pageNum = currentPage - 2 + i;
                            }
                            
                            return (
                              <PaginationItem key={pageNum}>
                                <PaginationLink
                                  onClick={() => setCurrentPage(pageNum)}
                                  isActive={currentPage === pageNum}
                                  className="cursor-pointer"
                                  aria-label={`Go to page ${pageNum}`}
                                  aria-current={currentPage === pageNum ? "page" : undefined}
                                >
                                  {pageNum}
                                </PaginationLink>
                              </PaginationItem>
                            );
                          })}
                          
                          <PaginationItem>
                            <PaginationNext 
                              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                              className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                              aria-label="Go to next page"
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </nav>
                  )}
                </>
              )}
            </div>

            {/* Right Sidebar - Ads */}
            <aside className="lg:w-80 space-y-4" id="ad-side">
              <Card className="p-4 sticky top-4">
                <h3 className="font-bold text-sm mb-3 text-foreground">Sponsored</h3>
                <AdSenseBanner 
                  adSlot="0987654321"
                  format="vertical"
                />
              </Card>
            </aside>
          </div>
        </div>

        {/* Bottom Ad Banner */}
        <div className="container mx-auto px-4 py-4 max-w-7xl">
          <AdSenseBanner 
            adSlot="1122334455"
            format="large-horizontal"
          />
        </div>
      </main>
    </React.Fragment>
  );
};

export default FamousBirthdays;
