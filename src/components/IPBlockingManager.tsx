import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus, Trash2, RefreshCw, Shield } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface BlockedIP {
  id: string;
  ip_address: string;
  reason: string;
  blocked_by: string;
  blocked_at: string;
  expires_at: string | null;
}

interface IPBlockingManagerProps {
  prefilledIP?: string;
}

export const IPBlockingManager = ({ prefilledIP }: IPBlockingManagerProps) => {
  const [blockedIPs, setBlockedIPs] = useState<BlockedIP[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newIP, setNewIP] = useState(prefilledIP || "");
  const [reason, setReason] = useState("");
  const [expiresAt, setExpiresAt] = useState<Date | undefined>(undefined);
  const [isBlocking, setIsBlocking] = useState(false);
  const [ipToUnblock, setIpToUnblock] = useState<BlockedIP | null>(null);

  useEffect(() => {
    fetchBlockedIPs();
  }, []);

  useEffect(() => {
    if (prefilledIP) {
      setNewIP(prefilledIP);
    }
  }, [prefilledIP]);

  const fetchBlockedIPs = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("blocked_ips")
        .select("*")
        .order("blocked_at", { ascending: false });

      if (error) throw error;
      setBlockedIPs(data || []);
    } catch (error) {
      console.error("Error fetching blocked IPs:", error);
      toast.error("Failed to fetch blocked IPs");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBlockIP = async () => {
    if (!newIP || !reason) {
      toast.error("IP address and reason are required");
      return;
    }

    // Basic IP validation
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipRegex.test(newIP)) {
      toast.error("Invalid IP address format");
      return;
    }

    setIsBlocking(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("blocked_ips").insert({
        ip_address: newIP,
        reason: reason,
        blocked_by: user.id,
        expires_at: expiresAt?.toISOString() || null,
      });

      if (error) {
        if (error.code === "23505") {
          toast.error("This IP address is already blocked");
        } else {
          throw error;
        }
        return;
      }

      toast.success("IP address blocked successfully");
      setNewIP("");
      setReason("");
      setExpiresAt(undefined);
      fetchBlockedIPs();
    } catch (error) {
      console.error("Error blocking IP:", error);
      toast.error("Failed to block IP address");
    } finally {
      setIsBlocking(false);
    }
  };

  const handleUnblockIP = async () => {
    if (!ipToUnblock) return;

    try {
      const { error } = await supabase
        .from("blocked_ips")
        .delete()
        .eq("id", ipToUnblock.id);

      if (error) throw error;

      toast.success("IP address unblocked successfully");
      setIpToUnblock(null);
      fetchBlockedIPs();
    } catch (error) {
      console.error("Error unblocking IP:", error);
      toast.error("Failed to unblock IP address");
    }
  };

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  return (
    <div className="space-y-6">
      {/* Add New Blocked IP */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Block IP Address
          </CardTitle>
          <CardDescription>
            Block suspicious IP addresses from accessing edge functions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ip">IP Address *</Label>
            <Input
              id="ip"
              value={newIP}
              onChange={(e) => setNewIP(e.target.value)}
              placeholder="192.168.1.1"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reason">Reason *</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Multiple rate limit violations, suspicious activity"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label>Expires At (Optional)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !expiresAt && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {expiresAt ? format(expiresAt, "PPP") : <span>No expiration</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={expiresAt}
                  onSelect={setExpiresAt}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
                {expiresAt && (
                  <div className="p-3 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpiresAt(undefined)}
                      className="w-full"
                    >
                      Clear expiration
                    </Button>
                  </div>
                )}
              </PopoverContent>
            </Popover>
          </div>
          <Button onClick={handleBlockIP} disabled={isBlocking} className="w-full">
            {isBlocking ? (
              <>Blocking...</>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Block IP Address
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Blocked IPs List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Blocked IP Addresses</CardTitle>
              <CardDescription>
                {blockedIPs.length} IP{blockedIPs.length !== 1 ? "s" : ""} currently blocked
              </CardDescription>
            </div>
            <Button onClick={fetchBlockedIPs} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading blocked IPs...</div>
          ) : blockedIPs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No blocked IP addresses</div>
          ) : (
            <div className="space-y-3">
              {blockedIPs.map((ip) => (
                <div
                  key={ip.id}
                  className={cn(
                    "flex items-start justify-between p-4 border rounded-lg",
                    isExpired(ip.expires_at)
                      ? "border-yellow-500/50 bg-yellow-500/5"
                      : "border-border bg-card"
                  )}
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <code className="text-sm font-mono font-semibold">{ip.ip_address}</code>
                      {isExpired(ip.expires_at) && (
                        <Badge variant="outline" className="text-yellow-500 border-yellow-500">
                          Expired
                        </Badge>
                      )}
                      {ip.expires_at && !isExpired(ip.expires_at) && (
                        <Badge variant="outline">
                          Expires: {format(new Date(ip.expires_at), "PP")}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{ip.reason}</p>
                    <div className="text-xs text-muted-foreground">
                      Blocked: {format(new Date(ip.blocked_at), "PPpp")}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIpToUnblock(ip)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Unblock Confirmation Dialog */}
      <AlertDialog open={!!ipToUnblock} onOpenChange={(open) => !open && setIpToUnblock(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unblock IP Address?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to unblock <code className="font-mono">{ipToUnblock?.ip_address}</code>?
              This IP address will be able to access edge functions again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleUnblockIP}>Unblock</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
