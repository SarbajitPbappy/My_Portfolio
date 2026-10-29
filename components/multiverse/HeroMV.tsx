'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { animate, motion, useInView, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion'
import { ArrowRight, Download, Github, Globe, Linkedin, Mail } from 'lucide-react'
import type { Hero, Publication } from '@/lib/types'
import { groupPublications } from '@/lib/publicationGroups'
import { RAYS } from './palette'

const ORCID_URL = 'https://orcid.org/0009-0006-7551-0461'

/** Counts up to `value` the first time it scrolls into view. */
function CountUp({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  const reduce = useReducedMotion()
  const mv = useMotionValue(reduce ? value : 0)
  const rounded = useTransform(mv, (v) => Math.round(v).toString())
  useEffect(() => {
    if (!inView || reduce) return
    const controls = animate(mv, value, { duration: 1.6, ease: [0.16, 1, 0.3, 1] })
    return () => controls.stop()
  }, [inView, reduce, value, mv])
  return <motion.span ref={ref}>{rounded}</motion.span>
}

/** One layer of the hero stage, floating `z` px in front of it. */
function Layer({ z, delay, className = '', children }: { z: number; delay: number; className?: string; children: ReactNode }) {
  const reduce = useReducedMotion()
  return (
    <div className={`mv-layer ${className}`} style={{ '--z': `${z}px` } as React.CSSProperties}>
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 26 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.div>
    </div>
  )
}

export default function HeroMV({ hero, publications }: { hero: Hero; publications: Publication[] }) {
  const reduce = useReducedMotion()
  const enter = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 24 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 1, delay, ease: [0.16, 1, 0.3, 1] as const },
        }

  // the text stage rests turned toward the prism and follows the cursor
  const px = useMotionValue(0)
  const py = useMotionValue(0)
  const rotateY = useSpring(useTransform(px, [-1, 1], [-15, 3]), { stiffness: 50, damping: 18 })
  const rotateX = useSpring(useTransform(py, [-1, 1], [-6, 10]), { stiffness: 50, damping: 18 })
  useEffect(() => {
    // touch screens have no cursor: keep the stage facing forward
    if (!window.matchMedia('(pointer: fine)').matches) {
      px.set(2 / 3)
      py.set(-0.25)
      return
    }
    if (reduce) return
    const onMove = (e: PointerEvent) => {
      px.set((e.clientX / window.innerWidth) * 2 - 1)
      py.set((e.clientY / window.innerHeight) * 2 - 1)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [reduce, px, py])

  const groups = groupPublications(publications)
  const count = (key: string) => groups.find((g) => g.key === key)?.items.length ?? 0
  const stats = [
    { value: publications.length, label: 'Publications' },
    { value: count('journal'), label: 'Peer-reviewed journal articles' },
    { value: count('review'), label: 'Manuscripts under review' },
    { value: count('chapter') + count('conference'), label: 'Book chapters & conference papers' },
  ].filter((s) => s.value > 0)

  const links = [
    hero.github_url && { href: hero.github_url, label: 'GitHub', Icon: Github },
    hero.linkedin_url && { href: hero.linkedin_url, label: 'LinkedIn', Icon: Linkedin },
    { href: ORCID_URL, label: 'ORCID', Icon: Globe },
    hero.email && { href: `mailto:${hero.email}`, label: 'Email', Icon: Mail },
  ].filter(Boolean) as { href: string; label: string; Icon: typeof Github }[]

  return (
    <section id="home" className="relative">
      <div className="mx-auto flex min-h-[100dvh] max-w-7xl flex-col px-4 sm:px-6 lg:px-8">
        {/* on phones the prism sits under the text, so leave it room */}
        <div className="flex flex-1 items-center pb-[38vh] pt-28 lg:pb-10">
          <motion.div
            className="mv-stage max-w-[38rem]"
            style={reduce ? { transformPerspective: 1300 } : { rotateX, rotateY, transformPerspective: 1300 }}
          >
            {hero.title && (
              <Layer z={40} delay={0.1}>
                <p className="mv-chip">{hero.title}</p>
              </Layer>
            )}
            <Layer z={90} delay={0.2} className="mt-7">
              <h1 className="mv-h1">{hero.name}</h1>
            </Layer>
            {hero.description && (
              <Layer z={30} delay={0.32} className="mt-7">
                <p className="mv-lede max-w-[34rem] text-lg leading-relaxed md:text-xl">{hero.description}</p>
              </Layer>
            )}
            <Layer z={60} delay={0.44} className="mt-10">
              <div className="flex flex-wrap items-center gap-3">
                {hero.cv_url && (
                  <a href={hero.cv_url} download className="mv-btn mv-btn-primary">
                    <Download className="h-4 w-4" /> Download CV
                  </a>
                )}
                <a href="#publications" className="mv-btn mv-btn-ghost">
                  Publications <ArrowRight className="h-4 w-4" />
                </a>
                <span className="mx-1 hidden h-6 w-px bg-white/15 sm:block" aria-hidden />
                {links.map(({ href, label, Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target={href.startsWith('http') ? '_blank' : undefined}
                    rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    aria-label={label}
                    title={label}
                    className="mv-icon-btn"
                  >
                    <Icon className="h-[18px] w-[18px]" />
                  </a>
                ))}
              </div>
            </Layer>
          </motion.div>
        </div>

        <motion.p className="mv-hint" {...enter(1.1)}>
          Move your cursor to steer the light. Each ray is a section.
        </motion.p>

        {stats.length > 0 && (
          <motion.div {...enter(0.6)}>
            <dl className="mv-stats">
              {stats.map((s, i) => (
                <div key={s.label} className="mv-stat" style={{ '--sec': RAYS[i * 2]?.color } as React.CSSProperties}>
                  {/* label first for screen readers; CSS shows the number on top */}
                  <dt className="mv-stat-label">{s.label}</dt>
                  <dd className="mv-stat-value">
                    <CountUp value={s.value} />
                  </dd>
                </div>
              ))}
            </dl>
          </motion.div>
        )}
      </div>
    </section>
  )
}
