import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
    { title: "Famous Birthdays", path: "/famous-birthdays" },
    { title: "Look-Alike Finder", path: "/look-alike-finder" },
    { title: "AI Face Age", path: "/ai-face-age" },
    { title: "Birthday Compatibility", path: "/compatibility-calculator" },
    { title: "Past Life Generator", path: "/past-life-generator" },
    { title: "Blog", path: "/blog" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <header className="global-header sticky top-0 z-[1000] w-full border-b border-white/10 dark:border-white/5">
        <div className="relative backdrop-blur-xl bg-white/60 dark:bg-gray-900/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] before:absolute before:inset-0 before:bg-gradient-to-r before:from-blue-500/10 before:via-purple-500/10 before:to-pink-500/10 before:animate-shimmer before:bg-[length:200%_100%] before:pointer-events-none">
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
                {mainNavItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`nav-link text-sm font-medium transition-colors hover:text-primary ${
                      isActive(item.path)
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                  >
                    {item.title}
                  </Link>
                ))}
                
                {/* AI Tools Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="ai-tools-dropdown-trigger flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary text-muted-foreground">
                      AI Tools
                      <ChevronDown className="h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    align="start" 
                    className="ai-tools-dropdown-panel w-56 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-white/20 shadow-[0_8px_30px_rgba(0,0,0,0.15)] z-[1001]"
                  >
                    {aiToolsItems.map((item) => (
                      <DropdownMenuItem key={item.path} asChild>
                        <Link
                          to={item.path}
                          className={`w-full cursor-pointer ${
                            isActive(item.path)
                              ? "text-primary font-semibold"
                              : ""
                          }`}
                        >
                          {item.title}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <ThemeToggle />
              </div>

              {/* Mobile Menu Button */}
              <div className="mobile-menu-toggle-button flex items-center gap-2 lg:hidden relative z-10">
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

      {/* Corner Pop-over Glass Menu */}
      <>
        {/* Transparent Backdrop (Click-outside to close) */}
        <div 
          id="menu-backdrop"
          className={`fixed inset-0 z-[99] md:hidden ${
            isMobileMenuOpen ? 'block' : 'hidden'
          }`}
          onClick={handleCloseMenu}
          onTouchStart={handleCloseMenu}
        />
        
        {/* Corner-Anchored Glass Menu Panel */}
        <div 
          id="mobile-menu-panel"
          className={`fixed top-[80px] right-5 w-[300px] z-[1100] lg:hidden
            bg-white/90 dark:bg-gray-900/90 backdrop-blur-[20px] border border-white/20 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.15)]
            p-4 origin-top-right transition-all duration-200 ease-out ${
            isMobileMenuOpen 
              ? 'scale-100 opacity-100 visible' 
              : 'scale-95 opacity-0 invisible'
          }`}
        >
          {/* Menu Links */}
          <nav className="flex flex-col space-y-1">
            {mobileNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={handleCloseMenu}
                className={`px-3 py-2.5 text-base font-bold rounded-lg transition-all ${
                  isActive(item.path)
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-foreground hover:bg-black/5 dark:hover:bg-white/5"
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
