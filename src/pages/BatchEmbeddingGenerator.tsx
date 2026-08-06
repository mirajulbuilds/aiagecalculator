import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Helmet } from "react-helmet-async";
import { Sparkles, Play, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useAdminCheck } from "@/hooks/useAdminCheck";

interface ProcessingResult {
  id: string;
  name: string;
  success: boolean;
  message: string;
}

const BatchEmbeddingGenerator = () => {
  // Admin authentication check with proper role verification
  const { isAdmin, isLoading: isCheckingAdmin } = useAdminCheck();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<ProcessingResult[]>([]);
  const [totalCelebrities, setTotalCelebrities] = useState(0);

  const processBatch = async () => {
    setIsProcessing(true);
    setResults([]);
    setProgress(0);

    try {
      // Fetch all celebrities without face embeddings
      const { data: celebrities, error: fetchError } = await supabase
        .rpc('get_celebrities_without_embeddings', { _limit: 50 }); // Admin-only, batches of 50


      if (fetchError) {
        console.error('Error fetching celebrities:', fetchError);
        toast.error('Failed to fetch celebrities');
        setIsProcessing(false);
        return;
      }

      if (!celebrities || celebrities.length === 0) {
        toast.info('All celebrities already have face embeddings!');
        setIsProcessing(false);
        return;
      }

      setTotalCelebrities(celebrities.length);
      const processResults: ProcessingResult[] = [];

      // Process each celebrity
      for (let i = 0; i < celebrities.length; i++) {
        const celebrity = celebrities[i];
        
        try {
          console.log(`Processing ${celebrity.name} (${i + 1}/${celebrities.length})...`);

          // Generate face embedding
          const { data: embeddingData, error: embeddingError } = await supabase.functions.invoke(
            'generate-face-embedding',
            {
              body: { imageUrl: celebrity.profile_image_url }
            }
          );

          if (embeddingError) {
            throw new Error(`Embedding generation failed: ${embeddingError.message}`);
          }

          if (!embeddingData.faceDetected) {
            processResults.push({
              id: celebrity.id,
              name: celebrity.name,
              success: false,
              message: 'No face detected in image'
            });
            setProgress(((i + 1) / celebrities.length) * 100);
            setResults([...processResults]);
            continue;
          }

          // Store face embedding in the admin-only biometrics table
          const { error: updateError } = await supabase
            .from('celebrity_face_embeddings')
            .upsert({ celebrity_id: celebrity.id, embedding: embeddingData }, { onConflict: 'celebrity_id' });

          if (updateError) {
            throw new Error(`Database update failed: ${updateError.message}`);
          }

          processResults.push({
            id: celebrity.id,
            name: celebrity.name,
            success: true,
            message: `Confidence: ${(embeddingData.confidence * 100).toFixed(1)}%`
          });

          console.log(`✓ Successfully processed ${celebrity.name}`);

        } catch (error) {
          console.error(`Error processing ${celebrity.name}:`, error);
          processResults.push({
            id: celebrity.id,
            name: celebrity.name,
            success: false,
            message: error instanceof Error ? error.message : 'Unknown error'
          });
        }

        setProgress(((i + 1) / celebrities.length) * 100);
        setResults([...processResults]);

        // Add a small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      const successCount = processResults.filter(r => r.success).length;
      toast.success(`Processed ${successCount}/${celebrities.length} celebrities successfully!`);

    } catch (error) {
      console.error('Batch processing error:', error);
      toast.error('Batch processing failed');
    } finally {
      setIsProcessing(false);
    }
  };

  // Show loading while checking admin status
  if (isCheckingAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  // Show access denied if not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-destructive mb-4">Access Denied</h1>
          <p className="text-muted-foreground">You do not have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Batch Face Embedding Generator | Admin Tool</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Sparkles className="w-8 h-8 text-primary" />
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Batch Face Embedding Generator
              </h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Generate face embeddings for all celebrities in the database that don't have them yet.
            </p>
          </div>

          {/* Control Panel */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Processing Control</CardTitle>
              <CardDescription>
                This will process up to 50 celebrities at a time. Run multiple times if needed.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={processBatch}
                disabled={isProcessing}
                size="lg"
                className="w-full"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing Batch...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Start Batch Processing
                  </>
                )}
              </Button>

              {isProcessing && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Progress</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} />
                  <p className="text-xs text-center text-muted-foreground">
                    Processing {results.length} of {totalCelebrities} celebrities
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Results */}
          {results.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Processing Results</CardTitle>
                <CardDescription>
                  {results.filter(r => r.success).length} successful, {results.filter(r => !r.success).length} failed
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {results.map((result) => (
                    <div
                      key={result.id}
                      className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card"
                    >
                      {result.success ? (
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{result.name}</p>
                        <p className="text-xs text-muted-foreground">{result.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Instructions */}
          <Card className="mt-8 bg-gradient-to-br from-primary/5 to-purple-600/5">
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p>
                This tool processes celebrities in batches of 50 to generate face embeddings for the look-alike finder feature.
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Each celebrity's profile image is analyzed using AI vision</li>
                <li>Face embeddings are generated and stored in the database</li>
                <li>Processing includes a 1-second delay between celebrities to avoid rate limits</li>
                <li>Run this multiple times if you have more than 50 celebrities to process</li>
              </ul>
              <p className="text-xs text-muted-foreground mt-4">
                Note: Only celebrities without existing face embeddings will be processed.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default BatchEmbeddingGenerator;