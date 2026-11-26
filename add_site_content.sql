-- ============================================
-- ADD EDITABLE HOMEPAGE CONTENT
-- Run once in the Supabase SQL Editor.
-- Stores the hero research line, availability, highlights, "Latest" news,
-- research questions and awards edited from Admin → Homepage.
-- ============================================

ALTER TABLE settings ADD COLUMN IF NOT EXISTS site_content JSONB;
