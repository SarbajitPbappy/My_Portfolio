-- Fix courses table schema
-- Run this in Supabase SQL Editor if you already created the table

-- Drop and recreate with correct column names
DROP TABLE IF EXISTS courses CASCADE;

CREATE TABLE courses (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  desc TEXT NOT NULL,
  "verifyLink" TEXT,
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recreate index
CREATE INDEX IF NOT EXISTS idx_courses_order ON courses("order");

-- Recreate trigger
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

