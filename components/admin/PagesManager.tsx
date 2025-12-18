'use client'

import { useEffect, useState } from 'react'
import { Save, Plus, X, Edit, Trash2 } from 'lucide-react'
import type { Page } from '@/lib/types'

export default function PagesManager() {
  const [pages, setPages] = useState<Page[]>([])
  const [loading, setLoading] = useState(true)
  const [editingPage, setEditingPage] = useState<Page | null>(null)
  const [formData, setFormData] = useState<Partial<Page>>({})
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    fetchPages()
  }, [])

  const fetchPages = async () => {
    try {
      const res = await fetch('/api/pages')
      const data = await res.json()
      setPages(data || [])
    } catch (error) {
      console.error('Error fetching pages:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingPage(null)
    setFormData({
      slug: '',
      title: '',
      content: '',
      meta_description: '',
    })
    setShowForm(true)
  }

  const handleEdit = (page: Page) => {
    setEditingPage(page)
    setFormData(page)
    setShowForm(true)
  }

  const handleSave = async () => {
    try {
      if (!formData.slug || !formData.title || !formData.content) {
        alert('Please fill in all required fields')
        return
      }

      // Ensure slug doesn't start with /
      const slug = formData.slug.startsWith('/') ? formData.slug.substring(1) : formData.slug

      const url = editingPage?.id ? `/api/pages/${editingPage.id}` : '/api/pages'
      const method = editingPage?.id ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, slug }),
      })

      if (res.ok) {
        await fetchPages()
        setShowForm(false)
        setEditingPage(null)
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('content-updated'))
        }
        alert('Page saved successfully!')
      } else {
        const error = await res.json()
        alert(`Failed to save: ${error.error}`)
      }
    } catch (error) {
      console.error('Error saving page:', error)
      alert('Failed to save. Please try again.')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this page?')) return

    try {
      const res = await fetch(`/api/pages/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        await fetchPages()
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('content-updated'))
        }
        alert('Page deleted successfully!')
      }
    } catch (error) {
      console.error('Error deleting page:', error)
      alert('Failed to delete. Please try again.')
    }
  }

  if (loading) {
    return <div className="text-center py-12 text-gray-600">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Pages</h2>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Page
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingPage ? 'Edit Page' : 'Create New Page'}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Slug * (URL path, e.g., "about", "blog")
              </label>
              <input
                type="text"
                value={formData.slug || ''}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="about"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
                disabled={!!editingPage}
              />
              {editingPage && (
                <p className="text-xs text-gray-500 mt-1">Slug cannot be changed after creation</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="About Me"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Content * (HTML supported)</label>
              <textarea
                value={formData.content || ''}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="<h2>Welcome</h2><p>Your content here...</p>"
                rows={10}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                You can use HTML tags. For example: &lt;h2&gt;Heading&lt;/h2&gt;&lt;p&gt;Paragraph&lt;/p&gt;
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description (optional)</label>
              <input
                type="text"
                value={formData.meta_description || ''}
                onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                placeholder="A brief description for SEO"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-2 pt-4 border-t">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                <Save className="w-4 h-4" />
                Save
              </button>
              <button
                onClick={() => {
                  setShowForm(false)
                  setEditingPage(null)
                }}
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {pages.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 text-center text-gray-500">
            No pages created yet. Click "Create Page" to add one.
          </div>
        ) : (
          pages.map((page) => (
            <div key={page.id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{page.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">/{page.slug}</p>
                  {page.meta_description && (
                    <p className="text-sm text-gray-500 mt-2">{page.meta_description}</p>
                  )}
                  <div className="mt-3 text-sm text-gray-400">
                    Created: {new Date(page.created_at || '').toLocaleDateString()}
                  </div>
                </div>
                <div className="flex gap-2">
                  <a
                    href={`/${page.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    View
                  </a>
                  <button
                    onClick={() => handleEdit(page)}
                    className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => page.id && handleDelete(page.id)}
                    className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

