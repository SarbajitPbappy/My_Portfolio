'use client'

import { motion, useScroll, useSpring } from 'framer-motion'

// Thin reading-progress bar pinned to the top of the page.
// Motivated: orientation/feedback — shows how far through the page you are.
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  })

  return (
    <motion.div
      style={{ scaleX }}
      aria-hidden
      className="fixed top-0 left-0 right-0 h-1 z-[70] origin-left"
    >
      <div
        className="h-full w-full"
        style={{
          background:
            'linear-gradient(90deg, rgb(var(--color-primary)), rgb(var(--color-accent)), rgb(var(--color-primary-hover)))',
        }}
      />
    </motion.div>
  )
}
