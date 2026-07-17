/**
 * Central site configuration — single source of truth for SEO metadata,
 * sitemap/robots, Open Graph, and JSON-LD structured data.
 *
 * Set NEXT_PUBLIC_SITE_URL in your environment (e.g. Vercel project settings)
 * to your real production domain. The fallback is only used in development.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || 'https://www.sarbajit.tech'
).replace(/\/$/, '')

export const siteConfig = {
  url: SITE_URL,
  name: 'Sarbajit Paul Bappy',
  jobTitle: 'Lecturer, Dept. of CSE @ Daffodil International University',
  shortTitle: 'AI/ML Researcher',
  title: 'Sarbajit Paul Bappy | AI/ML Researcher',
  description:
    'Sarbajit Paul Bappy — Lecturer at Daffodil International University and AI/ML researcher working on deep learning, computer vision, explainable AI, and federated learning for medical and agricultural imaging.',
  locale: 'en_US',
  email: 'sarbajit2001@gmail.com',
  keywords: [
    'Sarbajit Paul Bappy',
    'AI Researcher',
    'Machine Learning',
    'Deep Learning',
    'Computer Vision',
    'Explainable AI',
    'Federated Learning',
    'Medical Image Classification',
    'Daffodil International University',
  ],
  // Used for JSON-LD `sameAs` and social discovery.
  social: {
    github: 'https://github.com/SarbajitPbappy',
    linkedin: 'https://linkedin.com/in/iamsarbajit',
    orcid: 'https://orcid.org/0009-0006-7551-0461',
  },
  organization: 'Daffodil International University',
} as const

export type SiteConfig = typeof siteConfig
