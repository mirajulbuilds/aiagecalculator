import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, MapPin, Calendar, Star, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdSenseBanner } from "@/components/AdSenseBanner";
import { differenceInYears, differenceInMonths, differenceInDays, differenceInHours, differenceInMinutes, differenceInSeconds, addYears } from "date-fns";

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
}

const CelebrityProfile = () => {
  const { profileSlug } = useParams<{ profileSlug: string }>();
  const [celebrity, setCelebrity] = useState<CelebrityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [ageData, setAgeData] = useState<any>(null);
  const [relatedCelebrities, setRelatedCelebrities] = useState<CelebrityData[]>([]);
  const [sameBirthdayCelebrities, setSameBirthdayCelebrities] = useState<CelebrityData[]>([]);
  const [sameZodiacCelebrities, setSameZodiacCelebrities] = useState<CelebrityData[]>([]);

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
        
        // Load related celebrities (same profession)
        const { data: related } = await supabase
          .from("celebrities")
          .select("*")
          .eq("profession", data.profession)
          .neq("id", data.id)
          .limit(8);
        
        if (related) {
          setRelatedCelebrities(related as CelebrityData[]);
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Celebrity Not Found</h1>
          <Link to="/famous-birthdays" className="text-primary hover:underline flex items-center justify-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Directory
          </Link>
        </div>
      </div>
    );
  }

  const popularityRanks = celebrity.popularity_ranks || {};

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
    <>
      <Helmet>
        <title>{celebrity.meta_title}</title>
        <meta name="description" content={celebrity.meta_description} />
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
        <main className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
            {/* Main Content - Shows SECOND on mobile, FIRST (left) on desktop */}
            <div className="order-2 lg:order-1 lg:flex-[2] space-y-8">
              {/* Main Profile Image */}
              <div className="w-full">
                <img 
                  src={celebrity.profile_image_url} 
                  alt={celebrity.name}
                  className="w-full max-w-2xl max-h-[450px] mx-auto rounded-2xl shadow-lg object-cover"
                />
              </div>

              {/* Main Biography Content */}
              <Card>
                <CardContent className="p-6 md:p-8">
                  <div 
                    className="prose prose-lg dark:prose-invert max-w-none [&_h2]:text-primary [&_h2]:font-bold [&_h2]:text-2xl [&_h2]:mb-4 [&_h2]:mt-6"
                    dangerouslySetInnerHTML={{ __html: celebrity.main_content }}
                  />
                </CardContent>
              </Card>

              {/* Known For Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-primary" />
                    Known For
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4">
                    {/* Placeholder - will be populated with career highlights */}
                    <p className="text-muted-foreground text-sm">Career highlights coming soon</p>
                  </div>
                </CardContent>
              </Card>

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
                <Card>
                  <CardHeader>
                    <CardTitle>Fans Also Viewed</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {relatedCelebrities.map((celeb) => (
                        <Link
                          key={celeb.profile_slug}
                          to={`/people/${celeb.profile_slug}`}
                          className="group"
                        >
                          <div className="aspect-square overflow-hidden rounded-lg mb-2">
                            <img 
                              src={celeb.profile_image_url} 
                              alt={celeb.name}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                            />
                          </div>
                          <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                            {celeb.name}
                          </h3>
                          <p className="text-xs text-muted-foreground">{celeb.profession}</p>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar - Shows FIRST on mobile, SECOND (right) on desktop */}
            <div className="order-1 lg:order-2 lg:flex-1 space-y-6 lg:sticky lg:top-5">
              {/* Fact Sheet */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-3xl">{celebrity.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Star className="w-5 h-5 text-primary" />
                    <span>{celebrity.profession}</span>
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
                        <div className="font-medium text-foreground">{celebrity.zodiac_sign}</div>
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
      </div>
    </>
  );
};

export default CelebrityProfile;
