'use client'

import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'framer-motion'
import { useTheme } from './ThemeProvider'

/**
 * Full-page animated background that swaps by theme.
 * - "neural"   → interactive neural-network canvas: white + cyan nodes, the
 *                cursor pulls the web into a halo and draws synapses to it, and
 *                signal pulses fire along the connections (activation).
 * - "creative" → aurora + robotic HUD: reticles, scanline, tech grid, hex chips,
 *                animated circuit traces, and a mech silhouette with a pulsing visor.
 * Other themes render nothing, preserving their original look.
 */
export default function ThemeBackground() {
  const { theme } = useTheme()
  if (theme === 'neural') return <NeuralNetwork />
  if (theme === 'creative') return <CreativeScene />
  return null
}

function NeuralNetwork() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reduce = useReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let width = 0
    let height = 0
    let raf = 0

    type Node = { x: number; y: number; vx: number; vy: number; white: boolean; emerald: boolean }
    type Pulse = { a: number; b: number; t: number; sp: number; life: number }
    let nodes: Node[] = []
    let pulses: Pulse[] = []
    const mouse = { x: -9999, y: -9999, active: false }

    const NODE_COUNT = Math.min(95, Math.floor(window.innerWidth / 16)) // denser
    const LINK_DIST = 150 * dpr
    const MOUSE_DIST = 240 * dpr
    const REPEL_DIST = 90 * dpr
    const MAX_PULSES = 16

    const resize = () => {
      width = canvas.width = window.innerWidth * dpr
      height = canvas.height = window.innerHeight * dpr
      canvas.style.width = window.innerWidth + 'px'
      canvas.style.height = window.innerHeight + 'px'
    }

    const seed = () => {
      nodes = Array.from({ length: NODE_COUNT }, () => {
        const r = Math.random()
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.3 * dpr,
          vy: (Math.random() - 0.5) * 0.3 * dpr,
          white: r < 0.55, // more white
          emerald: r > 0.92,
        }
      })
      pulses = []
    }

    const neighbor = (i: number): number => {
      // pick a random node currently within link distance of node i
      const candidates: number[] = []
      for (let j = 0; j < nodes.length; j++) {
        if (j === i) continue
        const d = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y)
        if (d < LINK_DIST) candidates.push(j)
      }
      return candidates.length ? candidates[(Math.random() * candidates.length) | 0] : -1
    }

    const spawnPulse = () => {
      const a = (Math.random() * nodes.length) | 0
      const b = neighbor(a)
      if (b >= 0) pulses.push({ a, b, t: 0, sp: 0.012 + Math.random() * 0.02, life: 5 })
    }

    const nodeColor = (n: Node, a: number) =>
      n.white ? `rgba(255,255,255,${a})` : n.emerald ? `rgba(16,185,129,${a})` : `rgba(34,211,238,${a})`

    const render = () => {
      ctx.clearRect(0, 0, width, height)

      // ambient synapses
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x
          const dy = nodes[i].y - nodes[j].y
          const dist = Math.hypot(dx, dy)
          if (dist < LINK_DIST) {
            const a = (1 - dist / LINK_DIST) * 0.4
            const bothWhite = nodes[i].white && nodes[j].white
            ctx.strokeStyle = bothWhite ? `rgba(255,255,255,${a})` : `rgba(34,211,238,${a})`
            ctx.lineWidth = dpr
            ctx.beginPath()
            ctx.moveTo(nodes[i].x, nodes[i].y)
            ctx.lineTo(nodes[j].x, nodes[j].y)
            ctx.stroke()
          }
        }
      }

      // signal pulses travelling along connections (activation)
      if (!reduce) {
        if (pulses.length < MAX_PULSES && Math.random() < 0.3) spawnPulse()
        pulses = pulses.filter((p) => p.life > 0 && p.a < nodes.length && p.b < nodes.length)
        for (const p of pulses) {
          const na = nodes[p.a]
          const nb = nodes[p.b]
          const px = na.x + (nb.x - na.x) * p.t
          const py = na.y + (nb.y - na.y) * p.t
          const g = ctx.createRadialGradient(px, py, 0, px, py, 7 * dpr)
          g.addColorStop(0, 'rgba(255,255,255,0.95)')
          g.addColorStop(0.5, 'rgba(34,211,238,0.6)')
          g.addColorStop(1, 'rgba(34,211,238,0)')
          ctx.fillStyle = g
          ctx.beginPath()
          ctx.arc(px, py, 7 * dpr, 0, Math.PI * 2)
          ctx.fill()
          p.t += p.sp
          if (p.t >= 1) {
            // chain the activation onward from b (with decay)
            const next = neighbor(p.b)
            if (next >= 0 && p.life > 1 && Math.random() < 0.7) {
              p.a = p.b
              p.b = next
              p.t = 0
              p.life -= 1
            } else {
              p.life = 0
            }
          }
        }
      }

      // mouse interaction: white synapses to cursor + halo pull + close repel
      if (mouse.active) {
        for (const n of nodes) {
          const dx = n.x - mouse.x
          const dy = n.y - mouse.y
          const dist = Math.hypot(dx, dy) || 0.01
          if (dist < MOUSE_DIST) {
            const a = (1 - dist / MOUSE_DIST) * 0.9
            ctx.strokeStyle = `rgba(255,255,255,${a})`
            ctx.lineWidth = 1.2 * dpr
            ctx.beginPath()
            ctx.moveTo(n.x, n.y)
            ctx.lineTo(mouse.x, mouse.y)
            ctx.stroke()
            if (!reduce) {
              if (dist < REPEL_DIST) {
                const push = ((REPEL_DIST - dist) / REPEL_DIST) * 2.2 * dpr
                n.x += (dx / dist) * push
                n.y += (dy / dist) * push
              } else {
                // pull toward the cursor → forms a living halo
                n.x -= dx * 0.02
                n.y -= dy * 0.02
              }
            }
          }
        }
        const grd = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 30 * dpr)
        grd.addColorStop(0, 'rgba(255,255,255,0.95)')
        grd.addColorStop(0.4, 'rgba(34,211,238,0.55)')
        grd.addColorStop(1, 'rgba(34,211,238,0)')
        ctx.fillStyle = grd
        ctx.beginPath()
        ctx.arc(mouse.x, mouse.y, 30 * dpr, 0, Math.PI * 2)
        ctx.fill()
      }

      // nodes
      for (const n of nodes) {
        ctx.fillStyle = nodeColor(n, 0.9)
        ctx.beginPath()
        ctx.arc(n.x, n.y, (n.white ? 1.9 : 1.7) * dpr, 0, Math.PI * 2)
        ctx.fill()
        if (!reduce) {
          n.x += n.vx
          n.y += n.vy
          if (n.x < 0 || n.x > width) n.vx *= -1
          if (n.y < 0 || n.y > height) n.vy *= -1
          n.x = Math.max(0, Math.min(width, n.x))
          n.y = Math.max(0, Math.min(height, n.y))
        }
      }

      if (!reduce) raf = requestAnimationFrame(render)
    }

    const onResize = () => {
      resize()
      seed()
    }
    const onMove = (e: MouseEvent) => {
      mouse.x = e.clientX * dpr
      mouse.y = e.clientY * dpr
      mouse.active = true
    }
    const onLeave = () => {
      mouse.active = false
    }

    resize()
    seed()
    render()
    window.addEventListener('resize', onResize)
    window.addEventListener('mousemove', onMove)
    document.addEventListener('mouseleave', onLeave)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseleave', onLeave)
    }
  }, [reduce])

  return <canvas ref={canvasRef} aria-hidden className="fixed inset-0 -z-10 pointer-events-none" />
}

function CreativeScene() {
  return (
    <div aria-hidden className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* aurora */}
      <div className="aurora-blob aurora-1" />
      <div className="aurora-blob aurora-2" />
      <div className="aurora-blob aurora-3" />

      {/* robotic tech grid */}
      <div className="creative-grid" />

      {/* animated circuit traces */}
      <svg className="creative-circuit" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" fill="none">
        <g stroke="currentColor" strokeWidth="1.5">
          <path className="trace" d="M-20 120 H220 V300 H460 V200 H760 V360 H1220" />
          <path className="trace" d="M1220 660 H960 V520 H700 V620 H420 V460 H-20" />
          <path className="trace" d="M-20 420 H160 V540 H360" />
          <path className="trace" d="M1220 200 H1040 V90 H820" />
        </g>
        <g fill="currentColor">
          <circle cx="220" cy="120" r="4" /><circle cx="460" cy="300" r="4" /><circle cx="760" cy="200" r="4" />
          <circle cx="960" cy="660" r="4" /><circle cx="700" cy="520" r="4" /><circle cx="420" cy="620" r="4" />
          <circle cx="160" cy="420" r="4" /><circle cx="1040" cy="200" r="4" />
        </g>
      </svg>

      {/* scanline sweep */}
      <div className="creative-scan" />

      {/* rotating HUD targeting reticle */}
      <svg className="creative-hud" viewBox="0 0 200 200" fill="none">
        <circle cx="100" cy="100" r="94" stroke="currentColor" strokeWidth="0.6" strokeDasharray="4 6" />
        <circle cx="100" cy="100" r="70" stroke="currentColor" strokeWidth="0.6" opacity="0.7" />
        <circle cx="100" cy="100" r="46" stroke="currentColor" strokeWidth="0.6" strokeDasharray="2 4" opacity="0.6" />
        <path d="M100 6 V26 M100 174 V194 M6 100 H26 M174 100 H194" stroke="currentColor" strokeWidth="0.8" />
        <path d="M100 60 L110 80 H90 Z" fill="currentColor" opacity="0.7" />
        <circle cx="100" cy="100" r="3" fill="currentColor" />
        <path d="M22 40 h14 M22 40 v14 M178 40 h-14 M178 40 v14 M22 160 h14 M22 160 v-14 M178 160 h-14 M178 160 v-14"
              stroke="currentColor" strokeWidth="0.8" opacity="0.8" />
      </svg>

      {/* counter-rotating micro reticle */}
      <svg className="creative-hud-2" viewBox="0 0 120 120" fill="none">
        <circle cx="60" cy="60" r="56" stroke="currentColor" strokeWidth="0.7" strokeDasharray="10 8" />
        <circle cx="60" cy="60" r="34" stroke="currentColor" strokeWidth="0.7" opacity="0.6" />
        <path d="M60 4 v16 M60 116 v-16 M4 60 h16 M116 60 h-16" stroke="currentColor" strokeWidth="0.8" />
      </svg>

      {/* mech / robot silhouette with pulsing visor */}
      <svg className="creative-mech" viewBox="0 0 200 230" fill="none">
        <path d="M52 44 h96 a16 16 0 0 1 16 16 v66 a34 34 0 0 1 -34 34 h-60 a34 34 0 0 1 -34 -34 v-66 a16 16 0 0 1 16 -16 z"
              stroke="currentColor" strokeWidth="2" />
        <path d="M100 44 v-24" stroke="currentColor" strokeWidth="2" />
        <circle cx="100" cy="14" r="4" fill="currentColor" />
        <rect className="mech-eye" x="58" y="82" width="84" height="15" rx="7.5" fill="currentColor" />
        <path d="M58 124 h30 M112 124 h30 M64 138 h24 M112 138 h24" stroke="currentColor" strokeWidth="2" opacity="0.55" />
        <path d="M74 160 h52 l-10 20 h-32 z" stroke="currentColor" strokeWidth="2" opacity="0.5" />
      </svg>

      {/* floating hex chips */}
      <div className="creative-hex hex-1" />
      <div className="creative-hex hex-2" />
      <div className="creative-hex hex-3" />
    </div>
  )
}
