import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminToken } from '@/lib/adminToken'

export async function GET(request: NextRequest) {
  const token = request.cookies.get('admin_token')?.value

  if (!(await verifyAdminToken(token))) {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }

  return NextResponse.json({ authenticated: true })
}
