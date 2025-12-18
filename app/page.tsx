import Hero from '@/components/Hero'
import About from '@/components/About'
import Education from '@/components/Education'
import WorkExperience from '@/components/WorkExperience'
import ResearchAndPublications from '@/components/ResearchAndPublications'
import Projects from '@/components/Projects'
import Contact from '@/components/Contact'

export default function Home() {
  return (
    <div className="min-h-screen">
      <Hero />
      <About />
      <Education />
      <WorkExperience />
      <ResearchAndPublications />
      <Projects />
      <Contact />
    </div>
  )
}
