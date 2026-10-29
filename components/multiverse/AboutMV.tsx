'use client'

import Image from 'next/image'
import type { About } from '@/lib/types'
import { Reveal, Section, Tilt } from './kit'

// Mirrors the "What drives me" copy of the standard About section.
const DRIVE =
  'I love translating complex ideas into accessible, reliable systems. Whether mentoring students or iterating on research, I prioritize clarity, reproducibility, and meaningful impact.'

export default function AboutMV({ about, photo }: { about: About; photo: string }) {
  return (
    <Section id="about" title={about.title || 'About Me'}>
      <div className="grid items-start gap-12 lg:grid-cols-12 lg:gap-16">
        {/* layered portrait: the photo floats above an accent plate and tilts toward the cursor */}
        <Reveal depth className="lg:col-span-5">
          <Tilt className="mv-portrait" max={10}>
            <div className="mv-portrait-plate" aria-hidden />
            <div className="mv-portrait-photo">
              <Image
                src={photo}
                alt="Portrait of Sarbajit Paul Bappy"
                fill
                className="object-cover"
                style={{ objectPosition: '50% 78%', transform: 'scale(1.4)', transformOrigin: '50% 78%' }}
                sizes="(max-width: 1024px) 90vw, 440px"
              />
            </div>
          </Tilt>
        </Reveal>

        <Reveal delay={0.08} className="lg:col-span-7">
          <div className="mv-card md:p-9">
            <p className="text-lg leading-relaxed text-theme-text md:text-xl lg:text-[1.35rem] lg:leading-[1.6]">{about.description}</p>
            <p className="mt-6 max-w-[65ch] leading-relaxed text-theme-text-muted">{DRIVE}</p>

            {about.quick_facts?.length > 0 && (
              <dl className="mt-10 grid gap-3 sm:grid-cols-3">
                {about.quick_facts.map((fact) => (
                  <div key={fact.label} className="mv-fact">
                    <dt className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--sec)' }}>
                      {fact.label}
                    </dt>
                    <dd className="mt-2 text-sm leading-relaxed text-theme-text">{fact.value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </Reveal>
      </div>

      {about.values?.length > 0 && (
        <ul className="mt-16 grid gap-5 md:grid-cols-3">
          {about.values.map((v, i) => (
            <Reveal as="li" key={v.title} depth delay={i * 0.08}>
              <div className="mv-value h-full">
                <h3 className="text-lg font-semibold text-theme-text">{v.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-theme-text-muted">{v.description}</p>
              </div>
            </Reveal>
          ))}
        </ul>
      )}
    </Section>
  )
}
