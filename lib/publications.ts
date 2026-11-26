import type { Publication } from '@/lib/types'

/**
 * Turns the flat publication records into an academic-CV bibliography:
 * grouped by kind, numbered newest-first (J4, J3, …), with the venue cleaned
 * of quartile tags and the DOI normalised.
 */

export const SELF_AUTHOR = /^(Bappy,\s*S\.\s*P\.|Paul Bappy,\s*S\.|Paul,\s*S\.\s*P\.|Paul,\s*S\.|Sarbajit)/

const IN_PROGRESS = new Set(['Minor Revision', 'Major Revision', 'Under Review', 'Submitted', 'Draft'])

export interface CvEntry {
  key: string // e.g. "J4"
  pub: Publication
  venue: string
  quartile?: string
  doi?: string
  href?: string
  firstAuthor: boolean
  equalContribution: boolean
  inProgress: boolean
}

export interface CvGroup {
  id: string
  title: string
  entries: CvEntry[]
}

/** "https://doi.org/10.1/x" or "doi:10.1/x" → "10.1/x"; anything else → undefined. */
export function normaliseDoi(raw?: string) {
  const s = raw?.trim().replace(/^https?:\/\/(dx\.)?doi\.org\//i, '').replace(/^doi:\s*/i, '')
  return s && /^10\.\d{4,}\//.test(s) ? s : undefined
}

/** Drop campaign/tracking parameters from a stored link. */
function cleanLink(raw?: string) {
  if (!raw || raw === '#') return undefined
  try {
    const u = new URL(raw)
    for (const k of [...u.searchParams.keys()]) if (/^utm_/i.test(k)) u.searchParams.delete(k)
    if (u.hash === '#citeas') u.hash = ''
    return u.toString()
  } catch {
    return undefined
  }
}

function kindOf(p: Publication) {
  if (IN_PROGRESS.has(p.status?.trim())) return 'R'
  const t = `${p.type} ${p.status}`.toLowerCase()
  if (t.includes('book')) return 'B'
  if (t.includes('conference') || t.includes('proceedings') || t.includes('abstract')) return 'C'
  return 'J'
}

const GROUPS: { id: string; title: string }[] = [
  { id: 'J', title: 'Journal articles' },
  { id: 'B', title: 'Book chapters' },
  { id: 'C', title: 'Conference papers and abstracts' },
  { id: 'R', title: 'Under review and in revision' },
]

export function toCv(pubs: Publication[]): CvGroup[] {
  const byKind = new Map<string, Publication[]>()
  for (const p of pubs) {
    const k = kindOf(p)
    byKind.set(k, [...(byKind.get(k) ?? []), p])
  }

  return GROUPS.flatMap(({ id, title }) => {
    const list = (byKind.get(id) ?? []).slice().sort((a, b) => {
      const y = (parseInt(b.year) || 0) - (parseInt(a.year) || 0)
      return y !== 0 ? y : a.order - b.order
    })
    if (list.length === 0) return []
    const entries = list.map((pub, i): CvEntry => {
      const rawVenue = (pub.journal || '').trim()
      const q = `${rawVenue} ${pub.type}`.match(/\((Q[1-4])\)/)
      const doi = normaliseDoi(pub.doi) ?? normaliseDoi(pub.link)
      return {
        key: `${id}${list.length - i}`,
        pub,
        venue: rawVenue.replace(/\s*\(Q[1-4]\)\s*/g, ' ').trim(),
        quartile: q?.[1],
        doi,
        href: doi ? `https://doi.org/${doi}` : cleanLink(pub.link),
        firstAuthor: SELF_AUTHOR.test(pub.authors.trim()),
        equalContribution: pub.authors.includes('†'),
        inProgress: id === 'R',
      }
    })
    return [{ id, title, entries }]
  })
}

/** Number of peer-reviewed journal articles that are out (published or accepted). */
export function countJournalArticles(pubs: Publication[]) {
  return pubs.filter((p) => kindOf(p) === 'J').length
}
