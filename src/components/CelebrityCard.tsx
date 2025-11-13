import { Link } from "react-router-dom";
import { Scale, Check } from "lucide-react";
import { useComparison } from "@/contexts/ComparisonContext";
import { Button } from "@/components/ui/button";

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

export const CelebrityCard = ({ celebrity }: { celebrity: Celebrity }) => {
  const { addToComparison, isInComparison } = useComparison();
  const inComparison = isInComparison(celebrity.id);

  const handleCompareClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToComparison(celebrity);
  };

  return (
    <div className="group relative bg-card rounded-2xl shadow-card overflow-hidden transition-all duration-500 ease-out hover:shadow-[0_20px_40px_rgba(0,0,0,0.15)] hover:-translate-y-2 hover:scale-[1.02] border border-border interactive-element">
      <Link to={`/people/${celebrity.profile_slug}`}>
        <div className="aspect-square overflow-hidden">
          <img
            src={celebrity.profile_image_url}
            alt={celebrity.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
        </div>
        <div className="p-4">
          <h3 className="font-bold text-foreground text-lg mb-1 group-hover:text-primary transition-colors">
            {celebrity.name}
          </h3>
          <p className="text-sm text-muted-foreground">{celebrity.profession}</p>
        </div>
      </Link>
      
      {/* Compare Button */}
      <Button
        size="icon"
        variant={inComparison ? "default" : "outline"}
        className="absolute top-2 right-2 w-8 h-8 rounded-full shadow-lg z-10"
        onClick={handleCompareClick}
        title={inComparison ? "Added to comparison" : "Add to comparison"}
      >
        {inComparison ? (
          <Check className="w-4 h-4" />
        ) : (
          <Scale className="w-4 h-4" />
        )}
      </Button>
    </div>
  );
};
