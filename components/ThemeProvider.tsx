'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import type { Theme, Settings } from '@/lib/types'

// Theme metadata for UI display
export const themeOptions: { value: Theme; label: string; description: string; icon: string }[] = [
  { value: 'minimal', label: 'Minimal', description: 'Clean & simple', icon: '○' },
  { value: 'modern', label: 'Modern', description: 'Vibrant & glass', icon: '◆' },
  { value: 'aesthetic', label: 'Aesthetic', description: 'Soft & dreamy', icon: '✦' },
  { value: 'professional', label: 'Professional', description: 'Corporate & serious', icon: '■' },
  { value: 'academic', label: 'Academic', description: 'Scholarly & research', icon: '◈' },
]

interface ThemeContextType {
  darkMode: boolean
  theme: Theme
  toggleDarkMode: () => void
  setTheme: (theme: Theme) => void
  settings: Settings | null
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Initialize with default values (no localStorage access during SSR)
  const [darkMode, setDarkMode] = useState(false)
  const [theme, setThemeState] = useState<Theme>('modern')
  const [settings, setSettings] = useState<Settings | null>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

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
    
    // Load from localStorage on client side only
    if (typeof window !== 'undefined') {
      const savedDarkMode = localStorage.getItem('darkMode')
      const savedTheme = localStorage.getItem('theme') as Theme
      
      const isDark = savedDarkMode === 'true'
      const validThemes: Theme[] = ['minimal', 'modern', 'aesthetic', 'professional', 'academic']
      const validTheme = savedTheme && validThemes.includes(savedTheme) ? savedTheme : 'modern'
      
      setDarkMode(isDark)
      setThemeState(validTheme)
      applyTheme(validTheme, isDark)
    }
    
    fetchSettings()
    
    const handleUpdate = () => {
      fetchSettings()
    }
    window.addEventListener('settings-updated', handleUpdate)
    
    return () => {
      window.removeEventListener('settings-updated', handleUpdate)
    }
  }, [])

  useEffect(() => {
    if (settings && typeof document !== 'undefined') {
      setDarkMode(settings.dark_mode)
      setThemeState(settings.theme)
      applyTheme(settings.theme, settings.dark_mode)
    }
  }, [settings])

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings')
      const data = await res.json()
      
      // Handle both object with id and plain object
      if (data && (data.id || data.dark_mode !== undefined)) {
        setSettings(data.id ? data : { ...data, id: undefined })
        const darkModeValue = data.dark_mode || false
        const themeValue = data.theme || 'modern'
        
        setDarkMode(darkModeValue)
        setThemeState(themeValue)
        applyTheme(themeValue, darkModeValue)
      } else {
        // Default values if no settings
        setDarkMode(false)
        setThemeState('modern')
        applyTheme('modern', false)
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
      // Set defaults on error
      setDarkMode(false)
      setThemeState('modern')
      applyTheme('modern', false)
    } finally {
      setLoading(false)
    }
  }

  const toggleDarkMode = async () => {
    const newDarkMode = !darkMode
    
    // Update state immediately
    setDarkMode(newDarkMode)
    
    // Save to localStorage immediately
    if (typeof window !== 'undefined') {
      localStorage.setItem('darkMode', String(newDarkMode))
      applyTheme(theme, newDarkMode)
    }
    
    // Save to database in background (non-blocking)
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
    
    // Save to localStorage immediately
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', newTheme)
      applyTheme(newTheme, darkMode)
    }
    
    // Save to database in background (non-blocking)
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

  // Always provide context, even during loading
  // Use mounted state to prevent hydration mismatch
  if (!mounted) {
    // Return default values during SSR to match initial client render
    return (
      <ThemeContext.Provider value={{ darkMode: false, theme: 'modern', toggleDarkMode, setTheme, settings: null }}>
        {children}
      </ThemeContext.Provider>
    )
  }
  
  return (
    <ThemeContext.Provider value={{ darkMode, theme, toggleDarkMode, setTheme, settings }}>
      {children}
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
