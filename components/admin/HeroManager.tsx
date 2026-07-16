'use client'

import { useEffect, useState } from 'react'
import { Save, Plus, X, Upload, FileText, Loader2, ImageIcon } from 'lucide-react'
import type { Hero } from '@/lib/types'

export default function HeroManager() {
  const [item, setItem] = useState<Hero | null>(null)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState<Partial<Hero>>({})
  const [showForm, setShowForm] = useState(false)
  const [focusTag, setFocusTag] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadMsg, setUploadMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [imgUploading, setImgUploading] = useState(false)
  const [imgMsg, setImgMsg] = useState<{ ok: boolean; text: string } | null>(null)

  const handleProfileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = '' // allow re-selecting the same file later
    if (!file) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setImgMsg({ ok: false, text: 'Please select a JPG, PNG, or WEBP image.' })
      return
    }
    setImgUploading(true)
    setImgMsg(null)
    try {
      const body = new FormData()
      body.append('file', file)
      const res = await fetch('/api/profile-image/upload', { method: 'POST', body })
      const data = await res.json()
      if (res.ok) {
        setFormData((prev) => ({ ...prev, profile_image_url: data.url }))
        setImgMsg({ ok: true, text: 'Profile image updated! It now shows on your hero section.' })
        if (typeof window !== 'undefined') window.dispatchEvent(new Event('content-updated'))
        await fetchItem()
      } else {
        setImgMsg({ ok: false, text: data.error || 'Upload failed.' })
      }
    } catch (err: any) {
      setImgMsg({ ok: false, text: err.message || 'Upload failed.' })
    } finally {
      setImgUploading(false)
    }
  }

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = '' // allow re-selecting the same file later
    if (!file) return
    if (file.type !== 'application/pdf') {
      setUploadMsg({ ok: false, text: 'Please select a PDF file.' })
      return
    }
    setUploading(true)
    setUploadMsg(null)
    try {
      const body = new FormData()
      body.append('file', file)
      const res = await fetch('/api/resume/upload', { method: 'POST', body })
      const data = await res.json()
      if (res.ok) {
        setFormData((prev) => ({ ...prev, cv_url: data.url }))
        setUploadMsg({ ok: true, text: 'Resume uploaded! The Download CV link now points to your new file.' })
        if (typeof window !== 'undefined') window.dispatchEvent(new Event('content-updated'))
        await fetchItem()
      } else {
        setUploadMsg({ ok: false, text: data.error || 'Upload failed.' })
      }
    } catch (err: any) {
      setUploadMsg({ ok: false, text: err.message || 'Upload failed.' })
    } finally {
      setUploading(false)
    }
  }

  useEffect(() => {
    fetchItem()
  }, [])

  const fetchItem = async () => {
    try {
      const res = await fetch('/api/hero')
      const data = await res.json()
      setItem(data)
      if (data) {
        setFormData(data)
        setShowForm(true)
      }
    } catch (error) {
      console.error('Error fetching hero:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setFormData({
      name: '',
      title: '',
      subtitle: '',
      description: '',
      email: '',
      phone: '',
      cv_url: '/Bappy_CV_Official.pdf',
      github_url: 'https://github.com/SarbajitPbappy',
      linkedin_url: 'https://linkedin.com/in/iamsarbajit',
      profile_image_url: '/profile.jpg',
      focus_tags: [],
      order: 0,
    })
    setShowForm(true)
  }

  const handleSave = async () => {
    try {
      const url = item?.id ? `/api/hero/${item.id}` : '/api/hero'
      const method = item?.id ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        await fetchItem()
        // Trigger frontend refresh
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('content-updated'))
        }
        alert('Hero section saved successfully!')
      }
    } catch (error) {
      console.error('Error saving hero:', error)
      alert('Failed to save. Please try again.')
    }
  }

  const addFocusTag = () => {
    if (focusTag.trim()) {
      setFormData({
        ...formData,
        focus_tags: [...(formData.focus_tags || []), focusTag.trim()],
      })
      setFocusTag('')
    }
  }

  const removeFocusTag = (index: number) => {
    const tags = formData.focus_tags?.filter((_, i) => i !== index) || []
    setFormData({ ...formData, focus_tags: tags })
  }

  if (loading) {
    return <div className="text-center py-12 text-gray-600">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Hero Section</h2>
        {!item && (
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Hero Section
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
              <input
                type="text"
                value={formData.subtitle || ''}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                rows={4}
                placeholder="Enter a brief description about yourself..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="text"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CV URL</label>
                <input
                  type="text"
                  value={formData.cv_url || ''}
                  onChange={(e) => setFormData({ ...formData, cv_url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">GitHub URL</label>
                <input
                  type="url"
                  value={formData.github_url || ''}
                  onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn URL</label>
                <input
                  type="url"
                  value={formData.linkedin_url || ''}
                  onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Resume / CV upload */}
            <div className="rounded-lg border border-dashed border-primary-300 bg-primary-50/50 p-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-primary-600" />
                <label className="block text-sm font-semibold text-gray-800">Resume / CV file (PDF)</label>
              </div>
              <p className="text-xs text-gray-500 mb-3">
                Upload a new PDF to replace your CV. The <strong>CV URL</strong> above and the site&apos;s
                &quot;Download CV&quot; button update automatically. (Requires the one-time
                <code className="mx-1 px-1 rounded bg-gray-100">create_resume_bucket.sql</code> setup in Supabase.)
              </p>
              <div className="flex items-center gap-3">
                <label
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white cursor-pointer transition-colors ${
                    uploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700'
                  }`}
                >
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {uploading ? 'Uploading…' : 'Upload Resume (PDF)'}
                  <input
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    disabled={uploading}
                    onChange={handleResumeUpload}
                  />
                </label>
                {formData.cv_url && (
                  <a
                    href={formData.cv_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary-600 hover:underline"
                  >
                    View current CV
                  </a>
                )}
              </div>
              {uploadMsg && (
                <p className={`mt-2 text-sm ${uploadMsg.ok ? 'text-green-600' : 'text-red-600'}`}>
                  {uploadMsg.text}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Profile Image URL</label>
              <input
                type="text"
                value={formData.profile_image_url || ''}
                onChange={(e) => setFormData({ ...formData, profile_image_url: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Profile image upload */}
            <div className="rounded-lg border border-dashed border-primary-300 bg-primary-50/50 p-4">
              <div className="flex items-center gap-2 mb-2">
                <ImageIcon className="w-4 h-4 text-primary-600" />
                <label className="block text-sm font-semibold text-gray-800">Profile image (JPG / PNG / WEBP)</label>
              </div>
              <p className="text-xs text-gray-500 mb-3">
                Upload a new photo to replace your profile picture. The <strong>Profile Image URL</strong> above and the
                hero photo update automatically. (Requires the one-time
                <code className="mx-1 px-1 rounded bg-gray-100">create_media_bucket.sql</code> setup in Supabase.)
              </p>
              <div className="flex items-center gap-3">
                <label
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white cursor-pointer transition-colors ${
                    imgUploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700'
                  }`}
                >
                  {imgUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {imgUploading ? 'Uploading…' : 'Upload Profile Image'}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    disabled={imgUploading}
                    onChange={handleProfileUpload}
                  />
                </label>
                {formData.profile_image_url && (
                  <a
                    href={formData.profile_image_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary-600 hover:underline"
                  >
                    View current image
                  </a>
                )}
              </div>
              {imgMsg && (
                <p className={`mt-2 text-sm ${imgMsg.ok ? 'text-green-600' : 'text-red-600'}`}>
                  {imgMsg.text}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Focus Tags</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={focusTag}
                  onChange={(e) => setFocusTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFocusTag())}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Add tag and press Enter"
                />
                <button
                  onClick={addFocusTag}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.focus_tags?.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-lg text-sm"
                  >
                    {tag}
                    <button
                      onClick={() => removeFocusTag(index)}
                      className="hover:text-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
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
              <p className="text-primary-600 font-medium">{item.title}</p>
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

