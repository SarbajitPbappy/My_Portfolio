'use client'

import { useEffect, useState } from 'react'
import { Plus, Edit, Trash2, Save, X, Trash } from 'lucide-react'
import type { Publication } from '@/lib/types'

export default function PublicationsManager() {
  const [items, setItems] = useState<Publication[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState<Partial<Publication>>({})
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    try {
      const res = await fetch('/api/publications')
      const data = await res.json()
      setItems(data)
    } catch (error) {
      console.error('Error fetching publications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setFormData({
      title: '',
      authors: '',
      status: 'Published',
      year: new Date().getFullYear().toString(),
      type: 'Journal Article',
      gradient: 'from-green-500 to-emerald-500',
      order: items.length,
    })
    setShowForm(true)
    setEditingId(null)
  }

  const handleEdit = (item: Publication) => {
    setFormData(item)
    setEditingId(item.id!)
    setShowForm(true)
  }

  const handleSave = async () => {
    try {
      const url = editingId ? `/api/publications/${editingId}` : '/api/publications'
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
        // Trigger frontend refresh
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('content-updated'))
        }
      }
    } catch (error) {
      console.error('Error saving publication:', error)
      alert('Failed to save. Please try again.')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this item?')) return

    try {
      const res = await fetch(`/api/publications/${id}`, { method: 'DELETE' })
      if (res.ok) {
        await fetchItems()
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('content-updated'))
        }
      }
    } catch (error) {
      console.error('Error deleting publication:', error)
      alert('Failed to delete. Please try again.')
    }
  }

  const handleDeleteAll = async () => {
    if (items.length === 0) {
      alert('No items to delete.')
      return
    }

    const confirmMessage = `Are you sure you want to delete ALL ${items.length} publications? This action cannot be undone!`
    if (!confirm(confirmMessage)) return

    try {
      const deletePromises = items.map(item => 
        item.id ? fetch(`/api/publications/${item.id}`, { method: 'DELETE' }) : Promise.resolve()
      )
      
      await Promise.all(deletePromises)
      await fetchItems()
      
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('content-updated'))
      }
      
      alert(`Successfully deleted all ${items.length} publications!`)
    } catch (error) {
      console.error('Error deleting all publications:', error)
      alert('Failed to delete all items. Please try again.')
    }
  }

  if (loading) {
    return <div className="text-center py-12 text-gray-600">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Publications</h2>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Publication Title *</label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter the full title of the publication..."
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Authors *</label>
              <textarea
                value={formData.authors || ''}
                onChange={(e) => setFormData({ ...formData, authors: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                rows={2}
                placeholder="Enter all authors separated by commas..."
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={formData.status || 'Published'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as Publication['status'] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="Published">Published</option>
                  <option value="Major Revision">Major Revision</option>
                  <option value="Published (Abstract)">Published (Abstract)</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Draft">Draft</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                <input
                  type="text"
                  value={formData.year || ''}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <input
                  type="text"
                  value={formData.type || ''}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., Journal Article (Q1)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Journal (optional)</label>
                <input
                  type="text"
                  value={formData.journal || ''}
                  onChange={(e) => setFormData({ ...formData, journal: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">DOI (optional)</label>
                <input
                  type="text"
                  value={formData.doi || ''}
                  onChange={(e) => setFormData({ ...formData, doi: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Volume (optional)</label>
                <input
                  type="text"
                  value={formData.volume || ''}
                  onChange={(e) => setFormData({ ...formData, volume: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Link (optional)</label>
              <input
                type="url"
                value={formData.link || ''}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gradient</label>
              <select
                value={formData.gradient || 'from-green-500 to-emerald-500'}
                onChange={(e) => setFormData({ ...formData, gradient: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="from-green-500 to-emerald-500">Green to Emerald</option>
                <option value="from-yellow-500 to-amber-500">Yellow to Amber</option>
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
                <option value="from-slate-500 to-gray-500">Slate to Gray</option>
              </select>
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
                <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                <p className="text-gray-600 text-sm mt-1">{item.authors}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm">{item.type}</span>
                  {item.journal && <span className="text-primary-700 font-semibold text-sm">{item.journal}</span>}
                  {item.year && <span className="text-gray-500 text-sm">({item.year})</span>}
                  {item.doi && <span className="px-3 py-1 bg-primary-50 text-primary-700 rounded-lg text-sm">DOI: {item.doi}</span>}
                </div>
                <div className="mt-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    item.status === 'Published' ? 'bg-green-100 text-green-700' :
                    item.status === 'Major Revision' ? 'bg-amber-100 text-amber-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {item.status}
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

