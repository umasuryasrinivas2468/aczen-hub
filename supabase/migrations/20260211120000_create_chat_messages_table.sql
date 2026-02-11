-- Chat messages between in-app users
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_clerk_user_id TEXT NOT NULL,
  recipient_clerk_user_id TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Clerk-based app flow handles auth logic
CREATE POLICY "Allow all operations on chat_messages"
ON public.chat_messages
FOR ALL
USING (true)
WITH CHECK (true);

-- Indexes for faster conversation queries
CREATE INDEX idx_chat_messages_sender ON public.chat_messages(sender_clerk_user_id, created_at DESC);
CREATE INDEX idx_chat_messages_recipient ON public.chat_messages(recipient_clerk_user_id, created_at DESC);
