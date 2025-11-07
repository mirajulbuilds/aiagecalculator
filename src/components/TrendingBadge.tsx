import React from "react";
import { TrendingUp } from "lucide-react";

interface TrendingBadgeProps {
  className?: string;
}

export const TrendingBadge: React.FC<TrendingBadgeProps> = ({ className = "" }) => {
  return (
    <div 
      className={`absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-md flex items-center gap-1 text-xs font-bold shadow-md ${className}`}
    >
      <TrendingUp className="w-3 h-3" />
      TRENDING
    </div>
  );
};
