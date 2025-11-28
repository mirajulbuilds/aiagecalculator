import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { CheckCircle2, XCircle, FileText, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface SubmissionLog {
  id: string;
  sitemap_url: string;
  submission_status: 'success' | 'failed';
  error_message: string | null;
  submitted_at: string;
  submitted_by: string | null;
}

export const GSCSubmissionLogs = () => {
  const [logs, setLogs] = useState<SubmissionLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('gsc_submission_logs')
        .select('*')
        .order('submitted_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setLogs((data || []) as SubmissionLog[]);
    } catch (error) {
      console.error('Error fetching GSC logs:', error);
      toast({
        title: 'Error',
        description: 'Failed to load submission logs',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();

    // Set up realtime subscription
    const channel = supabase
      .channel('gsc-submission-logs')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'gsc_submission_logs',
        },
        () => {
          fetchLogs();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getSuccessRate = () => {
    if (logs.length === 0) return 0;
    const successCount = logs.filter(log => log.submission_status === 'success').length;
    return Math.round((successCount / logs.length) * 100);
  };

  const successRate = getSuccessRate();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              GSC Submission Logs
            </CardTitle>
            <CardDescription>
              Track sitemap submissions to Google Search Console
            </CardDescription>
          </div>
          <Button onClick={fetchLogs} variant="outline" size="sm" disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Total Submissions:</span>
            <Badge variant="secondary">{logs.length}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Success Rate:</span>
            <Badge variant={successRate >= 80 ? 'default' : 'destructive'}>
              {successRate}%
            </Badge>
          </div>
        </div>

        <ScrollArea className="h-[400px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Sitemap URL</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Error</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No submission logs yet
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      {log.submission_status === 'success' ? (
                        <Badge variant="default" className="flex items-center gap-1 w-fit">
                          <CheckCircle2 className="h-3 w-3" />
                          Success
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="flex items-center gap-1 w-fit">
                          <XCircle className="h-3 w-3" />
                          Failed
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-xs max-w-[300px] truncate">
                      {log.sitemap_url}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(log.submitted_at), { addSuffix: true })}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[200px]">
                      {log.error_message ? (
                        <span className="text-destructive">{log.error_message}</span>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
