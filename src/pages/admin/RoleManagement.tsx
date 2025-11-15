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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { ArrowLeft, Shield, Loader2, RefreshCw, AlertCircle, Crown } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { useUserRole } from "@/hooks/useUserRole";

interface UserWithRole {
  id: string;
  email: string;
  created_at: string;
  role: string;
  role_created_at: string;
}

const RoleManagement = () => {
  const navigate = useNavigate();
  const { isSuperAdmin, isLoading: roleLoading } = useUserRole();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserWithRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [changeRoleUser, setChangeRoleUser] = useState<UserWithRole | null>(null);
  const [newRole, setNewRole] = useState<string>("");
  const [isChanging, setIsChanging] = useState(false);

  useEffect(() => {
    if (!roleLoading && !isSuperAdmin) {
      toast.error("Access denied: Super admin only");
      navigate('/system-control-panel-x4y5z6');
    }
  }, [isSuperAdmin, roleLoading, navigate]);

  useEffect(() => {
    if (isSuperAdmin) {
      fetchUsers();
    }
  }, [isSuperAdmin]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter((user) =>
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery, users]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      
      // Fetch all users with roles
      const { data: userRoles, error } = await supabase
        .from("user_roles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Get user details for each role
      const usersPromises = (userRoles || []).map(async (userRole) => {
        const { data: { user } } = await supabase.auth.admin.getUserById(userRole.user_id);
        return {
          id: userRole.user_id,
          email: user?.email || "Unknown",
          created_at: user?.created_at || "",
          role: userRole.role,
          role_created_at: userRole.created_at || "",
        };
      });

      const usersData = await Promise.all(usersPromises);
      setUsers(usersData);
      setFilteredUsers(usersData);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = async () => {
    if (!changeRoleUser || !newRole) return;

    try {
      setIsChanging(true);

      // Delete old role
      const { error: deleteError } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", changeRoleUser.id);

      if (deleteError) throw deleteError;

      // Insert new role
      const { error: insertError } = await supabase
        .from("user_roles")
        .insert([{
          user_id: changeRoleUser.id,
          role: newRole as any,
        }]);

      if (insertError) throw insertError;

      toast.success(`Role changed to ${newRole} for ${changeRoleUser.email}`);
      await fetchUsers();
    } catch (error: any) {
      console.error("Error changing role:", error);
      toast.error(error.message || "Failed to change role");
    } finally {
      setIsChanging(false);
      setChangeRoleUser(null);
      setNewRole("");
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "super_admin":
        return <Badge className="gap-1 bg-gradient-to-r from-primary to-primary/80"><Crown className="h-3 w-3" />Super Admin</Badge>;
      case "admin":
        return <Badge variant="default" className="gap-1"><Shield className="h-3 w-3" />Admin</Badge>;
      case "moderator":
        return <Badge variant="secondary">Moderator</Badge>;
      default:
        return <Badge variant="outline">User</Badge>;
    }
  };

  if (roleLoading || (isLoading && users.length === 0)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isSuperAdmin) {
    return null;
  }

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
          <Crown className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Role Management</h1>
        </div>
        <p className="text-muted-foreground">
          Manage user roles and permissions (Super Admin Only)
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>User Roles</CardTitle>
              <CardDescription>View and manage user role assignments</CardDescription>
            </div>
            <Button
              onClick={fetchUsers}
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
          <div className="mb-4 space-y-4">
            <Input
              placeholder="Search by email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
            
            <div className="p-4 bg-muted/50 rounded-lg border border-border">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Role Hierarchy
              </h3>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li><strong>Super Admin:</strong> Full access to all admin functions including role management and 2FA reset</li>
                <li><strong>Admin:</strong> Access to most admin functions except role management and 2FA reset</li>
                <li><strong>Moderator:</strong> Limited administrative access</li>
                <li><strong>User:</strong> Regular user access</li>
              </ul>
            </div>
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
                    <TableHead>Role</TableHead>
                    <TableHead>Role Assigned</TableHead>
                    <TableHead>User Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        {searchQuery ? "No users match your search." : "No users found."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.email}</TableCell>
                        <TableCell>{getRoleBadge(user.role)}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {format(new Date(user.role_created_at), "MMM dd, yyyy")}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {format(new Date(user.created_at), "MMM dd, yyyy")}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            onClick={() => {
                              setChangeRoleUser(user);
                              setNewRole(user.role);
                            }}
                            variant="outline"
                            size="sm"
                          >
                            Change Role
                          </Button>
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

      {/* Change Role Dialog */}
      <AlertDialog open={!!changeRoleUser} onOpenChange={() => setChangeRoleUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change User Role</AlertDialogTitle>
            <AlertDialogDescription>
              Change role for {changeRoleUser?.email}
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="py-4">
            <label className="text-sm font-medium mb-2 block">Select New Role</label>
            <Select value={newRole} onValueChange={setNewRole}>
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="super_admin">
                  <div className="flex items-center gap-2">
                    <Crown className="h-4 w-4" />
                    Super Admin
                  </div>
                </SelectItem>
                <SelectItem value="admin">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Admin
                  </div>
                </SelectItem>
                <SelectItem value="moderator">Moderator</SelectItem>
                <SelectItem value="user">User</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isChanging}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRoleChange}
              disabled={isChanging || !newRole || newRole === changeRoleUser?.role}
            >
              {isChanging ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Changing...
                </>
              ) : (
                "Change Role"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default RoleManagement;
