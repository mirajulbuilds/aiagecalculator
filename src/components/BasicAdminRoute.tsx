import { ReactNode, useEffect } from 'react';
import { useLocation } from "react-router-dom";
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { Loader2 } from 'lucide-react';

import { isAllowedDomain, REDIRECT_DOMAIN } from '@/lib/allowedDomains';

interface BasicAdminRouteProps {
  children: ReactNode;
}

/**
 * BasicAdminRoute - For 2FA enrollment/verification pages
 * Only checks if user is admin, doesn't check 2FA status
 * (because these pages are for completing 2FA!)
 */
export const BasicAdminRoute = ({ children }: BasicAdminRouteProps) => {
  const { isAdmin, isLoading } = useAdminCheck();
  const location = useLocation();

  // SECURITY: Domain check
  useEffect(() => {
    const currentDomain = window.location.origin;
    if (!isAllowedDomain(currentDomain)) {
      console.error('Admin route accessed from unauthorized domain:', currentDomain);
      window.location.href = REDIRECT_DOMAIN;
    }
  }, [location.pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Verifying admin access...</p>
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

  return <>{children}</>;
};
