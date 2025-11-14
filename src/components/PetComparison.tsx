import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SavedPetWithAge } from "@/types/pet";
import { PawPrint } from "lucide-react";

interface PetComparisonProps {
  pets: SavedPetWithAge[];
}

export const PetComparison = ({ pets }: PetComparisonProps) => {
  if (pets.length === 0) {
    return (
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PawPrint className="w-5 h-5 text-primary" />
            Pet Age Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Save at least one pet to see age comparisons
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PawPrint className="w-5 h-5 text-primary" />
          Pet Age Comparison
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3 font-semibold">Name</th>
                <th className="text-left p-3 font-semibold">Type</th>
                <th className="text-left p-3 font-semibold">Actual Age</th>
                <th className="text-left p-3 font-semibold">Human Age</th>
                <th className="text-left p-3 font-semibold">Life Stage</th>
              </tr>
            </thead>
            <tbody>
              {pets.map((pet) => (
                <tr key={pet.id} className="border-b border-border/50 hover:bg-muted/50">
                  <td className="p-3">
                    <div className="font-medium text-foreground">{pet.name}</div>
                    {pet.dogSize && (
                      <div className="text-xs text-muted-foreground">{pet.dogSize} Dog</div>
                    )}
                  </td>
                  <td className="p-3 text-muted-foreground">{pet.petType}</td>
                  <td className="p-3">
                    {pet.ageResult ? (
                      <span className="text-foreground">{pet.ageResult.actualAge}</span>
                    ) : (
                      <span className="text-muted-foreground italic">Not calculated</span>
                    )}
                  </td>
                  <td className="p-3">
                    {pet.ageResult ? (
                      <span className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                        {pet.ageResult.humanAge}
                      </span>
                    ) : (
                      <span className="text-muted-foreground italic">-</span>
                    )}
                  </td>
                  <td className="p-3">
                    {pet.ageResult ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/20 text-primary">
                        {pet.ageResult.lifeStage}
                      </span>
                    ) : (
                      <span className="text-muted-foreground italic">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary Stats */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-background/50 backdrop-blur rounded-lg p-4 border border-border">
            <p className="text-xs text-muted-foreground mb-1">Total Pets</p>
            <p className="text-2xl font-bold text-foreground">{pets.length}</p>
          </div>
          <div className="bg-background/50 backdrop-blur rounded-lg p-4 border border-border">
            <p className="text-xs text-muted-foreground mb-1">Avg Human Age</p>
            <p className="text-2xl font-bold text-foreground">
              {pets.filter(p => p.ageResult).length > 0
                ? Math.round(
                    pets
                      .filter(p => p.ageResult)
                      .reduce((sum, p) => sum + (p.ageResult?.humanAge || 0), 0) /
                      pets.filter(p => p.ageResult).length
                  )
                : '-'}
            </p>
          </div>
          <div className="bg-background/50 backdrop-blur rounded-lg p-4 border border-border">
            <p className="text-xs text-muted-foreground mb-1">Dogs</p>
            <p className="text-2xl font-bold text-foreground">
              {pets.filter(p => p.petType === 'Dog').length}
            </p>
          </div>
          <div className="bg-background/50 backdrop-blur rounded-lg p-4 border border-border">
            <p className="text-xs text-muted-foreground mb-1">Cats</p>
            <p className="text-2xl font-bold text-foreground">
              {pets.filter(p => p.petType === 'Cat').length}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
