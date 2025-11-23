import { Link } from "react-router-dom";
import { Scale, Check } from "lucide-react";
import { useComparison } from "@/contexts/ComparisonContext";
import { Button } from "@/components/ui/button";
import { OptimizedImage } from "@/components/OptimizedImage";

interface Celebrity {
  id: string;
  name: string;
  profile_slug: string;
  profession: string;
  date_of_birth: string;
  profile_image_url: string;
  popularity_ranks: any;
  zodiac_sign?: string;
}

interface CelebrityCardProps {
  celebrity: Celebrity;
  priority?: boolean; // For LCP optimization - set true for first 4 images
}

export const CelebrityCard = ({ celebrity, priority = false }: CelebrityCardProps) => {
  const { addToComparison, isInComparison } = useComparison();
  const inComparison = isInComparison(celebrity.id);

  const calculateAge = (dateOfBirth: string): number => {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const age = calculateAge(celebrity.date_of_birth);

  const handleCompareClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToComparison(celebrity);
  };

  return (
    <div className="group relative bg-card rounded-2xl shadow-card overflow-hidden transition-all duration-500 ease-out hover:shadow-[0_20px_40px_rgba(0,0,0,0.15)] hover:-translate-y-2 hover:scale-[1.02] border border-border interactive-element">
      <Link to={`/people/${celebrity.profile_slug}`}>
        <div className="relative aspect-square overflow-hidden bg-muted">
          <OptimizedImage
            src={celebrity.profile_image_url}
            alt={celebrity.name}
            width={400}
            height={400}
            priority={priority}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
          
          {/* Age Badge */}
          <div className="absolute bottom-2 left-2 z-10 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-full">
            <span className="text-xs font-semibold text-white">{age} years</span>
          </div>
        </div>
        <div className="p-4 min-h-24 flex flex-col">
          <h3 className="font-bold text-foreground text-lg mb-1 group-hover:text-primary transition-colors line-clamp-1">
            {celebrity.name}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2">{celebrity.profession}</p>
        </div>
      </Link>
      
      {/* Compare Button - Outside Link to prevent navigation conflict */}
      <Button
        size="icon"
        variant={inComparison ? "default" : "outline"}
        className="absolute top-2 right-2 w-9 h-9 md:w-10 md:h-10 rounded-full shadow-lg backdrop-blur-sm bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 z-30 transition-all border-2"
        onClick={handleCompareClick}
        title={inComparison ? "Added to comparison" : "Add to comparison"}
      >
        {inComparison ? (
          <Check className="w-4 h-4 md:w-5 md:h-5" />
        ) : (
          <Scale className="w-4 h-4 md:w-5 md:h-5" />
        )}
      </Button>
    </div>
  );
};
