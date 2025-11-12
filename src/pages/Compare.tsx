import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Scale, ArrowLeft, Calendar, Cake, Star, Trophy } from "lucide-react";
import { useComparison } from "@/contexts/ComparisonContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import PageTransition from "@/components/PageTransition";

const Compare = () => {
  const { comparisonList, clearComparison } = useComparison();
  const navigate = useNavigate();

  useEffect(() => {
    if (comparisonList.length === 0) {
      // Redirect if no celebrities to compare
      navigate("/famous-birthdays");
    }
  }, [comparisonList, navigate]);

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  if (comparisonList.length === 0) {
    return null;
  }

  return (
    <PageTransition>
      <>
        <Helmet>
          <title>Compare Celebrities - Famous Birthdays</title>
          <meta
            name="description"
            content="Compare celebrities side-by-side. See their birthdays, ages, zodiac signs, and popularity rankings."
          />
        </Helmet>

        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 max-w-6xl py-8">
            {/* Header */}
            <div className="mb-8">
              <Link to="/famous-birthdays">
                <Button variant="ghost" className="mb-6">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Famous Birthdays
                </Button>
              </Link>

              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <Scale className="w-8 h-8 text-primary" />
                  <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                    Celebrity Comparison
                  </h1>
                </div>
                <Button variant="outline" onClick={clearComparison}>
                  Clear Comparison
                </Button>
              </div>
            </div>

            {/* Comparison Table */}
            <Card>
              <CardHeader>
                <CardTitle>Side-by-Side Comparison</CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">Attribute</TableHead>
                      {comparisonList.map((celebrity) => (
                        <TableHead key={celebrity.id} className="text-center">
                          <Link 
                            to={`/people/${celebrity.profile_slug}`}
                            className="hover:text-primary transition-colors"
                          >
                            {celebrity.name}
                          </Link>
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* Profile Images */}
                    <TableRow>
                      <TableCell className="font-medium">Profile</TableCell>
                      {comparisonList.map((celebrity) => (
                        <TableCell key={celebrity.id} className="text-center">
                          <Link to={`/people/${celebrity.profile_slug}`}>
                            <img
                              src={celebrity.profile_image_url}
                              alt={celebrity.name}
                              className="w-32 h-32 object-cover rounded-lg mx-auto hover:scale-105 transition-transform"
                            />
                          </Link>
                        </TableCell>
                      ))}
                    </TableRow>

                    {/* Name */}
                    <TableRow>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-primary" />
                          Name
                        </div>
                      </TableCell>
                      {comparisonList.map((celebrity) => (
                        <TableCell key={celebrity.id} className="text-center font-semibold">
                          {celebrity.name}
                        </TableCell>
                      ))}
                    </TableRow>

                    {/* Birthday */}
                    <TableRow>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-primary" />
                          Birthday
                        </div>
                      </TableCell>
                      {comparisonList.map((celebrity) => (
                        <TableCell key={celebrity.id} className="text-center">
                          {formatDate(celebrity.date_of_birth)}
                        </TableCell>
                      ))}
                    </TableRow>

                    {/* Current Age */}
                    <TableRow>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Cake className="w-4 h-4 text-primary" />
                          Current Age
                        </div>
                      </TableCell>
                      {comparisonList.map((celebrity) => (
                        <TableCell key={celebrity.id} className="text-center">
                          {calculateAge(celebrity.date_of_birth)} years old
                        </TableCell>
                      ))}
                    </TableRow>

                    {/* Zodiac Sign */}
                    <TableRow>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-primary" />
                          Zodiac Sign
                        </div>
                      </TableCell>
                      {comparisonList.map((celebrity) => (
                        <TableCell key={celebrity.id} className="text-center">
                          {celebrity.zodiac_sign || "N/A"}
                        </TableCell>
                      ))}
                    </TableRow>

                    {/* Profession */}
                    <TableRow>
                      <TableCell className="font-medium">Profession</TableCell>
                      {comparisonList.map((celebrity) => (
                        <TableCell key={celebrity.id} className="text-center">
                          {celebrity.profession}
                        </TableCell>
                      ))}
                    </TableRow>

                    {/* Popularity Rank */}
                    <TableRow>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Trophy className="w-4 h-4 text-primary" />
                          Popularity Rank
                        </div>
                      </TableCell>
                      {comparisonList.map((celebrity) => (
                        <TableCell key={celebrity.id} className="text-center">
                          {celebrity.popularity_ranks?.most_popular 
                            ? `#${celebrity.popularity_ranks.most_popular}`
                            : "N/A"}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Add More CTA */}
            {comparisonList.length < 3 && (
              <div className="mt-6 text-center">
                <p className="text-muted-foreground mb-4">
                  You can add up to {3 - comparisonList.length} more {comparisonList.length === 2 ? 'celebrity' : 'celebrities'} to this comparison
                </p>
                <Link to="/famous-birthdays">
                  <Button>
                    Add More Celebrities
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </>
    </PageTransition>
  );
};

export default Compare;
