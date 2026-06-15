import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Share2, History } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Helmet } from "react-helmet-async";
import { SITE_CONFIG } from "@/lib/config";
import PageTransition from "@/components/PageTransition";
import { triggerNativeShare } from "@/lib/shareUtils";
import { SEOFaqSection } from "@/components/SEOFaqSection";

const PastLifeGenerator = () => {
  const { profile } = useAuth();
  const [day, setDay] = useState<string>("");
  const [month, setMonth] = useState<string>("");
  const [year, setYear] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [pastLifeStory, setPastLifeStory] = useState<string>("");

  // Pre-fill from user profile
  useEffect(() => {
    if (profile?.date_of_birth && !day && !month && !year) {
      const dob = new Date(profile.date_of_birth);
      setDay(dob.getDate().toString());
      setMonth((dob.getMonth() + 1).toString());
      setYear(dob.getFullYear().toString());
    }
  }, [profile]);

  const months = [
    { value: "1", label: "January" },
    { value: "2", label: "February" },
    { value: "3", label: "March" },
    { value: "4", label: "April" },
    { value: "5", label: "May" },
    { value: "6", label: "June" },
    { value: "7", label: "July" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString());
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1899 }, (_, i) => (currentYear - i).toString());

  const handleGenerate = async () => {
    if (!day || !month || !year) {
      toast.error("Please select your complete birth date");
      return;
    }

    // Validate date
    const birthDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    if (isNaN(birthDate.getTime())) {
      toast.error("Please select a valid date");
      return;
    }

    if (birthDate > new Date()) {
      toast.error("Birth date cannot be in the future");
      return;
    }

    setIsGenerating(true);
    setPastLifeStory("");

    try {
      // Format date as YYYY-MM-DD
      const dateString = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

      const { data, error } = await supabase.functions.invoke("past-life-generator", {
        body: { birthDate: dateString },
      });

      if (error) {
        console.error("Function error:", error);
        throw new Error("Failed to generate past life story");
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setPastLifeStory(data.past_life_story);
      toast.success("Your past life has been revealed!");
    } catch (error) {
      console.error("Error generating past life:", error);
      toast.error(error instanceof Error ? error.message : "Failed to generate past life story");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = async () => {
    if (!pastLifeStory) return;

    await triggerNativeShare({
      title: "Past Life Generator",
      text: "My AI past life story is amazing! Find out yours.",
      url: `${SITE_CONFIG.canonicalUrl}/past-life-generator`,
    });
  };

  return (
    <PageTransition>
    <>
      <Helmet>
        <title>Who Was I in My Past Life? Free Past Life Calculator by Date of Birth</title>
        <meta
          name="description"
          content="Find out who you were in a past life by your date of birth. Our free AI past life calculator reveals your previous incarnation using your zodiac sign and life path number. Get your past life story instantly."
        />
        <meta
          name="keywords"
          content="who was i in my past life by date of birth, who was i in my past life, what was i in a past life, past life reading, past life calculator, past life astrology chart, previous birth calculator, past life generator, life path number past life"
        />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <History className="w-8 h-8 text-primary" />
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Who Was I in My Past Life?
              </h1>
            </div>
            <p className="text-xl md:text-2xl font-semibold text-foreground/80 mb-4">
              Free Past Life Calculator by Date of Birth
            </p>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Ever felt an unexplained pull toward a certain place, era, or craft? Many believe it's an echo of a past life. Enter your date of birth below and our AI past life calculator will reveal who you may have been in a previous incarnation — your era, your role, and how that soul still shapes you today. It's free, instant, and based on your zodiac sign and life path number.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Input Section */}
            <Card className="bg-card/50 backdrop-blur content-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Enter Your Birth Date
                </CardTitle>
                <CardDescription>Select your date of birth to reveal your past life</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date of Birth</label>
                  <div className="grid grid-cols-3 gap-2">
                    <Select value={day} onValueChange={setDay}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Day" />
                      </SelectTrigger>
                      <SelectContent>
                        {days.map((d) => (
                          <SelectItem key={d} value={d}>
                            {d}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={month} onValueChange={setMonth}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Month" />
                      </SelectTrigger>
                      <SelectContent>
                        {months.map((m) => (
                          <SelectItem key={m.value} value={m.value}>
                            {m.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={year} onValueChange={setYear}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Year" />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map((y) => (
                          <SelectItem key={y} value={y}>
                            {y}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={!day || !month || !year || isGenerating}
                  className="w-full main-action-button"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Consulting the archives...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Reveal My Past Life
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Results Section */}
            <Card className="bg-card/50 backdrop-blur content-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="w-5 h-5 text-primary" />
                  Your Past Life Story
                </CardTitle>
                <CardDescription>
                  {pastLifeStory ? "Your past life has been revealed!" : "Enter your birth date to see results"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pastLifeStory ? (
                  <div className="space-y-6 animate-fade-in">
                    <div className="bg-primary/5 rounded-lg p-6">
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{pastLifeStory}</p>
                    </div>

                    <Button variant="outline" className="w-full" onClick={handleShare}>
                      <Share2 className="w-4 h-4 mr-2" />
                      Share Your Past Life!
                    </Button>

                    <div className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setDay("");
                          setMonth("");
                          setYear("");
                          setPastLifeStory("");
                        }}
                      >
                        Try Another Date
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <History className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Enter your birth date to discover your past life!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* How It Works */}
          <Card className="mt-8 bg-gradient-to-br from-primary/5 to-purple-600/5">
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-primary">1</span>
                </div>
                <h4 className="font-semibold mb-2">Enter Birthday</h4>
                <p className="text-sm text-muted-foreground">Select your complete date of birth</p>
              </div>
              <div className="text-center">
                <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-primary">2</span>
                </div>
                <h4 className="font-semibold mb-2">AI Analysis</h4>
                <p className="text-sm text-muted-foreground">Our AI analyzes your Zodiac sign and Life Path Number</p>
              </div>
              <div className="text-center">
                <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-primary">3</span>
                </div>
                <h4 className="font-semibold mb-2">Get Your Story</h4>
                <p className="text-sm text-muted-foreground">Receive your unique, AI-generated past life story!</p>
              </div>
            </CardContent>
          </Card>

          {/* How to Find Out Who You Were */}
          <Card className="mt-8 bg-card/50 backdrop-blur content-card">
            <CardHeader>
              <CardTitle>How to Find Out Who You Were in a Past Life</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-foreground/90 leading-relaxed">
              <p>
                Your date of birth holds two of the oldest keys to your soul's story: your <strong>zodiac sign</strong> and your <strong>life path number</strong>. A past life calculator reads these patterns the way an astrologer reads a birth chart — looking for the themes, talents, and lessons that tend to carry across lifetimes.
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Your zodiac sign</strong> points to the <em>temperament</em> of your past life — were you a fearless leader, a quiet healer, a restless wanderer?</li>
                <li><strong>Your life path number</strong> (the sum of your birth date reduced to a single digit) points to your <em>soul's purpose</em> — building, teaching, protecting, creating.</li>
              </ul>
              <p>
                When you enter your birthday above, our AI weaves these two signals into a single vivid story: a specific era, a profession, a place, and the way that life still lives inside you. Every story is unique to your exact date of birth.
              </p>
            </CardContent>
          </Card>

          {/* Past Life by Zodiac Sign */}
          <Card className="mt-8 bg-card/50 backdrop-blur content-card">
            <CardHeader>
              <CardTitle>What Your Zodiac Sign Reveals About Your Past Life</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-foreground/90 leading-relaxed">
              <ul className="grid md:grid-cols-2 gap-x-6 gap-y-2 list-disc pl-6">
                <li><strong>Aries:</strong> Often a warrior, pioneer, or firstcomer — someone who led from the front and feared nothing new.</li>
                <li><strong>Taurus:</strong> Frequently a builder, farmer, or craftsperson who created lasting beauty and valued the land.</li>
                <li><strong>Gemini:</strong> Commonly a messenger, scribe, or trader — a curious mind who carried ideas between worlds.</li>
                <li><strong>Cancer:</strong> Often a caretaker, healer, or keeper of the home and hearth, devoted to protecting others.</li>
                <li><strong>Leo:</strong> Frequently a ruler, performer, or leader whose warmth and courage drew people toward them.</li>
                <li><strong>Virgo:</strong> Commonly a healer, scholar, or artisan devoted to service, detail, and quiet mastery.</li>
                <li><strong>Libra:</strong> Often a diplomat, artist, or peacemaker who sought harmony and beauty in a divided world.</li>
                <li><strong>Scorpio:</strong> Frequently a mystic, strategist, or guardian of secrets — intense, transformative, unforgettable.</li>
                <li><strong>Sagittarius:</strong> Commonly an explorer, philosopher, or teacher who chased far horizons and bigger truths.</li>
                <li><strong>Capricorn:</strong> Often a leader, architect, or elder who built structures and legacies meant to outlast them.</li>
                <li><strong>Aquarius:</strong> Frequently an inventor, rebel, or visionary far ahead of their own time.</li>
                <li><strong>Pisces:</strong> Commonly a dreamer, artist, or spiritual guide who lived between the seen and unseen worlds.</li>
              </ul>
              <p className="text-muted-foreground italic pt-2">
                Enter your birthday above to get the full, personalized story for your sign.
              </p>
            </CardContent>
          </Card>

          {/* Life Path Number */}
          <Card className="mt-8 bg-card/50 backdrop-blur content-card">
            <CardHeader>
              <CardTitle>Your Life Path Number & Your Soul's Journey</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-foreground/90 leading-relaxed">
              <p>Your life path number is your soul's recurring assignment across lifetimes:</p>
              <ul className="grid md:grid-cols-2 gap-x-6 gap-y-2 list-disc pl-6">
                <li><strong>1</strong> — the leader and trailblazer</li>
                <li><strong>2</strong> — the peacemaker and partner</li>
                <li><strong>3</strong> — the creator and communicator</li>
                <li><strong>4</strong> — the builder and protector</li>
                <li><strong>5</strong> — the adventurer and free spirit</li>
                <li><strong>6</strong> — the nurturer and guardian</li>
                <li><strong>7</strong> — the seeker and mystic</li>
                <li><strong>8</strong> — the achiever and leader of others</li>
                <li><strong>9</strong> — the humanitarian and old soul</li>
                <li><strong>11, 22, 33</strong> — master numbers carrying rare spiritual purpose</li>
              </ul>
              <p>Our calculator blends your number with your zodiac sign to reveal the specific life your soul once lived.</p>
            </CardContent>
          </Card>

          {/* SEO FAQ Section */}
          <SEOFaqSection
            title="Past Life Calculator & Reincarnation FAQ"
            description="Explore the mysteries of reincarnation with our AI past life generator. Based on your birthday, zodiac sign, and numerology, discover who you were in a past life and what your previous birth reveals about your present."
            faqs={[
              {
                question: "Who was I in my past life?",
                answer: "Our AI past life calculator uses your date of birth, zodiac sign, and life path number to generate a unique past life story. It considers astrological alignments, numerological patterns, and historical periods to craft a vivid narrative of who you might have been in a previous incarnation."
              },
              {
                question: "What was I in a past life?",
                answer: "Based on your birth date and astrological profile, our AI generates a detailed story about your past life — including your occupation, era, personality, and life purpose. Each story is unique and based on the cosmic patterns of your birthday."
              },
              {
                question: "How does a past life calculator work?",
                answer: "A past life calculator uses your date of birth to analyze zodiac signs, life path numbers, and astrological charts. These cosmic patterns are then used by our AI to generate a personalized reincarnation story that connects your past life to your present personality."
              },
              {
                question: "What is a past life astrology chart?",
                answer: "A past life astrology chart examines planetary positions at the time of your birth to infer karmic lessons and past life themes. Our AI incorporates zodiac sign analysis and numerology to create a comprehensive past life reading based on your birth chart patterns."
              },
              {
                question: "Can I find my reincarnation photo match?",
                answer: "While our past life generator focuses on narrative stories based on your birth date, you can explore visual connections through our Celebrity Look-Alike Finder, which matches your face with famous people — some of whom might have lived in eras matching your past life!"
              },
              {
                question: "What is a previous birth calculator?",
                answer: "A previous birth calculator (also called a past life calculator) estimates details about your previous incarnation based on your current birth date. It uses ancient numerology and zodiac systems to determine themes, traits, and stories from your past lives."
              },
              {
                question: "How do I find out who I was in my past life by my date of birth?",
                answer: "Enter your full date of birth into the calculator above. Our AI reads your zodiac sign and life path number — both determined by your birthday — and generates a personalized story describing your past life's era, profession, and personality, free and instantly."
              },
              {
                question: "Is the past life calculator accurate?",
                answer: "Our past life generator is designed for entertainment, self-reflection, and fun. It draws on real astrological and numerological traditions to craft a meaningful, personalized story, but it is not a scientific or medical tool."
              },
              {
                question: "Can I get a different past life story?",
                answer: "Each story is generated fresh, so you can tap 'Try Another Date' to explore past lives for family and friends, or revisit your own birthday to see a new telling."
              },
              {
                question: "What is a past life regression vs. a past life calculator?",
                answer: "Past life regression is a guided meditation technique used by practitioners to recover memories. A past life calculator, like ours, instantly generates a story from your birth date using astrology and numerology — no session required."
              },
              {
                question: "Is the past life generator free?",
                answer: "Yes. The past life calculator is completely free, with no sign-up required to get your story."
              }
            ]}
            relatedTools={[
              { name: "Compatibility Calculator", path: "/compatibility-calculator" },
              { name: "Celebrity Look-Alike Finder", path: "/look-alike-finder" },
              { name: "Famous Birthdays", path: "/famous-birthdays" },
            ]}
          />
        </div>
      </div>
    </>
    </PageTransition>
  );
};

export default PastLifeGenerator;
