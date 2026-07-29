'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

const ENDPOINT = '/api/analytics/track'

// Local development would otherwise slowly inflate the real numbers. Set
// NEXT_PUBLIC_ANALYTICS_DEBUG=true in .env.local to count localhost hits while
// testing the dashboard.
const COUNT_LOCALHOST = process.env.NEXT_PUBLIC_ANALYTICS_DEBUG === 'true'
const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1', '0.0.0.0'])

/**
 * Fires one page-view beacon per route. Renders nothing.
 *
 * Everything that identifies the visit (pseudonymous daily hash, device,
 * country) is derived server-side from request headers — this only reports
 * which path was viewed and where the visitor arrived from.
 */
export default function AnalyticsTracker() {
  const pathname = usePathname()
  const lastSent = useRef<string | null>(null)

  useEffect(() => {
    if (!pathname || pathname.startsWith('/admin')) return
    if (!COUNT_LOCALHOST && LOCAL_HOSTS.has(window.location.hostname)) return

    // React re-runs effects in Strict Mode; one beacon per route is enough.
    if (lastSent.current === pathname) return
    lastSent.current = pathname

    const payload = JSON.stringify({
      path: pathname,
      referrer: document.referrer || null,
    })

    // sendBeacon still delivers if the visitor navigates away immediately.
    try {
      if (typeof navigator.sendBeacon === 'function') {
        const blob = new Blob([payload], { type: 'application/json' })
        if (navigator.sendBeacon(ENDPOINT, blob)) return
      }
    } catch {
      // fall through to fetch
    }

    fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      keepalive: true,
    }).catch(() => {
      // Analytics must never surface an error to a visitor.
    })
  }, [pathname])

  return null
}
