'use client'

import { useEffect, useState } from 'react'
import { Plus, Edit, Trash2, Save, X } from 'lucide-react'
import type { WorkExperience } from '@/lib/types'

export default function WorkExperienceManager() {
  const [items, setItems] = useState<WorkExperience[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState<Partial<WorkExperience>>({})
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    try {
      const res = await fetch('/api/work-experience')
      const data = await res.json()
      setItems(data)
    } catch (error) {
      console.error('Error fetching work experience:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setFormData({
      title: '',
      organization: '',
      period: '',
      description: '',
      type: 'Work',
      gradient: 'from-blue-500 to-cyan-500',
      order: items.length,
    })
    setShowForm(true)
    setEditingId(null)
  }

  const handleEdit = (item: WorkExperience) => {
    setFormData(item)
    setEditingId(item.id!)
    setShowForm(true)
  }

  const handleSave = async () => {
    try {
      const url = editingId ? `/api/work-experience/${editingId}` : '/api/work-experience'
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
      console.error('Error saving work experience:', error)
      alert('Failed to save. Please try again.')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this item?')) return

    try {
      const res = await fetch(`/api/work-experience/${id}`, { method: 'DELETE' })
      if (res.ok) {
        await fetchItems()
      }
    } catch (error) {
      console.error('Error deleting work experience:', error)
      alert('Failed to delete. Please try again.')
    }
  }

  if (loading) {
    return <div className="text-center py-12 text-gray-600">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Work Experience</h2>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add New
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Icon (optional)</label>
              <input
                type="text"
                value={formData.icon || ''}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="e.g., Briefcase, Users, BookOpen, Award"
              />
              <p className="text-xs text-gray-500 mt-1">Icon name from Lucide React (case-sensitive)</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Organization *</label>
              <input
                type="text"
                value={formData.organization || ''}
                onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Period</label>
              <input
                type="text"
                value={formData.period || ''}
                onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="e.g., October 2025 – Present"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={formData.type || 'Work'}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as WorkExperience['type'] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="Work">Work</option>
                  <option value="Volunteering">Volunteering</option>
                  <option value="Internship">Internship</option>
                </select>
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
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                    <p className="text-primary-600 font-medium">{item.organization}</p>
                  </div>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    item.type === 'Work'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {item.type}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">{item.period}</p>
                <p className="text-gray-700 text-sm mt-2">{item.description}</p>
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

