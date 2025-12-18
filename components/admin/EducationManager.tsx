'use client'

import { useEffect, useState } from 'react'
import { Plus, Edit, Trash2, Save, X, Trash } from 'lucide-react'
import type { Education } from '@/lib/types'

export default function EducationManager() {
  const [items, setItems] = useState<Education[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState<Partial<Education>>({})
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    try {
      const res = await fetch('/api/education')
      const data = await res.json()
      setItems(data)
    } catch (error) {
      console.error('Error fetching education:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setFormData({
      institution: '',
      location: '',
      period: '',
      highlights: [],
      gradient: 'from-blue-500 to-cyan-500',
      order: items.length,
    })
    setShowForm(true)
    setEditingId(null)
  }

  const handleEdit = (item: Education) => {
    setFormData(item)
    setEditingId(item.id!)
    setShowForm(true)
  }

  const handleSave = async () => {
    try {
      const url = editingId ? `/api/education/${editingId}` : '/api/education'
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
      console.error('Error saving education:', error)
      alert('Failed to save. Please try again.')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this item?')) return

    try {
      const res = await fetch(`/api/education/${id}`, { method: 'DELETE' })
      if (res.ok) {
        await fetchItems()
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('content-updated'))
        }
      }
    } catch (error) {
      console.error('Error deleting education:', error)
      alert('Failed to delete. Please try again.')
    }
  }

  const handleDeleteAll = async () => {
    if (items.length === 0) {
      alert('No items to delete.')
      return
    }

    const confirmMessage = `Are you sure you want to delete ALL ${items.length} education entries? This action cannot be undone!`
    if (!confirm(confirmMessage)) return

    try {
      const deletePromises = items.map(item => 
        item.id ? fetch(`/api/education/${item.id}`, { method: 'DELETE' }) : Promise.resolve()
      )
      
      await Promise.all(deletePromises)
      await fetchItems()
      
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('content-updated'))
      }
      
      alert(`Successfully deleted all ${items.length} education entries!`)
    } catch (error) {
      console.error('Error deleting all education:', error)
      alert('Failed to delete all items. Please try again.')
    }
  }

  const addHighlight = () => {
    setFormData({
      ...formData,
      highlights: [...(formData.highlights || []), ''],
    })
  }

  const updateHighlight = (index: number, value: string) => {
    const highlights = [...(formData.highlights || [])]
    highlights[index] = value
    setFormData({ ...formData, highlights })
  }

  const removeHighlight = (index: number) => {
    const highlights = formData.highlights?.filter((_, i) => i !== index) || []
    setFormData({ ...formData, highlights })
  }

  if (loading) {
    return <div className="text-center py-12 text-gray-600">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Education</h2>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Icon (optional)</label>
              <input
                type="text"
                value={formData.icon || ''}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="e.g., GraduationCap, Globe, Award, BookOpen, School"
              />
              <p className="text-xs text-gray-500 mt-1">Icon name from Lucide React (case-sensitive)</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Degree</label>
                <input
                  type="text"
                  value={formData.degree || ''}
                  onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Program (optional)</label>
                <input
                  type="text"
                  value={formData.program || ''}
                  onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Institution *</label>
              <input
                type="text"
                value={formData.institution || ''}
                onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={formData.location || ''}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">GPA (optional)</label>
                <input
                  type="text"
                  value={formData.gpa || ''}
                  onChange={(e) => setFormData({ ...formData, gpa: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Period</label>
              <input
                type="text"
                value={formData.period || ''}
                onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="e.g., May 2022 – Present"
              />
            </div>
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
                <option value="from-slate-500 to-gray-500">Slate to Gray</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Highlights</label>
              {formData.highlights?.map((highlight, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={highlight}
                    onChange={(e) => updateHighlight(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <button
                    onClick={() => removeHighlight(index)}
                    className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                onClick={addHighlight}
                className="mt-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                + Add Highlight
              </button>
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
                <h3 className="text-lg font-semibold text-gray-900">{item.degree || item.program}</h3>
                <p className="text-primary-600 font-medium">{item.institution}</p>
                <p className="text-gray-500 text-sm">{item.location}</p>
                {item.gpa && <p className="text-gray-700 font-bold">{item.gpa}</p>}
                <p className="text-gray-500">{item.period}</p>
                <ul className="mt-2 space-y-1">
                  {item.highlights?.map((h, i) => (
                    <li key={i} className="text-gray-600 text-sm">• {h}</li>
                  ))}
                </ul>
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

