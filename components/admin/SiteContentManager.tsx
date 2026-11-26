'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Save, Plus, Trash2, ArrowUp, ArrowDown, Loader2, Upload, RotateCcw } from 'lucide-react'
import { defaultSiteContent, mergeSiteContent, type SiteContent } from '@/lib/siteContent'

/**
 * Admin → Homepage. Edits the content that used to be hard-coded in
 * lib/site.ts: hero portrait, location, research line, availability,
 * highlights, the "Latest" strip, research questions and awards.
 */

const input =
  'w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm'
const label = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'
const card = 'bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6'

type FieldSpec<T> = { key: keyof T & string; label: string; placeholder?: string; multiline?: boolean; width?: string }

function ListEditor<T extends Record<string, string>>({
  title,
  hint,
  items,
  fields,
  blank,
  onChange,
}: {
  title: string
  hint?: string
  items: T[]
  fields: FieldSpec<T>[]
  blank: T
  onChange: (items: T[]) => void
}) {
  const set = (i: number, key: keyof T, value: string) =>
    onChange(items.map((it, j) => (j === i ? { ...it, [key]: value } : it)))
  const move = (i: number, d: -1 | 1) => {
    const j = i + d
    if (j < 0 || j >= items.length) return
    const next = items.slice()
    ;[next[i], next[j]] = [next[j], next[i]]
    onChange(next)
  }

  return (
    <section className={card}>
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
          {hint && <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{hint}</p>}
        </div>
        <button
          type="button"
          onClick={() => onChange([...items, { ...blank }])}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 shrink-0"
        >
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>

      {items.length === 0 && <p className="text-sm text-gray-500 dark:text-gray-400">Nothing here yet. This block is hidden on the site while it&rsquo;s empty.</p>}

      <ol className="space-y-3">
        {items.map((it, i) => (
          <li key={i} className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 p-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-6 gap-3">
                {fields.map((f) => (
                  <div key={f.key} className={f.width ?? 'sm:col-span-6'}>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{f.label}</label>
                    {f.multiline ? (
                      <textarea rows={3} value={it[f.key] ?? ''} placeholder={f.placeholder} onChange={(e) => set(i, f.key, e.target.value)} className={input} />
                    ) : (
                      <input type="text" value={it[f.key] ?? ''} placeholder={f.placeholder} onChange={(e) => set(i, f.key, e.target.value)} className={input} />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex sm:flex-col gap-1.5 sm:pt-5 shrink-0">
                <button type="button" aria-label="Move up" onClick={() => move(i, -1)} disabled={i === 0} className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 disabled:opacity-30">
                  <ArrowUp className="w-4 h-4" />
                </button>
                <button type="button" aria-label="Move down" onClick={() => move(i, 1)} disabled={i === items.length - 1} className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 disabled:opacity-30">
                  <ArrowDown className="w-4 h-4" />
                </button>
                <button type="button" aria-label="Remove" onClick={() => onChange(items.filter((_, j) => j !== i))} className="p-2 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-100">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}

export default function SiteContentManager() {
  const [data, setData] = useState<SiteContent>(defaultSiteContent)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  useEffect(() => {
    fetch('/api/site-content', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => setData(mergeSiteContent(d)))
      .catch(() => setMsg({ ok: false, text: 'Could not load the current content; showing defaults.' }))
      .finally(() => setLoading(false))
  }, [])

  const patch = (p: Partial<SiteContent>) => setData((d) => ({ ...d, ...p }))

  const save = async () => {
    setSaving(true)
    setMsg(null)
    try {
      const res = await fetch('/api/site-content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const body = await res.json()
      if (!res.ok) throw new Error(body.error || 'Save failed')
      setData(mergeSiteContent(body))
      setMsg({ ok: true, text: 'Saved. The homepage now shows these changes.' })
      window.dispatchEvent(new Event('content-updated'))
    } catch (e: any) {
      setMsg({ ok: false, text: e.message })
    } finally {
      setSaving(false)
    }
  }

  const uploadHeadshot = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setUploading(true)
    setMsg(null)
    try {
      const body = new FormData()
      body.append('file', file)
      body.append('target', 'headshot')
      const res = await fetch('/api/profile-image/upload', { method: 'POST', body })
      const out = await res.json()
      if (!res.ok) throw new Error(out.error || 'Upload failed')
      patch({ headshotUrl: out.url })
      setMsg({ ok: true, text: 'Portrait uploaded. Press “Save changes” to publish it.' })
    } catch (err: any) {
      setMsg({ ok: false, text: err.message })
    } finally {
      setUploading(false)
    }
  }

  if (loading) return <div className="text-center py-12 text-gray-600 dark:text-gray-400">Loading…</div>

  const SaveBar = (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={save}
        disabled={saving}
        className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-60"
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        Save changes
      </button>
      {msg && (
        <p className={`text-sm ${msg.ok ? 'text-green-700 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`} role="status">
          {msg.text}
        </p>
      )}
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Homepage</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Hero text, highlights, Latest news, research questions and awards.</p>
        </div>
        {SaveBar}
      </div>

      <section className={card}>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Hero</h3>
        <div className="grid gap-5 md:grid-cols-[auto_1fr]">
          <div className="flex md:flex-col items-center gap-3">
            <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 shrink-0">
              {data.headshotUrl && <Image src={data.headshotUrl} alt="Hero portrait" fill className="object-cover object-top" sizes="80px" />}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="inline-flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                Upload portrait
                <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={uploadHeadshot} disabled={uploading} />
              </label>
              {data.headshotUrl !== defaultSiteContent.headshotUrl && (
                <button type="button" onClick={() => patch({ headshotUrl: defaultSiteContent.headshotUrl })} className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400">
                  <RotateCcw className="w-3 h-3" /> Use the default photo
                </button>
              )}
            </div>
          </div>
          <div className="space-y-4 min-w-0">
            <div>
              <label className={label}>Research line (under your name)</label>
              <textarea rows={3} value={data.researchLine} onChange={(e) => patch({ researchLine: e.target.value })} className={input} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={label}>Short title (beside location)</label>
                <input type="text" value={data.shortTitle} onChange={(e) => patch({ shortTitle: e.target.value })} className={input} placeholder="AI/ML Researcher" />
              </div>
              <div>
                <label className={label}>Location</label>
                <input type="text" value={data.location} onChange={(e) => patch({ location: e.target.value })} className={input} placeholder="Dhaka, Bangladesh" />
              </div>
              <div>
                <label className={label}>Availability badge (empty hides it)</label>
                <input type="text" value={data.availability} onChange={(e) => patch({ availability: e.target.value })} className={input} placeholder="Open to funded PhD positions" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={label}>Google Scholar URL (empty hides it)</label>
                <input type="url" value={data.scholarUrl} onChange={(e) => patch({ scholarUrl: e.target.value })} className={input} />
              </div>
              <div>
                <label className={label}>ORCID URL (empty hides it)</label>
                <input type="url" value={data.orcidUrl} onChange={(e) => patch({ orcidUrl: e.target.value })} className={input} />
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Name, job title, email, GitHub, LinkedIn and CV are edited under “Name, links &amp; CV”. Its description is for search engines; the research line above is what visitors see.</p>
          </div>
        </div>
      </section>

      <section className={card}>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Figure captions</h3>
        <div className="space-y-4">
          <div>
            <label className={label}>Fig. 1 (hero MRI figure; empty hides it)</label>
            <textarea rows={3} value={data.fig1Caption} onChange={(e) => patch({ fig1Caption: e.target.value })} className={input} />
          </div>
          <div>
            <label className={label}>Fig. 2 (federated learning diagram; empty hides it)</label>
            <textarea rows={3} value={data.fig2Caption} onChange={(e) => patch({ fig2Caption: e.target.value })} className={input} />
          </div>
        </div>
      </section>

      <ListEditor
        title="Highlights"
        hint="The four figures under the hero text. A label of exactly “journal papers” is counted automatically from your publications."
        items={data.facts}
        blank={{ value: '', label: '' }}
        fields={[
          { key: 'value', label: 'Value', placeholder: '3.95', width: 'sm:col-span-2' },
          { key: 'label', label: 'Label', placeholder: 'CGPA, Batch First', width: 'sm:col-span-4' },
        ]}
        onChange={(facts) => patch({ facts })}
      />

      <ListEditor
        title="Latest"
        hint="News strip under the hero. Newest first; three items fit best."
        items={data.news}
        blank={{ date: '', text: '' }}
        fields={[
          { key: 'date', label: 'Date', placeholder: 'Nov 2026', width: 'sm:col-span-2' },
          { key: 'text', label: 'Text', placeholder: 'Paper accepted at …', width: 'sm:col-span-4' },
        ]}
        onChange={(news) => patch({ news })}
      />

      <ListEditor
        title="Research questions"
        hint="Shown beside Fig. 2 in the Research section."
        items={data.researchQuestions}
        blank={{ q: '', note: '' }}
        fields={[
          { key: 'q', label: 'Question', placeholder: 'How can hospitals …?' },
          { key: 'note', label: 'What you did about it', multiline: true },
        ]}
        onChange={(researchQuestions) => patch({ researchQuestions })}
      />

      <ListEditor
        title="Honours & awards"
        hint="Listed in the Education section."
        items={data.awards}
        blank={{ title: '', detail: '', year: '' }}
        fields={[
          { key: 'title', label: 'Award', width: 'sm:col-span-3' },
          { key: 'detail', label: 'Detail', width: 'sm:col-span-2' },
          { key: 'year', label: 'Year', width: 'sm:col-span-1' },
        ]}
        onChange={(awards) => patch({ awards })}
      />

      <div className="sticky bottom-0 -mx-4 sm:mx-0 px-4 py-3 bg-white/95 dark:bg-gray-900/95 backdrop-blur border-t border-gray-200 dark:border-gray-700 sm:rounded-xl sm:border">
        {SaveBar}
      </div>
    </div>
  )
}
