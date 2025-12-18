'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import type { Education, Course } from '@/lib/types'
import { iconMap } from '@/lib/icons'

const fadeIn = {
  initial: { opacity: 0, y: 14 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.35, ease: 'easeOut' },
}

// Fallback data - used when API is empty or fails
const fallbackEducation: Education[] = [
  {
    degree: 'Bachelor of Science in Computer Science and Engineering',
    institution: 'Daffodil International University (DIU)',
    location: 'Dhaka, Bangladesh',
    gpa: 'CGPA: 3.93/4.00',
    period: 'May 2022 – Present',
    highlights: ['Outstanding academic performance', 'Research-focused curriculum', 'Active in IEEE activities'],
    gradient: 'from-purple-500 to-pink-500',
    icon: 'GraduationCap',
    order: 0,
  },
  {
    program: 'Erasmus+ Exchange Semester',
    degree: 'Computer Science and Engineering',
    institution: 'Mälardalen University',
    location: 'Västerås, Sweden',
    period: 'Jan 2025 – Jun 2025',
    highlights: ['International academic exchange', 'Cross-cultural research collaboration', 'Global perspective on AI/ML'],
    gradient: 'from-blue-500 to-indigo-500',
    icon: 'Globe',
    order: 1,
  },
  {
    degree: 'HSC in Science',
    institution: 'Govt. Majid Memorial City College',
    location: 'Khulna, Bangladesh',
    gpa: 'GPA: 5.00/5.00',
    period: 'Jul 2017 – Dec 2019',
    highlights: ['Perfect GPA', 'Strong foundation in science and mathematics'],
    gradient: 'from-green-500 to-emerald-500',
    icon: 'Award',
    order: 2,
  },
]

const fallbackCourses: Course[] = [
  {
    title: 'Supervised Machine Learning: Regression and Classification',
    desc: 'Instructor: Andrew Ng – Coursera, DeepLearning.AI (2023–2024)',
    verifyLink: 'https://coursera.org/verify/RYF6AW9BPQLN',
    order: 0,
  },
  {
    title: 'CSE Fundamental',
    desc: 'Phitron.io (2022–2024). Includes DSA, OOP, DBMS, AWS, and ML foundations.',
    verifyLink: 'https://drive.google.com/file/d/1--Le7QE_IFJHKSGOUSexY25u8GXcPMDt/view?usp=sharing',
    order: 1,
  },
]

export default function Education() {
  const [education, setEducation] = useState<Education[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
    
    // Listen for content updates from admin panel
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
      const [eduRes, coursesRes] = await Promise.all([
        fetch('/api/education'),
        fetch('/api/courses'),
      ])
      
      if (eduRes.ok) {
        const eduData = await eduRes.json()
        // Use API data if available, otherwise use fallback
        setEducation(eduData && eduData.length > 0 ? eduData : fallbackEducation)
      } else {
        setEducation(fallbackEducation)
      }
      
      if (coursesRes.ok) {
        const coursesData = await coursesRes.json()
        // Use API data if available, otherwise use fallback
        setCourses(coursesData && coursesData.length > 0 ? coursesData : fallbackCourses)
      } else {
        setCourses(fallbackCourses)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      // Use fallback data on error
      setEducation(fallbackEducation)
      setCourses(fallbackCourses)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <section id="education" className="section-container bg-gradient-to-b from-gray-50 via-white to-gray-50">
        <div className="text-center py-12 text-gray-600">Loading...</div>
      </section>
    )
  }
  return (
    <section id="education" className="section-container bg-gradient-to-b from-gray-50 via-white to-gray-50 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-40 left-20 w-72 h-72 bg-primary-200/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-40 right-20 w-72 h-72 bg-primary-300/10 rounded-full blur-3xl"></div>
      </div>

      <motion.div className="relative z-10">
        <motion.div {...fadeIn} className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="gradient-text">Education</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Academic journey and international experiences
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto space-y-8">
          {education.map((edu, index) => (
            <motion.div
              key={index}
              {...fadeIn}
              className="group relative hover:-translate-y-1 transition-transform duration-300"
            >
              {/* Gradient glow */}
              <div className={`absolute inset-0 bg-gradient-to-r ${edu.gradient} rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500`}></div>

              <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-gray-100/50 transition-all duration-300 group-hover:shadow-2xl group-hover:border-primary-200/50">
                <div className="flex items-start gap-6">
                  <motion.div
                    className="flex-shrink-0"
                    whileHover={{ rotate: 360, scale: 1.15 }}
                    transition={{ duration: 0.6 }}
                  >
                    <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${edu.gradient} flex items-center justify-center shadow-lg`}>
                      {(() => {
                        const Icon = edu.icon && iconMap[edu.icon] ? iconMap[edu.icon] : iconMap.GraduationCap
                        return <Icon className="w-10 h-10 text-white" />
                      })()}
                    </div>
                  </motion.div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-2 text-gray-900">
                      {edu.degree || edu.program}
                    </h3>
                    <p className="text-primary-600 font-semibold mb-1">{edu.institution}</p>
                    <p className="text-gray-500 text-sm mb-2">{edu.location}</p>
                    {edu.gpa && (
                      <motion.p
                        initial={{ scale: 0.9 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true }}
                        className="text-gray-700 font-bold mb-2 text-lg"
                      >
                        {edu.gpa}
                      </motion.p>
                    )}
                    <p className="text-gray-500 mb-4">{edu.period}</p>
                    <ul className="space-y-2">
                      {edu.highlights.map((highlight, i) => (
                        <motion.li
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.1 }}
                          className="text-gray-600 flex items-start"
                        >
                          <span className={`text-transparent bg-clip-text bg-gradient-to-r ${edu.gradient} mr-2 font-bold`}>•</span>
                          {highlight}
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Courses & Certifications Section */}
        <motion.div {...fadeIn} className="mt-16 max-w-4xl mx-auto">
          <motion.div whileHover={{ scale: 1.01 }} className="card bg-gradient-to-br from-primary-50 via-white to-primary-50/50 border-primary-200/50 rounded-2xl p-6">
            <h3 className="text-2xl font-bold mb-6 text-gray-900">Courses & Certifications</h3>
            <div className="space-y-4">
              {courses.map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ x: 5 }}
                  className="relative"
                >
                  <div className="flex items-center justify-between p-4 rounded-xl bg-white/50 border border-gray-100 hover:border-primary-200 transition-all">
                    <div>
                      <h4 className="font-bold text-primary-600 mb-1">{item.title}</h4>
                      <p className="text-gray-600 text-sm">{item.desc}</p>
                    </div>

                    {item.verifyLink && (
                      <motion.a
                        href={item.verifyLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.1, rotate: 3 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex-shrink-0 px-4 py-1 bg-blue-600 text-white font-semibold rounded-xl shadow-md hover:bg-blue-700 transition-all"
                      >
                        Verify Certificate
                      </motion.a>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  )
}
