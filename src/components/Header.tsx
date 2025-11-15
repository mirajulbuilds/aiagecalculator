import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Search, Menu, User, Calendar, Heart, Sparkles, Brain, Scale, Camera, Gift, Users, Moon, TrendingUp, Activity, Baby, Home, Star, BookOpen, PiggyBank, History, ChevronDown, X, PawPrint } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerClose } from "@/components/ui/drawer";
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

  // Ripple effect handler for any element
  const createRipple = (event: React.MouseEvent<HTMLElement>) => {
    const element = event.currentTarget;
    const ripple = document.createElement('span');
    const diameter = Math.max(element.clientWidth, element.clientHeight);
    const radius = diameter / 2;

    const rect = element.getBoundingClientRect();
    ripple.style.width = ripple.style.height = `${diameter}px`;
    ripple.style.left = `${event.clientX - rect.left - radius}px`;
    ripple.style.top = `${event.clientY - rect.top - radius}px`;
    ripple.classList.add('ripple');

    const existingRipple = element.querySelector('.ripple');
    if (existingRipple) {
      existingRipple.remove();
    }

    element.appendChild(ripple);

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
      setIsScrolled(window.scrollY > 10);
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
    { title: "Look-Alike Finder", path: "/look-alike-finder", icon: Sparkles },
    { title: "AI Face Age", path: "/ai-face-age", icon: Camera },
    { title: "Birthday Compatibility", path: "/compatibility-calculator", icon: Heart },
    { title: "Past Life Generator", path: "/past-life-generator", icon: History },
    { title: "Life Expectancy", path: "/life-expectancy-calculator", icon: Activity },
    { title: "Retirement Calculator", path: "/retirement-calculator", icon: PiggyBank },
    { title: "Health Score", path: "/health-score-calculator", icon: Heart },
    { title: "Due Date Calculator", path: "/due-date-calculator", icon: Baby },
    { title: "Pet Age Calculator", path: "/pet-age-calculator", icon: PawPrint },
  ];

  const mobileNavItems = [
    { title: "Home", path: "/", icon: Home },
    { title: "Look-Alike Finder", path: "/look-alike-finder", icon: Sparkles },
    { title: "AI Face Age", path: "/ai-face-age", icon: Camera },
    { title: "Birthday Compatibility", path: "/compatibility-calculator", icon: Heart },
    { title: "Past Life Generator", path: "/past-life-generator", icon: History },
    { title: "Life Expectancy", path: "/life-expectancy-calculator", icon: Activity },
    { title: "Retirement Calculator", path: "/retirement-calculator", icon: PiggyBank },
    { title: "Health Score", path: "/health-score-calculator", icon: Heart },
    { title: "Due Date Calculator", path: "/due-date-calculator", icon: Baby },
    { title: "Pet Age Calculator", path: "/pet-age-calculator", icon: PawPrint },
    { title: "Famous Birthdays", path: "/famous-birthdays", icon: Star },
    { title: "Blog", path: "/blog", icon: BookOpen },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <header className={`global-header sticky top-0 left-0 z-[1000] w-full border-b transition-all duration-500 ease-out ${
        isScrolled 
          ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-primary/20 shadow-[0_8px_30px_rgba(0,0,0,0.12)]' 
          : 'bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border-white/10 dark:border-white/5'
      }`}>
        <div className="relative before:absolute before:inset-0 before:bg-gradient-to-r before:from-blue-500/10 before:via-purple-500/10 before:to-pink-500/10 before:animate-shimmer before:bg-[length:200%_100%] before:pointer-events-none">
          <nav className="container mx-auto px-3 sm:px-4">
            <div className="flex h-16 items-center justify-between gap-2">
              {/* Logo/Brand */}
              <Link to="/" className="flex items-center space-x-2 relative z-10 flex-shrink-0 logo-hover-glow">
                <span className="text-base sm:text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent whitespace-nowrap">
                  Ai Age Calculator
                </span>
              </Link>

              {/* Desktop Navigation - Only visible on 1024px+ */}
              <div className="desktop-nav hidden min-[1024px]:flex min-[1024px]:items-center min-[1024px]:gap-6 relative z-10">
                {/* Home Link */}
                <Link
                  to="/"
                  onClick={createRipple}
                  className={`nav-link text-sm font-medium transition-colors hover:text-primary relative overflow-hidden ${
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
                    className={`ai-tools-dropdown-panel absolute top-full left-0 mt-2 min-w-[250px] p-3 z-[1001] transition-all duration-200 ${
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
                        onClick={createRipple}
                        className={`desktop-ai-tool-link ${
                          isActive(item.path) ? "active" : ""
                        }`}
                        style={{
                          transitionDelay: isDropdownOpen ? `${index * 60}ms` : '0ms',
                        }}
                        role="menuitem"
                        tabIndex={isDropdownOpen ? 0 : -1}
                      >
                        <div className="tool-icon-box">
                          <item.icon className="w-5 h-5" />
                        </div>
                        <span>{item.title}</span>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Famous Birthdays Link */}
                <Link
                  to="/famous-birthdays"
                  onClick={createRipple}
                  className={`nav-link text-sm font-medium transition-colors hover:text-primary relative overflow-hidden ${
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
                  onClick={createRipple}
                  className={`nav-link text-sm font-medium transition-colors hover:text-primary relative overflow-hidden ${
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

      {/* Mobile Menu Drawer - Slides from Right */}
      <Drawer open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen} direction="right">
        <DrawerContent className="mobile-nav-drawer fixed right-0 top-0 h-full w-[320px] rounded-l-[20px]">
          {/* Fixed Header Section */}
          <div className="mobile-nav-drawer-header flex items-center justify-end gap-2">
            <ThemeToggle />
            <DrawerClose asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCloseMenu}
                className="relative overflow-hidden"
              >
                <X className="h-5 w-5 text-primary" />
              </Button>
            </DrawerClose>
          </div>
          
          {/* Scrollable Navigation Content */}
          <nav className="mobile-nav-drawer-content">
            <div className="flex flex-col space-y-2">
              {mobileNavItems.map((item, index) => {
                const isCurrentPage = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={(e) => {
                      createRipple(e);
                      handleCloseMenu();
                    }}
                    className={`mobile-nav-link ${isCurrentPage ? "active" : ""}`}
                    style={{
                      animationDelay: `${index * 50}ms`,
                    }}
                  >
                    <div className="nav-icon">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <span className="relative font-medium">{item.title}</span>
                  </Link>
                );
              })}
            </div>
          </nav>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default Header;
