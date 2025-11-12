import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cake, Sparkles } from "lucide-react";
import PageTransition from "@/components/PageTransition";

const About = () => {
  return (
    <PageTransition>
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Helmet>
        <title>About Us | AiAgeCalc.com - Your Age & Birthday Companion</title>
        <meta 
          name="description" 
          content="Learn about AiAgeCalc.com - your fun and informative destination for exploring everything related to age, birthdays, and celebrations." 
        />
      </Helmet>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <Card className="border-2">
            <CardHeader className="text-center pb-8">
              <div className="flex justify-center gap-4 mb-4">
                <Cake className="w-12 h-12 text-primary" />
                <Sparkles className="w-12 h-12 text-primary" />
              </div>
              <CardTitle className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                About AiAgeCalc
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-6 text-center">
              <p className="text-lg text-foreground/90 leading-relaxed">
                AiAgeCalc.com is your fun and informative destination for exploring everything related to age, birthdays, and celebrations. From calculating your age on other planets to generating unique AI greetings, we offer a variety of tools to spark your curiosity. Our blog provides interesting articles on related topics. Enjoy exploring!
              </p>

              <div className="grid md:grid-cols-2 gap-6 mt-8">
                <Card className="border">
                  <CardHeader>
                    <Cake className="w-8 h-8 text-primary mx-auto mb-2" />
                    <CardTitle className="text-xl">Age Calculator</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Calculate your exact age and discover fun facts about your birthday
                    </p>
                  </CardContent>
                </Card>

                <Card className="border">
                  <CardHeader>
                    <Sparkles className="w-8 h-8 text-primary mx-auto mb-2" />
                    <CardTitle className="text-xl">Blog & Insights</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Explore articles about traditions, zodiac signs, and more
                    </p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
    </PageTransition>
  );
};

export default About;
