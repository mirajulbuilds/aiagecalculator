import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useLifeExpectancyComparison } from "@/contexts/LifeExpectancyComparisonContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import PageTransition from "@/components/PageTransition";

const CompareLifeExpectancy = () => {
  const { comparisonList, clearComparison } = useLifeExpectancyComparison();
  const navigate = useNavigate();

  useEffect(() => {
    if (comparisonList.length === 0) {
      navigate("/life-expectancy-calculator");
    }
  }, [comparisonList, navigate]);

  if (comparisonList.length === 0) {
    return null;
  }

  // Prepare chart data
  const chartData = comparisonList.map(estimate => ({
    name: estimate.label,
    age: estimate.estimatedAge,
  }));

  return (
    <PageTransition>
      <Helmet>
        <title>Compare Life Expectancy Estimates | AiAgeCalc</title>
        <meta name="description" content="Compare different lifestyle choices side-by-side to see how they impact your life expectancy." />
      </Helmet>

      <div className="min-h-screen bg-background py-12">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <Link to="/life-expectancy-calculator">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Calculator
              </Button>
            </Link>
            <Button variant="destructive" size="sm" onClick={clearComparison}>
              Clear Comparison
            </Button>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Life Expectancy Comparison
            </h1>
            <p className="text-muted-foreground">
              Compare how different lifestyle choices impact your estimated life expectancy
            </p>
          </div>

          {/* Chart Visualization */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-primary" />
                Estimated Life Expectancy Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-muted-foreground" />
                  <YAxis className="text-muted-foreground" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="age" fill="hsl(var(--primary))" name="Estimated Age" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Detailed Comparison Table */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[150px]">Attribute</TableHead>
                      {comparisonList.map((estimate) => (
                        <TableHead key={estimate.id} className="text-center">
                          {estimate.label}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Birth Date</TableCell>
                      {comparisonList.map((estimate) => (
                        <TableCell key={estimate.id} className="text-center">
                          {new Date(estimate.birthDate).toLocaleDateString()}
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Gender</TableCell>
                      {comparisonList.map((estimate) => (
                        <TableCell key={estimate.id} className="text-center">
                          {estimate.gender}
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Country</TableCell>
                      {comparisonList.map((estimate) => (
                        <TableCell key={estimate.id} className="text-center">
                          {estimate.country}
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Smoking</TableCell>
                      {comparisonList.map((estimate) => (
                        <TableCell key={estimate.id} className="text-center">
                          {estimate.smoking}
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Exercise</TableCell>
                      {comparisonList.map((estimate) => (
                        <TableCell key={estimate.id} className="text-center">
                          {estimate.exercise}
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Alcohol</TableCell>
                      {comparisonList.map((estimate) => (
                        <TableCell key={estimate.id} className="text-center">
                          {estimate.alcohol}
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow className="bg-muted/50">
                      <TableCell className="font-bold">Estimated Age</TableCell>
                      {comparisonList.map((estimate) => (
                        <TableCell key={estimate.id} className="text-center font-bold text-primary text-lg">
                          {estimate.estimatedAge} years
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium align-top">Summary</TableCell>
                      {comparisonList.map((estimate) => (
                        <TableCell key={estimate.id} className="text-sm">
                          {estimate.summary}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              {comparisonList.length < 4 && (
                <div className="mt-6 text-center">
                  <p className="text-muted-foreground mb-4">
                    You can add up to {4 - comparisonList.length} more scenario{4 - comparisonList.length !== 1 ? 's' : ''} for comparison
                  </p>
                  <Link to="/life-expectancy-calculator">
                    <Button variant="outline">
                      <Heart className="w-4 h-4 mr-2" />
                      Add More Scenarios
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
};

export default CompareLifeExpectancy;
