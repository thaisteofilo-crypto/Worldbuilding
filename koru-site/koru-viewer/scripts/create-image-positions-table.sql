-- Run this in Supabase SQL Editor to create the image_positions table
CREATE TABLE IF NOT EXISTS image_positions (
  key TEXT PRIMARY KEY,
  x INTEGER NOT NULL DEFAULT 50,
  y INTEGER NOT NULL DEFAULT 50,
  scale REAL NOT NULL DEFAULT 1.0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Allow service role full access
ALTER TABLE image_positions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access" ON image_positions
  FOR ALL
  USING (true)
  WITH CHECK (true);
