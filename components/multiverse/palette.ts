/**
 * The Multiverse theme's one idea: a prism splits a single beam into a
 * spectrum, and each homepage section owns one ray of it. The 3D stage
 * (Spectrum.tsx) and the section accents (kit.tsx) both read this list, so a
 * section's colour on the page always matches its ray in the scene.
 */
export const SECTIONS = [
  { id: 'home', label: 'Home', color: '#f4f4f5' },
  { id: 'about', label: 'About', color: '#a78bfa' },
  { id: 'education', label: 'Education', color: '#60a5fa' },
  { id: 'skills', label: 'Skills', color: '#22d3ee' },
  { id: 'experience', label: 'Experience', color: '#34d399' },
  { id: 'research', label: 'Research', color: '#facc15' },
  { id: 'projects', label: 'Projects', color: '#fb923c' },
  { id: 'contact', label: 'Contact', color: '#f87171' },
] as const

export const sectionColor = (id: string) => SECTIONS.find((s) => s.id === id)?.color ?? '#f4f4f5'

/** The seven rays, in section order (About first). */
export const RAYS = SECTIONS.slice(1)
