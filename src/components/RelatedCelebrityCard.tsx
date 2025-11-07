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
    <Link to={`/celebrity/${slug}`} className="block">
      <Card className={`overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 group cursor-pointer ${className}`}>
        <CardContent className="p-0">
          <div className="relative overflow-hidden">
            <img 
              src={image} 
              alt={`${name}`}
              className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          <div className="p-3">
            <h4 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors duration-200 line-clamp-1">
              {name}
            </h4>
            <p className="text-xs text-muted-foreground line-clamp-1">{profession}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
