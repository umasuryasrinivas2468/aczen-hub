
-- 1) TASKS TABLE
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  assigned_to TEXT NOT NULL,
  assigned_by TEXT NOT NULL,
  due_date DATE NOT NULL,
  priority TEXT NOT NULL DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')),
  status TEXT NOT NULL DEFAULT 'Assigned' CHECK (status IN ('Assigned', 'In Progress', 'Completed', 'On Hold')),
  remarks TEXT,
  last_activity TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX idx_tasks_assigned_by ON public.tasks(assigned_by);
CREATE INDEX idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_tasks_priority ON public.tasks(priority);
CREATE INDEX idx_tasks_created_at ON public.tasks(created_at);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on tasks" ON public.tasks FOR ALL USING (true) WITH CHECK (true);

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Calendar RPC: get tasks for user within date range
CREATE OR REPLACE FUNCTION public.get_user_calendar_tasks(
  user_identifiers TEXT[],
  start_date DATE,
  end_date DATE
)
RETURNS TABLE (
  id UUID, title TEXT, description TEXT, assigned_to TEXT, assigned_by TEXT,
  due_date DATE, priority TEXT, status TEXT, remarks TEXT, created_at TIMESTAMPTZ
)
LANGUAGE sql STABLE SET search_path = public
AS $$
  SELECT t.id, t.title, t.description, t.assigned_to, t.assigned_by,
         t.due_date, t.priority, t.status, t.remarks, t.created_at
  FROM public.tasks t
  WHERE (t.assigned_to = ANY(user_identifiers) OR t.assigned_by = ANY(user_identifiers))
    AND t.due_date BETWEEN start_date AND end_date
  ORDER BY t.due_date ASC;
$$;

-- Calendar aggregation RPC
CREATE OR REPLACE FUNCTION public.get_calendar_counts(
  user_identifiers TEXT[],
  start_date DATE,
  end_date DATE
)
RETURNS TABLE (
  task_date DATE, total BIGINT, completed BIGINT, overdue_open BIGINT
)
LANGUAGE sql STABLE SET search_path = public
AS $$
  SELECT t.due_date AS task_date,
         COUNT(*) AS total,
         COUNT(*) FILTER (WHERE t.status = 'Completed') AS completed,
         COUNT(*) FILTER (WHERE t.status != 'Completed' AND t.due_date < CURRENT_DATE) AS overdue_open
  FROM public.tasks t
  WHERE (t.assigned_to = ANY(user_identifiers) OR t.assigned_by = ANY(user_identifiers))
    AND t.due_date BETWEEN start_date AND end_date
  GROUP BY t.due_date
  ORDER BY t.due_date;
$$;

-- 2) USER EMAILS TABLE
CREATE TABLE public.user_emails (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  thread_id UUID,
  sender_clerk_user_id TEXT NOT NULL,
  to_recipients TEXT[] NOT NULL DEFAULT '{}',
  cc_recipients TEXT[] DEFAULT '{}',
  tagged_user_ids TEXT[] DEFAULT '{}',
  subject TEXT NOT NULL CHECK (length(trim(subject)) > 0),
  body TEXT NOT NULL CHECK (length(trim(body)) > 0),
  location_label TEXT,
  location_url TEXT,
  reply_to_id UUID REFERENCES public.user_emails(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ensure at least one recipient
ALTER TABLE public.user_emails ADD CONSTRAINT at_least_one_recipient
  CHECK (array_length(to_recipients, 1) > 0 OR array_length(cc_recipients, 1) > 0);

-- Self-reference for thread_id
ALTER TABLE public.user_emails ADD CONSTRAINT fk_thread
  FOREIGN KEY (thread_id) REFERENCES public.user_emails(id);

CREATE INDEX idx_emails_sender ON public.user_emails(sender_clerk_user_id);
CREATE INDEX idx_emails_to ON public.user_emails USING GIN(to_recipients);
CREATE INDEX idx_emails_cc ON public.user_emails USING GIN(cc_recipients);
CREATE INDEX idx_emails_tagged ON public.user_emails USING GIN(tagged_user_ids);
CREATE INDEX idx_emails_thread ON public.user_emails(thread_id);
CREATE INDEX idx_emails_created ON public.user_emails(created_at DESC);

ALTER TABLE public.user_emails ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on user_emails" ON public.user_emails FOR ALL USING (true) WITH CHECK (true);

-- 3) CHAT MESSAGES TABLE
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_clerk_user_id TEXT NOT NULL,
  recipient_clerk_user_id TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_chat_conversation ON public.chat_messages(
  LEAST(sender_clerk_user_id, recipient_clerk_user_id),
  GREATEST(sender_clerk_user_id, recipient_clerk_user_id),
  created_at DESC
);
CREATE INDEX idx_chat_sender ON public.chat_messages(sender_clerk_user_id);
CREATE INDEX idx_chat_recipient ON public.chat_messages(recipient_clerk_user_id);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on chat_messages" ON public.chat_messages FOR ALL USING (true) WITH CHECK (true);

-- Enable realtime for chat
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
