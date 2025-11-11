import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, MapPin, Calendar, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AgeDisplayFormats } from "@/components/AgeDisplayFormats";
import { AdditionalAgeInfo } from "@/components/AdditionalAgeInfo";
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
          <Link to="/" className="text-primary hover:underline flex items-center justify-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Directory
          </Link>
        </div>
      </div>
    );
  }

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
              to="/" 
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Directory
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8 max-w-5xl">
          {/* Hero Section */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                {celebrity.name}
              </h1>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Star className="w-5 h-5 text-primary" />
                  <span className="text-lg">{celebrity.profession}</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Calendar className="w-5 h-5 text-primary" />
                  <span>{new Date(celebrity.date_of_birth).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</span>
                </div>
                {celebrity.place_of_birth && (
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <MapPin className="w-5 h-5 text-primary" />
                    <span>{celebrity.place_of_birth}</span>
                  </div>
                )}
              </div>

              {/* Popularity Ranks */}
              {celebrity.popularity_ranks && (
                <div className="flex flex-wrap gap-3">
                  {celebrity.popularity_ranks.most_popular && (
                    <div className="bg-pink-100 dark:bg-pink-900/20 text-pink-700 dark:text-pink-300 px-4 py-2 rounded-full text-sm font-medium">
                      Most Popular #{celebrity.popularity_ranks.most_popular}
                    </div>
                  )}
                  {celebrity.popularity_ranks.age_rank && (
                    <div className="bg-pink-100 dark:bg-pink-900/20 text-pink-700 dark:text-pink-300 px-4 py-2 rounded-full text-sm font-medium">
                      Age Rank #{celebrity.popularity_ranks.age_rank}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-start justify-center">
              <img 
                src={celebrity.profile_image_url} 
                alt={celebrity.name}
                className="w-full max-w-md rounded-2xl shadow-lg object-cover"
              />
            </div>
          </div>

          {/* Age Counter */}
          {ageData && (
            <div className="mb-12">
              <div className="bg-card rounded-2xl shadow-card p-6 md:p-8 mb-6">
                <h2 className="text-3xl font-bold text-center text-foreground mb-2">
                  Current Age
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                  <div className="text-center">
                    <div className="text-4xl md:text-5xl font-bold text-primary tabular-nums">
                      {ageData.years}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">Years</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl md:text-5xl font-bold text-primary tabular-nums">
                      {ageData.months}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">Months</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl md:text-5xl font-bold text-primary tabular-nums">
                      {ageData.days}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">Days</div>
                  </div>
                </div>
              </div>

              <AdditionalAgeInfo
                nextBirthdayDays={ageData.nextBirthdayDays}
                zodiacSign={celebrity.zodiac_sign || ""}
                zodiacSymbol=""
              />

              <div className="mt-6">
                <AgeDisplayFormats 
                  result={ageData} 
                  timezone={Intl.DateTimeFormat().resolvedOptions().timeZone}
                />
              </div>
            </div>
          )}

          {/* Main Biography Content */}
          <div className="bg-card rounded-2xl shadow-card p-6 md:p-8 mb-8">
            <div 
              className="prose prose-lg dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: celebrity.main_content }}
            />
          </div>

          {/* AdSense Placeholder */}
          <div className="my-8">
            <AdSenseBanner 
              adSlot="in-article"
              format="horizontal"
            />
          </div>
        </main>
      </div>
    </>
  );
};

export default CelebrityProfile;
