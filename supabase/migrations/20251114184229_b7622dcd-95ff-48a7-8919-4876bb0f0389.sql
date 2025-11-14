-- Create table to track profile generations for usage analytics
CREATE TABLE IF NOT EXISTS public.profile_generations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  celebrity_id UUID REFERENCES public.celebrities(id) ON DELETE CASCADE,
  celebrity_name TEXT NOT NULL,
  source_url TEXT NOT NULL,
  engine_used TEXT NOT NULL CHECK (engine_used IN ('lovable-ai', 'gemini-api')),
  generation_status TEXT NOT NULL CHECK (generation_status IN ('success', 'failed', 'duplicate')),
  error_message TEXT,
  generated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profile_generations ENABLE ROW LEVEL SECURITY;

-- Only admins can view generation logs
CREATE POLICY "Admins can view generation logs"
  ON public.profile_generations
  FOR SELECT
  USING (is_admin());

-- Only admins can insert generation logs
CREATE POLICY "Admins can insert generation logs"
  ON public.profile_generations
  FOR INSERT
  WITH CHECK (is_admin());

-- Create index for faster queries
CREATE INDEX idx_profile_generations_created_at ON public.profile_generations(created_at DESC);
CREATE INDEX idx_profile_generations_engine ON public.profile_generations(engine_used);
CREATE INDEX idx_profile_generations_status ON public.profile_generations(generation_status);