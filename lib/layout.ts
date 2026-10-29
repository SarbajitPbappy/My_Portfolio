/**
 * Classes for the last card of a 2-column (md) / 3-column (lg) grid so the
 * final row is always full instead of leaving a lone card beside empty cells.
 */
export function lastRowSpan(index: number, count: number, lgCols: 2 | 3 = 3) {
  if (index !== count - 1) return ''
  const md = count % 2 === 1 ? 'md:col-span-2' : ''
  if (lgCols === 2) return md
  const rem = count % 3
  const lg = rem === 1 ? 'lg:col-span-3' : rem === 2 ? 'lg:col-span-2' : 'lg:col-span-1'
  return `${md} ${lg}`.trim()
}
