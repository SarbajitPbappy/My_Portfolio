import { NextResponse } from 'next/server'
import { getAnalyticsSummary } from '@/lib/analytics'

// Public: feeds the small visitor counter in the site footer. Only aggregate
// totals are exposed here — never per-visitor rows.
//
// The 10s edge window exists only to collapse bursts (many visitors in the same
// moment share one aggregate query); it is short enough to be imperceptible to
// someone reloading the page. A longer window is a real trap here: with
// s-maxage=300 + stale-while-revalidate=600 the CDN kept serving a stale body
// for up to ~15 minutes and the counter visibly lagged the admin dashboard.
// `max-age=0` keeps browsers from applying heuristic caching of their own.
export const dynamic = 'force-dynamic'

export async function GET() {
  const cacheHeader = 'public, max-age=0, s-maxage=10'

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
