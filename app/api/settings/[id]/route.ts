import { NextRequest, NextResponse } from 'next/server'
import * as db from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Allow public updates for theme/dark mode (no auth required)
    const body = await request.json()
    const data = await db.updateSettings(Number(params.id), body)
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Error updating settings:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

