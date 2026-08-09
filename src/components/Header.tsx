import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, User, Heart, Sparkles, Brain, Camera, Home, Star, BookOpen, PiggyBank, History, ChevronDown, X, PawPrint, LogOut, UserCircle, Activity, Baby } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sticky header shadow on scroll
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const { user, signOut } = useAuth();

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
    { title: "Biological Age", path: "/biological-age-calculator", icon: Brain },
  ];

  const mobileNavItems = [
    { title: "Home", path: "/", icon: Home },
    ...aiToolsItems,
    { title: "Famous Birthdays", path: "/famous-birthdays", icon: Star },
    { title: "Blog", path: "/blog", icon: BookOpen },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header
      className={`global-header sticky top-0 left-0 z-[1000] w-full border-b transition-shadow duration-300 bg-background/90 backdrop-blur-lg ${
        isScrolled ? "border-border shadow-[0_4px_20px_rgba(26,21,35,0.06)]" : "border-transparent"
      }`}
    >
      <nav className="container mx-auto px-3 sm:px-4">
        <div className="flex h-16 items-center justify-between gap-2">
          {/* Logo */}
          <Link to="/" className="flex items-center relative z-10 flex-shrink-0">
            <span className="font-display text-lg sm:text-xl text-foreground whitespace-nowrap">
              aiagecalc
            </span>
          </Link>

          {/* Desktop navigation (1024px+) */}
          <div className="desktop-nav hidden min-[1024px]:flex min-[1024px]:items-center min-[1024px]:gap-6 relative z-10">
            <Link
              to="/"
              className={`nav-link text-sm font-medium transition-colors hover:text-primary ${
                isActive("/") ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Home
            </Link>

            {/* AI Tools dropdown */}
            <div
              className="relative"
              ref={dropdownRef}
              onMouseEnter={() => setIsDropdownOpen(true)}
              onMouseLeave={() => setIsDropdownOpen(false)}
            >
              <button
                className="flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary text-muted-foreground"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                aria-expanded={isDropdownOpen}
                aria-haspopup="true"
              >
                AI Tools
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>
              <div
                className={`ai-tools-dropdown-panel absolute top-full left-0 mt-2 min-w-[250px] p-2 z-[1001] transition-all duration-200 ${
                  isDropdownOpen
                    ? "opacity-100 visible translate-y-0"
                    : "opacity-0 invisible -translate-y-1 pointer-events-none"
                }`}
                role="menu"
                aria-label="AI Tools menu"
              >
                {aiToolsItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`desktop-ai-tool-link ${isActive(item.path) ? "active" : ""}`}
                    role="menuitem"
                  >
                    <div className="tool-icon-box">
                      <item.icon className="w-4 h-4" />
                    </div>
                    <span>{item.title}</span>
                  </Link>
                ))}
              </div>
            </div>

            <Link
              to="/famous-birthdays"
              className={`nav-link text-sm font-medium transition-colors hover:text-primary ${
                isActive("/famous-birthdays") ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Famous Birthdays
            </Link>

            <Link
              to="/blog"
              className={`nav-link text-sm font-medium transition-colors hover:text-primary ${
                isActive("/blog") ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Blog
            </Link>

            <ThemeToggle />

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    <UserCircle className="mr-2 h-4 w-4" />
                    My Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={async () => {
                      await signOut();
                      navigate("/");
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth">
                <Button size="sm" className="gap-2">
                  <User className="h-4 w-4" />
                  Sign In
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile: theme toggle + hamburger */}
          <div className="mobile-menu-toggle-button flex items-center gap-2 relative z-10">
            <ThemeToggle />
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                >
                  {isMobileMenuOpen ? (
                    <X className="h-5 w-5 text-primary" />
                  ) : (
                    <Menu className="h-5 w-5 text-primary" />
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-[85vw] max-w-[360px] pt-12 bg-background"
              >
                {/* Scrollable nav list */}
                <nav className="overflow-y-auto px-1 py-2">
                  <div className="flex flex-col gap-1">
                    {user ? (
                      <>
                        <Link
                          to="/profile"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors ${
                            isActive("/profile")
                              ? "bg-secondary text-primary"
                              : "text-foreground hover:bg-muted hover:translate-x-1"
                          }`}
                        >
                          <UserCircle className="w-5 h-5 text-muted-foreground" />
                          My Profile
                        </Link>
                        <button
                          onClick={async () => {
                            setIsMobileMenuOpen(false);
                            await signOut();
                            navigate("/");
                          }}
                          className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-foreground hover:bg-muted hover:translate-x-1 transition-all duration-200 text-left"
                        >
                          <LogOut className="w-5 h-5 text-muted-foreground" />
                          Sign Out
                        </button>
                        <div className="border-b border-border my-2" />
                      </>
                    ) : (
                      <>
                        <Link
                          to="/auth"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors ${
                            isActive("/auth")
                              ? "bg-secondary text-primary"
                              : "text-foreground hover:bg-muted hover:translate-x-1"
                          }`}
                        >
                          <User className="w-5 h-5 text-muted-foreground" />
                          Sign In
                        </Link>
                        <div className="border-b border-border my-2" />
                      </>
                    )}

                    {mobileNavItems.map((item) => {
                      const active = isActive(item.path);
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200 ${
                            active
                              ? "bg-primary/10 text-primary border border-primary/20"
                              : "text-foreground hover:bg-muted hover:translate-x-1"
                          }`}
                        >
                          <item.icon
                            className={`w-5 h-5 ${active ? "text-primary" : "text-muted-foreground"}`}
                          />
                          {item.title}
                        </Link>
                      );
                    })}
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
