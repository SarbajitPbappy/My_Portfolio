import { NextRequest, NextResponse } from 'next/server'
import * as db from '@/lib/db'

export async function GET() {
  try {
    const data = await db.getSettings()
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Error fetching settings:', error)
    return NextResponse.json({ dark_mode: false, theme: 'modern' })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Allow public creation for initial settings (no auth required)
    const body = await request.json()
    const data = await db.createSettings(body)
    return NextResponse.json(data, { status: 201 })
  } catch (error: any) {
    console.error('Error creating settings:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

