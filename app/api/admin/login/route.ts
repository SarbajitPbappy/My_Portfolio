import { NextRequest, NextResponse } from 'next/server'
import { verifyPassword } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    if (!password) {
      return NextResponse.json(
        { success: false, message: 'Password required' },
        { status: 400 }
      )
    }

    const isValid = await verifyPassword(password)

    if (!isValid) {
      return NextResponse.json(
        { success: false, message: 'Invalid password' },
        { status: 401 }
      )
    }

    // Create a simple session token (in production, use proper JWT or NextAuth)
    const token = Buffer.from(`${Date.now()}-${Math.random()}`).toString('base64')
    
    const response = NextResponse.json({ success: true, token })
    
    // Set HTTP-only cookie
    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, message: 'Login failed' },
      { status: 500 }
    )
  }
}

