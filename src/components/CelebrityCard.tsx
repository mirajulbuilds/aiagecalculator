import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin } from "lucide-react";
import { FlagIcon } from "./FlagIcon";
import { TrendingBadge } from "./TrendingBadge";
import { PopularityBadge } from "./PopularityBadge";
import { format } from "date-fns";

interface CelebrityCardProps {
  id: string;
  slug: string;
  name: string;
  profession: string;
  country: string;
  countryCode: string;
  birthdate: string;
  birthplace: string;
  image: string;
  excerpt: string;
  age: number;
  trending?: boolean;
  popularityScore?: number;
  className?: string;
}

export const CelebrityCard: React.FC<CelebrityCardProps> = ({
  slug,
  name,
  profession,
  country,
  countryCode,
  birthdate,
  birthplace,
  image,
  excerpt,
  age,
  trending,
  popularityScore,
  className = ""
}) => {
  return (
    <Link to={`/celebrity/${slug}`}>
      <Card className={`overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group cursor-pointer h-full ${className}`}>
        <div className="relative">
          <img 
            src={image} 
            alt={`${name} - ${profession}`}
            className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
          {trending && <TrendingBadge />}
          {popularityScore && <PopularityBadge score={popularityScore} />}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        
        <CardContent className="p-4 space-y-3">
          <div>
            <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors duration-200 line-clamp-1 mb-1">
              {name}
            </h3>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="text-xs font-semibold">
                {profession}
              </Badge>
              <FlagIcon countryCode={countryCode} className="w-5 h-4" alt={country} />
            </div>
          </div>

          <div className="space-y-1.5 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 flex-shrink-0" />
              <span className="line-clamp-1">
                {format(new Date(birthdate), "MMMM d, yyyy")} (Age {age})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span className="line-clamp-1">{birthplace}, {country}</span>
            </div>
          </div>

          <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
            {excerpt}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
};
