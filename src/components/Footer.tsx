import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="text-center md:text-left">
            © {currentYear} aiagecalc.com. All rights reserved.
          </div>
          <nav className="flex gap-6">
            <Link 
              to="/about" 
              className="hover:text-foreground transition-colors"
            >
              About
            </Link>
            <Link 
              to="/privacy-policy" 
              className="hover:text-foreground transition-colors"
            >
              Privacy Policy
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
