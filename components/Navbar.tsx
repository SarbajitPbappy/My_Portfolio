'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import Link from 'next/link'
import ThemePreview from '@/components/ThemePreview'

// Static navbar configuration. Order matches the section order in app/page.tsx.
const navbarConfig = {
  name: 'Sarbajit Paul Bappy',
  nav_items: [
    { name: 'Research', href: '#research' },
    { name: 'About', href: '#about' },
    { name: 'Experience', href: '#experience' },
    { name: 'Education', href: '#education' },
    { name: 'Projects', href: '#projects' },
    { name: 'Skills', href: '#skills' },
    { name: 'Contact', href: '#contact' },
  ],
}

const SECTION_IDS = ['home', ...navbarConfig.nav_items.map((i) => i.href.slice(1))]

/**
 * The section that crosses a line 35% down the viewport is the active one.
 * Measured from live bounding boxes on every check, so it stays right when a
 * theme swaps a section for its 3D variant (different heights and padding).
 */
function currentSection(): string {
  const line = window.innerHeight * 0.35
  let active = 'home'
  for (const id of SECTION_IDS) {
    const el = document.getElementById(id)
    if (!el) continue
    const { top, bottom } = el.getBoundingClientRect()
    if (top <= line && bottom > line) return id
    if (top <= line) active = id
  }
  return active
}

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('home')
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const firstLinkRef = useRef<HTMLAnchorElement>(null)

  const navItems = navbarConfig.nav_items

  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      setIsScrolled(window.scrollY > 20)
      setActiveSection(currentSection())
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    // Sections can mount late (theme variants, dynamic imports); re-check once.
    const settle = window.setTimeout(update, 800)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      window.clearTimeout(settle)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  const closeMenu = useCallback((returnFocus = false) => {
    setIsMobileMenuOpen(false)
    if (returnFocus) menuButtonRef.current?.focus()
  }, [])

  // Mobile menu: Escape closes it and returns focus; opening focuses the first link.
  useEffect(() => {
    if (!isMobileMenuOpen) return
    firstLinkRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMenu(true)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isMobileMenuOpen, closeMenu])

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('#')) {
      e.preventDefault()
      const element = document.getElementById(href.substring(1))
      if (element) {
        const offset = 72 // navbar height + breathing room
        const top = element.getBoundingClientRect().top + window.scrollY - offset
        window.scrollTo({ top, behavior: 'smooth' })
      }
    }
    setIsMobileMenuOpen(false)
  }

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-theme-surface/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-16">
          <Link
            href="#home"
            onClick={(e) => handleLinkClick(e, '#home')}
            className="flex items-center h-full text-xl sm:text-2xl font-bold gradient-text leading-none whitespace-nowrap"
          >
            {navbarConfig.name}
          </Link>

          {/* Desktop menu: from 1024px; below that the hamburger takes over so nothing wraps. */}
          <div className="nav-links hidden lg:flex items-center gap-6 xl:gap-8">
            {navItems.map((item) => {
              const sectionId = item.href.substring(1)
              const active = activeSection === sectionId
              return (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={(e) => handleLinkClick(e, item.href)}
                  aria-current={active ? 'true' : undefined}
                  className={`transition-colors font-medium relative whitespace-nowrap ${
                    active ? 'text-theme-primary' : 'text-theme-text-muted hover:text-theme-primary'
                  }`}
                >
                  {item.name}
                  {active && (
                    <motion.div
                      layoutId="activeSection"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-theme-primary"
                      initial={false}
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </a>
              )
            })}
            <ThemePreview inNav />
          </div>

          {/* Mobile: palette + menu button */}
          <div className="flex lg:hidden items-center gap-2">
            <ThemePreview inNav />
            <button
              ref={menuButtonRef}
              className="p-2 text-theme-text-muted"
              onClick={() => setIsMobileMenuOpen((v) => !v)}
              aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-theme-surface border-t border-theme-border"
          >
            <div className="px-4 py-4 space-y-4">
              {navItems.map((item, i) => {
                const active = activeSection === item.href.substring(1)
                return (
                  <a
                    key={item.name}
                    ref={i === 0 ? firstLinkRef : undefined}
                    href={item.href}
                    onClick={(e) => handleLinkClick(e, item.href)}
                    aria-current={active ? 'true' : undefined}
                    className={`block transition-colors font-medium ${
                      active ? 'text-theme-primary' : 'text-theme-text-muted hover:text-theme-primary'
                    }`}
                  >
                    {item.name}
                  </a>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
