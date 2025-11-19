import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider } from "next-themes";
import { lazy, Suspense } from "react";
import { ProtectedAdminRoute } from "@/components/ProtectedAdminRoute";
import { BasicAdminRoute } from "@/components/BasicAdminRoute";
import { DomainGuard } from "@/components/DomainGuard";
import { AnimatePresence } from "framer-motion";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { ComparisonProvider } from "./contexts/ComparisonContext";
import { FloatingCompareBar } from "./components/FloatingCompareBar";
import { LifeExpectancyComparisonProvider } from "./contexts/LifeExpectancyComparisonContext";
import { FloatingLifeExpectancyCompareBar } from "./components/FloatingLifeExpectancyCompareBar";
import { BackToTop } from "./components/BackToTop";
import ScrollProgress from "./components/ScrollProgress";

// Lazy load route components for code splitting
const Index = lazy(() => import("./pages/Index"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const About = lazy(() => import("./pages/About"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const AuthGateway = lazy(() => import("./pages/AuthGateway"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminPanel = lazy(() => import("./pages/AdminPanel"));
const UsageStats = lazy(() => import("./pages/admin/UsageStats"));
const AuditLogs = lazy(() => import("./pages/admin/AuditLogs"));
const IPBlocking = lazy(() => import("./pages/admin/IPBlocking"));
const TwoFactorManagement = lazy(() => import("./pages/admin/TwoFactorManagement"));
const RoleManagement = lazy(() => import("./pages/admin/RoleManagement"));
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
const LifeExpectancyCalculator = lazy(() => import("./pages/LifeExpectancyCalculator"));
const RetirementCalculator = lazy(() => import("./pages/RetirementCalculator"));
const HealthScoreCalculator = lazy(() => import("./pages/HealthScoreCalculator"));
const Compare = lazy(() => import("./pages/Compare"));
const CompareLifeExpectancy = lazy(() => import("./pages/CompareLifeExpectancy"));
const DueDateCalculator = lazy(() => import("./pages/DueDateCalculator"));
const PetAgeCalculator = lazy(() => import("./pages/PetAgeCalculator"));
const SecurityMonitoring = lazy(() => import("./pages/SecurityMonitoring"));
const TwoFactorEnrollment = lazy(() => import("./pages/TwoFactorEnrollment"));
const TwoFactorVerification = lazy(() => import("./pages/TwoFactorVerification"));
const BlogManagement = lazy(() => import("./pages/admin/BlogManagement"));
const CelebrityProfilesManager = lazy(() => import("./pages/admin/CelebrityProfilesManager"));
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
            <Route path="/life-expectancy-calculator" element={<LifeExpectancyCalculator />} />
            <Route path="/retirement-calculator" element={<RetirementCalculator />} />
            <Route path="/health-score-calculator" element={<HealthScoreCalculator />} />
            <Route path="/compare" element={<Compare />} />
            <Route path="/compare-life-expectancy" element={<CompareLifeExpectancy />} />
            <Route path="/due-date-calculator" element={<DueDateCalculator />} />
            <Route path="/pet-age-calculator" element={<PetAgeCalculator />} />
        <Route path="/auth-gateway-key-a1b2c3" element={
          <DomainGuard><AuthGateway /></DomainGuard>
        } />
        <Route path="/system-control-panel-x4y5z6" element={
          <DomainGuard>
            <ProtectedAdminRoute><AdminDashboard /></ProtectedAdminRoute>
          </DomainGuard>
        } />
        <Route path="/system-control-panel-x4y5z6" element={
          <DomainGuard>
            <ProtectedAdminRoute><AdminPanel /></ProtectedAdminRoute>
          </DomainGuard>
        } />
        <Route path="/manage-profiles" element={
          <DomainGuard>
            <ProtectedAdminRoute><CelebrityProfilesManager /></ProtectedAdminRoute>
          </DomainGuard>
        } />
        <Route path="/admin/usage-stats" element={
          <DomainGuard>
            <ProtectedAdminRoute><UsageStats /></ProtectedAdminRoute>
          </DomainGuard>
        } />
        <Route path="/admin/audit-logs" element={
          <DomainGuard>
            <ProtectedAdminRoute><AuditLogs /></ProtectedAdminRoute>
          </DomainGuard>
        } />
        <Route path="/admin/ip-blocking" element={
          <DomainGuard>
            <ProtectedAdminRoute><IPBlocking /></ProtectedAdminRoute>
          </DomainGuard>
        } />
        <Route path="/admin/2fa-management" element={
          <DomainGuard>
            <ProtectedAdminRoute><TwoFactorManagement /></ProtectedAdminRoute>
          </DomainGuard>
        } />
        <Route path="/admin/role-management" element={
          <DomainGuard>
            <ProtectedAdminRoute><RoleManagement /></ProtectedAdminRoute>
          </DomainGuard>
        } />
        <Route path="/admin/blog-management" element={
          <DomainGuard>
            <ProtectedAdminRoute><BlogManagement /></ProtectedAdminRoute>
          </DomainGuard>
        } />
        <Route path="/admin/security-monitoring" element={
          <DomainGuard>
            <ProtectedAdminRoute><SecurityMonitoring /></ProtectedAdminRoute>
          </DomainGuard>
        } />
        <Route path="/2fa-enrollment" element={
          <DomainGuard>
            <BasicAdminRoute><TwoFactorEnrollment /></BasicAdminRoute>
          </DomainGuard>
        } />
        <Route path="/2fa-verify" element={
          <DomainGuard>
            <BasicAdminRoute><TwoFactorVerification /></BasicAdminRoute>
          </DomainGuard>
        } />
        <Route path="/security-monitoring-m7n8p9" element={
          <DomainGuard>
            <ProtectedAdminRoute><SecurityMonitoring /></ProtectedAdminRoute>
          </DomainGuard>
        } />
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
          <ComparisonProvider>
            <LifeExpectancyComparisonProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <ScrollProgress />
                <div className="flex flex-col min-h-screen">
                  <Header />
                  <main className="flex-1">
                    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
                      <AnimatedRoutes />
                    </Suspense>
                  </main>
                  <Footer />
                  <FloatingCompareBar />
                  <FloatingLifeExpectancyCompareBar />
                  <BackToTop />
                </div>
              </BrowserRouter>
            </LifeExpectancyComparisonProvider>
          </ComparisonProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
