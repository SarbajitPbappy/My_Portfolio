-- Complete Portfolio Database Schema for Supabase
-- Run this in Supabase SQL Editor to create/update all tables

-- Enable UUID extension (if needed)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- EXISTING TABLES (with icon support added)
-- ============================================

-- Education Table (add icon if missing)
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

-- Work Experience Table (add icon if missing)
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

-- Projects Table (add icon if missing)
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

-- Research Areas Table (add icon if missing)
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

-- ============================================
-- NEW TABLES FOR FULL CMS
-- ============================================

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

-- Navbar Table
CREATE TABLE IF NOT EXISTS navbar (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  nav_items JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pages Table (for dynamic pages)
CREATE TABLE IF NOT EXISTS pages (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  meta_description TEXT,
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
CREATE INDEX IF NOT EXISTS idx_hero_order ON hero("order");
CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);
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

-- Triggers for all tables
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

CREATE TRIGGER update_hero_updated_at BEFORE UPDATE ON hero
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_about_updated_at BEFORE UPDATE ON about
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contact_info_updated_at BEFORE UPDATE ON contact_info
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_footer_updated_at BEFORE UPDATE ON footer
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_navbar_updated_at BEFORE UPDATE ON navbar
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

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
END $$;

