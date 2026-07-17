import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'
import { getPages } from '@/lib/db'

// Rebuild the sitemap at most once per hour so newly created pages get indexed.
export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const routes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1,
    },
  ]

  // Include any admin-created custom pages, if the pages table exists.
  const pages = await getPages().catch(() => [])
  for (const page of pages) {
    if (!page.slug) continue
    routes.push({
      url: `${SITE_URL}/${page.slug.replace(/^\/+/, '')}`,
      lastModified: page.updated_at ? new Date(page.updated_at) : now,
      changeFrequency: 'monthly',
      priority: 0.6,
    })
  }

  return routes
}
