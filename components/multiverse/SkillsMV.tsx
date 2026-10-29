'use client'

import { useMemo } from 'react'
import type { Skill } from '@/lib/types'
import { categoryStyle } from '@/lib/skillCategories'
import { lastRowSpan } from '@/lib/layout'
import { Reveal, Section, Tilt } from './kit'

export default function SkillsMV({ skills }: { skills: Skill[] }) {
  // one group per category; each comma-separated entry becomes a tag
  const groups = useMemo(() => {
    const map = new Map<string, string[]>()
    for (const s of skills) {
      const list = map.get(s.category) ?? []
      list.push(...s.name.split(',').map((t) => t.trim()).filter(Boolean))
      map.set(s.category, list)
    }
    return [...map.entries()]
  }, [skills])

  return (
    <Section id="skills" title="Skills" description="Technologies and tools I work with">
      {groups.length === 0 ? (
        <p className="text-theme-text-muted">No skills added yet. Add skills from the Admin Panel.</p>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {groups.map(([category, items], i) => {
            const { icon: Icon } = categoryStyle(category)
            return (
              <Reveal key={category} depth delay={(i % 3) * 0.07} className={lastRowSpan(i, groups.length)}>
                <Tilt className="mv-card h-full">
                  <div className="flex items-center gap-3">
                    <span className="mv-glyph mv-lift">
                      <Icon className="h-5 w-5" />
                    </span>
                    <h3 className="font-semibold leading-snug text-theme-text">{category}</h3>
                  </div>
                  <ul className="mt-5 flex flex-wrap gap-2">
                    {items.map((item) => (
                      <li key={item} className="mv-tag">
                        {item}
                      </li>
                    ))}
                  </ul>
                </Tilt>
              </Reveal>
            )
          })}
        </div>
      )}
    </Section>
  )
}
