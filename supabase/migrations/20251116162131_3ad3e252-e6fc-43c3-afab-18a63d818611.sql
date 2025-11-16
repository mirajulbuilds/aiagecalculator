-- Create secure logging function that verifies admin status server-side
CREATE OR REPLACE FUNCTION public.log_admin_action(
  p_action_type text,
  p_resource_type text,
  p_resource_id uuid DEFAULT NULL,
  p_resource_name text DEFAULT NULL,
  p_changes jsonb DEFAULT NULL,
  p_user_agent text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Server-side verification: Only admins can log
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can create audit logs';
  END IF;

  -- Insert using auth.uid() (trusted server value)
  INSERT INTO public.admin_audit_logs (
    admin_user_id,
    action_type,
    resource_type,
    resource_id,
    resource_name,
    changes,
    user_agent
  ) VALUES (
    auth.uid(),  -- Server determines this, not client
    p_action_type,
    p_resource_type,
    p_resource_id,
    p_resource_name,
    p_changes,
    p_user_agent
  );
END;
$$;

-- Remove the vulnerable policy that allows any authenticated user to insert
DROP POLICY IF EXISTS "Authenticated users can insert audit logs" ON public.admin_audit_logs;

-- Only allow the secure function to insert (executed with SECURITY DEFINER privileges)
CREATE POLICY "Only secure function can insert audit logs"
  ON public.admin_audit_logs
  FOR INSERT
  WITH CHECK (false);  -- No direct inserts allowed