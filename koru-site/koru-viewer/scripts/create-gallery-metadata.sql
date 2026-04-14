-- Create gallery_metadata table for storing prompts used to generate images
CREATE TABLE IF NOT EXISTS gallery_metadata (
  name TEXT PRIMARY KEY,
  prompt TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS (but allow service role full access via admin client)
ALTER TABLE gallery_metadata ENABLE ROW LEVEL SECURITY;

-- Policy: allow read for everyone (public gallery shows prompts)
CREATE POLICY "gallery_metadata_read" ON gallery_metadata
  FOR SELECT USING (true);

-- Policy: allow insert/update/delete for service role (admin API)
CREATE POLICY "gallery_metadata_write" ON gallery_metadata
  FOR ALL USING (true) WITH CHECK (true);
