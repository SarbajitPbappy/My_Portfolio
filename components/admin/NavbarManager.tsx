'use client'

import { useEffect, useState } from 'react'
import { Save, Plus, X } from 'lucide-react'
import type { Navbar } from '@/lib/types'

export default function NavbarManager() {
  const [item, setItem] = useState<Navbar | null>(null)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState<Partial<Navbar>>({})
  const [showForm, setShowForm] = useState(false)
  const [newNavItem, setNewNavItem] = useState({ name: '', href: '' })

  useEffect(() => {
    fetchItem()
  }, [])

  const fetchItem = async () => {
    try {
      const res = await fetch('/api/navbar')
      const data = await res.json()
      setItem(data)
      if (data) {
        setFormData(data)
        setShowForm(true)
      }
    } catch (error) {
      console.error('Error fetching navbar:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setFormData({
      name: 'Sarbajit Paul Bappy',
      nav_items: [
        { name: 'Home', href: '#home' },
        { name: 'About', href: '#about' },
        { name: 'Education', href: '#education' },
        { name: 'Work Experience', href: '#experience' },
        { name: 'Research', href: '#research' },
        { name: 'Projects', href: '#projects' },
        { name: 'Contact', href: '#contact' },
      ],
    })
    setShowForm(true)
  }

  const handleSave = async () => {
    try {
      const url = item?.id ? `/api/navbar/${item.id}` : '/api/navbar'
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
        alert('Navbar saved successfully!')
      }
    } catch (error) {
      console.error('Error saving navbar:', error)
      alert('Failed to save. Please try again.')
    }
  }

  const addNavItem = () => {
    if (newNavItem.name && newNavItem.href) {
      setFormData({
        ...formData,
        nav_items: [...(formData.nav_items || []), { ...newNavItem }],
      })
      setNewNavItem({ name: '', href: '' })
    }
  }

  const removeNavItem = (index: number) => {
    const items = formData.nav_items?.filter((_, i) => i !== index) || []
    setFormData({ ...formData, nav_items: items })
  }

  if (loading) {
    return <div className="text-center py-12 text-gray-600">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Navbar</h2>
        {!item && (
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Navbar
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Site Name *</label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>

            <div className="border-t pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Navigation Items</label>
              <div className="space-y-2 mb-3">
                {formData.nav_items?.map((navItem, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-gray-900">{navItem.name}</p>
                      <p className="text-sm text-gray-600">{navItem.href}</p>
                    </div>
                    <button
                      onClick={() => removeNavItem(index)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <input
                  type="text"
                  value={newNavItem.name}
                  onChange={(e) => setNewNavItem({ ...newNavItem, name: e.target.value })}
                  placeholder="Item name (e.g., Home)"
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="text"
                  value={newNavItem.href}
                  onChange={(e) => setNewNavItem({ ...newNavItem, href: e.target.value })}
                  placeholder="Link (e.g., #home)"
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <button
                onClick={addNavItem}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                + Add Navigation Item
              </button>
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
              <div className="mt-2 space-y-1">
                {item.nav_items?.map((nav, i) => (
                  <p key={i} className="text-sm text-gray-600">{nav.name} → {nav.href}</p>
                ))}
              </div>
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

