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
      <Card className={`overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer group hover:border-primary/50 ${className}`}>
        <CardContent className="p-4 text-center">
          <div className="mb-2 flex justify-center transition-transform duration-300 group-hover:scale-110">
            {icon || <Users className="w-8 h-8 text-primary transition-all duration-300 group-hover:rotate-12" />}
          </div>
          <p className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors duration-200">
            {category}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
};
