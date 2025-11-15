import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useLocation } from "react-router-dom";
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from 'lucide-react';

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

  useEffect(() => {
    const check2FAStatus = async () => {
      if (!isAdmin || isLoading) return;

      try {
        const { data, error } = await supabase.functions.invoke('check-2fa-status');
        
        if (error) {
          console.error('Error checking 2FA status:', error);
          setTwoFAStatus({ checked: true, enrolled: true, verified: true });
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
        console.error('Error:', error);
        setTwoFAStatus({ checked: true, enrolled: true, verified: true });
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
    return null;
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
