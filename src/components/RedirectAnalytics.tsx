import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDistanceToNow } from "date-fns";

interface RedirectLog {
  id: string;
  old_url: string;
  new_url: string;
  redirect_type: string;
  user_agent: string | null;
  ip_address: string | null;
  created_at: string;
}

export const RedirectAnalytics = () => {
  const { data: redirects, isLoading } = useQuery({
    queryKey: ['redirect-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('redirect_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data as RedirectLog[];
    },
  });

  const { data: stats } = useQuery({
    queryKey: ['redirect-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('redirect_logs')
        .select('redirect_type, old_url');

      if (error) throw error;

      const typeCount: Record<string, number> = {};
      const urlCount: Record<string, number> = {};

      data.forEach((log: RedirectLog) => {
        typeCount[log.redirect_type] = (typeCount[log.redirect_type] || 0) + 1;
        urlCount[log.old_url] = (urlCount[log.old_url] || 0) + 1;
      });

      const topUrls = Object.entries(urlCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10);

      return { typeCount, topUrls };
    },
  });

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {stats && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Redirects by Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(stats.typeCount).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <Badge variant="outline">{type}</Badge>
                    <span className="text-2xl font-bold">{count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Redirected URLs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {stats.topUrls.map(([url, count]) => (
                  <div key={url} className="flex items-center justify-between gap-2">
                    <code className="text-xs truncate flex-1">{url}</code>
                    <span className="font-bold">{count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Recent Redirects</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Old URL</TableHead>
                <TableHead>New URL</TableHead>
                <TableHead>IP</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {redirects?.map((redirect) => (
                <TableRow key={redirect.id}>
                  <TableCell className="text-xs">
                    {formatDistanceToNow(new Date(redirect.created_at), { addSuffix: true })}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{redirect.redirect_type}</Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{redirect.old_url}</TableCell>
                  <TableCell className="font-mono text-xs">{redirect.new_url}</TableCell>
                  <TableCell className="text-xs">{redirect.ip_address || 'N/A'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
