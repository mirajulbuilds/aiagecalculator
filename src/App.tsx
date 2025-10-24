import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Header from "./components/Header";
import Index from "./pages/Index";
import FamousBirthdays from "./pages/FamousBirthdays";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import TomHanks from "./pages/celebrity/TomHanks";
import TaylorSwift from "./pages/celebrity/TaylorSwift";
import ElonMusk from "./pages/celebrity/ElonMusk";
import LeonardoDiCaprio from "./pages/celebrity/LeonardoDiCaprio";
import SelenaGomez from "./pages/celebrity/SelenaGomez";
import CristianoRonaldo from "./pages/celebrity/CristianoRonaldo";
import Beyonce from "./pages/celebrity/Beyonce";
import BillGates from "./pages/celebrity/BillGates";
import DwayneJohnson from "./pages/celebrity/DwayneJohnson";
import EmmaWatson from "./pages/celebrity/EmmaWatson";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Header />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/famous-birthdays" element={<FamousBirthdays />} />
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
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
