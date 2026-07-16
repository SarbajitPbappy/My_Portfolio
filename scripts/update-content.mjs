/**
 * Idempotent content reconciliation from Sarbajit's July 2026 resume.
 * - UPDATES existing rows by id (stale titles, DOIs, statuses).
 * - INSERTS new publications/projects ONLY if a row with the same title
 *   does not already exist (safe to re-run).
 *
 * Run:  node scripts/update-content.mjs
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'

// --- load .env.local manually (dotenv defaults to .env) ---
for (const line of readFileSync(new URL('../.env.local', import.meta.url), 'utf8').split('\n')) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
  if (m) process.env[m[1]] ??= m[2].replace(/^["']|["']$/g, '')
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
if (!url || !key) { console.error('Missing Supabase env vars'); process.exit(1) }
const sb = createClient(url, key)

const log = (...a) => console.log('  ', ...a)
let changed = 0

async function update(table, id, patch, label) {
  const { error } = await sb.from(table).update({ ...patch, updated_at: new Date().toISOString() }).eq('id', id)
  if (error) { console.error(`  ✗ ${table}#${id}:`, error.message); return }
  log(`✓ updated ${label}`); changed++
}

// Insert only if no row with same title (case-insensitive, trimmed) exists.
async function insertIfMissing(table, row, titleField = 'title') {
  const { data } = await sb.from(table).select(`id, ${titleField}`)
  const exists = (data || []).some(
    r => (r[titleField] || '').trim().toLowerCase() === row[titleField].trim().toLowerCase()
  )
  if (exists) { log(`• skip (exists): ${row[titleField].slice(0, 50)}`); return }
  const { error } = await sb.from(table).insert(row)
  if (error) { console.error(`  ✗ insert ${table}:`, error.message); return }
  log(`✓ inserted ${table}: ${row[titleField].slice(0, 50)}`); changed++
}

console.log('\n── HERO ──')
await update('hero', 1, {
  title: 'Lecturer, Dept. of CSE @ Daffodil International University',
  description:
    'AI/ML researcher and lecturer working on deep learning, computer vision, explainable AI, and federated learning for medical and agricultural imaging.',
  focus_tags: ['Computer Vision', 'Explainable AI', 'Federated Learning', 'Medical Imaging'],
}, 'hero title/description/tags')

console.log('\n── ABOUT ──')
await update('about', 1, {
  description:
    'Lecturer in the Department of CSE at Daffodil International University and an AI/ML researcher (CGPA 3.95/4.00, Batch First) with Erasmus+ exchange experience at Mälardalen University, Sweden. Published researcher across deep learning, computer vision, explainable AI, and federated learning for medical and agricultural imaging, currently teaching Data Structures and Software Quality Assurance while maintaining an active research pipeline in healthcare AI.',
  quick_facts: [
    { label: 'Specialties', value: 'Deep Learning, Computer Vision, XAI, Federated Learning' },
    { label: 'Stack', value: 'PyTorch, TensorFlow, Keras, Scikit-learn, OpenCV' },
    { label: 'Current Role', value: 'Lecturer, CSE — Daffodil International University' },
  ],
}, 'about description/quick-facts')

console.log('\n── WORK EXPERIENCE ──')
await update('work_experience', 5, {
  description:
    'Teach Data Structures (theory and laboratory) and Software Quality Assurance at the undergraduate level. Design lecture content, lab exercises, assignments, and assessments aligned with course outcomes; evaluate student performance; and participate in departmental academic and research activities.',
}, 'Lecturer role description → Data Structures & SQA')

console.log('\n── PUBLICATIONS (updates) ──')
await update('publications', 2, {
  status: 'Published', year: '2026', journal: 'PeerJ Computer Science (Q1)',
  volume: '12, e3977', doi: '10.7717/peerj-cs.3977',
}, 'JackVisualNet → Published + DOI')
await update('publications', 1, { volume: '7(4), 157' }, 'SkinVisualNet volume')
await update('publications', 8, { doi: '10.1109/QPAIN69676.2026.11546299' }, 'QPAIN cipher DOI')
await update('publications', 6, {
  status: 'Major Revision', journal: 'Computers in Human Behavior Reports (Q1)',
}, 'Federated Learning review → Major Revision (Q1)')
await update('publications', 5, { journal: 'Neural Computing and Applications (Q1)' }, 'DeepMed-A3Net journal (Q1)')

console.log('\n── PUBLICATIONS (new) ──')
await insertIfMissing('publications', {
  title: 'A Quantum-Inspired Hybrid DenseNet Framework with Imbalance-Aware Learning for MRI-Based Alzheimer’s Disease Classification',
  authors: 'Nur, F. N., Bappy, S. P., Mondal, A., Dipu, M. H., Sharmin, S., Moon, N. N., & Jahan, H.',
  status: 'Under Review', journal: 'PLOS ONE', year: '2026', type: 'Journal Article',
  doi: null, link: null, volume: null, gradient: 'from-indigo-500 to-violet-500', order: 8,
})
await insertIfMissing('publications', {
  title: 'Spatiotemporal Patterns and Machine Learning for Road Traffic Accident Prediction in Developing Countries: A Systematic Review with Implications for Bangladesh',
  authors: 'Mondal, A., Paul Bappy, S., & Nur, F. N.',
  status: 'Under Review', journal: 'International Journal of Data Science and Analytics (Q1)',
  year: '2026', type: 'Journal Article', doi: null, link: null, volume: null,
  gradient: 'from-cyan-500 to-blue-500', order: 9,
})

console.log('\n── PROJECTS (new) ──')
const projGrad = 'from-blue-500 to-cyan-500'
await insertIfMissing('projects', {
  title: 'AI Email Assistant',
  description: 'Intelligent Gmail triage system using an Ollama LLM, Gmail API, Telegram API, and Streamlit for automated email classification, job-opportunity detection, and tailored cover-letter generation.',
  technologies: ['Ollama LLM', 'Gmail API', 'Telegram API', 'Streamlit', 'Python'],
  category: 'AI / Automation', icon: 'Mail', gradient: 'from-violet-500 to-purple-500', github: '', order: 6,
})
await insertIfMissing('projects', {
  title: 'RetroX – Dengue Outbreak Forecasting System',
  description: 'ML-powered outbreak forecasting platform using Scikit-learn, Optuna, SHAP, FastAPI, and Streamlit with leakage-safe time-series feature engineering and explainable-AI integration.',
  technologies: ['Scikit-learn', 'Optuna', 'SHAP', 'FastAPI', 'Streamlit'],
  category: 'Machine Learning', icon: 'Activity', gradient: 'from-rose-500 to-pink-500', github: '', order: 7,
})
await insertIfMissing('projects', {
  title: 'MLCG-GNN – Multi-Label Chest X-ray Classification',
  description: 'End-to-end graph neural network pipeline for multi-label chest X-ray classification (NIH ChestX-ray14, CheXpert, VinDr-CXR) with adaptive graph construction, hybrid CNN–GNN feature fusion, uncertainty quantification, and Grad-CAM interpretability.',
  technologies: ['PyTorch', 'GNN (GraphSAGE)', 'CNN', 'Grad-CAM', 'Uncertainty Quantification'],
  category: 'Medical Imaging', icon: 'Brain', gradient: 'from-teal-500 to-emerald-500', github: '', order: 8,
})
await insertIfMissing('projects', {
  title: 'HostelEase – Hostel Management System',
  description: 'Multi-role hostel management platform built with PHP, MySQL, Bootstrap, and Docker featuring room-lifecycle management, automated billing, complaint tracking, and secure authentication.',
  technologies: ['PHP', 'MySQL', 'Bootstrap', 'Docker'],
  category: 'Web Application', icon: 'Building', gradient: 'from-amber-500 to-orange-500', github: '', order: 9,
})

console.log(`\n✅ Done. ${changed} change(s) applied.\n`)
