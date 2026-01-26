import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, RefreshCw, CheckCircle2, AlertCircle, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CronJobInfo {
  jobName: string;
  schedule: string;
  lastRun: string | null;
  lastStatus: 'success' | 'failed' | 'unknown';
  nextRun: string;
}

const CronJobMonitor = () => {
  const [cronJobs, setCronJobs] = useState<CronJobInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  const parseSchedule = (schedule: string): string => {
    // Parse cron expression to human-readable format
    const parts = schedule.split(' ');
    if (parts.length === 5) {
      const [minute, hour] = parts;
      if (minute === '0' && hour === '2') {
        return 'Daily at 2:00 AM UTC';
      }
    }
    return schedule;
  };

  const getNextRun = (schedule: string): string => {
    // Calculate next run based on cron schedule
    const parts = schedule.split(' ');
    if (parts.length === 5) {
      const [minute, hour] = parts;
      const now = new Date();
      const nextRun = new Date();
      
      nextRun.setUTCHours(parseInt(hour), parseInt(minute), 0, 0);
      
      // If the time has passed today, schedule for tomorrow
      if (nextRun <= now) {
        nextRun.setUTCDate(nextRun.getUTCDate() + 1);
      }
      
      return nextRun.toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short'
      });
    }
    return 'Unknown';
  };

  const fetchCronJobStatus = async () => {
    setIsLoading(true);
    try {
      // Get the last scheduled-refresh submission from logs
      const { data: logs, error: logsError } = await supabase
        .from('gsc_submission_logs')
        .select('submitted_at, submission_status, response_data')
        .order('submitted_at', { ascending: false })
        .limit(50);

      if (logsError) throw logsError;

      // Find the most recent scheduled-refresh run
      const scheduledRuns = logs?.filter(log => {
        const responseData = log.response_data as Record<string, string> | null;
        return responseData?.source === 'scheduled-refresh';
      }) || [];

      const lastScheduledRun = scheduledRuns[0];
      const lastStatus = lastScheduledRun?.submission_status === 'success' ? 'success' : 
                        lastScheduledRun ? 'failed' : 'unknown';

      const jobs: CronJobInfo[] = [{
        jobName: 'daily-sitemap-refresh',
        schedule: '0 2 * * *',
        lastRun: lastScheduledRun?.submitted_at || null,
        lastStatus,
        nextRun: getNextRun('0 2 * * *')
      }];

      setCronJobs(jobs);
    } catch (error) {
      console.error('Error fetching cron job status:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch cron job status',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualTrigger = async () => {
    setIsRefreshing(true);
    try {
      const { data, error } = await supabase.functions.invoke('scheduled-sitemap-refresh', {
        body: {}
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Sitemap refresh triggered successfully',
      });

      // Refresh the status after manual trigger
      await fetchCronJobStatus();
    } catch (error) {
      console.error('Error triggering sitemap refresh:', error);
      toast({
        title: 'Error',
        description: 'Failed to trigger sitemap refresh',
        variant: 'destructive'
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCronJobStatus();
  }, []);

  const formatLastRun = (lastRun: string | null): string => {
    if (!lastRun) return 'Never';
    
    const date = new Date(lastRun);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffHours < 1) {
      return `${diffMinutes} minutes ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hours ago`;
    } else {
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Scheduled Jobs Monitor
            </CardTitle>
            <CardDescription>
              Monitor automated sitemap regeneration and GSC submission jobs
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchCronJobStatus}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleManualTrigger}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Run Now
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4">
            {cronJobs.map((job) => (
              <div
                key={job.jobName}
                className="border rounded-lg p-4 bg-card"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{job.jobName}</h3>
                      <p className="text-sm text-muted-foreground">{parseSchedule(job.schedule)}</p>
                    </div>
                  </div>
                  <Badge 
                    variant={job.lastStatus === 'success' ? 'default' : 
                            job.lastStatus === 'failed' ? 'destructive' : 'secondary'}
                    className="flex items-center gap-1"
                  >
                    {job.lastStatus === 'success' ? (
                      <CheckCircle2 className="h-3 w-3" />
                    ) : job.lastStatus === 'failed' ? (
                      <AlertCircle className="h-3 w-3" />
                    ) : null}
                    {job.lastStatus === 'unknown' ? 'No runs yet' : job.lastStatus}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-muted/50 rounded-md p-3">
                    <p className="text-muted-foreground mb-1">Last Run</p>
                    <p className="font-medium">{formatLastRun(job.lastRun)}</p>
                    {job.lastRun && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(job.lastRun).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <div className="bg-muted/50 rounded-md p-3">
                    <p className="text-muted-foreground mb-1">Next Scheduled Run</p>
                    <p className="font-medium">{job.nextRun}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CronJobMonitor;
