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
  email: 'bappy15-6155@s.diu.edu.bd',
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
    scholar: 'https://scholar.google.com/citations?user=YT91vIgAAAAJ',
  },
  organization: 'Daffodil International University',
  // Every spelling of the name that appears in author lists, so search engines
  // can tie "Paul, S. P." and "Bappy, S. P." to the same person.
  alternateNames: ['Sarbajit Paul', 'S. P. Bappy', 'S. P. Paul', 'Paul Bappy, S.', 'Bappy'],
  alumniOf: [
    { name: 'Daffodil International University', url: 'https://daffodilvarsity.edu.bd' },
    { name: 'Mälardalen University', url: 'https://www.mdu.se' },
  ],
  // Shown under the title in the hero.
  location: 'Dhaka, Bangladesh',
  // Professional headshot shown in the hero (the travel photo stays in About).
  headshot: '/headshot.jpg',
  // One-line research statement shown under the name in the hero.
  researchLine:
    'I build explainable and privacy-preserving deep learning for medical and agricultural imaging, with a focus on federated learning across hospitals.',
  // Research agenda shown beside Fig. 2: the questions, not a list of fields.
  // Each note should point at work that exists (see publications).
  researchQuestions: [
    {
      q: 'How can hospitals train one diagnostic model without pooling patient data?',
      note: 'Federated learning with balanced aggregation and lightweight attention networks for medical image classification, and a review of privacy, robustness and defences in federated healthcare.',
    },
    {
      q: 'Can a model show why it reached a diagnosis, in a form a clinician can check?',
      note: 'Visual explanations built into hybrid CNNs for Lyme-disease rash, jackfruit-disease and mushroom classification.',
    },
    {
      q: 'How do we keep accuracy when classes are rare and compute is scarce?',
      note: 'Imbalance-aware learning for MRI-based Alzheimer’s classification, and resource-efficient models that narrow the performance–efficiency gap.',
    },
  ],
  // Availability badge in the hero. Set to '' to hide it.
  availability: 'Open to funded MRes/MSc and PhD positions',
  // Short proof points shown under the hero text.
  facts: [
    { value: '4', label: 'journal papers' },
    { value: '1', label: 'first-author paper in revision (PLOS ONE)' },
    { value: '3.95', label: 'CGPA, Batch First' },
    { value: 'Erasmus+', label: 'exchange, Sweden' },
  ],
  // "Latest" strip under the hero: newest first, keep it to three.
  news: [
    { date: '2026', text: 'Systematic review published in Discover Artificial Intelligence (Q1)' },
    { date: '2026', text: 'Alzheimer’s MRI paper received minor revision at PLOS ONE' },
    { date: 'Jul 2026', text: 'Joined Daffodil International University as Lecturer, CSE' },
  ],
  awards: [
    { title: 'Erasmus+ ICM Exchange Scholarship', detail: 'Mälardalen University, Sweden', year: '2025' },
    { title: 'Batch First, B.Sc. in CSE', detail: 'Daffodil International University (CGPA 3.95/4.00)', year: '2026' },
    { title: '29th Position, Take Off Programming Contest', detail: '', year: '2022' },
  ],
} as const

export type SiteConfig = typeof siteConfig
