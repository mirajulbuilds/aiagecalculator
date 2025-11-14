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

    try {
      const { data, error } = await supabase.functions.invoke('batch-generate-profiles', {
        body: {
          urls,
          engineChoice: selectedEngine
        }
      });

      if (error) throw error;

      setResults(data.results || []);
      setProgress(100);
      
      toast.success(`Batch complete: ${data.succeeded} succeeded, ${data.failed} failed`);
    } catch (error) {
      console.error('Batch processing error:', error);
      toast.error(error instanceof Error ? error.message : 'Batch processing failed');
    } finally {
      setIsProcessing(false);
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
        <div className="space-y-2">
          <Progress value={progress} />
          <p className="text-sm text-center text-muted-foreground">Processing profiles...</p>
        </div>
      )}

      {results.length > 0 && (
        <div className="mt-6 space-y-2">
          <h3 className="font-semibold">Results</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {results.map((result, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg border ${
                  result.status === 'success'
                    ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800'
                    : 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800'
                }`}
              >
                <p className="text-sm font-medium">{result.url}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {result.status === 'success' ? '✓ Success' : `✗ ${result.error}`}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
