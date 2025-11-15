import { useEffect } from 'react';
import { toast } from 'sonner';

const ALLOWED_DOMAINS = ['https://lovable.app'];
const ALLOWED_DOMAIN = 'https://lovable.app';

interface DomainGuardProps {
  children: React.ReactNode;
  redirectToHome?: boolean;
}

export const DomainGuard = ({ children, redirectToHome = false }: DomainGuardProps) => {
  useEffect(() => {
    const currentDomain = window.location.origin;
    
    if (!ALLOWED_DOMAINS.includes(currentDomain)) {
      console.error('Unauthorized domain access attempt:', currentDomain);
      
      toast.error('Access denied: Unauthorized domain');
      
      if (!redirectToHome) {
        const currentPath = window.location.pathname + window.location.search;
        window.location.href = `${ALLOWED_DOMAIN}${currentPath}`;
      } else {
        window.location.href = ALLOWED_DOMAIN;
      }
    }
  }, [redirectToHome]);
  
  const currentDomain = window.location.origin;
  if (!ALLOWED_DOMAINS.includes(currentDomain)) {
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
