/**
 * Idempotent content reconciliation from Sarbajit's October 2026 CV.
 * - UPDATES existing rows by id (stale titles, authors, statuses, ordering).
 * - INSERTS new rows ONLY if a row with the same key (title / category) does
 *   not already exist (safe to re-run).
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

// Insert only if no row with the same key (case-insensitive, trimmed) exists.
async function insertIfMissing(table, row, keyField = 'title') {
  const { data } = await sb.from(table).select(`id, ${keyField}`)
  const exists = (data || []).some(
    r => (r[keyField] || '').trim().toLowerCase() === row[keyField].trim().toLowerCase()
  )
  if (exists) { log(`• skip (exists): ${row[keyField].slice(0, 50)}`); return }
  const { error } = await sb.from(table).insert(row)
  if (error) { console.error(`  ✗ insert ${table}:`, error.message); return }
  log(`✓ inserted ${table}: ${row[keyField].slice(0, 50)}`); changed++
}

// Set `order` on rows matched by a key, following the given sequence.
async function reorder(table, keyField, keys) {
  const { data } = await sb.from(table).select(`id, ${keyField}`)
  for (const [i, k] of keys.entries()) {
    const row = (data || []).find(r => (r[keyField] || '').trim().toLowerCase().startsWith(k.toLowerCase()))
    if (!row) { console.error(`  ✗ ${table}: no row starting with "${k}"`); continue }
    await sb.from(table).update({ order: i }).eq('id', row.id)
  }
  log(`✓ reordered ${table}`); changed++
}

console.log('\n── ABOUT ──')
await update('about', 1, {
  description:
    'Lecturer in the Department of CSE at Daffodil International University and an AI/ML researcher (B.Sc. in CSE, CGPA 3.95/4.00, Batch First) with Erasmus+ exchange experience at Mälardalen University, Sweden. Published researcher in deep learning, computer vision, explainable AI, and federated learning for medical and agricultural imaging, and formerly a Research Assistant at DIU’s Health Informatics Research Lab. Currently teaching Data Structures, Computer Graphics, and Software Quality Assurance while maintaining an active research pipeline in healthcare AI.',
}, 'about description')

console.log('\n── EDUCATION ──')
await update('education', 2, {
  gpa: 'Grade: Passed',
  highlights: [
    'Erasmus+ ICM Exchange Scholarship (2025)',
    'International academic exchange',
    'Cross-cultural research collaboration',
    'Global perspective on AI/ML',
  ],
}, 'Mälardalen grade + Erasmus+ scholarship')

console.log('\n── WORK EXPERIENCE ──')
await update('work_experience', 5, {
  title: 'Lecturer (Contractual)',
  description:
    'Teach Data Structures (theory and laboratory), Computer Graphics, and Software Quality Assurance (SQA) at the undergraduate level. Design lecture content, lab exercises, assignments, and assessments aligned with course outcomes; evaluate student performance and provide academic guidance and mentoring; and participate in departmental academic and instructional activities.',
}, 'Lecturer → adds Computer Graphics')
await update('work_experience', 1, {
  title: 'Teaching Assistant (Part-Time)',
  organization: 'Department of CSE, Daffodil International University (DIU)',
  description:
    'Worked under the supervision of Professor Dr. Fernaz Narin Nur. Assisted in undergraduate courses (Information Security, Computer Network, Database Management System, Data Communication), laboratory sessions, and coursework evaluation, and provided academic and research support within the department.',
}, 'Teaching Assistant courses')
await insertIfMissing('work_experience', {
  title: 'Research Assistant (Part-Time)',
  organization: 'Health Informatics Research Lab (HIRL), Department of CSE, Daffodil International University (DIU)',
  period: 'January 2026 – July 2026',
  description:
    'Worked under the supervision of Dr. Md. Zahid Hasan (Associate Professor & Lab Director) and Prof. Dr. Sheak Rashed Haider Noori (Professor & Head, Department of CSE). Coordinated research activities within the lab, supported its academic mission, and contributed to ongoing health informatics research initiatives.',
  icon: 'Brain', gradient: 'from-teal-500 to-cyan-500', type: 'Work', order: 1,
})
await reorder('work_experience', 'title', [
  'Lecturer', 'Research Assistant', 'Teaching Assistant', 'IEEE Vice Chair', 'Secretary', 'Campus Organizer',
])

console.log('\n── SKILLS ──')
await update('skills', 1, { name: 'Python, C, C++, SQL, HTML, JavaScript' }, 'programming languages')
await update('skills', 7, {
  name: 'TensorFlow, Keras, Scikit-Learn, OpenCV, Pandas, NumPy, Matplotlib, Seaborn, Preprocessing, EDA',
}, 'ML/DL frameworks (+OpenCV)')
await update('skills', 8, { name: 'Git/GitHub, Jupyter Notebook, VS Code, Covidence, Overleaf' }, 'tools')
await insertIfMissing('skills', {
  name: 'Covidence, SPSS, LaTeX', category: 'Research Tools', level: '', icon: '', order: 3,
}, 'category')
await reorder('skills', 'category', [
  'Programming Language', 'Deep Learning & Machine Learning', 'Tools & Technologies',
  'Research Tools', 'Research', 'Industry Knowledge', 'Soft Skill',
])

console.log('\n── PUBLICATIONS (updates) ──')
await update('publications', 1, {
  authors: 'Sohel, A., Turjy, R. C. D., Paul, S. P., Assaduzzaman, M., Marouf, A. A., Rokne, J. G., & Alhajj, R.',
}, 'SkinVisualNet authors')
await update('publications', 2, {
  authors: 'Sohel, A., Bijoy, M. H. I., Paul, S. P., Turjy, R. C. D., Othman, M., & Samad, M. A.',
}, 'JackVisualNet authors')
await update('publications', 10, {
  title: 'A Systematic Review of Advances in Spatiotemporal Machine Learning for Road Traffic Accident Prediction in Developing Countries',
  authors: 'Nur, F. N.†, Mondal, A.†, Paul Bappy, S.†, Dipu, M. H., & Moon, N. N. († equal contribution)',
  journal: 'Discover Artificial Intelligence (Q1)', status: 'Accepted',
}, 'Road-traffic review → Accepted, Discover AI')
await update('publications', 9, {
  authors: 'Bappy, S. P.†, Nur, F. N.†, Mondal, A., Dipu, M. H., Sharmin, S., Moon, N. N., & Jahan, H. († equal contribution)',
  journal: 'PLOS ONE (Q1)', status: 'Minor Revision',
}, 'Alzheimer DenseNet → Minor Revision')
await update('publications', 6, {
  authors: 'Bappy, S. P., Tarafdar, S., Alvi, S. T., Turjy, R. C. D., & Sohel, A.',
  journal: 'Social Sciences & Humanities Open (Q1)', status: 'Major Revision', doi: null, volume: null, link: null,
}, 'FL review → Major Revision (drops "N/A" DOI)')
await update('publications', 5, {
  authors: 'Bappy, S. P., Bijoy, M. H. I., Turjy, R. C. D., Tarafdar, S., Nur, F. N., Sohel, A., Hasan, M. Z., Arefin, M. S., Dhar, P. K., Shimamura, T., & Ohidujjaman',
}, 'DeepMed-A3Net authors')
await update('publications', 7, {
  title: 'Evaluating Deep Learning Models and Explainable AI for Mushroom Classification',
  authors: 'Bappy, S. P., Turjy, R. C. D., Mondal, A., Bithi, T., Bijoy, M. H. I., & Sohel, A.',
  journal: 'Taylor & Francis Group',
}, 'Mushroom chapter title/authors')
await update('publications', 8, {
  title: 'An Enhanced Hybrid Cipher with Vigenere and Dynamic Caesar with Key-Position Swapping for Secure Encryption',
  authors: 'Bithi, S. A., Nur, F. N., Bappy, S. P., Moon, N. N., & Chakraborty, A.',
  journal: 'Proceedings of the 2026 IEEE 2nd International Conference on Quantum Photonics, Artificial Intelligence & Networking (QPAIN)',
  volume: '1–7', type: 'Conference Paper',
}, 'QPAIN cipher paper')
await update('publications', 3, { authors: 'Paul, S. P., Turjy, R. C. D., & Sohel, A.' }, 'jackfruit abstract authors')
await update('publications', 4, {
  authors: 'Turjy, R. C. D., Paul, S. P., & Sohel, A.',
  link: 'https://symposium24.ieeecsbdc.org/papers/21-a-hybrid-deep-learning-approach-for-identifying-lyme-disease-from-skin-rash-images',
}, 'Lyme abstract authors + correct link (was the jackfruit paper)')

console.log('\n── PUBLICATIONS (new) ──')
await insertIfMissing('publications', {
  title: 'Bridging the Performance–Efficiency Gap: A Resource-Efficient Hybrid DL-ML Framework for Jackfruit Disease Detection',
  authors: 'Turjy, R. C. D., Farid, F. A., Bijoy, M. H. I., Paul, S. P., Sohel, A., Uddin, J., & Karim, H. A.',
  status: 'Published', journal: 'Frontiers in Artificial Intelligence', year: '2026', type: 'Journal Article',
  doi: '10.3389/frai.2026.1884567', link: 'https://doi.org/10.3389/frai.2026.1884567', volume: '9',
  gradient: 'from-emerald-500 to-teal-500', order: 2,
})
await reorder('publications', 'title', [
  'SkinVisualNet', 'JackVisualNet', 'Bridging the Performance', 'A Systematic Review of Advances',
  'A Quantum-Inspired', 'Federated Learning for Securing', 'DeepMed-A3Net', 'Evaluating Deep Learning Models',
  'An Enhanced Hybrid Cipher', 'A Hybrid Deep Learning Approach for Identifying Jackfruit',
  'A Hybrid Deep Learning Approach for Identifying Lyme',
])

console.log('\n── PROJECTS ──')
await update('projects', 3, {
  title: 'Email Spam Classifier',
  description: 'NLP-based spam detection system using Random Forest and Decision Tree models, achieving 97% classification accuracy on 5,172 email samples.',
}, 'spam classifier accuracy')
// CV projects lead the list
await reorder('projects', 'title', [
  'AI Email Assistant', 'RetroX', 'MLCG-GNN', 'HostelEase', 'Email Spam Classifier',
  'Medical Image Classification', 'Splitter', 'Django E-Commerce', 'Rainfall', 'Population Analysis',
])

console.log('\n── FOOTER ──')
await update('footer', 1, {
  social_links: [
    { href: 'https://github.com/SarbajitPbappy', icon: 'Github', label: 'GitHub' },
    { href: 'https://linkedin.com/in/iamsarbajit', icon: 'Linkedin', label: 'LinkedIn' },
    { href: 'mailto:sarbajit2001@gmail.com', icon: 'Mail', label: 'Email' },
    { href: 'https://www.facebook.com/bappy.2001.paul', icon: 'Facebook', label: 'Facebook' },
  ],
}, 'footer Facebook link (was missing https://)')

console.log(`\n✅ Done. ${changed} change(s) applied.\n`)
