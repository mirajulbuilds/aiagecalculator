import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { logAuthFailure } from "@/lib/securityLogger";

import { isAllowedDomain, redirectToAllowedDomain } from '@/lib/allowedDomains';

const AuthGateway = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDomainAllowed, setIsDomainAllowed] = useState(true);

  useEffect(() => {
    const currentDomain = window.location.origin;
    const allowed = isAllowedDomain(currentDomain);
    setIsDomainAllowed(allowed);
    
    if (!allowed) {
      toast.error('Admin authentication only available in development environment');
      
      setTimeout(() => {
        redirectToAllowedDomain();
      }, 1000);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // SECURITY: Check domain first
    const currentDomain = window.location.origin;
    if (!isAllowedDomain(currentDomain)) {
      toast.error('Admin authentication only available in development environment');
      
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
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          toast.error('Login session could not be verified');
          await supabase.auth.signOut();
          return;
        }

        const { data: isAdmin, error: roleError } = await supabase.rpc('is_admin');
        if (roleError || isAdmin !== true) {
          toast.error('This account does not have admin access');
          await supabase.auth.signOut();
          return;
        }

        // Log successful login
        await supabase.functions.invoke('log-auth-attempt', {
          body: { email, success: true }
        });
        
        toast.success("Login successful");
        
        // Check 2FA enrollment status
        console.log('✅ Login successful, checking 2FA status...');
        const { data: statusData, error: statusError } = await supabase.functions.invoke('check-2fa-status', {
          method: 'POST',
          headers: { Authorization: `Bearer ${data.session.access_token}` }
        });
        
        console.log('2FA Status Response:', {
          data: statusData,
          error: statusError,
          hasError: !!statusError
        });
        
        if (statusError) {
          console.error('❌ Error checking 2FA status:', statusError);
          console.error('Error details:', {
            message: statusError.message,
            name: statusError.name,
            context: statusError.context
          });
          toast.error('Failed to verify admin status');
          return;
        }

        if (!statusData) {
          console.error('❌ No data returned from 2FA status check');
          toast.error('Failed to verify admin status');
          return;
        }

        console.log('✅ 2FA status check result:', {
          is_admin: statusData?.is_admin,
          requires_enrollment: statusData?.requires_enrollment,
          is_enrolled: statusData?.is_enrolled
        });

        if (statusData.is_admin) {
          if (statusData.requires_enrollment) {
            // Admin needs to enroll in 2FA
            console.log('🔐 Redirecting to 2FA enrollment...');
            navigate("/2fa-enrollment");
          } else {
            // Admin needs to verify 2FA
            console.log('🔐 Redirecting to 2FA verification...');
            navigate("/2fa-verify");
          }
        } else {
          // Non-admin user
          console.log('👤 Non-admin user, redirecting to home...');
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

  if (!isDomainAllowed) {
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
            disabled={isLoading || !isDomainAllowed}
          >
            {isLoading ? "Logging in..." : "Login"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AuthGateway;
