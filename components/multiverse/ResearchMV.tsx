'use client'

import { ArrowUpRight, Brain } from 'lucide-react'
import type { Publication, ResearchArea } from '@/lib/types'
import { iconMap } from '@/lib/icons'
import { doiUrl, groupPublications } from '@/lib/publicationGroups'
import { lastRowSpan } from '@/lib/layout'
import AuthorList from '@/components/AuthorList'
import { Reveal, Section, Tilt } from './kit'

function Links({ pub }: { pub: Publication }) {
  const doi = doiUrl(pub.doi)
  const extra = pub.link && pub.link !== '#' && pub.link !== doi ? pub.link : null
  return (
    <>
      {doi && (
        <a href={doi} target="_blank" rel="noopener noreferrer" className="mv-chip-link">
          DOI <ArrowUpRight className="h-3 w-3" />
        </a>
      )}
      {extra && (
        <a href={extra} target="_blank" rel="noopener noreferrer" className="mv-chip-link">
          Paper <ArrowUpRight className="h-3 w-3" />
        </a>
      )}
    </>
  )
}

/** Peer-reviewed journal articles: the headline work, shown as cards. */
function FeaturedPaper({ pub, status }: { pub: Publication; status: string }) {
  return (
    <Tilt className="mv-card mv-paper h-full" max={4}>
      <div className={`mv-paper-band bg-gradient-to-r ${pub.gradient}`} aria-hidden />
      <p className="flex flex-wrap items-center gap-x-2 text-sm">
        <em className="font-medium not-italic text-theme-primary">{pub.journal?.trim()}</em>
        <span className="text-theme-text-muted">{pub.year}</span>
      </p>
      <h4 className="mt-3 text-lg font-semibold leading-snug text-theme-text">{pub.title.trim()}</h4>
      <p className="mt-3 text-sm leading-relaxed text-theme-text-muted">
        <AuthorList authors={pub.authors} />
      </p>
      <div className="mt-auto flex flex-wrap items-center gap-2 pt-5">
        {status === 'Accepted' && <span className="mv-status is-accepted">Accepted</span>}
        {pub.volume && <span className="text-xs text-theme-text-muted">Vol. {pub.volume}</span>}
        <span className="flex-1" />
        <Links pub={pub} />
      </div>
    </Tilt>
  )
}

function PublicationEntry({ pub, status }: { pub: Publication; status: string }) {
  const peerReviewed = status === 'Published' || status === 'Published (Abstract)'
  return (
    <li className="grid gap-1 md:grid-cols-[4.5rem_minmax(0,1fr)] md:gap-6">
      <p className="font-mono text-sm text-theme-text-muted md:pt-0.5">{pub.year}</p>
      <div>
        <h4 className="font-semibold leading-snug text-theme-text">{pub.title.trim()}</h4>
        <p className="mt-1.5 text-sm leading-relaxed text-theme-text-muted">
          <AuthorList authors={pub.authors} />
        </p>
        <p className="mt-1 text-sm text-theme-text-muted">
          {pub.journal && <em className="text-theme-text">{pub.journal.trim()}</em>}
          {pub.volume && <span>, {pub.volume}</span>}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {!peerReviewed && <span className={`mv-status ${status === 'Accepted' ? 'is-accepted' : ''}`}>{status}</span>}
          <Links pub={pub} />
        </div>
      </div>
    </li>
  )
}

export default function ResearchMV({ areas, publications }: { areas: ResearchArea[]; publications: Publication[] }) {
  const groups = groupPublications(publications)
  const journal = groups.find((g) => g.key === 'journal')
  const rest = groups.filter((g) => g.key !== 'journal')

  return (
    <Section id="research" title="Research" description="Areas of focus and key research contributions">
      {areas.length > 0 && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {areas.map((area, i) => {
            const Icon = (area.icon && iconMap[area.icon]) || Brain
            return (
              <Reveal key={area.title} depth delay={(i % 3) * 0.07} className={lastRowSpan(i, areas.length)}>
                <Tilt className="mv-card h-full">
                  <span className="mv-glyph mv-lift">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 font-semibold text-theme-text">{area.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-theme-text-muted">{area.description}</p>
                  {area.technologies?.length > 0 && (
                    <ul className="mt-4 flex flex-wrap gap-1.5">
                      {area.technologies.map((t) => (
                        <li key={t} className="mv-tag mv-tag-sm">
                          {t}
                        </li>
                      ))}
                    </ul>
                  )}
                </Tilt>
              </Reveal>
            )
          })}
        </div>
      )}

      <div id="publications" className="mt-24 scroll-mt-20">
        <Reveal>
          <h3 className="mv-h2 text-3xl md:text-4xl">Publications</h3>
          <p className="mt-3 text-lg text-theme-text-muted">Peer-reviewed work first, then manuscripts in progress.</p>
        </Reveal>

        {journal && (
          <div className="mt-10">
            <Reveal>
              <h4 className="mv-group-title">
                {journal.title} <span>{journal.items.length}</span>
              </h4>
            </Reveal>
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              {journal.items.map(({ pub, status }, i) => (
                <Reveal key={pub.title} depth delay={(i % 2) * 0.08} className={lastRowSpan(i, journal.items.length, 2)}>
                  <FeaturedPaper pub={pub} status={status} />
                </Reveal>
              ))}
            </div>
          </div>
        )}

        <div className="mt-10 space-y-6">
          {rest.map((g) => (
            <Reveal key={g.key}>
              <div className="mv-card md:p-8">
                <h4 className="mv-group-title">
                  {g.title} <span>{g.items.length}</span>
                </h4>
                <ol className="mt-6 space-y-8">
                  {g.items.map(({ pub, status }) => (
                    <PublicationEntry key={pub.title} pub={pub} status={status} />
                  ))}
                </ol>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  )
}
