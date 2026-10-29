'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import type { Skill } from '@/lib/types'
import { categoryStyle } from '@/lib/skillCategories'
import { lastRowSpan } from '@/lib/layout'
import { staggerContainer, staggerItem, viewportOnce, springSnappy } from '@/lib/motion'
import dynamic from 'next/dynamic'
import { useTheme } from '@/components/ThemeProvider'

// 3D variant for the Multiverse theme, split out so other themes never load it.
const SkillsMV = dynamic(() => import('@/components/multiverse/SkillsMV'))

const fadeIn = {
  initial: { opacity: 0, y: 12 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.35, ease: 'easeOut' },
}


export default function Skills({ initialSkills }: { initialSkills?: Skill[] } = {}) {
  const seeded = initialSkills !== undefined
  const { theme } = useTheme()
  const [skills, setSkills] = useState<Skill[]>(seeded ? initialSkills ?? [] : [])
  const [loading, setLoading] = useState(!seeded)

  useEffect(() => {
    if (!seeded) fetchSkills()

    const handleUpdate = () => {
      fetchSkills()
    }
    window.addEventListener('content-updated', handleUpdate)

    return () => {
      window.removeEventListener('content-updated', handleUpdate)
    }
  }, [])

  const fetchSkills = async () => {
    try {
      const res = await fetch('/api/skills')
      const data = await res.json()
      setSkills(data || [])
    } catch (error) {
      console.error('Error fetching skills:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <section id="skills" className="section-container bg-theme-surface">
        <div className="text-center py-12 text-theme-text-muted">Loading...</div>
      </section>
    )
  }

  if (theme === 'multiverse') return <SkillsMV skills={skills} />

  // Group skills by category
  const skillsByCategory = skills.reduce((acc, skill) => {
    const category = skill.category || 'Other'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(skill)
    return acc
  }, {} as Record<string, Skill[]>)

  // Show empty state
  if (skills.length === 0) {
    return (
      <section id="skills" className="section-container bg-theme-surface relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-80 h-80 bg-primary-200/12 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary-300/12 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10">
          <motion.div {...fadeIn} className="text-center mb-12">
            <h2 className="text-5xl md:text-6xl font-bold mb-4">
              <span className="gradient-text">Skills</span>
            </h2>
            <p className="text-lg text-theme-text-muted">
              Technologies and tools I work with
            </p>
          </motion.div>
          <div className="bg-theme-surface/70 rounded-xl p-8 border border-theme-border shadow-sm max-w-2xl mx-auto">
            <p className="text-theme-text-muted">No skills added yet. Add skills from the Admin Panel.</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="skills" className="section-container bg-theme-surface relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-80 h-80 bg-primary-200/12 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary-300/12 rounded-full blur-3xl" />
      </div>

        <div className="relative z-10">
          <motion.div {...fadeIn} className="text-center mb-12">
            <h2 className="text-5xl md:text-6xl font-bold mb-4">
              <span className="gradient-text">Skills</span>
            </h2>
            <p className="text-lg text-theme-text-muted">
              Technologies and tools I work with
            </p>
          </motion.div>

        <motion.div
          variants={staggerContainer(0.08)}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {Object.entries(skillsByCategory).map(([category, categorySkills], i, all) => {
            const { icon: Icon, gradient } = categoryStyle(category)
            // each skills row holds a comma-separated list; show every entry as its own tag
            const tags = categorySkills.flatMap((skill) => skill.name.split(',').map((t) => t.trim()).filter(Boolean))

            return (
              <motion.div
                key={category}
                variants={staggerItem}
                whileHover={{ y: -6 }}
                transition={springSnappy}
                className={`group relative bg-theme-surface border border-theme-border rounded-2xl p-6 shadow-sm hover:shadow-xl transition-shadow ${lastRowSpan(i, all.length)}`}
              >
                <div className="flex items-center gap-4 mb-5">
                  <div className={`w-12 h-12 shrink-0 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-md`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-theme-text leading-snug">{category}</h3>
                </div>

                <ul className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <li
                      key={tag}
                      className="px-3 py-1.5 bg-theme-surface-elevated text-theme-text rounded-lg text-sm border border-theme-border"
                    >
                      {tag}
                    </li>
                  ))}
                </ul>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}

