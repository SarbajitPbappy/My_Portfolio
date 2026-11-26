'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import type { About } from '@/lib/types'
import { useTheme } from '@/components/ThemeProvider'


const fadeIn = {
  initial: { opacity: 0, y: 14 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.35, ease: 'easeOut' },
}

// Fallback data
const fallbackAbout: About = {
  title: 'About Me',
  description: 'Lecturer in the Department of CSE at Daffodil International University and an AI/ML researcher (CGPA 3.95/4.00, Batch First) with Erasmus+ exchange experience at Mälardalen University, Sweden. I focus on deep learning, computer vision, explainable AI, and federated learning for healthcare and agriculture, pairing academic rigor with clear communication.',
  values: [
    {
      title: 'Research-Driven',
      description: 'I connect theory with practice, validating ideas through experiments, benchmarks, and peer feedback.',
    },
    {
      title: 'Systems Thinker',
      description: 'I design end-to-end solutions: data readiness, modeling, evaluation, deployment, and monitoring.',
    },
    {
      title: 'Community-Focused',
      description: 'Teaching, mentoring, and leading IEEE initiatives keep me grounded and collaborative.',
    },
  ],
  quick_facts: [
    { label: 'Specialties', value: 'Deep Learning, Computer Vision, XAI' },
    { label: 'Stack', value: 'PyTorch, TensorFlow, Python, SQL' },
    { label: 'Current Goal', value: 'Graduate studies in AI/ML research' },
  ],
  order: 0,
}

export default function About({
  initialData,
  profileImageUrl,
}: {
  initialData?: About | null
  // only the Multiverse layout shows the portrait here
  profileImageUrl?: string
} = {}) {
  const seeded = initialData !== undefined
  const { theme } = useTheme()
  const [about, setAbout] = useState<About | null>(seeded ? initialData ?? null : null)
  const [loading, setLoading] = useState(!seeded)

  useEffect(() => {
    if (!seeded) fetchAbout()

    const handleUpdate = () => {
      fetchAbout()
    }
    window.addEventListener('content-updated', handleUpdate)

    return () => {
      window.removeEventListener('content-updated', handleUpdate)
    }
  }, [])

  const fetchAbout = async () => {
    try {
      const res = await fetch('/api/about')
      const data = await res.json()
      setAbout(data || fallbackAbout)
    } catch (error) {
      console.error('Error fetching about:', error)
      setAbout(fallbackAbout)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <section id="about" className="section-container">
        <div className="text-center py-12 text-theme-text-muted">Loading...</div>
      </section>
    )
  }

  const aboutData = about || fallbackAbout
  return (
    <section id="about" className="section-container relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-80 h-80 bg-primary-200/12 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-primary-300/12 rounded-full blur-3xl" />
      </div>

      <motion.div {...fadeIn} className="max-w-5xl mx-auto relative z-10 space-y-10">
        <div className="about-head text-center">
          <h2 className="text-5xl md:text-6xl font-bold mb-4">
            {aboutData.title?.split(' ')[0] || 'About'} <span className="gradient-text">{aboutData.title?.split(' ').slice(1).join(' ') || 'Me'}</span>
          </h2>
          <p className="text-lg text-theme-text-muted leading-relaxed max-w-3xl mx-auto text-left sm:text-center">
            {aboutData.description}
          </p>
        </div>

        {aboutData.quick_facts && aboutData.quick_facts.length > 0 && (
          <motion.div {...fadeIn} className="frosted-card p-6 max-w-3xl mx-auto">
            <dl className="grid grid-cols-[auto_minmax(0,1fr)] items-baseline gap-x-4 gap-y-3">
              {aboutData.quick_facts.map((item, i) => (
                <div key={i} className="contents">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-theme-primary whitespace-nowrap">{item.label}</dt>
                  <dd className="text-theme-text-muted">{item.value}</dd>
                </div>
              ))}
            </dl>
          </motion.div>
        )}
      </motion.div>
    </section>
  )
}
