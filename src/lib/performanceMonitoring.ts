import { onCLS, onFCP, onINP, onLCP, onTTFB, type Metric } from 'web-vitals';

interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
  url: string;
}

// Thresholds based on Google's Core Web Vitals guidelines
const THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 },
  FID: { good: 100, poor: 300 },
  INP: { good: 200, poor: 500 },
  CLS: { good: 0.1, poor: 0.25 },
  FCP: { good: 1800, poor: 3000 },
  TTFB: { good: 800, poor: 1800 }
};

/**
 * Get performance rating based on metric value and thresholds
 */
function getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const threshold = THRESHOLDS[name as keyof typeof THRESHOLDS];
  if (!threshold) return 'good';
  
  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}

/**
 * Format metric data for logging/analytics
 */
function formatMetric(metric: Metric): PerformanceMetric {
  return {
    name: metric.name,
    value: metric.value,
    rating: getRating(metric.name, metric.value),
    timestamp: Date.now(),
    url: window.location.pathname
  };
}

/**
 * Send metric to analytics (Google Analytics)
 */
function sendToAnalytics(metric: PerformanceMetric) {
  // Send to Google Analytics if available
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', metric.name, {
      event_category: 'Web Vitals',
      event_label: metric.rating,
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      non_interaction: true,
    });
  }
}

/**
 * Log metric to console in development
 */
function logMetric(metric: PerformanceMetric) {
  if (process.env.NODE_ENV === 'development') {
    const emoji = metric.rating === 'good' ? '✅' : metric.rating === 'needs-improvement' ? '⚠️' : '❌';
    console.log(
      `%c${emoji} ${metric.name}`,
      `color: ${metric.rating === 'good' ? '#0cce6b' : metric.rating === 'needs-improvement' ? '#ffa400' : '#ff4e42'}; font-weight: bold;`,
      `${Math.round(metric.value)}${metric.name === 'CLS' ? '' : 'ms'}`,
      `(${metric.rating})`
    );
  }
}

/**
 * Store metric in session storage for dashboard
 */
function storeMetric(metric: PerformanceMetric) {
  try {
    const stored = sessionStorage.getItem('webVitalsMetrics');
    const metrics: PerformanceMetric[] = stored ? JSON.parse(stored) : [];
    
    // Keep only last 50 metrics
    metrics.push(metric);
    if (metrics.length > 50) {
      metrics.shift();
    }
    
    sessionStorage.setItem('webVitalsMetrics', JSON.stringify(metrics));
  } catch (error) {
    console.error('Failed to store metric:', error);
  }
}

/**
 * Handle metric collection
 */
function handleMetric(metric: Metric) {
  const formatted = formatMetric(metric);
  
  logMetric(formatted);
  sendToAnalytics(formatted);
  storeMetric(formatted);
}

/**
 * Initialize Core Web Vitals monitoring
 */
export function initPerformanceMonitoring() {
  try {
    // Core Web Vitals
    onLCP(handleMetric);  // Largest Contentful Paint
    onINP(handleMetric);  // Interaction to Next Paint (replaces FID)
    onCLS(handleMetric);  // Cumulative Layout Shift
    
    // Additional metrics
    onFCP(handleMetric);  // First Contentful Paint
    onTTFB(handleMetric); // Time to First Byte
    
    console.log('✨ Performance monitoring initialized');
  } catch (error) {
    console.error('Failed to initialize performance monitoring:', error);
  }
}

/**
 * Get stored metrics from session
 */
export function getStoredMetrics(): PerformanceMetric[] {
  try {
    const stored = sessionStorage.getItem('webVitalsMetrics');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to retrieve metrics:', error);
    return [];
  }
}

/**
 * Clear stored metrics
 */
export function clearStoredMetrics() {
  try {
    sessionStorage.removeItem('webVitalsMetrics');
  } catch (error) {
    console.error('Failed to clear metrics:', error);
  }
}

/**
 * Get average metrics by type
 */
export function getAverageMetrics(): Record<string, { value: number; rating: string; count: number }> {
  const metrics = getStoredMetrics();
  const grouped: Record<string, { total: number; count: number; ratings: string[] }> = {};
  
  metrics.forEach(metric => {
    if (!grouped[metric.name]) {
      grouped[metric.name] = { total: 0, count: 0, ratings: [] };
    }
    grouped[metric.name].total += metric.value;
    grouped[metric.name].count += 1;
    grouped[metric.name].ratings.push(metric.rating);
  });
  
  const result: Record<string, { value: number; rating: string; count: number }> = {};
  
  Object.entries(grouped).forEach(([name, data]) => {
    const avgValue = data.total / data.count;
    result[name] = {
      value: Math.round(avgValue),
      rating: getRating(name, avgValue),
      count: data.count
    };
  });
  
  return result;
}
