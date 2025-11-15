import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, AlertTriangle, Info, RefreshCw, Activity, Key, AlertCircle, Ban, TrendingUp, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { IPBlockingManager } from "@/components/IPBlockingManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SecurityLog {
  id: string;
  event_type: string;
  user_id: string | null;
  ip_address: string | null;
  user_agent: string | null;
  details: any;
  severity: string;
  created_at: string;
}

interface RateLimitStats {
  total_violations_24h: number;
  total_violations_7d: number;
  total_violations_30d: number;
  top_ips: Array<{ ip: string; count: number }>;
  suspicious_ips: Array<{ ip: string; count: number; last_violation: string }>;
}

interface DomainAccessStats {
  total_attempts_24h: number;
  total_attempts_7d: number;
  total_attempts_30d: number;
  unauthorized_domains: Array<{ domain: string; count: number; last_attempt: string }>;
  attempted_emails: Array<{ email: string; count: number; last_attempt: string }>;
  source_ips: Array<{ ip: string; count: number; last_attempt: string }>;
}

export default function SecurityMonitoring() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [eventTypeFilter, setEventTypeFilter] = useState<string>("all");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [rateLimitStats, setRateLimitStats] = useState<RateLimitStats | null>(null);
  const [domainAccessStats, setDomainAccessStats] = useState<DomainAccessStats | null>(null);

  useEffect(() => {
    fetchSecurityLogs();
    fetchRateLimitStats();
    fetchDomainAccessStats();
  }, [eventTypeFilter, severityFilter]);

  const fetchSecurityLogs = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from("security_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (eventTypeFilter !== "all") {
        query = query.eq("event_type", eventTypeFilter);
      }

      if (severityFilter !== "all") {
        query = query.eq("severity", severityFilter);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching security logs:", error);
        return;
      }

      setLogs(data || []);
    } catch (error) {
      console.error("Error fetching security logs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRateLimitStats = async () => {
    try {
      const now = new Date();
      const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const [violations24h, violations7d, violations30d, topIpsData, suspiciousIpsData] = await Promise.all([
        supabase
          .from("security_logs")
          .select("id", { count: "exact", head: true })
          .eq("event_type", "rate_limit")
          .gte("created_at", twentyFourHoursAgo.toISOString()),
        supabase
          .from("security_logs")
          .select("id", { count: "exact", head: true })
          .eq("event_type", "rate_limit")
          .gte("created_at", sevenDaysAgo.toISOString()),
        supabase
          .from("security_logs")
          .select("id", { count: "exact", head: true })
          .eq("event_type", "rate_limit")
          .gte("created_at", thirtyDaysAgo.toISOString()),
        supabase
          .from("security_logs")
          .select("ip_address")
          .eq("event_type", "rate_limit")
          .gte("created_at", sevenDaysAgo.toISOString()),
        supabase
          .from("security_logs")
          .select("ip_address, created_at")
          .eq("event_type", "rate_limit")
          .gte("created_at", new Date(now.getTime() - 60 * 60 * 1000).toISOString()),
      ]);

      const ipCounts = new Map<string, number>();
      topIpsData.data?.forEach((log: any) => {
        if (log.ip_address) {
          ipCounts.set(log.ip_address, (ipCounts.get(log.ip_address) || 0) + 1);
        }
      });
      const topIps = Array.from(ipCounts.entries())
        .map(([ip, count]) => ({ ip, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      const suspiciousIpCounts = new Map<string, { count: number; lastViolation: string }>();
      suspiciousIpsData.data?.forEach((log: any) => {
        if (log.ip_address) {
          const current = suspiciousIpCounts.get(log.ip_address) || { count: 0, lastViolation: log.created_at };
          suspiciousIpCounts.set(log.ip_address, {
            count: current.count + 1,
            lastViolation: log.created_at > current.lastViolation ? log.created_at : current.lastViolation,
          });
        }
      });
      const suspiciousIps = Array.from(suspiciousIpCounts.entries())
        .filter(([, data]) => data.count >= 5)
        .map(([ip, data]) => ({ ip, count: data.count, last_violation: data.lastViolation }))
        .sort((a, b) => b.count - a.count);

      setRateLimitStats({
        total_violations_24h: violations24h.count || 0,
        total_violations_7d: violations7d.count || 0,
        total_violations_30d: violations30d.count || 0,
        top_ips: topIps,
        suspicious_ips: suspiciousIps,
      });
    } catch (error) {
      console.error("Error fetching rate limit stats:", error);
    }
  };

  const fetchDomainAccessStats = async () => {
    try {
      const now = new Date();
      const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const [attempts24h, attempts7d, attempts30d, domainData] = await Promise.all([
        supabase
          .from("security_logs")
          .select("id", { count: "exact", head: true })
          .eq("event_type", "unauthorized_domain_access")
          .gte("created_at", twentyFourHoursAgo.toISOString()),
        supabase
          .from("security_logs")
          .select("id", { count: "exact", head: true })
          .eq("event_type", "unauthorized_domain_access")
          .gte("created_at", sevenDaysAgo.toISOString()),
        supabase
          .from("security_logs")
          .select("id", { count: "exact", head: true })
          .eq("event_type", "unauthorized_domain_access")
          .gte("created_at", thirtyDaysAgo.toISOString()),
        supabase
          .from("security_logs")
          .select("*")
          .eq("event_type", "unauthorized_domain_access")
          .gte("created_at", sevenDaysAgo.toISOString())
          .order("created_at", { ascending: false }),
      ]);

      // Extract unauthorized domains
      const domainCounts = new Map<string, { count: number; lastAttempt: string }>();
      const emailCounts = new Map<string, { count: number; lastAttempt: string }>();
      const ipCounts = new Map<string, { count: number; lastAttempt: string }>();

      domainData.data?.forEach((log: any) => {
        // Extract domain from details.origin
        if (log.details?.origin) {
          const current = domainCounts.get(log.details.origin) || { count: 0, lastAttempt: log.created_at };
          domainCounts.set(log.details.origin, {
            count: current.count + 1,
            lastAttempt: log.created_at > current.lastAttempt ? log.created_at : current.lastAttempt,
          });
        }

        // Extract email from details
        if (log.details?.email) {
          const current = emailCounts.get(log.details.email) || { count: 0, lastAttempt: log.created_at };
          emailCounts.set(log.details.email, {
            count: current.count + 1,
            lastAttempt: log.created_at > current.lastAttempt ? log.created_at : current.lastAttempt,
          });
        }

        // Extract IP
        if (log.ip_address) {
          const current = ipCounts.get(log.ip_address) || { count: 0, lastAttempt: log.created_at };
          ipCounts.set(log.ip_address, {
            count: current.count + 1,
            lastAttempt: log.created_at > current.lastAttempt ? log.created_at : current.lastAttempt,
          });
        }
      });

      const unauthorizedDomains = Array.from(domainCounts.entries())
        .map(([domain, data]) => ({ domain, count: data.count, last_attempt: data.lastAttempt }))
        .sort((a, b) => b.count - a.count);

      const attemptedEmails = Array.from(emailCounts.entries())
        .map(([email, data]) => ({ email, count: data.count, last_attempt: data.lastAttempt }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      const sourceIps = Array.from(ipCounts.entries())
        .map(([ip, data]) => ({ ip, count: data.count, last_attempt: data.lastAttempt }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      setDomainAccessStats({
        total_attempts_24h: attempts24h.count || 0,
        total_attempts_7d: attempts7d.count || 0,
        total_attempts_30d: attempts30d.count || 0,
        unauthorized_domains: unauthorizedDomains,
        attempted_emails: attemptedEmails,
        source_ips: sourceIps,
      });
    } catch (error) {
      console.error("Error fetching domain access stats:", error);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case "high":
        return "bg-orange-500/10 text-orange-500 border-orange-500/20";
      case "medium":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "low":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case "auth_attempt":
        return Key;
      case "unauthorized_domain_access":
        return Ban;
      case "auth_failure":
        return Key;
      case "rate_limit":
        return Ban;
      case "suspicious_activity":
        return AlertTriangle;
      case "csp_violation":
        return Shield;
      default:
        return Info;
    }
  };

  const getEventTypeLabel = (eventType: string) => {
    return eventType.split("_").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/system-control-panel-x4y5z6')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Shield className="h-8 w-8" />
          Security Monitoring
        </h1>
        <p className="text-muted-foreground mt-2">
          Monitor security events, rate limits, and suspicious activity
        </p>
      </div>

      <Tabs defaultValue="monitoring" className="space-y-6">
        <TabsList>
          <TabsTrigger value="monitoring">Event Monitoring</TabsTrigger>
          <TabsTrigger value="domains">Domain Access</TabsTrigger>
          <TabsTrigger value="blocking">IP Blocking</TabsTrigger>
        </TabsList>

        <TabsContent value="monitoring" className="space-y-6">

      {/* Summary Cards */}
      {rateLimitStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Activity className="h-4 w-4" />
                24h Violations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{rateLimitStats.total_violations_24h}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                7d Violations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{rateLimitStats.total_violations_7d}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Ban className="h-4 w-4" />
                30d Violations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{rateLimitStats.total_violations_30d}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                Suspicious IPs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">
                {rateLimitStats.suspicious_ips.length}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Suspicious Activity Alerts */}
      {rateLimitStats && rateLimitStats.suspicious_ips.length > 0 && (
        <Card className="mb-6 border-red-500/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-500">
              <AlertCircle className="h-5 w-5" />
              Suspicious Activity Detected
            </CardTitle>
            <CardDescription>
              IPs with 5+ rate limit violations in the last hour
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {rateLimitStats.suspicious_ips.map((ip) => (
                <div
                  key={ip.ip}
                  className="flex items-center justify-between p-3 bg-red-500/5 border border-red-500/20 rounded-lg"
                >
                  <div>
                    <code className="text-sm font-mono">{ip.ip}</code>
                    <div className="text-xs text-muted-foreground mt-1">
                      Last: {format(new Date(ip.last_violation), "PPpp")}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="destructive">{ip.count} violations</Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Switch to IP blocking tab with prefilled IP
                        const tabs = document.querySelector('[value="blocking"]') as HTMLElement;
                        tabs?.click();
                        // Small delay to allow tab switch
                        setTimeout(() => {
                          const ipInput = document.querySelector('input[id="ip"]') as HTMLInputElement;
                          if (ipInput) {
                            ipInput.value = ip.ip;
                            ipInput.dispatchEvent(new Event('input', { bubbles: true }));
                          }
                        }, 100);
                      }}
                    >
                      Block IP
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Offending IPs */}
      {rateLimitStats && rateLimitStats.top_ips.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Top Rate-Limited IPs (Last 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {rateLimitStats.top_ips.map((ip, index) => (
                <div
                  key={ip.ip}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>
                    <code className="text-sm font-mono">{ip.ip}</code>
                  </div>
                  <Badge variant="outline">{ip.count} violations</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Security Event Logs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Security Event Logs</CardTitle>
              <CardDescription>Recent security events and alerts</CardDescription>
            </div>
            <Button onClick={fetchSecurityLogs} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex gap-4">
            <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Event Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="auth_attempt">Auth Attempt</SelectItem>
                <SelectItem value="unauthorized_domain_access">Unauthorized Domain</SelectItem>
                <SelectItem value="auth_failure">Auth Failure</SelectItem>
                <SelectItem value="rate_limit">Rate Limit</SelectItem>
                <SelectItem value="suspicious_activity">Suspicious Activity</SelectItem>
                <SelectItem value="csp_violation">CSP Violation</SelectItem>
              </SelectContent>
            </Select>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Logs */}
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading security logs...</div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No security logs found</div>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => {
                const EventIcon = getEventIcon(log.event_type);
                return (
                  <Collapsible key={log.id}>
                    <Card>
                      <CollapsibleTrigger className="w-full">
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <EventIcon className="h-5 w-5 mt-0.5 text-muted-foreground" />
                              <div className="space-y-1 text-left">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{getEventTypeLabel(log.event_type)}</span>
                                  <Badge className={getSeverityColor(log.severity)}>
                                    {log.severity}
                                  </Badge>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {format(new Date(log.created_at), "PPpp")}
                                </div>
                                {log.ip_address && (
                                  <div className="text-xs text-muted-foreground">
                                    IP: <code>{log.ip_address}</code>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <CardContent className="pt-0 pb-6">
                          <div className="border-t pt-4 mt-2 space-y-2">
                            {log.user_id && (
                              <div className="text-sm">
                                <span className="font-medium">User ID:</span>{" "}
                                <code className="text-xs bg-muted px-2 py-1 rounded">{log.user_id}</code>
                              </div>
                            )}
                            {log.user_agent && (
                              <div className="text-sm">
                                <span className="font-medium">User Agent:</span>
                                <div className="text-xs text-muted-foreground mt-1 break-all">
                                  {log.user_agent}
                                </div>
                              </div>
                            )}
                            {log.details && (
                              <div className="text-sm">
                                <span className="font-medium">Details:</span>
                                <pre className="text-xs bg-muted p-3 rounded mt-2 overflow-auto max-h-64">
                                  {JSON.stringify(log.details, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </CollapsibleContent>
                    </Card>
                  </Collapsible>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
        </TabsContent>

        <TabsContent value="domains" className="space-y-6">
          {/* Domain Access Statistics */}
          {domainAccessStats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    24h Attempts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{domainAccessStats.total_attempts_24h}</div>
                  <p className="text-xs text-muted-foreground mt-1">Unauthorized domain access</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    7d Attempts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{domainAccessStats.total_attempts_7d}</div>
                  <p className="text-xs text-muted-foreground mt-1">Last 7 days</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Ban className="h-4 w-4" />
                    30d Attempts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{domainAccessStats.total_attempts_30d}</div>
                  <p className="text-xs text-muted-foreground mt-1">Last 30 days</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Unauthorized Domains */}
          {domainAccessStats && domainAccessStats.unauthorized_domains.length > 0 && (
            <Card className="mb-6 border-red-500/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-500">
                  <AlertCircle className="h-5 w-5" />
                  Unauthorized Domain Access Attempts
                </CardTitle>
                <CardDescription>
                  Domains attempting to access admin functionality
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {domainAccessStats.unauthorized_domains.map((domain) => (
                    <div
                      key={domain.domain}
                      className="flex items-center justify-between p-3 bg-red-500/5 border border-red-500/20 rounded-lg"
                    >
                      <div>
                        <code className="text-sm font-mono">{domain.domain}</code>
                        <div className="text-xs text-muted-foreground mt-1">
                          Last: {format(new Date(domain.last_attempt), "PPpp")}
                        </div>
                      </div>
                      <Badge variant="destructive">{domain.count} attempts</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Source IPs */}
          {domainAccessStats && domainAccessStats.source_ips.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Source IP Addresses (Last 7 Days)
                </CardTitle>
                <CardDescription>
                  IP addresses making unauthorized domain access attempts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {domainAccessStats.source_ips.map((ip, index) => (
                    <div
                      key={ip.ip}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>
                        <div>
                          <code className="text-sm font-mono">{ip.ip}</code>
                          <div className="text-xs text-muted-foreground mt-1">
                            Last: {format(new Date(ip.last_attempt), "PPp")}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="outline">{ip.count} attempts</Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const tabs = document.querySelector('[value="blocking"]') as HTMLElement;
                            tabs?.click();
                            setTimeout(() => {
                              const ipInput = document.querySelector('input[id="ip"]') as HTMLInputElement;
                              if (ipInput) {
                                ipInput.value = ip.ip;
                                ipInput.dispatchEvent(new Event('input', { bubbles: true }));
                              }
                            }, 100);
                          }}
                        >
                          Block IP
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Attempted Emails */}
          {domainAccessStats && domainAccessStats.attempted_emails.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Email Addresses Used in Attempts
                </CardTitle>
                <CardDescription>
                  Top 10 email addresses used in unauthorized access attempts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {domainAccessStats.attempted_emails.map((email, index) => (
                    <div
                      key={email.email}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>
                        <div>
                          <code className="text-sm font-mono">{email.email}</code>
                          <div className="text-xs text-muted-foreground mt-1">
                            Last: {format(new Date(email.last_attempt), "PPp")}
                          </div>
                        </div>
                      </div>
                      <Badge variant="secondary">{email.count} attempts</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Empty State */}
          {domainAccessStats && 
           domainAccessStats.total_attempts_24h === 0 && 
           domainAccessStats.total_attempts_7d === 0 && 
           domainAccessStats.total_attempts_30d === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Unauthorized Access Attempts</h3>
                <p className="text-muted-foreground">
                  Your admin access is secure. No unauthorized domain access attempts detected.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="blocking">
          <IPBlockingManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
