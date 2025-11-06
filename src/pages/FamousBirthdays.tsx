import React, { useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Search, ArrowLeft, TrendingUp, Calendar, SortAsc, MapPin, Instagram, Twitter, Youtube, Facebook, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { differenceInYears, format } from "date-fns";
import { AdSenseBanner } from "@/components/AdSenseBanner";
import { famousBirthdays } from "@/data/famousBirthdays";

const ITEMS_PER_PAGE = 12;

const FamousBirthdays: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"trending" | "name" | "dob">("trending");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredAndSortedCelebrities = useMemo(() => {
    let filtered = famousBirthdays.filter((celebrity) =>
      celebrity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      celebrity.occupation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      celebrity.country.toLowerCase().includes(searchQuery.toLowerCase())
    );

    filtered.sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      } else if (sortBy === "dob") {
        return new Date(a.dob).getTime() - new Date(b.dob).getTime();
      } else if (sortBy === "trending") {
        return b.popularityScore - a.popularityScore;
      }
      return 0;
    });

    return filtered;
  }, [searchQuery, sortBy]);

  const totalPages = Math.ceil(filteredAndSortedCelebrities.length / ITEMS_PER_PAGE);
  const paginatedCelebrities = filteredAndSortedCelebrities.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const calculateAge = (dateOfBirth: string) => {
    return differenceInYears(new Date(), new Date(dateOfBirth));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case "instagram": return <Instagram className="w-4 h-4" />;
      case "twitter": return <Twitter className="w-4 h-4" />;
      case "youtube": return <Youtube className="w-4 h-4" />;
      case "facebook": return <Facebook className="w-4 h-4" />;
      case "website": return <Globe className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <React.Fragment>
      <Helmet>
        <title>Explore Famous Birthdays | Celebrity Birthdays Database | AiAgeCalc.com</title>
        <meta 
          name="description" 
          content="Discover celebrity birthdays from around the world. Explore profiles, birth dates, professions, and trending stars from entertainment, sports, and more." 
        />
        <meta name="keywords" content="celebrity birthdays, famous birthdays, celebrity ages, star birthdays, celebrity profiles, famous people birthdays, celebrity birth dates, trending celebrities, celebrity database" />
        <link rel="canonical" href="https://aiagecalc.com/famous-birthdays" />
        
        <meta property="og:title" content="Explore Famous Birthdays | Celebrity Birthdays Database" />
        <meta property="og:description" content="Discover celebrity birthdays from around the world. Explore profiles, birth dates, professions, and trending stars." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://aiagecalc.com/famous-birthdays" />
        <meta property="og:image" content="https://aiagecalc.com/og-image.jpg" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Explore Famous Birthdays | Celebrity Birthdays Database" />
        <meta name="twitter:description" content="Discover celebrity birthdays from around the world. Explore profiles, birth dates, professions, and trending stars." />

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "Explore Famous Birthdays - Celebrity Database",
            "description": "Comprehensive celebrity birthday database with profiles, birth dates, professions, and trending stars from around the world.",
            "url": "https://aiagecalc.com/famous-birthdays",
            "mainEntity": {
              "@type": "ItemList",
              "name": "Celebrity Birthdays",
              "description": "Famous people and their birthdays",
              "numberOfItems": famousBirthdays.length,
              "itemListElement": paginatedCelebrities.map((celebrity, index) => ({
                "@type": "ListItem",
                "position": (currentPage - 1) * ITEMS_PER_PAGE + index + 1,
                "item": {
                  "@type": "Person",
                  "name": celebrity.name,
                  "birthDate": celebrity.dob,
                  "birthPlace": `${celebrity.birthPlace}, ${celebrity.country}`,
                  "jobTitle": celebrity.occupation,
                  "description": celebrity.bio,
                  "image": celebrity.imageUrl,
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
        <section className="bg-gradient-to-br from-primary/10 via-accent/5 to-background py-12 px-4 border-b">
          <div className="container mx-auto max-w-7xl">
            <Link to="/">
              <Button variant="ghost" className="mb-6 hover:bg-primary/10">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
                Explore Famous Birthdays
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Discover celebrity birthdays from around the world. Explore profiles, birth dates, professions, and trending stars from entertainment, sports, and beyond.
              </p>
            </div>

            {/* Search and Filter Bar */}
            <div className="max-w-4xl mx-auto">
              <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search by name, occupation, or country..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-12 py-6 text-lg"
                  />
                </div>
                
                <div className="flex gap-4">
                  <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                    <SelectTrigger className="w-[180px] py-6">
                      <SortAsc className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="trending">Trending</SelectItem>
                      <SelectItem value="name">Name (A-Z)</SelectItem>
                      <SelectItem value="dob">Birth Date</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </form>
            </div>
          </div>
        </section>

        {/* Ad Banner Top */}
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <AdSenseBanner 
            adSlot="1234567890"
            format="horizontal"
          />
        </div>

        {/* Main Content with Sidebar */}
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Content Area */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-primary" />
                  {searchQuery ? `Search Results (${filteredAndSortedCelebrities.length})` : 'All Celebrities'}
                </h2>
                {totalPages > 0 && (
                  <p className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </p>
                )}
              </div>

              {filteredAndSortedCelebrities.length === 0 ? (
                <Card className="p-12 text-center">
                  <p className="text-muted-foreground text-lg">
                    {searchQuery ? 'No celebrities found matching your search.' : 'No celebrity data available yet. Check back soon!'}
                  </p>
                </Card>
              ) : (
                <>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                    {paginatedCelebrities.map((celebrity) => {
                      const age = calculateAge(celebrity.dob);
                      const birthDate = format(new Date(celebrity.dob), 'MMMM d, yyyy');
                      
                      return (
                        <li key={celebrity.id}>
                          <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group hover:-translate-y-1 h-full cursor-pointer">
                            <CardContent className="p-0">
                              <div className="relative h-48 overflow-hidden">
                                <img 
                                  src={celebrity.imageUrl} 
                                  alt={`${celebrity.name} - ${celebrity.occupation}`}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                  loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent"></div>
                                {celebrity.trending && (
                                  <Badge className="absolute top-3 right-3 bg-primary text-primary-foreground">
                                    <TrendingUp className="w-3 h-3 mr-1" />
                                    Trending
                                  </Badge>
                                )}
                              </div>
                              
                              <div className="p-5">
                                <h3 className="font-bold text-lg text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-1">
                                  {celebrity.name}
                                </h3>
                                
                                <Badge variant="secondary" className="mb-3 text-xs">
                                  {celebrity.occupation}
                                </Badge>
                                
                                <div className="space-y-2 text-sm text-muted-foreground mb-3">
                                  <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 flex-shrink-0" />
                                    <span className="line-clamp-1">{birthDate}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 flex-shrink-0" />
                                    <span className="line-clamp-1">{celebrity.birthPlace}, {celebrity.country}</span>
                                  </div>
                                  <p className="font-semibold text-foreground">Age: {age} years</p>
                                </div>
                                
                                <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                                  {celebrity.bio}
                                </p>

                                {celebrity.socialLinks && Object.keys(celebrity.socialLinks).length > 0 && (
                                  <div className="flex gap-2 pt-2 border-t border-border">
                                    {Object.entries(celebrity.socialLinks).map(([platform, url]) => (
                                      <a
                                        key={platform}
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-muted-foreground hover:text-primary transition-colors"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        {getSocialIcon(platform)}
                                      </a>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        </li>
                      );
                    })}
                  </ul>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious 
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
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
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  )}
                </>
              )}
            </div>

            {/* Sidebar for Ads */}
            <aside className="lg:w-80 space-y-6">
              <Card className="p-6 sticky top-4">
                <h3 className="font-bold text-lg mb-4 text-foreground">Sponsored</h3>
                <AdSenseBanner 
                  adSlot="0987654321"
                  format="vertical"
                />
              </Card>
            </aside>
          </div>
        </div>

        {/* Bottom Ad Banner */}
        <div className="container mx-auto px-4 py-6 max-w-7xl">
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
