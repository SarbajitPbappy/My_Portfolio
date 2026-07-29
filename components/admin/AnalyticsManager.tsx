'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Eye,
  Globe2,
  Link2,
  MonitorSmartphone,
  RefreshCw,
  Table2,
  TrendingUp,
  Users,
} from 'lucide-react'
import type { AnalyticsBreakdownRow, AnalyticsStats } from '@/lib/types'

/**
 * Visitor analytics dashboard.
 *
 * Chart colors are two validated steps of the project's `primary` ramp
 * (light #0369a1 / #38bdf8, dark #7dd3fc / #0284c7) — one hue, monotone
 * lightness, light end clear of the card surface in both modes. They live as
 * CSS variables so the light/dark pair swaps in one place.
 */

const RANGES = [
  { days: 1, label: 'Today' },
  { days: 7, label: '7 days' },
  { days: 30, label: '30 days' },
  { days: 90, label: '90 days' },
]

const PLOT_HEIGHT = 220

const VIZ_TOKENS = `
.viz {
  --viz-surface: #ffffff;
  --viz-visitors: #0369a1;
  --viz-repeat: #38bdf8;
  --viz-accent: #0284c7;
  --viz-track: #e0f2fe;
  --viz-grid: #e9eaee;
  --viz-axis: #d5d7dd;
}
.dark .viz {
  --viz-surface: #1f2937;
  --viz-visitors: #7dd3fc;
  --viz-repeat: #0284c7;
  --viz-accent: #38bdf8;
  --viz-track: #0c4a6e;
  --viz-grid: #374151;
  --viz-axis: #4b5563;
}
`

const EMPTY_STATS: AnalyticsStats = {
  days: 30,
  totals: { views: 0, visitors: 0 },
  previous: { views: 0, visitors: 0 },
  allTime: { total_views: 0, total_visitors: 0, today_views: 0, today_visitors: 0 },
  daily: [],
  paths: [],
  referrers: [],
  devices: [],
  countries: [],
  configured: true,
}

// --- formatting -------------------------------------------------------------

const full = (n: number) => n.toLocaleString('en-US')

/** Big standalone values stay readable: 1,284 → "1,284", 12,900 → "12.9K". */
function compact(n: number): string {
  if (n < 10_000) return full(n)
  if (n < 1_000_000) return `${(n / 1000).toFixed(n < 100_000 ? 1 : 0)}K`
  return `${(n / 1_000_000).toFixed(1)}M`
}

function formatDay(iso: string, withYear = false): string {
  const date = new Date(`${iso}T00:00:00`)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    ...(withYear ? { year: 'numeric' } : {}),
  })
}

const regionNames =
  typeof Intl !== 'undefined' && 'DisplayNames' in Intl
    ? new Intl.DisplayNames(['en'], { type: 'region' })
    : null

function countryLabel(code: string): string {
  if (!/^[A-Z]{2}$/.test(code)) return code
  const flag = String.fromCodePoint(
    ...[...code].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65)
  )
  let name = code
  try {
    name = regionNames?.of(code) || code
  } catch {
    /* unknown region code — fall back to the code itself */
  }
  return `${flag}  ${name}`
}

/** Rounds an axis maximum up to a clean number (5 / 20 / 250 / 1,000). */
function niceCeil(value: number): number {
  if (value <= 4) return 4
  const magnitude = 10 ** Math.floor(Math.log10(value))
  const normalized = value / magnitude
  const step =
    normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 4 ? 4 : normalized <= 5 ? 5 : normalized <= 8 ? 8 : 10
  return step * magnitude
}

/** Keeps an edge-anchored absolute label inside its track instead of hanging off it. */
function anchorAt(percent: number): { left: string; transform: string } {
  if (percent <= 4) return { left: '0%', transform: 'translateX(0)' }
  if (percent >= 96) return { left: '100%', transform: 'translateX(-100%)' }
  return { left: `${percent}%`, transform: 'translateX(-50%)' }
}

// --- pieces -----------------------------------------------------------------

function Delta({ current, previous, days }: { current: number; previous: number; days: number }) {
  if (previous <= 0) {
    return (
      <span className="text-xs text-gray-500 dark:text-gray-400">
        no prior {days === 1 ? 'day' : `${days}-day period`} to compare
      </span>
    )
  }

  const pct = Math.round(((current - previous) / previous) * 100)
  const Icon = pct > 0 ? ArrowUpRight : pct < 0 ? ArrowDownRight : ArrowRight
  // Status hues, paired with an icon and a label — never color alone.
  const tone =
    pct > 0
      ? 'text-[#006300] dark:text-[#0ca30c]'
      : pct < 0
      ? 'text-[#d03b3b]'
      : 'text-gray-500 dark:text-gray-400'

  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${tone}`}>
      <Icon className="w-3.5 h-3.5" aria-hidden="true" />
      {pct > 0 ? '+' : ''}
      {pct}%
      <span className="font-normal text-gray-500 dark:text-gray-400">
        vs previous {days === 1 ? 'day' : `${days} days`}
      </span>
    </span>
  )
}

function StatTile({
  label,
  value,
  hint,
  icon: Icon,
  hero = false,
}: {
  label: string
  value: number
  hint?: React.ReactNode
  icon: React.ElementType
  hero?: boolean
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
        <Icon className="w-4 h-4" aria-hidden="true" />
        {label}
      </div>
      {/* Proportional figures: tabular-nums makes large numbers look loose. */}
      <div
        className={`mt-2 font-semibold text-gray-900 dark:text-gray-100 ${
          hero ? 'text-5xl' : 'text-3xl'
        }`}
        title={full(value)}
      >
        {compact(value)}
      </div>
      {hint && <div className="mt-2">{hint}</div>}
    </div>
  )
}

/** Ranked list. One color for every bar — the categories are nominal, so a
 *  value-ramp would double-encode the length that the meter already shows. */
function BreakdownCard({
  title,
  icon: Icon,
  rows,
  formatLabel = (label: string) => label,
  emptyText,
}: {
  title: string
  icon: React.ElementType
  rows: AnalyticsBreakdownRow[]
  formatLabel?: (label: string) => string
  emptyText: string
}) {
  const max = Math.max(1, ...rows.map((r) => r.visitors))

  return (
    <div className="viz bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
        <Icon className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" />
        {title}
      </h3>

      {rows.length === 0 ? (
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">{emptyText}</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {rows.map((row) => (
            <li key={row.label}>
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="truncate text-gray-700 dark:text-gray-300" title={row.label}>
                  {formatLabel(row.label)}
                </span>
                <span
                  className="shrink-0 font-medium text-gray-900 dark:text-gray-100"
                  style={{ fontVariantNumeric: 'tabular-nums' }}
                  title={`${full(row.visitors)} visitors · ${full(row.views)} views`}
                >
                  {full(row.visitors)}
                </span>
              </div>
              <div
                className="mt-1.5 h-1.5 rounded-full overflow-hidden"
                style={{ background: 'var(--viz-track)' }}
              >
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.max((row.visitors / max) * 100, 2)}%`,
                    background: 'var(--viz-accent)',
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// --- dashboard --------------------------------------------------------------

export default function AnalyticsManager() {
  const [days, setDays] = useState(30)
  const [stats, setStats] = useState<AnalyticsStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hovered, setHovered] = useState<number | null>(null)
  const [showTable, setShowTable] = useState(false)
  const requestId = useRef(0)

  const fetchStats = useCallback(async (range: number) => {
    const id = ++requestId.current
    setLoading(true)
    try {
      const res = await fetch(`/api/analytics/stats?days=${range}`, { cache: 'no-store' })
      if (!res.ok) throw new Error(res.status === 401 ? 'Session expired — log in again.' : 'Could not load analytics.')
      const data: AnalyticsStats = await res.json()
      if (id !== requestId.current) return // a newer range won the race
      setStats(data)
      setError(null)
    } catch (err: any) {
      if (id !== requestId.current) return
      setError(err?.message || 'Could not load analytics.')
    } finally {
      if (id === requestId.current) setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats(days)
  }, [days, fetchStats])

  const data = stats ?? EMPTY_STATS
  const series = data.daily

  const { axisMax, ticks } = useMemo(() => {
    const peak = Math.max(0, ...series.map((d) => d.views))
    const max = niceCeil(peak)
    const raw = [1, 0.75, 0.5, 0.25, 0].map((f) => Math.round(max * f))
    return { axisMax: max, ticks: Array.from(new Set(raw)) }
  }, [series])

  const active = hovered !== null ? series[hovered] : undefined

  const busiest = useMemo(
    () => series.reduce<(typeof series)[number] | undefined>(
      (best, point) => (!best || point.visitors > best.visitors ? point : best),
      undefined
    ),
    [series]
  )

  // Keep the tooltip inside the plot: flip below a tall column, and pin it to
  // the edge instead of letting it hang off the first/last day.
  const tooltipPlacement = useMemo(() => {
    if (hovered === null || !active) return null
    const center = ((hovered + 0.5) / Math.max(series.length, 1)) * 100
    const tall = axisMax > 0 && active.views / axisMax > 0.55
    const anchorX = center < 18 ? 0 : center > 82 ? -100 : -50
    return {
      left: `${center < 18 ? 0 : center > 82 ? 100 : center}%`,
      transform: `translateX(${anchorX}%)`,
      vertical: tall ? { bottom: 8 } : { top: 8 },
    }
  }, [hovered, active, series.length, axisMax])

  // Label every day while they fit, then thin out to ~6 evenly spaced dates,
  // always including the first and last.
  const labelIndices = useMemo(() => {
    if (series.length === 0) return new Set<number>()
    const wanted = series.length <= 10 ? series.length : 6
    const step = (series.length - 1) / Math.max(wanted - 1, 1)
    const picks = new Set<number>()
    for (let i = 0; i < wanted; i++) picks.add(Math.round(i * step))
    picks.add(series.length - 1)
    return picks
  }, [series])

  const hasAnyData = data.allTime.total_views > 0

  return (
    <div className="space-y-6">
      <style>{VIZ_TOKENS}</style>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Site Analytics</h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Cookie-free visitor counts. No IP addresses or user agents are stored — only a
            daily-rotating hash, so a visitor is counted once per day and cannot be tracked
            across days.
          </p>
        </div>

        {/* One filter row, above everything it scopes. */}
        <div className="flex items-center gap-2">
          <div
            className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
            role="group"
            aria-label="Date range"
          >
            {RANGES.map((range) => (
              <button
                key={range.days}
                type="button"
                onClick={() => setDays(range.days)}
                aria-pressed={days === range.days}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  days === range.days
                    ? 'bg-primary-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => fetchStats(days)}
            className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            aria-label="Refresh analytics"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {stats && !stats.configured && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Analytics storage isn&apos;t set up yet. Run{' '}
          <code className="font-mono">create_analytics_table.sql</code> once in the Supabase SQL
          Editor, then reload this page.
        </div>
      )}

      {stats?.configured && !hasAnyData && !loading && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
          No visits recorded yet. Numbers appear here as soon as someone opens the live site.
          Local development traffic is excluded by default.
        </div>
      )}

      {/* Refetch holds the previous render at reduced opacity — no skeleton, no jump. */}
      <div className={`space-y-6 transition-opacity ${loading && stats ? 'opacity-60' : ''}`}>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatTile
            label={days === 1 ? 'Visitors today' : `Visitors · last ${days} days`}
            value={data.totals.visitors}
            icon={Users}
            hero
            hint={<Delta current={data.totals.visitors} previous={data.previous.visitors} days={days} />}
          />
          <StatTile
            label={days === 1 ? 'Page views today' : `Page views · last ${days} days`}
            value={data.totals.views}
            icon={Eye}
            hint={<Delta current={data.totals.views} previous={data.previous.views} days={days} />}
          />
          <StatTile
            label="Busiest day"
            value={busiest?.visitors ?? 0}
            icon={TrendingUp}
            hint={
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {busiest && busiest.visitors > 0
                  ? `visitors on ${formatDay(busiest.day, true)}`
                  : 'no visits in this range yet'}
              </span>
            }
          />
          <StatTile
            label="All time"
            value={data.allTime.total_visitors}
            icon={Globe2}
            hint={
              <span className="text-xs text-gray-500 dark:text-gray-400">
                visitors · {full(data.allTime.total_views)} views
              </span>
            }
          />
        </div>

        {/* Daily trend: total column height = page views, split into unique
            visitors and the repeat views on top of them. One axis, one hue. */}
        <div className="viz bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Daily traffic
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Column height is total page views
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                <span className="inline-flex items-center gap-1.5">
                  <span
                    className="w-3 h-3 rounded-sm"
                    style={{ background: 'var(--viz-visitors)' }}
                    aria-hidden="true"
                  />
                  Unique visitors
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span
                    className="w-3 h-3 rounded-sm"
                    style={{ background: 'var(--viz-repeat)' }}
                    aria-hidden="true"
                  />
                  Repeat views
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowTable((v) => !v)}
                aria-expanded={showTable}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 hover:text-primary-600 transition-colors"
              >
                <Table2 className="w-3.5 h-3.5" aria-hidden="true" />
                {showTable ? 'Hide table' : 'Show table'}
              </button>
            </div>
          </div>

          <div className="mt-5 flex gap-3">
            {/* Y axis */}
            <div
              className="relative shrink-0 text-right text-[11px] text-gray-500 dark:text-gray-400"
              style={{ height: PLOT_HEIGHT, width: 40, fontVariantNumeric: 'tabular-nums' }}
              aria-hidden="true"
            >
              {ticks.map((tick) => (
                <span
                  key={tick}
                  className="absolute right-0 -translate-y-1/2"
                  style={{ top: `${(1 - tick / axisMax) * 100}%` }}
                >
                  {compact(tick)}
                </span>
              ))}
            </div>

            <div className="relative min-w-0 flex-1">
              {/* Solid hairline gridlines, one step off the surface. */}
              <div className="pointer-events-none absolute inset-x-0" style={{ height: PLOT_HEIGHT }}>
                {ticks.map((tick) => (
                  <div
                    key={tick}
                    className="absolute inset-x-0"
                    style={{
                      top: `${(1 - tick / axisMax) * 100}%`,
                      borderTop: `1px solid var(--viz-${tick === 0 ? 'axis' : 'grid'})`,
                    }}
                  />
                ))}
              </div>

              <div
                className="relative flex items-end justify-between gap-[2px]"
                style={{ height: PLOT_HEIGHT }}
                onMouseLeave={() => setHovered(null)}
              >
                {series.map((point, i) => {
                  const repeat = Math.max(point.views - point.visitors, 0)
                  const barPct = axisMax > 0 ? (point.views / axisMax) * 100 : 0
                  const isActive = hovered === i

                  return (
                    <div
                      key={point.day}
                      // The whole column slot is the hit target, not just the painted bar.
                      className="group relative flex h-full min-w-0 flex-1 cursor-default items-end justify-center outline-none"
                      tabIndex={0}
                      role="img"
                      aria-label={`${formatDay(point.day, true)}: ${full(point.visitors)} visitors, ${full(point.views)} page views`}
                      onMouseEnter={() => setHovered(i)}
                      onFocus={() => setHovered(i)}
                      onBlur={() => setHovered(null)}
                    >
                      {isActive && (
                        <div
                          className="pointer-events-none absolute inset-y-0 w-full rounded-sm bg-gray-900/[0.05] dark:bg-white/[0.07]"
                          aria-hidden="true"
                        />
                      )}
                      <div
                        className="relative flex w-full max-w-[24px] flex-col gap-[2px]"
                        style={{ height: `${barPct}%`, minHeight: point.views > 0 ? 3 : 0 }}
                      >
                        {repeat > 0 && (
                          <div
                            className="w-full rounded-t"
                            style={{ flexGrow: repeat, flexBasis: 0, background: 'var(--viz-repeat)' }}
                          />
                        )}
                        {point.visitors > 0 && (
                          <div
                            className={`w-full ${repeat > 0 ? '' : 'rounded-t'}`}
                            style={{
                              flexGrow: point.visitors,
                              flexBasis: 0,
                              background: 'var(--viz-visitors)',
                            }}
                          />
                        )}
                      </div>
                    </div>
                  )
                })}

                {active && tooltipPlacement && (
                  <div
                    className="pointer-events-none absolute z-10 w-max max-w-[200px] rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-lg dark:border-gray-600 dark:bg-gray-900"
                    style={{
                      left: tooltipPlacement.left,
                      transform: tooltipPlacement.transform,
                      ...tooltipPlacement.vertical,
                    }}
                    aria-hidden="true"
                  >
                    <div className="text-[11px] text-gray-500 dark:text-gray-400">
                      {formatDay(active.day, true)}
                    </div>
                    <div className="mt-1 space-y-0.5 text-xs">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-0.5 w-3 rounded-full"
                          style={{ background: 'var(--viz-visitors)' }}
                          aria-hidden="true"
                        />
                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                          {full(active.visitors)}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400">visitors</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className="h-0.5 w-3 rounded-full"
                          style={{ background: 'var(--viz-repeat)' }}
                          aria-hidden="true"
                        />
                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                          {full(active.views)}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400">views</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* X axis band lives inside the card, so nothing gets a nested scrollbar. */}
              <div className="relative mt-2 h-4 text-[11px] text-gray-500 dark:text-gray-400" aria-hidden="true">
                {series.map((point, i) =>
                  labelIndices.has(i) ? (
                    <span
                      key={point.day}
                      className="absolute whitespace-nowrap"
                      style={anchorAt(((i + 0.5) / Math.max(series.length, 1)) * 100)}
                    >
                      {formatDay(point.day)}
                    </span>
                  ) : null
                )}
              </div>
            </div>
          </div>

          {/* Table twin — every plotted value readable without hovering. */}
          {showTable && (
            <div className="mt-5 max-h-72 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700">
              <table className="w-full text-sm">
                <caption className="sr-only">Daily visitors and page views</caption>
                <thead className="sticky top-0 bg-gray-50 dark:bg-gray-900">
                  <tr className="text-left text-xs text-gray-600 dark:text-gray-400">
                    <th scope="col" className="px-3 py-2 font-medium">Date</th>
                    <th scope="col" className="px-3 py-2 text-right font-medium">Visitors</th>
                    <th scope="col" className="px-3 py-2 text-right font-medium">Page views</th>
                  </tr>
                </thead>
                <tbody style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {[...series].reverse().map((point) => (
                    <tr key={point.day} className="border-t border-gray-100 dark:border-gray-800">
                      <th scope="row" className="px-3 py-1.5 text-left font-normal text-gray-700 dark:text-gray-300">
                        {formatDay(point.day, true)}
                      </th>
                      <td className="px-3 py-1.5 text-right text-gray-900 dark:text-gray-100">
                        {full(point.visitors)}
                      </td>
                      <td className="px-3 py-1.5 text-right text-gray-900 dark:text-gray-100">
                        {full(point.views)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <BreakdownCard
            title="Top pages"
            icon={Eye}
            rows={data.paths}
            emptyText="No page views in this range yet."
          />
          <BreakdownCard
            title="Where visitors came from"
            icon={Link2}
            rows={data.referrers}
            emptyText="No referrers in this range yet."
          />
          <BreakdownCard
            title="Devices"
            icon={MonitorSmartphone}
            rows={data.devices}
            formatLabel={(label) => label.charAt(0).toUpperCase() + label.slice(1)}
            emptyText="No device data in this range yet."
          />
          <BreakdownCard
            title="Countries"
            icon={Globe2}
            rows={data.countries}
            formatLabel={countryLabel}
            emptyText="Country data appears once the site is served through Cloudflare or Vercel."
          />
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400">
          Bots and known crawlers are filtered out, and visitors sending Do Not Track are not
          counted. Over a multi-day range, &ldquo;visitors&rdquo; is the sum of each day&apos;s unique
          visitors.
        </p>
      </div>
    </div>
  )
}
