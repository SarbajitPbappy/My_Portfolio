'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

const ENDPOINT = '/api/analytics/event'

// Local development would otherwise slowly inflate the real numbers. Set
// NEXT_PUBLIC_ANALYTICS_DEBUG=true in .env.local to count localhost hits while
// testing the dashboard.
const COUNT_LOCALHOST = process.env.NEXT_PUBLIC_ANALYTICS_DEBUG === 'true'
const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1', '0.0.0.0'])

const SID_KEY = 'pf_sid'
const START_KEY = 'pf_start'

// Keep-alive cadence. Duration is measured server-side as (last signal - first
// signal), so this also bounds how much of a visit is lost if the closing
// beacon never arrives.
const HEARTBEAT_MS = 30_000
const FLUSH_AT = 12

type TrackedEvent = {
  kind: 'pageview' | 'click'
  path: string
  label?: string
  target?: string
  href?: string
  offset: number
}

/** A visit lasts as long as the tab does — sessionStorage, not a cookie. */
function getSession(): { id: string; start: number } | null {
  try {
    let id = sessionStorage.getItem(SID_KEY)
    let start = Number(sessionStorage.getItem(START_KEY))

    if (!id) {
      id =
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID()
          : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`
      start = Date.now()
      sessionStorage.setItem(SID_KEY, id)
      sessionStorage.setItem(START_KEY, String(start))
    }

    if (!Number.isFinite(start) || start <= 0) {
      start = Date.now()
      sessionStorage.setItem(START_KEY, String(start))
    }
    return { id, start }
  } catch {
    // Private mode with storage disabled — skip tracking rather than break.
    return null
  }
}

/** The admin panel is not a visitor surface — never record activity there. */
const isTrackablePath = () => !window.location.pathname.startsWith('/admin')

const clean = (value: string | null | undefined, max: number): string | undefined => {
  const text = (value || '').replace(/\s+/g, ' ').trim()
  return text ? text.slice(0, max) : undefined
}

/**
 * Describes what was clicked, without ever reading what anyone typed.
 * For form fields only the placeholder/name is used — never `.value` — and
 * password fields are skipped entirely.
 */
function describeClick(node: Element): Omit<TrackedEvent, 'kind' | 'path' | 'offset'> | null {
  const el = (node.closest(
    'a, button, [role="button"], summary, input, textarea, select, label, [data-track]'
  ) || node) as HTMLElement

  const tag = el.tagName.toLowerCase()
  const isField = tag === 'input' || tag === 'textarea' || tag === 'select'
  if (tag === 'input' && (el as HTMLInputElement).type === 'password') return null

  let label = clean(el.getAttribute('aria-label') || el.getAttribute('title'), 120)
  if (!label) {
    label = isField
      ? clean(el.getAttribute('placeholder') || el.getAttribute('name') || tag, 120)
      : clean(el.textContent, 120)
  }

  const id = el.id ? `#${el.id}` : ''
  const section = el.closest('section[id], [data-section]')?.id
  const href = el.getAttribute('href') || undefined

  return {
    label: label || tag,
    target: clean(`${tag}${id}${section && !id ? ` @${section}` : ''}`, 120),
    href: href ? clean(href, 300) : undefined,
  }
}

/**
 * Records the visit: one pageview per route, every click, and a keep-alive so
 * time-on-page stays accurate. Renders nothing.
 *
 * Everything identifying (pseudonymous daily hash, country, device, browser) is
 * derived server-side from request headers — this only reports what was clicked
 * and which page it happened on.
 */
export default function AnalyticsTracker() {
  const pathname = usePathname()
  const queue = useRef<TrackedEvent[]>([])
  const session = useRef<{ id: string; start: number } | null>(null)
  const lastPath = useRef<string | null>(null)
  const enabled = useRef(false)

  // Stable across renders: the click listener and timers are attached once.
  const flush = useRef<(useBeacon?: boolean) => void>(() => {})

  useEffect(() => {
    if (!COUNT_LOCALHOST && LOCAL_HOSTS.has(window.location.hostname)) return
    // Honour the browser's own opt-out signals before touching storage.
    if (navigator.doNotTrack === '1' || (navigator as any).globalPrivacyControl === true) return

    const current = getSession()
    if (!current) return

    session.current = current
    enabled.current = true

    flush.current = (useBeacon = false) => {
      if (!session.current || !isTrackablePath()) return
      const events = queue.current
      queue.current = []

      const payload = JSON.stringify({
        session_id: session.current.id,
        path: lastPath.current || window.location.pathname,
        referrer: document.referrer || null,
        screen: `${window.screen?.width || 0}x${window.screen?.height || 0}`,
        events,
      })

      if (useBeacon) {
        try {
          const blob = new Blob([payload], { type: 'application/json' })
          if (navigator.sendBeacon(ENDPOINT, blob)) return
        } catch {
          // fall through to fetch
        }
      }

      fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true,
      }).catch(() => {
        // Analytics must never surface an error to a visitor.
      })
    }

    const onClick = (event: MouseEvent) => {
      const node = event.target as Element | null
      if (!node || node.nodeType !== 1 || !session.current || !isTrackablePath()) return

      const described = describeClick(node)
      if (!described) return

      queue.current.push({
        kind: 'click',
        path: lastPath.current || window.location.pathname,
        offset: Date.now() - session.current.start,
        ...described,
      })

      if (queue.current.length >= FLUSH_AT) flush.current()
    }

    // Capture phase so a handler calling stopPropagation cannot hide the click.
    document.addEventListener('click', onClick, { capture: true, passive: true })

    const heartbeat = window.setInterval(() => {
      if (document.visibilityState === 'visible') flush.current()
    }, HEARTBEAT_MS)

    const onHide = () => {
      if (document.visibilityState === 'hidden') flush.current(true)
    }
    const onPageHide = () => flush.current(true)

    document.addEventListener('visibilitychange', onHide)
    window.addEventListener('pagehide', onPageHide)

    return () => {
      document.removeEventListener('click', onClick, { capture: true })
      document.removeEventListener('visibilitychange', onHide)
      window.removeEventListener('pagehide', onPageHide)
      window.clearInterval(heartbeat)
      flush.current(true)
    }
  }, [])

  // One pageview per route change, flushed immediately so a visit shows up in
  // the dashboard right away rather than on the first heartbeat.
  useEffect(() => {
    if (!enabled.current || !session.current) return
    if (!pathname || pathname.startsWith('/admin')) return
    if (lastPath.current === pathname) return

    lastPath.current = pathname
    queue.current.push({
      kind: 'pageview',
      path: pathname,
      offset: Date.now() - session.current.start,
    })
    flush.current()
  }, [pathname])

  return null
}
