
-- Enable RLS on all tables
ALTER TABLE public.punches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_uploads ENABLE ROW LEVEL SECURITY;

-- Since Clerk handles auth externally, allow all operations through the API
-- The app validates auth via Clerk before making DB calls
CREATE POLICY "Allow all operations on punches" ON public.punches FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on work_updates" ON public.work_updates FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on lead_uploads" ON public.lead_uploads FOR ALL USING (true) WITH CHECK (true);
