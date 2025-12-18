import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const token = request.cookies.get('admin_token')?.value

  if (!token) {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }

  // Simple verification - in production, verify token properly
  return NextResponse.json({ authenticated: true })
}

