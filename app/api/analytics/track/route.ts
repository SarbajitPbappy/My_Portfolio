import { NextRequest, NextResponse } from 'next/server'
import {
  clientIpFrom,
  countryFrom,
  deviceFromUserAgent,
  isBot,
  normalizePath,
  normalizeReferrer,
  recordPageView,
  visitorHash,
} from '@/lib/analytics'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Public beacon endpoint hit once per page view by components/AnalyticsTracker.
 * Whitelisted in middleware.ts, since it is the one mutating route the public
 * site needs besides the contact form.
 *
 * Always answers 204 — a visitor should never see, or wait on, an analytics
 * failure, and a body would tell a spammer whether their hit was counted.
 */
export async function POST(request: NextRequest) {
  const noContent = new NextResponse(null, { status: 204 })

  try {
    const userAgent = request.headers.get('user-agent')
    if (isBot(userAgent)) return noContent

    // Respect Do Not Track / Global Privacy Control.
    if (request.headers.get('dnt') === '1' || request.headers.get('sec-gpc') === '1') {
      return noContent
    }

    const body = await request.json().catch(() => null)
    const path = normalizePath(body?.path)
    if (!path) return noContent

    const ip = clientIpFrom(request.headers)
    const hash = await visitorHash(ip, userAgent || '')

    await recordPageView({
      path,
      referrer: normalizeReferrer(body?.referrer, request.nextUrl.hostname),
      visitor_hash: hash,
      country: countryFrom(request.headers),
      device: deviceFromUserAgent(userAgent),
    })

    return noContent
  } catch (error: any) {
    console.error('Analytics track failed:', error?.message || error)
    return noContent
  }
}
