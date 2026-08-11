'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { GoogleAnalytics as NextGoogleAnalytics } from '@next/third-parties/google'

/**
 * Google Analytics 4.
 *
 * Inert unless NEXT_PUBLIC_GA_ID is set, so nothing loads (and no cookie is
 * written) until a real measurement ID is configured.
 *
 * NOTE: unlike the built-in analytics in /admin, GA4 DOES set cookies (_ga,
 * _ga_*) and sends visitor data to Google. That is what brings cookie-consent
 * obligations into play for EU/UK visitors. The gates below — no admin pages,
 * no localhost, and no tracking for anyone sending Do Not Track / Global
 * Privacy Control — keep it consistent with how the rest of the site behaves,
 * but they are not a substitute for a consent banner if you need one.
 */

const GA_ID = process.env.NEXT_PUBLIC_GA_ID
const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1', '0.0.0.0'])
const COUNT_LOCALHOST = process.env.NEXT_PUBLIC_ANALYTICS_DEBUG === 'true'

export default function GoogleAnalytics() {
  const pathname = usePathname()
  const [allowed, setAllowed] = useState(false)

  useEffect(() => {
    if (!COUNT_LOCALHOST && LOCAL_HOSTS.has(window.location.hostname)) return
    if (navigator.doNotTrack === '1' || (navigator as any).globalPrivacyControl === true) return
    setAllowed(true)
  }, [])

  // The admin panel is not a visitor surface.
  if (!GA_ID || !allowed || pathname?.startsWith('/admin')) return null

  return <NextGoogleAnalytics gaId={GA_ID} />
}
