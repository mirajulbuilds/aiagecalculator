import { createContext, useContext, useState, ReactNode } from "react";
import { toast } from "sonner";

interface LifeExpectancyEstimate {
  id: string;
  label: string;
  birthDate: string;
  gender: string;
  country: string;
  smoking: string;
  exercise: string;
  alcohol: string;
  estimatedAge: number;
  summary: string;
}

interface LifeExpectancyComparisonContextType {
  comparisonList: LifeExpectancyEstimate[];
  addToComparison: (estimate: LifeExpectancyEstimate) => void;
  removeFromComparison: (id: string) => void;
  clearComparison: () => void;
  isInComparison: (id: string) => boolean;
}

const LifeExpectancyComparisonContext = createContext<LifeExpectancyComparisonContextType | undefined>(undefined);

export const LifeExpectancyComparisonProvider = ({ children }: { children: ReactNode }) => {
  const [comparisonList, setComparisonList] = useState<LifeExpectancyEstimate[]>([]);

  const addToComparison = (estimate: LifeExpectancyEstimate) => {
    if (comparisonList.length >= 4) {
      toast.error("Limit Reached", {
        description: "You can only compare 4 scenarios at a time.",
      });
      return;
    }

    if (comparisonList.some(e => e.id === estimate.id)) {
      toast.info("Already Added", {
        description: `This scenario is already in your comparison list.`,
      });
      return;
    }

    setComparisonList([...comparisonList, estimate]);
    toast.success("Added to Comparison", {
      description: `Scenario added to comparison (${comparisonList.length + 1}/4)`,
    });
  };

  const removeFromComparison = (id: string) => {
    setComparisonList(comparisonList.filter(e => e.id !== id));
    toast.success("Removed from comparison");
  };

  const clearComparison = () => {
    setComparisonList([]);
    toast.success("Comparison cleared");
  };

  const isInComparison = (id: string) => {
    return comparisonList.some(e => e.id === id);
  };

  return (
    <LifeExpectancyComparisonContext.Provider
      value={{
        comparisonList,
        addToComparison,
        removeFromComparison,
        clearComparison,
        isInComparison,
      }}
    >
      {children}
    </LifeExpectancyComparisonContext.Provider>
  );
};

export const useLifeExpectancyComparison = () => {
  const context = useContext(LifeExpectancyComparisonContext);
  if (!context) {
    throw new Error("useLifeExpectancyComparison must be used within LifeExpectancyComparisonProvider");
  }
  return context;
};
