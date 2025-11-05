import React from "react";
import { Helmet } from "react-helmet-async";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, Calendar, MapPin, Briefcase, TrendingUp, ExternalLink, Instagram, Twitter, Youtube, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { differenceInYears, format } from "date-fns";
import { AdSenseBanner } from "@/components/AdSenseBanner";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const CelebrityDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: celebrity, isLoading, error } = useQuery({
    queryKey: ['celebrity-detail', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('explore_famous_birthdays')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (error) throw error;
      if (!data) throw new Error('Celebrity not found');
      
      return data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !celebrity) {
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

  const age = differenceInYears(new Date(), new Date(celebrity.dob));
  const birthDate = format(new Date(celebrity.dob), 'MMMM d, yyyy');
  const socialLinks = celebrity.social_links as Record<string, string> || {};

  return (
    <React.Fragment>
      <Helmet>
        <title>{celebrity.name} - Biography, Age & Career | AiAgeCalc.com</title>
        <meta 
          name="description" 
          content={`${celebrity.name} is ${age} years old. Born on ${birthDate}. ${celebrity.profession}. ${celebrity.famous_for || 'Learn more about their career and achievements.'}`}
        />
        <meta name="keywords" content={`${celebrity.name}, ${celebrity.name} age, ${celebrity.name} birthday, ${celebrity.profession}, ${celebrity.country || 'celebrity'}, famous birthdays`} />
        <link rel="canonical" href={`https://aiagecalc.com/celebrity/${id}`} />
        
        <meta property="og:title" content={`${celebrity.name} - Biography & Career`} />
        <meta property="og:description" content={`${celebrity.name} is ${age} years old. ${celebrity.profession}. ${celebrity.famous_for || ''}`} />
        <meta property="og:type" content="profile" />
        <meta property="og:url" content={`https://aiagecalc.com/celebrity/${id}`} />
        {celebrity.image_url && <meta property="og:image" content={celebrity.image_url} />}
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${celebrity.name} - Biography & Career`} />
        <meta name="twitter:description" content={`${celebrity.name} is ${age} years old. ${celebrity.profession}.`} />
        {celebrity.image_url && <meta name="twitter:image" content={celebrity.image_url} />}

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Person",
            "name": celebrity.name,
            "birthDate": celebrity.dob,
            "jobTitle": celebrity.profession,
            "description": celebrity.bio || `${celebrity.name} - ${celebrity.profession}`,
            "image": celebrity.image_url,
            "url": celebrity.source_url,
            "nationality": celebrity.country,
            "sameAs": Object.values(socialLinks).filter(Boolean),
            "knowsAbout": celebrity.famous_for,
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
                "item": `https://aiagecalc.com/celebrity/${id}`
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
        <div className="container mx-auto px-4 py-6 max-w-6xl">
          <AdSenseBanner adSlot="1234567890" format="horizontal" />
        </div>

        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Content */}
            <article className="flex-1">
              {/* Hero Section */}
              <Card className="mb-8 overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  {/* Image */}
                  <div className="md:w-1/3 relative">
                    {celebrity.image_url ? (
                      <img 
                        src={celebrity.image_url} 
                        alt={`${celebrity.name} - ${celebrity.profession}`}
                        className="w-full h-64 md:h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-64 md:h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
                        <span className="text-6xl font-bold text-primary/40">
                          {celebrity.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </span>
                      </div>
                    )}
                    {celebrity.today_trending && (
                      <Badge className="absolute top-4 right-4 bg-primary">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        Trending
                      </Badge>
                    )}
                  </div>

                  {/* Info */}
                  <CardContent className="md:w-2/3 p-8">
                    <h1 className="text-4xl font-bold mb-4 text-foreground">
                      {celebrity.name}
                    </h1>
                    
                    <div className="flex flex-wrap gap-2 mb-6">
                      <Badge variant="secondary" className="text-base px-4 py-1">
                        {celebrity.profession}
                      </Badge>
                      {celebrity.region_category && (
                        <Badge variant="outline" className="text-base px-4 py-1">
                          {celebrity.region_category}
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

                      {celebrity.country && (
                        <div className="flex items-center gap-3">
                          <MapPin className="w-5 h-5 text-primary" />
                          <div>
                            <p className="text-sm">Country</p>
                            <p className="font-semibold text-foreground text-lg">{celebrity.country}</p>
                          </div>
                        </div>
                      )}
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
                            {socialLinks.twitter && (
                              <a 
                                href={socialLinks.twitter} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="p-2 bg-primary/10 hover:bg-primary/20 rounded-full transition-colors"
                                aria-label="Twitter/X"
                              >
                                <Twitter className="w-5 h-5 text-primary" />
                              </a>
                            )}
                            {socialLinks.youtube && (
                              <a 
                                href={socialLinks.youtube} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="p-2 bg-primary/10 hover:bg-primary/20 rounded-full transition-colors"
                                aria-label="YouTube"
                              >
                                <Youtube className="w-5 h-5 text-primary" />
                              </a>
                            )}
                            {celebrity.source_url && (
                              <a 
                                href={celebrity.source_url} 
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

              {/* Biography */}
              {(celebrity.bio || celebrity.ai_summary) && (
                <Card className="mb-8">
                  <CardHeader>
                    <CardTitle className="text-2xl">Biography</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {celebrity.bio || celebrity.ai_summary}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Famous For */}
              {celebrity.famous_for && (
                <Card className="mb-8">
                  <CardHeader>
                    <CardTitle className="text-2xl">Known For</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                      {celebrity.famous_for}
                    </p>
                  </CardContent>
                </Card>
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
                    {celebrity.country && (
                      <div>
                        <dt className="text-sm text-muted-foreground mb-1">Nationality</dt>
                        <dd className="font-semibold text-foreground">{celebrity.country}</dd>
                      </div>
                    )}
                    {celebrity.popularity_score && (
                      <div>
                        <dt className="text-sm text-muted-foreground mb-1">Popularity Score</dt>
                        <dd className="font-semibold text-foreground">{celebrity.popularity_score}/100</dd>
                      </div>
                    )}
                  </dl>

                  {celebrity.source_url && (
                    <div className="mt-6">
                      <a 
                        href={celebrity.source_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-primary hover:underline"
                      >
                        <ExternalLink className="w-4 h-4" />
                        View Official Source
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>
            </article>

            {/* Sidebar */}
            <aside className="lg:w-80 space-y-6">
              <Card className="p-6 sticky top-4">
                <h3 className="font-bold text-lg mb-4">Sponsored</h3>
                <AdSenseBanner adSlot="0987654321" format="vertical" />
              </Card>
            </aside>
          </div>
        </div>

        {/* Bottom Ad */}
        <div className="container mx-auto px-4 py-6 max-w-6xl">
          <AdSenseBanner adSlot="1122334455" format="large-horizontal" />
        </div>
      </main>
    </React.Fragment>
  );
};

export default CelebrityDetail;
