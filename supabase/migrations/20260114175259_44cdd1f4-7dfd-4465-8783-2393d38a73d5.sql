-- Drop overly permissive INSERT policies
DROP POLICY IF EXISTS "Service role can insert GSC submission logs" ON gsc_submission_logs;
DROP POLICY IF EXISTS "Anyone can log redirects" ON redirect_logs;

-- For gsc_submission_logs: Create a SECURITY DEFINER function that edge functions can call
-- This ensures only authorized backend code can insert logs
CREATE OR REPLACE FUNCTION insert_gsc_submission_log(
  p_sitemap_url text,
  p_submission_status text,
  p_response_data jsonb DEFAULT NULL,
  p_error_message text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
BEGIN
  INSERT INTO gsc_submission_logs (sitemap_url, submission_status, response_data, error_message, submitted_by)
  VALUES (p_sitemap_url, p_submission_status, p_response_data, p_error_message, auth.uid())
  RETURNING id INTO v_id;
  
  RETURN v_id;
END;
$$;

-- For redirect_logs: Create a SECURITY DEFINER function for logging redirects
-- This is called by edge functions to log redirect events
CREATE OR REPLACE FUNCTION insert_redirect_log(
  p_old_url text,
  p_new_url text,
  p_redirect_type text,
  p_ip_address text DEFAULT NULL,
  p_user_agent text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
BEGIN
  INSERT INTO redirect_logs (old_url, new_url, redirect_type, ip_address, user_agent)
  VALUES (p_old_url, p_new_url, p_redirect_type, p_ip_address, p_user_agent)
  RETURNING id INTO v_id;
  
  RETURN v_id;
END;
$$;