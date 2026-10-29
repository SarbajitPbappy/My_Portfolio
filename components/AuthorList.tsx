import { Fragment } from 'react'

// Name variants used across Sarbajit's papers.
const SELF = /(Bappy,\s*S\.\s*P\.|Paul Bappy,\s*S\.|Paul,\s*S\.\s*P\.|Paul,\s*S\.|Sarbajit Paul Bappy|Sarbajit)/

/** A publication's author list with the site owner's name in bold. */
export default function AuthorList({ authors }: { authors: string }) {
  const parts = authors.replace(/\s+/g, ' ').trim().split(SELF)
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <strong key={i} className="font-semibold text-theme-text">
            {part}
          </strong>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        )
      )}
    </>
  )
}
