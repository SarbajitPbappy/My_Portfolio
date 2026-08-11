'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ChevronDown,
  Clock,
  Eye,
  Globe2,
  Link2,
  MonitorSmartphone,
  MousePointerClick,
  Timer,
  Users,
} from 'lucide-react'
import type { AnalyticsVisitors, VisitorEvent, VisitorSession } from '@/lib/types'

/**
 * Per-visit detail: when someone arrived (in Bangladesh time), how long they
 * stayed, and every page and click in order.
 */

const TIME_ZONE = 'Asia/Dhaka'

const bdClock = new Intl.DateTimeFormat('en-GB', {
  timeZone: TIME_ZONE,
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: true,
})

const bdFull = new Intl.DateTimeFormat('en-GB', {
  timeZone: TIME_ZONE,
  weekday: 'short',
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: true,
})

const bdDay = new Intl.DateTimeFormat('en-GB', {
  timeZone: TIME_ZONE,
  weekday: 'long',
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

const safeDate = (iso: string) => {
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? null : date
}

const formatClock = (iso: string) => {
  const date = safeDate(iso)
  return date ? bdClock.format(date) : '—'
}

const formatFull = (iso: string) => {
  const date = safeDate(iso)
  return date ? `${bdFull.format(date)} (BD time)` : '—'
}

const formatDayKey = (iso: string) => {
  const date = safeDate(iso)
  return date ? bdDay.format(date) : 'Unknown date'
}

/** 45s · 3m 12s · 1h 04m */
function formatDuration(totalSeconds: number): string {
  const seconds = Math.max(0, Math.round(totalSeconds))
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ${String(seconds % 60).padStart(2, '0')}s`
  return `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, '0')}m`
}

/** Offset from the start of the visit, as +m:ss */
function formatOffset(ms: number): string {
  const seconds = Math.max(0, Math.round(ms / 1000))
  return `+${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
}

function relativeFromNow(iso: string): string {
  const date = safeDate(iso)
  if (!date) return ''
  const seconds = Math.round((Date.now() - date.getTime()) / 1000)
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hr ago`
  return `${Math.floor(seconds / 86400)} d ago`
}

const regionNames =
  typeof Intl !== 'undefined' && 'DisplayNames' in Intl
    ? new Intl.DisplayNames(['en'], { type: 'region' })
    : null

function countryLabel(code: string | null): string {
  if (!code || !/^[A-Z]{2}$/.test(code)) return 'Unknown'
  const flag = String.fromCodePoint(...[...code].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65))
  try {
    return `${flag}  ${regionNames?.of(code) || code}`
  } catch {
    return `${flag}  ${code}`
  }
}

function StatTile({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string
  value: string
  hint?: string
  icon: React.ElementType
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
        <Icon className="w-4 h-4" aria-hidden="true" />
        {label}
      </div>
      <div className="mt-2 text-3xl font-semibold text-gray-900 dark:text-gray-100">{value}</div>
      {hint && <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">{hint}</div>}
    </div>
  )
}

function Timeline({ events, loading }: { events: VisitorEvent[]; loading: boolean }) {
  if (loading) {
    return <p className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">Loading timeline…</p>
  }
  if (events.length === 0) {
    return (
      <p className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
        No events recorded for this visit.
      </p>
    )
  }

  return (
    <ol className="space-y-1 px-4 py-3">
      {events.map((event, i) => {
        const isClick = event.kind === 'click'
        const Icon = isClick ? MousePointerClick : Eye
        return (
          <li key={`${event.occurred_at}-${i}`} className="flex items-start gap-3 text-sm">
            <span
              className="w-14 shrink-0 pt-0.5 text-xs text-gray-500 dark:text-gray-400"
              style={{ fontVariantNumeric: 'tabular-nums' }}
              title={formatFull(event.occurred_at)}
            >
              {formatOffset(event.offset_ms)}
            </span>
            <Icon
              className={`mt-0.5 w-4 h-4 shrink-0 ${
                isClick ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400'
              }`}
              aria-hidden="true"
            />
            <div className="min-w-0 flex-1">
              <span className="text-gray-900 dark:text-gray-100">
                {isClick ? 'Clicked ' : 'Viewed '}
                <span className="font-medium">
                  {isClick ? event.label || event.target || 'element' : event.path || '/'}
                </span>
              </span>
              <div className="truncate text-xs text-gray-500 dark:text-gray-400">
                {formatClock(event.occurred_at)}
                {isClick && event.path ? ` · on ${event.path}` : ''}
                {event.href ? ` · → ${event.href}` : ''}
              </div>
            </div>
          </li>
        )
      })}
    </ol>
  )
}

function SessionRow({ session }: { session: VisitorSession }) {
  const [open, setOpen] = useState(false)
  const [events, setEvents] = useState<VisitorEvent[] | null>(null)
  const [loading, setLoading] = useState(false)

  const toggle = async () => {
    const next = !open
    setOpen(next)
    if (!next || events) return

    setLoading(true)
    try {
      const res = await fetch(
        `/api/analytics/visitors?session=${encodeURIComponent(session.session_id)}`,
        { cache: 'no-store' }
      )
      const data = await res.json()
      setEvents(Array.isArray(data.events) ? data.events : [])
    } catch {
      setEvents([])
    } finally {
      setLoading(false)
    }
  }

  const device = [session.device, session.browser, session.os].filter(Boolean).join(' · ') || 'Unknown device'

  return (
    <li className="border-t border-gray-100 dark:border-gray-800 first:border-t-0">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        className="flex w-full items-center gap-4 px-4 py-3 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/40"
      >
        <ChevronDown
          className={`w-4 h-4 shrink-0 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />

        <div className="w-32 shrink-0">
          <div
            className="font-medium text-gray-900 dark:text-gray-100"
            style={{ fontVariantNumeric: 'tabular-nums' }}
            title={formatFull(session.started_at)}
          >
            {formatClock(session.started_at)}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {relativeFromNow(session.started_at)}
          </div>
        </div>

        <div className="w-24 shrink-0 text-sm text-gray-700 dark:text-gray-300">
          {formatDuration(session.duration_seconds)}
        </div>

        <div className="min-w-0 flex-1">
          <div className="truncate text-sm text-gray-700 dark:text-gray-300">
            {countryLabel(session.country)} · {device}
          </div>
          <div className="truncate text-xs text-gray-500 dark:text-gray-400">
            Landed on {session.entry_path || '/'} · from {session.referrer || 'Direct'}
            {session.screen ? ` · ${session.screen}` : ''}
          </div>
        </div>

        <div
          className="flex shrink-0 items-center gap-4 text-sm text-gray-600 dark:text-gray-400"
          style={{ fontVariantNumeric: 'tabular-nums' }}
        >
          <span className="inline-flex items-center gap-1.5" title="Pages viewed">
            <Eye className="w-4 h-4" aria-hidden="true" />
            {session.page_views}
          </span>
          <span className="inline-flex items-center gap-1.5" title="Clicks">
            <MousePointerClick className="w-4 h-4" aria-hidden="true" />
            {session.clicks}
          </span>
        </div>
      </button>

      {open && (
        <div className="bg-gray-50 dark:bg-gray-900/40">
          <Timeline events={events || []} loading={loading} />
        </div>
      )}
    </li>
  )
}

export default function VisitorsPanel({ days, refreshKey }: { days: number; refreshKey: number }) {
  const [data, setData] = useState<AnalyticsVisitors | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const requestId = useRef(0)

  const load = useCallback(async (range: number) => {
    const id = ++requestId.current
    setLoading(true)
    try {
      const res = await fetch(`/api/analytics/visitors?days=${range}&limit=100`, {
        cache: 'no-store',
      })
      if (!res.ok) {
        throw new Error(res.status === 401 ? 'Session expired — log in again.' : 'Could not load visits.')
      }
      const payload: AnalyticsVisitors = await res.json()
      if (id !== requestId.current) return
      setData(payload)
      setError(null)
    } catch (err: any) {
      if (id !== requestId.current) return
      setError(err?.message || 'Could not load visits.')
    } finally {
      if (id === requestId.current) setLoading(false)
    }
  }, [])

  useEffect(() => {
    load(days)
  }, [days, refreshKey, load])

  // Visits are grouped by Bangladesh calendar day, not UTC, so the headings
  // match the times shown in each row.
  const grouped = useMemo(() => {
    const groups = new Map<string, VisitorSession[]>()
    for (const session of data?.sessions || []) {
      const key = formatDayKey(session.started_at)
      const bucket = groups.get(key)
      if (bucket) bucket.push(session)
      else groups.set(key, [session])
    }
    return [...groups.entries()]
  }, [data])

  const engagement = data?.engagement
  const maxClicks = Math.max(1, ...(data?.topClicks || []).map((c) => c.clicks))

  return (
    <div className={`space-y-6 transition-opacity ${loading && data ? 'opacity-60' : ''}`}>
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {data && !data.configured && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Visit tracking isn&apos;t set up yet. Run{' '}
          <code className="font-mono">create_analytics_sessions.sql</code> once in the Supabase SQL
          Editor, then reload this page.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label={`Visits · last ${days} days`}
          value={(engagement?.sessions ?? 0).toLocaleString('en-US')}
          hint="one per browser tab session"
          icon={Users}
        />
        <StatTile
          label="Average time on site"
          value={formatDuration(engagement?.avg_duration_seconds ?? 0)}
          hint={`median ${formatDuration(engagement?.median_duration_seconds ?? 0)}`}
          icon={Timer}
        />
        <StatTile
          label="Pages per visit"
          value={(engagement?.avg_pages ?? 0).toFixed(2)}
          hint={`${(engagement?.total_clicks ?? 0).toLocaleString('en-US')} clicks recorded`}
          icon={MonitorSmartphone}
        />
        <StatTile
          label="Bounce rate"
          value={`${(engagement?.bounce_rate ?? 0).toFixed(1)}%`}
          hint="one page, no clicks"
          icon={Link2}
        />
      </div>

      {(data?.topClicks?.length ?? 0) > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
            <MousePointerClick className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" />
            Most clicked
          </h3>
          <ul className="mt-4 space-y-3">
            {data!.topClicks.map((row) => (
              <li key={`${row.label}-${row.href ?? ''}`}>
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="truncate text-gray-700 dark:text-gray-300" title={row.href || row.label}>
                    {row.label}
                  </span>
                  <span
                    className="shrink-0 font-medium text-gray-900 dark:text-gray-100"
                    style={{ fontVariantNumeric: 'tabular-nums' }}
                  >
                    {row.clicks.toLocaleString('en-US')}
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 rounded-full overflow-hidden bg-primary-100 dark:bg-primary-900/40">
                  <div
                    className="h-full rounded-full bg-primary-600 dark:bg-primary-400"
                    style={{ width: `${Math.max((row.clicks / maxClicks) * 100, 2)}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 dark:border-gray-700 px-5 py-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
            <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" />
            Recent visits
          </h3>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            All times are Bangladesh time (UTC+6) · click a row for the full timeline
          </span>
        </div>

        {grouped.length === 0 ? (
          <p className="px-5 py-6 text-sm text-gray-500 dark:text-gray-400">
            {loading ? 'Loading visits…' : 'No visits recorded in this range yet.'}
          </p>
        ) : (
          grouped.map(([day, sessions]) => (
            <section key={day}>
              <h4 className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-900/60 px-5 py-2 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                {day} · {sessions.length} {sessions.length === 1 ? 'visit' : 'visits'}
              </h4>
              <ul>
                {sessions.map((session) => (
                  <SessionRow key={session.session_id} session={session} />
                ))}
              </ul>
            </section>
          ))
        )}
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400">
        A visit lasts as long as the browser tab stays open. Duration is measured from the first to
        the last signal received, so a tab left open in the background can read longer than the time
        actually spent reading. Text typed into forms is never recorded — only which element was
        clicked. Visitors sending Do Not Track are not tracked at all.
      </p>
    </div>
  )
}
