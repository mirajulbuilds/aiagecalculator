import { Link } from "react-router-dom";
import { X, Scale, Heart } from "lucide-react";
import { useLifeExpectancyComparison } from "@/contexts/LifeExpectancyComparisonContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const FloatingLifeExpectancyCompareBar = () => {
  const { comparisonList, removeFromComparison, clearComparison } = useLifeExpectancyComparison();

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
                  Comparing ({comparisonList.length}/4)
                </span>
              </div>
              
              {/* Scenario Pills */}
              <div className="flex items-center gap-2 overflow-x-auto">
                {comparisonList.map((estimate) => (
                  <div
                    key={estimate.id}
                    className="relative group flex-shrink-0"
                  >
                    <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-primary/10 border border-primary/20">
                      <Heart className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium text-foreground">{estimate.label}</span>
                      <button
                        onClick={() => removeFromComparison(estimate.id)}
                        className="w-4 h-4 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                        title={`Remove ${estimate.label}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-md">
                      Est. Age: {estimate.estimatedAge}
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
              <Link to="/compare-life-expectancy">
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
