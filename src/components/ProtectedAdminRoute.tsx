import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useLocation } from "react-router-dom";
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from 'lucide-react';

import { isAllowedDomain, REDIRECT_DOMAIN } from '@/lib/allowedDomains';

interface ProtectedAdminRouteProps {
  children: ReactNode;
}

export const ProtectedAdminRoute = ({ children }: ProtectedAdminRouteProps) => {
  const { isAdmin, isLoading } = useAdminCheck();
  const location = useLocation();
  const [twoFAStatus, setTwoFAStatus] = useState<{
    checked: boolean;
    enrolled: boolean;
    verified: boolean;
  }>({ checked: false, enrolled: false, verified: false });

  // SECURITY: Domain check as first line of defense
  useEffect(() => {
    const currentDomain = window.location.origin;
    if (!isAllowedDomain(currentDomain)) {
      console.error('Admin route accessed from unauthorized domain:', currentDomain);
      window.location.href = REDIRECT_DOMAIN;
    }
  }, [location.pathname]);

  useEffect(() => {
    const check2FAStatus = async () => {
      if (!isAdmin || isLoading) return;

      try {
        const { data: { session } } = await supabase.auth.getSession();
        const { data, error } = await supabase.functions.invoke('check-2fa-status');
        
        if (error) {
          console.error('Error checking 2FA status:', error);
          console.error('2FA check error details:', {
            message: error.message,
            isAdmin,
            userId: session?.user?.id
          });
          // SECURITY: On error, deny access and force re-authentication
          setTwoFAStatus({ checked: true, enrolled: false, verified: false });
          return;
        }

        // Double-check: if not enrolled in 2FA, user shouldn't have access
        if (!data.is_enrolled) {
          setTwoFAStatus({ checked: true, enrolled: false, verified: false });
          return;
        }

        // Check if 2FA was verified in this session (within last 12 hours)
        const verifiedTimestamp = sessionStorage.getItem('2fa_verified');
        const isRecentlyVerified = verifiedTimestamp && 
          (Date.now() - parseInt(verifiedTimestamp)) < 12 * 60 * 60 * 1000;

        setTwoFAStatus({
          checked: true,
          enrolled: data.is_enrolled,
          verified: isRecentlyVerified || false
        });
      } catch (error) {
        const { data: { session } } = await supabase.auth.getSession();
        console.error('Error checking 2FA status:', error);
        console.error('2FA check exception details:', {
          message: error instanceof Error ? error.message : 'Unknown error',
          isAdmin,
          userId: session?.user?.id
        });
        // SECURITY: On error, deny access and force re-authentication
        setTwoFAStatus({ checked: true, enrolled: false, verified: false });
      }
    };

    check2FAStatus();
  }, [isAdmin, isLoading]);

  if (isLoading || !twoFAStatus.checked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Redirecting...</p>
        </div>
      </div>
    );
  }

  // Check if admin needs to enroll in 2FA
  if (!twoFAStatus.enrolled) {
    return <Navigate to="/2fa-enrollment" replace />;
  }

  // Check if admin needs to verify 2FA for this session
  if (!twoFAStatus.verified) {
    return <Navigate to="/2fa-verify" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
};
