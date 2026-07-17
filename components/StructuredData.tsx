import { siteConfig, SITE_URL } from '@/lib/site'
import type { Hero, Publication } from '@/lib/types'

/**
 * Server-rendered JSON-LD structured data. Emits a Person + WebSite graph so
 * search engines (and Google's knowledge panel) can understand who this site is
 * about, plus a ScholarlyArticle entry per publication for scholarly indexing.
 */
export default function StructuredData({
  hero,
  publications = [],
}: {
  hero?: Hero | null
  publications?: Publication[]
}) {
  const personId = `${SITE_URL}/#person`

  const sameAs = [
    hero?.github_url || siteConfig.social.github,
    hero?.linkedin_url || siteConfig.social.linkedin,
    siteConfig.social.orcid,
  ].filter(Boolean)

  const person = {
    '@type': 'Person',
    '@id': personId,
    name: hero?.name || siteConfig.name,
    url: SITE_URL,
    email: `mailto:${hero?.email || siteConfig.email}`,
    jobTitle: hero?.title || siteConfig.jobTitle,
    description: hero?.description || siteConfig.description,
    image: `${SITE_URL}/profile.jpg`,
    sameAs,
    worksFor: {
      '@type': 'CollegeOrUniversity',
      name: siteConfig.organization,
    },
    knowsAbout: [
      'Deep Learning',
      'Computer Vision',
      'Explainable AI',
      'Federated Learning',
      'Medical Image Classification',
      'Machine Learning',
    ],
  }

  const website = {
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: SITE_URL,
    name: siteConfig.name,
    description: siteConfig.description,
    inLanguage: 'en',
    publisher: { '@id': personId },
  }

  const articles = publications
    .filter((pub) => pub?.title)
    .map((pub) => ({
      '@type': 'ScholarlyArticle',
      headline: pub.title,
      name: pub.title,
      author: pub.authors,
      datePublished: pub.year,
      ...(pub.journal ? { publisher: pub.journal, isPartOf: pub.journal } : {}),
      ...(pub.doi
        ? { sameAs: `https://doi.org/${pub.doi}`, identifier: pub.doi }
        : pub.link && pub.link !== '#'
          ? { url: pub.link }
          : {}),
      creator: { '@id': personId },
    }))

  const graph = {
    '@context': 'https://schema.org',
    '@graph': [person, website, ...articles],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  )
}
