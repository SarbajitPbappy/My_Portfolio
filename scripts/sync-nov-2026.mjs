/**
 * Content sync for the 11 Nov 2026 CV and the PhD-facing refresh.
 *
 * DRY RUN by default: prints what would change and writes nothing.
 *   node scripts/sync-nov-2026.mjs           # preview
 *   node scripts/sync-nov-2026.mjs --apply   # write to Supabase (live site)
 *
 * Every step matches rows by id AND checks the current value first, so it is
 * safe to re-run and skips anything that was already edited by hand.
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'

for (const line of readFileSync(new URL('../.env.local', import.meta.url), 'utf8').split('\n')) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
  if (m) process.env[m[1]] ??= m[2].replace(/^["']|["']$/g, '')
}
const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
if (!url || !key) { console.error('Missing Supabase env vars'); process.exit(1) }
const sb = createClient(url, key)
const APPLY = process.argv.includes('--apply')
console.log(APPLY ? 'APPLYING changes to Supabase\n' : 'DRY RUN (nothing is written). Re-run with --apply to write.\n')

let planned = 0
const short = (v) => (typeof v === 'string' && v.length > 90 ? v.slice(0, 87) + '…' : v)

async function patch(table, id, field, expectIncludes, next, label) {
  const { data, error } = await sb.from(table).select(`id,${field}`).eq('id', id).maybeSingle()
  if (error || !data) return console.log(`  ? ${label}: row ${table}#${id} not found, skipped`)
  const cur = data[field]
  if (cur === next) return console.log(`  = ${label}: already up to date`)
  if (expectIncludes !== null && !(cur ?? '').includes(expectIncludes))
    return console.log(`  ! ${label}: current value changed by hand, skipped\n      now: ${short(cur)}`)
  planned++
  console.log(`  ~ ${label}\n      from: ${short(cur)}\n      to:   ${short(next)}`)
  if (APPLY) {
    const { error: e } = await sb.from(table).update({ [field]: next, updated_at: new Date().toISOString() }).eq('id', id)
    console.log(e ? `      ✗ ${e.message}` : '      ✓ written')
  }
}

async function remove(table, id, mustMatch, label) {
  const { data } = await sb.from(table).select('*').eq('id', id).maybeSingle()
  if (!data) return console.log(`  = ${label}: already gone`)
  if (!mustMatch(data)) return console.log(`  ! ${label}: row ${table}#${id} no longer matches, skipped`)
  planned++
  console.log(`  - ${label}`)
  if (APPLY) {
    const { error: e } = await sb.from(table).delete().eq('id', id)
    console.log(e ? `      ✗ ${e.message}` : '      ✓ deleted')
  }
}

console.log('Hero')
await patch('hero', 1, 'cv_url', 'Sarbajit_Resume.pdf', '/cv.pdf', 'CV download → 11 Nov CV shipped with the site (/cv.pdf)')

console.log('\nTeaching (new courses from the CV)')
await patch('work_experience', 5, 'description',
  'Teach Data Structures (theory and laboratory), Computer Graphics, and Software Quality Assurance (SQA)',
  'Teach Computer Fundamentals, Digital Electronics and Logic Design, Data Structures (theory and laboratory), Computer Graphics, and Software Quality Assurance (SQA) at the undergraduate level. Design lecture content, lab exercises, assignments, and assessments aligned with course outcomes; evaluate student performance and provide academic guidance and mentoring; and participate in departmental academic and instructional activities.',
  'Lecturer role: add Computer Fundamentals and Digital Electronics & Logic Design')
{
  const { data } = await sb.from('about').select('description').eq('id', 1).maybeSingle()
  const cur = data?.description ?? ''
  const from = 'Currently teaching Data Structures, Computer Graphics, and Software Quality Assurance'
  const to = 'Currently teaching Computer Fundamentals, Digital Electronics and Logic Design, Data Structures, Computer Graphics, and Software Quality Assurance'
  if (cur.includes(from)) await patch('about', 1, 'description', from, cur.replace(from, to), 'About: same course list')
  else console.log('  = About: course list already updated or edited by hand')
}

console.log('\nPublications')
await patch('publications', 10, 'doi', 's44163-026-02476-6', '10.1007/s44163-026-02476-6',
  'Discover AI review: store the bare DOI (the full URL failed the DOI check, so it was never shown)')
await patch('publications', 10, 'volume', null, '6, 1724', 'Discover AI review: volume 6, article 1724')

console.log('\nContact (keep email, GitHub, LinkedIn)')
await remove('contact_info', 3, (r) => r.icon === 'Phone', 'Remove phone number (+880 …) from Contact')
await remove('contact_info', 6, (r) => r.icon === 'Facebook', 'Remove Facebook link from Contact')

console.log('\nSkills')
await remove('skills', 9, (r) => r.category === 'Soft Skill', 'Remove "Soft Skill" group')
await remove('skills', 4, (r) => r.category === 'Industry Knowledge', 'Remove "Industry Knowledge" group')
await patch('skills', 8, 'name', 'Covidence', 'Git/GitHub, Jupyter Notebook, VS Code, Overleaf', 'Tools: drop duplicate Covidence (kept under Research Tools)')
await patch('skills', 7, 'name', 'TensorFlow, Keras', 'PyTorch, TensorFlow, Keras, Scikit-Learn, OpenCV, Pandas, NumPy, Matplotlib, Seaborn, Preprocessing, EDA', 'Deep Learning & ML: add PyTorch (used in MLCG-GNN)')

console.log(`\n${planned} change(s) ${APPLY ? 'applied' : 'planned'}.`)
