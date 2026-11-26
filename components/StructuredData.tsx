import { siteConfig, SITE_URL } from '@/lib/site'
import type { Hero, Publication } from '@/lib/types'
import { splitAuthors } from '@/lib/bibtex'

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
    siteConfig.social.scholar,
  ].filter(Boolean)

  const person = {
    '@type': 'Person',
    '@id': personId,
    name: hero?.name || siteConfig.name,
    alternateName: [...siteConfig.alternateNames],
    url: SITE_URL,
    email: `mailto:${hero?.email || siteConfig.email}`,
    jobTitle: hero?.title || siteConfig.jobTitle,
    description: hero?.description || siteConfig.description,
    image: `${SITE_URL}${siteConfig.headshot}`,
    sameAs,
    worksFor: {
      '@type': 'CollegeOrUniversity',
      name: siteConfig.organization,
    },
    alumniOf: siteConfig.alumniOf.map((o) => ({ '@type': 'CollegeOrUniversity', name: o.name, url: o.url })),
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
    .map((pub) => {
      const doi = pub.doi && /^10\./.test(pub.doi.trim()) ? pub.doi.trim() : ''
      const link = doi ? `https://doi.org/${doi}` : pub.link && pub.link !== '#' ? pub.link : undefined
      const year = (pub.year?.match(/\d{4}/) ?? [])[0]
      return {
        '@type': 'ScholarlyArticle',
        headline: pub.title.trim(),
        name: pub.title.trim(),
        author: splitAuthors(pub.authors).map((name) => ({ '@type': 'Person', name })),
        ...(year ? { datePublished: year } : {}),
        ...(pub.journal ? { isPartOf: { '@type': 'Periodical', name: pub.journal.replace(/\s*\(Q\d\)/g, '').trim() } } : {}),
        ...(link ? { url: link } : {}),
        ...(doi ? { sameAs: link, identifier: { '@type': 'PropertyValue', propertyID: 'DOI', value: doi } } : {}),
        creativeWorkStatus: pub.status,
        creator: { '@id': personId },
      }
    })

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
