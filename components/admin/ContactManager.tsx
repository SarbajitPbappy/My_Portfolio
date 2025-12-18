'use client'

import { useEffect, useState } from 'react'
import { Plus, Edit, Trash2, Save, X, Trash } from 'lucide-react'
import type { ContactInfo } from '@/lib/types'

export default function ContactManager() {
  const [items, setItems] = useState<ContactInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState<Partial<ContactInfo>>({})
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    try {
      const res = await fetch('/api/contact-info')
      const data = await res.json()
      setItems(data)
    } catch (error) {
      console.error('Error fetching contact info:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setFormData({
      icon: 'Mail',
      text: '',
      href: '',
      gradient: 'from-blue-500 to-cyan-500',
      is_external: false,
      order: items.length,
    })
    setShowForm(true)
    setEditingId(null)
  }

  const handleEdit = (item: ContactInfo) => {
    setFormData(item)
    setEditingId(item.id!)
    setShowForm(true)
  }

  const handleSave = async () => {
    try {
      const url = editingId ? `/api/contact-info/${editingId}` : '/api/contact-info'
      const method = editingId ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        await fetchItems()
        setShowForm(false)
        setFormData({})
        setEditingId(null)
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('content-updated'))
        }
      }
    } catch (error) {
      console.error('Error saving contact info:', error)
      alert('Failed to save. Please try again.')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this item?')) return

    try {
      const res = await fetch(`/api/contact-info/${id}`, { method: 'DELETE' })
      if (res.ok) {
        await fetchItems()
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('content-updated'))
        }
      }
    } catch (error) {
      console.error('Error deleting contact info:', error)
      alert('Failed to delete. Please try again.')
    }
  }

  const handleDeleteAll = async () => {
    if (items.length === 0) {
      alert('No items to delete.')
      return
    }

    const confirmMessage = `Are you sure you want to delete ALL ${items.length} contact info entries? This action cannot be undone!`
    if (!confirm(confirmMessage)) return

    try {
      const deletePromises = items.map(item => 
        item.id ? fetch(`/api/contact-info/${item.id}`, { method: 'DELETE' }) : Promise.resolve()
      )
      
      await Promise.all(deletePromises)
      await fetchItems()
      
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('content-updated'))
      }
      
      alert(`Successfully deleted all ${items.length} contact info entries!`)
    } catch (error) {
      console.error('Error deleting all contact info:', error)
      alert('Failed to delete all items. Please try again.')
    }
  }

  if (loading) {
    return <div className="text-center py-12 text-gray-600">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Contact Information</h2>
        <div className="flex gap-2">
          {items.length > 0 && (
            <button
              onClick={handleDeleteAll}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Trash className="w-4 h-4" />
              Delete All
            </button>
          )}
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add New
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Icon *</label>
              <input
                type="text"
                value={formData.icon || ''}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="e.g., Mail, Phone, Github, Linkedin"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Icon name from Lucide React</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Text/Label *</label>
              <input
                type="text"
                value={formData.text || ''}
                onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Link/URL *</label>
              <input
                type="text"
                value={formData.href || ''}
                onChange={(e) => setFormData({ ...formData, href: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="mailto:email@example.com or https://..."
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gradient</label>
                <select
                  value={formData.gradient || 'from-blue-500 to-cyan-500'}
                  onChange={(e) => setFormData({ ...formData, gradient: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="from-blue-500 to-cyan-500">Blue to Cyan</option>
                  <option value="from-purple-500 to-pink-500">Purple to Pink</option>
                  <option value="from-green-500 to-emerald-500">Green to Emerald</option>
                  <option value="from-red-500 to-rose-500">Red to Rose</option>
                  <option value="from-amber-500 to-orange-500">Amber to Orange</option>
                  <option value="from-indigo-500 to-purple-500">Indigo to Purple</option>
                  <option value="from-teal-500 to-cyan-500">Teal to Cyan</option>
                  <option value="from-rose-500 to-pink-500">Rose to Pink</option>
                  <option value="from-violet-500 to-purple-500">Violet to Purple</option>
                  <option value="from-emerald-500 to-teal-500">Emerald to Teal</option>
                  <option value="from-orange-500 to-red-500">Orange to Red</option>
                  <option value="from-cyan-500 to-blue-500">Cyan to Blue</option>
                  <option value="from-pink-500 to-rose-500">Pink to Rose</option>
                  <option value="from-yellow-500 to-amber-500">Yellow to Amber</option>
                  <option value="from-gray-700 to-gray-900">Gray to Dark Gray</option>
                  <option value="from-blue-600 to-blue-800">Blue to Dark Blue</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">External Link</label>
                <select
                  value={formData.is_external ? 'true' : 'false'}
                  onChange={(e) => setFormData({ ...formData, is_external: e.target.value === 'true' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="false">No</option>
                  <option value="true">Yes</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
              <input
                type="number"
                value={formData.order ?? 0}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
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
                  setFormData({})
                  setEditingId(null)
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

      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-500">{item.icon}</span>
                  <h3 className="text-lg font-semibold text-gray-900">{item.text}</h3>
                </div>
                <p className="text-gray-600 text-sm mt-1">{item.href}</p>
                <div className="flex gap-2 mt-2">
                  <span className={`px-3 py-1 rounded-lg text-xs ${item.is_external ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                    {item.is_external ? 'External' : 'Internal'}
                  </span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs">
                    Order: {item.order}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(item)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(item.id!)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

