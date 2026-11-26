'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { iconMap, Github } from '@/lib/icons'
import Link from 'next/link'
import type { Project } from '@/lib/types'
import { lastRowSpan } from '@/lib/layout'
import { staggerContainer, staggerItem, viewportOnce, springSnappy } from '@/lib/motion'
import { useTheme } from '@/components/ThemeProvider'


const fadeIn = {
  initial: { opacity: 0, y: 12 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.35, ease: 'easeOut' },
}

// Use centralized icon mapping from lib/icons.ts

// Fallback projects
const fallbackProjects: Project[] = [
  {
    icon: 'Cloud',
    title: 'Rainfall and Temperature Prediction',
    description: 'ML-based analysis for climate and agriculture forecasting. Developed machine learning models to predict rainfall patterns and temperature variations, supporting agricultural planning and climate analysis.',
    technologies: ['Machine Learning', 'Time Series', 'Climate Analysis', 'Python'],
    github: 'https://github.com/SarbajitPbappy/RainfallML',
    category: 'Machine Learning',
    gradient: 'from-blue-500 to-cyan-500',
    order: 0,
  },
  {
    icon: 'Database',
    title: 'Population Analysis with MySQL',
    description: 'Demographic and urbanization insights using advanced SQL queries. Analyzed large-scale population datasets to extract meaningful insights about demographic trends and urbanization patterns.',
    technologies: ['MySQL', 'SQL', 'Data Analysis', 'Database Design'],
    github: 'https://github.com/SarbajitPbappy/Project-ONE',
    category: 'Data Analysis',
    gradient: 'from-purple-500 to-pink-500',
    order: 1,
  },
  {
    icon: 'Mail',
    title: 'Email Spam Classification',
    description: 'ML models for spam filtering using Random Forest and Decision Trees. Built and compared multiple machine learning algorithms to accurately classify emails as spam or legitimate messages.',
    technologies: ['Random Forest', 'Decision Trees', 'NLP', 'Classification'],
    github: 'https://github.com/SarbajitPbappy/Project-NOT',
    category: 'Machine Learning',
    gradient: 'from-green-500 to-emerald-500',
    order: 2,
  },
  {
    icon: 'Code',
    title: 'Medical Image Classification Projects',
    description: 'Deep learning models for disease detection from medical images. Includes projects on skin disease classification, medical image analysis, and explainable AI implementations.',
    technologies: ['Deep Learning', 'CNN', 'Medical Imaging', 'TensorFlow', 'Keras'],
    github: 'https://github.com/SarbajitPbappy/Lyme-Disease',
    category: 'Deep Learning',
    gradient: 'from-red-500 to-rose-500',
    order: 3,
  },
  {
    icon: 'Split',
    title: 'Splitter – Expense Splitting & Personal Finance Tracker',
    description: 'Academic project developed using Flutter (Cupertino) and Firebase for group expense splitting and personal finance tracking. Includes trip and bachelor mess management, optimized settlement algorithms, real-time synchronization, analytics dashboards, meal tracking, and automated PDF report generation.',
    technologies: [
      'Flutter',
      'Dart',
      'Firebase',
      'Cloud Firestore',
      'Firebase Auth',
      'Cupertino UI',
      'Provider',
      'GoRouter',
      'PDF Generation'
    ],
    github: 'https://github.com/SarbajitPbappy/MAD-Project',
    category: 'Academic Project',
    gradient: 'from-emerald-500 to-teal-500',
    order: 4,
  },
]

const OTHER_CATEGORIES = ['Web Application', 'Academic Project', 'Data Analysis']

export default function Projects({ initialProjects }: { initialProjects?: Project[] } = {}) {
  const seeded = initialProjects !== undefined
  const { theme } = useTheme()
  const [projects, setProjects] = useState<Project[]>(
    seeded ? (initialProjects!.length > 0 ? initialProjects! : fallbackProjects) : []
  )
  const [loading, setLoading] = useState(!seeded)

  useEffect(() => {
    if (!seeded) fetchProjects()

    const handleUpdate = () => {
      fetchProjects()
    }
    window.addEventListener('content-updated', handleUpdate)

    return () => {
      window.removeEventListener('content-updated', handleUpdate)
    }
  }, [])

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects')
      const data = await res.json()
      setProjects(data && data.length > 0 ? data : fallbackProjects)
    } catch (error) {
      console.error('Error fetching projects:', error)
      setProjects(fallbackProjects)
    } finally {
      setLoading(false)
    }
  }

  // Research-relevant work leads; general web/database coursework is folded away.
  const featured = projects.filter((p) => !OTHER_CATEGORIES.includes(p.category))
  const other = projects.filter((p) => OTHER_CATEGORIES.includes(p.category))

  if (loading) {
    return (
      <section id="projects" className="section-container bg-theme-surface">
        <div className="text-center py-12 text-theme-text-muted">Loading...</div>
      </section>
    )
  }

  return (
    <section id="projects" className="section-container bg-theme-surface relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-80 h-80 bg-primary-200/12 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary-300/12 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        <motion.div {...fadeIn} className="section-head text-center mb-12">
          <h2 className="text-5xl md:text-6xl font-bold mb-4">
            <span className="gradient-text">Projects</span>
          </h2>
          <p className="text-lg text-theme-text-muted">
            Research software in machine learning, medical imaging and explainable AI
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer(0.08)}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="grid md:grid-cols-2 gap-6"
        >
          {featured.map((project, i) => (
            <motion.div
              key={project.title}
              variants={staggerItem}
              whileHover={{ y: -8 }}
              transition={springSnappy}
              className={`group relative flex flex-col bg-theme-surface border border-theme-border rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-xl transition-shadow ${lastRowSpan(i, featured.length, 2)}`}
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${project.gradient} flex items-center justify-center mb-4 text-white shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3`}>
                {(() => {
                  const Icon = project.icon && iconMap[project.icon] ? iconMap[project.icon] : iconMap.Code
                  return <Icon className="w-7 h-7" />
                })()}
              </div>

              <div className="flex items-start justify-between gap-3 mb-3">
                <h3 className="text-xl font-bold text-theme-text leading-tight flex-1">{project.title}</h3>
                <span className="shrink-0 px-2.5 py-1 rounded-full border border-theme-border text-xs font-medium text-theme-text-muted whitespace-nowrap">
                  {project.category}
                </span>
              </div>

              <p className="text-theme-text-muted mb-4 leading-relaxed text-sm">{project.description}</p>

              <div className="flex flex-wrap gap-2 mb-4">
                {project.technologies.map((tech) => (
                  <span
                    key={tech}
                    className="px-3 py-1.5 bg-theme-surface-elevated text-theme-text-muted rounded-lg text-xs font-medium border border-theme-border"
                  >
                    {tech}
                  </span>
                ))}
              </div>

              {project.github && (
                <div className="flex gap-2 mt-auto pt-4 border-t border-theme-border">
                  <Link
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-theme-primary hover:text-theme-primary font-semibold text-sm"
                  >
                    <Github className="w-5 h-5" />
                    <span>View on GitHub</span>
                  </Link>
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>

        {other.length > 0 && (
          <details className="mt-10 group/other rounded-2xl border border-theme-border bg-theme-surface">
            <summary className="cursor-pointer list-none px-6 py-4 flex items-center justify-between gap-3 font-semibold text-theme-text">
              <span>Other software projects ({other.length})</span>
              <span className="text-sm font-medium text-theme-text-muted group-open/other:hidden">Show</span>
              <span className="text-sm font-medium text-theme-text-muted hidden group-open/other:inline">Hide</span>
            </summary>
            <ul className="divide-y divide-theme-border border-t border-theme-border">
              {other.map((project) => (
                <li key={project.title} className="px-6 py-4 flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-theme-text">{project.title}</p>
                    <p className="text-sm text-theme-text-muted">{project.technologies.slice(0, 5).join(' · ')}</p>
                  </div>
                  {project.github && (
                    <Link
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-theme-primary"
                    >
                      <Github className="w-4 h-4" /> GitHub
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </details>
        )}

        <motion.div {...fadeIn} className="mt-12 text-center">
          <Link
            href="https://github.com/SarbajitPbappy"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-theme-primary text-theme-on-primary px-6 py-3 rounded-xl hover:bg-theme-primary-hover transition-colors font-semibold shadow-md"
          >
            <Github className="w-5 h-5" />
            <span>More on GitHub</span>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
