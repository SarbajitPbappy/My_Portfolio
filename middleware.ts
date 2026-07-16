import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyAdminToken } from '@/lib/adminToken'

// Mutating requests to these API paths are public (no admin session required).
const PUBLIC_MUTATIONS = new Set([
  '/api/admin/login',
  '/api/admin/logout',
  '/api/contact', // public contact form
])

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS'])

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only guard API routes.
  if (!pathname.startsWith('/api/')) return NextResponse.next()

  // Reads are always allowed (public site fetches content + settings).
  if (SAFE_METHODS.has(request.method)) return NextResponse.next()

  // Explicitly public mutations.
  if (PUBLIC_MUTATIONS.has(pathname)) return NextResponse.next()

  // Everything else that mutates data requires a valid admin session.
  const token = request.cookies.get('admin_token')?.value
  if (await verifyAdminToken(token)) return NextResponse.next()

  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

export const config = {
  matcher: '/api/:path*',
}
