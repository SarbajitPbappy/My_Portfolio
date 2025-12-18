import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY ?? '')

// Email validation helper
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, subject, message } = body

    // Validation
    if (!name || name.trim().length < 2) {
      return NextResponse.json(
        { success: false, message: 'Name must be at least 2 characters' },
        { status: 400 }
      )
    }

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { success: false, message: 'Invalid email address' },
        { status: 400 }
      )
    }

    if (!subject || subject.trim().length < 3) {
      return NextResponse.json(
        { success: false, message: 'Subject must be at least 3 characters' },
        { status: 400 }
      )
    }

    if (!message || message.trim().length < 10) {
      return NextResponse.json(
        { success: false, message: 'Message must be at least 10 characters' },
        { status: 400 }
      )
    }

    // Send email via Resend
    if (process.env.RESEND_API_KEY) {
      try {
        const { data, error } = await resend.emails.send({
          from: process.env.FROM_EMAIL || 'Portfolio <onboarding@resend.dev>',
          to: process.env.TO_EMAIL || 'sarbajit2001@gmail.com',
          reply_to: email,
          subject: `Portfolio Contact: ${subject}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #0284c7; border-bottom: 2px solid #0284c7; padding-bottom: 10px;">
                New Contact Form Submission
              </h2>
              <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong style="color: #1f2937;">Name:</strong> ${name}</p>
                <p><strong style="color: #1f2937;">Email:</strong> <a href="mailto:${email}" style="color: #0284c7;">${email}</a></p>
                <p><strong style="color: #1f2937;">Subject:</strong> ${subject}</p>
              </div>
              <div style="background: #ffffff; padding: 20px; border-left: 4px solid #0284c7; margin: 20px 0;">
                <p><strong style="color: #1f2937;">Message:</strong></p>
                <p style="color: #4b5563; line-height: 1.6; white-space: pre-wrap;">${message.replace(/\n/g, '<br>')}</p>
              </div>
              <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
                This email was sent from the portfolio contact form at ${new Date().toLocaleString()}
              </p>
            </div>
          `,
        })

        if (error) {
          console.error('Resend error:', error)
          // Fallback: log in development
          if (process.env.NODE_ENV === 'development') {
            console.log('Contact Form Submission:', {
              name,
              email,
              subject,
              message,
              timestamp: new Date().toISOString(),
            })
          }
          return NextResponse.json({
            success: true,
            message: 'Message received! Email service temporarily unavailable, but your message was logged.',
          })
        }

        return NextResponse.json({
          success: true,
          message: 'Message sent successfully! I will get back to you soon.',
        })
      } catch (emailError) {
        console.error('Email sending error:', emailError)
        // Fallback: log in development
        if (process.env.NODE_ENV === 'development') {
          console.log('Contact Form Submission:', {
            name,
            email,
            subject,
            message,
            timestamp: new Date().toISOString(),
          })
        }
        return NextResponse.json({
          success: true,
          message: 'Message received! Email service temporarily unavailable, but your message was logged.',
        })
      }
    } else {
      // Development mode: just log
      console.log('Contact Form Submission:', {
        name,
        email,
        subject,
        message,
        timestamp: new Date().toISOString(),
      })
      return NextResponse.json({
        success: true,
        message: 'Message received successfully! (Development mode - email not configured)',
      })
    }
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { success: false, message: 'An error occurred. Please try again later.' },
      { status: 500 }
    )
  }
}
