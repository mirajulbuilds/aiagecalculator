import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { PiggyBank, DollarSign, TrendingUp, Calendar, Share2, Wallet, Home, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SEOFaqSection } from "@/components/SEOFaqSection";

const RetirementCalculator = () => {
  const [currentAge, setCurrentAge] = useState<string>("");
  const [currentSavings, setCurrentSavings] = useState<string>("");
  const [monthlyIncome, setMonthlyIncome] = useState<string>("");
  const [monthlyExpenses, setMonthlyExpenses] = useState<string>("");
  const [desiredRetirementIncome, setDesiredRetirementIncome] = useState<string>("");
  const [investmentReturn, setInvestmentReturn] = useState<string>("7");
  const [lifestylePreference, setLifestylePreference] = useState<string>("");
  const [includeSocialSecurity, setIncludeSocialSecurity] = useState(false);
  const [estimatedSSMonthly, setEstimatedSSMonthly] = useState<string>("1800");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    retirement_age: number;
    years_to_retirement: number;
    summary_text: string;
    monthly_withdrawal?: string;
    savings_last_years?: number;
    social_security_note?: string;
  } | null>(null);

  const handleCalculate = async () => {
    if (!currentAge || !currentSavings || !monthlyIncome || !monthlyExpenses || !desiredRetirementIncome || !investmentReturn || !lifestylePreference) {
      toast.error("Please fill in all fields");
      return;
    }

    const age = parseInt(currentAge);
    if (age < 18 || age > 80) {
      toast.error("Please enter a valid age between 18 and 80");
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('calculate-retirement', {
        body: {
          currentAge: parseInt(currentAge),
          currentSavings: parseFloat(currentSavings),
          monthlyIncome: parseFloat(monthlyIncome),
          monthlyExpenses: parseFloat(monthlyExpenses),
          desiredRetirementIncome: parseFloat(desiredRetirementIncome),
          investmentReturn: parseFloat(investmentReturn),
          lifestylePreference,
          includeSocialSecurity,
          estimatedSSMonthly: includeSocialSecurity ? parseFloat(estimatedSSMonthly) : 0,
        },
      });

      if (error) throw error;

      if (data && data.retirement_age && data.years_to_retirement !== undefined && data.summary_text) {
        setResult({
          retirement_age: data.retirement_age,
          years_to_retirement: data.years_to_retirement,
          summary_text: data.summary_text,
          monthly_withdrawal: data.monthly_withdrawal,
          savings_last_years: data.savings_last_years,
          social_security_note: data.social_security_note,
        });
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Error calculating retirement:", error);
      toast.error("Failed to calculate retirement age. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    if (!result) return;

    const shareText = `I can retire at age ${result.retirement_age} (in ${result.years_to_retirement} years)! Calculate your retirement age at ${window.location.origin}/retirement-calculator`;

    if (navigator.share) {
      try {
        await navigator.share({ title: "Retirement Age Calculator", text: shareText });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareText);
        toast.success("Copied to clipboard!");
      } catch (error) {
        toast.error("Failed to copy to clipboard");
      }
    }
  };

  return (
    <>
      <Helmet>
        <title>Retirement Calculator - Income, Withdrawal & Early Retirement Planner</title>
        <meta
          name="description"
          content="Free retirement income calculator and early retirement planner. Calculate how long your retirement savings will last, plan withdrawals, factor in social security, and get AI-powered financial insights."
        />
        <meta name="keywords" content="retirement income calculator, retirement withdrawal calculator, how long will retirement savings last calculator, retirement plan calculator, retirement calculator with social security, early retirement calculator" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-background to-background/95 py-12 px-4">
        <div className="container max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <PiggyBank className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              AI Retirement Calculator
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Get your retirement age estimate, withdrawal projections, and savings longevity analysis — powered by AI.
              <em className="block mt-2 text-sm">This is for educational purposes only and is not financial advice.</em>
            </p>
          </div>

          <Card className="mb-8 border-2 border-primary/20 shadow-lg">
            <CardContent className="p-6 md:p-8">
              <div className="space-y-6">
                {/* Current Age */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium mb-3">
                    <Calendar className="w-4 h-4 text-primary" />
                    Current Age
                  </label>
                  <Input type="number" placeholder="e.g., 30" value={currentAge} onChange={(e) => setCurrentAge(e.target.value)} min="18" max="80" />
                </div>

                {/* Current Savings */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium mb-3">
                    <PiggyBank className="w-4 h-4 text-primary" />
                    Current Retirement Savings ($)
                  </label>
                  <Input type="number" placeholder="e.g., 50000" value={currentSavings} onChange={(e) => setCurrentSavings(e.target.value)} min="0" />
                </div>

                {/* Monthly Income */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium mb-3">
                    <DollarSign className="w-4 h-4 text-primary" />
                    Monthly Income ($)
                  </label>
                  <Input type="number" placeholder="e.g., 5000" value={monthlyIncome} onChange={(e) => setMonthlyIncome(e.target.value)} min="0" />
                </div>

                {/* Monthly Expenses */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium mb-3">
                    <Wallet className="w-4 h-4 text-primary" />
                    Monthly Expenses ($)
                  </label>
                  <Input type="number" placeholder="e.g., 3000" value={monthlyExpenses} onChange={(e) => setMonthlyExpenses(e.target.value)} min="0" />
                </div>

                {/* Desired Monthly Retirement Income */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium mb-3">
                    <Home className="w-4 h-4 text-primary" />
                    Desired Monthly Retirement Income ($)
                  </label>
                  <Input type="number" placeholder="e.g., 4000" value={desiredRetirementIncome} onChange={(e) => setDesiredRetirementIncome(e.target.value)} min="0" />
                </div>

                {/* Expected Investment Return */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium mb-3">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    Expected Annual Investment Return (%)
                  </label>
                  <Select value={investmentReturn} onValueChange={setInvestmentReturn}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select return rate" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3% (Conservative)</SelectItem>
                      <SelectItem value="5">5% (Moderate)</SelectItem>
                      <SelectItem value="7">7% (Balanced)</SelectItem>
                      <SelectItem value="9">9% (Aggressive)</SelectItem>
                      <SelectItem value="11">11% (Very Aggressive)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Lifestyle Preference */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium mb-3">
                    <Home className="w-4 h-4 text-primary" />
                    Desired Retirement Lifestyle
                  </label>
                  <Select value={lifestylePreference} onValueChange={setLifestylePreference}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select lifestyle" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="modest">Modest (Basic needs)</SelectItem>
                      <SelectItem value="comfortable">Comfortable (Moderate lifestyle)</SelectItem>
                      <SelectItem value="luxurious">Luxurious (Premium lifestyle)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Social Security Toggle */}
                <div className="rounded-lg border border-primary/20 p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="social-security" className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                      <ShieldCheck className="w-4 h-4 text-primary" />
                      Include Social Security Estimate
                    </Label>
                    <Switch id="social-security" checked={includeSocialSecurity} onCheckedChange={setIncludeSocialSecurity} />
                  </div>
                  {includeSocialSecurity && (
                    <div>
                      <label className="text-xs text-muted-foreground mb-2 block">
                        Estimated Monthly Social Security Benefit ($)
                      </label>
                      <Input
                        type="number"
                        placeholder="e.g., 1800"
                        value={estimatedSSMonthly}
                        onChange={(e) => setEstimatedSSMonthly(e.target.value)}
                        min="0"
                        max="10000"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Average is ~$1,800/month. Check ssa.gov for your estimate.
                      </p>
                    </div>
                  )}
                </div>

                <Button
                  onClick={handleCalculate}
                  disabled={isLoading}
                  className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-300"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Calculating...
                    </span>
                  ) : (
                    "Calculate My Retirement Plan"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {result && (
            <Card className="border-2 border-primary/30 shadow-xl bg-gradient-to-br from-primary/5 to-background">
              <CardContent className="p-6 md:p-8">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold mb-4">Your Retirement Estimate</h2>
                  <div className="inline-flex items-baseline gap-3 mb-2">
                    <span className="text-6xl font-bold text-primary">{result.retirement_age}</span>
                    <span className="text-2xl text-muted-foreground">years old</span>
                  </div>
                  <p className="text-lg text-muted-foreground">
                    You can retire in <strong className="text-primary">{result.years_to_retirement}</strong> years
                  </p>
                </div>

                {/* Withdrawal & Savings Longevity */}
                {(result.monthly_withdrawal || result.savings_last_years) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {result.monthly_withdrawal && (
                      <Card className="border border-primary/20">
                        <CardContent className="p-4 text-center">
                          <p className="text-xs font-medium text-muted-foreground uppercase mb-1">Safe Monthly Withdrawal</p>
                          <p className="text-2xl font-bold text-primary">{result.monthly_withdrawal}</p>
                          <p className="text-xs text-muted-foreground">Using the 4% rule</p>
                        </CardContent>
                      </Card>
                    )}
                    {result.savings_last_years && (
                      <Card className="border border-primary/20">
                        <CardContent className="p-4 text-center">
                          <p className="text-xs font-medium text-muted-foreground uppercase mb-1">Savings Will Last</p>
                          <p className="text-2xl font-bold text-primary">~{result.savings_last_years} years</p>
                          <p className="text-xs text-muted-foreground">At desired withdrawal rate</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}

                {/* Social Security Note */}
                {result.social_security_note && (
                  <div className="bg-primary/5 rounded-lg p-4 mb-4">
                    <p className="text-sm flex items-start gap-2">
                      <ShieldCheck className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <span>{result.social_security_note}</span>
                    </p>
                  </div>
                )}

                <div className="prose prose-sm max-w-none mb-6">
                  <p className="text-foreground leading-relaxed">{result.summary_text}</p>
                </div>

                <Button onClick={handleShare} variant="outline" className="w-full">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Result
                </Button>
              </CardContent>
            </Card>
          )}

          {/* SEO FAQ Section */}
          <SEOFaqSection
            title="Retirement Calculator & Financial Planning FAQ"
            description="Plan your retirement with our AI-powered retirement income calculator. Whether you're considering early retirement or want to know how long your savings will last, get personalized estimates and planning insights."
            faqs={[
              {
                question: "How does the retirement income calculator work?",
                answer: "Our retirement income calculator analyzes your current age, savings, monthly income, expenses, desired retirement lifestyle, and expected investment returns to estimate when you can retire. The AI provides a personalized retirement age estimate, safe withdrawal amount, and savings longevity projection."
              },
              {
                question: "How long will my retirement savings last?",
                answer: "This depends on your total savings, withdrawal rate, investment returns, and expenses. A common rule of thumb is the 4% rule — withdrawing 4% of savings annually. Our calculator factors in your specific financial situation to estimate how long your retirement savings will last."
              },
              {
                question: "What is a retirement withdrawal calculator?",
                answer: "A retirement withdrawal calculator helps you plan how much money you can safely withdraw from your retirement accounts each year without running out. It considers factors like inflation, investment returns, and life expectancy to determine a sustainable withdrawal rate."
              },
              {
                question: "Can I plan for early retirement?",
                answer: "Yes! Our early retirement calculator shows you the financial path to retiring before the traditional age of 65. By adjusting your savings rate, investment returns, and desired lifestyle, you can see exactly what it takes to retire early."
              },
              {
                question: "Does this calculator include social security?",
                answer: "Yes! Toggle on the 'Include Social Security Estimate' option and enter your expected monthly benefit. The AI will factor this into your retirement plan, adjusting how long your savings need to last and your overall retirement timeline."
              },
              {
                question: "What is a good retirement plan?",
                answer: "A good retirement plan typically includes: saving 15-20% of income, diversified investments, an emergency fund, health insurance planning, and Social Security optimization. Our retirement plan calculator gives you a starting point based on your specific financial situation."
              }
            ]}
            relatedTools={[
              { name: "Life Expectancy Calculator", path: "/life-expectancy-calculator" },
              { name: "Health Score Calculator", path: "/health-score-calculator" },
              { name: "Age Calculator", path: "/" },
            ]}
          />
        </div>
      </div>
    </>
  );
};

export default RetirementCalculator;
