import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";

interface RelatedCelebrityCardProps {
  slug: string;
  name: string;
  profession: string;
  image: string;
  className?: string;
}

export const RelatedCelebrityCard: React.FC<RelatedCelebrityCardProps> = ({ 
  slug,
  name,
  profession,
  image,
  className = "" 
}) => {
  return (
    <Link to={`/celebrity/${slug}`}>
      <Card className={`overflow-hidden hover:shadow-lg transition-all group cursor-pointer ${className}`}>
        <CardContent className="p-0">
          <div className="relative">
            <img 
              src={image} 
              alt={`${name}`}
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          </div>
          <div className="p-3">
            <h4 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1">
              {name}
            </h4>
            <p className="text-xs text-muted-foreground line-clamp-1">{profession}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
