import type { Variants, Transition } from 'framer-motion'

// Shared motion presets so animation feels like one coherent system across the site.
// Motion is motivated: entrance = storytelling/hierarchy, hover = feedback.

// Custom easing (smooth "expo-out" feel) used for reveals.
export const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1]

export const spring: Transition = { type: 'spring', stiffness: 260, damping: 24 }
export const springSoft: Transition = { type: 'spring', stiffness: 120, damping: 18 }
export const springSnappy: Transition = { type: 'spring', stiffness: 320, damping: 22 }

// Reveal a single element from below.
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE_OUT } },
}

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6, ease: EASE_OUT } },
}

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.45, ease: EASE_OUT } },
}

// Parent that reveals its children in sequence (storytelling).
export const staggerContainer = (staggerChildren = 0.08, delayChildren = 0): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren, delayChildren } },
})

// Child used inside a staggerContainer.
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_OUT } },
}

// Shared viewport config so reveals trigger consistently and only once.
export const viewportOnce = { once: true, margin: '-80px' } as const

// Standard card hover: a subtle spring lift (feedback).
export const hoverLift = {
  whileHover: { y: -6, transition: springSnappy },
  whileTap: { scale: 0.98 },
}
