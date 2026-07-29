export interface Education {
  id?: number
  icon?: string
  degree?: string
  program?: string
  institution: string
  location: string
  gpa?: string
  period: string
  highlights: string[]
  gradient: string
  order: number
  created_at?: string
  updated_at?: string
}

export interface Publication {
  id?: number
  title: string
  authors: string
  status: 'Published' | 'Major Revision' | 'Published (Abstract)' | 'Under Review' | 'Draft'
  journal?: string
  year: string
  doi?: string
  type: string
  link?: string
  volume?: string
  gradient: string
  order: number
  created_at?: string
  updated_at?: string
}

export interface WorkExperience {
  id?: number
  icon?: string
  title: string
  organization: string
  period: string
  description: string
  gradient: string
  type: 'Work' | 'Volunteering' | 'Internship'
  order: number
  created_at?: string
  updated_at?: string
}

export interface Project {
  id?: number
  icon?: string
  title: string
  description: string
  technologies: string[]
  github?: string
  category: string
  gradient: string
  order: number
  created_at?: string
  updated_at?: string
}

export interface ResearchArea {
  id?: number
  icon?: string
  title: string
  description: string
  technologies: string[]
  gradient: string
  order: number
  created_at?: string
  updated_at?: string
}

export interface Course {
  id?: number
  title: string
  desc: string
  verifyLink?: string
  order: number
  created_at?: string
  updated_at?: string
}

export interface Hero {
  id?: number
  name: string
  title: string
  subtitle?: string
  description?: string
  email?: string
  phone?: string
  cv_url?: string
  github_url?: string
  linkedin_url?: string
  profile_image_url?: string
  focus_tags: string[]
  order: number
  created_at?: string
  updated_at?: string
}

export interface About {
  id?: number
  title: string
  description: string
  values: Array<{ title: string; description: string }>
  quick_facts: Array<{ label: string; value: string }>
  order: number
  created_at?: string
  updated_at?: string
}

export interface ContactInfo {
  id?: number
  icon: string
  text: string
  href: string
  gradient: string
  is_external: boolean
  order: number
  created_at?: string
  updated_at?: string
}

export interface Footer {
  id?: number
  name: string
  description?: string
  quick_links: string[]
  social_links: Array<{ icon: string; href: string; label: string }>
  copyright_text?: string
  created_at?: string
  updated_at?: string
}

export interface Navbar {
  id?: number
  name: string
  nav_items: Array<{ name: string; href: string }>
  created_at?: string
  updated_at?: string
}

export interface Page {
  id?: number
  slug: string
  title: string
  content: string
  meta_description?: string
  created_at?: string
  updated_at?: string
}

export interface Skill {
  id?: number
  name: string
  category: string
  level?: string
  icon?: string
  order: number
  created_at?: string
  updated_at?: string
}

export type Theme = 'minimal' | 'modern' | 'aesthetic' | 'professional' | 'academic' | 'neural' | 'creative'

export interface Settings {
  id?: number
  dark_mode: boolean
  theme: Theme
  created_at?: string
  updated_at?: string
}

// --- Site analytics ---------------------------------------------------------
// Shapes returned by the aggregate SQL functions in create_analytics_table.sql.

export interface AnalyticsBreakdownRow {
  label: string
  views: number
  visitors: number
}

export interface AnalyticsDailyPoint {
  day: string // YYYY-MM-DD
  views: number
  visitors: number
}

export interface AnalyticsSummary {
  total_views: number
  total_visitors: number
  today_views: number
  today_visitors: number
}

export interface AnalyticsStats {
  days: number
  totals: { views: number; visitors: number }
  /** Same-length window immediately before this one, for the trend deltas. */
  previous: { views: number; visitors: number }
  allTime: AnalyticsSummary
  daily: AnalyticsDailyPoint[]
  paths: AnalyticsBreakdownRow[]
  referrers: AnalyticsBreakdownRow[]
  devices: AnalyticsBreakdownRow[]
  countries: AnalyticsBreakdownRow[]
  /** false when create_analytics_table.sql has not been run yet */
  configured: boolean
}

