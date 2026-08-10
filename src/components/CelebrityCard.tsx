import { Link } from "react-router-dom";
import { Scale, Check, Flame } from "lucide-react";
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

  const isTrending = celebrity.popularity_ranks?.overall && celebrity.popularity_ranks.overall <= 100;

  return (
    <div className="group relative bg-card rounded-2xl overflow-hidden border border-border transition-all duration-300 ease-out hover:shadow-lg hover:-translate-y-1 hover:border-primary/20">
      <Link to={`/people/${celebrity.profile_slug}`}>
        <div className="relative aspect-square overflow-hidden bg-muted">
          <img
            src={celebrity.profile_image_url}
            alt={celebrity.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />

          {/* Trending badge — frosted, gold text */}
          {isTrending && (
            <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-background/85 backdrop-blur-md border border-[hsl(var(--gold)/0.25)]">
              <Flame className="w-3 h-3 text-[hsl(var(--gold-deep))] dark:text-[hsl(var(--gold))]" />
              <span className="text-[11px] font-medium text-[hsl(var(--gold-deep))] dark:text-[hsl(var(--gold))]">Trending</span>
            </div>
          )}

          {/* Age Badge — frosted */}
          <div className="absolute bottom-2 left-2 z-10 px-2.5 py-1 rounded-full bg-background/85 backdrop-blur-md border border-border">
            <span className="text-[11px] font-semibold text-foreground">{age} yrs</span>
          </div>

          {/* Compare Button */}
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
        <div className="p-4 min-h-24 flex flex-col">
          <h3 className="font-semibold text-foreground text-base mb-1 group-hover:text-primary transition-colors line-clamp-1">
            {celebrity.name}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2">{celebrity.profession}</p>
        </div>
      </Link>
    </div>
  );
};