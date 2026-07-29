'use client'

import { useState } from 'react'
import { LogOut, GraduationCap, FileText, Briefcase, FolderKanban, Brain, BookOpen, Home, User, Mail, Code, Settings, BarChart3 } from 'lucide-react'
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

interface AdminDashboardProps {
  onLogout: () => void
}

type TabType = 'analytics' | 'hero' | 'about' | 'education' | 'publications' | 'work' | 'projects' | 'research' | 'courses' | 'skills' | 'contact' | 'footer' | 'settings'

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('hero')

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    onLogout()
  }

  const tabs = [
    { id: 'analytics' as TabType, label: 'Analytics', icon: BarChart3 },
    { id: 'hero' as TabType, label: 'Hero', icon: Home },
    { id: 'about' as TabType, label: 'About', icon: User },
    { id: 'education' as TabType, label: 'Education', icon: GraduationCap },
    { id: 'publications' as TabType, label: 'Publications', icon: FileText },
    { id: 'work' as TabType, label: 'Work Experience', icon: Briefcase },
    { id: 'projects' as TabType, label: 'Projects', icon: FolderKanban },
    { id: 'research' as TabType, label: 'Research Areas', icon: Brain },
    { id: 'courses' as TabType, label: 'Courses', icon: BookOpen },
    { id: 'skills' as TabType, label: 'Skills', icon: Code },
    { id: 'contact' as TabType, label: 'Contact', icon: Mail },
    { id: 'footer' as TabType, label: 'Footer', icon: FileText },
    { id: 'settings' as TabType, label: 'Settings', icon: Settings },
  ]

  return (
    // The managers all carry `dark:` variants; without matching ones here the
    // shell stayed light behind dark cards and headings became unreadable.
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
                Admin Panel
              </h1>
              <Link
                href="/"
                className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                <Home className="w-4 h-4" />
                <span className="text-sm">View Site</span>
              </Link>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'analytics' && <AnalyticsManager />}
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
      </main>
    </div>
  )
}

