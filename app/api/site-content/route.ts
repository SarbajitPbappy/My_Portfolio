import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import * as db from '@/lib/db'

// Always read fresh: a statically cached GET would hand the admin editor
// stale content, and the next save would overwrite newer edits.
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

// GET is public (the homepage reads it). PUT is admin-only: middleware.ts
// rejects any mutating /api request without a valid admin session.

export async function GET() {
  const data = await db.getSiteContent()
  return NextResponse.json(data)
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const data = await db.updateSiteContent(body)
    revalidatePath('/')
    return NextResponse.json(data)
  } catch (error: any) {
    const missingColumn = /site_content/.test(error?.message || '')
    return NextResponse.json(
      {
        error: missingColumn
          ? 'The database has no site_content column yet. Run add_site_content.sql in the Supabase SQL editor, then save again.'
          : error?.message || 'Save failed',
      },
      { status: 500 }
    )
  }
}
