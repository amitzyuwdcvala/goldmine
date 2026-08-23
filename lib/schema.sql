-- Aurum Desk — Gold Rate Calculator
-- Run this in your Supabase Project -> SQL Editor

-- 1. Create provider_config table
CREATE TABLE IF NOT EXISTS public.provider_config (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  api_key TEXT DEFAULT '',
  is_active BOOLEAN DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.provider_config ENABLE ROW LEVEL SECURITY;

-- 3. Policy: Allow public read access (for calculator feed)
CREATE POLICY "Allow public read access to provider_config"
  ON public.provider_config FOR SELECT
  USING (true);

-- 4. Policy: Allow authenticated users / service role full access
CREATE POLICY "Allow service role and authenticated full access"
  ON public.provider_config FOR ALL
  USING (true)
  WITH CHECK (true);

-- 5. Seed default rows if empty
INSERT INTO public.provider_config (id, name, api_key, is_active)
VALUES 
  ('goldapi', 'GoldAPI.io', 'goldapi-0a08b89b36444433158c4fb65045ff74-io', true),
  ('goldprice', 'goldprice.dev', '', false),
  ('metals_dev', 'metals.dev', '', false),
  ('metalprice', 'MetalpriceAPI.com', '', false)
ON CONFLICT (id) DO NOTHING;
