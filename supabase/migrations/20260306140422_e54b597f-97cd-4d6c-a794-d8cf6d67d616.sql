
CREATE TABLE public.biological_age_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  chronological_age integer NOT NULL,
  biological_age numeric NOT NULL,
  age_difference numeric NOT NULL,
  face_age integer,
  category_scores jsonb,
  detailed_breakdown jsonb,
  summary text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.biological_age_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own results"
  ON public.biological_age_results
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own results"
  ON public.biological_age_results
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own results"
  ON public.biological_age_results
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
