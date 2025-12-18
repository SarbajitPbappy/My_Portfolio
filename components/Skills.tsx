'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Code, Brain, Database, Cloud, Smartphone, Wrench } from 'lucide-react'
import { iconMap } from '@/lib/icons'
import type { Skill } from '@/lib/types'

const fadeIn = {
  initial: { opacity: 0, y: 12 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.35, ease: 'easeOut' },
}

// Category icons and gradients mapping
const categoryConfig: Record<string, { icon: React.ComponentType<any>, gradient: string }> = {
  'Programming Languages': { icon: Code, gradient: 'from-blue-500 to-cyan-500' },
  'Machine Learning & AI': { icon: Brain, gradient: 'from-purple-500 to-indigo-500' },
  'Computer Vision & Image Processing': { icon: Brain, gradient: 'from-blue-500 to-cyan-500' },
  'Deep Learning Frameworks': { icon: Brain, gradient: 'from-purple-500 to-pink-500' },
  'Data Science & Analysis': { icon: Database, gradient: 'from-green-500 to-emerald-500' },
  'Explainable AI': { icon: Brain, gradient: 'from-amber-500 to-orange-500' },
  'Mobile Development': { icon: Smartphone, gradient: 'from-emerald-500 to-teal-500' },
  'Backend & Cloud': { icon: Cloud, gradient: 'from-sky-500 to-blue-500' },
  'Databases': { icon: Database, gradient: 'from-indigo-500 to-purple-500' },
  'Software Engineering': { icon: Code, gradient: 'from-rose-500 to-pink-500' },
  'Tools & Utilities': { icon: Wrench, gradient: 'from-gray-500 to-gray-600' },
  'Domain Expertise': { icon: Brain, gradient: 'from-red-500 to-rose-500' },
}

export default function Skills() {
  const [skills, setSkills] = useState<Skill[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSkills()
    
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
      <section id="skills" className="section-container bg-white">
        <div className="text-center py-12 text-gray-600">Loading...</div>
      </section>
    )
  }

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
      <section id="skills" className="section-container bg-white relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-80 h-80 bg-primary-200/12 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary-300/12 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10">
          <motion.div {...fadeIn} className="text-center mb-12">
            <h2 className="text-5xl md:text-6xl font-bold mb-4">
              <span className="gradient-text">Skills</span>
            </h2>
            <p className="text-lg text-gray-600">
              Technologies and tools I work with
            </p>
          </motion.div>
          <div className="bg-white/70 rounded-xl p-8 border border-gray-200 shadow-sm max-w-2xl mx-auto">
            <p className="text-gray-500">No skills added yet. Add skills from the Admin Panel.</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="skills" className="section-container bg-white relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-80 h-80 bg-primary-200/12 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary-300/12 rounded-full blur-3xl" />
      </div>

        <div className="relative z-10">
          <motion.div {...fadeIn} className="text-center mb-12">
            <h2 className="text-5xl md:text-6xl font-bold mb-4">
              <span className="gradient-text">Skills</span>
            </h2>
            <p className="text-lg text-gray-600">
              Technologies and tools I work with
            </p>
          </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(skillsByCategory).map(([category, categorySkills], idx) => {
            const config = categoryConfig[category] || { icon: Code, gradient: 'from-gray-500 to-gray-600' }
            const Icon = config.icon
            
            return (
              <motion.div
                key={category}
                {...fadeIn}
                transition={{ ...fadeIn.transition, delay: idx * 0.05 }}
                className="group relative bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all hover:-translate-y-1"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${config.gradient} flex items-center justify-center mb-4 text-white shadow-lg`}>
                  <Icon className="w-7 h-7" />
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-4">{category}</h3>

                <div className="flex flex-wrap gap-2">
                  {categorySkills.map((skill) => {
                    const SkillIcon = skill.icon && iconMap[skill.icon] ? iconMap[skill.icon] : null
                    
                    return (
                      <motion.span
                        key={skill.id}
                        whileHover={{ scale: 1.05, y: -2 }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 text-gray-700 rounded-lg text-xs font-medium border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors"
                      >
                        {SkillIcon && <SkillIcon className="w-3.5 h-3.5" />}
                        <span>{skill.name}</span>
                        {skill.level && (
                          <span className="ml-1 text-xs text-gray-500">({skill.level})</span>
                        )}
                      </motion.span>
                    )
                  })}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

