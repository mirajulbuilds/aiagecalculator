import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { SEOHead } from "@/components/SEOHead";
import { MapPin, Calendar, Star, TrendingUp, Share2, Heart, Calculator, Copy, ChevronRight, Cake } from "lucide-react";
import DOMPurify from "dompurify";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AdSenseBanner } from "@/components/AdSenseBanner";
import { differenceInYears, differenceInMonths, differenceInDays, differenceInHours, differenceInMinutes, differenceInSeconds, addYears, format } from "date-fns";
import PageTransition from "@/components/PageTransition";
import { BackToTop } from "@/components/BackToTop";
import { SITE_CONFIG } from "@/lib/config";
import { toast } from "sonner";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

// CelebrityData interface
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

// Helper: get generation name from birth year
const getGenerationName = (year: number): string => {
  if (year >= 2013) return "Gen Alpha";
  if (year >= 1997) return "Gen Z";
  if (year >= 1981) return "Millennial";
  if (year >= 1965) return "Gen X";
  if (year >= 1946) return "Baby Boomer";
  if (year >= 1928) return "Silent Generation";
  return "Greatest Generation";
};

// Helper: get Chinese zodiac animal from birth year
const getChineseZodiac = (year: number): string => {
  const animals = ["Rat", "Ox", "Tiger", "Rabbit", "Dragon", "Snake", "Horse", "Goat", "Monkey", "Rooster", "Dog", "Pig"];
  return animals[(year - 4) % 12];
};

const CelebrityProfile = () => {
  const { profile: authProfile } = useAuth();
  const { profileSlug } = useParams<{ profileSlug: string }>();
  const [celebrity, setCelebrity] = useState<CelebrityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [ageData, setAgeData] = useState<any>(null);
  const [relatedCelebrities, setRelatedCelebrities] = useState<CelebrityData[]>([]);
  const [sameBirthdayCelebrities, setSameBirthdayCelebrities] = useState<CelebrityData[]>([]);
  const [sameZodiacCelebrities, setSameZodiacCelebrities] = useState<CelebrityData[]>([]);
  const [activeSection, setActiveSection] = useState<string>("about-section");
  const observerRef = useRef<IntersectionObserver | null>(null);
  const [userBirthDay, setUserBirthDay] = useState("");
  const [userBirthMonth, setUserBirthMonth] = useState("");
  const [userBirthYear, setUserBirthYear] = useState("");
  const [comparisonResult, setComparisonResult] = useState("");

  // Pre-fill age comparison from user profile
  useEffect(() => {
    if (authProfile?.date_of_birth && celebrity && !userBirthDay && !userBirthMonth && !userBirthYear) {
      const dob = new Date(authProfile.date_of_birth);
      const day = dob.getDate().toString();
      const month = (dob.getMonth() + 1).toString();
      const year = dob.getFullYear().toString();
      setUserBirthDay(day);
      setUserBirthMonth(month);
      setUserBirthYear(year);
      // Auto-calculate
      const userDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      const celebDate = new Date(celebrity.date_of_birth);
      const diff = differenceInYears(celebDate, userDate);
      if (diff > 0) {
        setComparisonResult(`You were ${diff} year${diff !== 1 ? 's' : ''} old when ${celebrity.name} was born.`);
      } else if (diff < 0) {
        setComparisonResult(`You were born ${Math.abs(diff)} year${Math.abs(diff) !== 1 ? 's' : ''} after ${celebrity.name}.`);
      } else {
        setComparisonResult(`You and ${celebrity.name} were born in the same year!`);
      }
    }
  }, [authProfile, celebrity]);

  useEffect(() => {
    const loadCelebrity = async () => {
      // --- prerender ডেটা থাকলে সেটাই ব্যবহার করো, নেটওয়ার্ক কল নয় ---
      const pre = (window as any).__PRERENDER_DATA__;
      if (pre?.celebrity?.profile_slug && pre.celebrity.profile_slug === profileSlug) {
        setCelebrity(pre.celebrity as CelebrityData);
        setRelatedCelebrities((pre.related || []).slice(0, 8) as CelebrityData[]);
        setSameBirthdayCelebrities((pre.sameBirthday || []).slice(0, 3) as CelebrityData[]);
        setSameZodiacCelebrities((pre.sameZodiac || []).slice(0, 3) as CelebrityData[]);
        setLoading(false);
        return;
      }
      const tempPreview = sessionStorage.getItem("temp_profile_preview");
      
      if (tempPreview) {
        try {
          const parsed = JSON.parse(tempPreview);
          if (parsed.is_preview === true) {
            console.log("Loading preview data:", parsed.name);
            setCelebrity(parsed as CelebrityData);
            sessionStorage.removeItem("temp_profile_preview");
            setLoading(false);
            return;
          }
        } catch (e) {
          console.error("Error parsing preview data:", e);
          sessionStorage.removeItem("temp_profile_preview");
        }
      }

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
        
        const { data: related } = await supabase
          .from("celebrities")
          .select("*")
          .eq("profession", data.profession)
          .neq("id", data.id)
          .limit(20);
        
      if (related && related.length > 0) {
          const sorted = [...related].sort((a, b) => a.name.localeCompare(b.name));
          setRelatedCelebrities(sorted.slice(0, 4) as CelebrityData[]);
        }

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
              Back to Directory
            </Link>
          </div>
        </div>
      </>
    );
  }

  const popularityRanks = celebrity.popularity_ranks || {};
  const shareUrl = `${SITE_CONFIG.canonicalUrl}/people/${celebrity.profile_slug}`;
  const shareText = `Check out ${celebrity.name}'s profile on AiAgeCalc!`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied to clipboard!");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleShareTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  const handleShareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  const handleShareWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`, '_blank');
  };

  // Fun facts calculations
  const birthDate = new Date(celebrity.date_of_birth);
  const birthYear = birthDate.getFullYear();
  const dayOfWeekBorn = format(birthDate, "EEEE");
  const generationName = getGenerationName(birthYear);
  const chineseZodiac = getChineseZodiac(birthYear);
  const estimatedHeartbeats = ageData ? Math.round(ageData.totalMinutes * 72) : 0;

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

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": SITE_CONFIG.canonicalUrl },
      { "@type": "ListItem", "position": 2, "name": "Famous Birthdays", "item": `${SITE_CONFIG.canonicalUrl}/famous-birthdays` },
      { "@type": "ListItem", "position": 3, "name": celebrity.name, "item": `${SITE_CONFIG.canonicalUrl}/people/${celebrity.profile_slug}` },
    ]
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
        <script type="application/ld+json">{JSON.stringify(breadcrumbJsonLd)}</script>
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Breadcrumb Header */}
        <header className="border-b border-border bg-card">
          <div className="container mx-auto px-4 py-4">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/">Home</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/famous-birthdays">Famous Birthdays</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{celebrity.name}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
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
                        <div key={index} className="flex-none w-[220px] group cursor-pointer">
                          <div className="bg-card rounded-xl shadow-card overflow-hidden border border-border transition-all duration-300 hover:shadow-lg hover:-translate-y-2">
                            <div className="aspect-[2/3] overflow-hidden bg-muted relative">
                              {item.imageURL ? (
                                <img src={item.imageURL} alt={item.title || 'Known for item'} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
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
                              {item.year && <p className="text-sm text-muted-foreground font-medium">{item.year}</p>}
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
                <AdSenseBanner adSlot="in-article" format="horizontal" />
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
                        <Link key={celeb.profile_slug} to={`/people/${celeb.profile_slug}`} className="group">
                          <div className="aspect-square overflow-hidden rounded-full mb-2">
                            <img src={celeb.profile_image_url} alt={celeb.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                          </div>
                          <h3 className="font-semibold text-sm text-center text-foreground group-hover:text-primary transition-colors">{celeb.name}</h3>
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
                        <Link key={celeb.profile_slug} to={`/people/${celeb.profile_slug}`} className="group">
                          <div className="aspect-square overflow-hidden rounded-full mb-2">
                            <img src={celeb.profile_image_url} alt={celeb.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                          </div>
                          <h3 className="font-semibold text-sm text-center text-foreground group-hover:text-primary transition-colors">{celeb.name}</h3>
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
                            <img src={celeb.profile_image_url} alt={celeb.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                          </div>
                          <div className="p-4">
                            <h3 className="font-bold text-foreground text-lg mb-1 group-hover:text-primary transition-colors">{celeb.name}</h3>
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
                <CardHeader className="pb-4">
                  {/* Profession eyebrow — gold uppercase */}
                  <Link
                    to={`/profession/${celebrity.profession.toLowerCase().replace(/\s+/g, "-")}`}
                    className="text-xs font-medium uppercase tracking-[0.08em] text-[hsl(var(--gold-deep))] dark:text-[hsl(var(--gold))] hover:underline transition-colors"
                  >
                    {celebrity.profession}
                  </Link>
                  <h1 className="font-display text-3xl font-semibold leading-tight tracking-tight text-foreground mt-1.5">
                    {celebrity.name}
                    <span className="sr-only"> — Age, Birthday &amp; Biography</span>
                  </h1>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Current age — gold tinted card */}
                  {ageData && (
                    <div
                      className="rounded-2xl border p-4 sm:p-5"
                      style={{
                        background: 'linear-gradient(145deg, hsl(var(--gold) / 0.10), hsl(var(--gold) / 0.03))',
                        borderColor: 'hsl(var(--gold) / 0.22)',
                      }}
                    >
                      <p className="text-[11px] font-medium uppercase tracking-[0.05em] text-[hsl(var(--gold-deep))] dark:text-[hsl(var(--gold))] mb-1">
                        Current age
                      </p>
                      <div className="flex items-baseline gap-2">
                        <span
                          className="font-display text-5xl sm:text-6xl font-semibold leading-none bg-clip-text text-transparent"
                          style={{ backgroundImage: 'var(--gradient-gold)' }}
                        >
                          {ageData.years}
                        </span>
                        <span className="text-[15px] text-muted-foreground">years old</span>
                      </div>
                      <p className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2">
                        <Cake className="w-3.5 h-3.5 text-[hsl(var(--gold-deep))] dark:text-[hsl(var(--gold))]" />
                        Next birthday in {ageData.nextBirthdayDays} days
                      </p>
                    </div>
                  )}

                  {/* Info rows — label left, value right */}
                  <div className="flex flex-col gap-2.5">
                    <div className="flex items-center gap-2.5 text-[13px]">
                      <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Calendar className="w-[15px] h-[15px] text-primary" />
                      </span>
                      <span className="text-muted-foreground">Born</span>
                      <span className="ml-auto text-right font-medium text-foreground">
                        {new Date(celebrity.date_of_birth).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                    </div>

                    {celebrity.place_of_birth && (
                      <div className="flex items-center gap-2.5 text-[13px]">
                        <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                          <MapPin className="w-[15px] h-[15px] text-primary" />
                        </span>
                        <span className="text-muted-foreground">Birthplace</span>
                        <span className="ml-auto text-right font-medium text-foreground">{celebrity.place_of_birth}</span>
                      </div>
                    )}

                    {celebrity.zodiac_sign && (
                      <div className="flex items-center gap-2.5 text-[13px]">
                        <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Star className="w-[15px] h-[15px] text-primary" />
                        </span>
                        <span className="text-muted-foreground">Zodiac</span>
                        <Link
                          to={`/zodiac/${celebrity.zodiac_sign.toLowerCase()}`}
                          className="ml-auto text-right font-medium text-foreground hover:text-primary hover:underline transition-colors"
                        >
                          {celebrity.zodiac_sign}
                        </Link>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Social Share Bar */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Share2 className="w-5 h-5 text-primary" />
                    Share This Profile
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" onClick={handleShareTwitter} className="gap-2">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                      Twitter/X
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleShareFacebook} className="gap-2">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                      Facebook
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleShareWhatsApp} className="gap-2">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                      WhatsApp
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleCopyLink} className="gap-2">
                      <Copy className="w-4 h-4" />
                      Copy Link
                    </Button>
                  </div>
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

              {/* Did You Know? Fun Facts */}
              {ageData && (
                <Card className="bg-gradient-to-br from-accent/30 to-primary/5">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Heart className="w-5 h-5 text-primary" />
                      Did You Know?
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-3">
                      <span className="text-lg">📅</span>
                      <p className="text-sm text-foreground">
                        {celebrity.name} was born on a <span className="font-semibold text-primary">{dayOfWeekBorn}</span>
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-lg">💓</span>
                      <p className="text-sm text-foreground">
                        Estimated <span className="font-semibold text-primary">{estimatedHeartbeats.toLocaleString()}</span> heartbeats since birth
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-lg">👥</span>
                      <p className="text-sm text-foreground">
                        Part of the <span className="font-semibold text-primary">{generationName}</span> generation
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-lg">🐉</span>
                      <p className="text-sm text-foreground">
                        Chinese Zodiac: <span className="font-semibold text-primary">{chineseZodiac}</span>
                      </p>
                    </div>
                    {sameBirthdayCelebrities.length > 0 && (
                      <div className="flex items-start gap-3">
                        <span className="text-lg">🎂</span>
                        <p className="text-sm text-foreground">
                          Shares a birthday with{" "}
                          {sameBirthdayCelebrities.slice(0, 3).map((celeb, idx, arr) => (
                            <span key={celeb.profile_slug}>
                              <Link to={`/people/${celeb.profile_slug}`} className="font-semibold text-primary hover:underline">
                                {celeb.name}
                              </Link>
                              {idx < arr.length - 1 && ", "}
                            </span>
                          ))}
                          {sameBirthdayCelebrities.length > 3 && ` and ${sameBirthdayCelebrities.length - 3} others`}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Age Comparison Calculator */}
              <Card className="bg-gradient-to-br from-primary/10 to-accent/20 border-primary/20">
                <CardContent className="p-6">
                  <Calculator className="w-8 h-8 text-primary mx-auto mb-3" />
                  <h3 className="font-bold text-foreground mb-3 text-center">
                    How old were you when {celebrity.name} was born?
                  </h3>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <select
                      className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                      value={userBirthDay}
                      onChange={(e) => { setUserBirthDay(e.target.value); setComparisonResult(""); }}
                    >
                      <option value="">Day</option>
                      {Array.from({ length: 31 }, (_, i) => (
                        <option key={i + 1} value={String(i + 1)}>{i + 1}</option>
                      ))}
                    </select>
                    <select
                      className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                      value={userBirthMonth}
                      onChange={(e) => { setUserBirthMonth(e.target.value); setComparisonResult(""); }}
                    >
                      <option value="">Month</option>
                      {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((m, i) => (
                        <option key={i} value={String(i + 1)}>{m}</option>
                      ))}
                    </select>
                    <select
                      className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                      value={userBirthYear}
                      onChange={(e) => { setUserBirthYear(e.target.value); setComparisonResult(""); }}
                    >
                      <option value="">Year</option>
                      {Array.from({ length: 130 }, (_, i) => {
                        const y = new Date().getFullYear() - i;
                        return <option key={y} value={String(y)}>{y}</option>;
                      })}
                    </select>
                  </div>
                  <Button
                    variant="default"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      if (!userBirthDay || !userBirthMonth || !userBirthYear) {
                        toast.error("Please select your full date of birth");
                        return;
                      }
                      const userDob = new Date(parseInt(userBirthYear), parseInt(userBirthMonth) - 1, parseInt(userBirthDay));
                      const celebDob = new Date(celebrity.date_of_birth);
                      if (isNaN(userDob.getTime())) { toast.error("Invalid date"); return; }
                      const diff = differenceInYears(celebDob, userDob);
                      if (userDob.getTime() === celebDob.getTime()) {
                        setComparisonResult(`🎉 You share a birthday with ${celebrity.name}!`);
                      } else if (userDob < celebDob) {
                        setComparisonResult(`You were ${diff} year${diff !== 1 ? "s" : ""} old when ${celebrity.name} was born`);
                      } else {
                        const absDiff = Math.abs(diff);
                        setComparisonResult(`You were born ${absDiff} year${absDiff !== 1 ? "s" : ""} after ${celebrity.name}`);
                      }
                    }}
                  >
                    Calculate
                  </Button>
                  {comparisonResult && (
                    <p className="mt-3 text-sm font-medium text-center text-foreground bg-background/60 rounded-lg p-3 animate-fade-in">
                      {comparisonResult}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Live Age Counter */}
              {ageData && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Live Age Counter</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
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
                          <div className="text-2xl font-bold text-primary">#{popularityRanks.age_rank}</div>
                          <div className="text-xs text-muted-foreground mt-1">Age Rank</div>
                        </div>
                      )}
                      {popularityRanks.profession_rank && (
                        <div className="bg-muted rounded-lg p-4 text-center">
                          <div className="text-2xl font-bold text-primary">#{popularityRanks.profession_rank}</div>
                          <div className="text-xs text-muted-foreground mt-1">{celebrity.profession}</div>
                        </div>
                      )}
                      {popularityRanks.birthplace_rank && (
                        <div className="bg-muted rounded-lg p-4 text-center">
                          <div className="text-2xl font-bold text-primary">#{popularityRanks.birthplace_rank}</div>
                          <div className="text-xs text-muted-foreground mt-1">Birthplace</div>
                        </div>
                      )}
                      {popularityRanks.zodiac_rank && (
                        <div className="bg-muted rounded-lg p-4 text-center">
                          <div className="text-2xl font-bold text-primary">#{popularityRanks.zodiac_rank}</div>
                          <div className="text-xs text-muted-foreground mt-1">{celebrity.zodiac_sign}</div>
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
                    <a href="#about-section" className={`on-page-menu-link ${activeSection === 'about-section' ? 'active-section' : ''}`}>About</a>
                    <a href="#before-fame-section" className={`on-page-menu-link ${activeSection === 'before-fame-section' ? 'active-section' : ''}`}>Before Fame</a>
                    <a href="#trivia-section" className={`on-page-menu-link ${activeSection === 'trivia-section' ? 'active-section' : ''}`}>Trivia</a>
                    <a href="#family-life-section" className={`on-page-menu-link ${activeSection === 'family-life-section' ? 'active-section' : ''}`}>Family Life</a>
                    <a href="#known-for-section" className={`on-page-menu-link ${activeSection === 'known-for-section' ? 'active-section' : ''}`}>Known For</a>
                    <a href="#fans-viewed-section" className={`on-page-menu-link ${activeSection === 'fans-viewed-section' ? 'active-section' : ''}`}>Fans Also Viewed</a>
                  </nav>
                </CardContent>
              </Card>

              {/* AdSense Vertical Banner */}
              <div className="sticky top-4">
                <AdSenseBanner adSlot="sidebar" format="vertical" />
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