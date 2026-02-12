-- Table: allowed emails (whitelist)
CREATE TABLE IF NOT EXISTS allowed_emails (
  email text PRIMARY KEY,
  created_at timestamptz DEFAULT now()
);

-- Only authenticated users can read, and only their own row
ALTER TABLE allowed_emails ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can check own email in whitelist"
  ON allowed_emails
  FOR SELECT
  TO authenticated
  USING (email = (auth.jwt() ->> 'email'));

-- Add your allowed emails (replace with real addresses, then run in Supabase SQL Editor)
-- INSERT INTO allowed_emails (email) VALUES
--   ('your-email@gmail.com'),
--   ('other-allowed@example.com')
-- ON CONFLICT (email) DO NOTHING;
