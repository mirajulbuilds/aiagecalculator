import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { ArrowLeft, Key, Loader2, RefreshCw, Shield, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface AdminUser {
  id: string;
  email: string;
  user_created_at: string;
  last_sign_in_at: string | null;
  twofa_enrolled: boolean;
  twofa_enrolled_at: string | null;
  twofa_created_at: string | null;
}

const TwoFactorManagement = () => {
  const navigate = useNavigate();
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [resetUserId, setResetUserId] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    fetchAdminUsers();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredUsers(adminUsers);
    } else {
      const filtered = adminUsers.filter((user) =>
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery, adminUsers]);

  const fetchAdminUsers = async () => {
    try {
      setIsLoading(true);
      
      // Fetch all admin users with their 2FA status
      const { data: rolesData, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "admin");

      if (rolesError) throw rolesError;

      const adminUserIds = rolesData.map(r => r.user_id);

      // For each admin user, get their auth info and 2FA status
      const usersPromises = adminUserIds.map(async (userId) => {
        const { data: { user } } = await supabase.auth.admin.getUserById(userId);
        const { data: twofa } = await supabase
          .from("admin_2fa")
          .select("*")
          .eq("user_id", userId)
          .maybeSingle();

        return {
          id: userId,
          email: user?.email || "Unknown",
          user_created_at: user?.created_at || "",
          last_sign_in_at: user?.last_sign_in_at || null,
          twofa_enrolled: twofa?.is_enrolled || false,
          twofa_enrolled_at: twofa?.enrolled_at || null,
          twofa_created_at: twofa?.created_at || null,
        };
      });

      const users = await Promise.all(usersPromises);
      setAdminUsers(users);
      setFilteredUsers(users);
    } catch (error) {
      console.error("Error fetching admin users:", error);
      toast.error("Failed to load admin users");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetConfirm = async () => {
    if (!resetUserId) return;

    try {
      setIsResetting(true);
      
      // Call the reset function
      const { error } = await supabase.rpc("reset_user_2fa", {
        target_user_id: resetUserId,
      });

      if (error) throw error;

      toast.success("2FA reset successfully");
      await fetchAdminUsers();
    } catch (error: any) {
      console.error("Error resetting 2FA:", error);
      toast.error(error.message || "Failed to reset 2FA");
    } finally {
      setIsResetting(false);
      setResetUserId(null);
    }
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
        <div className="flex items-center gap-2 mb-2">
          <Key className="h-8 w-8" />
          <h1 className="text-3xl font-bold text-foreground">2FA Management</h1>
        </div>
        <p className="text-muted-foreground">
          Manage two-factor authentication settings for admin users
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Admin Users</CardTitle>
              <CardDescription>View and manage 2FA enrollment status</CardDescription>
            </div>
            <Button
              onClick={fetchAdminUsers}
              variant="outline"
              size="sm"
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Search by email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>2FA Status</TableHead>
                    <TableHead>Enrolled Date</TableHead>
                    <TableHead>Last Sign In</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        {searchQuery ? "No users match your search." : "No admin users found."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.email}</TableCell>
                        <TableCell>
                          {user.twofa_enrolled ? (
                            <Badge variant="default" className="gap-1">
                              <Shield className="h-3 w-3" />
                              Enrolled
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="gap-1">
                              <AlertCircle className="h-3 w-3" />
                              Not Enrolled
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {user.twofa_enrolled_at
                            ? format(new Date(user.twofa_enrolled_at), "MMM dd, yyyy")
                            : "—"}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {user.last_sign_in_at
                            ? format(new Date(user.last_sign_in_at), "MMM dd, yyyy HH:mm")
                            : "Never"}
                        </TableCell>
                        <TableCell className="text-right">
                          {user.twofa_enrolled && (
                            <Button
                              onClick={() => setResetUserId(user.id)}
                              variant="destructive"
                              size="sm"
                            >
                              Reset 2FA
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reset Confirmation Dialog */}
      <AlertDialog open={!!resetUserId} onOpenChange={() => setResetUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset 2FA?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the 2FA enrollment for this user. They will need to re-enroll on their next login.
              This action will be logged in the audit trail.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isResetting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleResetConfirm}
              disabled={isResetting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isResetting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Resetting...
                </>
              ) : (
                "Reset 2FA"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TwoFactorManagement;
