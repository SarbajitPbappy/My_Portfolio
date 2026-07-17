import Hero from '@/components/Hero'
import About from '@/components/About'
import Education from '@/components/Education'
import WorkExperience from '@/components/WorkExperience'
import ResearchAndPublications from '@/components/ResearchAndPublications'
import Projects from '@/components/Projects'
import Skills from '@/components/Skills'
import Contact from '@/components/Contact'
import StructuredData from '@/components/StructuredData'
import {
  getHero,
  getAbout,
  getEducation,
  getCourses,
  getSkills,
  getWorkExperience,
  getResearchAreas,
  getPublications,
  getProjects,
  getContactInfo,
} from '@/lib/db'

// Serve statically-cached HTML (fast TTFB) and regenerate in the background at
// most every 2 minutes. Admins still see edits instantly via the client-side
// "content-updated" refetch; public SSR is at most ~2 min stale.
export const revalidate = 120

// If a DB query rejects, fall back to `undefined` so the client component keeps
// its own fetch-and-fallback behavior instead of the page crashing.
function settled<T>(result: PromiseSettledResult<T>): T | undefined {
  return result.status === 'fulfilled' ? result.value : undefined
}

export default async function Home() {
  const [
    hero,
    about,
    education,
    courses,
    skills,
    roles,
    researchAreas,
    publications,
    projects,
    contactInfo,
  ] = await Promise.allSettled([
    getHero(),
    getAbout(),
    getEducation(),
    getCourses(),
    getSkills(),
    getWorkExperience(),
    getResearchAreas(),
    getPublications(),
    getProjects(),
    getContactInfo(),
  ])

  const publicationsData = settled(publications)

  return (
    <div className="min-h-screen">
      <StructuredData hero={settled(hero) ?? null} publications={publicationsData ?? []} />
      <Hero initialData={settled(hero) ?? null} />
      <About initialData={settled(about) ?? null} />
      <Education
        initialEducation={settled(education)}
        initialCourses={settled(courses)}
      />
      <Skills initialSkills={settled(skills)} />
      <WorkExperience initialRoles={settled(roles)} />
      <ResearchAndPublications
        initialResearchAreas={settled(researchAreas)}
        initialPublications={publicationsData}
      />
      <Projects initialProjects={settled(projects)} />
      <Contact initialContactInfo={settled(contactInfo)} />
    </div>
  )
}
