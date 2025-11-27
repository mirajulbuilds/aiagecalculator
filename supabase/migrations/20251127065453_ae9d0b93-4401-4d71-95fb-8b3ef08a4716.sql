-- Create table to track URL redirects for analytics
CREATE TABLE IF NOT EXISTS public.redirect_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  old_url TEXT NOT NULL,
  new_url TEXT NOT NULL,
  redirect_type TEXT NOT NULL, -- 'celebrity' or 'famous-birthdays'
  user_agent TEXT,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index for analytics queries
CREATE INDEX IF NOT EXISTS idx_redirect_logs_created_at ON public.redirect_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_redirect_logs_type ON public.redirect_logs(redirect_type);
CREATE INDEX IF NOT EXISTS idx_redirect_logs_old_url ON public.redirect_logs(old_url);

-- Enable RLS
ALTER TABLE public.redirect_logs ENABLE ROW LEVEL SECURITY;

-- Allow public to insert redirect logs (for analytics)
CREATE POLICY "Anyone can log redirects"
ON public.redirect_logs
FOR INSERT
WITH CHECK (true);

-- Only admins can read redirect logs
CREATE POLICY "Only admins can view redirect logs"
ON public.redirect_logs
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('admin', 'super_admin')
  )
);