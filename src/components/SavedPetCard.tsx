import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SavedPetWithAge } from "@/types/pet";
import { Trash2, Calculator } from "lucide-react";

interface SavedPetCardProps {
  pet: SavedPetWithAge;
  onRemove: (id: string) => void;
  onCalculate: (pet: SavedPetWithAge) => void;
}

export const SavedPetCard = ({ pet, onRemove, onCalculate }: SavedPetCardProps) => {
  return (
    <Card className="border-primary/20 hover:border-primary/40 transition-all">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-foreground text-lg">{pet.name}</h3>
            <p className="text-sm text-muted-foreground">
              {pet.petType}
              {pet.dogSize && ` • ${pet.dogSize}`}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Born: {new Date(pet.birthDate).toLocaleDateString()}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onRemove(pet.id)}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        {pet.ageResult ? (
          <div className="space-y-2">
            <div className="bg-primary/10 rounded-lg p-3">
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-muted-foreground">Human Age:</span>
                <span className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                  {pet.ageResult.humanAge}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Actual Age:</span>
                <p className="font-medium text-foreground">{pet.ageResult.actualAge}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Life Stage:</span>
                <p className="font-medium text-foreground">{pet.ageResult.lifeStage}</p>
              </div>
            </div>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => onCalculate(pet)}
          >
            <Calculator className="w-4 h-4 mr-2" />
            Calculate Age
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
