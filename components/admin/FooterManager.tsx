'use client'

import { useEffect, useState } from 'react'
import { Save, Plus, X } from 'lucide-react'
import type { Footer } from '@/lib/types'

export default function FooterManager() {
  const [item, setItem] = useState<Footer | null>(null)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState<Partial<Footer>>({})
  const [showForm, setShowForm] = useState(false)
  const [newLink, setNewLink] = useState('')
  const [newSocial, setNewSocial] = useState({ icon: '', href: '', label: '' })

  useEffect(() => {
    fetchItem()
  }, [])

  const fetchItem = async () => {
    try {
      const res = await fetch('/api/footer')
      const data = await res.json()
      setItem(data)
      if (data) {
        setFormData(data)
        setShowForm(true)
      }
    } catch (error) {
      console.error('Error fetching footer:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setFormData({
      name: 'Sarbajit Paul Bappy',
      description: '',
      quick_links: [],
      social_links: [],
      copyright_text: `© ${new Date().getFullYear()} Sarbajit Paul Bappy. All rights reserved.`,
    })
    setShowForm(true)
  }

  const handleSave = async () => {
    try {
      const url = item?.id ? `/api/footer/${item.id}` : '/api/footer'
      const method = item?.id ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        await fetchItem()
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('content-updated'))
        }
        alert('Footer saved successfully!')
      }
    } catch (error) {
      console.error('Error saving footer:', error)
      alert('Failed to save. Please try again.')
    }
  }

  const addQuickLink = () => {
    if (newLink.trim()) {
      setFormData({
        ...formData,
        quick_links: [...(formData.quick_links || []), newLink.trim()],
      })
      setNewLink('')
    }
  }

  const removeQuickLink = (index: number) => {
    const links = formData.quick_links?.filter((_, i) => i !== index) || []
    setFormData({ ...formData, quick_links: links })
  }

  const addSocialLink = () => {
    if (newSocial.icon && newSocial.href && newSocial.label) {
      setFormData({
        ...formData,
        social_links: [...(formData.social_links || []), { ...newSocial }],
      })
      setNewSocial({ icon: '', href: '', label: '' })
    }
  }

  const removeSocialLink = (index: number) => {
    const links = formData.social_links?.filter((_, i) => i !== index) || []
    setFormData({ ...formData, social_links: links })
  }

  if (loading) {
    return <div className="text-center py-12 text-gray-600">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Footer</h2>
        {!item && (
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Footer
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                rows={3}
              />
            </div>

            <div className="border-t pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Quick Links</label>
              <div className="space-y-2 mb-3">
                {formData.quick_links?.map((link, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <span>{link}</span>
                    <button
                      onClick={() => removeQuickLink(index)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newLink}
                  onChange={(e) => setNewLink(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addQuickLink())}
                  placeholder="Link name (e.g., About, Projects)"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                />
                <button
                  onClick={addQuickLink}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Add
                </button>
              </div>
            </div>

            <div className="border-t pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Social Links</label>
              <div className="space-y-2 mb-3">
                {formData.social_links?.map((social, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold">{social.label}</p>
                      <p className="text-sm text-gray-600">{social.icon} - {social.href}</p>
                    </div>
                    <button
                      onClick={() => removeSocialLink(index)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-2 mb-2">
                <input
                  type="text"
                  value={newSocial.icon}
                  onChange={(e) => setNewSocial({ ...newSocial, icon: e.target.value })}
                  placeholder="Icon (e.g., Github)"
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="text"
                  value={newSocial.href}
                  onChange={(e) => setNewSocial({ ...newSocial, href: e.target.value })}
                  placeholder="URL"
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="text"
                  value={newSocial.label}
                  onChange={(e) => setNewSocial({ ...newSocial, label: e.target.value })}
                  placeholder="Label"
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <button
                onClick={addSocialLink}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                + Add Social Link
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Copyright Text</label>
              <input
                type="text"
                value={formData.copyright_text || ''}
                onChange={(e) => setFormData({ ...formData, copyright_text: e.target.value })}
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
                onClick={() => setShowForm(false)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {item && !showForm && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
              <p className="text-gray-600 text-sm mt-2">{item.description}</p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Edit
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

