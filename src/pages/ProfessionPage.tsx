import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Briefcase, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { CelebrityCard } from "@/components/CelebrityCard";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface Celebrity {
  id: string;
  name: string;
  profile_slug: string;
  profession: string;
  date_of_birth: string;
  profile_image_url: string;
  popularity_ranks: any;
}

const ProfessionPage = () => {
  const { professionSlug } = useParams<{ professionSlug: string }>();
  const [celebrities, setCelebrities] = useState<Celebrity[]>([]);
  const [loading, setLoading] = useState(true);
  const [professionName, setProfessionName] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 24;

  // Convert slug to readable name (e.g., "tiktok-star" -> "TikTok Star")
  const slugToName = (slug: string) => {
    return slug
      .split("-")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Convert profession to slug (e.g., "TikTok Star" -> "tiktok-star")
  const nameToSlug = (name: string) => {
    return name.toLowerCase().replace(/\s+/g, "-");
  };

  useEffect(() => {
    if (professionSlug) {
      const displayName = slugToName(professionSlug);
      setProfessionName(displayName);
      setCurrentPage(1); // Reset to page 1 when profession changes
      loadCelebrities(1);
    }
  }, [professionSlug]);

  useEffect(() => {
    if (professionSlug) {
      loadCelebrities(currentPage);
    }
  }, [currentPage]);

  const loadCelebrities = async (page: number) => {
    if (!professionSlug) return;
    
    setLoading(true);
    try {
      // Convert slug to display name for CONTAINS matching
      const displayName = slugToName(professionSlug);
      
      // Calculate pagination range
      const from = (page - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;
      
      // Fetch total count
      const { count } = await supabase
        .from("celebrities")
        .select("*", { count: "exact", head: true })
        .ilike("profession", `%${displayName}%`);
      
      setTotalCount(count || 0);
      
      // Fetch paginated celebrities where profession CONTAINS the category name
      const { data, error } = await supabase
        .from("celebrities")
        .select("*")
        .ilike("profession", `%${displayName}%`)
        .order("popularity_ranks->most_popular", { ascending: true })
        .range(from, to);

      if (error) {
        console.error("Error fetching celebrities:", error);
        setCelebrities([]);
      } else {
        setCelebrities(data || []);
      }
    } catch (error) {
      console.error("Error loading celebrities:", error);
      setCelebrities([]);
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading celebrities...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Famous {professionName}s - Celebrity Ages & Birthdays</title>
        <meta
          name="description"
          content={`Discover famous ${professionName.toLowerCase()}s, their ages, birthdays, and fascinating facts. Browse our complete list of celebrity ${professionName.toLowerCase()}s.`}
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 max-w-6xl py-8">
          {/* Back Button */}
          <Link to="/famous-birthdays">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Famous Birthdays
            </Button>
          </Link>

          {/* Page Heading */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Briefcase className="w-8 h-8 text-primary" />
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                Famous {professionName}s
              </h1>
            </div>
            <p className="text-muted-foreground">
              Found {totalCount} {totalCount === 1 ? 'celebrity' : 'celebrities'}
              {totalCount > itemsPerPage && (
                <span className="ml-2">
                  (Page {currentPage} of {Math.ceil(totalCount / itemsPerPage)})
                </span>
              )}
            </p>
          </div>

          {/* Results Grid */}
          {celebrities.length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {celebrities.map((celebrity) => (
                  <CelebrityCard key={celebrity.id} celebrity={celebrity} />
                ))}
              </div>

              {/* Pagination */}
              {totalCount > itemsPerPage && (
                <div className="mt-12">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => {
                            if (currentPage > 1) {
                              setCurrentPage(currentPage - 1);
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }
                          }}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>

                      {/* Page Numbers */}
                      {Array.from({ length: Math.ceil(totalCount / itemsPerPage) }, (_, i) => i + 1)
                        .filter((page) => {
                          // Show first page, last page, current page, and pages around current
                          const totalPages = Math.ceil(totalCount / itemsPerPage);
                          return (
                            page === 1 ||
                            page === totalPages ||
                            Math.abs(page - currentPage) <= 1
                          );
                        })
                        .map((page, index, array) => {
                          // Add ellipsis if there's a gap
                          const prevPage = array[index - 1];
                          const showEllipsis = prevPage && page - prevPage > 1;

                          return (
                            <>
                              {showEllipsis && (
                                <PaginationItem key={`ellipsis-${page}`}>
                                  <span className="px-4">...</span>
                                </PaginationItem>
                              )}
                              <PaginationItem key={page}>
                                <PaginationLink
                                  onClick={() => {
                                    setCurrentPage(page);
                                    window.scrollTo({ top: 0, behavior: "smooth" });
                                  }}
                                  isActive={currentPage === page}
                                  className="cursor-pointer"
                                >
                                  {page}
                                </PaginationLink>
                              </PaginationItem>
                            </>
                          );
                        })}

                      <PaginationItem>
                        <PaginationNext
                          onClick={() => {
                            if (currentPage < Math.ceil(totalCount / itemsPerPage)) {
                              setCurrentPage(currentPage + 1);
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }
                          }}
                          className={
                            currentPage === Math.ceil(totalCount / itemsPerPage)
                              ? "pointer-events-none opacity-50"
                              : "cursor-pointer"
                          }
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          ) : (
            <div className="bg-card rounded-2xl shadow-card p-12 text-center">
              <Briefcase className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h2 className="text-2xl font-bold text-foreground mb-2">
                No celebrities found
              </h2>
              <p className="text-muted-foreground mb-6">
                We couldn't find any {professionName.toLowerCase()}s in our database.
              </p>
              <Link to="/famous-birthdays">
                <Button>
                  Browse All Celebrities
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ProfessionPage;
