import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PopularityMetric {
  label: string;
  rank: number;
}

interface PopularityMetricsTableProps {
  metrics: PopularityMetric[];
  className?: string;
}

export const PopularityMetricsTable: React.FC<PopularityMetricsTableProps> = ({ 
  metrics,
  className = "" 
}) => {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-2xl">Popularity Rankings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {metrics.map((metric, index) => (
            <div 
              key={index}
              className={`flex items-center justify-between p-3 rounded-md ${
                index % 2 === 0 ? 'bg-pink-500/10' : 'bg-purple-500/10'
              }`}
            >
              <span className="font-medium text-foreground">{metric.label}</span>
              <span className="font-bold text-lg">#{metric.rank}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
