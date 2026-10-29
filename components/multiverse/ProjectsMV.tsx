'use client'

import { Code, Github } from 'lucide-react'
import type { Project } from '@/lib/types'
import { iconMap } from '@/lib/icons'
import { lastRowSpan } from '@/lib/layout'
import { Reveal, Section, Tilt } from './kit'

export default function ProjectsMV({ projects }: { projects: Project[] }) {
  return (
    <Section
      id="projects"
      title="Projects"
      description="Showcasing my work in machine learning, deep learning, and data analysis"
    >
      <div className="grid gap-5 md:grid-cols-2">
        {projects.map((project, i) => {
          const Icon = (project.icon && iconMap[project.icon]) || Code
          const tech = project.technologies ?? []
          return (
            <Reveal key={project.title} depth delay={(i % 2) * 0.08} className={`h-full ${lastRowSpan(i, projects.length, 2)}`}>
              <Tilt className="mv-card mv-project h-full">
                {/* cover: the project's colour with its icon raised off the surface */}
                <div className={`mv-project-cover bg-gradient-to-br ${project.gradient}`}>
                  <span className="mv-project-icon mv-lift">
                    <Icon className="h-7 w-7" />
                  </span>
                  {project.category && <span className="mv-project-category">{project.category}</span>}
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="text-lg font-semibold leading-snug text-theme-text">{project.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-theme-text-muted">{project.description}</p>
                  {tech.length > 0 && (
                    <ul className="mt-5 flex flex-wrap gap-1.5">
                      {tech.map((t) => (
                        <li key={t} className="mv-tag mv-tag-sm">
                          {t}
                        </li>
                      ))}
                    </ul>
                  )}
                  {project.github && (
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mv-link mt-auto inline-flex items-center gap-2 pt-5 text-sm"
                    >
                      <Github className="h-4 w-4" /> Source code
                    </a>
                  )}
                </div>
              </Tilt>
            </Reveal>
          )
        })}
      </div>
    </Section>
  )
}
