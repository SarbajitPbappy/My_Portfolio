import { Inter, DM_Sans, JetBrains_Mono, Newsreader, IBM_Plex_Sans, IBM_Plex_Mono } from 'next/font/google'

// Self-hosted by next/font: no render-blocking request to Google Fonts, and the
// browser only downloads the faces the active theme actually uses.
// globals.css refers to these through the --nf-* variables.
export const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--nf-inter' })
export const dmSans = DM_Sans({ subsets: ['latin'], display: 'swap', variable: '--nf-dm-sans' })
export const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], display: 'swap', variable: '--nf-jetbrains' })
// Academic (default) theme: a journal-style display serif, a technical sans
// for reading, and a mono for figure labels, DOIs and dates.
export const newsreader = Newsreader({
  subsets: ['latin'],
  display: 'swap',
  variable: '--nf-newsreader',
  axes: ['opsz'],
  style: ['normal', 'italic'],
})
export const plexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--nf-plex-sans',
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
})
export const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--nf-plex-mono',
  weight: ['400', '500'],
})

export const fontVariables = [inter, dmSans, jetbrainsMono, newsreader, plexSans, plexMono]
  .map((f) => f.variable)
  .join(' ')
