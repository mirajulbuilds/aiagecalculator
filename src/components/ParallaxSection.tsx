import { useEffect, useRef, useCallback, ReactNode } from "react";

interface ParallaxSectionProps {
  children: ReactNode;
  speed?: number;
  className?: string;
}

const ParallaxSection = ({ children, speed = 0.5, className = "" }: ParallaxSectionProps) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const rafId = useRef<number | null>(null);
  const elementTopRef = useRef<number>(0);

  const updateTransform = useCallback(() => {
    if (innerRef.current) {
      const scrolled = window.scrollY;
      const offset = (scrolled - elementTopRef.current) * speed;
      innerRef.current.style.transform = `translateY(${offset}px)`;
    }
  }, [speed]);

  useEffect(() => {
    // Calculate element top position once on mount/resize
    const calculatePosition = () => {
      if (sectionRef.current) {
        elementTopRef.current = sectionRef.current.offsetTop;
      }
    };

    const handleScroll = () => {
      if (rafId.current === null) {
        rafId.current = requestAnimationFrame(() => {
          updateTransform();
          rafId.current = null;
        });
      }
    };

    calculatePosition();
    updateTransform();

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", calculatePosition, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", calculatePosition);
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, [updateTransform]);

  return (
    <div ref={sectionRef} className={className}>
      <div ref={innerRef} style={{ willChange: "transform" }}>
        {children}
      </div>
    </div>
  );
};

export default ParallaxSection;
