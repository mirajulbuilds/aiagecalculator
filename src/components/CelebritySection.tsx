import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface CelebritySectionProps {
  title: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
}

export const CelebritySection: React.FC<CelebritySectionProps> = ({ 
  title,
  icon: Icon,
  children,
  className = "" 
}) => {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          {Icon && <Icon className="w-6 h-6 text-primary" />}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
};
