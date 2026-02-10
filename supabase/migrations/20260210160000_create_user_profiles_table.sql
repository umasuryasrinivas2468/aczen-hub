-- User profiles table to store user names and metadata
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on user_profiles table
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Allow all operations through the API (Clerk handles auth)
CREATE POLICY "Allow all operations on user_profiles" ON public.user_profiles FOR ALL USING (true) WITH CHECK (true);

-- Create indexes for common queries
CREATE INDEX idx_user_profiles_clerk_user_id ON public.user_profiles(clerk_user_id);
CREATE INDEX idx_user_profiles_email ON public.user_profiles(email);
