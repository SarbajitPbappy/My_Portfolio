'use client'

import { type CSSProperties, type ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { sectionColor } from './palette'

/**
 * Building blocks for the "Multiverse" theme's sections. The 3D stage behind
 * them is Spectrum.tsx and DepthField.tsx tilts every surface toward the mouse;
 * here, cards swing up into place as they scroll in.
 */

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

/**
 * Section with a left-aligned heading and optional one-line description. Its
 * accent (`--sec`) is the colour of its ray in the prism scene.
 */
export function Section({
  id,
  title,
  description,
  children,
  className = '',
}: {
  id: string
  title: string
  description?: string
  children: ReactNode
  className?: string
}) {
  return (
    <section id={id} className={`mv-section scroll-mt-16 ${className}`} style={{ '--sec': sectionColor(id) } as CSSProperties}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <header className="mv-head mb-10 md:mb-12">
            <h2 className="mv-h2">
              <span className="mv-h2-bar" aria-hidden />
              {title}
            </h2>
            {description && <p className="mt-3 max-w-[60ch] text-lg text-theme-text-muted">{description}</p>}
          </header>
        </Reveal>
        {children}
      </div>
    </section>
  )
}

/**
 * Reveals content once as it enters the viewport. `depth` swings it up from a
 * backward tilt, so cards read as panels settling into place.
 */
export function Reveal({
  children,
  delay = 0,
  className,
  as = 'div',
  depth = false,
}: {
  children: ReactNode
  delay?: number
  className?: string
  as?: 'div' | 'li'
  depth?: boolean
}) {
  const reduce = useReducedMotion()
  const Tag = as === 'li' ? motion.li : motion.div
  const hidden = depth ? { opacity: 0, y: 36, rotateX: 18 } : { opacity: 0, y: 18 }
  return (
    <Tag
      className={className}
      initial={reduce ? false : hidden}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: depth ? 0.9 : 0.6, delay, ease: EASE }}
      style={depth ? { transformPerspective: 1200, transformOrigin: '50% 100%' } : undefined}
    >
      {children}
    </Tag>
  )
}

/**
 * A 3D surface: DepthField tilts it toward the mouse and its contents float
 * above it. `max` overrides how far it may tilt (degrees).
 */
export function Tilt({
  children,
  className = '',
  max,
  style,
}: {
  children: ReactNode
  className?: string
  max?: number
  style?: CSSProperties
}) {
  return (
    <div className={`mv-tilt ${className}`} style={style} data-tilt={max}>
      {children}
    </div>
  )
}
