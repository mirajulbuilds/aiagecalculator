import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [isVisible, setIsVisible] = useState(false);
  const footerRef = useRef<HTMLElement>(null);

  // CSS-only ripple effect - no JS layout queries needed
  // The ripple is handled purely via CSS :active state to avoid forced reflows

  // Intersection Observer for slide-in animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      {
        threshold: 0.1,
      }
    );

    if (footerRef.current) {
      observer.observe(footerRef.current);
    }

    return () => {
      if (footerRef.current) {
        observer.unobserve(footerRef.current);
      }
    };
  }, []);

  return (
    <footer 
      ref={footerRef}
      className={`w-full border-t border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 mt-auto transition-all duration-700 ease-out ${
        isVisible 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-8'
      }`}
    >
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="text-center md:text-left">
            © {currentYear} aiagecalc.com. All rights reserved.
          </div>
          <nav className="flex gap-6">
            <Link 
              to="/about" 
              className="hover:text-foreground transition-colors relative overflow-hidden px-2 py-1 rounded active:scale-95"
            >
              About
            </Link>
            <Link 
              to="/privacy-policy" 
              className="hover:text-foreground transition-colors relative overflow-hidden px-2 py-1 rounded active:scale-95"
            >
              Privacy Policy
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
