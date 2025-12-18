'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminLogin from '@/components/AdminLogin'
import AdminDashboard from '@/components/AdminDashboard'

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/admin/verify')
      const data = await res.json()
      setAuthenticated(data.authenticated)
    } catch (error) {
      setAuthenticated(false)
    }
  }

  const handleLogin = () => {
    setAuthenticated(true)
  }

  const handleLogout = () => {
    setAuthenticated(false)
  }

  if (authenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  if (!authenticated) {
    return <AdminLogin onLogin={handleLogin} />
  }

  return <AdminDashboard onLogout={handleLogout} />
}

