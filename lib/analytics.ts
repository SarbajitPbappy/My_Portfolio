import { createClient } from '@supabase/supabase-js'
import type {
  AnalyticsBreakdownRow,
  AnalyticsClickRow,
  AnalyticsDailyPoint,
  AnalyticsStats,
  AnalyticsSummary,
  AnalyticsVisitors,
  VisitorEvent,
  VisitorSession,
} from './types'

/**
 * Privacy-friendly, first-party visitor counting.
 *
 * No cookies and no localStorage; no IP address or user agent is ever stored.
 * A hit records only a salted hash of (ip + user-agent) where the salt rotates
 * every UTC day, so a visitor is countable within a day but not linkable across
 * days. See create_analytics_table.sql for the schema and read functions.
 */

const supabaseConfigured = () =>
  !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

/**
 * A dedicated client, not the shared one from lib/supabase.
 *
 * Next.js patches global fetch and caches responses in its Data Cache; a hit
 * counter served from that cache reports stale (often zero) numbers. Forcing
 * `no-store` keeps every read live. HTTP-level caching for the public footer is
 * set on the route response instead, where it can be reasoned about.
 */
const analyticsDb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key',
  {
    auth: { persistSession: false },
    global: {
      fetch: (input, init) => fetch(input, { ...init, cache: 'no-store' }),
    },
  }
)

// Reuses the admin secret purely as hash salt material — it never leaves the server.
const SALT_SECRET =
  process.env.AUTH_SECRET || process.env.ADMIN_PASSWORD || 'dev-analytics-salt'

// Anything that self-identifies as automation. Bots are counted by nobody as
// "people visiting the site", so they are dropped before they reach the DB.
const BOT_UA =
  /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|embedly|quora link|pinterest|whatsapp|telegram|discord|preview|scrape|curl|wget|python-requests|axios|node-fetch|okhttp|headless|lighthouse|pagespeed|gtmetrix|uptime|monitoring|ahrefs|semrush|mj12|dotbot|petalbot|screaming frog|chatgpt|gptbot|claudebot|anthropic|perplexity|applebot|yandex|baiduspider|duckduckbot/i

const TABLET_UA = /ipad|tablet|playbook|silk|kindle|android(?!.*mobile)/i
const MOBILE_UA = /mobile|iphone|ipod|android|blackberry|opera mini|iemobile|webos/i

// Paths that are never part of "who is reading my portfolio".
const IGNORED_PATH = /^\/(admin|api|_next|favicon|icon|manifest|robots|sitemap)/

const enc = new TextEncoder()

async function sha256Hex(input: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', enc.encode(input))
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export function isBot(userAgent?: string | null): boolean {
  if (!userAgent || userAgent.length < 8) return true // empty/absent UA is not a browser
  return BOT_UA.test(userAgent)
}

export function deviceFromUserAgent(userAgent?: string | null): string {
  if (!userAgent) return 'unknown'
  if (TABLET_UA.test(userAgent)) return 'tablet'
  if (MOBILE_UA.test(userAgent)) return 'mobile'
  return 'desktop'
}

// Coarse browser/OS names for the visit detail panel. Order matters: Edge and
// Opera both claim "Chrome", and Chrome claims "Safari".
const BROWSERS: Array<[RegExp, string]> = [
  [/edg(?:e|ios|a)?\//i, 'Edge'],
  [/opr\/|opera/i, 'Opera'],
  [/samsungbrowser/i, 'Samsung Internet'],
  [/firefox|fxios/i, 'Firefox'],
  [/chrome|crios/i, 'Chrome'],
  [/safari/i, 'Safari'],
]

const OSES: Array<[RegExp, string]> = [
  [/windows nt 10|windows nt 11/i, 'Windows'],
  [/windows/i, 'Windows'],
  [/iphone|ipad|ipod/i, 'iOS'],
  [/mac os x|macintosh/i, 'macOS'],
  [/android/i, 'Android'],
  [/linux/i, 'Linux'],
]

function matchFirst(pairs: Array<[RegExp, string]>, ua: string): string | null {
  for (const [pattern, name] of pairs) if (pattern.test(ua)) return name
  return null
}

export function browserFromUserAgent(userAgent?: string | null): string | null {
  return userAgent ? matchFirst(BROWSERS, userAgent) : null
}

export function osFromUserAgent(userAgent?: string | null): string | null {
  return userAgent ? matchFirst(OSES, userAgent) : null
}

/** First hop from the CDN/proxy chain. Used for hashing only — never stored. */
export function clientIpFrom(headers: Headers): string {
  return (
    headers.get('cf-connecting-ip') ||
    headers.get('x-real-ip') ||
    headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    'unknown'
  )
}

/** 2-letter country code, when the edge provides one (Cloudflare or Vercel). */
export function countryFrom(headers: Headers): string | null {
  const code = headers.get('cf-ipcountry') || headers.get('x-vercel-ip-country')
  if (!code || code === 'XX' || code === 'T1') return null
  return code.slice(0, 2).toUpperCase()
}

/**
 * Daily-rotating pseudonymous visitor id. The date component means yesterday's
 * hash for the same person is a different value, so the table cannot be used to
 * follow anyone over time.
 */
export async function visitorHash(ip: string, userAgent: string): Promise<string> {
  const utcDay = new Date().toISOString().slice(0, 10)
  const hash = await sha256Hex(`${SALT_SECRET}|${utcDay}|${ip}|${userAgent}`)
  return hash.slice(0, 32)
}

/** Strips query/hash, trailing slashes and non-content paths. Null = don't track. */
export function normalizePath(raw?: unknown): string | null {
  if (typeof raw !== 'string') return null
  let path = raw.split('?')[0].split('#')[0].trim()
  if (!path.startsWith('/') || path.length > 200) return null
  if (path.length > 1) path = path.replace(/\/+$/, '') || '/'
  if (IGNORED_PATH.test(path)) return null
  return path
}

/** Referring hostname only. Self-referrals and unparseable values become null ("Direct"). */
export function normalizeReferrer(raw?: unknown, selfHost?: string | null): string | null {
  if (typeof raw !== 'string' || !raw) return null
  const strip = (h: string) => h.replace(/^www\./, '').toLowerCase()
  try {
    const host = strip(new URL(raw).hostname)
    if (!host) return null
    if (selfHost && host === strip(selfHost)) return null
    return host.slice(0, 120)
  } catch {
    return null
  }
}

// Collapses reloads and React double-invocations: the same visitor hitting the
// same path inside the window counts once. Per serverless instance, which is
// enough to absorb the noisy cases without a round-trip to the DB.
const DEDUPE_MS = 60_000
const recentHits = new Map<string, number>()

function isDuplicateHit(key: string): boolean {
  const now = Date.now()
  const seenAt = recentHits.get(key)
  if (seenAt && now - seenAt < DEDUPE_MS) return true

  if (recentHits.size > 5000) {
    for (const [k, t] of recentHits) {
      if (now - t >= DEDUPE_MS) recentHits.delete(k)
    }
  }
  recentHits.set(key, now)
  return false
}

export interface PageViewInput {
  path: string
  referrer: string | null
  visitor_hash: string
  country: string | null
  device: string
}

/** Returns false when the hit was deduped or storage is unavailable. */
export async function recordPageView(hit: PageViewInput): Promise<boolean> {
  if (!supabaseConfigured()) return false
  if (isDuplicateHit(`${hit.visitor_hash}|${hit.path}`)) return false

  const { error } = await analyticsDb.from('page_views').insert(hit)
  if (error) {
    console.error('Analytics insert failed:', error.message)
    return false
  }
  return true
}

const EMPTY_SUMMARY: AnalyticsSummary = {
  total_views: 0,
  total_visitors: 0,
  today_views: 0,
  today_visitors: 0,
}

function toNumber(value: unknown): number {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

function toRows(data: unknown): AnalyticsBreakdownRow[] {
  if (!Array.isArray(data)) return []
  return data.map((row: any) => ({
    label: String(row?.label ?? 'Unknown'),
    views: toNumber(row?.views),
    visitors: toNumber(row?.visitors),
  }))
}

/** All-time + today totals. Powers the public footer counter. */
export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  if (!supabaseConfigured()) return EMPTY_SUMMARY

  const { data, error } = await analyticsDb.rpc('analytics_summary')
  if (error) {
    console.error('Analytics summary failed:', error.message)
    return EMPTY_SUMMARY
  }

  const row = Array.isArray(data) ? data[0] : data
  if (!row) return EMPTY_SUMMARY

  return {
    total_views: toNumber(row.total_views),
    total_visitors: toNumber(row.total_visitors),
    today_views: toNumber(row.today_views),
    today_visitors: toNumber(row.today_visitors),
  }
}

/**
 * Everything the admin dashboard renders, for a window of `days` days ending
 * today. `configured` is false when the SQL migration has not been run yet, so
 * the UI can say so instead of showing a misleading wall of zeroes.
 */
export async function getAnalyticsStats(days: number): Promise<AnalyticsStats> {
  const window = Math.min(Math.max(Math.trunc(days) || 30, 1), 365)

  const empty: AnalyticsStats = {
    days: window,
    totals: { views: 0, visitors: 0 },
    previous: { views: 0, visitors: 0 },
    allTime: EMPTY_SUMMARY,
    daily: [],
    paths: [],
    referrers: [],
    devices: [],
    countries: [],
    configured: false,
  }

  if (!supabaseConfigured()) return empty

  // Pull twice the window in one query so the preceding period is available for
  // the deltas without a second round-trip.
  const [daily, paths, referrers, devices, countries, allTime] = await Promise.all([
    analyticsDb.rpc('analytics_daily', { p_days: window * 2 }),
    analyticsDb.rpc('analytics_top_paths', { p_days: window, p_limit: 8 }),
    analyticsDb.rpc('analytics_top_referrers', { p_days: window, p_limit: 8 }),
    analyticsDb.rpc('analytics_devices', { p_days: window }),
    analyticsDb.rpc('analytics_top_countries', { p_days: window, p_limit: 8 }),
    getAnalyticsSummary(),
  ])

  if (daily.error) {
    console.error('Analytics daily failed:', daily.error.message)
    return empty
  }

  const full: AnalyticsDailyPoint[] = Array.isArray(daily.data)
    ? daily.data.map((row: any) => ({
        day: String(row?.day ?? '').slice(0, 10),
        views: toNumber(row?.views),
        visitors: toNumber(row?.visitors),
      }))
    : []

  const series = full.slice(-window)
  const priorSeries = full.slice(0, Math.max(full.length - window, 0))
  const sum = (points: AnalyticsDailyPoint[], key: 'views' | 'visitors') =>
    points.reduce((total, point) => total + point[key], 0)

  return {
    days: window,
    totals: {
      views: sum(series, 'views'),
      // Daily salt rotation means range visitors are the sum of daily uniques.
      visitors: sum(series, 'visitors'),
    },
    previous: {
      views: sum(priorSeries, 'views'),
      visitors: sum(priorSeries, 'visitors'),
    },
    allTime,
    daily: series,
    paths: toRows(paths.data),
    referrers: toRows(referrers.data),
    devices: toRows(devices.data),
    countries: toRows(countries.data),
    configured: true,
  }
}

// --- Sessions & click tracking ----------------------------------------------

const MAX_EVENTS_PER_BATCH = 50
const SESSION_ID_RE = /^[A-Za-z0-9_-]{8,64}$/

export interface IngestEvent {
  kind: 'pageview' | 'click'
  path?: string | null
  label?: string | null
  target?: string | null
  href?: string | null
  offset?: number
}

export interface IngestInput {
  session_id: string
  visitor_hash: string
  path: string | null
  referrer: string | null
  country: string | null
  device: string
  browser: string | null
  os: string | null
  screen: string | null
  events: IngestEvent[]
}

export function isValidSessionId(value: unknown): value is string {
  return typeof value === 'string' && SESSION_ID_RE.test(value)
}

const clip = (value: unknown, max: number): string | null => {
  if (typeof value !== 'string') return null
  const trimmed = value.replace(/\s+/g, ' ').trim()
  return trimmed ? trimmed.slice(0, max) : null
}

/**
 * Sanitizes a client-supplied event batch. Everything here arrives from the
 * visitor's browser, so lengths are clipped, unknown kinds are dropped and the
 * batch is capped — the DB never sees raw client strings.
 */
export function normalizeEvents(raw: unknown): IngestEvent[] {
  if (!Array.isArray(raw)) return []

  const events: IngestEvent[] = []
  for (const item of raw.slice(0, MAX_EVENTS_PER_BATCH)) {
    const kind = (item as any)?.kind
    if (kind !== 'pageview' && kind !== 'click') continue

    const offset = Number((item as any)?.offset)
    events.push({
      kind,
      // A pageview's path must survive normalizePath; a click just rides along
      // with whatever page it happened on.
      path: normalizePath((item as any)?.path) ?? clip((item as any)?.path, 200),
      label: clip((item as any)?.label, 120),
      target: clip((item as any)?.target, 120),
      href: clip((item as any)?.href, 300),
      offset: Number.isFinite(offset) && offset >= 0 ? Math.min(Math.trunc(offset), 86_400_000) : 0,
    })
  }
  return events
}

/** Writes one batch. Returns false if storage is unavailable or the SQL is missing. */
export async function ingestAnalyticsBatch(input: IngestInput): Promise<boolean> {
  if (!supabaseConfigured()) return false

  const { error } = await analyticsDb.rpc('analytics_ingest', { p_payload: input })
  if (!error) return true

  console.error('Analytics ingest failed:', error.message)

  // The tracker posts only here, so a missing analytics_ingest would silently
  // stop the visitor counters that already work. Fall back to writing pageviews
  // straight to page_views: session detail is lost until
  // create_analytics_sessions.sql is run, the headline numbers are not.
  for (const event of input.events) {
    if (event.kind === 'pageview' && event.path) {
      await recordPageView({
        path: event.path,
        referrer: input.referrer,
        visitor_hash: input.visitor_hash,
        country: input.country,
        device: input.device,
      })
    }
  }
  return false
}

const EMPTY_VISITORS: AnalyticsVisitors = {
  days: 7,
  engagement: {
    sessions: 0,
    avg_duration_seconds: 0,
    median_duration_seconds: 0,
    avg_pages: 0,
    total_clicks: 0,
    bounce_rate: 0,
  },
  sessions: [],
  topClicks: [],
  configured: false,
}

/** Recent visits + engagement summary + what people clicked, for the admin panel. */
export async function getAnalyticsVisitors(days: number, limit = 50): Promise<AnalyticsVisitors> {
  const window = Math.min(Math.max(Math.trunc(days) || 7, 1), 365)
  const rows = Math.min(Math.max(Math.trunc(limit) || 50, 1), 200)

  if (!supabaseConfigured()) return { ...EMPTY_VISITORS, days: window }

  const [sessions, engagement, clicks] = await Promise.all([
    analyticsDb.rpc('analytics_sessions', { p_days: window, p_limit: rows }),
    analyticsDb.rpc('analytics_engagement', { p_days: window }),
    analyticsDb.rpc('analytics_top_clicks', { p_days: window, p_limit: 10 }),
  ])

  if (sessions.error) {
    console.error('Analytics sessions failed:', sessions.error.message)
    return { ...EMPTY_VISITORS, days: window }
  }

  const engagementRow: any = Array.isArray(engagement.data) ? engagement.data[0] : engagement.data

  return {
    days: window,
    engagement: {
      sessions: toNumber(engagementRow?.sessions),
      avg_duration_seconds: toNumber(engagementRow?.avg_duration_seconds),
      median_duration_seconds: toNumber(engagementRow?.median_duration_seconds),
      avg_pages: toNumber(engagementRow?.avg_pages),
      total_clicks: toNumber(engagementRow?.total_clicks),
      bounce_rate: toNumber(engagementRow?.bounce_rate),
    },
    sessions: (Array.isArray(sessions.data) ? sessions.data : []).map(
      (row: any): VisitorSession => ({
        session_id: String(row?.session_id ?? ''),
        started_at: String(row?.started_at ?? ''),
        last_seen_at: String(row?.last_seen_at ?? ''),
        duration_seconds: toNumber(row?.duration_seconds),
        entry_path: row?.entry_path ?? null,
        referrer: row?.referrer ?? null,
        country: row?.country ?? null,
        device: row?.device ?? null,
        browser: row?.browser ?? null,
        os: row?.os ?? null,
        screen: row?.screen ?? null,
        page_views: toNumber(row?.page_views),
        clicks: toNumber(row?.clicks),
      })
    ),
    topClicks: (Array.isArray(clicks.data) ? clicks.data : []).map(
      (row: any): AnalyticsClickRow => ({
        label: String(row?.label ?? 'Unlabelled'),
        href: row?.href ?? null,
        clicks: toNumber(row?.clicks),
      })
    ),
    configured: true,
  }
}

/** Full click/page timeline for a single visit. */
export async function getSessionEvents(sessionId: string): Promise<VisitorEvent[]> {
  if (!supabaseConfigured() || !isValidSessionId(sessionId)) return []

  const { data, error } = await analyticsDb.rpc('analytics_session_events', {
    p_session_id: sessionId,
  })
  if (error) {
    console.error('Analytics session events failed:', error.message)
    return []
  }

  return (Array.isArray(data) ? data : []).map(
    (row: any): VisitorEvent => ({
      kind: row?.kind === 'click' ? 'click' : 'pageview',
      path: row?.path ?? null,
      label: row?.label ?? null,
      target: row?.target ?? null,
      href: row?.href ?? null,
      occurred_at: String(row?.occurred_at ?? ''),
      offset_ms: toNumber(row?.offset_ms),
    })
  )
}
