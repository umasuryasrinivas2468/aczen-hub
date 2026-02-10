
-- Punches table for tracking punch in/out
CREATE TABLE public.punches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL CHECK (status IN ('IN', 'OUT')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Work updates table
CREATE TABLE public.work_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT NOT NULL,
  content TEXT NOT NULL,
  update_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Lead uploads table
CREATE TABLE public.lead_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT NOT NULL,
  file_name TEXT NOT NULL,
  uploaded_by TEXT NOT NULL,
  upload_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  lead_source TEXT NOT NULL,
  total_leads INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Note: RLS is not enabled because auth is handled by Clerk externally.
-- For production, consider integrating Clerk JWTs with the database auth layer.

-- Create indexes for common queries
CREATE INDEX idx_punches_clerk_user ON public.punches(clerk_user_id, timestamp DESC);
CREATE INDEX idx_work_updates_clerk_user ON public.work_updates(clerk_user_id, update_date DESC);
CREATE INDEX idx_lead_uploads_clerk_user ON public.lead_uploads(clerk_user_id, upload_date DESC);
