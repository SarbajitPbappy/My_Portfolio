import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const inter = Inter({ subsets: ['latin'] })

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
    <html lang="en">
      <head>
        <link rel="shortcut icon" href="/icon.png" type="image/x-icon" />
      </head>
      <body className={inter.className}>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}

