'use client'

import { useEffect, useState } from 'react'
import { Plus, Edit, Trash2, Save, X, Trash } from 'lucide-react'
import type { Skill } from '@/lib/types'

export default function SkillsManager() {
  const [items, setItems] = useState<Skill[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState<Partial<Skill>>({})
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    try {
      const res = await fetch('/api/skills')
      const data = await res.json()
      setItems(data)
    } catch (error) {
      console.error('Error fetching skills:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setFormData({
      name: '',
      category: '',
      level: '',
      icon: '',
      order: items.length,
    })
    setShowForm(true)
    setEditingId(null)
  }

  const handleEdit = (item: Skill) => {
    setFormData(item)
    setEditingId(item.id!)
    setShowForm(true)
  }

  const handleSave = async () => {
    try {
      if (!formData.name || !formData.category) {
        alert('Please fill in name and category')
        return
      }

      const url = editingId ? `/api/skills/${editingId}` : '/api/skills'
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
        alert('Skill saved successfully!')
      } else {
        const error = await res.json().catch(() => ({ error: 'Unknown error' }))
        alert(`Failed to save: ${error.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error saving skill:', error)
      alert('Failed to save. Please try again.')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this skill?')) return

    try {
      const res = await fetch(`/api/skills/${id}`, { method: 'DELETE' })
      if (res.ok) {
        await fetchItems()
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('content-updated'))
        }
        alert('Skill deleted successfully!')
      }
    } catch (error) {
      console.error('Error deleting skill:', error)
      alert('Failed to delete. Please try again.')
    }
  }

  const handleDeleteAll = async () => {
    if (items.length === 0) {
      alert('No skills to delete.')
      return
    }

    const confirmMessage = `Are you sure you want to delete ALL ${items.length} skills? This action cannot be undone!`
    if (!confirm(confirmMessage)) return

    // Double confirmation for safety
    if (!confirm('This will permanently delete all skills. Type "DELETE ALL" to confirm.')) return

    try {
      // Delete all items one by one
      const deletePromises = items.map(item => 
        item.id ? fetch(`/api/skills/${item.id}`, { method: 'DELETE' }) : Promise.resolve()
      )
      
      await Promise.all(deletePromises)
      await fetchItems()
      
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('content-updated'))
      }
      
      alert(`Successfully deleted all ${items.length} skills!`)
    } catch (error) {
      console.error('Error deleting all skills:', error)
      alert('Failed to delete all skills. Please try again.')
    }
  }

  if (loading) {
    return <div className="text-center py-12 text-gray-600">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Skills</h2>
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
            Add New Skill
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingId ? 'Edit Skill' : 'Add New Skill'}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Skill Name *</label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="e.g., JavaScript, Python, React"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <input
                type="text"
                value={formData.category || ''}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="e.g., Programming Languages, Frameworks, Tools"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Level (optional)</label>
              <input
                type="text"
                value={formData.level || ''}
                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="e.g., Expert, Intermediate, Beginner"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Icon (optional)</label>
              <input
                type="text"
                value={formData.icon || ''}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="e.g., Code, Brain, Database, Cloud, Smartphone, Wrench"
              />
              <p className="text-xs text-gray-500 mt-1">Icon name from Lucide React (case-sensitive)</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
              <input
                type="number"
                value={formData.order ?? 0}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
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
        {items.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 text-center text-gray-500">
            No skills added yet. Click "Add New Skill" to get started.
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {item.icon && (
                      <span className="text-gray-400 text-sm font-mono">{item.icon}</span>
                    )}
                    <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="font-medium">Category:</span>
                    <span>{item.category}</span>
                    {item.level && (
                      <>
                        <span className="font-medium">Level:</span>
                        <span>{item.level}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(item)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => item.id && handleDelete(item.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
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

