import React, { useMemo, useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Calendar, MapPin, Briefcase, Users, Star, Sparkles, Instagram, Twitter, Globe, Facebook, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { differenceInYears, format } from "date-fns";
import { AdSenseBanner } from "@/components/AdSenseBanner";
import { PopularityRankCard } from "@/components/PopularityRankCard";
import { PopularityMetricsTable } from "@/components/PopularityMetricsTable";
import { CategoryMemberBadge } from "@/components/CategoryMemberBadge";
import { RelatedCelebrityCard } from "@/components/RelatedCelebrityCard";
import { CelebritySection } from "@/components/CelebritySection";
import { CelebrityAgeInfo } from "@/components/CelebrityAgeInfo";
import { supabase } from "@/integrations/supabase/client";
import celebritiesData from "@/data/explore_famous_birthdays.json";

const CelebrityDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [dbCelebrity, setDbCelebrity] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fetch celebrity from database
  useEffect(() => {
    const fetchCelebrity = async () => {
      if (!slug) return;
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('explore_famous_birthdays')
          .select('*')
          .eq('slug', slug)
          .maybeSingle();

        if (error) {
          console.error('Error fetching celebrity:', error);
        } else if (data) {
          setDbCelebrity(data);
        }
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCelebrity();
  }, [slug]);

  // Use database celebrity if available, fallback to JSON
  const celebrity = dbCelebrity || celebritiesData.celebrities.find(c => c.slug === slug);

  // Get related celebrities - MUST be before conditional returns
  const relatedCelebrities = useMemo(() => {
    if (!celebrity?.fans_also_viewed) return [];
    return celebrity.fans_also_viewed
      .map((slug: string) => celebritiesData.celebrities.find((c: any) => c.slug === slug))
      .filter(Boolean)
      .slice(0, 4);
  }, [celebrity]);

  // Get same birthday celebrities - MUST be before conditional returns
  const sameBirthdayCelebrities = useMemo(() => {
    if (!celebrity?.birthdate) return [];
    return celebritiesData.celebrities
      .filter((c: any) => {
        const cBirthDate = format(new Date(c.birthdate), 'MMMM d');
        const currentBirthDate = format(new Date(celebrity.birthdate), 'MMMM d');
        return c.id !== celebrity.id && cBirthDate === currentBirthDate;
      })
      .slice(0, 6);
  }, [celebrity]);

  // Get same zodiac sign celebrities - MUST be before conditional returns
  const sameZodiacCelebrities = useMemo(() => {
    if (!celebrity?.birth_sign) return [];
    return celebritiesData.celebrities
      .filter((c: any) => c.id !== celebrity.id && c.birth_sign === celebrity.birth_sign)
      .slice(0, 6);
  }, [celebrity]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading celebrity profile...</p>
        </div>
      </div>
    );
  }

  if (!celebrity) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Celebrity Not Found</h1>
          <p className="text-muted-foreground mb-6">The celebrity you're looking for doesn't exist.</p>
          <Link to="/famous-birthdays">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to All Celebrities
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const dateOfBirth = celebrity.dob || celebrity.birthdate;
  const age = differenceInYears(new Date(), new Date(dateOfBirth));
  const birthDate = format(new Date(dateOfBirth), 'MMMM d, yyyy');
  const birthMonth = format(new Date(dateOfBirth), 'MMMM');
  const birthDay = format(new Date(dateOfBirth), 'd');
  const socialLinks = celebrity.social_links || {};
  const birthplace = celebrity.birthplace || 'Unknown';
  const country = celebrity.country || 'Unknown';
  const profession = celebrity.profession || 'Celebrity';
  const birthSign = celebrity.birth_sign || '';
  const imageUrl = celebrity.image_url || celebrity.image;

  // Popularity metrics
  const popularityMetrics = [
    { label: "Most Popular", rank: celebrity.popularity_rank_overall || 0 },
    { label: celebrity.profession, rank: celebrity.popularity_rank_profession || 0 },
    { label: `Born in ${celebrity.country}`, rank: celebrity.popularity_rank_country || 0 },
    { label: `Born on ${birthMonth} ${birthDay}`, rank: celebrity.popularity_rank_birthdate || 0 },
    { label: `${age} Year Olds`, rank: celebrity.popularity_rank_age || 0 },
    { label: celebrity.birth_sign, rank: celebrity.popularity_rank_zodiac || 0 },
  ];

  return (
    <React.Fragment>
      <Helmet>
        <title>{`${celebrity.name} - Biography, Age & Career | AiAgeCalc.com`}</title>
        <meta 
          name="description" 
          content={`${celebrity.name} is ${age} years old. Born on ${birthDate} in ${celebrity.birthplace}, ${celebrity.country}. ${celebrity.profession}. Learn more about their career and achievements.`}
        />
        <meta name="keywords" content={`${celebrity.name}, ${celebrity.name} age, ${celebrity.name} birthday, ${celebrity.profession}, ${celebrity.country}, famous birthdays, ${celebrity.birth_sign}`} />
        <link rel="canonical" href={`https://aiagecalc.com/celebrity/${celebrity.slug}`} />
        
        <meta property="og:title" content={`${celebrity.name} - Biography & Career`} />
        <meta property="og:description" content={`${celebrity.name} is ${age} years old. ${celebrity.profession}.`} />
        <meta property="og:type" content="profile" />
        <meta property="og:url" content={`https://aiagecalc.com/celebrity/${celebrity.slug}`} />
        <meta property="og:image" content={celebrity.image} />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${celebrity.name} - Biography & Career`} />
        <meta name="twitter:description" content={`${celebrity.name} is ${age} years old. ${celebrity.profession}.`} />
        <meta name="twitter:image" content={celebrity.image} />

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Person",
            "name": celebrity.name,
            "birthDate": celebrity.birthdate,
            "birthPlace": `${celebrity.birthplace}, ${celebrity.country}`,
            "jobTitle": celebrity.profession,
            "description": celebrity.excerpt,
            "image": celebrity.image,
            "nationality": celebrity.country,
            "sameAs": Object.values(socialLinks).filter(Boolean),
          })}
        </script>

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
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
                "name": "Famous Birthdays",
                "item": "https://aiagecalc.com/famous-birthdays"
              },
              {
                "@type": "ListItem",
                "position": 3,
                "name": celebrity.name,
                "item": `https://aiagecalc.com/celebrity/${celebrity.slug}`
              }
            ]
          })}
        </script>
      </Helmet>

      <main className="min-h-screen bg-background">
        {/* Header */}
        <section className="bg-gradient-to-br from-primary/10 via-accent/5 to-background py-8 px-4 border-b">
          <div className="container mx-auto max-w-6xl">
            <Link to="/famous-birthdays">
              <Button variant="ghost" className="mb-4 hover:bg-primary/10">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to All Celebrities
              </Button>
            </Link>
          </div>
        </section>

        {/* Ad Banner Top */}
        {/* <div className="container mx-auto px-4 py-6 max-w-6xl">
          <AdSenseBanner adSlot="1234567890" format="horizontal" />
        </div> */}

        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Content */}
            <article className="flex-1">
              {/* Hero Section */}
              <Card className="mb-8 overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  {/* Image */}
                  <div className="md:w-1/3 relative">
                    {imageUrl ? (
                      <img 
                        src={imageUrl} 
                        alt={`${celebrity.name} - ${profession}`}
                        className="w-full h-64 md:h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-64 md:h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
                        <span className="text-6xl font-bold text-primary/40">
                          {celebrity.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <CardContent className="md:w-2/3 p-8">
                    <h1 className="text-4xl font-bold mb-4 text-foreground">
                      {celebrity.name}
                    </h1>
                    
                    <div className="flex flex-wrap gap-2 mb-6">
                      <Badge variant="secondary" className="text-base px-4 py-1">
                        {profession}
                      </Badge>
                      <Badge variant="outline" className="text-base px-4 py-1">
                        {country}
                      </Badge>
                      {birthSign && (
                        <Badge variant="outline" className="text-base px-4 py-1">
                          {birthSign}
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-4 text-muted-foreground">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-primary" />
                        <div>
                          <p className="text-sm">Born</p>
                          <p className="font-semibold text-foreground text-lg">{birthDate}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Briefcase className="w-5 h-5 text-primary" />
                        <div>
                          <p className="text-sm">Age</p>
                          <p className="font-semibold text-foreground text-lg">{age} years old</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <MapPin className="w-5 h-5 text-primary" />
                        <div>
                          <p className="text-sm">Birthplace</p>
                          <p className="font-semibold text-foreground text-lg">{birthplace}, {country}</p>
                        </div>
                      </div>
                    </div>

                    {/* Social Links */}
                    {Object.keys(socialLinks).length > 0 && (
                      <>
                        <Separator className="my-6" />
                        <div>
                          <h3 className="text-sm font-semibold mb-3 text-foreground">Social Media</h3>
                          <div className="flex gap-3">
                            {socialLinks.instagram && (
                              <a 
                                href={socialLinks.instagram} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="p-2 bg-primary/10 hover:bg-primary/20 rounded-full transition-colors"
                                aria-label="Instagram"
                              >
                                <Instagram className="w-5 h-5 text-primary" />
                              </a>
                            )}
                            {socialLinks.x && (
                              <a 
                                href={socialLinks.x} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="p-2 bg-primary/10 hover:bg-primary/20 rounded-full transition-colors"
                                aria-label="X (Twitter)"
                              >
                                <Twitter className="w-5 h-5 text-primary" />
                              </a>
                            )}
                            {socialLinks.facebook && (
                              <a 
                                href={socialLinks.facebook} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="p-2 bg-primary/10 hover:bg-primary/20 rounded-full transition-colors"
                                aria-label="Facebook"
                              >
                                <Facebook className="w-5 h-5 text-primary" />
                              </a>
                            )}
                            {socialLinks.website && (
                              <a 
                                href={socialLinks.website} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="p-2 bg-primary/10 hover:bg-primary/20 rounded-full transition-colors"
                                aria-label="Official Website"
                              >
                                <Globe className="w-5 h-5 text-primary" />
                              </a>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </div>
              </Card>

              {/* Age Information Component */}
              <CelebrityAgeInfo dateOfBirth={dateOfBirth} name={celebrity.name} />

              {/* Popularity Rank Card */}
              {celebrity.popularity_rank_overall && (
                <PopularityRankCard rank={celebrity.popularity_rank_overall} className="mb-8" />
              )}

              {/* Full Profile Article */}
              {(celebrity as any).about && (
                <Card className="mb-8">
                  <CardContent className="pt-6">
                    <article className="space-y-8">
                      {/* About Section */}
                      {(celebrity as any).about && (
                        <div className="prose prose-slate dark:prose-invert max-w-none">
                          <h2 className="text-2xl font-bold text-foreground mb-4 border-b pb-2">About {celebrity.name.split(' ')[0]}</h2>
                          <div className="text-muted-foreground leading-relaxed space-y-4">
                            {(celebrity as any).about.split('\n\n').map((paragraph: string, index: number) => (
                              <p key={index}>{paragraph}</p>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Before Fame Section */}
                      {celebrity.before_fame && (
                        <div>
                          <h2 className="text-2xl font-bold text-foreground mb-4 border-b pb-2">Before Fame</h2>
                          <p className="text-muted-foreground leading-relaxed">{celebrity.before_fame}</p>
                        </div>
                      )}
                      
                      {/* Trivia Section */}
                      {celebrity.trivia && (
                        <div>
                          <h2 className="text-2xl font-bold text-foreground mb-4 border-b pb-2">Trivia</h2>
                          {Array.isArray(celebrity.trivia) ? (
                            <ul className="space-y-3 text-muted-foreground leading-relaxed list-disc list-inside">
                              {celebrity.trivia.map((fact: string, index: number) => (
                                <li key={index} className="pl-2">{fact}</li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-muted-foreground leading-relaxed">{celebrity.trivia}</p>
                          )}
                        </div>
                      )}
                      
                      {/* Family Life Section */}
                      {celebrity.family_life && (
                        <div>
                          <h2 className="text-2xl font-bold text-foreground mb-4 border-b pb-2">Family Life</h2>
                          <p className="text-muted-foreground leading-relaxed">{celebrity.family_life}</p>
                        </div>
                      )}
                      
                      {/* Associated With Section */}
                      {celebrity.associated_with && (
                        <div>
                          <h2 className="text-2xl font-bold text-foreground mb-4 border-b pb-2">Associated With</h2>
                          <p className="text-muted-foreground leading-relaxed">{celebrity.associated_with}</p>
                        </div>
                      )}
                    </article>
                  </CardContent>
                </Card>
              )}

              {/* Popularity Metrics */}
              <PopularityMetricsTable metrics={popularityMetrics} className="mb-8" />

              {/* Category Memberships */}
              {celebrity.category_memberships && celebrity.category_memberships.length > 0 && (
                <CelebritySection title="IS A MEMBER OF" icon={Users} className="mb-8">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {celebrity.category_memberships.map((category: string) => (
                      <CategoryMemberBadge key={category} category={category} />
                    ))}
                  </div>
                </CelebritySection>
              )}

              {/* Fans Also Viewed */}
              {relatedCelebrities.length > 0 && (
                <CelebritySection title="FANS ALSO VIEWED" icon={Star} className="mb-8">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {relatedCelebrities.map((c: any) => (
                      <RelatedCelebrityCard
                        key={c.slug}
                        slug={c.slug}
                        name={c.name}
                        profession={c.profession}
                        image={c.image}
                      />
                    ))}
                  </div>
                </CelebritySection>
              )}

              {/* Same Birthday */}
              {sameBirthdayCelebrities.length > 0 && (
                <CelebritySection title={`MORE ${birthMonth.toUpperCase()} ${birthDay} BIRTHDAYS`} icon={Calendar} className="mb-8">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {sameBirthdayCelebrities.map((c: any) => (
                      <RelatedCelebrityCard
                        key={c.slug}
                        slug={c.slug}
                        name={c.name}
                        profession={c.profession}
                        image={c.image}
                      />
                    ))}
                  </div>
                </CelebritySection>
              )}

              {/* Same Zodiac */}
              {sameZodiacCelebrities.length > 0 && (
                <CelebritySection title={`MORE ${celebrity.birth_sign.toUpperCase()}`} icon={Sparkles} className="mb-8">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {sameZodiacCelebrities.map((c: any) => (
                      <RelatedCelebrityCard
                        key={c.slug}
                        slug={c.slug}
                        name={c.name}
                        profession={c.profession}
                        image={c.image}
                      />
                    ))}
                  </div>
                </CelebritySection>
              )}

              {/* Quick Facts */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Quick Facts</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm text-muted-foreground mb-1">Full Name</dt>
                      <dd className="font-semibold text-foreground">{celebrity.name}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-muted-foreground mb-1">Profession</dt>
                      <dd className="font-semibold text-foreground">{celebrity.profession}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-muted-foreground mb-1">Date of Birth</dt>
                      <dd className="font-semibold text-foreground">{birthDate}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-muted-foreground mb-1">Current Age</dt>
                      <dd className="font-semibold text-foreground">{age} years</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-muted-foreground mb-1">Nationality</dt>
                      <dd className="font-semibold text-foreground">{celebrity.country}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-muted-foreground mb-1">Birth Sign</dt>
                      <dd className="font-semibold text-foreground">{celebrity.birth_sign}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-muted-foreground mb-1">Birthplace</dt>
                      <dd className="font-semibold text-foreground">{celebrity.birthplace}</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
            </article>

            {/* Sidebar */}
            <aside className="lg:w-80 space-y-6">
              {/* <Card className="p-6 sticky top-4">
                <h3 className="font-bold text-lg mb-4">Sponsored</h3>
                <AdSenseBanner adSlot="0987654321" format="vertical" />
              </Card> */}
            </aside>
          </div>
        </div>

        {/* Bottom Ad */}
        {/* <div className="container mx-auto px-4 py-6 max-w-6xl">
          <AdSenseBanner adSlot="1122334455" format="large-horizontal" />
        </div> */}
      </main>
    </React.Fragment>
  );
};

export default CelebrityDetail;
