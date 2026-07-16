'use client'

import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { MotionConfig } from 'framer-motion'
import type { Theme, Settings } from '@/lib/types'

const VALID_THEMES: Theme[] = ['minimal', 'modern', 'aesthetic', 'professional', 'academic', 'neural', 'creative']

// Theme metadata for UI display
export const themeOptions: { value: Theme; label: string; description: string; icon: string }[] = [
  { value: 'minimal', label: 'Minimal', description: 'Clean & simple', icon: '○' },
  { value: 'modern', label: 'Modern', description: 'Vibrant & glass', icon: '◆' },
  { value: 'aesthetic', label: 'Aesthetic', description: 'Soft & dreamy', icon: '✦' },
  { value: 'professional', label: 'Professional', description: 'Corporate & serious', icon: '■' },
  { value: 'academic', label: 'Academic', description: 'Scholarly & research', icon: '◈' },
  { value: 'neural', label: 'Neural', description: 'Deep-tech neural network', icon: '⬡' },
  { value: 'creative', label: 'Creative', description: 'Bold & mind-blowing', icon: '✺' },
]

interface ThemeContextType {
  darkMode: boolean
  theme: Theme
  toggleDarkMode: () => void
  setTheme: (theme: Theme) => void
  settings: Settings | null
  // Per-visitor preview (local only — never changes the global/admin setting)
  previewActive: boolean
  previewSetTheme: (theme: Theme) => void
  previewToggleDark: () => void
  resetPreview: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Initialize with default values (no localStorage access during SSR)
  const [darkMode, setDarkMode] = useState(false)
  const [theme, setThemeState] = useState<Theme>('modern')
  const [settings, setSettings] = useState<Settings | null>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  // When a visitor is previewing a theme locally, the global DB setting must not
  // override their view. A ref keeps this readable inside async callbacks.
  const [previewActive, setPreviewActive] = useState(false)
  const previewingRef = useRef(false)

  // Apply theme classes to document
  const applyTheme = (newTheme: Theme, newDarkMode: boolean) => {
    if (typeof document !== 'undefined') {
      const html = document.documentElement
      
      // Set dark mode class
      if (newDarkMode) {
        html.classList.add('dark')
      } else {
        html.classList.remove('dark')
      }
      
      // Set theme attribute
      html.setAttribute('data-theme', newTheme)
    }
  }

  useEffect(() => {
    // Mark as mounted (client-side only)
    setMounted(true)

    // 1) Apply any per-visitor preview immediately (local only, never DB).
    let previewing = false
    if (typeof window !== 'undefined') {
      const pt = localStorage.getItem('previewTheme') as Theme | null
      if (pt && VALID_THEMES.includes(pt)) {
        previewing = true
        previewingRef.current = true
        const pd = localStorage.getItem('previewDark') === 'true'
        setPreviewActive(true)
        setThemeState(pt)
        setDarkMode(pd)
        applyTheme(pt, pd)
      }
    }

    // 2) Load the admin's global default (won't override an active preview).
    fetchSettings(previewing)

    const handleUpdate = () => {
      fetchSettings()
    }
    window.addEventListener('settings-updated', handleUpdate)

    return () => {
      window.removeEventListener('settings-updated', handleUpdate)
    }
  }, [])

  useEffect(() => {
    // Apply the global setting only when the visitor is NOT previewing locally.
    if (settings && !previewingRef.current && typeof document !== 'undefined') {
      setDarkMode(settings.dark_mode)
      setThemeState(settings.theme)
      applyTheme(settings.theme, settings.dark_mode)
    }
  }, [settings])

  const fetchSettings = async (skipApply = false) => {
    try {
      const res = await fetch('/api/settings')
      const data = await res.json()

      // Handle both object with id and plain object
      if (data && (data.id || data.dark_mode !== undefined)) {
        setSettings(data.id ? data : { ...data, id: undefined })
        if (!skipApply && !previewingRef.current) {
          const darkModeValue = data.dark_mode || false
          const themeValue = data.theme || 'modern'
          setDarkMode(darkModeValue)
          setThemeState(themeValue)
          applyTheme(themeValue, darkModeValue)
        }
      } else if (!skipApply && !previewingRef.current) {
        // Default values if no settings
        setDarkMode(false)
        setThemeState('modern')
        applyTheme('modern', false)
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
      if (!skipApply && !previewingRef.current) {
        setDarkMode(false)
        setThemeState('modern')
        applyTheme('modern', false)
      }
    } finally {
      setLoading(false)
    }
  }

  const toggleDarkMode = async () => {
    const newDarkMode = !darkMode
    
    // Update state immediately
    setDarkMode(newDarkMode)

    // Apply immediately for live admin preview
    applyTheme(theme, newDarkMode)

    // Save to database (this is the global source of truth for all visitors)
    if (settings?.id) {
      fetch(`/api/settings/${settings.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dark_mode: newDarkMode }),
      })
        .then(res => {
          if (res.ok) {
            return res.json()
          }
          throw new Error('Failed to update')
        })
        .then(updated => {
          setSettings(updated)
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('settings-updated'))
          }
        })
        .catch(error => {
          console.error('Error updating dark mode in DB:', error)
          // UI still works, just didn't save to DB
        })
    } else {
      // Try to create settings (non-blocking)
      fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dark_mode: newDarkMode, theme }),
      })
        .then(res => {
          if (res.ok) {
            return res.json()
          }
          return null
        })
        .then(newSettings => {
          if (newSettings) {
            setSettings(newSettings)
          }
        })
        .catch(error => {
          console.error('Error creating settings:', error)
        })
    }
  }

  const setTheme = async (newTheme: Theme) => {
    // Update state immediately
    setThemeState(newTheme)

    // Apply immediately for live admin preview
    applyTheme(newTheme, darkMode)

    // Save to database (this is the global source of truth for all visitors)
    if (settings?.id) {
      fetch(`/api/settings/${settings.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: newTheme }),
      })
        .then(res => {
          if (res.ok) {
            return res.json()
          }
          throw new Error('Failed to update')
        })
        .then(updated => {
          setSettings(updated)
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('settings-updated'))
          }
        })
        .catch(error => {
          console.error('Error updating theme in DB:', error)
          // UI still works, just didn't save to DB
        })
    } else {
      // Try to create settings (non-blocking)
      fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dark_mode: darkMode, theme: newTheme }),
      })
        .then(res => {
          if (res.ok) {
            return res.json()
          }
          return null
        })
        .then(newSettings => {
          if (newSettings) {
            setSettings(newSettings)
          }
        })
        .catch(error => {
          console.error('Error creating settings:', error)
        })
    }
  }

  // ---- Per-visitor preview (local only; never writes to the DB) ----
  const previewSetTheme = (newTheme: Theme) => {
    previewingRef.current = true
    setPreviewActive(true)
    setThemeState(newTheme)
    applyTheme(newTheme, darkMode)
    if (typeof window !== 'undefined') {
      localStorage.setItem('previewTheme', newTheme)
      localStorage.setItem('previewDark', String(darkMode))
    }
  }

  const previewToggleDark = () => {
    const newDark = !darkMode
    previewingRef.current = true
    setPreviewActive(true)
    setDarkMode(newDark)
    applyTheme(theme, newDark)
    if (typeof window !== 'undefined') {
      localStorage.setItem('previewTheme', theme)
      localStorage.setItem('previewDark', String(newDark))
    }
  }

  const resetPreview = () => {
    previewingRef.current = false
    setPreviewActive(false)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('previewTheme')
      localStorage.removeItem('previewDark')
    }
    const t = settings?.theme || 'modern'
    const d = settings?.dark_mode || false
    setThemeState(t)
    setDarkMode(d)
    applyTheme(t, d)
  }

  const ctxValue: ThemeContextType = {
    darkMode,
    theme,
    toggleDarkMode,
    setTheme,
    settings,
    previewActive,
    previewSetTheme,
    previewToggleDark,
    resetPreview,
  }

  // Always provide context, even during loading
  // Use mounted state to prevent hydration mismatch
  if (!mounted) {
    // Return default values during SSR to match initial client render
    return (
      <ThemeContext.Provider value={{ ...ctxValue, darkMode: false, theme: 'modern', settings: null, previewActive: false }}>
        <MotionConfig reducedMotion="user">{children}</MotionConfig>
      </ThemeContext.Provider>
    )
  }

  return (
    <ThemeContext.Provider value={ctxValue}>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
