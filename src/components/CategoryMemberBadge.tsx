import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";

interface CategoryMemberBadgeProps {
  category: string;
  icon?: React.ReactNode;
  filterParams?: string;
  className?: string;
}

export const CategoryMemberBadge: React.FC<CategoryMemberBadgeProps> = ({ 
  category,
  icon,
  filterParams = "",
  className = "" 
}) => {
  return (
    <Link to={`/famous-birthdays${filterParams}`}>
      <Card className={`hover:shadow-lg transition-all cursor-pointer group ${className}`}>
        <CardContent className="p-4 text-center">
          <div className="mb-2 flex justify-center">
            {icon || <Users className="w-8 h-8 text-primary group-hover:scale-110 transition-transform" />}
          </div>
          <p className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
            {category}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
};
