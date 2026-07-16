'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Palette, Moon, Sun, X, Check, RotateCcw } from 'lucide-react'
import { useTheme, themeOptions } from './ThemeProvider'
import type { Theme } from '@/lib/types'

// Small colour cue per theme for the picker.
const swatches: Record<Theme, string[]> = {
  minimal: ['#171717', '#737373', '#e5e5e5'],
  modern: ['#0ea5e9', '#14b8a6', '#e2e8f0'],
  aesthetic: ['#f472b6', '#c084fc', '#fde8ff'],
  professional: ['#1e3a8a', '#166534', '#d1d5db'],
  academic: ['#7f1d1d', '#b45309', '#d6d3d1'],
  neural: ['#22d3ee', '#10b981', '#0f172a'],
  creative: ['#d946ef', '#f59e0b', '#6366f1'],
}

/**
 * Public, per-visitor theme previewer. Applies a theme only in THIS browser
 * (localStorage) via ThemeProvider's preview API — it never writes to the DB, so
 * it never changes what other visitors see. "Reset" returns to the admin default.
 */
export default function ThemePreview() {
  const { theme, darkMode, previewActive, previewSetTheme, previewToggleDark, resetPreview } = useTheme()
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  if (!mounted) return null

  return (
    <div ref={panelRef} className="fixed bottom-6 left-6 z-50">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            className="absolute bottom-16 left-0 w-72 rounded-2xl overflow-hidden"
            style={{
              backgroundColor: 'rgb(var(--color-surface) / 0.97)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgb(var(--color-border) / 0.6)',
              boxShadow: 'var(--shadow-xl)',
            }}
          >
            <div
              className="px-4 py-3 flex items-center justify-between"
              style={{ borderBottom: '1px solid rgb(var(--color-border) / 0.4)' }}
            >
              <div>
                <div className="text-sm font-semibold" style={{ color: 'rgb(var(--color-text))' }}>
                  Preview themes
                </div>
                <div className="text-[11px]" style={{ color: 'rgb(var(--color-text-muted))' }}>
                  Only changes your view
                </div>
              </div>
              <button onClick={() => setOpen(false)} aria-label="Close" className="p-1 rounded-lg">
                <X className="w-4 h-4" style={{ color: 'rgb(var(--color-text-muted))' }} />
              </button>
            </div>

            <div
              className="px-4 py-3 flex items-center justify-between"
              style={{ borderBottom: '1px solid rgb(var(--color-border) / 0.4)' }}
            >
              <span className="text-sm font-medium" style={{ color: 'rgb(var(--color-text))' }}>
                Dark mode
              </span>
              <button
                onClick={previewToggleDark}
                aria-label="Toggle dark mode"
                className="relative w-12 h-7 rounded-full transition-colors"
                style={{ backgroundColor: darkMode ? 'rgb(var(--color-primary))' : 'rgb(var(--color-border))' }}
              >
                <motion.div
                  className="absolute top-1 w-5 h-5 rounded-full bg-white flex items-center justify-center shadow"
                  animate={{ x: darkMode ? 24 : 4 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                >
                  {darkMode ? <Moon className="w-3 h-3 text-indigo-600" /> : <Sun className="w-3 h-3 text-amber-500" />}
                </motion.div>
              </button>
            </div>

            <div className="px-2 py-2 max-h-72 overflow-y-auto">
              {themeOptions.map((opt) => {
                const active = theme === opt.value
                return (
                  <button
                    key={opt.value}
                    onClick={() => previewSetTheme(opt.value)}
                    className="w-full flex items-center gap-3 px-2 py-2 rounded-xl transition-colors text-left"
                    style={{ backgroundColor: active ? 'rgb(var(--color-primary) / 0.12)' : 'transparent' }}
                  >
                    <div className="flex -space-x-1 shrink-0">
                      {swatches[opt.value].map((c, i) => (
                        <span
                          key={i}
                          className="w-4 h-4 rounded-full border-2"
                          style={{ backgroundColor: c, borderColor: 'rgb(var(--color-surface))' }}
                        />
                      ))}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium" style={{ color: 'rgb(var(--color-text))' }}>
                        {opt.label}
                      </div>
                      <div className="text-[11px] truncate" style={{ color: 'rgb(var(--color-text-muted))' }}>
                        {opt.description}
                      </div>
                    </div>
                    {active && <Check className="w-4 h-4 shrink-0" style={{ color: 'rgb(var(--color-primary))' }} />}
                  </button>
                )
              })}
            </div>

            <div className="px-4 py-3" style={{ borderTop: '1px solid rgb(var(--color-border) / 0.4)' }}>
              <button
                onClick={resetPreview}
                disabled={!previewActive}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium"
                style={{
                  backgroundColor: 'rgb(var(--color-surface-elevated))',
                  color: 'rgb(var(--color-text))',
                  opacity: previewActive ? 1 : 0.5,
                  cursor: previewActive ? 'pointer' : 'not-allowed',
                }}
              >
                <RotateCcw className="w-4 h-4" /> Reset to site default
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setOpen((v) => !v)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        aria-label="Preview themes"
        className="relative p-3 rounded-full"
        style={{
          backgroundColor: 'rgb(var(--color-surface))',
          border: '1px solid rgb(var(--color-border))',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <Palette className="w-5 h-5" style={{ color: 'rgb(var(--color-primary))' }} />
        {previewActive && (
          <span
            className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full"
            style={{ backgroundColor: 'rgb(var(--color-primary))', border: '2px solid rgb(var(--color-surface))' }}
          />
        )}
      </motion.button>
    </div>
  )
}
