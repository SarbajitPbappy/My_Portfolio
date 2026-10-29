'use client'

import { useEffect } from 'react'
import { useReducedMotion } from 'framer-motion'

// Every 3D surface of the Multiverse theme, and how far the mouse may tilt it (deg).
const SURFACES: [string, number][] = [
  ['.mv-portrait', 10],
  ['.mv-cta', 3],
  ['.mv-stats', 3],
  ['.mv-head', 4],
  ['.mv-value', 7],
  ['.mv-card', 6],
]
const SELECTOR = SURFACES.map(([s]) => s).join(', ')

const SCROLL_TILT = 16 // deg at one half-viewport from the centre
const SIDE_TURN = 9 // deg for a surface at the side of the viewport
const HOVER_LIFT = 26 // px toward the viewer

type State = { rx: number; ry: number; tz: number; max: number }

/**
 * Drives the 3D of every Multiverse surface, all the time:
 * - scroll: the page reads as the inside of a curved screen. Surfaces turn to
 *   face the viewer as they rise into view and lean away as they leave, and
 *   side columns angle in toward the centre. The reading zone stays flat.
 * - mouse: the surface under the cursor tilts toward it and lifts.
 * Writes --rx/--ry (deg), --tz (px), --ex/--ey (unitless: which way the slab's
 * thickness shows) and --mx/--my (spotlight position).
 */
export default function DepthField() {
  const reduce = useReducedMotion()

  useEffect(() => {
    let els: HTMLElement[] = []
    const state = new WeakMap<HTMLElement, State>()
    const pointer = { x: -1, y: -1, inside: false }
    let raf = 0
    let dirty = true

    // top-level surfaces only; nested ones inherit their parent's motion
    const collect = () => {
      els = [...document.querySelectorAll<HTMLElement>(SELECTOR)].filter((el) => !el.parentElement?.closest(SELECTOR))
      for (const el of els) {
        if (!state.has(el)) state.set(el, { rx: 0, ry: 0, tz: 0, max: Number(el.dataset.tilt) || SURFACES.find(([s]) => el.matches(s))?.[1] || 6 })
      }
      dirty = true
    }

    const tick = () => {
      raf = requestAnimationFrame(tick)
      if (!dirty) return
      const vw = window.innerWidth
      const vh = window.innerHeight
      const ease = reduce ? 1 : 0.16
      let moving = false

      // read every rect first, then write, so the browser lays out once
      const rects = els.map((el) => el.getBoundingClientRect())
      els.forEach((el, i) => {
        const r = rects[i]
        if (r.bottom < -vh * 0.5 || r.top > vh * 1.5) return
        const s = state.get(el)!

        // distance from the viewport's centre line to the nearest edge (0 while it spans the centre)
        const mid = vh / 2
        const d = r.top > mid ? r.top - mid : r.bottom < mid ? r.bottom - mid : 0
        const ny = Math.max(-1.4, Math.min(1.4, d / (vh * 0.5)))
        const nx = Math.max(-1, Math.min(1, (r.left + r.width / 2 - vw / 2) / (vw / 2)))
        let rx = reduce ? 0 : ny * SCROLL_TILT
        let ry = reduce ? 0 : nx * SIDE_TURN * (r.width < vw * 0.6 ? 1 : 0.3)
        let tz = 0

        const over = pointer.inside && pointer.x >= r.left && pointer.x <= r.right && pointer.y >= r.top && pointer.y <= r.bottom
        if (over && !reduce) {
          const px = (pointer.x - r.left) / r.width
          const py = (pointer.y - r.top) / r.height
          rx += (0.5 - py) * s.max
          ry += (px - 0.5) * s.max
          tz = HOVER_LIFT
          el.style.setProperty('--mx', `${px * 100}%`)
          el.style.setProperty('--my', `${py * 100}%`)
        }

        s.rx += (rx - s.rx) * ease
        s.ry += (ry - s.ry) * ease
        s.tz += (tz - s.tz) * ease
        if (Math.abs(rx - s.rx) + Math.abs(ry - s.ry) + Math.abs(tz - s.tz) > 0.05) moving = true

        el.style.setProperty('--rx', `${s.rx.toFixed(2)}deg`)
        el.style.setProperty('--ry', `${s.ry.toFixed(2)}deg`)
        el.style.setProperty('--tz', `${s.tz.toFixed(1)}px`)
        // the slab's side that faces the viewer shows its thickness
        el.style.setProperty('--ex', (s.ry * 0.7).toFixed(2))
        el.style.setProperty('--ey', Math.max(-9, Math.min(16, 6 + s.rx * 0.55)).toFixed(2))
      })
      dirty = moving
    }

    const wake = () => {
      dirty = true
    }
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      pointer.x = e.clientX
      pointer.y = e.clientY
      pointer.inside = true
      dirty = true
    }
    const onLeave = () => {
      pointer.inside = false
      dirty = true
    }

    // sections mount lazily, so pick up surfaces as they appear
    let pending = false
    const mo = new MutationObserver(() => {
      if (pending) return
      pending = true
      requestAnimationFrame(() => {
        pending = false
        collect()
      })
    })
    mo.observe(document.body, { childList: true, subtree: true })

    collect()
    raf = requestAnimationFrame(tick)
    window.addEventListener('scroll', wake, { passive: true })
    window.addEventListener('resize', wake)
    document.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerleave', onLeave)

    return () => {
      cancelAnimationFrame(raf)
      mo.disconnect()
      window.removeEventListener('scroll', wake)
      window.removeEventListener('resize', wake)
      document.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerleave', onLeave)
      for (const el of els) ['--rx', '--ry', '--tz', '--ex', '--ey'].forEach((p) => el.style.removeProperty(p))
    }
  }, [reduce])

  return null
}
