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
        bg-gradient-to-r transition-all duration-500 ease-in-out
        ${isDark 
          ? 'from-purple-500/20 via-indigo-500/20 to-blue-500/20 dark:from-purple-600/30 dark:via-indigo-600/30 dark:to-blue-600/30' 
          : 'from-yellow-400/20 via-orange-400/20 to-pink-400/20'
        }
        border border-white/30 dark:border-white/20
        shadow-[0_4px_15px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_20px_rgba(255,255,255,0.05)]
        hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] 
        dark:hover:shadow-[0_0_20px_rgba(250,204,21,0.4)]
        animate-float
        ${isClicked ? 'animate-pulse-ripple' : ''}
        before:absolute before:inset-0 before:rounded-[50px] 
        before:bg-gradient-to-r 
        ${isDark 
          ? 'before:from-purple-400/10 before:via-indigo-400/10 before:to-blue-400/10' 
          : 'before:from-yellow-300/10 before:via-orange-300/10 before:to-pink-300/10'
        }
        before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500
        after:absolute after:inset-[-2px] after:rounded-[50px]
        after:bg-gradient-to-r 
        ${isDark 
          ? 'after:from-purple-500/20 after:to-blue-500/20' 
          : 'after:from-yellow-500/20 after:to-pink-500/20'
        }
        after:opacity-0 hover:after:opacity-100 after:blur-md after:transition-opacity after:duration-500
        after:-z-10
        hover:scale-105 active:scale-95
      `}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      role="switch"
      aria-checked={isDark}
    >
      {/* Sliding Knob */}
      <div 
        className={`
          absolute top-1 ${isDark ? 'left-1' : 'right-1 md:right-1'}
          w-6 h-6 md:w-8 md:h-8 rounded-full
          backdrop-blur-md bg-white/90 dark:bg-gray-800/90
          border-2 border-white/50 dark:border-white/20
          shadow-[0_2px_10px_rgba(0,0,0,0.2)] dark:shadow-[0_2px_10px_rgba(255,255,255,0.1)]
          transition-all duration-500 ease-spring
          flex items-center justify-center
          ${isClicked ? 'scale-90' : 'scale-100'}
          before:absolute before:inset-0 before:rounded-full
          before:bg-gradient-to-br 
          ${isDark 
            ? 'before:from-blue-400/30 before:to-purple-400/30' 
            : 'before:from-yellow-400/30 before:to-orange-400/30'
          }
          before:blur-sm before:transition-opacity before:duration-500
          group-hover:shadow-[0_0_15px_rgba(59,130,246,0.6)] 
          dark:group-hover:shadow-[0_0_15px_rgba(250,204,21,0.6)]
        `}
        style={{
          transform: isDark ? 'translateX(0)' : 'translateX(calc(100% + 0.5rem))',
        }}
      >
        {/* Sun Icon for Light Mode */}
        <Sun 
          className={`
            absolute h-4 w-4 md:h-5 md:w-5 text-yellow-500
            transition-all duration-600 ease-in-out
            ${isDark 
              ? 'rotate-180 scale-0 opacity-0' 
              : 'rotate-0 scale-100 opacity-100'
            }
            drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]
          `}
        />
        
        {/* Moon Icon for Dark Mode */}
        <Moon 
          className={`
            absolute h-4 w-4 md:h-5 md:w-5 text-blue-500 dark:text-blue-400
            transition-all duration-600 ease-in-out
            ${isDark 
              ? 'rotate-0 scale-100 opacity-100' 
              : 'rotate-180 scale-0 opacity-0'
            }
            drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]
          `}
        />
      </div>
    </button>
  );
};

export default ThemeToggle;
