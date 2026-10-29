import { Brain, Code2, Database, FlaskConical, Lightbulb, Microscope, Users, Wrench, type LucideIcon } from 'lucide-react'

// Icon and colour per category, matched on keywords so admin-entered names
// ("Programming Language", "Deep Learning & Machine Learning", ...) all resolve.
const CATEGORY_STYLES: { match: RegExp; icon: LucideIcon; gradient: string }[] = [
  { match: /program|language/i, icon: Code2, gradient: 'from-blue-500 to-cyan-500' },
  { match: /learning|\bml\b|\bai\b|vision/i, icon: Brain, gradient: 'from-violet-500 to-purple-500' },
  { match: /research tool/i, icon: FlaskConical, gradient: 'from-teal-500 to-emerald-500' },
  { match: /research/i, icon: Microscope, gradient: 'from-rose-500 to-pink-500' },
  { match: /tool|technolog/i, icon: Wrench, gradient: 'from-slate-500 to-slate-700' },
  { match: /data|database/i, icon: Database, gradient: 'from-green-500 to-emerald-500' },
  { match: /knowledge|algorithm/i, icon: Lightbulb, gradient: 'from-amber-500 to-orange-500' },
  { match: /soft|communication|leadership/i, icon: Users, gradient: 'from-fuchsia-500 to-pink-500' },
]
const DEFAULT_STYLE = { icon: Code2, gradient: 'from-slate-500 to-slate-700' }
export const categoryStyle = (category: string) => CATEGORY_STYLES.find((c) => c.match.test(category)) ?? DEFAULT_STYLE
