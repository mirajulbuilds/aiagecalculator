import { createContext, useContext, useState, ReactNode } from "react";
import { toast } from "@/hooks/use-toast";

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

interface ComparisonContextType {
  comparisonList: Celebrity[];
  addToComparison: (celebrity: Celebrity) => void;
  removeFromComparison: (id: string) => void;
  clearComparison: () => void;
  isInComparison: (id: string) => boolean;
}

const ComparisonContext = createContext<ComparisonContextType | undefined>(undefined);

export const ComparisonProvider = ({ children }: { children: ReactNode }) => {
  const [comparisonList, setComparisonList] = useState<Celebrity[]>([]);

  const addToComparison = (celebrity: Celebrity) => {
    if (comparisonList.length >= 3) {
      toast({
        title: "Limit Reached",
        description: "You can only compare 3 celebrities at a time.",
        variant: "destructive",
      });
      return;
    }

    if (comparisonList.some(c => c.id === celebrity.id)) {
      toast({
        title: "Already Added",
        description: `${celebrity.name} is already in your comparison list.`,
      });
      return;
    }

    setComparisonList([...comparisonList, celebrity]);
    toast({
      title: "Added to Comparison",
      description: `${celebrity.name} added to comparison (${comparisonList.length + 1}/3)`,
    });
  };

  const removeFromComparison = (id: string) => {
    setComparisonList(comparisonList.filter(c => c.id !== id));
  };

  const clearComparison = () => {
    setComparisonList([]);
  };

  const isInComparison = (id: string) => {
    return comparisonList.some(c => c.id === id);
  };

  return (
    <ComparisonContext.Provider
      value={{
        comparisonList,
        addToComparison,
        removeFromComparison,
        clearComparison,
        isInComparison,
      }}
    >
      {children}
    </ComparisonContext.Provider>
  );
};

export const useComparison = () => {
  const context = useContext(ComparisonContext);
  if (!context) {
    throw new Error("useComparison must be used within ComparisonProvider");
  }
  return context;
};
