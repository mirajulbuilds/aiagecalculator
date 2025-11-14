import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Loader2, TrendingUp, DollarSign, Activity } from "lucide-react";

interface UsageStats {
  total: number;
  byEngine: {
    'lovable-ai': number;
    'gemini-api': number;
  };
  byStatus: {
    success: number;
    failed: number;
    duplicate: number;
  };
  costEstimate: {
    'lovable-ai': number;
    'gemini-api': number;
    total: number;
  };
  recentGenerations: any[];
}

const COLORS = {
  'lovable-ai': '#8b5cf6',
  'gemini-api': '#3b82f6',
  success: '#10b981',
  failed: '#ef4444',
  duplicate: '#f59e0b',
};

export const UsageStatsDisplay = () => {
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-usage-stats', {
        body: {}
      });

      if (error) throw error;
      setStats(data);
    } catch (error) {
      console.error('Error fetching usage stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!stats) {
    return <div className="text-center p-12 text-muted-foreground">No usage data available</div>;
  }

  const engineData = [
    { name: 'Lovable AI', value: stats.byEngine['lovable-ai'], color: COLORS['lovable-ai'] },
    { name: 'Gemini API', value: stats.byEngine['gemini-api'], color: COLORS['gemini-api'] },
  ];

  const statusData = [
    { name: 'Success', value: stats.byStatus.success, color: COLORS.success },
    { name: 'Failed', value: stats.byStatus.failed, color: COLORS.failed },
    { name: 'Duplicate', value: stats.byStatus.duplicate, color: COLORS.duplicate },
  ];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Generations</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.total > 0 ? Math.round((stats.byStatus.success / stats.total) * 100) : 0}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Estimated Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.costEstimate.total.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Lovable AI: ${stats.costEstimate['lovable-ai'].toFixed(2)} | 
              Gemini: ${stats.costEstimate['gemini-api'].toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Usage by Engine</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={engineData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {engineData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8">
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Generations */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Generations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {stats.recentGenerations.map((gen: any) => (
              <div key={gen.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-sm">{gen.celebrity_name}</p>
                  <p className="text-xs text-muted-foreground">{gen.source_url}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    gen.generation_status === 'success' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100' :
                    gen.generation_status === 'failed' ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100' :
                    'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100'
                  }`}>
                    {gen.generation_status}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    gen.engine_used === 'lovable-ai' ? 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-100' :
                    'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100'
                  }`}>
                    {gen.engine_used === 'lovable-ai' ? 'Lovable AI' : 'Gemini API'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
