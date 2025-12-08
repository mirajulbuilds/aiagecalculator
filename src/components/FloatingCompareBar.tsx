import { Link } from "react-router-dom";
import { X, Scale } from "lucide-react";
import { useComparison } from "@/contexts/ComparisonContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const FloatingCompareBar = () => {
  const { comparisonList, removeFromComparison, clearComparison } = useComparison();

  if (comparisonList.length === 0) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom duration-300"
      style={{ transform: comparisonList.length > 0 ? 'translateY(0)' : 'translateY(100%)' }}
    >
      <Card className="mx-4 mb-4 p-4 bg-card/95 backdrop-blur-lg border-border shadow-2xl">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            {/* Left: Count and Items */}
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-primary" />
                <span className="font-bold text-foreground whitespace-nowrap">
                  Comparing ({comparisonList.length}/3)
                </span>
              </div>
              
              {/* Celebrity Avatars */}
              <div className="flex items-center gap-2 overflow-x-auto">
                {comparisonList.map((celebrity) => (
                  <div
                    key={celebrity.id}
                    className="relative group flex-shrink-0"
                  >
                    <img
                      src={celebrity.profile_image_url}
                      alt={celebrity.name}
                      className="w-10 h-10 rounded-full object-cover border-2 border-border"
                      loading="lazy"
                    />
                    <button
                      onClick={() => removeFromComparison(celebrity.id)}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      title={`Remove ${celebrity.name}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-md">
                      {celebrity.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Action Buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={clearComparison}
              >
                Clear All
              </Button>
              <Link to="/compare">
                <Button size="sm" className="whitespace-nowrap">
                  <Scale className="w-4 h-4 mr-2" />
                  Compare Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
