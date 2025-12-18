import { supabase } from './supabase'
import type { Education, Publication, WorkExperience, Project, ResearchArea, Course, Hero, About, ContactInfo, Footer, Navbar, Page } from './types'

// Education CRUD
export async function getEducation() {
  // Return empty array if Supabase is not configured
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return []
  }
  
  const { data, error } = await supabase
    .from('education')
    .select('*')
    .order('order', { ascending: true })
  
  if (error) {
    console.error('Supabase error:', error)
    return []
  }
  return (data || []) as Education[]
}

export async function createEducation(edu: Omit<Education, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('education')
    .insert(edu)
    .select()
    .single()
  
  if (error) throw error
  return data as Education
}

export async function updateEducation(id: number, edu: Partial<Education>) {
  const { data, error } = await supabase
    .from('education')
    .update({ ...edu, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data as Education
}

export async function deleteEducation(id: number) {
  const { error } = await supabase
    .from('education')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

// Publications CRUD
export async function getPublications() {
  const { data, error } = await supabase
    .from('publications')
    .select('*')
    .order('order', { ascending: true })
  
  if (error) throw error
  return data as Publication[]
}

export async function createPublication(pub: Omit<Publication, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('publications')
    .insert(pub)
    .select()
    .single()
  
  if (error) throw error
  return data as Publication
}

export async function updatePublication(id: number, pub: Partial<Publication>) {
  const { data, error } = await supabase
    .from('publications')
    .update({ ...pub, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data as Publication
}

export async function deletePublication(id: number) {
  const { error } = await supabase
    .from('publications')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

// Work Experience CRUD
export async function getWorkExperience() {
  const { data, error } = await supabase
    .from('work_experience')
    .select('*')
    .order('order', { ascending: true })
  
  if (error) throw error
  return data as WorkExperience[]
}

export async function createWorkExperience(work: Omit<WorkExperience, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('work_experience')
    .insert(work)
    .select()
    .single()
  
  if (error) throw error
  return data as WorkExperience
}

export async function updateWorkExperience(id: number, work: Partial<WorkExperience>) {
  const { data, error } = await supabase
    .from('work_experience')
    .update({ ...work, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data as WorkExperience
}

export async function deleteWorkExperience(id: number) {
  const { error } = await supabase
    .from('work_experience')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

// Projects CRUD
export async function getProjects() {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('order', { ascending: true })
  
  if (error) throw error
  return data as Project[]
}

export async function createProject(project: Omit<Project, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('projects')
    .insert(project)
    .select()
    .single()
  
  if (error) throw error
  return data as Project
}

export async function updateProject(id: number, project: Partial<Project>) {
  const { data, error } = await supabase
    .from('projects')
    .update({ ...project, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data as Project
}

export async function deleteProject(id: number) {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

// Research Areas CRUD
export async function getResearchAreas() {
  const { data, error } = await supabase
    .from('research_areas')
    .select('*')
    .order('order', { ascending: true })
  
  if (error) throw error
  return data as ResearchArea[]
}

export async function createResearchArea(area: Omit<ResearchArea, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('research_areas')
    .insert(area)
    .select()
    .single()
  
  if (error) throw error
  return data as ResearchArea
}

export async function updateResearchArea(id: number, area: Partial<ResearchArea>) {
  const { data, error } = await supabase
    .from('research_areas')
    .update({ ...area, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data as ResearchArea
}

export async function deleteResearchArea(id: number) {
  const { error } = await supabase
    .from('research_areas')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

// Courses CRUD
export async function getCourses() {
  // Return empty array if Supabase is not configured
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return []
  }
  
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .order('order', { ascending: true })
  
  if (error) {
    console.error('Supabase error:', error)
    return []
  }
  
  // Map 'description' to 'desc' for the response
  return (data || []).map((item: any) => {
    const mapped: any = { ...item }
    // Handle both 'description' and 'desc' fields
    if (mapped.description !== undefined && mapped.description !== null) {
      mapped.desc = mapped.description
      delete mapped.description
    } else if (mapped.desc === undefined || mapped.desc === null) {
      // If neither exists, set empty string
      mapped.desc = ''
    }
    return mapped
  }) as Course[]
}

export async function createCourse(course: Omit<Course, 'id' | 'created_at' | 'updated_at'>) {
  // Map 'desc' to 'description' for database
  const insertData: any = { ...course }
  if (insertData.desc !== undefined && insertData.desc !== null) {
    insertData.description = insertData.desc
    delete insertData.desc
  } else {
    // Ensure description is set even if desc is empty
    insertData.description = insertData.desc || ''
    delete insertData.desc
  }
  
  const { data, error } = await supabase
    .from('courses')
    .insert(insertData)
    .select()
    .single()
  
  if (error) {
    console.error('Error creating course:', error)
    throw error
  }
  
  // Map 'description' back to 'desc' for the response
  const result = { ...data } as any
  if (result.description !== undefined) {
    result.desc = result.description
    delete result.description
  }
  
  return result as Course
}

export async function updateCourse(id: number, course: Partial<Course>) {
  // Map 'desc' to 'description' for database (schema uses 'description')
  const updateData: any = { ...course }
  
  // If 'desc' is provided, map it to 'description' for the database
  if (updateData.desc !== undefined) {
    updateData.description = updateData.desc !== null ? updateData.desc : ''
    delete updateData.desc
  }
  
  const { data, error } = await supabase
    .from('courses')
    .update({ ...updateData, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .maybeSingle()
  
  if (error) {
    console.error('Error updating course:', error)
    throw error
  }
  
  if (!data) {
    throw new Error(`Course with id ${id} not found`)
  }
  
  // Map 'description' back to 'desc' for the response
  const result = { ...data } as any
  if (result.description !== undefined) {
    result.desc = result.description
    delete result.description
  }
  
  return result as Course
}

export async function deleteCourse(id: number) {
  const { error } = await supabase
    .from('courses')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

// Hero CRUD
export async function getHero() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return null
  }
  
  const { data, error } = await supabase
    .from('hero')
    .select('*')
    .order('order', { ascending: true })
    .limit(1)
    .maybeSingle()
  
  if (error) {
    console.error('Supabase error:', error)
    return null
  }
  return data as Hero | null
}

export async function createHero(hero: Omit<Hero, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('hero')
    .insert(hero)
    .select()
    .single()
  
  if (error) throw error
  return data as Hero
}

export async function updateHero(id: number, hero: Partial<Hero>) {
  const { data, error } = await supabase
    .from('hero')
    .update({ ...hero, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data as Hero
}

// About CRUD
export async function getAbout() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return null
  }
  
  const { data, error } = await supabase
    .from('about')
    .select('*')
    .order('order', { ascending: true })
    .limit(1)
    .maybeSingle()
  
  if (error) {
    console.error('Supabase error:', error)
    return null
  }
  return data as About | null
}

export async function createAbout(about: Omit<About, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('about')
    .insert(about)
    .select()
    .single()
  
  if (error) throw error
  return data as About
}

export async function updateAbout(id: number, about: Partial<About>) {
  const { data, error } = await supabase
    .from('about')
    .update({ ...about, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data as About
}

// Contact Info CRUD
export async function getContactInfo() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return []
  }
  
  const { data, error } = await supabase
    .from('contact_info')
    .select('*')
    .order('order', { ascending: true })
  
  if (error) {
    console.error('Supabase error:', error)
    return []
  }
  return (data || []) as ContactInfo[]
}

export async function createContactInfo(contact: Omit<ContactInfo, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('contact_info')
    .insert(contact)
    .select()
    .single()
  
  if (error) throw error
  return data as ContactInfo
}

export async function updateContactInfo(id: number, contact: Partial<ContactInfo>) {
  const { data, error } = await supabase
    .from('contact_info')
    .update({ ...contact, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data as ContactInfo
}

export async function deleteContactInfo(id: number) {
  const { error } = await supabase
    .from('contact_info')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

// Footer CRUD
export async function getFooter() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return null
  }
  
  const { data, error } = await supabase
    .from('footer')
    .select('*')
    .limit(1)
    .maybeSingle()
  
  if (error) {
    console.error('Supabase error:', error)
    return null
  }
  return data as Footer | null
}

export async function createFooter(footer: Omit<Footer, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('footer')
    .insert(footer)
    .select()
    .single()
  
  if (error) throw error
  return data as Footer
}

export async function updateFooter(id: number, footer: Partial<Footer>) {
  const { data, error } = await supabase
    .from('footer')
    .update({ ...footer, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data as Footer
}

// Navbar CRUD
export async function getNavbar() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return null
  }
  
  const { data, error } = await supabase
    .from('navbar')
    .select('*')
    .limit(1)
    .maybeSingle()
  
  if (error) {
    console.error('Supabase error:', error)
    return null
  }
  return data as Navbar | null
}

export async function createNavbar(navbar: Omit<Navbar, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('navbar')
    .insert(navbar)
    .select()
    .single()
  
  if (error) throw error
  return data as Navbar
}

export async function updateNavbar(id: number, navbar: Partial<Navbar>) {
  const { data, error } = await supabase
    .from('navbar')
    .update({ ...navbar, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data as Navbar
}

// Pages CRUD
export async function getPages() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return []
  }
  
  const { data, error } = await supabase
    .from('pages')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Supabase error:', error)
    return []
  }
  return (data || []) as Page[]
}

export async function getPageBySlug(slug: string) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return null
  }
  
  const { data, error } = await supabase
    .from('pages')
    .select('*')
    .eq('slug', slug)
    .maybeSingle()
  
  if (error) {
    console.error('Supabase error:', error)
    return null
  }
  return data as Page | null
}

export async function createPage(page: Omit<Page, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('pages')
    .insert(page)
    .select()
    .single()
  
  if (error) throw error
  return data as Page
}

export async function updatePage(id: number, page: Partial<Page>) {
  const { data, error } = await supabase
    .from('pages')
    .update({ ...page, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data as Page
}

export async function deletePage(id: number) {
  const { error } = await supabase
    .from('pages')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

