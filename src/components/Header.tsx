import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import ThemeToggle from "./ThemeToggle";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Body scroll lock when menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isMobileMenuOpen]);

  const handleOpenMenu = () => {
    setIsMobileMenuOpen(true);
  };

  const handleCloseMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const navItems = [
    { title: "Home", path: "/" },
    { title: "Look-Alike Finder", path: "/look-alike-finder" },
    { title: "AI Face Age", path: "/ai-face-age" },
    { title: "Birthday Compatibility", path: "/compatibility-calculator" },
    { title: "Past Life Generator", path: "/past-life-generator" },
    { title: "Blog", path: "/blog" },
    { title: "Famous Birthdays", path: "/famous-birthdays" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-white/10 dark:border-white/5">
        <div className="relative backdrop-blur-xl bg-white/60 dark:bg-gray-900/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] before:absolute before:inset-0 before:bg-gradient-to-r before:from-blue-500/10 before:via-purple-500/10 before:to-pink-500/10 before:animate-shimmer before:bg-[length:200%_100%] before:pointer-events-none">
          <nav className="container mx-auto px-4">
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

              {/* Mobile Menu Button */}
              <div className="flex items-center gap-2 md:hidden relative z-10">
                <ThemeToggle />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleOpenMenu}
                  aria-label="Open menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </nav>
        </div>
      </header>

      {/* Mobile Slide-In Menu */}
      <>
        {/* Backdrop Overlay */}
        <div 
          id="menu-backdrop"
          className={`fixed inset-0 bg-black/50 dark:bg-black/70 z-[99] md:hidden transition-opacity duration-300 ${
            isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
          }`}
          onClick={handleCloseMenu}
          onTouchStart={handleCloseMenu}
        />
        
        {/* Slide-In Menu Panel */}
        <div 
          id="mobile-menu-panel"
          className={`fixed top-0 right-0 w-[300px] h-screen bg-card/95 backdrop-blur-xl border-l border-border z-[100] md:hidden transition-transform duration-300 ease-out shadow-2xl ${
            isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Close Button */}
          <div className="flex justify-end p-4 border-b border-border/50">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCloseMenu}
              aria-label="Close menu"
              className="hover:bg-primary/10"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>

          {/* Menu Links */}
          <nav className="flex flex-col p-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={handleCloseMenu}
                className={`px-4 py-3 text-base font-semibold rounded-lg transition-all ${
                  isActive(item.path)
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-foreground hover:bg-primary/10 hover:text-primary"
                }`}
              >
                {item.title}
              </Link>
            ))}
          </nav>
        </div>
      </>
    </>
  );
};

export default Header;
