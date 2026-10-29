'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ExternalLink, FileText } from 'lucide-react'
import type { ResearchArea, Publication } from '@/lib/types'
import { iconMap } from '@/lib/icons'
import { publicationStatus } from '@/lib/publicationStatus'
import AuthorList from '@/components/AuthorList'
import { staggerContainer, staggerItem, viewportOnce, springSnappy } from '@/lib/motion'
import dynamic from 'next/dynamic'
import { useTheme } from '@/components/ThemeProvider'

// 3D variant for the Multiverse theme, split out so other themes never load it.
const ResearchMV = dynamic(() => import('@/components/multiverse/ResearchMV'))

const fadeIn = {
  initial: { opacity: 0, y: 14 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.3, ease: 'easeOut' },
}

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
    link: 'https://symposium24.ieeecsbdc.org/papers/20-a-hybrid-deep-learning-approach-for-identifying-jackfruit-leaf-and-fruit-disease',
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
  const { theme } = useTheme()
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

  if (theme === 'multiverse') return <ResearchMV areas={researchAreas} publications={publications} />
  return (
    <section id="research" className="section-container relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-10 w-80 h-80 bg-primary-200/12 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-primary-300/12 rounded-full blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto space-y-12 relative z-10">
        <motion.div {...fadeIn} className="text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Research Interests & <span className="gradient-text">Publications</span>
          </h2>
          <p className="text-lg text-theme-text-muted">
            Areas of focus and key research contributions
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer(0.07)}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {researchAreas.map((area) => (
            <motion.div
              key={area.title}
              variants={staggerItem}
              whileHover={{ y: -6 }}
              transition={springSnappy}
              className="group bg-theme-surface border border-theme-border rounded-2xl p-5 shadow-sm hover:shadow-xl transition-shadow"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${area.gradient} flex items-center justify-center text-white mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3`}>
                {(() => {
                  const Icon = area.icon && iconMap[area.icon] ? iconMap[area.icon] : iconMap.Brain
                  return <Icon className="w-6 h-6" />
                })()}
              </div>
              <h3 className="text-xl font-semibold text-theme-text mb-2">{area.title}</h3>
              <p className="text-sm text-theme-text-muted leading-relaxed mb-3">{area.description}</p>
              <div className="flex flex-wrap gap-2">
                {area.technologies.map((tech) => (
                  <span
                    key={tech}
                    className="px-3 py-1 text-xs bg-theme-surface-elevated text-theme-text-muted border border-theme-border rounded-lg"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div id="publications" className="space-y-4 scroll-mt-24">
          <motion.div {...fadeIn} className="text-center">
            <h3 className="text-3xl font-bold text-theme-text mb-2">Selected Publications</h3>
            <p className="text-theme-text-muted">Recent publications and manuscripts in progress</p>
          </motion.div>

          <motion.div
            variants={staggerContainer(0.06)}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            className="space-y-4"
          >
            {publications.map((pub) => (
              <motion.div
                key={pub.title}
                variants={staggerItem}
                transition={springSnappy}
                className="bg-theme-surface border border-theme-border rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className={`hidden sm:flex w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br ${pub.gradient} items-center justify-center text-white`}>
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1 space-y-2">
                    <h4 className="text-lg font-semibold text-theme-text leading-snug">{pub.title.trim()}</h4>
                    <p className="text-sm text-theme-text-muted leading-relaxed">
                      <AuthorList authors={pub.authors} />
                    </p>
                    <p className="text-sm text-theme-text-muted">
                      {pub.journal && <em className="font-medium text-theme-primary">{pub.journal.trim()}</em>}
                      {pub.volume && <span>, {pub.volume}</span>}
                      {pub.year && <span> ({pub.year})</span>}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-semibold">
                      {(() => {
                        const { label, className, Icon } = publicationStatus(pub.status)
                        return (
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full ${className}`}>
                            <Icon className="w-3.5 h-3.5" /> {label}
                          </span>
                        )
                      })()}
                      {pub.type && (
                        <span className="px-2.5 py-1 rounded-full border border-theme-border font-medium text-theme-text-muted">{pub.type}</span>
                      )}
                      {pub.doi && /^10\./.test(pub.doi.trim()) && (
                        <a
                          href={`https://doi.org/${pub.doi.trim()}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 rounded-full bg-theme-primary/10 text-theme-primary hover:bg-theme-primary/20 transition-colors break-all"
                        >
                          DOI {pub.doi.trim()}
                        </a>
                      )}
                    </div>
                  </div>
                  {pub.link && pub.link !== '#' && (
                    <a
                      href={pub.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Open publication: ${pub.title}`}
                      title={`Open publication: ${pub.title}`}
                      className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-lg text-theme-primary hover:bg-theme-primary/10 transition-colors"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}

