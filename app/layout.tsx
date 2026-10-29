import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'
import { siteConfig, SITE_URL } from '@/lib/site'
import { getSettings } from '@/lib/db'
import { isTheme } from '@/lib/types'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { ThemeProvider } from '@/components/ThemeProvider'
import ThemeBackground from '@/components/ThemeBackground'
import ThemePreview from '@/components/ThemePreview'
import ScrollProgress from '@/components/motion/ScrollProgress'
import BackToTop from '@/components/motion/BackToTop'
import AnalyticsTracker from '@/components/AnalyticsTracker'
import GoogleAnalytics from '@/components/GoogleAnalytics'

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

// The saved appearance, so the server renders the admin's theme from the first
// byte (no flash of the default theme, no late layout swap for Multiverse).
async function getAppearance() {
  try {
    const settings = await getSettings()
    return { theme: isTheme(settings?.theme) ? settings.theme : 'modern', dark: Boolean(settings?.dark_mode) } as const
  } catch {
    return { theme: 'modern', dark: false } as const
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { theme, dark } = await getAppearance()
  return (
    <html
      lang="en"
      data-theme={theme}
      className={`${GeistSans.variable} ${GeistMono.variable}${dark ? ' dark' : ''}`}
      suppressHydrationWarning
    >
      <body>
        <ThemeProvider initialTheme={theme} initialDark={dark}>
          <ThemeBackground />
          <ScrollProgress />
          <Navbar />
          <main>{children}</main>
          <Footer />
          <BackToTop />
          <ThemePreview />
          <AnalyticsTracker />
          <GoogleAnalytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
