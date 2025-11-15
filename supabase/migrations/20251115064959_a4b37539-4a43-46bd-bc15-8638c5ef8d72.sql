-- Create admin audit logs table for compliance and security monitoring
CREATE TABLE public.admin_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid NOT NULL,
  action_type text NOT NULL CHECK (action_type IN ('create', 'update', 'delete', 'role_change')),
  resource_type text NOT NULL CHECK (resource_type IN ('celebrity', 'user_role')),
  resource_id uuid,
  resource_name text,
  changes jsonb,
  ip_address text,
  user_agent text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Admins can view all audit logs
CREATE POLICY "Admins can view all audit logs"
ON public.admin_audit_logs FOR SELECT
TO authenticated
USING (is_admin());

-- Service role can insert audit logs (for authenticated users)
CREATE POLICY "Authenticated users can insert audit logs"
ON public.admin_audit_logs FOR INSERT
TO authenticated
WITH CHECK (true);

-- Indexes for performance
CREATE INDEX idx_admin_audit_logs_user ON public.admin_audit_logs(admin_user_id);
CREATE INDEX idx_admin_audit_logs_created ON public.admin_audit_logs(created_at DESC);
CREATE INDEX idx_admin_audit_logs_resource ON public.admin_audit_logs(resource_type, resource_id);