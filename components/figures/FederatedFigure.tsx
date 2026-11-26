'use client'

import { useEffect, useState } from 'react'

/**
 * Fig. 2 — federated learning across hospitals.
 *
 * Each round, every hospital trains on its own data and sends only a model
 * update (Δw, violet) to the aggregator, which returns the averaged global
 * model (w, amber). Patient data never leaves a site. The round counter
 * advances with the animation; with reduced motion the figure is static.
 */

const ROUND_S = 4 // seconds per federated round
const W = 460
const H = 300
const SERVER = { x: W / 2, y: H / 2 }
const SITES = [
  { id: 'A', x: 78, y: 62 },
  { id: 'B', x: W - 78, y: 62 },
  { id: 'C', x: 78, y: H - 62 },
  { id: 'D', x: W - 78, y: H - 62 },
]

export default function FederatedFigure() {
  const [round, setRound] = useState(1)
  const [animate, setAnimate] = useState(false)

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return
    setAnimate(true)
    const id = window.setInterval(() => setRound((r) => (r % 99) + 1), ROUND_S * 1000)
    return () => window.clearInterval(id)
  }, [])

  return (
    <figure className="w-full">
      <div className="rounded-theme-md border border-theme-border bg-theme-surface p-3 sm:p-4">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full h-auto text-theme-text"
          role="img"
          aria-label="Diagram: four hospitals each train locally and send model updates to a central aggregator, which returns the averaged global model. Patient data stays at each hospital."
        >
          <defs>
            <marker id="fed-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M0,0 L8,4 L0,8 z" fill="currentColor" opacity="0.35" />
            </marker>
          </defs>

          {/* Links: up (Δw) and down (w) as two offset paths per site */}
          {SITES.map((s) => {
            const dx = SERVER.x - s.x
            const dy = SERVER.y - s.y
            const len = Math.hypot(dx, dy)
            const ox = (-dy / len) * 5
            const oy = (dx / len) * 5
            const sx = s.x + (dx / len) * 48
            const sy = s.y + (dy / len) * 30
            const ex = SERVER.x - (dx / len) * 52
            const ey = SERVER.y - (dy / len) * 30
            const up = `M${sx + ox},${sy + oy} L${ex + ox},${ey + oy}`
            const down = `M${ex - ox},${ey - oy} L${sx - ox},${sy - oy}`
            return (
              <g key={s.id}>
                <path id={`up-${s.id}`} d={up} stroke="currentColor" strokeOpacity="0.22" strokeDasharray="3 4" fill="none" markerEnd="url(#fed-arrow)" />
                <path id={`down-${s.id}`} d={down} stroke="currentColor" strokeOpacity="0.22" strokeDasharray="3 4" fill="none" markerEnd="url(#fed-arrow)" />
                {animate && (
                  <>
                    <circle r="3.5" fill="rgb(var(--color-primary))">
                      <animateMotion dur={`${ROUND_S}s`} repeatCount="indefinite" keyPoints="0;1;1" keyTimes="0;0.45;1" calcMode="linear">
                        <mpath href={`#up-${s.id}`} />
                      </animateMotion>
                      <animate attributeName="opacity" dur={`${ROUND_S}s`} repeatCount="indefinite" values="1;1;0;0" keyTimes="0;0.44;0.46;1" />
                    </circle>
                    <circle r="3.5" fill="#f98c0a">
                      <animateMotion dur={`${ROUND_S}s`} repeatCount="indefinite" keyPoints="0;0;1;1" keyTimes="0;0.55;0.95;1" calcMode="linear">
                        <mpath href={`#down-${s.id}`} />
                      </animateMotion>
                      <animate attributeName="opacity" dur={`${ROUND_S}s`} repeatCount="indefinite" values="0;0;1;1;0" keyTimes="0;0.54;0.56;0.95;1" />
                    </circle>
                  </>
                )}
              </g>
            )
          })}

          {/* Hospitals */}
          {SITES.map((s) => (
            <g key={`site-${s.id}`} transform={`translate(${s.x - 50},${s.y - 30})`}>
              <rect width="104" height="60" rx="4" fill="rgb(var(--color-background))" stroke="currentColor" strokeOpacity="0.3" />
              {/* local scans */}
              {[0, 1, 2].map((k) => (
                <rect key={k} x={8 + k * 5} y={10 + k * 4} width="18" height="18" rx="2" fill="#1b1f24" stroke="rgb(var(--color-background))" strokeWidth="1" />
              ))}
              {/* lock: data stays on site */}
              <g transform="translate(14,42)" stroke="currentColor" strokeOpacity="0.6" fill="none" strokeWidth="1.2">
                <rect x="0" y="4" width="9" height="7" rx="1" />
                <path d="M2,4 V2.5 a2.5,2.5 0 0 1 5,0 V4" />
              </g>
              <text x="44" y="24" fontSize="12" fontFamily="var(--font-body)" fill="currentColor" fontWeight="500">Hospital {s.id}</text>
              <text x="44" y="39" fontSize="10" fontFamily="var(--font-mono)" fill="currentColor" opacity="0.6">private data</text>
              <text x="44" y="52" fontSize="10" fontFamily="var(--font-mono)" fill="currentColor" opacity="0.6">local training</text>
            </g>
          ))}

          {/* Aggregator */}
          <g transform={`translate(${SERVER.x - 56},${SERVER.y - 30})`}>
            <rect width="112" height="60" rx="4" fill="rgb(var(--color-text))" />
            <text x="56" y="25" textAnchor="middle" fontSize="11" fontFamily="var(--font-body)" fontWeight="500" fill="rgb(var(--color-background))">
              Aggregator
            </text>
            <text x="56" y="43" textAnchor="middle" fontSize="10" fontFamily="var(--font-mono)" fill="rgb(var(--color-background))" opacity="0.75">
              w ← Σ (nₖ/n) wₖ
            </text>
          </g>

          {/* Legend + round */}
          <g fontFamily="var(--font-mono)" fontSize="9.5" fill="currentColor">
            <circle cx={W / 2 - 92} cy={18} r="3.5" fill="rgb(var(--color-primary))" />
            <text x={W / 2 - 84} y={21.5} opacity="0.7">update Δwₖ</text>
            <circle cx={W / 2 + 8} cy={18} r="3.5" fill="#f98c0a" />
            <text x={W / 2 + 16} y={21.5} opacity="0.7">global w</text>
            <text x={W / 2} y={H - 12} textAnchor="middle" opacity="0.7">
              round t = {String(round).padStart(2, '0')}
            </text>
          </g>
        </svg>
      </div>
      <figcaption className="fig-caption mt-3">
        <b>Fig. 2</b> Federated learning across hospitals. Each site trains on its own patients; only model
        updates travel to the aggregator, which returns a weighted average (FedAvg). Patient images never leave
        the hospital. Schematic.
      </figcaption>
    </figure>
  )
}
