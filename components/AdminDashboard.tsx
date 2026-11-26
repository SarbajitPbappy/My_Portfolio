'use client'

import { useState } from 'react'
import { LogOut, GraduationCap, FileText, Briefcase, FolderKanban, Brain, BookOpen, Home, User, Mail, Code, Settings, BarChart3, LayoutTemplate, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import EducationManager from './admin/EducationManager'
import PublicationsManager from './admin/PublicationsManager'
import WorkExperienceManager from './admin/WorkExperienceManager'
import ProjectsManager from './admin/ProjectsManager'
import ResearchAreasManager from './admin/ResearchAreasManager'
import CoursesManager from './admin/CoursesManager'
import HeroManager from './admin/HeroManager'
import AboutManager from './admin/AboutManager'
import ContactManager from './admin/ContactManager'
import FooterManager from './admin/FooterManager'
import SkillsManager from './admin/SkillsManager'
import SettingsManager from './admin/SettingsManager'
import AnalyticsManager from './admin/AnalyticsManager'
import SiteContentManager from './admin/SiteContentManager'

interface AdminDashboardProps {
  onLogout: () => void
}

type TabType = 'analytics' | 'homepage' | 'hero' | 'about' | 'education' | 'publications' | 'work' | 'projects' | 'research' | 'courses' | 'skills' | 'contact' | 'footer' | 'settings'

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('homepage')

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    onLogout()
  }

  const groups: { title: string; tabs: { id: TabType; label: string; icon: typeof Home }[] }[] = [
    { title: 'Overview', tabs: [{ id: 'analytics', label: 'Analytics', icon: BarChart3 }] },
    {
      title: 'Homepage',
      tabs: [
        { id: 'homepage', label: 'Homepage text', icon: LayoutTemplate },
        { id: 'hero', label: 'Name, links & CV', icon: Home },
        { id: 'about', label: 'About', icon: User },
      ],
    },
    {
      title: 'Research',
      tabs: [
        { id: 'publications', label: 'Publications', icon: FileText },
        { id: 'research', label: 'Research areas', icon: Brain },
      ],
    },
    {
      title: 'Career',
      tabs: [
        { id: 'work', label: 'Experience', icon: Briefcase },
        { id: 'education', label: 'Education', icon: GraduationCap },
        { id: 'courses', label: 'Courses', icon: BookOpen },
        { id: 'projects', label: 'Projects', icon: FolderKanban },
        { id: 'skills', label: 'Skills', icon: Code },
      ],
    },
    {
      title: 'Site',
      tabs: [
        { id: 'contact', label: 'Contact', icon: Mail },
        { id: 'footer', label: 'Footer', icon: FileText },
        { id: 'settings', label: 'Appearance', icon: Settings },
      ],
    },
  ]

  return (
    // The managers all carry `dark:` variants; without matching ones here the
    // shell stayed light behind dark cards and headings became unreadable.
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-3 h-14 sm:h-16">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-gray-100 truncate">Admin Panel</h1>
              <Link
                href="/"
                target="_blank"
                className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors shrink-0"
              >
                <ExternalLink className="w-4 h-4" />
                <span className="text-sm">View site</span>
              </Link>
            </div>
            <button
              onClick={handleLogout}
              aria-label="Log out"
              className="flex items-center gap-2 px-3 sm:px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors shrink-0"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Log out</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:grid lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-8">
        {/* Phones and tablets: one grouped dropdown */}
        <div className="lg:hidden mb-4">
          <label htmlFor="admin-section" className="sr-only">Section</label>
          <select
            id="admin-section"
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value as TabType)}
            className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg text-sm font-medium"
          >
            {groups.map((g) => (
              <optgroup key={g.title} label={g.title}>
                {g.tabs.map((t) => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {/* Desktop: grouped sidebar */}
        <nav aria-label="Admin sections" className="hidden lg:block">
          <div className="sticky top-24 space-y-5">
            {groups.map((g) => (
              <div key={g.title}>
                <p className="px-3 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">{g.title}</p>
                <ul className="space-y-0.5">
                  {g.tabs.map((t) => {
                    const Icon = t.icon
                    const active = activeTab === t.id
                    return (
                      <li key={t.id}>
                        <button
                          onClick={() => setActiveTab(t.id)}
                          aria-current={active ? 'page' : undefined}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                            active
                              ? 'bg-primary-50 text-primary-700 font-medium dark:bg-primary-900/30 dark:text-primary-300'
                              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100'
                          }`}
                        >
                          <Icon className="w-4 h-4 shrink-0" />
                          {t.label}
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </div>
        </nav>

        <div className="min-w-0">
      {/* Content */}
      <div>
        {activeTab === 'analytics' && <AnalyticsManager />}
        {activeTab === 'homepage' && <SiteContentManager />}
        {activeTab === 'hero' && <HeroManager />}
        {activeTab === 'about' && <AboutManager />}
        {activeTab === 'education' && <EducationManager />}
        {activeTab === 'publications' && <PublicationsManager />}
        {activeTab === 'work' && <WorkExperienceManager />}
        {activeTab === 'projects' && <ProjectsManager />}
        {activeTab === 'research' && <ResearchAreasManager />}
        {activeTab === 'courses' && <CoursesManager />}
        {activeTab === 'skills' && <SkillsManager />}
        {activeTab === 'contact' && <ContactManager />}
        {activeTab === 'footer' && <FooterManager />}
        {activeTab === 'settings' && <SettingsManager />}
      </div>
        </div>
      </div>
    </div>
  )
}

