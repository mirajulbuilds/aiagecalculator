import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ThemeToggle from "./ThemeToggle";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const location = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dropdownLinksRef = useRef<HTMLAnchorElement[]>([]);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  // Scroll detection for sticky header effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Dialog component handles scroll locking automatically

  // Keyboard navigation for AI Tools dropdown
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isDropdownOpen) return;

      const links = dropdownLinksRef.current.filter(link => link !== null);
      
      switch(e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex(prev => {
            const next = prev < links.length - 1 ? prev + 1 : 0;
            links[next]?.focus();
            return next;
          });
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex(prev => {
            const next = prev > 0 ? prev - 1 : links.length - 1;
            links[next]?.focus();
            return next;
          });
          break;
        case 'Escape':
          setIsDropdownOpen(false);
          setFocusedIndex(-1);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isDropdownOpen]);

  const handleToggleMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleCloseMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const mainNavItems = [
    { title: "Home", path: "/" },
    { title: "Famous Birthdays", path: "/famous-birthdays" },
    { title: "Blog", path: "/blog" },
  ];

  const aiToolsItems = [
    { title: "Look-Alike Finder", path: "/look-alike-finder" },
    { title: "AI Face Age", path: "/ai-face-age" },
    { title: "Birthday Compatibility", path: "/compatibility-calculator" },
    { title: "Past Life Generator", path: "/past-life-generator" },
  ];

  const mobileNavItems = [
    { title: "Home", path: "/" },
    { title: "Look-Alike Finder", path: "/look-alike-finder" },
    { title: "AI Face Age", path: "/ai-face-age" },
    { title: "Birthday Compatibility", path: "/compatibility-calculator" },
    { title: "Past Life Generator", path: "/past-life-generator" },
    { title: "Famous Birthdays", path: "/famous-birthdays" },
    { title: "Blog", path: "/blog" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <header className={`global-header sticky top-0 z-[1000] w-full border-b transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-white/20 shadow-[0_4px_15px_rgba(0,0,0,0.05)]' 
          : 'bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border-white/10 dark:border-white/5'
      }`}>
        <div className="relative before:absolute before:inset-0 before:bg-gradient-to-r before:from-blue-500/10 before:via-purple-500/10 before:to-pink-500/10 before:animate-shimmer before:bg-[length:200%_100%] before:pointer-events-none">
          <nav className="container mx-auto px-3 sm:px-4">
            <div className="flex h-16 items-center justify-between gap-2">
              {/* Logo/Brand */}
              <Link to="/" className="flex items-center space-x-2 relative z-10 flex-shrink-0">
                <span className="text-base sm:text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent whitespace-nowrap">
                  Ai Age Calculator
                </span>
              </Link>

              {/* Desktop Navigation */}
              <div className="desktop-nav hidden lg:flex lg:items-center lg:gap-6 relative z-10">
                {/* Home Link */}
                <Link
                  to="/"
                  className={`nav-link text-sm font-medium transition-colors hover:text-primary ${
                    isActive("/")
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  Home
                </Link>
                
                {/* AI Tools Dropdown */}
                <div 
                  className="ai-tools-dropdown relative"
                  ref={dropdownRef}
                  onMouseEnter={() => setIsDropdownOpen(true)}
                  onMouseLeave={() => {
                    setIsDropdownOpen(false);
                    setFocusedIndex(-1);
                  }}
                >
                  <button 
                    className="ai-tools-dropdown-trigger flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary text-muted-foreground"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    aria-expanded={isDropdownOpen}
                    aria-haspopup="true"
                  >
                    AI Tools
                    <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <div 
                    className={`ai-tools-dropdown-panel absolute top-full left-0 mt-2 min-w-[250px] bg-white/90 dark:bg-gray-900/90 backdrop-blur-[20px] border border-white/20 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.15)] p-3 z-[1001] transition-all duration-200 ${
                      isDropdownOpen 
                        ? 'opacity-100 visible scale-100 translate-y-0' 
                        : 'opacity-0 invisible scale-95 -translate-y-2'
                    }`}
                    role="menu"
                    aria-label="AI Tools menu"
                  >
                    {aiToolsItems.map((item, index) => (
                      <Link
                        key={item.path}
                        ref={(el) => {
                          if (el) dropdownLinksRef.current[index] = el;
                        }}
                        to={item.path}
                        className={`block px-3 py-2.5 text-sm rounded-lg transition-all duration-200 hover:bg-black/5 dark:hover:bg-white/5 hover:pl-4 ${
                          isActive(item.path)
                            ? "text-primary font-semibold bg-primary/10"
                            : "text-foreground"
                        }`}
                        role="menuitem"
                        tabIndex={isDropdownOpen ? 0 : -1}
                      >
                        {item.title}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Famous Birthdays Link */}
                <Link
                  to="/famous-birthdays"
                  className={`nav-link text-sm font-medium transition-colors hover:text-primary ${
                    isActive("/famous-birthdays")
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  Famous Birthdays
                </Link>

                {/* Blog Link */}
                <Link
                  to="/blog"
                  className={`nav-link text-sm font-medium transition-colors hover:text-primary ${
                    isActive("/blog")
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  Blog
                </Link>

                <ThemeToggle />
              </div>

              {/* Mobile Menu Button */}
              <div className="mobile-menu-toggle-button flex items-center gap-2 lg:hidden relative z-10">
                <ThemeToggle />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleToggleMenu}
                  aria-label="Toggle menu"
                  aria-expanded={isMobileMenuOpen}
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </nav>
        </div>
      </header>

      {/* Mobile Menu Dialog */}
      <Dialog open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white/90 dark:bg-gray-900/90 backdrop-blur-[20px] border border-white/20 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.15)]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Menu
            </DialogTitle>
          </DialogHeader>
          <nav className="flex flex-col space-y-1 mt-4">
            {mobileNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={handleCloseMenu}
                className={`px-3 py-2.5 text-base font-bold rounded-lg transition-all duration-200 ${
                  isActive(item.path)
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-foreground hover:bg-black/5 dark:hover:bg-white/5 hover:pl-4"
                }`}
              >
                {item.title}
              </Link>
            ))}
          </nav>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Header;
