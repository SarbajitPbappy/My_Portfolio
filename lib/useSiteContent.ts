'use client'

import { useEffect, useState } from 'react'
import { defaultSiteContent, mergeSiteContent, type SiteContent } from '@/lib/siteContent'

/**
 * Homepage content seeded from the server, refetched when the admin panel
 * fires `content-updated` (the same event the other sections listen for).
 */
export function useSiteContent(initial?: SiteContent): SiteContent {
  const [content, setContent] = useState<SiteContent>(initial ?? defaultSiteContent)

  useEffect(() => {
    const refetch = async () => {
      try {
        const res = await fetch('/api/site-content', { cache: 'no-store' })
        if (res.ok) setContent(mergeSiteContent(await res.json()))
      } catch {
        // keep what we have
      }
    }
    if (!initial) refetch()
    window.addEventListener('content-updated', refetch)
    return () => window.removeEventListener('content-updated', refetch)
  }, [initial])

  return content
}
