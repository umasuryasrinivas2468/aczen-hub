-- In-app email center: send, receive, reply, tag users, attach location
CREATE TABLE public.user_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL DEFAULT gen_random_uuid(),
  sender_clerk_user_id TEXT NOT NULL,
  to_recipients TEXT[] NOT NULL DEFAULT '{}',
  cc_recipients TEXT[] NOT NULL DEFAULT '{}',
  tagged_user_ids TEXT[] NOT NULL DEFAULT '{}',
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  location_label TEXT,
  location_url TEXT,
  reply_to_id UUID NULL REFERENCES public.user_emails(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_emails ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on user_emails"
ON public.user_emails
FOR ALL
USING (true)
WITH CHECK (true);

CREATE INDEX idx_user_emails_thread_id ON public.user_emails(thread_id, created_at DESC);
CREATE INDEX idx_user_emails_sender ON public.user_emails(sender_clerk_user_id, created_at DESC);
CREATE INDEX idx_user_emails_to_recipients ON public.user_emails USING GIN(to_recipients);
CREATE INDEX idx_user_emails_cc_recipients ON public.user_emails USING GIN(cc_recipients);
CREATE INDEX idx_user_emails_tagged_user_ids ON public.user_emails USING GIN(tagged_user_ids);
