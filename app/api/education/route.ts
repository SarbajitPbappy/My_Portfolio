import { NextRequest, NextResponse } from 'next/server'
import * as db from '@/lib/db'

export async function GET() {
  try {
    const data = await db.getEducation()
    return NextResponse.json(data || [])
  } catch (error: any) {
    // Return empty array on error so fallback data can be used
    console.error('Error fetching education:', error)
    return NextResponse.json([])
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const token = request.cookies.get('admin_token')?.value
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const data = await db.createEducation(body)
    return NextResponse.json(data, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

