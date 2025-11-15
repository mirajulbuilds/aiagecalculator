import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { logAuthFailure } from "@/lib/securityLogger";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const ALLOWED_DOMAINS = ['https://lovable.app'];

const AuthGateway = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAllowedDomain, setIsAllowedDomain] = useState(true);

  useEffect(() => {
    const currentDomain = window.location.origin;
    setIsAllowedDomain(ALLOWED_DOMAINS.includes(currentDomain));
    
    if (!ALLOWED_DOMAINS.includes(currentDomain)) {
      toast.error('Authentication is not allowed from this domain');
      
      setTimeout(() => {
        window.location.href = 'https://lovable.app/auth-gateway-key-a1b2c3';
      }, 1000);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // SECURITY: Check domain first
    const currentDomain = window.location.origin;
    if (!ALLOWED_DOMAINS.includes(currentDomain)) {
      toast.error('Authentication is not allowed from this domain. Please use Lovable preview');
      
      // Log unauthorized domain attempt
      await supabase.functions.invoke('log-auth-attempt', {
        body: { email, success: false, reason: 'Unauthorized domain: ' + currentDomain }
      });
      return;
    }
    
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Log authentication failure
        logAuthFailure(email, error.message);
        
        // Log failed attempt
        await supabase.functions.invoke('log-auth-attempt', {
          body: { email, success: false, reason: error.message }
        });
        
        toast.error("Login failed: " + error.message);
        return;
      }

      if (data.session) {
        // Log successful login
        await supabase.functions.invoke('log-auth-attempt', {
          body: { email, success: true }
        });
        
        toast.success("Login successful");
        
        // Check 2FA enrollment status
        const { data: statusData, error: statusError } = await supabase.functions.invoke('check-2fa-status');
        
        if (statusError) {
          console.error('Error checking 2FA status:', statusError);
          navigate("/system-control-panel-x4y5z6");
          return;
        }

        if (statusData.is_admin) {
          if (statusData.requires_enrollment) {
            // Admin needs to enroll in 2FA
            navigate("/2fa-enrollment");
          } else {
            // Admin needs to verify 2FA
            navigate("/2fa-verify");
          }
        } else {
          // Non-admin user
          navigate("/");
        }
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAllowedDomain) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-destructive">Access Denied</h1>
          <p className="text-muted-foreground">
            Admin access is only available from authorized domain
          </p>
          <p className="text-sm text-muted-foreground">
            Redirecting to https://aiagecalculator.lovable.app...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground">Admin Portal Access</h1>
        </div>

        <form onSubmit={handleLogin} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@example.com"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="mt-1"
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !isAllowedDomain}
          >
            {isLoading ? "Logging in..." : "Login"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AuthGateway;
