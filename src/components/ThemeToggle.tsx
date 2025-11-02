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
      <div className="w-12 h-12 md:w-14 md:h-14 rounded-full backdrop-blur-[10px] bg-white/15 dark:bg-black/10 border border-white/20 dark:border-white/10" />
    );
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 600);
  };

  return (
    <button
      onClick={toggleTheme}
      className={`
        group relative w-12 h-12 md:w-14 md:h-14 rounded-[50px] 
        backdrop-blur-[10px] 
        bg-white/15 dark:bg-black/10
        border border-white/30 dark:border-white/20
        shadow-[0_4px_15px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_20px_rgba(255,255,255,0.05)]
        hover:bg-white/25 dark:hover:bg-black/20
        hover:scale-105 
        hover:shadow-[0_0_30px_rgba(59,130,246,0.6),0_0_60px_rgba(139,92,246,0.3)] 
        dark:hover:shadow-[0_0_30px_rgba(250,204,21,0.6),0_0_60px_rgba(251,191,36,0.3)]
        active:scale-95
        transition-all duration-500 ease-in-out
        flex items-center justify-center
        animate-float
        ${isClicked ? 'animate-pulse-ripple' : ''}
        before:absolute before:inset-0 before:rounded-[50px] 
        before:bg-gradient-to-br before:from-blue-400/20 before:via-purple-400/20 before:to-pink-400/20
        dark:before:from-yellow-400/20 dark:before:via-orange-400/20 dark:before:to-red-400/20
        before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500
        after:absolute after:inset-[-2px] after:rounded-[50px]
        after:bg-gradient-to-br after:from-blue-500/30 after:to-purple-500/30
        dark:after:from-yellow-500/30 dark:after:to-orange-500/30
        after:opacity-0 hover:after:opacity-100 after:blur-md after:transition-opacity after:duration-500
        after:-z-10
      `}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      role="switch"
      aria-checked={theme === "dark"}
    >
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Sun Icon for Light Mode */}
        <Sun 
          className={`
            absolute h-6 w-6 md:h-7 md:w-7 text-yellow-400 dark:text-yellow-300
            transition-all duration-600 ease-in-out
            ${theme === "dark" 
              ? 'rotate-0 scale-100 opacity-100' 
              : 'rotate-180 scale-0 opacity-0'
            }
            drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]
          `}
        />
        
        {/* Moon Icon for Dark Mode */}
        <Moon 
          className={`
            absolute h-6 w-6 md:h-7 md:w-7 text-blue-400 dark:text-blue-300
            transition-all duration-600 ease-in-out
            ${theme === "dark" 
              ? 'rotate-180 scale-0 opacity-0' 
              : 'rotate-0 scale-100 opacity-100'
            }
            drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]
          `}
        />
      </div>
    </button>
  );
};

export default ThemeToggle;
