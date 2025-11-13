import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import ThemeToggle from "./ThemeToggle";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const location = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dropdownLinksRef = useRef<HTMLAnchorElement[]>([]);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Ripple effect handler
  const createRipple = (event: React.MouseEvent<HTMLButtonElement>) => {
    const button = event.currentTarget;
    const ripple = document.createElement('span');
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;

    const rect = button.getBoundingClientRect();
    ripple.style.width = ripple.style.height = `${diameter}px`;
    ripple.style.left = `${event.clientX - rect.left - radius}px`;
    ripple.style.top = `${event.clientY - rect.top - radius}px`;
    ripple.classList.add('ripple');

    const existingRipple = button.querySelector('.ripple');
    if (existingRipple) {
      existingRipple.remove();
    }

    button.appendChild(ripple);

    setTimeout(() => {
      ripple.remove();
    }, 600);
  };

  // Calculate scrollbar width and set CSS variable
  useEffect(() => {
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.documentElement.style.setProperty('--scrollbar-width', `${scrollbarWidth}px`);
  }, []);

  // Scroll detection for sticky header effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scrollbar-aware body scroll lock for mobile menu
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.classList.add('mobile-menu-is-open');
    } else {
      document.body.classList.remove('mobile-menu-is-open');
    }
    return () => {
      document.body.classList.remove('mobile-menu-is-open');
    };
  }, [isMobileMenuOpen]);

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

  // Escape key handler for mobile menu
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        handleCloseMenu();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [isMobileMenuOpen]);

  // Focus trap for mobile menu
  useEffect(() => {
    if (!isMobileMenuOpen || !mobileMenuRef.current) return;

    const menuElement = mobileMenuRef.current;
    const focusableElements = menuElement.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Focus the first menu link when menu opens
    firstElement?.focus();

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleTabKey);
    return () => document.removeEventListener('keydown', handleTabKey);
  }, [isMobileMenuOpen]);

  const handleOpenMenu = () => {
    setIsMobileMenuOpen(true);
  };

  const handleCloseMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleToggleMenuWithRipple = (e: React.MouseEvent<HTMLButtonElement>) => {
    createRipple(e);
    if (isMobileMenuOpen) {
      handleCloseMenu();
    } else {
      handleOpenMenu();
    }
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

              {/* Desktop Navigation - Only visible on 1024px+ */}
              <div className="desktop-nav hidden min-[1024px]:flex min-[1024px]:items-center min-[1024px]:gap-6 relative z-10">
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

              {/* Mobile Menu Button and Theme Toggle */}
              <div className="mobile-menu-toggle-button flex items-center gap-2 relative z-10">
                <ThemeToggle />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleToggleMenuWithRipple}
                  aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                  aria-expanded={isMobileMenuOpen}
                  aria-controls="mobile-menu-panel"
                  className={`relative overflow-hidden ${isMobileMenuOpen ? 'animate-pulse-slow' : ''}`}
                >
                  <div className={`flex items-center justify-center absolute inset-0 transition-all duration-300 ${isMobileMenuOpen ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'}`}>
                    <Menu className="h-5 w-5 text-primary" />
                  </div>
                  <div className={`flex items-center justify-center absolute inset-0 transition-all duration-300 ${isMobileMenuOpen ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'}`}>
                    <X className="h-5 w-5 text-primary" />
                  </div>
                </Button>
              </div>
            </div>
          </nav>
        </div>
      </header>

      {/* Menu Backdrop */}
      <div 
        id="menu-backdrop"
        className={`fixed inset-0 z-[99] transition-all duration-300 ease-out ${
          isMobileMenuOpen 
            ? 'is-open bg-black/10 backdrop-blur-sm' 
            : 'bg-transparent'
        }`}
        onClick={handleCloseMenu}
        style={{ display: isMobileMenuOpen ? 'block' : 'none' }}
      />

      {/* Glass Pop-over Menu Panel */}
      <div 
        id="mobile-menu-panel"
        ref={mobileMenuRef}
        className={`fixed top-20 right-5 w-[300px] z-[101] border border-white/20 rounded-[20px] shadow-[0_8px_30px_rgba(0,0,0,0.1)] p-4 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] menu-gradient-animated ${
          isMobileMenuOpen 
            ? 'is-open scale-100 opacity-100 visible translate-y-0' 
            : 'scale-90 opacity-0 invisible -translate-y-2'
        }`}
        style={{ transformOrigin: 'top right' }}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation menu"
      >
        <nav className="flex flex-col space-y-3">
          {mobileNavItems.map((item, index) => {
            const isCurrentPage = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={handleCloseMenu}
                className={`text-base font-medium px-4 py-3 rounded-lg transition-all duration-300 ease-out relative overflow-hidden group ${
                  isCurrentPage
                    ? "text-primary bg-primary/10 shadow-sm font-semibold"
                    : "text-foreground hover:text-primary"
                } ${
                  isMobileMenuOpen 
                    ? 'opacity-100 translate-x-0 scale-100' 
                    : 'opacity-0 translate-x-8 scale-95'
                } hover:bg-primary/5 hover:scale-[1.02] hover:shadow-md hover:-translate-x-1`}
                style={{
                  transitionDelay: isMobileMenuOpen ? `${index * 80}ms` : '0ms',
                  transitionProperty: 'opacity, transform, background-color, color, box-shadow'
                }}
              >
                {/* Active indicator */}
                {isCurrentPage && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full animate-fade-in" />
                )}
                {/* Hover gradient effect */}
                <span className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative">{item.title}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
};

export default Header;
