import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { SEOHead } from "@/components/SEOHead";
import { ArrowLeft, MapPin, Calendar, Star, TrendingUp, Share2 } from "lucide-react";
import DOMPurify from "dompurify";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AdSenseBanner } from "@/components/AdSenseBanner";
import { differenceInYears, differenceInMonths, differenceInDays, differenceInHours, differenceInMinutes, differenceInSeconds, addYears } from "date-fns";
import PageTransition from "@/components/PageTransition";
import { BackToTop } from "@/components/BackToTop";
import { triggerNativeShare } from "@/lib/shareUtils";
import { SITE_CONFIG } from "@/lib/config";

interface CelebrityData {
  name: string;
  date_of_birth: string;
  profession: string;
  place_of_birth: string;
  zodiac_sign: string;
  profile_slug: string;
  profile_image_url: string;
  main_content: string;
  meta_title: string;
  meta_description: string;
  popularity_ranks: any;
  known_for_data?: any;
}

const CelebrityProfile = () => {
  const { profileSlug } = useParams<{ profileSlug: string }>();
  const [celebrity, setCelebrity] = useState<CelebrityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [ageData, setAgeData] = useState<any>(null);
  const [relatedCelebrities, setRelatedCelebrities] = useState<CelebrityData[]>([]);
  const [sameBirthdayCelebrities, setSameBirthdayCelebrities] = useState<CelebrityData[]>([]);
  const [sameZodiacCelebrities, setSameZodiacCelebrities] = useState<CelebrityData[]>([]);
  const [activeSection, setActiveSection] = useState<string>("about-section");
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const loadCelebrity = async () => {
      // STEP 1: Check for preview data first (App State via sessionStorage)
      const tempPreview = sessionStorage.getItem("temp_profile_preview");
      
      if (tempPreview) {
        try {
          const parsed = JSON.parse(tempPreview);
          
          // Verify this is valid preview data
          if (parsed.is_preview === true) {
            console.log("Loading preview data:", parsed.name);
            setCelebrity(parsed as CelebrityData);
            
            // Clear preview data after loading (prevents stale previews)
            sessionStorage.removeItem("temp_profile_preview");
            setLoading(false);
            return;
          }
        } catch (e) {
          console.error("Error parsing preview data:", e);
          sessionStorage.removeItem("temp_profile_preview");
        }
      }

      // STEP 2: If no preview data, load from database (live user flow)
      if (!profileSlug) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("celebrities")
        .select("*")
        .eq("profile_slug", profileSlug)
        .maybeSingle();

      if (error) {
        console.error("Error loading celebrity:", error);
        setLoading(false);
        return;
      }

      if (data) {
        console.log("Loading from database:", data.name);
        setCelebrity(data as CelebrityData);
        
        // Load related celebrities (same profession) - "Fans Also Viewed" with random results
        const { data: related } = await supabase
          .from("celebrities")
          .select("*")
          .eq("profession", data.profession)
          .neq("id", data.id)
          .limit(20); // Fetch more for randomization
        
        if (related && related.length > 0) {
          // Randomly select 4 celebrities
          const shuffled = [...related].sort(() => Math.random() - 0.5);
          setRelatedCelebrities(shuffled.slice(0, 4) as CelebrityData[]);
        }

        // Load celebrities with same birthday (month and day)
        const birthDate = new Date(data.date_of_birth);
        const birthMonth = birthDate.getMonth() + 1;
        const birthDay = birthDate.getDate();
        
        const { data: sameBirthday } = await supabase.rpc(
          'get_celebrities_by_birthday',
          { birth_month: birthMonth, birth_day: birthDay }
        );
        
        if (sameBirthday) {
          setSameBirthdayCelebrities((sameBirthday as CelebrityData[]).filter(c => c.profile_slug !== profileSlug).slice(0, 3));
        }

        // Load celebrities with same zodiac sign
        if (data.zodiac_sign) {
          const { data: sameZodiac } = await supabase
            .from("celebrities")
            .select("*")
            .eq("zodiac_sign", data.zodiac_sign)
            .neq("profile_slug", profileSlug)
            .limit(3);
          
          if (sameZodiac) {
            setSameZodiacCelebrities(sameZodiac as CelebrityData[]);
          }
        }
      }
      setLoading(false);
    };

    loadCelebrity();
  }, [profileSlug]);

  // Intersection Observer for active section highlighting
  useEffect(() => {
    if (!celebrity) return;

    const sections = [
      "about-section",
      "before-fame-section",
      "trivia-section",
      "family-life-section",
      "known-for-section",
      "fans-viewed-section"
    ];

    const observerOptions = {
      root: null,
      rootMargin: "-20% 0px -70% 0px",
      threshold: 0
    };

    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, observerOptions);

    sections.forEach((sectionId) => {
      const element = document.getElementById(sectionId);
      if (element && observerRef.current) {
        observerRef.current.observe(element);
      }
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [celebrity]);

  useEffect(() => {
    if (!celebrity?.date_of_birth) return;

    const calculateAge = () => {
      const birthDate = new Date(celebrity.date_of_birth);
      const now = new Date();

      const years = differenceInYears(now, birthDate);
      const months = differenceInMonths(now, birthDate) % 12;
      const totalDays = differenceInDays(now, birthDate);
      const days = differenceInDays(now, addYears(birthDate, years)) - (months * 30);
      const hours = differenceInHours(now, birthDate) % 24;
      const minutes = differenceInMinutes(now, birthDate) % 60;
      const seconds = differenceInSeconds(now, birthDate) % 60;

      const nextBirthday = new Date(now.getFullYear(), birthDate.getMonth(), birthDate.getDate());
      if (nextBirthday < now) {
        nextBirthday.setFullYear(now.getFullYear() + 1);
      }
      const nextBirthdayDays = differenceInDays(nextBirthday, now);

      setAgeData({
        years,
        months,
        days,
        hours,
        minutes,
        seconds,
        totalDays,
        totalHours: differenceInHours(now, birthDate),
        totalMinutes: differenceInMinutes(now, birthDate),
        totalSeconds: differenceInSeconds(now, birthDate),
        nextBirthdayDays,
      });
    };

    calculateAge();
    const interval = setInterval(calculateAge, 1000);
    return () => clearInterval(interval);
  }, [celebrity]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!celebrity) {
    return (
      <>
        <Helmet>
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Celebrity Not Found</h1>
            <Link to="/famous-birthdays" className="text-primary hover:underline flex items-center justify-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Directory
            </Link>
          </div>
        </div>
      </>
    );
  }

  const popularityRanks = celebrity.popularity_ranks || {};

  const handleShare = async () => {
    const shareUrl = `${SITE_CONFIG.canonicalUrl}/people/${celebrity.profile_slug}`;
    await triggerNativeShare({
      title: `${celebrity.name} Profile`,
      text: `Check out this profile for ${celebrity.name} on Ai Age Calculator.`,
      url: shareUrl,
    });
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: celebrity.name,
    birthDate: celebrity.date_of_birth,
    birthPlace: celebrity.place_of_birth,
    jobTitle: celebrity.profession,
    image: celebrity.profile_image_url,
    description: celebrity.meta_description,
  };

  return (
    <PageTransition>
    <>
      <SEOHead
        title={celebrity.meta_title}
        description={celebrity.meta_description}
        image={celebrity.profile_image_url}
        url={`https://aiagecalc.com/people/${celebrity.profile_slug}`}
        type="profile"
        keywords={`${celebrity.name}, ${celebrity.profession}, ${celebrity.zodiac_sign}, celebrity birthday, famous birthdays`}
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border bg-card">
          <div className="container mx-auto px-4 py-4">
            <Link 
              to="/famous-birthdays" 
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Directory
            </Link>
          </div>
        </header>

        {/* Main Two-Column Layout */}
        <main className="container mx-auto py-8 max-w-7xl">
          <div className="profile-layout-container">
            {/* Profile Image Block */}
            <div id="profile-image-block" className="w-full">
              <img 
                src={celebrity.profile_image_url} 
                alt={celebrity.name}
                className="w-full max-w-2xl max-h-[450px] mx-auto rounded-2xl shadow-lg object-cover"
              />
            </div>

            {/* Main Content Block */}
            <div id="profile-main-content-block" className="space-y-8">
              {/* Main Biography Content */}
              <Card>
                <CardContent className="p-6 md:p-8">
                  <div 
                    className="prose prose-lg dark:prose-invert max-w-none [&_h2]:text-primary [&_h2]:font-bold [&_h2]:text-2xl [&_h2]:mb-4 [&_h2]:mt-6 [&_h2]:scroll-mt-20"
                    dangerouslySetInnerHTML={{ 
                      __html: DOMPurify.sanitize(celebrity.main_content, {
                        ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'h2', 'h3', 'ul', 'ol', 'li', 'a', 'blockquote', 'code', 'pre'],
                        ALLOWED_ATTR: ['id', 'class', 'href', 'target', 'rel']
                      })
                        .replace(/<h2>/g, '<h2 id="about-section">')
                        .replace(/<h2([^>]*)>Before Fame<\/h2>/i, '<h2$1 id="before-fame-section">Before Fame</h2>')
                        .replace(/<h2([^>]*)>Trivia<\/h2>/i, '<h2$1 id="trivia-section">Trivia</h2>')
                        .replace(/<h2([^>]*)>Family Life<\/h2>/i, '<h2$1 id="family-life-section">Family Life</h2>')
                    }}
                  />
                </CardContent>
              </Card>

              {/* Known For Section */}
              {celebrity.known_for_data && celebrity.known_for_data.length > 0 && (
                <Card id="known-for-section" className="bg-gradient-to-br from-card via-card to-primary/5 scroll-mt-20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-2xl">
                      <Star className="w-6 h-6 text-primary" />
                      Known For
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 -mx-2 px-2">
                      {celebrity.known_for_data.map((item: any, index: number) => (
                        <div
                          key={index}
                          className="flex-none w-[220px] group cursor-pointer"
                        >
                          <div className="bg-card rounded-xl shadow-card overflow-hidden border border-border transition-all duration-300 hover:shadow-lg hover:-translate-y-2">
                            <div className="aspect-[2/3] overflow-hidden bg-muted relative">
                              {item.imageURL ? (
                                <img
                                  src={item.imageURL}
                                  alt={item.title || 'Known for item'}
                                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/30 via-primary/20 to-primary/10">
                                  <Star className="w-16 h-16 text-primary/60" />
                                </div>
                              )}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </div>
                            <div className="p-4">
                              <h3 className="font-bold text-foreground text-base mb-1 group-hover:text-primary transition-colors line-clamp-2 min-h-[3rem]">
                                {item.title || 'Untitled'}
                              </h3>
                              {item.year && (
                                <p className="text-sm text-muted-foreground font-medium">{item.year}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* AdSense Banner */}
              <div className="my-8">
                <AdSenseBanner 
                  adSlot="in-article"
                  format="horizontal"
                />
              </div>

              {/* More Birthdays Section */}
              {sameBirthdayCelebrities.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>
                      More {new Date(celebrity.date_of_birth).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} Birthdays
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {sameBirthdayCelebrities.map((celeb) => (
                        <Link
                          key={celeb.profile_slug}
                          to={`/people/${celeb.profile_slug}`}
                          className="group"
                        >
                          <div className="aspect-square overflow-hidden rounded-full mb-2">
                            <img 
                              src={celeb.profile_image_url} 
                              alt={celeb.name}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                            />
                          </div>
                          <h3 className="font-semibold text-sm text-center text-foreground group-hover:text-primary transition-colors">
                            {celeb.name}
                          </h3>
                          <p className="text-xs text-muted-foreground text-center">{celeb.profession}</p>
                        </Link>
                      ))}
                      <div className="flex flex-col items-center justify-center aspect-square rounded-full bg-muted cursor-pointer hover:bg-muted/80 transition-colors">
                        <span className="text-2xl font-bold text-primary">+</span>
                        <span className="text-xs text-muted-foreground mt-1">More</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* More Zodiac Section */}
              {sameZodiacCelebrities.length > 0 && celebrity.zodiac_sign && (
                <Card>
                  <CardHeader>
                    <CardTitle>More {celebrity.zodiac_sign}s</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {sameZodiacCelebrities.map((celeb) => (
                        <Link
                          key={celeb.profile_slug}
                          to={`/people/${celeb.profile_slug}`}
                          className="group"
                        >
                          <div className="aspect-square overflow-hidden rounded-full mb-2">
                            <img 
                              src={celeb.profile_image_url} 
                              alt={celeb.name}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                            />
                          </div>
                          <h3 className="font-semibold text-sm text-center text-foreground group-hover:text-primary transition-colors">
                            {celeb.name}
                          </h3>
                          <p className="text-xs text-muted-foreground text-center">{celeb.profession}</p>
                        </Link>
                      ))}
                      <div className="flex flex-col items-center justify-center aspect-square rounded-full bg-muted cursor-pointer hover:bg-muted/80 transition-colors">
                        <span className="text-2xl font-bold text-primary">+</span>
                        <span className="text-xs text-muted-foreground mt-1">More</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Fans Also Viewed Section */}
              {relatedCelebrities.length > 0 && (
                <Card id="fans-viewed-section" className="scroll-mt-20">
                  <CardHeader>
                    <CardTitle>Fans Also Viewed</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {relatedCelebrities.map((celeb) => (
                        <Link
                          key={celeb.profile_slug}
                          to={`/people/${celeb.profile_slug}`}
                          className="group bg-card rounded-2xl shadow-card overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border border-border"
                        >
                          <div className="aspect-square overflow-hidden">
                            <img 
                              src={celeb.profile_image_url} 
                              alt={celeb.name}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                            />
                          </div>
                          <div className="p-4">
                            <h3 className="font-bold text-foreground text-lg mb-1 group-hover:text-primary transition-colors">
                              {celeb.name}
                            </h3>
                            <p className="text-sm text-muted-foreground">{celeb.profession}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar Block */}
            <div id="profile-sidebar-block" className="space-y-6">
              {/* Fact Sheet */}
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <CardTitle className="text-3xl flex-1">{celebrity.name}</CardTitle>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleShare}
                      className="flex-shrink-0"
                      aria-label="Share profile"
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Star className="w-5 h-5 text-primary" />
                    <Link 
                      to={`/profession/${celebrity.profession.toLowerCase().replace(/\s+/g, "-")}`}
                      className="hover:text-primary hover:underline transition-colors"
                    >
                      {celebrity.profession}
                    </Link>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Calendar className="w-5 h-5 text-primary" />
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">🎂 Birthday</div>
                      <div className="font-medium text-foreground">
                        {new Date(celebrity.date_of_birth).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </div>
                    </div>
                  </div>
                  {celebrity.place_of_birth && (
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <MapPin className="w-5 h-5 text-primary" />
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">📍 Birthplace</div>
                        <div className="font-medium text-foreground">{celebrity.place_of_birth}</div>
                      </div>
                    </div>
                  )}
                  {celebrity.zodiac_sign && (
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Star className="w-5 h-5 text-primary" />
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">✨ Birth Sign</div>
                        <Link 
                          to={`/zodiac/${celebrity.zodiac_sign.toLowerCase()}`}
                          className="font-medium text-foreground hover:text-primary hover:underline transition-colors"
                        >
                          {celebrity.zodiac_sign}
                        </Link>
                      </div>
                    </div>
                  )}
                  {ageData && (
                    <div className="pt-4 border-t border-border">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-primary mb-1">
                          {ageData.years}
                        </div>
                        <div className="text-sm text-muted-foreground">Years Old</div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Main Popularity Rank */}
              {popularityRanks.most_popular && (
                <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
                  <CardContent className="p-6 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <TrendingUp className="w-6 h-6 text-primary" />
                      <span className="text-lg font-semibold text-foreground">Most Popular</span>
                    </div>
                    <div className="text-5xl font-bold text-primary">
                      #{popularityRanks.most_popular}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Live Age Counter */}
              {ageData && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Live Age Counter</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Traditional Age Breakdown */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-muted rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-primary">{ageData.years}</div>
                        <div className="text-xs text-muted-foreground">Years</div>
                      </div>
                      <div className="bg-muted rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-primary">{ageData.months}</div>
                        <div className="text-xs text-muted-foreground">Months</div>
                      </div>
                      <div className="bg-muted rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-primary">{ageData.days}</div>
                        <div className="text-xs text-muted-foreground">Days</div>
                      </div>
                    </div>

                    {/* Total Time Lived */}
                    <div className="space-y-2 pt-2 border-t border-border">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total Days:</span>
                        <span className="font-semibold text-foreground">{ageData.totalDays.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total Hours:</span>
                        <span className="font-semibold text-foreground">{ageData.totalHours.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total Minutes:</span>
                        <span className="font-semibold text-foreground">{ageData.totalMinutes.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Next Birthday */}
                    <div className="pt-2 border-t border-border">
                      <div className="bg-primary/10 rounded-lg p-3 text-center">
                        <div className="text-sm text-muted-foreground mb-1">Next Birthday</div>
                        <div className="text-2xl font-bold text-primary">{ageData.nextBirthdayDays}</div>
                        <div className="text-xs text-muted-foreground">Days Away</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Popularity Grid */}
              {Object.keys(popularityRanks).length > 1 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Popularity Rankings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      {popularityRanks.age_rank && (
                        <div className="bg-muted rounded-lg p-4 text-center">
                          <div className="text-2xl font-bold text-primary">
                            #{popularityRanks.age_rank}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Age Rank
                          </div>
                        </div>
                      )}
                      {popularityRanks.profession_rank && (
                        <div className="bg-muted rounded-lg p-4 text-center">
                          <div className="text-2xl font-bold text-primary">
                            #{popularityRanks.profession_rank}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {celebrity.profession}
                          </div>
                        </div>
                      )}
                      {popularityRanks.birthplace_rank && (
                        <div className="bg-muted rounded-lg p-4 text-center">
                          <div className="text-2xl font-bold text-primary">
                            #{popularityRanks.birthplace_rank}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Birthplace
                          </div>
                        </div>
                      )}
                      {popularityRanks.zodiac_rank && (
                        <div className="bg-muted rounded-lg p-4 text-center">
                          <div className="text-2xl font-bold text-primary">
                            #{popularityRanks.zodiac_rank}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {celebrity.zodiac_sign}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Table of Contents */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">On This Page</CardTitle>
                </CardHeader>
                <CardContent>
                  <nav className="space-y-1">
                    <a 
                      href="#about-section" 
                      className={`on-page-menu-link ${activeSection === 'about-section' ? 'active-section' : ''}`}
                    >
                      About
                    </a>
                    <a 
                      href="#before-fame-section" 
                      className={`on-page-menu-link ${activeSection === 'before-fame-section' ? 'active-section' : ''}`}
                    >
                      Before Fame
                    </a>
                    <a 
                      href="#trivia-section" 
                      className={`on-page-menu-link ${activeSection === 'trivia-section' ? 'active-section' : ''}`}
                    >
                      Trivia
                    </a>
                    <a 
                      href="#family-life-section" 
                      className={`on-page-menu-link ${activeSection === 'family-life-section' ? 'active-section' : ''}`}
                    >
                      Family Life
                    </a>
                    <a 
                      href="#known-for-section" 
                      className={`on-page-menu-link ${activeSection === 'known-for-section' ? 'active-section' : ''}`}
                    >
                      Known For
                    </a>
                    <a 
                      href="#fans-viewed-section" 
                      className={`on-page-menu-link ${activeSection === 'fans-viewed-section' ? 'active-section' : ''}`}
                    >
                      Fans Also Viewed
                    </a>
                  </nav>
                </CardContent>
              </Card>

              {/* AdSense Vertical Banner */}
              <div className="sticky top-4">
                <AdSenseBanner 
                  adSlot="sidebar"
                  format="vertical"
                />
              </div>
            </div>
          </div>
        </main>

        {/* Back to Top Button */}
        <BackToTop targetSelector="#profile-image-block" />
      </div>
    </>
    </PageTransition>
  );
};

export default CelebrityProfile;
