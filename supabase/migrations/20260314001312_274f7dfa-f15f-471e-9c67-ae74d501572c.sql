
-- Create storage bucket for hospital uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('hospital-uploads', 'hospital-uploads', true);

-- Storage RLS: anyone can view
CREATE POLICY "Anyone can view uploads" ON storage.objects FOR SELECT USING (bucket_id = 'hospital-uploads');

-- Storage RLS: admins can upload
CREATE POLICY "Admins can upload" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'hospital-uploads' AND public.has_role(auth.uid(), 'admin')
);

-- Storage RLS: admins can delete
CREATE POLICY "Admins can delete uploads" ON storage.objects FOR DELETE USING (
  bucket_id = 'hospital-uploads' AND public.has_role(auth.uid(), 'admin')
);

-- Add image_url columns to lab_tests and invoices
ALTER TABLE public.lab_tests ADD COLUMN IF NOT EXISTS image_url text DEFAULT '';
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS image_url text DEFAULT '';

-- Create announcements table
CREATE TABLE public.announcements (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title_ar text NOT NULL,
  title_en text NOT NULL DEFAULT '',
  content_ar text NOT NULL DEFAULT '',
  content_en text NOT NULL DEFAULT '',
  image_url text DEFAULT '',
  is_active boolean NOT NULL DEFAULT true,
  priority integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active announcements" ON public.announcements FOR SELECT USING (true);
CREATE POLICY "Admins can manage announcements" ON public.announcements FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Enable realtime for announcements
ALTER PUBLICATION supabase_realtime ADD TABLE public.announcements;
