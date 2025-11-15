-- Create function to check if user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT public.has_role(auth.uid(), 'super_admin')
$$;

-- Update reset_user_2fa function to require super admin
CREATE OR REPLACE FUNCTION public.reset_user_2fa(target_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Check if caller is super admin
  IF NOT public.is_super_admin() THEN
    RAISE EXCEPTION 'Unauthorized: Only super admins can reset 2FA';
  END IF;

  -- Delete 2FA record
  DELETE FROM public.admin_2fa WHERE user_id = target_user_id;

  -- Log the action
  INSERT INTO public.admin_audit_logs (
    admin_user_id,
    action_type,
    resource_type,
    resource_id,
    resource_name,
    changes
  ) VALUES (
    auth.uid(),
    'reset_2fa',
    'user_2fa',
    target_user_id,
    target_user_id::text,
    jsonb_build_object('action', '2FA reset by super admin')
  );

  RETURN TRUE;
END;
$$;

-- Grant execute permission to authenticated users (function checks role internally)
GRANT EXECUTE ON FUNCTION public.is_super_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.reset_user_2fa(UUID) TO authenticated;