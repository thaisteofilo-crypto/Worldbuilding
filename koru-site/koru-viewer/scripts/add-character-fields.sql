-- Add new character fields to the characters table
-- Run this in Supabase SQL Editor

ALTER TABLE characters ADD COLUMN IF NOT EXISTS species text;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS location text;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS mark text;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS quote text;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS description text;
