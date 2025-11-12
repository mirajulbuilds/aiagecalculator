import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BackToTopProps {
  /**
   * CSS selector or element ID to observe (when this element is out of view, button appears)
   * Default: observes when user scrolls down 400px
   */
  targetSelector?: string;
}

export const BackToTop = ({ targetSelector }: BackToTopProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (targetSelector) {
      // Use Intersection Observer if target element is specified
      const targetElement = document.querySelector(targetSelector);
      if (!targetElement) {
        console.warn(`BackToTop: Target element "${targetSelector}" not found`);
        return;
      }

      const observer = new IntersectionObserver(
        (entries) => {
          // When target is NOT visible (user scrolled past it), show button
          entries.forEach((entry) => {
            setIsVisible(!entry.isIntersecting);
          });
        },
        {
          root: null,
          rootMargin: "0px",
          threshold: 0,
        }
      );

      observer.observe(targetElement);

      return () => {
        observer.disconnect();
      };
    } else {
      // Fallback: Simple scroll listener (show button after 400px scroll)
      const handleScroll = () => {
        setIsVisible(window.scrollY > 400);
      };

      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    }
  }, [targetSelector]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <Button
      id="back-to-top-btn"
      onClick={scrollToTop}
      className={`fixed bottom-5 right-5 z-[98] w-12 h-12 rounded-full shadow-lg transition-all duration-300 ${
        isVisible ? "opacity-100 visible translate-y-0" : "opacity-0 invisible translate-y-2"
      }`}
      size="icon"
      aria-label="Back to top"
    >
      <ArrowUp className="w-5 h-5" />
    </Button>
  );
};
