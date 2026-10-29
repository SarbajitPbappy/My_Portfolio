'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Download, Github, Linkedin, Mail, Phone, GraduationCap, Globe } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import type { Hero, Publication } from '@/lib/types'
import Magnetic from '@/components/motion/Magnetic'
import dynamic from 'next/dynamic'
import { useTheme } from '@/components/ThemeProvider'

// 3D variant for the Multiverse theme, split out so other themes never load it.
const HeroMV = dynamic(() => import('@/components/multiverse/HeroMV'))

const fadeIn = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.45, ease: 'easeOut' },
}

// Fallback data
const fallbackHero: Hero = {
  name: 'Sarbajit Paul Bappy',
  title: 'Lecturer, Dept. of CSE @ Daffodil International University',
  subtitle: '',
  description: 'AI/ML researcher and lecturer working on deep learning, computer vision, explainable AI, and federated learning for medical and agricultural imaging.',
  email: 'sarbajit2001@gmail.com',
  phone: '+880 1315352270',
  cv_url: '/Bappy_CV_Official.pdf',
  github_url: 'https://github.com/SarbajitPbappy',
  linkedin_url: 'https://linkedin.com/in/iamsarbajit',
  profile_image_url: '/profile.jpg',
  focus_tags: ['Computer Vision', 'Explainable AI', 'Federated Learning', 'Medical Imaging'],
  order: 0,
}

export default function Hero({
  initialData,
  publications,
}: {
  initialData?: Hero | null
  // only the Multiverse hero uses these, for its publication stats
  publications?: Publication[]
} = {}) {
  // Seeded from the server (SSR) when `initialData` is provided (even if null →
  // fallback). Only fetches on the client when rendered without a seed.
  const seeded = initialData !== undefined
  const { theme } = useTheme()
  const [hero, setHero] = useState<Hero | null>(seeded ? initialData ?? null : null)
  const [loading, setLoading] = useState(!seeded)

  useEffect(() => {
    if (!seeded) fetchHero()

    // Listen for content updates from admin panel
    const handleUpdate = () => {
      fetchHero()
    }
    window.addEventListener('content-updated', handleUpdate)

    return () => {
      window.removeEventListener('content-updated', handleUpdate)
    }
  }, [])

  const fetchHero = async () => {
    try {
      const res = await fetch('/api/hero')
      const data = await res.json()
      setHero(data || fallbackHero)
    } catch (error) {
      console.error('Error fetching hero:', error)
      setHero(fallbackHero)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <section id="home" className="min-h-[80vh] flex items-center justify-center">
        <div className="text-theme-text-muted">Loading...</div>
      </section>
    )
  }

  const heroData = hero || fallbackHero
  if (theme === 'multiverse') return <HeroMV hero={heroData} publications={publications ?? []} />
  return (
    <section id="home" className="min-h-[80vh] flex items-center justify-center pt-16 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-20"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute top-40 right-10 w-72 h-72 bg-primary-300 rounded-full mix-blend-multiply filter blur-xl opacity-20"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      <div className="section-container relative z-10">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          {/* Left Content */}
          <motion.div className="space-y-6">

            <motion.div
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
              className="space-y-2"
            >
              <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                Hi, I'm{' '}
                <span className="gradient-text">{heroData.name}</span>
              </h1>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
            >
              {heroData.title && (
                <div className="inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-theme-surface/70 border border-theme-border shadow-sm mb-4">
                  <GraduationCap className="w-5 h-5 text-theme-primary" />
                  <div className="text-sm text-theme-text-muted">
                    {heroData.title}
                  </div>
                </div>
              )}

              {heroData.description && (
                <p className="text-lg text-theme-text-muted mb-4">
                  {heroData.description}
                </p>
              )}

              <div className="space-y-2 text-theme-text-muted mb-6">
                {heroData.email && (
                  <motion.div 
                    className="flex items-center gap-2"
                    whileHover={{ x: 7 }}
                  >
                    <Mail className="w-4 h-4" />
                    <a href={`mailto:${heroData.email}`} className="hover:text-theme-primary">{heroData.email}</a>
                  </motion.div>
                )}
                {heroData.phone && (
                  <motion.div 
                    className="flex items-center gap-2"
                    whileHover={{ x: 5 }}
                  >
                    <Phone className="w-4 h-4" />
                    <span>{heroData.phone}</span>
                  </motion.div>
                )}
              </div>
            </motion.div>

            {heroData.focus_tags && heroData.focus_tags.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.25 }}
                className="flex flex-wrap gap-2"
              >
                {heroData.focus_tags.map((tag) => (
                  <motion.span
                    key={tag}
                    whileHover={{ y: -3, scale: 1.05 }}
                    transition={{ type: 'spring', stiffness: 320, damping: 20 }}
                    className="pill bg-theme-surface/70 text-theme-text-muted border-theme-border shadow-sm"
                  >
                    {tag}
                  </motion.span>
                ))}
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.32 }}
              className="space-y-5"
            >
              <div className="flex flex-wrap gap-3">
                {heroData.cv_url && (
                  <Magnetic strength={0.4}>
                    <motion.a
                      href={heroData.cv_url}
                      download
                      whileTap={{ scale: 0.97 }}
                      className="flex items-center gap-2 bg-theme-primary text-white px-6 py-3 rounded-lg hover:bg-theme-primary-hover transition-colors font-medium shadow-md"
                    >
                      <Download size={20} />
                      Download CV
                    </motion.a>
                  </Magnetic>
                )}
                <a
                  href="#publications"
                  className="flex items-center gap-2 border border-theme-border bg-theme-surface/70 text-theme-text px-6 py-3 rounded-lg hover:border-theme-primary hover:text-theme-primary transition-colors font-medium"
                >
                  Publications
                </a>
              </div>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-medium text-theme-text-muted">
                {[
                  heroData.github_url && { href: heroData.github_url, label: 'GitHub', Icon: Github },
                  heroData.linkedin_url && { href: heroData.linkedin_url, label: 'LinkedIn', Icon: Linkedin },
                  { href: 'https://orcid.org/0009-0006-7551-0461', label: 'ORCID', Icon: Globe },
                ]
                  .filter((l): l is { href: string; label: string; Icon: typeof Github } => Boolean(l))
                  .map(({ href, label, Icon }) => (
                    <Link
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 hover:text-theme-primary transition-colors"
                    >
                      <Icon className="w-4 h-4" /> {label}
                    </Link>
                  ))}
              </div>
            </motion.div>
          </motion.div>

          {/* Right Image */}
          <motion.div {...fadeIn} transition={{ ...fadeIn.transition, delay: 0.25 }} className="flex justify-center">
            <div className="relative w-80 h-80 md:w-96 md:h-96">
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full blur-3xl opacity-30"
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.3, 0.4, 0.3],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
              <motion.div
                className="relative w-full h-full rounded-full overflow-hidden border-4 border-white shadow-2xl"
                whileHover={{ scale: 1.05, rotate: 2 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <Image
                  src={heroData.profile_image_url || '/profile.jpg'}
                  alt={heroData.name}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 320px, 384px"
                />
              </motion.div>
            </div>
          </motion.div>
        </div>

      </div>
    </section>
  )
}
