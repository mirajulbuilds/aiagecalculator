import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

// Map route segments to readable labels
const routeLabels: Record<string, string> = {
  "famous-birthdays": "Famous Birthdays",
  "blog": "Blog",
  "look-alike-finder": "Look-Alike Finder",
  "ai-face-age": "AI Face Age",
  "compatibility-calculator": "Birthday Compatibility",
  "past-life-generator": "Past Life Generator",
  "about": "About",
  "compare": "Compare",
  "admin": "Admin Panel",
  "celebrity": "Celebrity",
  "auth": "Authentication",
  "privacy-policy": "Privacy Policy",
  "zodiac": "Zodiac",
  "profession": "Profession",
  "birth-month": "Birth Month",
};

// Routes that should not show breadcrumbs
const excludedRoutes = ["/"];

const Breadcrumbs = () => {
  const location = useLocation();
  const pathSegments = location.pathname.split("/").filter(Boolean);

  // Don't show breadcrumbs on homepage or excluded routes
  if (excludedRoutes.includes(location.pathname)) {
    return null;
  }

  // Build breadcrumb items from path segments
  const breadcrumbItems = pathSegments.map((segment, index) => {
    const path = `/${pathSegments.slice(0, index + 1).join("/")}`;
    const label = routeLabels[segment] || segment
      .split("-")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
    
    const isLast = index === pathSegments.length - 1;

    return {
      path,
      label,
      isLast,
    };
  });

  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-3">
        <Breadcrumb>
          <BreadcrumbList>
            {/* Home link */}
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/" className="flex items-center gap-1 hover:text-primary transition-colors">
                  <Home className="h-4 w-4" />
                  <span className="sr-only sm:not-sr-only sm:inline">Home</span>
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>

            {/* Dynamic breadcrumb items */}
            {breadcrumbItems.map((item, index) => (
              <div key={item.path} className="flex items-center">
                <BreadcrumbSeparator>
                  <ChevronRight className="h-4 w-4" />
                </BreadcrumbSeparator>
                <BreadcrumbItem>
                  {item.isLast ? (
                    <BreadcrumbPage className="font-medium text-foreground">
                      {item.label}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link to={item.path} className="hover:text-primary transition-colors">
                        {item.label}
                      </Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </div>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </div>
  );
};

export default Breadcrumbs;
