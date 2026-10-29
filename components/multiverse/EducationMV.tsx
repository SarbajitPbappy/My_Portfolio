'use client'

import { ArrowUpRight, Award, GraduationCap } from 'lucide-react'
import type { Course, Education } from '@/lib/types'
import { iconMap } from '@/lib/icons'
import { Reveal, Section, Tilt } from './kit'

// "CGPA: 3.95/4.00" → { label: "CGPA", value: "3.95", scale: "/4.00" }
const splitGrade = (gpa?: string) => {
  if (!gpa) return null
  const [label, ...rest] = gpa.split(':')
  const value = (rest.length ? rest.join(':') : label).trim()
  const [num, scale] = value.split('/')
  return { label: rest.length ? label.trim() : '', value: num.trim(), scale: scale ? `/${scale.trim()}` : '' }
}

export default function EducationMV({ education, courses }: { education: Education[]; courses: Course[] }) {
  const [featured, ...others] = education

  return (
    <Section id="education" title="Education" description="Academic journey and international experiences">
      {featured && (
        <div className="grid gap-5 lg:grid-cols-5">
          <Reveal depth className="lg:col-span-3 lg:row-span-2">
            <EducationCard edu={featured} featured />
          </Reveal>
          {others.map((edu, i) => (
            <Reveal key={edu.institution + edu.period} depth delay={0.08 * (i + 1)} className="lg:col-span-2">
              <EducationCard edu={edu} />
            </Reveal>
          ))}
        </div>
      )}

      {courses.length > 0 && (
        <div className="mt-14">
          <Reveal>
            <h3 className="mv-h3">Courses &amp; certifications</h3>
          </Reveal>
          <ul className="mt-5 grid gap-5 sm:grid-cols-2">
            {courses.map((c, i) => {
              // the courses table stores this as `description`; the type calls it `desc`
              const text = c.desc || (c as Course & { description?: string }).description
              return (
                <Reveal as="li" key={c.title} depth delay={i * 0.08}>
                  <div className="mv-card flex h-full gap-4">
                    <span className="mv-glyph">
                      <Award className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold leading-snug text-theme-text">{c.title}</p>
                      {text && <p className="mt-1.5 text-sm leading-relaxed text-theme-text-muted">{text}</p>}
                      {c.verifyLink && (
                        <a
                          href={c.verifyLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mv-link mt-3 inline-flex items-center gap-1 text-sm"
                        >
                          Verify certificate <ArrowUpRight className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </Reveal>
              )
            })}
          </ul>
        </div>
      )}
    </Section>
  )
}

function EducationCard({ edu, featured = false }: { edu: Education; featured?: boolean }) {
  const Icon = (edu.icon && iconMap[edu.icon]) || GraduationCap
  const grade = splitGrade(edu.gpa)

  return (
    <Tilt className={`mv-card flex h-full flex-col ${featured ? 'mv-card-feature md:p-9' : ''}`} max={featured ? 3 : 5}>
      <div className="flex items-start justify-between gap-4">
        <span className="mv-glyph mv-lift">
          <Icon className="h-5 w-5" />
        </span>
        <span className="mv-pill">{edu.period}</span>
      </div>
      <h3 className={`mt-6 font-semibold leading-snug text-theme-text ${featured ? 'text-2xl md:text-[1.75rem]' : 'text-lg'}`}>
        {edu.degree}
      </h3>
      {edu.program && <p className="mt-1 text-sm text-theme-text-muted">{edu.program}</p>}
      <p className="mt-2 font-medium text-theme-primary">{edu.institution}</p>
      <p className="text-sm text-theme-text-muted">{edu.location}</p>

      {grade && !featured && <p className="mt-3 text-sm font-medium text-theme-text">{edu.gpa}</p>}

      {edu.highlights?.length > 0 && (
        <ul className="mt-5 space-y-2 text-sm text-theme-text-muted">
          {edu.highlights.map((h) => (
            <li key={h} className="flex gap-2.5">
              <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-theme-primary" aria-hidden />
              {h}
            </li>
          ))}
        </ul>
      )}

      {grade && featured && (
        <p className="mv-lift mt-auto flex items-baseline gap-2 pt-10">
          <span className="mv-num !text-6xl md:!text-7xl">{grade.value}</span>
          <span className="text-xl font-medium text-theme-text-muted">{grade.scale}</span>
          {grade.label && <span className="ml-2 text-sm font-medium uppercase tracking-wider text-theme-primary">{grade.label}</span>}
        </p>
      )}
    </Tilt>
  )
}
