-- Create table for GSC sitemap submission logs
CREATE TABLE IF NOT EXISTS public.gsc_submission_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sitemap_url TEXT NOT NULL,
  submission_status TEXT NOT NULL, -- 'success' or 'failed'
  error_message TEXT,
  submitted_by UUID,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  response_data JSONB
);

-- Enable Row Level Security
ALTER TABLE public.gsc_submission_logs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can view all GSC submission logs"
  ON public.gsc_submission_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Service role can insert GSC submission logs"
  ON public.gsc_submission_logs
  FOR INSERT
  WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX idx_gsc_submission_logs_submitted_at ON public.gsc_submission_logs(submitted_at DESC);
CREATE INDEX idx_gsc_submission_logs_status ON public.gsc_submission_logs(submission_status);