import { CheckCircle, Clock, FileText, Sparkles, type LucideIcon } from 'lucide-react'

export interface StatusStyle {
  label: string
  className: string
  Icon: LucideIcon
}

const STYLES: Record<string, StatusStyle> = {
  Published: { label: 'Published', className: 'bg-green-100 text-green-700', Icon: CheckCircle },
  Accepted: { label: 'Accepted', className: 'bg-emerald-100 text-emerald-800', Icon: CheckCircle },
  'Minor Revision': { label: 'Minor Revision', className: 'bg-sky-100 text-sky-800', Icon: Clock },
  'Major Revision': { label: 'Major Revision', className: 'bg-amber-100 text-amber-800', Icon: Clock },
  'Published (Abstract)': { label: 'Abstract', className: 'bg-blue-100 text-blue-800', Icon: Sparkles },
  'Under Review': { label: 'Under Review', className: 'bg-purple-100 text-purple-800', Icon: Clock },
  Submitted: { label: 'Submitted', className: 'bg-purple-100 text-purple-800', Icon: Clock },
  Draft: { label: 'Draft', className: 'bg-theme-surface-elevated text-theme-text', Icon: FileText },
}

/** Badge label, colours and icon for a publication status (unknown → neutral). */
export function publicationStatus(raw?: string): StatusStyle {
  const status = raw?.trim() || ''
  return STYLES[status] ?? { label: status || 'Unknown', className: 'bg-theme-surface-elevated text-theme-text', Icon: FileText }
}
