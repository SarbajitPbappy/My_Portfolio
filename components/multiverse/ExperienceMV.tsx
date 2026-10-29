'use client'

import { Briefcase } from 'lucide-react'
import type { WorkExperience } from '@/lib/types'
import { iconMap } from '@/lib/icons'
import { Reveal, Section } from './kit'

const GROUPS: { type: WorkExperience['type']; title: string }[] = [
  { type: 'Work', title: 'Appointments' },
  { type: 'Internship', title: 'Internships' },
  { type: 'Volunteering', title: 'Leadership & service' },
]

export default function ExperienceMV({ roles }: { roles: WorkExperience[] }) {
  return (
    <Section id="experience" title="Experience" description="Professional roles, leadership, and community involvement">
      <div className="grid gap-14 lg:grid-cols-2 lg:gap-12">
        {GROUPS.map(({ type, title }) => {
          const items = roles.filter((r) => r.type === type)
          if (!items.length) return null
          return (
            <div key={type}>
              <Reveal>
                <h3 className="mv-h3">{title}</h3>
              </Reveal>
              {/* timeline: a rail with one node per role, newest first */}
              <ol className="mv-timeline mt-6">
                {items.map((role, i) => {
                  const Icon = (role.icon && iconMap[role.icon]) || Briefcase
                  return (
                    <Reveal as="li" key={role.title + role.period} depth delay={Math.min(i, 3) * 0.07} className="mv-tl-item">
                      <span className="mv-tl-node" aria-hidden>
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="mv-card">
                        <p className="mv-pill">{role.period}</p>
                        <h4 className="mt-3 text-lg font-semibold leading-snug text-theme-text">{role.title}</h4>
                        <p className="mt-1 text-sm font-medium text-theme-primary">{role.organization}</p>
                        {role.description && (
                          <p className="mt-3 text-sm leading-relaxed text-theme-text-muted">{role.description}</p>
                        )}
                      </div>
                    </Reveal>
                  )
                })}
              </ol>
            </div>
          )
        })}
      </div>
    </Section>
  )
}
