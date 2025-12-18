-- ============================================
-- CREATE SETTINGS TABLE
-- Run this in Supabase SQL Editor if settings table doesn't exist
-- ============================================

-- Settings Table (for dark mode and theme)
CREATE TABLE IF NOT EXISTS settings (
  id BIGSERIAL PRIMARY KEY,
  dark_mode BOOLEAN DEFAULT false,
  theme TEXT NOT NULL DEFAULT 'modern',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public read access for settings" ON settings;
DROP POLICY IF EXISTS "Allow all operations for settings" ON settings;

-- Create policies
CREATE POLICY "Public read access for settings" ON settings
  FOR SELECT USING (true);

CREATE POLICY "Allow all operations for settings" ON settings
  FOR ALL USING (true) WITH CHECK (true);

-- Create trigger for updated_at
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default settings
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM settings LIMIT 1) THEN
    INSERT INTO settings (dark_mode, theme) VALUES (false, 'modern');
  END IF;
END $$;

