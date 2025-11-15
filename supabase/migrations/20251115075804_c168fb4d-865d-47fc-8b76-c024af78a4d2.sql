-- Create function to reset user 2FA
CREATE OR REPLACE FUNCTION public.reset_user_2fa(target_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Check if caller is admin
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can reset 2FA';
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
    jsonb_build_object('action', '2FA reset by admin')
  );

  RETURN TRUE;
END;
$$;