import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import * as db from '@/lib/db'

export const runtime = 'nodejs'

const BUCKET = 'media'
const MAX_BYTES = 6 * 1024 * 1024 // 6 MB
const EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

// Admin-only (enforced by middleware.ts). Uploads a new profile image to Supabase
// Storage and points hero.profile_image_url at the freshly uploaded file.
export async function POST(request: NextRequest) {
  try {
    const form = await request.formData()
    const file = form.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided.' }, { status: 400 })
    }
    const ext = EXT[file.type]
    if (!ext) {
      return NextResponse.json({ error: 'Only JPG, PNG, or WEBP images are allowed.' }, { status: 400 })
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'Image too large (max 6 MB).' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const path = `profile.${ext}`

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, buffer, { contentType: file.type, upsert: true })

    if (uploadError) {
      const hint = /bucket/i.test(uploadError.message)
        ? ' — run create_media_bucket.sql in Supabase first to create the "media" bucket.'
        : ''
      return NextResponse.json({ error: uploadError.message + hint }, { status: 500 })
    }

    const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path)
    // Cache-bust so the new image shows immediately.
    const imageUrl = `${pub.publicUrl}?v=${Date.now()}`

    const hero = await db.getHero()
    if (hero?.id) {
      await db.updateHero(hero.id, { profile_image_url: imageUrl })
    }

    return NextResponse.json({ url: imageUrl })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Upload failed.' }, { status: 500 })
  }
}
