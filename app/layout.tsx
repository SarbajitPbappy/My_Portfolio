import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { ThemeProvider } from '@/components/ThemeProvider'
import ThemeSwitcher from '@/components/ThemeSwitcher'

export const metadata: Metadata = {
  title: 'Sarbajit Paul Bappy | AI/ML Researcher',
  description: 'AI/ML Researcher specializing in Federated Learning and Medical Image Classification',
  keywords: ['AI', 'Machine Learning', 'Federated Learning', 'Medical Image Classification', 'Research'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="shortcut icon" href="/icon.png" type="image/x-icon" />
      </head>
      <body>
        <ThemeProvider>
          <Navbar />
          <main>{children}</main>
          <Footer />
          <ThemeSwitcher />
        </ThemeProvider>
      </body>
    </html>
  )
}
