'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Download, Github, Linkedin, Mail, Globe, BookOpen, ArrowDown } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import type { Hero, Publication } from '@/lib/types'
import SaliencyFigure from '@/components/figures/SaliencyFigure'
import { countJournalArticles } from '@/lib/publications'
import { siteConfig } from '@/lib/site'


// Fallback data
const fallbackHero: Hero = {
  name: 'Sarbajit Paul Bappy',
  title: 'Lecturer, Dept. of CSE @ Daffodil International University',
  subtitle: '',
  description: 'AI/ML researcher and lecturer working on deep learning, computer vision, explainable AI, and federated learning for medical and agricultural imaging.',
  email: 'bappy15-6155@s.diu.edu.bd',
  phone: '+880 1315352270',
  cv_url: '/cv.pdf',
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
  publications?: Publication[]
} = {}) {
  // Seeded from the server (SSR) when `initialData` is provided (even if null →
  // fallback). Only fetches on the client when rendered without a seed.
  const seeded = initialData !== undefined
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
  // The journal count comes from the publication records so it can't drift.
  const facts = siteConfig.facts.map((f) =>
    f.label === 'journal papers' && publications?.length
      ? { ...f, value: String(countJournalArticles(publications)) }
      : f
  )
  const links = [
    { href: siteConfig.social.scholar, label: 'Google Scholar', Icon: BookOpen },
    { href: siteConfig.social.orcid, label: 'ORCID', Icon: Globe },
    heroData.github_url && { href: heroData.github_url, label: 'GitHub', Icon: Github },
    heroData.linkedin_url && { href: heroData.linkedin_url, label: 'LinkedIn', Icon: Linkedin },
  ].filter((l): l is { href: string; label: string; Icon: typeof Github } => Boolean(l))

  // Everything in the hero renders visible in the server HTML: the entrance is
  // a short slide only (no opacity), so the name and research line paint
  // before JavaScript loads.
  const rise = (delay: number) => ({
    initial: { y: 14 },
    animate: { y: 0 },
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const, delay },
  })

  return (
    <section id="home" className="relative pt-28 pb-10 md:pt-32">
      <div className="section-container !py-0 w-full">
        <div className="grid lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] gap-12 lg:gap-16 items-start">
          <motion.div {...rise(0)} className="min-w-0">
            <div className="flex items-center gap-4 mb-7">
              <div className="relative w-16 h-16 sm:w-[72px] sm:h-[72px] shrink-0 rounded-theme-md overflow-hidden ring-1 ring-theme-border bg-theme-surface">
                <Image
                  src={siteConfig.headshot}
                  alt={`Portrait of ${heroData.name}`}
                  fill
                  className="object-cover object-top"
                  priority
                  sizes="72px"
                />
              </div>
              <div className="min-w-0 text-sm leading-snug">
                {heroData.title && <p className="text-theme-text font-medium">{heroData.title}</p>}
                <p className="font-mono text-xs text-theme-text-muted mt-1">{siteConfig.location} · {siteConfig.shortTitle}</p>
              </div>
            </div>

            <h1 className="text-[2.75rem] leading-[1.02] sm:text-6xl lg:text-[4.5rem] text-theme-text">
              {heroData.name}
            </h1>

            <p className="mt-6 text-lg md:text-xl text-theme-text leading-relaxed max-w-[38ch] md:max-w-[44ch]">
              {siteConfig.researchLine}
            </p>

            {siteConfig.availability && (
              <p className="mt-6 inline-flex items-center gap-2.5 font-mono text-xs text-theme-text">
                <span className="relative flex w-2 h-2" aria-hidden>
                  <span className="absolute inline-flex w-full h-full rounded-full bg-[#f98c0a] opacity-60 motion-safe:animate-ping" />
                  <span className="relative inline-flex w-2 h-2 rounded-full bg-[#f98c0a]" />
                </span>
                {siteConfig.availability}
              </p>
            )}

            <dl className="mt-8 grid grid-cols-2 sm:grid-cols-4 border-y border-theme-border" aria-label="Highlights">
              {facts.map((f) => (
                <div key={f.label} className="py-3 px-3 border-theme-border odd:pl-0 even:border-l [&:nth-child(n+3)]:border-t sm:odd:pl-3 sm:first:!pl-0 sm:border-l sm:first:border-l-0 sm:[&:nth-child(n+3)]:border-t-0">
                  <dt className="sr-only">{f.label}</dt>
                  <dd>
                    <span className="block font-heading text-2xl text-theme-text tabular-nums">{f.value}</span>
                    <span className="block text-xs text-theme-text-muted leading-snug mt-0.5">{f.label}</span>
                  </dd>
                </div>
              ))}
            </dl>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#publications"
                className="inline-flex items-center gap-2 bg-theme-text text-theme-background px-5 py-2.5 rounded-theme-md hover:bg-theme-primary transition-colors text-sm font-medium"
              >
                <ArrowDown size={16} />
                Read the publications
              </a>
              {heroData.cv_url && (
                <a
                  href={heroData.cv_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 border border-theme-border text-theme-text px-5 py-2.5 rounded-theme-md hover:border-theme-text transition-colors text-sm font-medium"
                >
                  <Download size={16} />
                  Download CV (PDF)
                </a>
              )}
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-theme-text-muted">
              {links.map(({ href, label, Icon }) => (
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
              {heroData.email && (
                <a href={`mailto:${heroData.email}`} className="inline-flex items-center gap-1.5 hover:text-theme-primary transition-colors">
                  <Mail className="w-4 h-4" /> {heroData.email}
                </a>
              )}
            </div>
          </motion.div>

          <motion.div {...rise(0.08)} className="min-w-0 lg:pt-2">
            <SaliencyFigure />
          </motion.div>
        </div>

        {siteConfig.news.length > 0 && (
          <div className="mt-14 border-t border-theme-border pt-5">
            <h2 className="font-mono text-[11px] uppercase tracking-[0.14em] text-theme-text-muted mb-3">Latest</h2>
            <ul className="grid gap-2 md:grid-cols-3 md:gap-8">
              {siteConfig.news.map((n) => (
                <li key={n.text} className="flex gap-3 text-sm">
                  <span className="shrink-0 font-mono text-xs text-theme-text-muted pt-0.5 tabular-nums w-14">{n.date}</span>
                  <span className="text-theme-text">{n.text}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  )
}
