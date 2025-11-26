import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export const BulkSEORegenerator = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<{
    total: number;
    updated: number;
    failed: number;
    errors: { name: string; error: string }[];
  } | null>(null);

  const handleBulkRegenerate = async () => {
    try {
      setIsRunning(true);
      setResults(null);

      toast.info("Starting bulk SEO regeneration...");

      const { data, error } = await supabase.functions.invoke('bulk-regenerate-seo', {
        method: 'POST',
      });

      if (error) throw error;

      setResults(data);

      if (data.failed === 0) {
        toast.success(`Successfully updated ${data.updated} profiles!`);
      } else {
        toast.warning(`Updated ${data.updated} profiles, but ${data.failed} failed.`);
      }

    } catch (error) {
      console.error('Bulk regeneration error:', error);
      toast.error('Failed to regenerate SEO data');
    } finally {
      setIsRunning(false);
    }
  };

  const progress = results ? (results.updated + results.failed) / results.total * 100 : 0;

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <CardTitle>Bulk SEO Regeneration</CardTitle>
        </div>
        <CardDescription>
          Update all celebrity profiles with new high-CTR meta titles and descriptions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            This will regenerate meta titles and descriptions for ALL celebrity profiles using the new SEO strategy.
            This may take several minutes depending on the number of profiles.
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">New SEO patterns include:</p>
          <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
            <li>"How Old is [Name]? Exact Age, Birthday & Bio (2025)"</li>
            <li>"[Name] Age: Birthday, Zodiac Sign & Height | AiAgeCalc"</li>
            <li>"Curious about [Name]'s real age? Find out..."</li>
          </ul>
        </div>

        <Button 
          onClick={handleBulkRegenerate} 
          disabled={isRunning}
          className="w-full"
          size="lg"
        >
          {isRunning ? (
            <>
              <Sparkles className="mr-2 h-4 w-4 animate-spin" />
              Regenerating...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Start Bulk Regeneration
            </>
          )}
        </Button>

        {isRunning && (
          <div className="space-y-2">
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-center text-muted-foreground">
              Processing profiles...
            </p>
          </div>
        )}

        {results && (
          <div className="space-y-3">
            <Alert className={results.failed === 0 ? "border-green-500" : "border-yellow-500"}>
              {results.failed === 0 ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-yellow-500" />
              )}
              <AlertDescription>
                <div className="space-y-1">
                  <p className="font-semibold">Results:</p>
                  <p>Total profiles: {results.total}</p>
                  <p className="text-green-600">✓ Updated: {results.updated}</p>
                  {results.failed > 0 && (
                    <p className="text-red-600">✗ Failed: {results.failed}</p>
                  )}
                </div>
              </AlertDescription>
            </Alert>

            {results.errors.length > 0 && (
              <details className="text-sm">
                <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                  View errors ({results.errors.length})
                </summary>
                <div className="mt-2 space-y-1 pl-4">
                  {results.errors.map((err, idx) => (
                    <div key={idx} className="text-red-600">
                      {err.name}: {err.error}
                    </div>
                  ))}
                </div>
              </details>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
