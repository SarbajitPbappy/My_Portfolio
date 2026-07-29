import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminToken } from '@/lib/adminToken'
import { getAnalyticsStats } from '@/lib/analytics'

export const dynamic = 'force-dynamic'

/**
 * Full dashboard payload for /admin -> Analytics.
 *
 * middleware.ts only guards mutating requests (reads are public for the site's
 * content APIs), so this GET verifies the admin session itself.
 */
export async function GET(request: NextRequest) {
  const token = request.cookies.get('admin_token')?.value
  if (!(await verifyAdminToken(token))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const days = Number(request.nextUrl.searchParams.get('days') ?? 30)
    const stats = await getAnalyticsStats(days)
    return NextResponse.json(stats)
  } catch (error: any) {
    console.error('Error fetching analytics stats:', error?.message || error)
    return NextResponse.json({ error: 'Failed to load analytics.' }, { status: 500 })
  }
}
