import { NextRequest, NextResponse } from 'next/server'
import * as db from '@/lib/db'

export async function GET() {
  try {
    const data = await db.getNavbar()
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Error fetching navbar:', error)
    return NextResponse.json(null)
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('admin_token')?.value
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const data = await db.createNavbar(body)
    return NextResponse.json(data, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

