'use client'

import { useEffect, useState } from 'react'
import { Save, Plus, X } from 'lucide-react'
import type { About } from '@/lib/types'

export default function AboutManager() {
  const [item, setItem] = useState<About | null>(null)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState<Partial<About>>({})
  const [showForm, setShowForm] = useState(false)
  const [newValue, setNewValue] = useState({ title: '', description: '' })
  const [newFact, setNewFact] = useState({ label: '', value: '' })

  useEffect(() => {
    fetchItem()
  }, [])

  const fetchItem = async () => {
    try {
      const res = await fetch('/api/about')
      const data = await res.json()
      setItem(data)
      if (data) {
        setFormData(data)
        setShowForm(true)
      }
    } catch (error) {
      console.error('Error fetching about:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setFormData({
      title: 'About Me',
      description: '',
      values: [],
      quick_facts: [],
      order: 0,
    })
    setShowForm(true)
  }

  const handleSave = async () => {
    try {
      const url = item?.id ? `/api/about/${item.id}` : '/api/about'
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
        alert('About section saved successfully!')
      }
    } catch (error) {
      console.error('Error saving about:', error)
      alert('Failed to save. Please try again.')
    }
  }

  const addValue = () => {
    if (newValue.title && newValue.description) {
      setFormData({
        ...formData,
        values: [...(formData.values || []), { ...newValue }],
      })
      setNewValue({ title: '', description: '' })
    }
  }

  const removeValue = (index: number) => {
    const values = formData.values?.filter((_, i) => i !== index) || []
    setFormData({ ...formData, values })
  }

  const addFact = () => {
    if (newFact.label && newFact.value) {
      setFormData({
        ...formData,
        quick_facts: [...(formData.quick_facts || []), { ...newFact }],
      })
      setNewFact({ label: '', value: '' })
    }
  }

  const removeFact = (index: number) => {
    const facts = formData.quick_facts?.filter((_, i) => i !== index) || []
    setFormData({ ...formData, quick_facts: facts })
  }

  if (loading) {
    return <div className="text-center py-12 text-gray-600">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">About Section</h2>
        {!item && (
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create About Section
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Section Title *</label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="e.g., About Me, About"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                rows={6}
                placeholder="Enter a detailed description about yourself..."
                required
              />
            </div>

            <div className="border-t pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Values</label>
              <div className="space-y-2 mb-3">
                {formData.values?.map((value, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="space-y-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Value Title</label>
                        <input
                          type="text"
                          value={value.title}
                          onChange={(e) => {
                            const values = [...(formData.values || [])]
                            values[index] = { ...value, title: e.target.value }
                            setFormData({ ...formData, values })
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Value Description</label>
                        <textarea
                          value={value.description}
                          onChange={(e) => {
                            const values = [...(formData.values || [])]
                            values[index] = { ...value, description: e.target.value }
                            setFormData({ ...formData, values })
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                          rows={2}
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => removeValue(index)}
                      className="mt-2 px-3 py-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <input
                  type="text"
                  value={newValue.title}
                  onChange={(e) => setNewValue({ ...newValue, title: e.target.value })}
                  placeholder="Value title"
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="text"
                  value={newValue.description}
                  onChange={(e) => setNewValue({ ...newValue, description: e.target.value })}
                  placeholder="Value description"
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <button
                onClick={addValue}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                + Add Value
              </button>
            </div>

            <div className="border-t pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Quick Facts</label>
              <div className="space-y-2 mb-3">
                {formData.quick_facts?.map((fact, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Fact Label</label>
                        <input
                          type="text"
                          value={fact.label}
                          onChange={(e) => {
                            const facts = [...(formData.quick_facts || [])]
                            facts[index] = { ...fact, label: e.target.value }
                            setFormData({ ...formData, quick_facts: facts })
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Fact Value</label>
                        <input
                          type="text"
                          value={fact.value}
                          onChange={(e) => {
                            const facts = [...(formData.quick_facts || [])]
                            facts[index] = { ...fact, value: e.target.value }
                            setFormData({ ...formData, quick_facts: facts })
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => removeFact(index)}
                      className="mt-2 px-3 py-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <input
                  type="text"
                  value={newFact.label}
                  onChange={(e) => setNewFact({ ...newFact, label: e.target.value })}
                  placeholder="Fact label"
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="text"
                  value={newFact.value}
                  onChange={(e) => setNewFact({ ...newFact, value: e.target.value })}
                  placeholder="Fact value"
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <button
                onClick={addFact}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                + Add Quick Fact
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
              <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
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

