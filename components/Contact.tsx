'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Send } from 'lucide-react'
import { iconMap } from '@/lib/icons'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { contactSchema, sendContactMessage, type ContactFormData } from '@/lib/contactForm'
import Link from 'next/link'
import { useTheme } from '@/components/ThemeProvider'


const fadeIn = {
  initial: { opacity: 0, y: 14 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.35, ease: 'easeOut' },
}

// Use centralized icon mapping from lib/icons.ts

// Fallback contact info
const fallbackContactInfo = [
  { icon: 'Mail', text: 'bappy15-6155@s.diu.edu.bd', href: 'mailto:bappy15-6155@s.diu.edu.bd', gradient: 'from-blue-500 to-cyan-500', is_external: false },
  { icon: 'Mail', text: 'bappy15-6155@s.diu.edu.bd', href: 'mailto:bappy15-6155@s.diu.edu.bd', gradient: 'from-purple-500 to-pink-500', is_external: false },
  { icon: 'Phone', text: '+880 1315352270', href: 'tel:+8801315352270', gradient: 'from-green-500 to-emerald-500', is_external: false },
  { icon: 'Github', text: 'github.com/SarbajitPbappy', href: 'https://github.com/SarbajitPbappy', gradient: 'from-gray-700 to-gray-900', is_external: true },
  { icon: 'Linkedin', text: 'linkedin.com/in/iamsarbajit', href: 'https://linkedin.com/in/iamsarbajit', gradient: 'from-blue-600 to-blue-800', is_external: true },
]

type ContactInfoItem = { icon: string; text: string; href: string; gradient: string; is_external: boolean }

export default function Contact({ initialContactInfo }: { initialContactInfo?: ContactInfoItem[] } = {}) {
  const seeded = initialContactInfo !== undefined
  const { theme } = useTheme()
  const [contactInfo, setContactInfo] = useState<ContactInfoItem[]>(
    seeded ? (initialContactInfo!.length > 0 ? initialContactInfo! : fallbackContactInfo) : []
  )
  const [loading, setLoading] = useState(!seeded)

  useEffect(() => {
    if (!seeded) fetchContactInfo()

    const handleUpdate = () => {
      fetchContactInfo()
    }
    window.addEventListener('content-updated', handleUpdate)

    return () => {
      window.removeEventListener('content-updated', handleUpdate)
    }
  }, [])

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  })

  const fetchContactInfo = async () => {
    try {
      const res = await fetch('/api/contact-info')
      const data = await res.json()
      setContactInfo(data && data.length > 0 ? data : fallbackContactInfo)
    } catch (error) {
      console.error('Error fetching contact info:', error)
      setContactInfo(fallbackContactInfo)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <section id="contact" className="section-container">
        <div className="text-center py-12 text-theme-text-muted">Loading...</div>
      </section>
    )
  }


  const onSubmit = async (data: ContactFormData) => {
    if (await sendContactMessage(data)) reset()
  }

  return (
    <section id="contact" className="section-container relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-primary-200/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary-300/10 rounded-full blur-3xl"></div>
      </div>

      <motion.div className="relative z-10">
        <motion.div {...fadeIn} className="section-head text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            Get In <span className="gradient-text">Touch</span>
          </h2>
          <p className="text-xl text-theme-text-muted max-w-2xl mx-auto">
            Let's collaborate on research or discuss opportunities
          </p>
        </motion.div>

        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12">
          {/* Contact Info */}
          <motion.div
            {...fadeIn}
            className="space-y-6"
          >
            <div className="card bg-theme-surface/80 backdrop-blur-sm border-primary-200/50">
              <h3 className="text-2xl font-bold mb-6 text-theme-text">Contact Information</h3>
              <div className="space-y-4">
                {contactInfo.map((info, index) => {
                  const Icon = info.icon && iconMap[info.icon] ? iconMap[info.icon] : iconMap.Mail
                  return (
                    <motion.div
                      key={index}
                      whileHover={{ x: 4, scale: 1.01 }}
                      transition={{ duration: 0.2 }}
                    >
                      {info.is_external ? (
                        <Link
                          href={info.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-4 p-3 rounded-xl bg-theme-surface-elevated hover:bg-theme-primary/10 transition-colors group"
                        >
                          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${info.gradient} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <span className="text-theme-text-muted font-medium group-hover:text-theme-primary transition-colors">{info.text}</span>
                        </Link>
                      ) : (
                        <motion.a
                          href={info.href}
                          className="flex items-center gap-4 p-3 rounded-xl bg-theme-surface-elevated hover:bg-theme-primary/10 transition-colors group"
                        >
                          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${info.gradient} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <span className="text-theme-text-muted font-medium group-hover:text-theme-primary transition-colors">{info.text}</span>
                        </motion.a>
                      )}
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            {...fadeIn}
          >
            <div className="card bg-theme-surface/80 backdrop-blur-sm border-primary-200/50">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-theme-text-muted mb-2">
                    Name
                  </label>
                  <input
                    {...register('name')}
                    type="text"
                    id="name"
                    className="w-full px-4 py-3 border-2 border-theme-border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-theme-primary transition-all bg-theme-surface"
                    placeholder="Your name"
                  />
                  {errors.name && (
                    <motion.p 
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-500 text-sm mt-1"
                    >
                      {errors.name.message}
                    </motion.p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-theme-text-muted mb-2">
                    Email
                  </label>
                  <input
                    {...register('email')}
                    type="email"
                    id="email"
                    className="w-full px-4 py-3 border-2 border-theme-border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-theme-primary transition-all bg-theme-surface"
                    placeholder="your.email@example.com"
                  />
                  {errors.email && (
                    <motion.p 
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-500 text-sm mt-1"
                    >
                      {errors.email.message}
                    </motion.p>
                  )}
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-semibold text-theme-text-muted mb-2">
                    Subject
                  </label>
                  <input
                    {...register('subject')}
                    type="text"
                    id="subject"
                    className="w-full px-4 py-3 border-2 border-theme-border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-theme-primary transition-all bg-theme-surface"
                    placeholder="What's this about?"
                  />
                  {errors.subject && (
                    <motion.p 
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-500 text-sm mt-1"
                    >
                      {errors.subject.message}
                    </motion.p>
                  )}
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-theme-text-muted mb-2">
                    Message
                  </label>
                  <textarea
                    {...register('message')}
                    id="message"
                    rows={5}
                    className="w-full px-4 py-3 border-2 border-theme-border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-theme-primary resize-none transition-all bg-theme-surface"
                    placeholder="Tell me about your project or inquiry..."
                  />
                  {errors.message && (
                    <motion.p 
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-500 text-sm mt-1"
                    >
                      {errors.message.message}
                    </motion.p>
                  )}
                </div>

                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-theme-primary text-theme-on-primary px-6 py-4 rounded-xl hover:bg-theme-primary-hover transition-colors font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  <Send className="w-5 h-5" />
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </motion.button>
              </form>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}
