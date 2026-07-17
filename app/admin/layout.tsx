import type { Metadata } from 'next'

// Admin area — never index, on top of the robots.txt disallow.
export const metadata: Metadata = {
  title: 'Admin',
  robots: { index: false, follow: false },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
