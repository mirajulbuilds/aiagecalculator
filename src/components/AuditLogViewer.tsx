import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Download, RefreshCw, ChevronLeft, ChevronRight, FileJson } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface AuditLog {
  id: string;
  admin_user_id: string;
  action_type: string;
  resource_type: string;
  resource_id: string | null;
  resource_name: string | null;
  changes: any;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export const AuditLogViewer = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [resourceFilter, setResourceFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
    to: new Date(),
  });
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 50;

  useEffect(() => {
    fetchAuditLogs();
  }, [dateRange]);

  useEffect(() => {
    filterLogs();
  }, [logs, searchQuery, actionFilter, resourceFilter]);

  const fetchAuditLogs = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("admin_audit_logs")
        .select("*")
        .gte("created_at", dateRange.from.toISOString())
        .lte("created_at", dateRange.to.toISOString())
        .order("created_at", { ascending: false });

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      toast.error("Failed to fetch audit logs");
    } finally {
      setIsLoading(false);
    }
  };

  const filterLogs = () => {
    let filtered = [...logs];

    if (searchQuery) {
      filtered = filtered.filter(
        (log) =>
          log.resource_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          log.resource_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          log.admin_user_id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (actionFilter !== "all") {
      filtered = filtered.filter((log) => log.action_type === actionFilter);
    }

    if (resourceFilter !== "all") {
      filtered = filtered.filter((log) => log.resource_type === resourceFilter);
    }

    setFilteredLogs(filtered);
    setCurrentPage(1);
  };

  const exportToCSV = () => {
    const csv = [
      ["Timestamp", "Admin User", "Action Type", "Resource Type", "Resource Name", "Resource ID", "IP Address"],
      ...filteredLogs.map((log) => [
        format(new Date(log.created_at), "yyyy-MM-dd HH:mm:ss"),
        log.admin_user_id,
        log.action_type,
        log.resource_type,
        log.resource_name || "",
        log.resource_id || "",
        log.ip_address || "",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-logs-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Audit logs exported to CSV");
  };

  const exportToJSON = () => {
    const json = JSON.stringify(filteredLogs, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-logs-${format(new Date(), "yyyy-MM-dd")}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Audit logs exported to JSON");
  };

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case "create":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "update":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "delete":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case "role_change":
        return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * logsPerPage,
    currentPage * logsPerPage
  );
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Audit Logs</CardTitle>
              <CardDescription>
                View and filter all admin actions ({filteredLogs.length} logs)
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={fetchAuditLogs} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={exportToCSV} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                CSV
              </Button>
              <Button onClick={exportToJSON} variant="outline" size="sm">
                <FileJson className="h-4 w-4 mr-2" />
                JSON
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Search by name, ID, or admin..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Action Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="create">Create</SelectItem>
                <SelectItem value="update">Update</SelectItem>
                <SelectItem value="delete">Delete</SelectItem>
                <SelectItem value="role_change">Role Change</SelectItem>
              </SelectContent>
            </Select>
            <Select value={resourceFilter} onValueChange={setResourceFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Resource Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Resources</SelectItem>
                <SelectItem value="celebrity">Celebrity</SelectItem>
                <SelectItem value="user_role">User Role</SelectItem>
              </SelectContent>
            </Select>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-start">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(dateRange.from, "MMM dd")} - {format(dateRange.to, "MMM dd")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <div className="p-3 space-y-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() =>
                      setDateRange({
                        from: new Date(Date.now() - 24 * 60 * 60 * 1000),
                        to: new Date(),
                      })
                    }
                  >
                    Last 24 hours
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() =>
                      setDateRange({
                        from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                        to: new Date(),
                      })
                    }
                  >
                    Last 7 days
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() =>
                      setDateRange({
                        from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                        to: new Date(),
                      })
                    }
                  >
                    Last 30 days
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Logs Table */}
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading audit logs...</div>
          ) : paginatedLogs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No audit logs found</div>
          ) : (
            <div className="space-y-3">
              {paginatedLogs.map((log) => (
                <Collapsible key={log.id}>
                  <Card>
                    <CollapsibleTrigger className="w-full">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1 text-left">
                            <div className="flex items-center gap-2">
                              <Badge className={getActionBadgeColor(log.action_type)}>
                                {log.action_type}
                              </Badge>
                              <span className="font-medium">{log.resource_name || "Unknown"}</span>
                              <span className="text-sm text-muted-foreground">
                                ({log.resource_type})
                              </span>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {format(new Date(log.created_at), "PPpp")} • Admin:{" "}
                              {log.admin_user_id.substring(0, 8)}...
                            </div>
                            {log.ip_address && (
                              <div className="text-xs text-muted-foreground">
                                IP: {log.ip_address}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="pt-0 pb-6">
                        <div className="border-t pt-4 mt-2 space-y-2">
                          <div className="text-sm">
                            <span className="font-medium">Resource ID:</span>{" "}
                            <code className="text-xs bg-muted px-2 py-1 rounded">
                              {log.resource_id || "N/A"}
                            </code>
                          </div>
                          {log.user_agent && (
                            <div className="text-sm">
                              <span className="font-medium">User Agent:</span>
                              <div className="text-xs text-muted-foreground mt-1 break-all">
                                {log.user_agent}
                              </div>
                            </div>
                          )}
                          {log.changes && (
                            <div className="text-sm">
                              <span className="font-medium">Changes:</span>
                              <pre className="text-xs bg-muted p-3 rounded mt-2 overflow-auto max-h-64">
                                {JSON.stringify(log.changes, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <div className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * logsPerPage + 1} -{" "}
                {Math.min(currentPage * logsPerPage, filteredLogs.length)} of {filteredLogs.length}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
