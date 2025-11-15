import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'super_admin' | 'admin' | 'moderator' | 'user' | null;

export const useUserRole = () => {
  const [role, setRole] = useState<UserRole>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setRole(null);
          setIsLoading(false);
          return;
        }

        // Check super admin first
        const { data: isSuperAdmin } = await supabase.rpc('is_super_admin');
        if (isSuperAdmin) {
          setRole('super_admin');
          setIsLoading(false);
          return;
        }

        // Check admin
        const { data: isAdmin } = await supabase.rpc('is_admin');
        if (isAdmin) {
          setRole('admin');
          setIsLoading(false);
          return;
        }

        // Check other roles
        const { data: userRoles } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (userRoles) {
          setRole(userRoles.role as UserRole);
        } else {
          setRole('user');
        }
      } catch (error) {
        console.error('Error checking user role:', error);
        setRole(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkUserRole();
  }, []);

  return {
    role,
    isLoading,
    isSuperAdmin: role === 'super_admin',
    isAdmin: role === 'admin' || role === 'super_admin',
    isModerator: role === 'moderator' || role === 'admin' || role === 'super_admin',
  };
};
