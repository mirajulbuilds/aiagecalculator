import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, Calendar, MapPin, Star, Cake } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AdSenseBanner } from "@/components/AdSenseBanner";
import { Celebrity } from "@/data/celebrities";

interface CelebrityProfileProps {
  celebrity: Celebrity;
}

export const CelebrityProfile: React.FC<CelebrityProfileProps> = ({ celebrity }) => {
  const [age, setAge] = useState({ years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [nextBirthday, setNextBirthday] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateAge = () => {
      const birthDate = new Date(celebrity.dateOfBirth);
      const now = new Date();
      
      let years = now.getFullYear() - birthDate.getFullYear();
      let months = now.getMonth() - birthDate.getMonth();
      let days = now.getDate() - birthDate.getDate();
      let hours = now.getHours() - birthDate.getHours();
      let minutes = now.getMinutes() - birthDate.getMinutes();
      let seconds = now.getSeconds() - birthDate.getSeconds();

      if (seconds < 0) {
        seconds += 60;
        minutes--;
      }
      if (minutes < 0) {
        minutes += 60;
        hours--;
      }
      if (hours < 0) {
        hours += 24;
        days--;
      }
      if (days < 0) {
        const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        days += prevMonth.getDate();
        months--;
      }
      if (months < 0) {
        months += 12;
        years--;
      }

      setAge({ years, months, days, hours, minutes, seconds });

      // Calculate next birthday
      const nextBday = new Date(now.getFullYear(), birthDate.getMonth(), birthDate.getDate());
      if (nextBday < now) {
        nextBday.setFullYear(now.getFullYear() + 1);
      }
      
      const diff = nextBday.getTime() - now.getTime();
      const bdayDays = Math.floor(diff / (1000 * 60 * 60 * 24));
      const bdayHours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const bdayMinutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const bdaySeconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setNextBirthday({ days: bdayDays, hours: bdayHours, minutes: bdayMinutes, seconds: bdaySeconds });
    };

    calculateAge();
    const interval = setInterval(calculateAge, 1000);
    return () => clearInterval(interval);
  }, [celebrity.dateOfBirth]);

  const birthDate = new Date(celebrity.dateOfBirth);
  const formattedBirthDate = birthDate.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <>
      <Helmet>
        <title>{celebrity.name} - Age, Biography & Career | Famous Birthdays</title>
        <meta name="description" content={celebrity.metaDescription} />
        <meta name="keywords" content={`${celebrity.name}, ${celebrity.name} age, ${celebrity.name} birthday, ${celebrity.name} biography, ${celebrity.profession}, famous birthdays`} />
        <link rel="canonical" href={`https://aiagecalc.com/famous-birthdays/${celebrity.slug}`} />
        <meta property="og:title" content={`${celebrity.name} - Age, Biography & Career`} />
        <meta property="og:description" content={celebrity.metaDescription} />
        <meta property="og:type" content="profile" />
        <meta property="og:url" content={`https://aiagecalc.com/famous-birthdays/${celebrity.slug}`} />

        {/* JSON-LD Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Person",
            "name": celebrity.name,
            "birthDate": celebrity.dateOfBirth,
            "birthPlace": celebrity.placeOfBirth,
            "jobTitle": celebrity.profession,
            "description": celebrity.metaDescription,
            "url": `https://aiagecalc.com/famous-birthdays/${celebrity.slug}`,
            "sameAs": [],
            "knowsAbout": celebrity.careerHighlights,
            "award": celebrity.careerHighlights
          })}
        </script>

        {/* BreadcrumbList */}
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
                "item": `https://aiagecalc.com/famous-birthdays/${celebrity.slug}`
              }
            ]
          })}
        </script>
      </Helmet>

      <main className="min-h-screen bg-background">
        {/* Header Section */}
        <section className="bg-gradient-to-br from-primary/10 via-accent/5 to-background py-12 px-4">
          <div className="container mx-auto max-w-5xl">
            <Link to="/famous-birthdays">
              <Button variant="ghost" className="mb-6 hover:bg-primary/10">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Directory
              </Button>
            </Link>

            <div className="flex flex-col md:flex-row gap-8 items-start">
              <Avatar className="w-48 h-48 border-4 border-primary/20 flex-shrink-0">
                <AvatarImage src={celebrity.photoUrl} alt={celebrity.name} />
                <AvatarFallback className="bg-gradient-primary text-primary-foreground text-4xl">
                  {celebrity.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-3">
                  {celebrity.name}
                </h1>
                <Badge variant="secondary" className="text-lg px-4 py-2 mb-4">
                  {celebrity.profession}
                </Badge>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    <div>
                      <div className="text-sm">Born</div>
                      <div className="font-semibold text-foreground">{formattedBirthDate}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    <div>
                      <div className="text-sm">Place of Birth</div>
                      <div className="font-semibold text-foreground">{celebrity.placeOfBirth}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-primary" />
                    <div>
                      <div className="text-sm">Zodiac Sign</div>
                      <div className="font-semibold text-foreground">{celebrity.zodiacSign}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-12 max-w-5xl">
          {/* Live Age Counter */}
          <section className="mb-12">
            <Card className="overflow-hidden border-2 border-primary/20">
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold text-center mb-8 flex items-center justify-center gap-3">
                  <Cake className="w-8 h-8 text-primary" />
                  Live Age Counter
                </h2>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                  {[
                    { label: 'Years', value: age.years },
                    { label: 'Months', value: age.months },
                    { label: 'Days', value: age.days },
                    { label: 'Hours', value: age.hours },
                    { label: 'Minutes', value: age.minutes },
                    { label: 'Seconds', value: age.seconds }
                  ].map((item) => (
                    <div key={item.label} className="text-center p-4 bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg">
                      <div className="text-4xl font-bold text-primary mb-1">{item.value}</div>
                      <div className="text-sm text-muted-foreground">{item.label}</div>
                    </div>
                  ))}
                </div>

                <div className="text-center border-t pt-6">
                  <h3 className="text-xl font-semibold mb-4">Next Birthday Countdown</h3>
                  <div className="flex justify-center gap-4 flex-wrap">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary">{nextBirthday.days}</div>
                      <div className="text-sm text-muted-foreground">Days</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary">{nextBirthday.hours}</div>
                      <div className="text-sm text-muted-foreground">Hours</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary">{nextBirthday.minutes}</div>
                      <div className="text-sm text-muted-foreground">Minutes</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary">{nextBirthday.seconds}</div>
                      <div className="text-sm text-muted-foreground">Seconds</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Ad */}
          <div className="mb-12">
            <AdSenseBanner format="horizontal" />
          </div>

          {/* Biography Section */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Biography</h2>
            <Card>
              <CardContent className="p-8">
                <div className="prose prose-lg max-w-none text-foreground">
                  {celebrity.biography.split('\n\n').map((paragraph, index) => (
                    <p key={index} className="mb-4 leading-relaxed">{paragraph}</p>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Career Highlights Section */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Career Highlights</h2>
            <Card>
              <CardContent className="p-8">
                <ul className="space-y-4">
                  {celebrity.careerHighlights.map((highlight, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Star className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                      <span className="text-lg text-foreground">{highlight}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </section>

          {/* Ad */}
          <div className="mb-8">
            <AdSenseBanner format="horizontal" />
          </div>
        </div>
      </main>
    </>
  );
};
