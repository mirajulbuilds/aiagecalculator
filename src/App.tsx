import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider } from "next-themes";
import { lazy, Suspense } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";

// Lazy load route components for code splitting
const Index = lazy(() => import("./pages/Index"));
const FamousBirthdays = lazy(() => import("./pages/FamousBirthdays"));
const CelebrityDetail = lazy(() => import("./pages/CelebrityDetail"));
const CelebrityAdmin = lazy(() => import("./pages/CelebrityAdmin"));
const CelebrityProfileGenerator = lazy(() => import("./pages/CelebrityProfileGenerator"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const About = lazy(() => import("./pages/About"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const NotFound = lazy(() => import("./pages/NotFound"));
const TomHanks = lazy(() => import("./pages/celebrity/TomHanks"));
const TaylorSwift = lazy(() => import("./pages/celebrity/TaylorSwift"));
const ElonMusk = lazy(() => import("./pages/celebrity/ElonMusk"));
const LeonardoDiCaprio = lazy(() => import("./pages/celebrity/LeonardoDiCaprio"));
const SelenaGomez = lazy(() => import("./pages/celebrity/SelenaGomez"));
const CristianoRonaldo = lazy(() => import("./pages/celebrity/CristianoRonaldo"));
const Beyonce = lazy(() => import("./pages/celebrity/Beyonce"));
const BillGates = lazy(() => import("./pages/celebrity/BillGates"));
const DwayneJohnson = lazy(() => import("./pages/celebrity/DwayneJohnson"));
const EmmaWatson = lazy(() => import("./pages/celebrity/EmmaWatson"));
const SeedDatabase = lazy(() => import("./pages/SeedDatabase"));

const queryClient = new QueryClient();

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
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/famous-birthdays" element={<FamousBirthdays />} />
                    <Route path="/celebrity/:slug" element={<CelebrityDetail />} />
                    <Route path="/celebrity-admin" element={<CelebrityAdmin />} />
                    <Route path="/celebrity-generator" element={<CelebrityProfileGenerator />} />
                    <Route path="/famous-birthdays/tom-hanks" element={<TomHanks />} />
                    <Route path="/famous-birthdays/taylor-swift" element={<TaylorSwift />} />
                    <Route path="/famous-birthdays/elon-musk" element={<ElonMusk />} />
                    <Route path="/famous-birthdays/leonardo-dicaprio" element={<LeonardoDiCaprio />} />
                    <Route path="/famous-birthdays/selena-gomez" element={<SelenaGomez />} />
                    <Route path="/famous-birthdays/cristiano-ronaldo" element={<CristianoRonaldo />} />
                    <Route path="/famous-birthdays/beyonce" element={<Beyonce />} />
                    <Route path="/famous-birthdays/bill-gates" element={<BillGates />} />
                    <Route path="/famous-birthdays/dwayne-johnson" element={<DwayneJohnson />} />
                    <Route path="/famous-birthdays/emma-watson" element={<EmmaWatson />} />
                    <Route path="/blog" element={<Blog />} />
                    <Route path="/blog/:slug" element={<BlogPost />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                    <Route path="/seed-database" element={<SeedDatabase />} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
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
