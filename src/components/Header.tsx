import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import ThemeToggle from "./ThemeToggle";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const menuRef = useRef<HTMLDivElement>(null);

  // Click/Touch outside to close menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (isMenuOpen && menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isMenuOpen]);

  // Body scroll lock when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isMenuOpen]);

  const navItems = [
    { title: "Home", path: "/" },
    { title: "Look-Alike Finder", path: "/look-alike-finder" },
    { title: "AI Face Age", path: "/ai-face-age" },
    { title: "Birthday Compatibility", path: "/compatibility-calculator" },
    { title: "Past Life Generator", path: "/past-life-generator" },
    { title: "Blog", path: "/blog" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 dark:border-white/5">
      <div className="relative backdrop-blur-xl bg-white/60 dark:bg-gray-900/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] before:absolute before:inset-0 before:bg-gradient-to-r before:from-blue-500/10 before:via-purple-500/10 before:to-pink-500/10 before:animate-shimmer before:bg-[length:200%_100%] before:pointer-events-none">
        <nav ref={menuRef} className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo/Brand */}
            <Link to="/" className="flex items-center space-x-2 relative z-10">
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Ai Age Calculator
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex md:items-center md:gap-6 relative z-10">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    isActive(item.path)
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  {item.title}
                </Link>
              ))}
              <ThemeToggle />
            </div>

            {/* Mobile Menu Button & Toggle */}
            <div className="flex items-center gap-2 md:hidden relative z-10">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle menu"
              >
                {isMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation with Backdrop */}
          <>
            {/* Backdrop Overlay */}
            <div 
              className={`fixed inset-0 bg-black/20 dark:bg-black/40 z-40 md:hidden transition-opacity duration-300 ${
                isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
              }`}
              onClick={() => setIsMenuOpen(false)}
              onTouchStart={() => setIsMenuOpen(false)}
            />
            
            {/* Mobile Menu */}
            <div 
              className={`md:hidden border-t border-white/10 dark:border-white/5 backdrop-blur-xl bg-white/90 dark:bg-gray-900/90 py-4 relative z-50 transition-all duration-300 ${
                isMenuOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'
              }`}
            >
              <div className="flex flex-col space-y-3">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`px-4 py-2 text-sm font-medium transition-colors hover:text-primary ${
                      isActive(item.path)
                        ? "text-primary bg-muted/50"
                        : "text-muted-foreground"
                    }`}
                  >
                    {item.title}
                  </Link>
                ))}
              </div>
            </div>
          </>
        </nav>
      </div>
    </header>
  );
};

export default Header;
