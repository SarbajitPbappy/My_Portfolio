'use client'

import { useEffect, useState } from 'react'
import { Save, Moon, Sun, Palette, Sparkles, Briefcase, GraduationCap, Minimize2 } from 'lucide-react'
import { useTheme, themeOptions } from '@/components/ThemeProvider'
import type { Settings, Theme } from '@/lib/types'

// Icon mapping for theme types
const themeIcons: Record<Theme, React.ReactNode> = {
  minimal: <Minimize2 className="w-5 h-5" />,
  modern: <Sparkles className="w-5 h-5" />,
  aesthetic: <Palette className="w-5 h-5" />,
  professional: <Briefcase className="w-5 h-5" />,
  academic: <GraduationCap className="w-5 h-5" />,
}

// Extended theme descriptions
const themeDescriptions: Record<Theme, { tagline: string; features: string[] }> = {
  minimal: {
    tagline: 'Clean and simple with maximum focus on content',
    features: ['Monochromatic palette', 'No shadows', 'Sharp corners', 'Inter font'],
  },
  modern: {
    tagline: 'Vibrant gradients with glassmorphism effects',
    features: ['Colorful gradients', 'Glass effects', 'Rounded corners', 'DM Sans font'],
  },
  aesthetic: {
    tagline: 'Soft pastels with a dreamy, artistic feel',
    features: ['Pink & purple palette', 'Soft shadows', 'Extra rounded', 'Playfair Display'],
  },
  professional: {
    tagline: 'Corporate design for business settings',
    features: ['Blue & green accents', 'Subtle effects', 'Traditional layout', 'Inter font'],
  },
  academic: {
    tagline: 'Scholarly design for research & higher education',
    features: ['Maroon & amber', 'Paper-like texture', 'Serif typography', 'Source Serif'],
  },
}

// Color previews for each theme
const themeColors: Record<Theme, { light: string[]; dark: string[] }> = {
  minimal: {
    light: ['#171717', '#737373', '#e5e5e5'],
    dark: ['#f5f5f5', '#a3a3a3', '#404040'],
  },
  modern: {
    light: ['#0ea5e9', '#14b8a6', '#e2e8f0'],
    dark: ['#38bdf8', '#2dd4bf', '#334155'],
  },
  aesthetic: {
    light: ['#f472b6', '#c084fc', '#fde8ff'],
    dark: ['#f9a8d4', '#d8b4fe', '#4c1d95'],
  },
  professional: {
    light: ['#1e3a8a', '#166534', '#d1d5db'],
    dark: ['#60a5fa', '#4ade80', '#374151'],
  },
  academic: {
    light: ['#7f1d1d', '#78350f', '#d6d3d1'],
    dark: ['#f87171', '#fbbf24', '#44403c'],
  },
}

export default function SettingsManager() {
  const { darkMode, theme, toggleDarkMode, setTheme, settings } = useTheme()
  const [item, setItem] = useState<Settings | null>(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    fetchItem()
    
    // Listen for settings updates
    const handleUpdate = () => {
      fetchItem()
    }
    window.addEventListener('settings-updated', handleUpdate)
    
    return () => {
      window.removeEventListener('settings-updated', handleUpdate)
    }
  }, [])

  useEffect(() => {
    if (settings) {
      setItem(settings)
      setShowForm(true)
    }
  }, [settings])

  const fetchItem = async () => {
    try {
      const res = await fetch('/api/settings')
      const data = await res.json()
      setItem(data)
      if (data) {
        setShowForm(true)
      } else {
        setShowForm(true)
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDarkModeToggle = async () => {
    // Optimistically update UI
    toggleDarkMode()
  }

  const handleThemeChange = async (newTheme: Theme) => {
    // Optimistically update UI
    setTheme(newTheme)
  }

  const handleSave = async () => {
    try {
      if (!settings?.id) {
        // Create new settings
        const res = await fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dark_mode: darkMode, theme }),
        })
        
        if (res.ok) {
          const saved = await res.json()
          setItem(saved)
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('settings-updated'))
          }
          alert('Settings saved successfully!')
        }
      } else {
        // Update existing settings
        const res = await fetch(`/api/settings/${settings.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dark_mode: darkMode, theme }),
        })

        if (res.ok) {
          const saved = await res.json()
          setItem(saved)
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('settings-updated'))
          }
          alert('Settings saved successfully!')
        }
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Failed to save. Please try again.')
    }
  }

  if (loading) {
    return <div className="text-center py-12 text-gray-600">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Theme & Appearance Settings</h2>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="space-y-8">
            {/* Dark Mode Toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${darkMode ? 'bg-indigo-100 dark:bg-indigo-900/50' : 'bg-amber-100 dark:bg-amber-900/50'}`}>
                  {darkMode ? (
                    <Moon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  ) : (
                    <Sun className="w-6 h-6 text-amber-600" />
                  )}
                </div>
                <div>
                  <label className="block text-base font-semibold text-gray-900 dark:text-gray-100">
                    Dark Mode
                  </label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Toggle between light and dark appearance
                  </p>
                </div>
              </div>
              <button
                onClick={handleDarkModeToggle}
                className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${
                  darkMode ? 'bg-indigo-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${
                    darkMode ? 'translate-x-8' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Theme Selection */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Palette className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                <label className="text-base font-semibold text-gray-900 dark:text-gray-100">
                  Design Theme
                </label>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {themeOptions.map((themeOption) => {
                  const colors = themeColors[themeOption.value][darkMode ? 'dark' : 'light']
                  const desc = themeDescriptions[themeOption.value]
                  const isSelected = theme === themeOption.value

                  return (
                    <button
                      key={themeOption.value}
                      onClick={() => handleThemeChange(themeOption.value)}
                      className={`relative p-5 rounded-xl border-2 transition-all text-left group ${
                        isSelected
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-lg'
                          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-md'
                      }`}
                    >
                      {/* Selected indicator */}
                      {isSelected && (
                        <div className="absolute top-3 right-3 w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}

                      {/* Theme header */}
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`p-2 rounded-lg ${isSelected ? 'bg-primary-100 dark:bg-primary-900/50' : 'bg-gray-100 dark:bg-gray-700'}`}>
                          {themeIcons[themeOption.value]}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-gray-100">
                            {themeOption.label}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {themeOption.description}
                          </div>
                        </div>
                      </div>

                      {/* Color preview */}
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs text-gray-500 dark:text-gray-400">Colors:</span>
                        <div className="flex -space-x-1">
                          {colors.map((color, i) => (
                            <div
                              key={i}
                              className="w-5 h-5 rounded-full border-2 border-white dark:border-gray-800"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                        {desc.tagline}
                      </p>

                      {/* Features */}
                      <div className="flex flex-wrap gap-1.5">
                        {desc.features.map((feature, i) => (
                          <span
                            key={i}
                            className={`px-2 py-0.5 text-xs rounded-full ${
                              isSelected
                                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300'
                                : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                            }`}
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </button>
                  )
                })}
              </div>
              
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                💡 Theme changes apply immediately. Click &quot;Save Settings&quot; to persist your choice to the database.
              </p>
            </div>

            {/* Save button */}
            <div className="flex gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 font-medium shadow-lg hover:shadow-xl transition-all"
              >
                <Save className="w-5 h-5" />
                Save Settings
              </button>
              
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-xl text-sm text-gray-600 dark:text-gray-400">
                <span>Current:</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">{themeOptions.find(t => t.value === theme)?.label}</span>
                <span>·</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">{darkMode ? 'Dark' : 'Light'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {item && !showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Current Settings
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">
                Dark Mode: {darkMode ? 'Enabled' : 'Disabled'} | Theme: {theme}
              </p>
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
