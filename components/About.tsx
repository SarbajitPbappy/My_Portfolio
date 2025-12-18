'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import type { About } from '@/lib/types'

const fadeIn = {
  initial: { opacity: 0, y: 14 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.35, ease: 'easeOut' },
}

// Fallback data
const fallbackAbout: About = {
  title: 'About Me',
  description: 'Final-year Computer Science and Engineering student at Daffodil International University with an Erasmus+ exchange at Mälardalen University, Sweden. I focus on deep learning, computer vision, and explainable AI for healthcare and agriculture, pairing academic rigor with clear communication.',
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

export default function About() {
  const [about, setAbout] = useState<About | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAbout()
    
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
        <div className="text-center py-12 text-gray-600">Loading...</div>
      </section>
    )
  }

  const aboutData = about || fallbackAbout
  return (
    <section id="about" className="section-container bg-gradient-to-b from-white via-gray-50 to-white relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-80 h-80 bg-primary-200/12 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-primary-300/12 rounded-full blur-3xl" />
      </div>

      <motion.div {...fadeIn} className="max-w-5xl mx-auto relative z-10 space-y-10">
        <div className="text-center">
          <h2 className="text-5xl md:text-6xl font-bold mb-4">
            {aboutData.title?.split(' ')[0] || 'About'} <span className="gradient-text">{aboutData.title?.split(' ').slice(1).join(' ') || 'Me'}</span>
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed max-w-3xl mx-auto">
            {aboutData.description}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          <motion.div {...fadeIn} className="space-y-4">
            <div className="frosted-card p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">What drives me</h3>
              <p className="text-gray-700 leading-relaxed">
                I love translating complex ideas into accessible, reliable systems. Whether mentoring students or iterating on research, I prioritize clarity, reproducibility, and meaningful impact.
              </p>
              {aboutData.quick_facts && aboutData.quick_facts.length > 0 && (
                <>
                  <div className="soft-divider my-4" />
                  <div className="space-y-2">
                    {aboutData.quick_facts.map((item, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <span className="pill bg-primary-50 text-primary-700 border-primary-100">{item.label}</span>
                        <p className="text-gray-700">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </motion.div>

          {aboutData.values && aboutData.values.length > 0 && (
            <motion.div {...fadeIn} transition={{ ...fadeIn.transition, delay: 0.1 }} className="grid gap-4">
              {aboutData.values.map((value, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ y: -4 }}
                  transition={{ delay: idx * 0.05 }}
                  className="frosted-card p-5"
                >
                  <p className="text-xs uppercase tracking-wide text-primary-600 font-semibold mb-1">Value {idx + 1}</p>
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">{value.title}</h4>
                  <p className="text-gray-700 leading-relaxed">{value.description}</p>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </motion.div>
    </section>
  )
}
