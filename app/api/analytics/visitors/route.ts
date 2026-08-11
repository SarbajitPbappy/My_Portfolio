import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminToken } from '@/lib/adminToken'
import { getAnalyticsVisitors, getSessionEvents } from '@/lib/analytics'

export const dynamic = 'force-dynamic'

/**
 * Per-visit detail for /admin -> Analytics -> Visitors.
 *
 * `?session=<id>` returns that visit's full timeline; otherwise it returns the
 * recent-visits list plus the engagement summary. middleware.ts only guards
 * mutating requests, so this GET verifies the admin session itself.
 */
export async function GET(request: NextRequest) {
  const token = request.cookies.get('admin_token')?.value
  if (!(await verifyAdminToken(token))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const params = request.nextUrl.searchParams
    const sessionId = params.get('session')

    if (sessionId) {
      return NextResponse.json({ events: await getSessionEvents(sessionId) })
    }

    const days = Number(params.get('days') ?? 7)
    const limit = Number(params.get('limit') ?? 50)
    return NextResponse.json(await getAnalyticsVisitors(days, limit))
  } catch (error: any) {
    console.error('Error fetching visitor detail:', error?.message || error)
    return NextResponse.json({ error: 'Failed to load visitor detail.' }, { status: 500 })
  }
}
