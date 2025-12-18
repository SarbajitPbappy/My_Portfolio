'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import JsxParser from 'react-jsx-parser'
import type { Page } from '@/lib/types'
import Hero from '@/components/Hero'
import About from '@/components/About'
import Education from '@/components/Education'
import WorkExperience from '@/components/WorkExperience'
import ResearchAndPublications from '@/components/ResearchAndPublications'
import Projects from '@/components/Projects'
import Skills from '@/components/Skills'
import Contact from '@/components/Contact'

// Map section IDs to their components
const sectionComponents: Record<string, React.ComponentType> = {
  home: Hero,
  about: About,
  education: Education,
  experience: WorkExperience,
  research: ResearchAndPublications,
  projects: Projects,
  skills: Skills,
  contact: Contact,
}

export default function DynamicPage() {
  const params = useParams()
  const router = useRouter()
  const [page, setPage] = useState<Page | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const slug = Array.isArray(params.slug) ? params.slug.join('/') : params.slug || ''
    
    if (!slug) {
      setNotFound(true)
      setLoading(false)
      return
    }

    // Clean the slug - remove any leading/trailing slashes
    const cleanSlug = slug.trim().replace(/^\/+|\/+$/g, '').toLowerCase()
    console.log(`Dynamic page route - slug: ${cleanSlug}`)
    
    if (!cleanSlug) {
      setNotFound(true)
      setLoading(false)
      return
    }

    // Fetch from database first, then check if it's a section to render component
    fetchPage(cleanSlug)
  }, [params.slug])

  const fetchPage = async (slug: string) => {
    try {
      console.log(`Fetching page from database for slug: "${slug}"`)
      const res = await fetch(`/api/pages/slug/${encodeURIComponent(slug)}`, {
        cache: 'no-store', // Ensure fresh data
      })
      
      console.log(`Response status: ${res.status}`)
      
      if (res.status === 404) {
        console.warn(`Page not found for slug: "${slug}". Check if the page exists in the database.`)
        setNotFound(true)
        return
      }
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        console.error(`Failed to fetch page: ${res.status} ${res.statusText}`, errorData)
        throw new Error(`Failed to fetch page: ${res.statusText}`)
      }
      
      const data = await res.json()
      if (data.error) {
        console.error('API error:', data.error)
        setNotFound(true)
        return
      }
      
      console.log(`Page loaded successfully:`, data.title)
      setPage(data)
      
      // Check if this slug matches a section - if so, render the component instead of database content
      // We'll check this in the render phase
    } catch (error) {
      console.error('Error fetching page:', error)
      setNotFound(true)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  if (notFound || !page) {
    const slug = Array.isArray(params.slug) ? params.slug.join('/') : params.slug || ''
    const cleanSlug = slug.trim().replace(/^\/+|\/+$/g, '')
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="text-center max-w-md px-4">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
          <p className="text-gray-600 mb-2">Page not found</p>
          {cleanSlug && (
            <p className="text-sm text-gray-500 mb-6">
              The page for <code className="bg-gray-100 px-2 py-1 rounded">/{cleanSlug}</code> doesn't exist yet.
            </p>
          )}
          <div className="space-y-3">
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors mr-3"
            >
              Go Home
            </button>
            <a
              href="/admin"
              className="inline-block px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Go to Admin Panel
            </a>
          </div>
          <p className="text-xs text-gray-400 mt-6">
            💡 Tip: Create this page from the Admin Panel → Pages, or add it to the Navbar and save.
          </p>
        </div>
      </div>
    )
  }

  // Helper function to detect if content is JSX/TSX or HTML
  const isJSXContent = (content: string): boolean => {
    if (!content || typeof content !== 'string') return false
    
    // Check for JSX patterns: className, self-closing tags, curly braces, etc.
    const jsxPatterns = [
      /className\s*=/,
      /\{[^}]*\}/,  // Curly braces (JSX expressions)
      /<\/\w+>/,    // Closing tags
      /\/>/,        // Self-closing tags
      /<\w+\s+[^>]*\{/, // Opening tag with JSX expression
    ]
    
    return jsxPatterns.some(pattern => pattern.test(content))
  }

  // Render content as JSX or HTML
  const renderContent = () => {
    const content = page.content || ''
    
    if (!content.trim()) {
      return <p className="text-gray-500 italic">No content available.</p>
    }
    
    // Try to render as JSX if it looks like JSX
    if (isJSXContent(content)) {
      try {
        return (
          <JsxParser
            jsx={content}
            components={{}}
            showWarnings={false}
            allowUnknownElements={true}
            bindings={{}}
            autoCloseVoidElements={true}
            renderInWrapper={false}
          />
        )
      } catch (error) {
        console.warn('JSX parsing failed, falling back to HTML:', error)
        // Fall back to HTML if JSX parsing fails
        return (
          <div 
            className="prose prose-lg max-w-none text-gray-700 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        )
      }
    }
    
    // Render as HTML
    return (
      <div 
        className="prose prose-lg max-w-none text-gray-700 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    )
  }

  // Check if this page slug matches a section - if so, render the component instead
  const slug = Array.isArray(params.slug) ? params.slug.join('/') : params.slug || ''
  const cleanSlug = slug.trim().replace(/^\/+|\/+$/g, '').toLowerCase()
  
  if (page && sectionComponents[cleanSlug]) {
    const SectionComponent = sectionComponents[cleanSlug]
    console.log(`Rendering section component for slug: ${cleanSlug}`)
    return (
      <div className="min-h-screen">
        <SectionComponent />
      </div>
    )
  }

  // Regular page - render database content
  return (
    <div className="min-h-screen py-16 bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <article className="bg-white rounded-xl shadow-sm p-8 border border-gray-200">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">{page.title}</h1>
          <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
            {renderContent()}
          </div>
        </article>
      </div>
    </div>
  )
}

