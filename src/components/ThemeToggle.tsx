import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-16 h-8 md:w-20 md:h-10 rounded-[50px] backdrop-blur-[10px] bg-white/15 dark:bg-black/10 border border-white/20 dark:border-white/10" />
    );
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 600);
  };

  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      className={`
        group relative w-16 h-8 md:w-20 md:h-10 rounded-[50px]
        backdrop-blur-[10px] 
        bg-gradient-to-r from-[hsl(220,50%,35%)] via-[hsl(260,45%,40%)] to-[hsl(270,50%,45%)]
        transition-all duration-500 ease-in-out
        border border-white/20
        shadow-[0_4px_20px_rgba(0,0,0,0.3),inset_0_1px_2px_rgba(255,255,255,0.1)]
        hover:shadow-[0_0_30px_rgba(139,92,246,0.5)]
        animate-float
        ${isClicked ? 'animate-pulse-ripple' : ''}
        before:absolute before:inset-0 before:rounded-[50px] 
        before:bg-gradient-to-br before:from-white/5 before:to-transparent
        before:opacity-100
        after:absolute after:inset-[-2px] after:rounded-[50px]
        after:bg-gradient-to-r after:from-blue-500/20 after:to-purple-500/20
        after:opacity-0 hover:after:opacity-100 after:blur-lg after:transition-opacity after:duration-500
        after:-z-10
        hover:scale-105 active:scale-95
      `}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      role="switch"
      aria-checked={isDark}
    >
      {/* Fixed Sun Icon on Left */}
      <Sun 
        className="absolute left-2 md:left-3 top-1/2 -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-white/60 transition-all duration-500"
      />
      
      {/* Sliding Knob with Moon Icon */}
      <div 
        className={`
          absolute top-1 ${isDark ? 'right-1' : 'left-1'}
          w-6 h-6 md:w-8 md:h-8 rounded-full
          backdrop-blur-md bg-gradient-to-br from-[hsl(260,50%,60%)] to-[hsl(280,50%,50%)]
          border-2 border-white/30
          shadow-[0_4px_15px_rgba(0,0,0,0.3),inset_0_1px_3px_rgba(255,255,255,0.2)]
          transition-all duration-500 ease-out
          flex items-center justify-center
          ${isClicked ? 'scale-90' : 'scale-100'}
          before:absolute before:inset-0 before:rounded-full
          before:bg-gradient-to-br before:from-white/20 before:to-transparent
          before:blur-sm
          group-hover:shadow-[0_0_20px_rgba(167,139,250,0.8)]
        `}
      >
        {/* Moon Icon Inside Knob */}
        <Moon 
          className="h-4 w-4 md:h-5 md:w-5 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]"
        />
      </div>
    </button>
  );
};

export default ThemeToggle;
