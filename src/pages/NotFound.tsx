import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageTransition from "@/components/PageTransition";
import { useRenderState } from "@/lib/renderState";

const NotFound = () => {
  const location = useLocation();
  useRenderState(false, true);

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
    
    // Set page title for SEO
    document.title = "404 - Page Not Found | AI Age Calculator";
    
    // Add meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'The page you are looking for does not exist. Return to AI Age Calculator homepage.');
    }
  }, [location.pathname]);

  return (
    <PageTransition>
    <>
    <Helmet>
      <meta name="robots" content="noindex, nofollow" />
    </Helmet>
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="text-center max-w-md">
        <h1 className="mb-4 text-6xl md:text-8xl font-bold text-primary">404</h1>
        <h2 className="mb-4 text-2xl md:text-3xl font-semibold text-foreground">Page Not Found</h2>
        <p className="mb-8 text-base md:text-lg text-muted-foreground">
          Sorry, the page you are looking for doesn't exist or has been moved.
        </p>
        <Link to="/">
          <Button className="gap-2 bg-gradient-primary hover:opacity-90">
            <Home className="w-4 h-4" aria-hidden="true" />
            Return to Home
          </Button>
        </Link>
      </div>
    </main>
    </>
    </PageTransition>
  );
};

export default NotFound;
