'use client'

import { useEffect, useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { toBibtex } from '@/lib/bibtex'
import { siteConfig } from '@/lib/site'
import type { ResearchArea, Publication } from '@/lib/types'
import { toCv, type CvEntry } from '@/lib/publications'
import AuthorList from '@/components/AuthorList'
import FederatedFigure from '@/components/figures/FederatedFigure'

// Fallback research areas
const fallbackResearchAreas: ResearchArea[] = [
  {
    icon: 'Brain',
    title: 'Deep Learning',
    description: 'Designing architectures for complex pattern recognition, focusing on hybrid models that blend multiple neural approaches.',
    technologies: ['CNN', 'Transfer Learning', 'Hybrid Models'],
    gradient: 'from-purple-500 to-indigo-500',
    order: 0,
  },
  {
    icon: 'Eye',
    title: 'Computer Vision',
    description: 'Image processing and visual pattern recognition for medical imaging, agricultural monitoring, and automated analysis.',
    technologies: ['Image Processing', 'OpenCV', 'Feature Extraction'],
    gradient: 'from-blue-500 to-cyan-500',
    order: 1,
  },
  {
    icon: 'Microscope',
    title: 'Medical Image Analysis',
    description: 'AI-driven disease detection, diagnosis support, and treatment planning across varied imaging modalities.',
    technologies: ['Diagnostic AI', 'Healthcare ML', 'Disease Detection'],
    gradient: 'from-red-500 to-rose-500',
    order: 2,
  },
  {
    icon: 'Leaf',
    title: 'Agricultural Image Analysis',
    description: 'Computer vision for crop disease detection, plant health monitoring, and sustainable farming insights.',
    technologies: ['Agricultural AI', 'Crop Monitoring', 'Disease Classification'],
    gradient: 'from-green-500 to-emerald-500',
    order: 3,
  },
  {
    icon: 'Sparkles',
    title: 'Explainable AI',
    description: 'Interpretability methods and visual explanations that make model decisions transparent and trustworthy.',
    technologies: ['XAI', 'Model Interpretability', 'Visualization'],
    gradient: 'from-amber-500 to-orange-500',
    order: 4,
  },
  {
    icon: 'Layers',
    title: 'Hybrid Deep Learning',
    description: 'Combining multiple deep learning approaches for stronger classification and detection performance.',
    technologies: ['Ensemble Learning', 'Architecture Design', 'Multi-Modal'],
    gradient: 'from-pink-500 to-rose-500',
    order: 5,
  },
]

// Fallback publications
const fallbackPublications: Publication[] = [
  {
    title: 'SkinVisualNet: A Hybrid Deep Learning Approach Leveraging Explainable Models for Identifying Lyme Disease from Skin Rash Images',
    authors: 'Sohel, A., Turjy, R. C. D., Bappy, S. P., Assaduzzaman, M., Marouf, A. A., Rokne, J. G., & Alhajj, R.',
    status: 'Published',
    journal: 'Machine Learning and Knowledge Extraction',
    year: '2025',
    doi: '10.3390/make7040157',
    type: 'Journal Article (Q1)',
    link: 'https://doi.org/10.3390/make7040157',
    gradient: 'from-green-500 to-emerald-500',
    order: 0,
  },
  {
    title: 'JackVisualNet: A Fine-Tuned Hybrid Deep Learning Model for Jackfruit Disease Classification with Explainable AI',
    authors: 'Bappy, S. P. et al.',
    status: 'Major Revision',
    journal: 'PeerJ Computer Science (Q1)',
    year: '2025',
    type: 'Journal Article',
    link: '#',
    gradient: 'from-yellow-500 to-amber-500',
    order: 1,
  },
  {
    title: 'A Hybrid Deep Learning Approach for Identifying Jackfruit Leaf and Fruit Disease',
    authors: 'Paul, S., R.C.D. Turjy, A. Sohel',
    status: 'Published (Abstract)',
    journal: 'IEEE CS BDC Symposium 2024',
    year: '2024',
    type: 'Conference Proceedings',
    volume: 'Vol. 3',
    link: 'https://symposium24.ieeecsbdc.org/papers/20-a-hybrid-deep-learning-approach-for-identifying-jackfruit-leaf-and-fruit-disease',
    gradient: 'from-blue-500 to-cyan-500',
    order: 2,
  },
  {
    title: 'A Hybrid Deep Learning Approach for Identifying Lyme Disease from Skin Rash Images',
    authors: 'R.C.D. Turjy, Paul, S., A. Sohel',
    status: 'Published (Abstract)',
    journal: 'IEEE CS BDC Symposium 2024',
    year: '2024',
    type: 'Conference Proceedings',
    volume: 'Vol. 3',
    link: 'https://symposium24.ieeecsbdc.org/papers/21-a-hybrid-deep-learning-approach-for-identifying-lyme-disease-from-skin-rash-images',
    gradient: 'from-purple-500 to-pink-500',
    order: 3,
  },
]

export default function ResearchAndPublications({
  initialResearchAreas,
  initialPublications,
}: {
  initialResearchAreas?: ResearchArea[]
  initialPublications?: Publication[]
} = {}) {
  const seeded = initialResearchAreas !== undefined || initialPublications !== undefined
  const [researchAreas, setResearchAreas] = useState<ResearchArea[]>(
    initialResearchAreas !== undefined
      ? initialResearchAreas.length > 0
        ? initialResearchAreas
        : fallbackResearchAreas
      : []
  )
  const [publications, setPublications] = useState<Publication[]>(
    initialPublications !== undefined
      ? initialPublications.length > 0
        ? initialPublications
        : fallbackPublications
      : []
  )
  const [loading, setLoading] = useState(!seeded)

  useEffect(() => {
    if (!seeded) fetchData()

    const handleUpdate = () => {
      fetchData()
    }
    window.addEventListener('content-updated', handleUpdate)

    return () => {
      window.removeEventListener('content-updated', handleUpdate)
    }
  }, [])

  const fetchData = async () => {
    try {
      const [areasRes, pubsRes] = await Promise.all([
        fetch('/api/research-areas'),
        fetch('/api/publications'),
      ])
      const areasData = await areasRes.json()
      const pubsData = await pubsRes.json()
      setResearchAreas(areasData && areasData.length > 0 ? areasData : fallbackResearchAreas)
      setPublications(pubsData && pubsData.length > 0 ? pubsData : fallbackPublications)
    } catch (error) {
      console.error('Error fetching data:', error)
      setResearchAreas(fallbackResearchAreas)
      setPublications(fallbackPublications)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <section id="research" className="section-container">
        <div className="text-center py-12 text-theme-text-muted">Loading...</div>
      </section>
    )
  }

  const cv = toCv(publications)

  return (
    <section id="research" className="section-container !py-16 sm:!py-20">
      <div className="max-w-6xl mx-auto">
        <SectionHead title="Research" note="Questions I work on" />

        <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-10 lg:gap-14 items-start">
          <div>
            <ol className="space-y-7">
              {siteConfig.researchQuestions.map((r) => (
                <li key={r.q} className="border-l-2 border-theme-primary/70 pl-5">
                  <h3 className="text-xl md:text-[1.4rem] leading-snug text-theme-text">{r.q}</h3>
                  <p className="mt-2 text-[0.95rem] text-theme-text-muted leading-relaxed">{r.note}</p>
                </li>
              ))}
            </ol>
            {researchAreas.length > 0 && (
              <p className="mt-8 text-sm text-theme-text-muted leading-relaxed">
                <span className="font-mono text-[11px] uppercase tracking-[0.14em] mr-2">Areas</span>
                {researchAreas.map((a) => a.title).join(' · ')}
              </p>
            )}
          </div>
          <FederatedFigure />
        </div>

        <div id="publications" className="scroll-mt-24 mt-20">
          <SectionHead
            title="Publications"
            note={
              <a
                href={siteConfig.social.scholar}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 hover:text-theme-primary transition-colors"
              >
                Google Scholar <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            }
          />
          <p className="-mt-4 mb-8 text-sm text-theme-text-muted">
            <strong className="font-semibold text-theme-text">Bold</strong> marks me · † equal contribution · newest first
          </p>

          <div className="space-y-12">
            {cv.map((group) => (
              <section key={group.id} aria-labelledby={`pubs-${group.id}`}>
                <h3
                  id={`pubs-${group.id}`}
                  className="flex items-baseline justify-between gap-4 border-b border-theme-text/80 pb-2 mb-1 text-lg text-theme-text"
                >
                  {group.title}
                  <span className="font-mono text-xs text-theme-text-muted tabular-nums">{group.entries.length}</span>
                </h3>
                <ol>
                  {group.entries.map((e) => (
                    <CvItem key={e.key} entry={e} />
                  ))}
                </ol>
              </section>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function SectionHead({ title, note }: { title: string; note?: React.ReactNode }) {
  return (
    <div className="flex items-end justify-between gap-4 mb-10">
      <h2 className="text-4xl md:text-5xl text-theme-text">{title}</h2>
      {note && <div className="font-mono text-xs text-theme-text-muted pb-2">{note}</div>}
    </div>
  )
}

function CvItem({ entry: e }: { entry: CvEntry }) {
  const { pub } = e
  const title = pub.title.trim().replace(/\.$/, '')
  return (
    <li className="grid grid-cols-[2.75rem_minmax(0,1fr)] sm:grid-cols-[3.5rem_minmax(0,1fr)] gap-x-2 py-5 border-b border-theme-border">
      <span className="font-mono text-xs text-theme-text-muted pt-1 tabular-nums">[{e.key}]</span>
      <div className="min-w-0">
        <h4 className="text-[1.15rem] leading-snug text-theme-text">
          {e.href ? (
            <a
              href={e.href}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-theme-primary underline decoration-theme-border underline-offset-4 hover:decoration-theme-primary transition-colors"
            >
              {title}
            </a>
          ) : (
            title
          )}
        </h4>
        <p className="mt-1.5 text-sm text-theme-text-muted leading-relaxed">
          <AuthorList authors={pub.authors} />
        </p>
        <p className="mt-1 text-sm text-theme-text">
          {e.inProgress && <span className="text-theme-text-muted">{pub.status.trim()}{e.venue ? ', ' : ''}</span>}
          {e.venue && <em>{e.venue}</em>}
          {pub.volume && <span className="text-theme-text-muted">, {pub.volume}</span>}
          {pub.year && !e.inProgress && <span className="text-theme-text-muted"> ({pub.year})</span>}
        </p>
        <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] text-theme-text-muted">
          {e.quartile && <span>{e.quartile}</span>}
          {e.firstAuthor && <span>first author</span>}
          {pub.status === 'Accepted' && <span>accepted</span>}
          {pub.status === 'Published (Abstract)' && <span>abstract</span>}
          {e.equalContribution && !/equal contribution/i.test(pub.authors) && <span>† equal contribution</span>}
          {e.doi && (
            <a href={`https://doi.org/${e.doi}`} target="_blank" rel="noopener noreferrer" className="hover:text-theme-primary break-all">
              doi:{e.doi}
            </a>
          )}
          <CopyBibtex pub={pub} />
        </p>
      </div>
    </li>
  )
}

function CopyBibtex({ pub }: { pub: Publication }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(toBibtex(pub))
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      // Clipboard blocked: nothing useful to do silently.
    }
  }
  return (
    <button
      type="button"
      onClick={copy}
      aria-label={`Copy BibTeX for ${pub.title}`}
      className="hover:text-theme-primary transition-colors"
    >
      {copied ? 'copied ✓' : 'bibtex'}
    </button>
  )
}
