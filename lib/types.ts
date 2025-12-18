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

