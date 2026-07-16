import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { ThemeProvider } from '@/components/ThemeProvider'
import ThemeBackground from '@/components/ThemeBackground'
import ThemePreview from '@/components/ThemePreview'
import ScrollProgress from '@/components/motion/ScrollProgress'
import BackToTop from '@/components/motion/BackToTop'

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
          <ThemeBackground />
          <ScrollProgress />
          <Navbar />
          <main>{children}</main>
          <Footer />
          <BackToTop />
          <ThemePreview />
        </ThemeProvider>
      </body>
    </html>
  )
}
