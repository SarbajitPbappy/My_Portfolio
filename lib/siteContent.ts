import { siteConfig } from '@/lib/site'

/**
 * Admin-editable homepage content that isn't tied to a database table of its
 * own: the hero's research line, availability, highlights, "Latest" strip,
 * research questions and awards. Stored as one JSON value in
 * `settings.site_content`; anything missing falls back to `lib/site.ts`.
 */

export interface Fact {
  value: string
  label: string
}
export interface NewsItem {
  date: string
  text: string
}
export interface Award {
  title: string
  detail: string
  year: string
}
export interface ResearchQuestion {
  q: string
  note: string
}

export interface SiteContent {
  headshotUrl: string
  shortTitle: string
  scholarUrl: string
  orcidUrl: string
  location: string
  researchLine: string
  availability: string
  facts: Fact[]
  news: NewsItem[]
  researchQuestions: ResearchQuestion[]
  awards: Award[]
  fig1Caption: string
  fig2Caption: string
}

export const defaultSiteContent: SiteContent = {
  headshotUrl: siteConfig.headshot,
  shortTitle: siteConfig.shortTitle,
  scholarUrl: siteConfig.social.scholar,
  orcidUrl: siteConfig.social.orcid,
  location: siteConfig.location,
  researchLine: siteConfig.researchLine,
  availability: siteConfig.availability,
  facts: siteConfig.facts.map((f) => ({ ...f })),
  news: siteConfig.news.map((n) => ({ ...n })),
  researchQuestions: siteConfig.researchQuestions.map((r) => ({ ...r })),
  awards: siteConfig.awards.map((a) => ({ ...a })),
  fig1Caption:
    'Explanation, not just prediction. A Grad-CAM-style map shows which regions drive a classifier’s output. Move the pointer over the slice to inspect it. Synthetic image, for illustration.',
  fig2Caption:
    'Federated learning across hospitals. Each site trains on its own patients; only model updates travel to the aggregator, which returns a weighted average (FedAvg). Patient images never leave the hospital. Schematic.',
}

// The portrait must be a site path or an image in this project's Supabase storage.
function safeImage(v: unknown, fallback: string) {
  if (typeof v !== 'string' || !v) return fallback
  if (/^\/[^/]/.test(v)) return v
  if (/^https:\/\/[a-z0-9-]+\.supabase\.co\/storage\/v1\/object\/public\//i.test(v)) return v
  return fallback
}

function safeUrl(v: unknown, fallback: string) {
  return typeof v === 'string' && /^https?:\/\//i.test(v) ? v : typeof v === 'string' && v === '' ? '' : fallback
}

const str = (v: unknown, fallback: string) => (typeof v === 'string' ? v : fallback)

function list<T>(v: unknown, fallback: T[], pick: (o: Record<string, unknown>) => T): T[] {
  if (!Array.isArray(v)) return fallback
  return v.filter((o) => o && typeof o === 'object').map((o) => pick(o as Record<string, unknown>))
}

/** Merge a stored (possibly partial or malformed) value over the defaults. */
export function mergeSiteContent(raw: unknown): SiteContent {
  const d = defaultSiteContent
  if (!raw || typeof raw !== 'object') return d
  const r = raw as Record<string, unknown>
  return {
    headshotUrl: safeImage(r.headshotUrl, d.headshotUrl),
    shortTitle: str(r.shortTitle, d.shortTitle),
    scholarUrl: safeUrl(r.scholarUrl, d.scholarUrl),
    orcidUrl: safeUrl(r.orcidUrl, d.orcidUrl),
    location: str(r.location, d.location),
    researchLine: str(r.researchLine, d.researchLine),
    availability: str(r.availability, d.availability),
    facts: list(r.facts, d.facts, (o) => ({ value: str(o.value, ''), label: str(o.label, '') })),
    news: list(r.news, d.news, (o) => ({ date: str(o.date, ''), text: str(o.text, '') })),
    researchQuestions: list(r.researchQuestions, d.researchQuestions, (o) => ({
      q: str(o.q, ''),
      note: str(o.note, ''),
    })),
    awards: list(r.awards, d.awards, (o) => ({
      title: str(o.title, ''),
      detail: str(o.detail, ''),
      year: str(o.year, ''),
    })),
    fig1Caption: str(r.fig1Caption, d.fig1Caption),
    fig2Caption: str(r.fig2Caption, d.fig2Caption),
  }
}
