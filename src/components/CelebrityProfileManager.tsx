import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CheckCircle, XCircle, AlertCircle, Loader2, RefreshCw, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ProfileStats {
  incomplete_count: number;
  profiles?: Array<{
    id: string;
    name: string;
    has_image: boolean;
    word_count: number;
    profile_complete: boolean;
  }>;
}

export const CelebrityProfileManager = () => {
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processResults, setProcessResults] = useState<any>(null);

  const checkProfiles = async () => {
    setIsChecking(true);
    try {
      const { data, error } = await supabase.functions.invoke('auto-complete-profiles', {
        body: { check_only: true, batch_size: 100 },
      });

      if (error) throw error;

      setStats(data);
      toast.success(`Found ${data.incomplete_count} incomplete profiles`);
    } catch (error) {
      console.error('Error checking profiles:', error);
      toast.error('Failed to check profiles');
    } finally {
      setIsChecking(false);
    }
  };

  const autoCompleteProfiles = async () => {
    if (!stats || stats.incomplete_count === 0) {
      toast.info('All profiles are already complete!');
      return;
    }

    const estimatedCredits = stats.incomplete_count * 2;
    const confirmed = window.confirm(
      `This will process ${stats.incomplete_count} profiles.\n\nEstimated cost: ${estimatedCredits} credits\n\nDo you want to continue?`
    );

    if (!confirmed) return;

    setIsProcessing(true);
    setProcessResults(null);

    try {
      const batchSize = 5;
      const totalBatches = Math.ceil(stats.incomplete_count / batchSize);
      let allResults: any[] = [];

      for (let batch = 0; batch < totalBatches; batch++) {
        toast.info(`Processing batch ${batch + 1} of ${totalBatches}...`);

        const { data, error } = await supabase.functions.invoke('auto-complete-profiles', {
          body: { batch_size: batchSize, check_only: false },
        });

        if (error) throw error;

        allResults = [...allResults, ...data.results];

        // Update progress
        setProcessResults({
          processed: allResults.length,
          total: stats.incomplete_count,
          results: allResults,
        });
      }

      toast.success('Profile completion finished!');
      
      // Refresh stats
      await checkProfiles();
    } catch (error) {
      console.error('Error auto-completing profiles:', error);
      toast.error('Failed to auto-complete profiles');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Celebrity Profile Manager</h2>
          <p className="text-muted-foreground mt-1">
            Manage and auto-complete celebrity profiles
          </p>
        </div>
        <Button onClick={checkProfiles} disabled={isChecking}>
          {isChecking ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Checking...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Check Status
            </>
          )}
        </Button>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          This tool automatically completes missing profile images and bio sections using AI.
          Each profile costs approximately 2 credits (1 for text, 1 for image).
        </AlertDescription>
      </Alert>

      {stats && (
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">Profile Status</h3>
              {stats.incomplete_count === 0 ? (
                <Badge variant="default" className="bg-green-500">
                  <CheckCircle className="mr-1 h-4 w-4" />
                  All Complete
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <AlertCircle className="mr-1 h-4 w-4" />
                  {stats.incomplete_count} Incomplete
                </Badge>
              )}
            </div>

            {stats.incomplete_count > 0 && (
              <>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Estimated credits needed: <strong>{stats.incomplete_count * 2}</strong>
                  </p>
                </div>

                <Button
                  onClick={autoCompleteProfiles}
                  disabled={isProcessing}
                  className="w-full"
                  size="lg"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Auto-Complete All Profiles'
                  )}
                </Button>
              </>
            )}
          </div>
        </Card>
      )}

      {isProcessing && processResults && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Processing Progress</h3>
          <Progress
            value={(processResults.processed / processResults.total) * 100}
            className="mb-2"
          />
          <p className="text-sm text-muted-foreground text-center">
            {processResults.processed} of {processResults.total} completed
          </p>
        </Card>
      )}

      {processResults && !isProcessing && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Completion Results</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {processResults.results.map((result: any, index: number) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-2">
                  {result.success ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="font-medium">{result.name}</span>
                </div>
                <div className="flex gap-2">
                  {result.updated_image && (
                    <Badge variant="secondary">Image Added</Badge>
                  )}
                  {result.updated_bio && (
                    <Badge variant="secondary">Bio Updated</Badge>
                  )}
                  {result.error && (
                    <Badge variant="destructive">{result.error}</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {stats?.profiles && stats.profiles.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Incomplete Profiles</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {stats.profiles.map((profile) => (
              <div
                key={profile.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <span className="font-medium">{profile.name}</span>
                <div className="flex gap-2">
                  {!profile.has_image && (
                    <Badge variant="outline">No Image</Badge>
                  )}
                  {profile.word_count < 500 && (
                    <Badge variant="outline">
                      {profile.word_count} words
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
