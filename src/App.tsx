import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider } from "next-themes";
import { lazy, Suspense } from "react";
import { AnimatePresence } from "framer-motion";
import Header from "./components/Header";
import Footer from "./components/Footer";

// Lazy load route components for code splitting
const Index = lazy(() => import("./pages/Index"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const About = lazy(() => import("./pages/About"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const AuthGateway = lazy(() => import("./pages/AuthGateway"));
const AdminPanel = lazy(() => import("./pages/AdminPanel"));
const CelebrityPreview = lazy(() => import("./pages/CelebrityPreview"));
const CelebrityProfile = lazy(() => import("./pages/CelebrityProfile"));
const FamousBirthdays = lazy(() => import("./pages/FamousBirthdays"));
const SearchResults = lazy(() => import("./pages/SearchResults"));
const ProfessionPage = lazy(() => import("./pages/ProfessionPage"));
const BirthMonthPage = lazy(() => import("./pages/BirthMonthPage"));
const ZodiacPage = lazy(() => import("./pages/ZodiacPage"));
const LookAlikeFinder = lazy(() => import("./pages/LookAlikeFinder"));
const BatchEmbeddingGenerator = lazy(() => import("./pages/BatchEmbeddingGenerator"));
const AiFaceAge = lazy(() => import("./pages/AiFaceAge"));
const CompatibilityCalculator = lazy(() => import("./pages/CompatibilityCalculator"));
const PastLifeGenerator = lazy(() => import("./pages/PastLifeGenerator"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Index />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/about" element={<About />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/famous-birthdays" element={<FamousBirthdays />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/profession/:professionSlug" element={<ProfessionPage />} />
        <Route path="/birth-month/:monthName" element={<BirthMonthPage />} />
        <Route path="/zodiac/:signName" element={<ZodiacPage />} />
        <Route path="/look-alike-finder" element={<LookAlikeFinder />} />
        <Route path="/ai-face-age" element={<AiFaceAge />} />
        <Route path="/compatibility-calculator" element={<CompatibilityCalculator />} />
        <Route path="/past-life-generator" element={<PastLifeGenerator />} />
        <Route path="/auth-gateway-key-a1b2c3" element={<AuthGateway />} />
        <Route path="/system-control-panel-x4y5z6" element={<AdminPanel />} />
        <Route path="/batch-embedding-generator-z7y8x9" element={<BatchEmbeddingGenerator />} />
        <Route path="/celebrity/preview" element={<CelebrityPreview />} />
        <Route path="/people/:profileSlug" element={<CelebrityProfile />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem storageKey="ai-age-calc-theme">
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-1">
                <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
                  <AnimatedRoutes />
                </Suspense>
              </main>
              <Footer />
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
