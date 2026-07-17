import type { Metadata } from 'next'
import './globals.css'
import { siteConfig, SITE_URL } from '@/lib/site'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { ThemeProvider } from '@/components/ThemeProvider'
import ThemeBackground from '@/components/ThemeBackground'
import ThemePreview from '@/components/ThemePreview'
import ScrollProgress from '@/components/motion/ScrollProgress'
import BackToTop from '@/components/motion/BackToTop'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [...siteConfig.keywords],
  authors: [{ name: siteConfig.name, url: SITE_URL }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  applicationName: siteConfig.name,
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: siteConfig.locale,
    url: SITE_URL,
    siteName: siteConfig.name,
    title: siteConfig.title,
    description: siteConfig.description,
    // Resolved against metadataBase; matched by app/opengraph-image.tsx.
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.title,
    description: siteConfig.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  icons: {
    icon: [{ url: '/icon.png', type: 'image/png' }],
    shortcut: [{ url: '/icon.png', type: 'image/png' }],
    apple: [{ url: '/icon.png' }],
  },
  category: 'technology',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
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
