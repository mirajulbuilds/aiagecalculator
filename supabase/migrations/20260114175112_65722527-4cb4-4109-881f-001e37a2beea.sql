-- Drop the existing function first to avoid parameter name conflict
DROP FUNCTION IF EXISTS reset_user_2fa(uuid);

-- Recreate the secure function for super_admins to reset another user's 2FA
CREATE OR REPLACE FUNCTION reset_user_2fa(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only super_admins can reset other users' 2FA
  IF NOT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'super_admin'::app_role
  ) THEN
    RAISE EXCEPTION 'Access denied: Super admin privileges required';
  END IF;
  
  -- Delete the 2FA record (not just disable)
  DELETE FROM admin_2fa WHERE user_id = p_user_id;
  
  RETURN true;
END;
$$;