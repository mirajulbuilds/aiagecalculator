import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useAdminCheck = () => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const checkAdminStatus = async () => {
      if (active) setIsLoading(true);
      try {
        // Revalidate with the auth server instead of trusting a cached session.
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          if (!active) return;
          setIsAuthenticated(false);
          setIsAdmin(false);
          setIsLoading(false);
          return;
        }

        if (active) setIsAuthenticated(true);

        // Check if user has admin role using our security definer function
        const { data, error } = await supabase.rpc('is_admin');

        if (error) {
          console.error('Error checking admin status:', error);
          console.error('Admin check error details:', {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
            userId: user.id
          });
          if (!active) return;
          setIsAdmin(false);
          setIsLoading(false);
          return;
        }

        console.log('Admin check result:', { 
          data, 
          isAdmin: data === true,
          userId: user.id 
        });

        if (!active) return;
        setIsAdmin(data === true);
        setIsLoading(false);
      } catch (error) {
        console.error('Error in admin check:', error);
        if (!active) return;
        setIsAdmin(false);
        setIsLoading(false);
      }
    };

    checkAdminStatus();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      window.setTimeout(checkAdminStatus, 0);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  return { isAdmin, isAuthenticated, isLoading };
};
