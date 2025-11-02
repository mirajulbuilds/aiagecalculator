import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-11 h-11 md:w-12 md:h-12 rounded-full backdrop-blur-md bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10" />
    );
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <button
      onClick={toggleTheme}
      className="group relative w-11 h-11 md:w-12 md:h-12 rounded-full backdrop-blur-md bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 hover:bg-white/20 dark:hover:bg-black/30 hover:scale-110 hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all duration-500 ease-in-out flex items-center justify-center"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Sun className="h-5 w-5 md:h-6 md:w-6 text-yellow-300 transition-all duration-500 rotate-0 scale-100" />
      ) : (
        <Moon className="h-5 w-5 md:h-6 md:w-6 text-blue-600 dark:text-blue-400 transition-all duration-500 rotate-0 scale-100" />
      )}
    </button>
  );
};

export default ThemeToggle;
