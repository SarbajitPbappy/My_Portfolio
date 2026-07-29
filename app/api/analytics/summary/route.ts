import { NextResponse } from 'next/server'
import { getAnalyticsSummary } from '@/lib/analytics'

// Public: feeds the small visitor counter in the site footer. Only aggregate
// totals are exposed here — never per-visitor rows.
//
// The query itself always runs live (see lib/analytics.ts); staleness is
// controlled at the HTTP layer instead, so the CDN absorbs the traffic and the
// numbers are never served from a build-time snapshot.
export const dynamic = 'force-dynamic'

export async function GET() {
  const cacheHeader = 'public, s-maxage=300, stale-while-revalidate=600'

  try {
    const summary = await getAnalyticsSummary()
    return NextResponse.json(summary, { headers: { 'Cache-Control': cacheHeader } })
  } catch (error: any) {
    console.error('Error fetching analytics summary:', error?.message || error)
    return NextResponse.json(
      { total_views: 0, total_visitors: 0, today_views: 0, today_visitors: 0 },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  }
}
