import React from "react";
import { TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface PopularityRankCardProps {
  rank: number;
  label?: string;
  className?: string;
}

export const PopularityRankCard: React.FC<PopularityRankCardProps> = ({ 
  rank, 
  label = "Most Popular",
  className = "" 
}) => {
  return (
    <Card className={`bg-gradient-to-r from-pink-500 to-purple-500 text-white border-0 ${className}`}>
      <CardContent className="p-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <TrendingUp className="w-6 h-6" />
          <span className="text-5xl font-bold">#{rank}</span>
        </div>
        <p className="text-lg font-semibold">{label}</p>
      </CardContent>
    </Card>
  );
};
