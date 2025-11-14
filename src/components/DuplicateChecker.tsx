import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Search, Loader2, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";

export const DuplicateChecker = () => {
  const [celebrityName, setCelebrityName] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [duplicates, setDuplicates] = useState<any[]>([]);

  const handleCheck = async () => {
    if (!celebrityName.trim()) {
      toast.error("Please enter a celebrity name");
      return;
    }

    setIsChecking(true);
    setDuplicates([]);

    try {
      const { data, error } = await supabase.functions.invoke('check-celebrity-duplicate', {
        body: {
          name: celebrityName,
          faceEmbedding: null
        }
      });

      if (error) throw error;

      if (data.isDuplicate) {
        setDuplicates(data.duplicates || []);
        toast.warning(`Found ${data.duplicates.length} potential duplicate(s)`);
      } else {
        toast.success("No duplicates found - safe to proceed");
      }
    } catch (error) {
      console.error('Duplicate check error:', error);
      toast.error(error instanceof Error ? error.message : 'Duplicate check failed');
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="celebrity-name">Celebrity Name</Label>
        <div className="flex gap-2">
          <Input
            id="celebrity-name"
            placeholder="Enter celebrity name..."
            value={celebrityName}
            onChange={(e) => setCelebrityName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleCheck()}
            disabled={isChecking}
          />
          <Button onClick={handleCheck} disabled={isChecking || !celebrityName.trim()}>
            {isChecking ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {duplicates.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
            <AlertTriangle className="h-5 w-5" />
            <h3 className="font-semibold">Potential Duplicates Found</h3>
          </div>
          
          {duplicates.map((dup) => (
            <Card key={dup.id} className="border-amber-200 dark:border-amber-800">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {dup.profileImageUrl && (
                    <img
                      src={dup.profileImageUrl}
                      alt={dup.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <Link
                      to={`/people/${dup.profileSlug}`}
                      className="font-semibold hover:underline"
                    >
                      {dup.name}
                    </Link>
                    <div className="flex gap-3 mt-2 text-sm">
                      <span className="text-muted-foreground">
                        Name: <strong>{dup.nameSimilarity}%</strong>
                      </span>
                      {dup.faceSimilarity > 0 && (
                        <span className="text-muted-foreground">
                          Face: <strong>{dup.faceSimilarity}%</strong>
                        </span>
                      )}
                      <span className="font-semibold text-amber-600 dark:text-amber-400">
                        Overall: {dup.overallScore}%
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
