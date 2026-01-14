-- Add explicit INSERT policy that denies all direct inserts
-- This forces all inserts through the SECURITY DEFINER function insert_redirect_log()
CREATE POLICY "Only secure function can insert redirect logs"
ON public.redirect_logs
FOR INSERT
TO authenticated, anon
WITH CHECK (false);

-- Also add explicit UPDATE and DELETE policies for completeness
CREATE POLICY "No direct updates to redirect logs"
ON public.redirect_logs
FOR UPDATE
TO authenticated, anon
USING (false);

CREATE POLICY "No direct deletes from redirect logs"
ON public.redirect_logs
FOR DELETE
TO authenticated, anon
USING (false);