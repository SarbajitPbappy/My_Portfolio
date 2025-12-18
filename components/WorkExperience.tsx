'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Award, Users, BookOpen, Briefcase } from 'lucide-react'
import type { WorkExperience } from '@/lib/types'

const fadeIn = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.3, ease: 'easeOut' },
}

// Icon map
const iconMap: Record<string, any> = {
  BookOpen,
  Users,
  Briefcase,
  Award,
}

// Fallback work experience
const fallbackWorkExperience: WorkExperience[] = [
  {
    icon: 'BookOpen',
    title: 'Teaching Assistant',
    organization: 'Daffodil International University',
    period: 'October 2025 – Present',
    description: 'Supporting undergraduate courses, labs, and evaluation under Prof. Dr. Fernaz Narin Nur. Mentoring students and assisting research activities.',
    gradient: 'from-blue-500 to-cyan-500',
    type: 'Work',
    order: 0,
  },
  {
    icon: 'Users',
    title: 'IEEE Vice Chair (Technical)',
    organization: 'IEEE DIU SB CS Chapter',
    period: '2024 – 2025',
    description: 'Led technical initiatives and events for the IEEE Student Branch Computer Science Chapter.',
    gradient: 'from-purple-500 to-pink-500',
    type: 'Volunteering',
    order: 1,
  },
  {
    icon: 'Briefcase',
    title: 'Secretary',
    organization: 'IEEE DIU SB WIE Affinity Group',
    period: '2024 – 2025',
    description: 'Coordinated operations and events for the Women in Engineering Affinity Group.',
    gradient: 'from-green-500 to-emerald-500',
    type: 'Volunteering',
    order: 2,
  },
  {
    icon: 'Award',
    title: 'Campus Organizer',
    organization: 'Brikkhobondhu',
    period: '2024',
    description: 'Organized campus engagement programs and community events.',
    gradient: 'from-amber-500 to-orange-500',
    type: 'Volunteering',
    order: 3,
  },
]

export default function WorkExperience() {
  const [roles, setRoles] = useState<WorkExperience[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWorkExperience()
    
    const handleUpdate = () => {
      fetchWorkExperience()
    }
    window.addEventListener('content-updated', handleUpdate)
    
    return () => {
      window.removeEventListener('content-updated', handleUpdate)
    }
  }, [])

  const fetchWorkExperience = async () => {
    try {
      const res = await fetch('/api/work-experience')
      const data = await res.json()
      setRoles(data && data.length > 0 ? data : fallbackWorkExperience)
    } catch (error) {
      console.error('Error fetching work experience:', error)
      setRoles(fallbackWorkExperience)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <section id="experience" className="section-container">
        <div className="text-center py-12 text-gray-600">Loading...</div>
      </section>
    )
  }
  return (
    <section id="experience" className="section-container bg-gradient-to-b from-white via-gray-50 to-white relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-10 -left-10 w-80 h-80 bg-primary-200/12 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary-300/12 rounded-full blur-3xl" />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        <motion.div {...fadeIn} className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Work Experience & <span className="gradient-text">Volunteering</span>
          </h2>
          <p className="text-lg text-gray-600">
            Professional roles, leadership, and community involvement
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {roles.map((role, idx) => (
            <motion.div
              key={role.title}
              {...fadeIn}
              transition={{ ...fadeIn.transition, delay: idx * 0.05 }}
              className="group relative overflow-hidden rounded-2xl p-[1px] bg-gradient-to-r from-white via-primary-100/30 to-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
            >
              <div className="relative rounded-2xl bg-white/75 backdrop-blur-xl border border-white/60 p-6 h-full">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${role.gradient} flex items-center justify-center text-white shadow-md`}>
                    {(() => {
                      const Icon = role.icon && iconMap[role.icon] ? iconMap[role.icon] : Briefcase
                      return <Icon className="w-6 h-6" />
                    })()}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">{role.title}</h3>
                        <p className="text-primary-600 font-medium">{role.organization}</p>
                      </div>
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full shadow-sm ${
                          role.type === 'Work'
                            ? 'bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-800'
                            : 'bg-gradient-to-r from-sky-100 to-blue-200 text-blue-800'
                        }`}
                      >
                        {role.type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{role.period}</p>
                    <p className="text-gray-700 text-sm leading-relaxed">{role.description}</p>
                  </div>
                </div>

                <div className="mt-4 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700">Leadership</span>
                  <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700">Impact</span>
                  <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700">Collaboration</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

