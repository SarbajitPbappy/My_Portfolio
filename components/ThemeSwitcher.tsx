'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Moon, Sun, Palette, Check, X } from 'lucide-react'
import { useTheme, themeOptions } from './ThemeProvider'
import type { Theme } from '@/lib/types'

// Theme preview colors for visual display
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

export default function ThemeSwitcher() {
  const { darkMode, theme, toggleDarkMode, setTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          className="p-3 rounded-full bg-white shadow-lg border border-gray-200"
          disabled
        >
          <Palette className="w-5 h-5 text-gray-700" />
        </button>
      </div>
    )
  }

  const currentColors = themeColors[theme][darkMode ? 'dark' : 'light']

  return (
    <div ref={panelRef} className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="absolute bottom-16 right-0 mb-2 w-72"
          >
            <div 
              className="rounded-2xl overflow-hidden"
              style={{
                backgroundColor: `rgb(var(--color-surface) / 0.95)`,
                backdropFilter: 'blur(20px)',
                border: '1px solid rgb(var(--color-border) / 0.5)',
                boxShadow: 'var(--shadow-xl)',
              }}
            >
              {/* Header */}
              <div 
                className="px-4 py-3 flex items-center justify-between"
                style={{ borderBottom: '1px solid rgb(var(--color-border) / 0.3)' }}
              >
                <span 
                  className="font-semibold text-sm"
                  style={{ color: 'rgb(var(--color-text))' }}
                >
                  Appearance
                </span>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <X className="w-4 h-4" style={{ color: 'rgb(var(--color-text-muted))' }} />
                </button>
              </div>

              {/* Dark Mode Toggle */}
              <div className="px-4 py-3" style={{ borderBottom: '1px solid rgb(var(--color-border) / 0.3)' }}>
                <div className="flex items-center justify-between">
                  <span 
                    className="text-sm font-medium"
                    style={{ color: 'rgb(var(--color-text))' }}
                  >
                    Dark Mode
                  </span>
                  <button
                    onClick={toggleDarkMode}
                    className="relative w-14 h-8 rounded-full transition-colors duration-300"
                    style={{
                      backgroundColor: darkMode 
                        ? 'rgb(var(--color-primary))' 
                        : 'rgb(var(--color-border))',
                    }}
                  >
                    <motion.div
                      className="absolute top-1 w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-md"
                      animate={{ x: darkMode ? 28 : 4 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    >
                      {darkMode ? (
                        <Moon className="w-3.5 h-3.5 text-indigo-600" />
                      ) : (
                        <Sun className="w-3.5 h-3.5 text-amber-500" />
                      )}
                    </motion.div>
                  </button>
                </div>
              </div>

              {/* Theme Selection */}
              <div className="px-4 py-3">
                <span 
                  className="text-xs font-medium uppercase tracking-wider block mb-3"
                  style={{ color: 'rgb(var(--color-text-muted))' }}
                >
                  Theme Style
                </span>
                <div className="space-y-2">
                  {themeOptions.map((option) => {
                    const colors = themeColors[option.value][darkMode ? 'dark' : 'light']
                    const isSelected = theme === option.value

                    return (
                      <motion.button
                        key={option.value}
                        onClick={() => setTheme(option.value)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
                          isSelected 
                            ? '' 
                            : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                        }`}
                        style={{
                          backgroundColor: isSelected 
                            ? `rgb(var(--color-primary) / 0.1)` 
                            : 'transparent',
                          boxShadow: isSelected ? `0 0 0 2px rgb(var(--color-primary))` : 'none',
                        }}
                      >
                        {/* Color preview */}
                        <div className="flex -space-x-1">
                          {colors.map((color, i) => (
                            <div
                              key={i}
                              className="w-5 h-5 rounded-full border-2 border-white dark:border-gray-800"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>

                        {/* Label */}
                        <div className="flex-1 text-left">
                          <div 
                            className="text-sm font-medium"
                            style={{ color: 'rgb(var(--color-text))' }}
                          >
                            {option.label}
                          </div>
                          <div 
                            className="text-xs"
                            style={{ color: 'rgb(var(--color-text-muted))' }}
                          >
                            {option.description}
                          </div>
                        </div>

                        {/* Check mark */}
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-5 h-5 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: 'rgb(var(--color-primary))' }}
                          >
                            <Check className="w-3 h-3 text-white" />
                          </motion.div>
                        )}
                      </motion.button>
                    )
                  })}
                </div>
              </div>

              {/* Current theme indicator */}
              <div 
                className="px-4 py-2 text-center"
                style={{ 
                  backgroundColor: 'rgb(var(--color-surface-elevated))',
                  borderTop: '1px solid rgb(var(--color-border) / 0.3)',
                }}
              >
                <span 
                  className="text-xs"
                  style={{ color: 'rgb(var(--color-text-muted))' }}
                >
                  Currently: <span className="font-medium">{themeOptions.find(t => t.value === theme)?.label}</span> · {darkMode ? 'Dark' : 'Light'}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="relative p-3 rounded-full shadow-lg transition-all duration-300"
        style={{
          backgroundColor: 'rgb(var(--color-surface))',
          border: '1px solid rgb(var(--color-border))',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        {/* Animated color ring */}
        <motion.div
          className="absolute inset-0 rounded-full opacity-50"
          style={{
            background: `conic-gradient(${currentColors[0]}, ${currentColors[1]}, ${currentColors[2]}, ${currentColors[0]})`,
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        />
        
        {/* Inner button */}
        <div 
          className="relative w-5 h-5 flex items-center justify-center rounded-full"
          style={{ backgroundColor: 'rgb(var(--color-surface))' }}
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X className="w-5 h-5" style={{ color: 'rgb(var(--color-text))' }} />
              </motion.div>
            ) : (
              <motion.div
                key="palette"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Palette className="w-5 h-5" style={{ color: 'rgb(var(--color-primary))' }} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.button>
    </div>
  )
}

