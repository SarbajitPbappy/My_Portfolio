'use client'

/**
 * Fixed rail of homepage sections used by the WebGL theme backgrounds
 * (LatentSpace, Wormhole). `present` is a bitmask of the sections found on the
 * page; the rail hides itself when there are none.
 */
export default function SectionRail({
  items,
  present,
  active,
  reduce,
}: {
  items: { id: string; label: string; name: string }[]
  present: number
  active: number
  reduce: boolean | null
}) {
  if (present === 0) return null

  const goTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })

  let n = 0
  return (
    <nav aria-label="Sections" className="hidden lg:flex fixed right-5 top-1/2 -translate-y-1/2 z-40 flex-col items-end gap-2.5">
      {items.map((s, i) => {
        if (!(present & (1 << i))) return null
        n++
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => goTo(s.id)}
            aria-label={`${s.label}: ${s.name}`}
            aria-current={i === active ? 'true' : undefined}
            className={`latent-rail-item${i === active ? ' is-active' : ''}`}
          >
            <span className="latent-rail-label">
              {String(n).padStart(2, '0')} · {s.name}
            </span>
            <span className="latent-rail-dot" />
          </button>
        )
      })}
    </nav>
  )
}
