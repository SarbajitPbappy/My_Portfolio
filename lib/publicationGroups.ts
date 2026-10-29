import type { Publication } from '@/lib/types'

export type PublicationGroupKey = 'journal' | 'review' | 'chapter' | 'conference' | 'abstract' | 'other'

const GROUPS: { key: PublicationGroupKey; title: string; test: (p: Publication, status: string) => boolean }[] = [
  { key: 'journal', title: 'Journal articles', test: (p, s) => /journal/i.test(p.type) && (s === 'Published' || s === 'Accepted') },
  { key: 'review', title: 'Under review', test: (_, s) => /Revision|Review|Submitted/.test(s) },
  { key: 'chapter', title: 'Book chapters', test: (p) => /chapter/i.test(p.type) },
  { key: 'conference', title: 'Conference papers', test: (p, s) => /conference/i.test(p.type) && s !== 'Published (Abstract)' },
  { key: 'abstract', title: 'Abstracts', test: (_, s) => s === 'Published (Abstract)' },
  { key: 'other', title: 'Other', test: () => true },
]

export type PublicationGroup = {
  key: PublicationGroupKey
  title: string
  items: { pub: Publication; status: string }[]
}

/**
 * Publications grouped the way an academic CV lists them (peer-reviewed
 * first, then the pipeline). Empty groups are dropped.
 */
export function groupPublications(publications: Publication[]): PublicationGroup[] {
  const groups = GROUPS.map(({ key, title }) => ({ key, title, items: [] as PublicationGroup['items'] }))
  for (const pub of publications) {
    const status = pub.status?.trim() || ''
    const i = GROUPS.findIndex((g) => g.test(pub, status))
    groups[i].items.push({ pub, status })
  }
  return groups.filter((g) => g.items.length)
}

export const doiUrl = (doi?: string) => (doi && /^10\./.test(doi.trim()) ? `https://doi.org/${doi.trim()}` : null)
