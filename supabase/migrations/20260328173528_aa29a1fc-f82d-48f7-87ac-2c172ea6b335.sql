-- Create symptom_checks table for storing all symptom assessments
CREATE TABLE public.symptom_checks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  symptoms TEXT[] NOT NULL,
  diagnosis TEXT NOT NULL,
  confidence INTEGER NOT NULL CHECK (confidence >= 0 AND confidence <= 100),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'moderate', 'high')),
  recommendations TEXT[],
  language TEXT NOT NULL DEFAULT 'en',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.symptom_checks ENABLE ROW LEVEL SECURITY;

-- Authenticated users can insert their own checks
CREATE POLICY "Users can insert their own symptom checks"
  ON public.symptom_checks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can view their own checks
CREATE POLICY "Users can view their own symptom checks"
  ON public.symptom_checks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow anonymous inserts (for users not logged in, user_id will be null)
CREATE POLICY "Anonymous users can insert symptom checks"
  ON public.symptom_checks FOR INSERT
  TO anon
  WITH CHECK (user_id IS NULL);

-- Allow service role full access (for dashboard aggregation)
CREATE POLICY "Service role can read all symptom checks"
  ON public.symptom_checks FOR SELECT
  TO service_role
  USING (true);

-- Index for dashboard queries
CREATE INDEX idx_symptom_checks_created_at ON public.symptom_checks (created_at DESC);
CREATE INDEX idx_symptom_checks_severity ON public.symptom_checks (severity);
CREATE INDEX idx_symptom_checks_diagnosis ON public.symptom_checks (diagnosis);