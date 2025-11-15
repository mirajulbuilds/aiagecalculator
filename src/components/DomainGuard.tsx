import { useEffect } from 'react';
import { toast } from 'sonner';

const isAllowedDomain = (origin: string): boolean => {
  // Allow any *.lovableproject.com or *.lovable.app subdomain
  return origin.endsWith('.lovableproject.com') || 
         origin.endsWith('.lovable.app') || 
         origin === 'https://lovable.app';
};

const REDIRECT_DOMAIN = 'https://aiagecalc.com';

interface DomainGuardProps {
  children: React.ReactNode;
  redirectToHome?: boolean;
}

export const DomainGuard = ({ children, redirectToHome = false }: DomainGuardProps) => {
  useEffect(() => {
    const currentDomain = window.location.origin;
    
    if (!isAllowedDomain(currentDomain)) {
      console.error('Unauthorized domain access attempt:', currentDomain);
      
      toast.error('Access denied: Admin access only available in development environment');
      
      window.location.href = '/';
    }
  }, [redirectToHome]);
  
  const currentDomain = window.location.origin;
  if (!isAllowedDomain(currentDomain)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4 p-8">
          <h1 className="text-2xl font-bold text-destructive">Access Denied</h1>
          <p className="text-muted-foreground">Redirecting to authorized domain...</p>
        </div>
      </div>
    );
  }
  
  return <>{children}</>;
};
