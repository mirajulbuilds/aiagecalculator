import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-border bg-card mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Top row: brand + nav columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="inline-block mb-3">
              <span className="font-display text-xl font-semibold text-foreground">
                ai
                <span
                  className="bg-clip-text text-transparent"
                  style={{ backgroundImage: 'linear-gradient(135deg, hsl(33 88% 48%), hsl(37 90% 41%))' }}
                >
                  age
                </span>
                calc
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Calculate your exact age, discover celebrity birthday twins, and explore your life in numbers.
            </p>
          </div>

          {/* Tools */}
          <div>
            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">Tools</h4>
            <nav className="flex flex-col gap-2">
              <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Age Calculator</Link>
              <Link to="/pet-age-calculator" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pet Age Calculator</Link>
              <Link to="/past-life-generator" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Past Life Generator</Link>
              <Link to="/life-expectancy-calculator" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Life Expectancy</Link>
            </nav>
          </div>

          {/* Explore */}
          <div>
            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">Explore</h4>
            <nav className="flex flex-col gap-2">
              <Link to="/famous-birthdays" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Famous Birthdays</Link>
              <Link to="/blog" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Blog</Link>
              <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About</Link>
              <Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</Link>
            </nav>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">Legal</h4>
            <nav className="flex flex-col gap-2">
              <Link to="/privacy-policy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link>
              <Link to="/terms-of-service" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Terms of Service</Link>
            </nav>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            &copy; {currentYear} aiagecalc.com. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Made with precision &middot; {new Intl.NumberFormat().format(1338)}+ celebrity profiles
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;