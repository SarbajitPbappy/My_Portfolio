-- ============================================
-- FINAL PORTFOLIO DATABASE SCHEMA
-- Run this in Supabase SQL Editor to create all tables
-- ============================================

-- Enable UUID extension (if needed)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLES
-- ============================================

-- Education Table
CREATE TABLE IF NOT EXISTS education (
  id BIGSERIAL PRIMARY KEY,
  icon TEXT,
  degree TEXT,
  program TEXT,
  institution TEXT NOT NULL,
  location TEXT NOT NULL,
  gpa TEXT,
  period TEXT NOT NULL,
  highlights TEXT[] DEFAULT '{}',
  gradient TEXT NOT NULL DEFAULT 'from-blue-500 to-cyan-500',
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Publications Table
CREATE TABLE IF NOT EXISTS publications (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  authors TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Published',
  journal TEXT,
  year TEXT NOT NULL,
  doi TEXT,
  type TEXT NOT NULL,
  link TEXT,
  volume TEXT,
  gradient TEXT NOT NULL DEFAULT 'from-green-500 to-emerald-500',
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Work Experience Table
CREATE TABLE IF NOT EXISTS work_experience (
  id BIGSERIAL PRIMARY KEY,
  icon TEXT,
  title TEXT NOT NULL,
  organization TEXT NOT NULL,
  period TEXT NOT NULL,
  description TEXT NOT NULL,
  gradient TEXT NOT NULL DEFAULT 'from-blue-500 to-cyan-500',
  type TEXT NOT NULL DEFAULT 'Work',
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects Table
CREATE TABLE IF NOT EXISTS projects (
  id BIGSERIAL PRIMARY KEY,
  icon TEXT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  technologies TEXT[] DEFAULT '{}',
  github TEXT,
  category TEXT NOT NULL,
  gradient TEXT NOT NULL DEFAULT 'from-blue-500 to-cyan-500',
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Research Areas Table
CREATE TABLE IF NOT EXISTS research_areas (
  id BIGSERIAL PRIMARY KEY,
  icon TEXT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  technologies TEXT[] DEFAULT '{}',
  gradient TEXT NOT NULL DEFAULT 'from-purple-500 to-indigo-500',
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Courses Table
CREATE TABLE IF NOT EXISTS courses (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  "verifyLink" TEXT,
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Skills Table
CREATE TABLE IF NOT EXISTS skills (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  level TEXT,
  icon TEXT,
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Hero Section Table
CREATE TABLE IF NOT EXISTS hero (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  email TEXT,
  phone TEXT,
  cv_url TEXT,
  github_url TEXT,
  linkedin_url TEXT,
  profile_image_url TEXT DEFAULT '/profile.jpg',
  focus_tags TEXT[] DEFAULT '{}',
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- About Section Table
CREATE TABLE IF NOT EXISTS about (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  values JSONB DEFAULT '[]',
  quick_facts JSONB DEFAULT '[]',
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contact Info Table
CREATE TABLE IF NOT EXISTS contact_info (
  id BIGSERIAL PRIMARY KEY,
  icon TEXT NOT NULL,
  text TEXT NOT NULL,
  href TEXT NOT NULL,
  gradient TEXT NOT NULL,
  is_external BOOLEAN DEFAULT false,
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Footer Table
CREATE TABLE IF NOT EXISTS footer (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  quick_links TEXT[] DEFAULT '{}',
  social_links JSONB DEFAULT '[]',
  copyright_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Settings Table (for dark mode and theme)
CREATE TABLE IF NOT EXISTS settings (
  id BIGSERIAL PRIMARY KEY,
  dark_mode BOOLEAN DEFAULT false,
  theme TEXT NOT NULL DEFAULT 'modern',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_education_order ON education("order");
CREATE INDEX IF NOT EXISTS idx_publications_order ON publications("order");
CREATE INDEX IF NOT EXISTS idx_work_experience_order ON work_experience("order");
CREATE INDEX IF NOT EXISTS idx_projects_order ON projects("order");
CREATE INDEX IF NOT EXISTS idx_research_areas_order ON research_areas("order");
CREATE INDEX IF NOT EXISTS idx_courses_order ON courses("order");
CREATE INDEX IF NOT EXISTS idx_skills_order ON skills("order");
CREATE INDEX IF NOT EXISTS idx_hero_order ON hero("order");
CREATE INDEX IF NOT EXISTS idx_about_order ON about("order");
CREATE INDEX IF NOT EXISTS idx_contact_info_order ON contact_info("order");

-- ============================================
-- TRIGGERS FOR AUTO-UPDATE TIMESTAMPS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_education_updated_at ON education;
DROP TRIGGER IF EXISTS update_publications_updated_at ON publications;
DROP TRIGGER IF EXISTS update_work_experience_updated_at ON work_experience;
DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
DROP TRIGGER IF EXISTS update_research_areas_updated_at ON research_areas;
DROP TRIGGER IF EXISTS update_courses_updated_at ON courses;
DROP TRIGGER IF EXISTS update_skills_updated_at ON skills;
DROP TRIGGER IF EXISTS update_hero_updated_at ON hero;
DROP TRIGGER IF EXISTS update_about_updated_at ON about;
DROP TRIGGER IF EXISTS update_contact_info_updated_at ON contact_info;
DROP TRIGGER IF EXISTS update_footer_updated_at ON footer;

-- Create triggers for all tables
CREATE TRIGGER update_education_updated_at BEFORE UPDATE ON education
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_publications_updated_at BEFORE UPDATE ON publications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_work_experience_updated_at BEFORE UPDATE ON work_experience
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_research_areas_updated_at BEFORE UPDATE ON research_areas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_skills_updated_at BEFORE UPDATE ON skills
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hero_updated_at BEFORE UPDATE ON hero
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_about_updated_at BEFORE UPDATE ON about
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contact_info_updated_at BEFORE UPDATE ON contact_info
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_footer_updated_at BEFORE UPDATE ON footer
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default settings (only if table is empty)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM settings LIMIT 1) THEN
    INSERT INTO settings (dark_mode, theme) VALUES (false, 'modern');
  END IF;
END $$;

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE education ENABLE ROW LEVEL SECURITY;
ALTER TABLE publications ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero ENABLE ROW LEVEL SECURITY;
ALTER TABLE about ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE footer ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
  -- Education
  DROP POLICY IF EXISTS "Public read access for education" ON education;
  DROP POLICY IF EXISTS "Allow all operations for education" ON education;
  
  -- Publications
  DROP POLICY IF EXISTS "Public read access for publications" ON publications;
  DROP POLICY IF EXISTS "Allow all operations for publications" ON publications;
  
  -- Work Experience
  DROP POLICY IF EXISTS "Public read access for work_experience" ON work_experience;
  DROP POLICY IF EXISTS "Allow all operations for work_experience" ON work_experience;
  
  -- Projects
  DROP POLICY IF EXISTS "Public read access for projects" ON projects;
  DROP POLICY IF EXISTS "Allow all operations for projects" ON projects;
  
  -- Research Areas
  DROP POLICY IF EXISTS "Public read access for research_areas" ON research_areas;
  DROP POLICY IF EXISTS "Allow all operations for research_areas" ON research_areas;
  
  -- Courses
  DROP POLICY IF EXISTS "Public read access for courses" ON courses;
  DROP POLICY IF EXISTS "Allow all operations for courses" ON courses;
  
  -- Skills
  DROP POLICY IF EXISTS "Public read access for skills" ON skills;
  DROP POLICY IF EXISTS "Allow all operations for skills" ON skills;
  
  -- Hero
  DROP POLICY IF EXISTS "Public read access for hero" ON hero;
  DROP POLICY IF EXISTS "Allow all operations for hero" ON hero;
  
  -- About
  DROP POLICY IF EXISTS "Public read access for about" ON about;
  DROP POLICY IF EXISTS "Allow all operations for about" ON about;
  
  -- Contact Info
  DROP POLICY IF EXISTS "Public read access for contact_info" ON contact_info;
  DROP POLICY IF EXISTS "Allow all operations for contact_info" ON contact_info;
  
  -- Footer
  DROP POLICY IF EXISTS "Public read access for footer" ON footer;
  DROP POLICY IF EXISTS "Allow all operations for footer" ON footer;
  
  -- Settings
  DROP POLICY IF EXISTS "Public read access for settings" ON settings;
  DROP POLICY IF EXISTS "Allow all operations for settings" ON settings;
END $$;

-- Create policies for public read access (frontend)
CREATE POLICY "Public read access for education" ON education
  FOR SELECT USING (true);

CREATE POLICY "Public read access for publications" ON publications
  FOR SELECT USING (true);

CREATE POLICY "Public read access for work_experience" ON work_experience
  FOR SELECT USING (true);

CREATE POLICY "Public read access for projects" ON projects
  FOR SELECT USING (true);

CREATE POLICY "Public read access for research_areas" ON research_areas
  FOR SELECT USING (true);

CREATE POLICY "Public read access for courses" ON courses
  FOR SELECT USING (true);

CREATE POLICY "Public read access for skills" ON skills
  FOR SELECT USING (true);

CREATE POLICY "Public read access for hero" ON hero
  FOR SELECT USING (true);

CREATE POLICY "Public read access for about" ON about
  FOR SELECT USING (true);

CREATE POLICY "Public read access for contact_info" ON contact_info
  FOR SELECT USING (true);

CREATE POLICY "Public read access for footer" ON footer
  FOR SELECT USING (true);

CREATE POLICY "Public read access for settings" ON settings
  FOR SELECT USING (true);

-- Create policies for all operations (admin panel uses token-based auth)
CREATE POLICY "Allow all operations for education" ON education
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations for publications" ON publications
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations for work_experience" ON work_experience
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations for projects" ON projects
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations for research_areas" ON research_areas
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations for courses" ON courses
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations for skills" ON skills
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations for hero" ON hero
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations for about" ON about
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations for contact_info" ON contact_info
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations for footer" ON footer
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations for settings" ON settings
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- ALTER EXISTING TABLES TO ADD MISSING COLUMNS
-- ============================================

-- Add icon column to existing tables if they don't have it
DO $$ 
BEGIN
  -- Education
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='education' AND column_name='icon') THEN
    ALTER TABLE education ADD COLUMN icon TEXT;
  END IF;
  
  -- Work Experience
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='work_experience' AND column_name='icon') THEN
    ALTER TABLE work_experience ADD COLUMN icon TEXT;
  END IF;
  
  -- Projects
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='icon') THEN
    ALTER TABLE projects ADD COLUMN icon TEXT;
  END IF;
  
  -- Research Areas
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='research_areas' AND column_name='icon') THEN
    ALTER TABLE research_areas ADD COLUMN icon TEXT;
  END IF;
  
  -- Skills
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='skills' AND column_name='icon') THEN
    ALTER TABLE skills ADD COLUMN icon TEXT;
  END IF;
END $$;

-- ============================================
-- SCHEMA COMPLETE
-- ============================================
-- 
-- This schema includes:
-- - 11 tables: education, publications, work_experience, projects, 
--   research_areas, courses, skills, hero, about, contact_info, footer
-- - Indexes for ordering
-- - Auto-update triggers for updated_at timestamps
-- - Row Level Security (RLS) policies for public read and admin operations
-- 
-- Note: Navbar and Pages tables are NOT included as they are no longer used
-- ============================================

