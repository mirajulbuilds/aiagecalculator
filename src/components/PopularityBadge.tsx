import React from "react";
import { TrendingUp } from "lucide-react";

interface PopularityBadgeProps {
  score: number;
  className?: string;
}

export const PopularityBadge: React.FC<PopularityBadgeProps> = ({ score, className = "" }) => {
  return (
    <div 
      className={`absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-md flex items-center gap-1 text-xs font-semibold shadow-md ${className}`}
    >
      <TrendingUp className="w-3 h-3" />
      +{score}
    </div>
  );
};
