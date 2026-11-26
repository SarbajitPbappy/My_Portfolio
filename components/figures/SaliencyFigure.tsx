'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Fig. 1 — a saliency "lens" over a synthetic axial MRI slice.
 *
 * The slice and the Grad-CAM-style map are generated procedurally (no patient
 * data). Outside the lens the reader sees the raw input; inside it, the
 * saliency map the classifier would attend to, with a live readout of the
 * value under the crosshair. Pointer, touch and arrow keys all move the lens;
 * when nobody is interacting it drifts slowly around the hot spot.
 */

const RES = 512 // internal resolution of the generated images
type Mode = 'lens' | 'map' | 'input'

// Inferno colormap stops (matplotlib), used only inside the figures.
const INFERNO: [number, number, number, number][] = [
  [0.0, 0, 0, 4],
  [0.13, 31, 12, 72],
  [0.25, 85, 15, 109],
  [0.38, 136, 34, 106],
  [0.5, 186, 54, 85],
  [0.63, 227, 89, 51],
  [0.75, 249, 140, 10],
  [0.88, 249, 201, 50],
  [1.0, 252, 255, 164],
]

function inferno(t: number): [number, number, number] {
  const v = Math.min(1, Math.max(0, t))
  for (let i = 1; i < INFERNO.length; i++) {
    const [p1, r1, g1, b1] = INFERNO[i]
    if (v <= p1) {
      const [p0, r0, g0, b0] = INFERNO[i - 1]
      const k = (v - p0) / (p1 - p0)
      return [r0 + (r1 - r0) * k, g0 + (g1 - g0) * k, b0 + (b1 - b0) * k]
    }
  }
  return [252, 255, 164]
}

const smooth = (e0: number, e1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)))
  return t * t * (3 - 2 * t)
}

// Deterministic pseudo-random so server and every visit render the same slice.
function rng(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}

// Head ellipse in normalised coordinates ([-1, 1] on both axes).
const A = 0.78
const B = 0.92

function ellipseR(x: number, y: number) {
  return Math.sqrt((x / A) ** 2 + (y / B) ** 2)
}

function rotatedEllipse(x: number, y: number, cx: number, cy: number, rx: number, ry: number, rot: number) {
  const dx = x - cx
  const dy = y - cy
  const c = Math.cos(rot)
  const s = Math.sin(rot)
  const u = dx * c + dy * s
  const v = -dx * s + dy * c
  return Math.sqrt((u / rx) ** 2 + (v / ry) ** 2)
}

// Smooth periodic "noise" along the cortex, used to fold the grey matter.
function fold(th: number) {
  return (
    0.45 * Math.sin(7 * th + 1.0) +
    0.3 * Math.sin(13 * th + 2.1) +
    0.17 * Math.sin(23 * th + 0.7) +
    0.08 * Math.sin(37 * th + 4.2)
  )
}

/** Intensity of the synthetic T1-like slice at (x, y), 0..1. */
function sliceIntensity(x: number, y: number, noise: number) {
  const r = ellipseR(x, y)
  const th = Math.atan2(y, x)

  if (r > 1.07) return 0.025 + noise * 0.015
  if (r > 1.0) return 0.55 * smooth(1.07, 1.03, r) + 0.1 + noise * 0.05 // scalp
  if (r > 0.965) return 0.09 + noise * 0.03 // skull

  // Cortical surface, with a gentle wobble.
  const rc = 0.945 + 0.01 * Math.sin(17 * th + 0.3) + 0.006 * Math.sin(29 * th + 1)
  if (r > rc) return 0.12 + noise * 0.03 // CSF

  // Curve the folds slightly with depth so sulci are not straight spokes.
  const thw = th + 0.06 * Math.sin(r * 14 + th * 3)
  const n = fold(thw)

  // White matter reaches into the gyri where the fold is positive.
  const rw = rc - 0.19 + 0.1 * Math.max(0, n)
  const GM = 0.47
  const WM = 0.72
  let v = GM + (WM - GM) * (1 - smooth(rw - 0.025, rw + 0.025, r))

  // Sulci: CSF clefts where the fold dips, running from the surface inwards.
  const cleft = 1 - smooth(-0.62, -0.4, n)
  const depth = smooth(rc - 0.15, rc - 0.02, r)
  v = v * (1 - cleft * depth * 0.72)

  // Finer, shallower secondary sulci.
  const n2 = Math.sin(47 * thw + 2 * Math.sin(5 * thw)) * 0.6 + 0.4 * Math.sin(71 * thw + 0.9)
  const cleft2 = 1 - smooth(-0.95, -0.7, n2)
  v = v * (1 - cleft2 * smooth(rc - 0.08, rc - 0.01, r) * 0.55)

  // Deep grey nuclei (thalamus / basal ganglia).
  for (const sx of [-1, 1]) {
    const d = rotatedEllipse(x, y, sx * 0.21, 0.08, 0.08, 0.13, sx * 0.35)
    v -= (1 - smooth(0.5, 1.0, d)) * 0.12
  }

  // Lateral ventricles: frontal horns and atria.
  for (const sx of [-1, 1]) {
    const d1 = rotatedEllipse(x, y, sx * 0.085, -0.14, 0.04, 0.17, sx * 0.32)
    const d2 = rotatedEllipse(x, y, sx * 0.14, 0.2, 0.035, 0.1, -sx * 0.5)
    const d = Math.min(d1, d2)
    const k = smooth(0.7, 1.1, d)
    v = v * k + 0.09 * (1 - k)
  }

  // Interhemispheric fissure.
  if ((y < -0.45 || y > 0.52) && Math.abs(x + 0.012 * Math.sin(y * 8)) < 0.01) v = 0.13

  // Coil bias field and grain.
  v *= 1 - 0.16 * r * r + 0.04 * x
  return Math.max(0, Math.min(1, v + noise * 0.04))
}

// Where the "model" looks: a lesion-like hot spot in the right temporal-parietal
// region, with two weaker secondary responses.
const BLOBS = [
  { x: 0.36, y: -0.16, s: 0.15, w: 1.0 },
  { x: 0.24, y: 0.06, s: 0.11, w: 0.55 },
  { x: -0.3, y: 0.34, s: 0.1, w: 0.28 },
]

function saliency(x: number, y: number) {
  if (ellipseR(x, y) > 0.95) return 0
  let h = 0
  for (const b of BLOBS) h += b.w * Math.exp(-((x - b.x) ** 2 + (y - b.y) ** 2) / (2 * b.s * b.s))
  return Math.min(1, h)
}

function buildImages() {
  const base = document.createElement('canvas')
  const heat = document.createElement('canvas')
  base.width = heat.width = RES
  base.height = heat.height = RES
  const bctx = base.getContext('2d')!
  const hctx = heat.getContext('2d')!
  const bimg = bctx.createImageData(RES, RES)
  const himg = hctx.createImageData(RES, RES)
  const rand = rng(42)

  for (let j = 0; j < RES; j++) {
    for (let i = 0; i < RES; i++) {
      const x = (i / RES) * 2 - 1
      const y = (j / RES) * 2 - 1
      const n = rand() - 0.5
      const g = Math.pow(sliceIntensity(x, y, n), 0.9) * 255
      const k = (j * RES + i) * 4
      bimg.data[k] = g
      bimg.data[k + 1] = g
      bimg.data[k + 2] = g
      bimg.data[k + 3] = 255

      const h = saliency(x, y)
      const [r, gg, b] = inferno(h)
      // Grey underneath (as in a Grad-CAM overlay), colour on top.
      const a = 0.25 + 0.7 * smooth(0.05, 0.85, h)
      himg.data[k] = g * (1 - a) + r * a
      himg.data[k + 1] = g * (1 - a) + gg * a
      himg.data[k + 2] = g * (1 - a) + b * a
      himg.data[k + 3] = 255
    }
  }
  bctx.putImageData(bimg, 0, 0)
  hctx.putImageData(himg, 0, 0)
  return { base: soften(base), heat: soften(heat) }
}

// A light blur so the procedural edges read as an acquired image.
function soften(src: HTMLCanvasElement) {
  const out = document.createElement('canvas')
  out.width = out.height = RES
  const ctx = out.getContext('2d')!
  ctx.filter = 'blur(0.9px)'
  ctx.drawImage(src, 0, 0)
  return out
}

const HOTSPOT = { x: BLOBS[0].x, y: BLOBS[0].y }

export default function SaliencyFigure({ caption }: { caption?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const imgs = useRef<{ base: HTMLCanvasElement; heat: HTMLCanvasElement } | null>(null)
  const lens = useRef({ x: HOTSPOT.x - 0.05, y: HOTSPOT.y + 0.05 })
  const userActive = useRef(false)
  const [mode, setMode] = useState<Mode>('lens')
  const readoutRef = useRef<HTMLSpanElement>(null)
  const modeRef = useRef<Mode>('lens')
  modeRef.current = mode

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    const im = imgs.current
    if (!canvas || !im) return
    const ctx = canvas.getContext('2d')!
    const size = canvas.width
    ctx.imageSmoothingQuality = 'high'
    ctx.clearRect(0, 0, size, size)
    const m = modeRef.current
    ctx.drawImage(m === 'map' ? im.heat : im.base, 0, 0, size, size)

    if (m !== 'lens') return
    const cx = ((lens.current.x + 1) / 2) * size
    const cy = ((lens.current.y + 1) / 2) * size
    const r = size * 0.17

    ctx.save()
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.clip()
    ctx.drawImage(im.heat, 0, 0, size, size)
    ctx.restore()

    const dpr = size / (canvas.clientWidth || size)
    ctx.lineWidth = 1.25 * dpr
    ctx.strokeStyle = 'rgba(255,255,255,0.9)'
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.stroke()
    // crosshair
    const t = 6 * dpr
    ctx.strokeStyle = 'rgba(255,255,255,0.75)'
    ctx.beginPath()
    ctx.moveTo(cx - t, cy)
    ctx.lineTo(cx + t, cy)
    ctx.moveTo(cx, cy - t)
    ctx.lineTo(cx, cy + t)
    ctx.stroke()

    // Written straight to the DOM: no React re-render per animation frame.
    if (readoutRef.current) readoutRef.current.textContent = saliency(lens.current.x, lens.current.y).toFixed(2)
  }, [])

  // Build images, size the canvas, and run the idle drift.
  useEffect(() => {
    const canvas = canvasRef.current!
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const w = canvas.clientWidth
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(w * dpr)
      draw()
    }
    // Generate the images after first paint so they don't delay hydration.
    const build = window.setTimeout(() => {
      imgs.current = buildImages()
      resize()
    }, 50)
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let raf = 0
    let visible = true
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
    })
    io.observe(canvas)
    const start = performance.now()
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick)
      if (!visible || userActive.current || modeRef.current !== 'lens') return
      const t = (now - start) / 1000
      lens.current = {
        x: HOTSPOT.x - 0.12 + 0.26 * Math.cos(t * 0.45),
        y: HOTSPOT.y + 0.1 + 0.2 * Math.sin(t * 0.6),
      }
      draw()
    }
    if (!reduced) raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      window.clearTimeout(build)
      ro.disconnect()
      io.disconnect()
    }
  }, [draw])

  useEffect(() => {
    draw()
  }, [mode, draw])

  const moveTo = (clientX: number, clientY: number) => {
    const rect = canvasRef.current!.getBoundingClientRect()
    lens.current = {
      x: ((clientX - rect.left) / rect.width) * 2 - 1,
      y: ((clientY - rect.top) / rect.height) * 2 - 1,
    }
    userActive.current = true
    draw()
  }

  const onKey = (e: React.KeyboardEvent) => {
    const step = 0.05
    const d: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    }
    const v = d[e.key]
    if (!v) return
    e.preventDefault()
    userActive.current = true
    lens.current = {
      x: Math.max(-1, Math.min(1, lens.current.x + v[0])),
      y: Math.max(-1, Math.min(1, lens.current.y + v[1])),
    }
    draw()
  }

  const modes: { value: Mode; label: string }[] = [
    { value: 'lens', label: 'Lens' },
    { value: 'map', label: 'Saliency' },
    { value: 'input', label: 'Input' },
  ]

  return (
    <figure className="w-full max-w-[440px] mx-auto">
      <div className="flex items-center justify-between mb-2">
        <span className="font-mono text-[11px] tracking-wide text-theme-text-muted">Fig. 1</span>
        <div role="radiogroup" aria-label="Figure view" className="inline-flex border border-theme-border rounded-theme-sm overflow-hidden">
          {modes.map((m) => (
            <button
              key={m.value}
              type="button"
              role="radio"
              aria-checked={mode === m.value}
              onClick={() => setMode(m.value)}
              className={`font-mono text-[11px] px-2.5 py-1 transition-colors ${
                mode === m.value
                  ? 'bg-theme-text text-theme-background'
                  : 'text-theme-text-muted hover:text-theme-text'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div
        ref={wrapRef}
        className="relative aspect-square rounded-theme-md overflow-hidden bg-[#08090b] ring-1 ring-theme-border select-none"
      >
        <canvas
          ref={canvasRef}
          tabIndex={0}
          role="img"
          aria-label="Synthetic axial brain MRI slice with a saliency heatmap. A lens shows where a classifier attends; use arrow keys to move it."
          className="absolute inset-0 w-full h-full cursor-crosshair touch-pan-y"
          onPointerMove={(e) => moveTo(e.clientX, e.clientY)}
          onPointerDown={(e) => moveTo(e.clientX, e.clientY)}
          onPointerLeave={() => {
            userActive.current = false
          }}
          onPointerCancel={() => {
            userActive.current = false
          }}
          onKeyDown={onKey}
        />
        {/* Radiology-style annotations */}
        <div className="pointer-events-none absolute inset-0 p-3 font-mono text-[10px] leading-tight text-white/55" aria-hidden>
          <div className="absolute top-3 left-3">AX T1 · synthetic<br />slice 42/96</div>
          <div className="absolute top-3 right-3 text-right">Grad-CAM<br />layer4.2</div>
          <div className="absolute top-1/2 -translate-y-1/2 left-3">R</div>
          <div className="absolute top-1/2 -translate-y-1/2 right-3">L</div>
          <div className="absolute bottom-3 left-3 tabular-nums text-white/80">
            {mode === 'lens' ? <>s = <span ref={readoutRef}>0.00</span></> : mode === 'map' ? 'full map' : 'input only'}
          </div>
          <div className="absolute bottom-3 right-3">illustrative</div>
        </div>
      </div>

      {/* Colour bar */}
      <div className="mt-2 flex items-center gap-2 font-mono text-[10px] text-theme-text-muted" aria-hidden>
        <span>0</span>
        <span
          className="h-1.5 flex-1 rounded-full"
          style={{
            background:
              'linear-gradient(90deg, rgb(0,0,4), rgb(85,15,109), rgb(186,54,85), rgb(249,140,10), rgb(252,255,164))',
          }}
        />
        <span>1</span>
        <span className="ml-1">saliency</span>
      </div>

      {caption && (
        <figcaption className="fig-caption mt-3">
          <b>Fig. 1</b> {caption}
        </figcaption>
      )}
    </figure>
  )
}
