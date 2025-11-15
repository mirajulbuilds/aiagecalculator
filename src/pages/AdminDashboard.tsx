import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  Shield, 
  BarChart3, 
  ScrollText, 
  Key, 
  Ban,
  LogOut,
  TrendingUp,
  AlertCircle,
  Activity
} from "lucide-react";
import { toast } from "sonner";

interface DashboardStats {
  totalProfiles: number;
  securityEvents24h: number;
  apiCallsToday: number;
  blockedIPs: number;
}

interface DashboardCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  link: string;
  stat?: string | number;
  statLabel?: string;
}

const DashboardCard = ({ title, description, icon, link, stat, statLabel }: DashboardCardProps) => {
  const navigate = useNavigate();
  
  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:border-primary/50"
      onClick={() => navigate(link)}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="p-3 bg-primary/10 rounded-lg">
            {icon}
          </div>
          {stat !== undefined && (
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">{stat}</div>
              {statLabel && <div className="text-xs text-muted-foreground">{statLabel}</div>}
            </div>
          )}
        </div>
        <CardTitle className="mt-4">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
    </Card>
  );
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [adminEmail, setAdminEmail] = useState<string>("");
  const [stats, setStats] = useState<DashboardStats>({
    totalProfiles: 0,
    securityEvents24h: 0,
    apiCallsToday: 0,
    blockedIPs: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAdminInfo();
    fetchDashboardStats();
  }, []);

  const fetchAdminInfo = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.email) {
      setAdminEmail(user.email);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      // Fetch total celebrity profiles
      const { count: profileCount } = await supabase
        .from("celebrities")
        .select("*", { count: "exact", head: true });

      // Fetch security events in last 24h
      const yesterday = new Date();
      yesterday.setHours(yesterday.getHours() - 24);
      const { count: securityCount } = await supabase
        .from("security_logs")
        .select("*", { count: "exact", head: true })
        .gte("created_at", yesterday.toISOString());

      // Fetch profile generations today (as proxy for API calls)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { count: apiCount } = await supabase
        .from("profile_generations")
        .select("*", { count: "exact", head: true })
        .gte("created_at", today.toISOString());

      // Fetch blocked IPs
      const { count: blockedCount } = await supabase
        .from("blocked_ips")
        .select("*", { count: "exact", head: true })
        .or("expires_at.is.null,expires_at.gt." + new Date().toISOString());

      setStats({
        totalProfiles: profileCount || 0,
        securityEvents24h: securityCount || 0,
        apiCallsToday: apiCount || 0,
        blockedIPs: blockedCount || 0,
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Logged out successfully");
      navigate("/auth-gateway-key-a1b2c3");
    } catch (error) {
      toast.error("Error logging out");
      console.error(error);
    }
  };

  const dashboardCards = [
    {
      title: "Celebrity Profile Content Engine",
      description: "Create, edit, and manage celebrity profiles",
      icon: <Users className="h-8 w-8 text-primary" />,
      link: "/admin/celebrity-management",
      stat: stats.totalProfiles,
      statLabel: "Total Profiles",
    },
    {
      title: "Security Monitoring",
      description: "Monitor security events, rate limits, and suspicious activity",
      icon: <Shield className="h-8 w-8 text-primary" />,
      link: "/admin/security-monitoring",
      stat: stats.securityEvents24h,
      statLabel: "Events (24h)",
    },
    {
      title: "Usage Statistics",
      description: "View application usage and API consumption",
      icon: <BarChart3 className="h-8 w-8 text-primary" />,
      link: "/admin/usage-stats",
      stat: stats.apiCallsToday,
      statLabel: "API Calls Today",
    },
    {
      title: "Audit Logs",
      description: "Review admin actions and system changes",
      icon: <ScrollText className="h-8 w-8 text-primary" />,
      link: "/admin/audit-logs",
    },
    {
      title: "2FA Management",
      description: "Manage two-factor authentication settings",
      icon: <Key className="h-8 w-8 text-primary" />,
      link: "/admin/2fa-management",
    },
    {
      title: "IP Blocking",
      description: "Manage blocked IP addresses",
      icon: <Ban className="h-8 w-8 text-primary" />,
      link: "/admin/ip-blocking",
      stat: stats.blockedIPs,
      statLabel: "Active Blocks",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Admin Control Panel</h1>
              <p className="text-sm text-muted-foreground">Centralized management dashboard</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-foreground">Welcome back</p>
                <p className="text-xs text-muted-foreground">{adminEmail}</p>
              </div>
              <Button onClick={handleLogout} variant="outline" size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Quick Stats Bar */}
      <div className="bg-muted/30 border-b">
        <div className="container mx-auto px-6 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardDescription className="text-xs">Total Profiles</CardDescription>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{isLoading ? "..." : stats.totalProfiles}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardDescription className="text-xs">Security Events (24h)</CardDescription>
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{isLoading ? "..." : stats.securityEvents24h}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardDescription className="text-xs">API Calls Today</CardDescription>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{isLoading ? "..." : stats.apiCallsToday}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardDescription className="text-xs">Active IP Blocks</CardDescription>
                  <Ban className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{isLoading ? "..." : stats.blockedIPs}</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Dashboard Cards */}
      <div className="container mx-auto px-6 py-12">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-foreground mb-2">Management Tools</h2>
          <p className="text-sm text-muted-foreground">Select a tool to manage different aspects of the system</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboardCards.map((card) => (
            <DashboardCard key={card.link} {...card} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
