import { Link } from "react-router-dom";
import { differenceInYears, format } from "date-fns";
import { Users, Cake, Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface CelebrityCardProps {
  id: string;
  name: string;
  dateOfBirth: string;
  profession: string;
  bio: string;
  photoUrl: string | null;
  quote: string | null;
  nationality: string | null;
}

export const CelebrityCard = ({
  id,
  name,
  dateOfBirth,
  profession,
  bio,
  photoUrl,
  quote,
  nationality
}: CelebrityCardProps) => {
  const calculateAge = (dob: string) => {
    return differenceInYears(new Date(), new Date(dob));
  };

  const getNextBirthday = (dob: string) => {
    const birthDate = new Date(dob);
    const now = new Date();
    const thisYear = now.getFullYear();
    let nextBirthday = new Date(thisYear, birthDate.getMonth(), birthDate.getDate());
    
    if (nextBirthday < now) {
      nextBirthday = new Date(thisYear + 1, birthDate.getMonth(), birthDate.getDate());
    }
    
    return format(nextBirthday, "MMMM d, yyyy");
  };

  return (
    <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer group bg-card/50 backdrop-blur animate-fade-in">
      <CardContent className="p-6">
        <div className="flex items-start gap-4 mb-4">
          {/* Profile Image */}
          <div className="w-20 h-20 rounded-full overflow-hidden flex-shrink-0 bg-gradient-primary ring-2 ring-primary/20">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Users className="w-10 h-10 text-primary-foreground" />
              </div>
            )}
          </div>

          {/* Name and Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors line-clamp-1">
              {name}
            </h3>
            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
              {bio}
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="text-xs">
                {profession}
              </Badge>
              {nationality && (
                <Badge variant="outline" className="text-xs">
                  {nationality}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Quote */}
        {quote && (
          <div className="mb-4 p-3 bg-muted/50 rounded-lg border-l-2 border-primary">
            <div className="flex items-start gap-2">
              <Quote className="w-4 h-4 text-primary flex-shrink-0 mt-1" />
              <p className="text-sm italic text-muted-foreground line-clamp-2">
                "{quote}"
              </p>
            </div>
          </div>
        )}

        {/* Age and Birthday Info */}
        <div className="space-y-2 pt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Current Age:</span>
            <span className="text-2xl font-bold text-primary">{calculateAge(dateOfBirth)} years</span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1">
              <Cake className="w-4 h-4" />
              Birthday:
            </span>
            <span className="text-foreground font-medium">
              {format(new Date(dateOfBirth), "MMMM d, yyyy")}
            </span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Next Birthday:</span>
            <span className="text-foreground font-medium">
              {getNextBirthday(dateOfBirth)}
            </span>
          </div>
        </div>

        {/* View Profile Button */}
        <Link to={`/celebrities/${id}`} state={{ celebrity: { id, name, dateOfBirth, profession, bio, photoUrl, quote, nationality } }}>
          <Button 
            variant="outline" 
            className="w-full mt-4 gap-2 group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
          >
            <Users className="w-4 h-4" />
            View Full Profile
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};
