import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPageBySlug } from '@/lib/db'
import { siteConfig } from '@/lib/site'
import Hero from '@/components/Hero'
import About from '@/components/About'
import Education from '@/components/Education'
import WorkExperience from '@/components/WorkExperience'
import ResearchAndPublications from '@/components/ResearchAndPublications'
import Projects from '@/components/Projects'
import Skills from '@/components/Skills'
import Contact from '@/components/Contact'
import PageContent from '@/components/PageContent'

// Content is admin-editable — render fresh, don't cache stale pages.
export const dynamic = 'force-dynamic'

// Slugs that map to an on-page section component rather than a DB page.
const sectionComponents: Record<string, React.ComponentType> = {
  home: Hero,
  about: About,
  education: Education,
  experience: WorkExperience,
  research: ResearchAndPublications,
  projects: Projects,
  skills: Skills,
  contact: Contact,
}

function normalizeSlug(slug: string[] | string | undefined): string {
  const joined = Array.isArray(slug) ? slug.join('/') : slug || ''
  return joined.trim().replace(/^\/+|\/+$/g, '').toLowerCase()
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string[] }
}): Promise<Metadata> {
  const slug = normalizeSlug(params.slug)
  if (!slug) return {}

  const page = await getPageBySlug(slug)
  if (!page) {
    return { title: 'Page not found', robots: { index: false, follow: false } }
  }

  return {
    title: page.title,
    description: page.meta_description || `${page.title} — ${siteConfig.name}`,
    alternates: { canonical: `/${slug}` },
    openGraph: {
      title: page.title,
      description: page.meta_description || `${page.title} — ${siteConfig.name}`,
      url: `/${slug}`,
      type: 'article',
    },
  }
}

export default async function DynamicPage({
  params,
}: {
  params: { slug: string[] }
}) {
  const slug = normalizeSlug(params.slug)
  if (!slug) notFound()

  const page = await getPageBySlug(slug)
  if (!page) notFound()

  // If this slug maps to an on-page section, render that component instead.
  const SectionComponent = sectionComponents[slug]
  if (SectionComponent) {
    return (
      <div className="min-h-screen">
        <SectionComponent />
      </div>
    )
  }

  return (
    <div className="min-h-screen py-16 bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <article className="bg-white rounded-xl shadow-sm p-8 border border-gray-200">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">{page.title}</h1>
          <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
            <PageContent content={page.content || ''} />
          </div>
        </article>
      </div>
    </div>
  )
}
