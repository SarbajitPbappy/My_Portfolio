import { NextRequest, NextResponse } from 'next/server'
import {
  browserFromUserAgent,
  clientIpFrom,
  countryFrom,
  deviceFromUserAgent,
  ingestAnalyticsBatch,
  isBot,
  isValidSessionId,
  normalizeEvents,
  normalizePath,
  normalizeReferrer,
  osFromUserAgent,
  visitorHash,
} from '@/lib/analytics'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Batched ingest for the session tracker: pageviews, clicks and keep-alives.
 * Public (whitelisted in middleware.ts) and always answers 204 — a visitor
 * should never see or wait on an analytics failure.
 *
 * This is the single write path. `analytics_ingest` also mirrors pageviews into
 * page_views, so the aggregate dashboard and the footer counter stay correct
 * without a second round trip.
 */
export async function POST(request: NextRequest) {
  const noContent = new NextResponse(null, { status: 204 })

  try {
    const userAgent = request.headers.get('user-agent')
    if (isBot(userAgent)) return noContent

    if (request.headers.get('dnt') === '1' || request.headers.get('sec-gpc') === '1') {
      return noContent
    }

    const body = await request.json().catch(() => null)
    if (!isValidSessionId(body?.session_id)) return noContent

    // A session must be anchored to a real page; anything else is noise.
    const path = normalizePath(body?.path)
    if (!path) return noContent

    const ip = clientIpFrom(request.headers)
    const hash = await visitorHash(ip, userAgent || '')

    const screen =
      typeof body?.screen === 'string' && /^\d{2,5}x\d{2,5}$/.test(body.screen)
        ? body.screen
        : null

    await ingestAnalyticsBatch({
      session_id: body.session_id,
      visitor_hash: hash,
      path,
      referrer: normalizeReferrer(body?.referrer, request.nextUrl.hostname),
      country: countryFrom(request.headers),
      device: deviceFromUserAgent(userAgent),
      browser: browserFromUserAgent(userAgent),
      os: osFromUserAgent(userAgent),
      screen,
      events: normalizeEvents(body?.events),
    })

    return noContent
  } catch (error: any) {
    console.error('Analytics event failed:', error?.message || error)
    return noContent
  }
}
