import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { toast } from "sonner";

export const useAdminAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const checkAdminStatus = async (userId: string) => {
      try {
        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", userId)
          .eq("role", "admin")
          .maybeSingle();

        if (!mounted) return;

        if (error) {
          console.error("Error checking admin status:", error);
          setIsAdmin(false);
          toast.error("Unable to verify admin access");
          navigate("/auth");
          return;
        }

        const hasAdminRole = !!data;
        setIsAdmin(hasAdminRole);

        if (!hasAdminRole) {
          toast.error("Admin access required");
          navigate("/auth");
        }
      } catch (error) {
        console.error("Error in checkAdminStatus:", error);
        if (mounted) {
          setIsAdmin(false);
          navigate("/auth");
        }
      }
    };

    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!mounted) return;

        if (session?.user) {
          setUser(session.user);
          await checkAdminStatus(session.user.id);
        } else {
          navigate("/auth");
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        if (mounted) {
          navigate("/auth");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      if (session?.user) {
        setUser(session.user);
        setTimeout(() => {
          checkAdminStatus(session.user.id);
        }, 0);
      } else {
        setUser(null);
        setIsAdmin(false);
        navigate("/auth");
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Signed out successfully");
      navigate("/auth");
    } catch (error: any) {
      toast.error(error.message || "Failed to sign out");
    }
  };

  return { user, isAdmin, loading, signOut };
};
