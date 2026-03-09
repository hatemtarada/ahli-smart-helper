
DROP POLICY "Authenticated users can create feedback" ON public.feedback;
CREATE POLICY "Authenticated users can create feedback" ON public.feedback FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
