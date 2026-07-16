import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import * as db from '@/lib/db'

export const runtime = 'nodejs'

const BUCKET = 'resume'
const FILE_PATH = 'Sarbajit_Resume.pdf'
const MAX_BYTES = 10 * 1024 * 1024 // 10 MB

// Admin-only (enforced by middleware.ts). Uploads a new CV/resume PDF to Supabase
// Storage and points hero.cv_url at the freshly uploaded file.
export async function POST(request: NextRequest) {
  try {
    const form = await request.formData()
    const file = form.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided.' }, { status: 400 })
    }
    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Only PDF files are allowed.' }, { status: 400 })
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'File too large (max 10 MB).' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(FILE_PATH, buffer, { contentType: 'application/pdf', upsert: true })

    if (uploadError) {
      const hint = /bucket/i.test(uploadError.message)
        ? ' — run create_resume_bucket.sql in Supabase first to create the "resume" bucket.'
        : ''
      return NextResponse.json({ error: uploadError.message + hint }, { status: 500 })
    }

    const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(FILE_PATH)
    // Cache-bust so the Download CV link always serves the latest upload.
    const cvUrl = `${pub.publicUrl}?v=${Date.now()}`

    // Point the hero's Download CV button at the new file.
    const hero = await db.getHero()
    if (hero?.id) {
      await db.updateHero(hero.id, { cv_url: cvUrl })
    }

    return NextResponse.json({ url: cvUrl })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Upload failed.' }, { status: 500 })
  }
}
