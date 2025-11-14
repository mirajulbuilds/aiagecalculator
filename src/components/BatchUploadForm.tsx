import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload, Loader2 } from "lucide-react";

interface BatchUploadFormProps {
  selectedEngine: string;
  setSelectedEngine: (engine: string) => void;
}

export const BatchUploadForm = ({ selectedEngine, setSelectedEngine }: BatchUploadFormProps) => {
  const [csvText, setCsvText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<any[]>([]);
  const [currentProcessing, setCurrentProcessing] = useState<string>("");
  const [processedCount, setProcessedCount] = useState(0);

  const parseCsv = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim());
    const urls = [];
    
    for (const line of lines) {
      const parts = line.split(',').map(p => p.trim());
      if (parts[0]) {
        urls.push({
          url: parts[0],
          sourceType: parts[1] || 'famousbirthdays'
        });
      }
    }
    
    return urls;
  };

  const handleBatchProcess = async () => {
    if (!csvText.trim()) {
      toast.error("Please enter CSV data");
      return;
    }

    const urls = parseCsv(csvText);
    
    if (urls.length === 0) {
      toast.error("No valid URLs found in CSV");
      return;
    }

    if (urls.length > 50) {
      toast.error("Maximum 50 URLs allowed per batch");
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setResults([]);
    setProcessedCount(0);
    setCurrentProcessing("");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/batch-generate-profiles`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({ urls, engineChoice: selectedEngine })
        }
      );

      if (!response.ok || !response.body) {
        throw new Error('Failed to start batch processing');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim()) continue;

          try {
            const update = JSON.parse(line);

            if (update.type === 'progress') {
              setProgress(((update.index + 1) / update.total) * 100);
              setProcessedCount(update.index + 1);
              setCurrentProcessing(update.message);

              // Add or update result in real-time
              setResults(prev => {
                const newResults = [...prev];
                const existingIndex = newResults.findIndex(r => r.url === update.url);
                
                if (existingIndex >= 0) {
                  newResults[existingIndex] = {
                    url: update.url,
                    status: update.status,
                    message: update.message,
                    error: update.error,
                    profile: update.profile
                  };
                } else {
                  newResults.push({
                    url: update.url,
                    status: update.status,
                    message: update.message,
                    error: update.error,
                    profile: update.profile
                  });
                }
                
                return newResults;
              });
            } else if (update.type === 'complete') {
              setProgress(100);
              toast.success(`Batch complete: ${update.succeeded} succeeded, ${update.failed} failed`);
            }
          } catch (parseError) {
            console.error('Error parsing stream update:', parseError);
          }
        }
      }
    } catch (error) {
      console.error('Batch processing error:', error);
      toast.error(error instanceof Error ? error.message : 'Batch processing failed');
    } finally {
      setIsProcessing(false);
      setCurrentProcessing("");
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="engine-select">Select AI Engine</Label>
        <Select value={selectedEngine} onValueChange={setSelectedEngine}>
          <SelectTrigger id="engine-select">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="lovable-ai">Lovable AI (Uses Project Credits)</SelectItem>
            <SelectItem value="gemini-api">My Gemini API (Uses My API Key)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="csv-data">CSV Data (Format: URL, Source Type)</Label>
        <Textarea
          id="csv-data"
          placeholder={`https://www.famousbirthdays.com/people/..., famousbirthdays
https://en.wikipedia.org/wiki/..., wikipedia`}
          value={csvText}
          onChange={(e) => setCsvText(e.target.value)}
          rows={10}
          disabled={isProcessing}
        />
        <p className="text-sm text-muted-foreground">
          Enter one URL per line. Source type is optional (defaults to famousbirthdays).
        </p>
      </div>

      <Button
        onClick={handleBatchProcess}
        disabled={isProcessing || !csvText.trim()}
        className="w-full"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing Batch...
          </>
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" />
            Start Batch Processing
          </>
        )}
      </Button>

      {isProcessing && (
        <div className="space-y-3">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{processedCount}/{parseCsv(csvText).length}</span>
            </div>
            <Progress value={progress} />
          </div>
          {currentProcessing && (
            <div className="rounded-md bg-muted p-3">
              <p className="text-sm font-medium text-foreground animate-pulse">
                {currentProcessing}
              </p>
            </div>
          )}
        </div>
      )}

      {results.length > 0 && (
        <div className="mt-6 space-y-2">
          <h3 className="font-semibold">
            Results ({results.filter(r => r.status === 'success').length}/{results.length})
          </h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {results.map((result, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg border transition-all duration-200 ${
                  result.status === 'success'
                    ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800'
                    : result.status === 'processing'
                    ? 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 animate-pulse'
                    : 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{result.url}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {result.message || `Status: ${result.status}`}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${
                    result.status === 'success'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                      : result.status === 'processing'
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                      : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                  }`}>
                    {result.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
