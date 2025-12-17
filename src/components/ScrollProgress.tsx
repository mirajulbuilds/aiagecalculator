import { useEffect, useState, useCallback } from "react";

const ScrollProgress = () => {
  const [progress, setProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);

  const updateProgress = useCallback(() => {
    // Use cached values to minimize reflow
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight > 0) {
      setProgress((scrollTop / docHeight) * 100);
    }
  }, []);

  useEffect(() => {
    let rafId: number | null = null;

    const handleScroll = () => {
      if (rafId === null) {
        rafId = requestAnimationFrame(() => {
          updateProgress();
          rafId = null;
        });
      }
    };

    // Defer initial calculation to avoid blocking render
    const timeoutId = requestAnimationFrame(() => {
      setIsReady(true);
      updateProgress();
    });

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      cancelAnimationFrame(timeoutId);
    };
  }, [updateProgress]);

  // Don't render until ready to avoid initial reflow
  if (!isReady) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary to-secondary z-[100] origin-left shadow-lg"
      style={{ 
        transform: `scaleX(${progress / 100})`,
        transformOrigin: 'left',
        willChange: 'transform'
      }}
    />
  );
};

export default ScrollProgress;
