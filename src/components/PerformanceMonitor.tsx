import { useState, useEffect } from 'react';
import { Activity, X, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getStoredMetrics, getAverageMetrics, clearStoredMetrics } from '@/lib/performanceMonitoring';

export const PerformanceMonitor = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [metrics, setMetrics] = useState(getAverageMetrics());

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(getAverageMetrics());
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'good':
        return 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20';
      case 'needs-improvement':
        return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20';
      case 'poor':
        return 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getRatingIcon = (rating: string) => {
    switch (rating) {
      case 'good':
        return <TrendingUp className="w-3 h-3" />;
      case 'needs-improvement':
        return <Minus className="w-3 h-3" />;
      case 'poor':
        return <TrendingDown className="w-3 h-3" />;
      default:
        return null;
    }
  };

  const formatValue = (name: string, value: number) => {
    if (name === 'CLS') {
      return (value / 1000).toFixed(3);
    }
    return `${value}ms`;
  };

  const getMetricDescription = (name: string) => {
    switch (name) {
      case 'LCP':
        return 'Largest Contentful Paint - Loading performance';
      case 'INP':
        return 'Interaction to Next Paint - Responsiveness';
      case 'CLS':
        return 'Cumulative Layout Shift - Visual stability';
      case 'FCP':
        return 'First Contentful Paint - Initial render';
      case 'TTFB':
        return 'Time to First Byte - Server response';
      default:
        return name;
    }
  };

  if (process.env.NODE_ENV !== 'development') {
    return null; // Only show in development
  }

  return (
    <>
      {/* Floating Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        size="icon"
        variant="outline"
        className="fixed bottom-20 right-4 z-50 w-12 h-12 rounded-full shadow-lg bg-background/95 backdrop-blur-sm border-primary/20 hover:bg-primary/10"
        title="Performance Monitor"
      >
        <Activity className="w-5 h-5" />
      </Button>

      {/* Performance Panel */}
      {isOpen && (
        <Card className="fixed bottom-32 right-4 z-50 w-80 max-h-[500px] overflow-auto shadow-2xl animate-fade-in">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Core Web Vitals</CardTitle>
                <CardDescription className="text-xs">
                  Real-time performance metrics
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(metrics).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No metrics collected yet. Navigate pages to collect data.
              </p>
            ) : (
              <>
                {Object.entries(metrics).map(([name, data]) => (
                  <div
                    key={name}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold">{name}</span>
                        <Badge
                          variant="outline"
                          className={`text-xs ${getRatingColor(data.rating)}`}
                        >
                          <span className="flex items-center gap-1">
                            {getRatingIcon(data.rating)}
                            {data.rating}
                          </span>
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {getMetricDescription(name)}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">
                        {formatValue(name, data.value)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {data.count} samples
                      </div>
                    </div>
                  </div>
                ))}

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-2"
                  onClick={() => {
                    clearStoredMetrics();
                    setMetrics({});
                  }}
                >
                  Clear Metrics
                </Button>
              </>
            )}

            <div className="pt-3 border-t border-border">
              <p className="text-xs text-muted-foreground">
                💡 Metrics are sent to Google Analytics and stored in session storage
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};
