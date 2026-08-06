import { SEOHead } from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cake, Sparkles, Calculator, Heart, Baby, PawPrint, Globe, Star, Brain, Gift } from "lucide-react";
import { Link } from "react-router-dom";
import PageTransition from "@/components/PageTransition";

const About = () => {
  return (
    <PageTransition>
      <SEOHead
        title="About Us - Your Age & Birthday Companion"
        description="Learn about AiAgeCalc.com - your fun and informative destination for exploring everything related to age, birthdays, and celebrations with AI-powered tools."
        type="website"
      />
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto space-y-10">

            {/* Hero Section */}
            <Card className="border-2">
              <CardHeader className="text-center pb-8">
                <div className="flex justify-center gap-4 mb-4">
                  <Cake className="w-12 h-12 text-primary" />
                  <Sparkles className="w-12 h-12 text-primary" />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  About AiAgeCalc — Free Age, Birthday & AI Calculators
                </h1>
              </CardHeader>
              <CardContent className="space-y-6 text-foreground/90 leading-relaxed">
                <p className="text-lg">
                  Welcome to <strong>AiAgeCalc.com</strong> — your all-in-one destination for age calculation, birthday exploration, and AI-powered tools that make learning about time fun and engaging. Whether you want to know your exact age down to the second, discover which celebrities share your birthday, or find out how old you would be on Mars, we have the tools to satisfy your curiosity.
                </p>
                <p>
                  Our mission is simple: to provide free, accurate, and entertaining age-related tools that anyone can use. We combine precision calculation with the power of artificial intelligence to deliver a unique experience you won't find anywhere else.
                </p>
              </CardContent>
            </Card>

            {/* Our Tools Section */}
            <section>
              <h2 className="text-3xl font-bold text-foreground mb-6 text-center">Our Tools & Features</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="border hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-2">
                    <Calculator className="w-8 h-8 text-primary mb-2" />
                    <CardTitle className="text-xl">
                      <Link to="/" className="hover:text-primary transition-colors">Age Calculator</Link>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Calculate your exact age in years, months, days, hours, minutes, and seconds. See your age update in real time and explore different date formats.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-2">
                    <Globe className="w-8 h-8 text-primary mb-2" />
                    <CardTitle className="text-xl">
                      <Link to="/" className="hover:text-primary transition-colors">Planetary Age</Link>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Ever wondered how old you are on Jupiter or Venus? Our planetary age calculator converts your Earth age to ages on all planets in our solar system.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-2">
                    <Star className="w-8 h-8 text-primary mb-2" />
                    <CardTitle className="text-xl">
                      <Link to="/famous-birthdays" className="hover:text-primary transition-colors">Famous Birthdays</Link>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Browse our database of celebrity profiles. Discover who shares your birthday, explore celebrities by zodiac sign, profession, or birth month.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-2">
                    <Brain className="w-8 h-8 text-primary mb-2" />
                    <CardTitle className="text-xl">
                      <Link to="/ai-face-age" className="hover:text-primary transition-colors">AI Face Age Detector</Link>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Upload a photo and let our AI estimate the age of the person in the image. A fun way to see how old you look compared to your actual age.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-2">
                    <Heart className="w-8 h-8 text-primary mb-2" />
                    <CardTitle className="text-xl">
                      <Link to="/compatibility-calculator" className="hover:text-primary transition-colors">Compatibility Calculator</Link>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Check your birthday compatibility with a friend, partner, or celebrity. Our AI analyzes zodiac signs and numerology to give you a fun compatibility score.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-2">
                    <Baby className="w-8 h-8 text-primary mb-2" />
                    <CardTitle className="text-xl">
                      <Link to="/due-date-calculator" className="hover:text-primary transition-colors">Due Date Calculator</Link>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Expecting parents can calculate their baby's estimated due date and track pregnancy milestones week by week.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-2">
                    <PawPrint className="w-8 h-8 text-primary mb-2" />
                    <CardTitle className="text-xl">
                      <Link to="/pet-age-calculator" className="hover:text-primary transition-colors">Pet Age Calculator</Link>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Convert your pet's age to human years using breed-specific formulas. Works for dogs, cats, and other popular pets.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-2">
                    <Gift className="w-8 h-8 text-primary mb-2" />
                    <CardTitle className="text-xl">
                      <Link to="/life-expectancy-calculator" className="hover:text-primary transition-colors">Life Expectancy & More</Link>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Explore our life expectancy estimator, retirement planner, health score calculator, and past life generator — all powered by AI.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Why Choose Us */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-2xl text-center">Why Choose AiAgeCalc?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-foreground/90">
                <ul className="list-disc list-inside space-y-2">
                  <li><strong>100% Free</strong> — All of our tools are completely free to use with no sign-up required.</li>
                  <li><strong>AI-Powered</strong> — We use advanced artificial intelligence to provide unique features like face age detection, celebrity look-alike matching, and personalized birthday greetings.</li>
                  <li><strong>Privacy First</strong> — We do not store your photos or personal data. All calculations happen securely.</li>
                  <li><strong>Mobile Friendly</strong> — Our entire site is fully responsive and works beautifully on phones, tablets, and desktops.</li>
                  <li><strong>Regularly Updated</strong> — We continuously add new celebrity profiles, blog articles, and tools to keep the experience fresh.</li>
                </ul>
              </CardContent>
            </Card>

            {/* Blog & Content */}
            <Card className="border">
              <CardHeader>
                <CardTitle className="text-2xl text-center">Our Blog</CardTitle>
              </CardHeader>
              <CardContent className="text-foreground/90">
                <p>
                  Our <Link to="/blog" className="text-primary hover:underline font-medium">blog</Link> covers a wide range of topics related to birthdays, astrology, age milestones, and cultural traditions around the world. From exploring how different cultures celebrate birthdays to understanding what your zodiac sign says about your personality, our articles are written to inform and entertain.
                </p>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card className="border">
              <CardHeader>
                <CardTitle className="text-2xl text-center">Get in Touch</CardTitle>
              </CardHeader>
              <CardContent className="text-center text-foreground/90">
                <p>
                  Have questions, feedback, or suggestions? We'd love to hear from you! Visit our{" "}
                  <Link to="/contact" className="text-primary hover:underline font-medium">Contact page</Link> to send us a message, or explore our{" "}
                  <Link to="/privacy-policy" className="text-primary hover:underline font-medium">Privacy Policy</Link> and{" "}
                  <Link to="/terms-of-service" className="text-primary hover:underline font-medium">Terms of Service</Link> for more information.
                </p>
              </CardContent>
            </Card>

          </div>
        </main>
      </div>
    </PageTransition>
  );
};

export default About;
