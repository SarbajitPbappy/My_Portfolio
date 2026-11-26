import type { Publication } from '@/lib/types'

/**
 * "Sohel, A., Turjy, R. C. D., Paul, S. P., & Alhajj, R." → ["Sohel, A.", "Turjy, R. C. D.", …].
 * Initials tokens are glued back onto the surname before them; single-name
 * authors (e.g. "Ohidujjaman") stay on their own. Equal-contribution marks are dropped.
 */
export function splitAuthors(authors: string): string[] {
  const cleaned = authors
    .replace(/\(\s*†[^)]*\)/g, '')
    .replace(/[†*¹²³⁴⁵⁶⁷⁸⁹⁰]/g, '')
    .replace(/\s*&\s*/g, ', ')
    .replace(/\s+/g, ' ')
    .trim()
  const out: string[] = []
  for (const raw of cleaned.split(',')) {
    const tok = raw.trim()
    if (!tok) continue
    if (/^([A-Z]\.\s?)+$/.test(tok) && out.length) out[out.length - 1] += `, ${tok}`
    else out.push(tok)
  }
  return out
}

const TYPE: Record<string, string> = {
  'Journal Article': 'article',
  'Book Chapter': 'incollection',
  'Conference Paper': 'inproceedings',
  'Conference Proceedings': 'inproceedings',
}

const esc = (s: string) => s.replace(/[{}]/g, '').trim()

export function toBibtex(pub: Publication): string {
  const authors = splitAuthors(pub.authors)
  const surname = (authors[0]?.split(',')[0] ?? 'paper').toLowerCase().replace(/[^a-z]/g, '')
  const year = (pub.year.match(/\d{4}/) ?? [''])[0]
  const word = (pub.title.toLowerCase().match(/[a-z]{4,}/) ?? ['paper'])[0]
  const kind = TYPE[pub.type] ?? 'misc'
  const venueField = kind === 'article' ? 'journal' : kind === 'misc' ? 'howpublished' : 'booktitle'
  const doi = pub.doi && /^10\./.test(pub.doi.trim()) ? pub.doi.trim() : ''

  const fields: [string, string][] = [
    ['title', `{${esc(pub.title)}}`],
    ['author', authors.join(' and ')],
    ...(pub.journal ? [[venueField, esc(pub.journal.replace(/\s*\(Q\d\)/g, ''))] as [string, string]] : []),
    ...(year ? [['year', year] as [string, string]] : []),
    ...(pub.volume ? [['volume', esc(pub.volume)] as [string, string]] : []),
    ...(doi ? [['doi', doi] as [string, string]] : []),
    ...(!/^(Published|Accepted)/.test(pub.status) ? [['note', pub.status] as [string, string]] : []),
  ]
  const body = fields.map(([k, v]) => `  ${k} = {${v}}`).join(',\n')
  return `@${kind}{${surname}${year}${word},\n${body}\n}`
}
