import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

export const useAdminCheck = () => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        // First check if user is authenticated
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          console.error('No active session');
          setIsAdmin(false);
          setIsLoading(false);
          navigate('/auth-gateway-key-a1b2c3');
          return;
        }

        // Check if user has admin role using our security definer function
        const { data, error } = await supabase.rpc('is_admin');

        if (error) {
          console.error('Error checking admin status:', error);
          setIsAdmin(false);
          setIsLoading(false);
          navigate('/');
          return;
        }

        setIsAdmin(data === true);
        setIsLoading(false);

        // If not admin, redirect to home
        if (data !== true) {
          console.warn('Access denied: User is not an admin');
          navigate('/');
        }
      } catch (error) {
        console.error('Error in admin check:', error);
        setIsAdmin(false);
        setIsLoading(false);
        navigate('/');
      }
    };

    checkAdminStatus();
  }, [navigate]);

  return { isAdmin, isLoading };
};
