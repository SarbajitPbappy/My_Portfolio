import { NextRequest, NextResponse } from 'next/server'
import * as db from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const data = await db.getPageBySlug(params.slug)
    if (!data) {
      return NextResponse.json(
        { error: 'Page not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

