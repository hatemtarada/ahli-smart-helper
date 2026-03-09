
-- Fix the overly permissive feedback insert policy
DROP POLICY "Anyone can create feedback" ON public.feedback;
CREATE POLICY "Authenticated users can create feedback" ON public.feedback FOR INSERT TO authenticated WITH CHECK (true);
