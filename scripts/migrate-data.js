/**
 * Data Migration Script
 * 
 * This script migrates ALL existing hardcoded data from your components to Supabase.
 * All data has been extracted from: Education.tsx, ResearchAndPublications.tsx, 
 * WorkExperience.tsx, and Projects.tsx
 * 
 * Prerequisites:
 * 1. Install dotenv: npm install dotenv
 * 2. Set your Supabase credentials in .env.local
 * 3. Run the SQL schema (supabase_schema.sql) in Supabase SQL Editor
 * 
 * Usage:
 * Run: node scripts/migrate-data.js
 * 
 * Note: This will insert all data. If you run it multiple times, you may get duplicates.
 * Clear your tables first if you need to re-run.
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Complete Education Data - Extracted from components
const educationData = [
  {
    degree: 'Bachelor of Science in Computer Science and Engineering',
    institution: 'Daffodil International University (DIU)',
    location: 'Dhaka, Bangladesh',
    gpa: 'CGPA: 3.93/4.00',
    period: 'May 2022 – Present',
    highlights: ['Outstanding academic performance', 'Research-focused curriculum', 'Active in IEEE activities'],
    gradient: 'from-purple-500 to-pink-500',
    icon: 'GraduationCap',
    order: 0,
  },
  {
    program: 'Erasmus+ Exchange Semester',
    degree: 'Computer Science and Engineering',
    institution: 'Mälardalen University',
    location: 'Västerås, Sweden',
    period: 'Jan 2025 – Jun 2025',
    highlights: ['International academic exchange', 'Cross-cultural research collaboration', 'Global perspective on AI/ML'],
    gradient: 'from-blue-500 to-indigo-500',
    icon: 'Globe',
    order: 1,
  },
  {
    degree: 'HSC in Science',
    institution: 'Govt. Majid Memorial City College',
    location: 'Khulna, Bangladesh',
    gpa: 'GPA: 5.00/5.00',
    period: 'Jul 2017 – Dec 2019',
    highlights: ['Perfect GPA', 'Strong foundation in science and mathematics'],
    gradient: 'from-green-500 to-emerald-500',
    icon: 'Award',
    order: 2,
  },
]

// Complete Publications Data - Extracted from ResearchAndPublications.tsx
const publicationsData = [
  {
    title: 'SkinVisualNet: A Hybrid Deep Learning Approach Leveraging Explainable Models for Identifying Lyme Disease from Skin Rash Images',
    authors: 'Sohel, A., Turjy, R. C. D., Bappy, S. P., Assaduzzaman, M., Marouf, A. A., Rokne, J. G., & Alhajj, R.',
    status: 'Published',
    journal: 'Machine Learning and Knowledge Extraction',
    year: '2025',
    doi: '10.3390/make7040157',
    type: 'Journal Article (Q1)',
    link: 'https://doi.org/10.3390/make7040157',
    gradient: 'from-green-500 to-emerald-500',
    order: 0,
  },
  {
    title: 'JackVisualNet: A Fine-Tuned Hybrid Deep Learning Model for Jackfruit Disease Classification with Explainable AI',
    authors: 'Bappy, S. P. et al.',
    status: 'Major Revision',
    journal: 'PeerJ Computer Science (Q1)',
    year: '2025',
    type: 'Journal Article',
    link: '#',
    gradient: 'from-yellow-500 to-amber-500',
    order: 1,
  },
  {
    title: 'A Hybrid Deep Learning Approach for Identifying Jackfruit Leaf and Fruit Disease',
    authors: 'Paul, S., R.C.D. Turjy, A. Sohel',
    status: 'Published (Abstract)',
    journal: 'IEEE CS BDC Symposium 2024',
    year: '2024',
    type: 'Conference Proceedings',
    volume: 'Vol. 3',
    link: 'https://symposium24.ieeecsbdc.org/papers/20-a-hybrid-deep-learning-approach-for-identifying-jackfruit-leaf-and-fruit-disease',
    gradient: 'from-blue-500 to-cyan-500',
    order: 2,
  },
  {
    title: 'A Hybrid Deep Learning Approach for Identifying Lyme Disease from Skin Rash Images',
    authors: 'R.C.D. Turjy, Paul, S., A. Sohel',
    status: 'Published (Abstract)',
    journal: 'IEEE CS BDC Symposium 2024',
    year: '2024',
    type: 'Conference Proceedings',
    volume: 'Vol. 3',
    link: 'https://symposium24.ieeecsbdc.org/papers/20-a-hybrid-deep-learning-approach-for-identifying-jackfruit-leaf-and-fruit-disease',
    gradient: 'from-purple-500 to-pink-500',
    order: 3,
  },
]

// Complete Work Experience Data - Extracted from WorkExperience.tsx
const workExperienceData = [
  {
    title: 'Teaching Assistant',
    organization: 'Daffodil International University',
    period: 'October 2025 – Present',
    description: 'Supporting undergraduate courses, labs, and evaluation under Prof. Dr. Fernaz Narin Nur. Mentoring students and assisting research activities.',
    gradient: 'from-blue-500 to-cyan-500',
    type: 'Work',
    icon: 'BookOpen',
    order: 0,
  },
  {
    title: 'IEEE Vice Chair (Technical)',
    organization: 'IEEE DIU SB CS Chapter',
    period: '2024 – 2025',
    description: 'Led technical initiatives and events for the IEEE Student Branch Computer Science Chapter.',
    gradient: 'from-purple-500 to-pink-500',
    type: 'Volunteering',
    icon: 'Users',
    order: 1,
  },
  {
    title: 'Secretary',
    organization: 'IEEE DIU SB WIE Affinity Group',
    period: '2024 – 2025',
    description: 'Coordinated operations and events for the Women in Engineering Affinity Group.',
    gradient: 'from-green-500 to-emerald-500',
    type: 'Volunteering',
    icon: 'Briefcase',
    order: 2,
  },
  {
    title: 'Campus Organizer',
    organization: 'Brikkhobondhu',
    period: '2024',
    description: 'Organized campus engagement programs and community events.',
    gradient: 'from-amber-500 to-orange-500',
    type: 'Volunteering',
    icon: 'Award',
    order: 3,
  },
]

// Complete Projects Data - Extracted from Projects.tsx
const projectsData = [
  {
    title: 'Rainfall and Temperature Prediction',
    description: 'ML-based analysis for climate and agriculture forecasting. Developed machine learning models to predict rainfall patterns and temperature variations, supporting agricultural planning and climate analysis.',
    technologies: ['Machine Learning', 'Time Series', 'Climate Analysis', 'Python'],
    github: 'https://github.com/SarbajitPbappy/RainfallML',
    category: 'Machine Learning',
    gradient: 'from-blue-500 to-cyan-500',
    icon: 'Cloud',
    order: 0,
  },
  {
    title: 'Population Analysis with MySQL',
    description: 'Demographic and urbanization insights using advanced SQL queries. Analyzed large-scale population datasets to extract meaningful insights about demographic trends and urbanization patterns.',
    technologies: ['MySQL', 'SQL', 'Data Analysis', 'Database Design'],
    github: 'https://github.com/SarbajitPbappy/Project-ONE',
    category: 'Data Analysis',
    gradient: 'from-purple-500 to-pink-500',
    icon: 'Database',
    order: 1,
  },
  {
    title: 'Email Spam Classification',
    description: 'ML models for spam filtering using Random Forest and Decision Trees. Built and compared multiple machine learning algorithms to accurately classify emails as spam or legitimate messages.',
    technologies: ['Random Forest', 'Decision Trees', 'NLP', 'Classification'],
    github: 'https://github.com/SarbajitPbappy/Project-NOT',
    category: 'Machine Learning',
    gradient: 'from-green-500 to-emerald-500',
    icon: 'Mail',
    order: 2,
  },
  {
    title: 'Medical Image Classification Projects',
    description: 'Deep learning models for disease detection from medical images. Includes projects on skin disease classification, medical image analysis, and explainable AI implementations.',
    technologies: ['Deep Learning', 'CNN', 'Medical Imaging', 'TensorFlow', 'Keras'],
    github: 'https://github.com/SarbajitPbappy/Lyme-Disease',
    category: 'Deep Learning',
    gradient: 'from-red-500 to-rose-500',
    icon: 'Code',
    order: 3,
  },
  {
    title: 'Splitter – Expense Splitting & Personal Finance Tracker',
    description: 'Academic project developed using Flutter (Cupertino) and Firebase for group expense splitting and personal finance tracking. Includes trip and bachelor mess management, optimized settlement algorithms, real-time synchronization, analytics dashboards, meal tracking, and automated PDF report generation.',
    technologies: [
      'Flutter',
      'Dart',
      'Firebase',
      'Cloud Firestore',
      'Firebase Auth',
      'Cupertino UI',
      'Provider',
      'GoRouter',
      'PDF Generation'
    ],
    github: 'https://github.com/SarbajitPbappy/MAD-Project',
    category: 'Academic Project',
    gradient: 'from-emerald-500 to-teal-500',
    icon: 'Split',
    order: 4,
  },
]

// Complete Research Areas Data - Extracted from ResearchAndPublications.tsx
const researchAreasData = [
  {
    title: 'Deep Learning',
    description: 'Designing architectures for complex pattern recognition, focusing on hybrid models that blend multiple neural approaches.',
    technologies: ['CNN', 'Transfer Learning', 'Hybrid Models'],
    gradient: 'from-purple-500 to-indigo-500',
    icon: 'Brain',
    order: 0,
  },
  {
    title: 'Computer Vision',
    description: 'Image processing and visual pattern recognition for medical imaging, agricultural monitoring, and automated analysis.',
    technologies: ['Image Processing', 'OpenCV', 'Feature Extraction'],
    gradient: 'from-blue-500 to-cyan-500',
    icon: 'Eye',
    order: 1,
  },
  {
    title: 'Medical Image Analysis',
    description: 'AI-driven disease detection, diagnosis support, and treatment planning across varied imaging modalities.',
    technologies: ['Diagnostic AI', 'Healthcare ML', 'Disease Detection'],
    gradient: 'from-red-500 to-rose-500',
    icon: 'Microscope',
    order: 2,
  },
  {
    title: 'Agricultural Image Analysis',
    description: 'Computer vision for crop disease detection, plant health monitoring, and sustainable farming insights.',
    technologies: ['Agricultural AI', 'Crop Monitoring', 'Disease Classification'],
    gradient: 'from-green-500 to-emerald-500',
    icon: 'Leaf',
    order: 3,
  },
  {
    title: 'Explainable AI',
    description: 'Interpretability methods and visual explanations that make model decisions transparent and trustworthy.',
    technologies: ['XAI', 'Model Interpretability', 'Visualization'],
    gradient: 'from-amber-500 to-orange-500',
    icon: 'Sparkles',
    order: 4,
  },
  {
    title: 'Hybrid Deep Learning',
    description: 'Combining multiple deep learning approaches for stronger classification and detection performance.',
    technologies: ['Ensemble Learning', 'Architecture Design', 'Multi-Modal'],
    gradient: 'from-pink-500 to-rose-500',
    icon: 'Layers',
    order: 5,
  },
]

// Complete Courses Data - Extracted from Education.tsx (original hardcoded data)
const coursesData = [
  {
    title: 'Supervised Machine Learning: Regression and Classification',
    description: 'Instructor: Andrew Ng – Coursera, DeepLearning.AI (2023–2024)',
    verifyLink: 'https://coursera.org/verify/RYF6AW9BPQLN',
    order: 0,
  },
  {
    title: 'CSE Fundamental',
    description: 'Phitron.io (2022–2024). Includes DSA, OOP, DBMS, AWS, and ML foundations.',
    verifyLink: 'https://drive.google.com/file/d/1--Le7QE_IFJHKSGOUSexY25u8GXcPMDt/view?usp=sharing',
    order: 1,
  },
]

// Helper function to check if record exists and insert only if not exists
async function insertIfNotExists(table, records, uniqueField = 'title') {
  const results = []
  let inserted = 0
  let skipped = 0

  for (const record of records) {
    // Check if record already exists
    const { data: existing } = await supabase
      .from(table)
      .select('id')
      .eq(uniqueField, record[uniqueField])
      .limit(1)

    if (existing && existing.length > 0) {
      skipped++
      continue
    }

    // Insert if doesn't exist
    const { data, error } = await supabase
      .from(table)
      .insert(record)
      .select()
      .single()

    if (error) {
      console.error(`Error inserting ${record[uniqueField]}:`, error.message)
    } else {
      results.push(data)
      inserted++
    }
  }

  return { inserted, skipped, results }
}

async function migrateData() {
  console.log('🚀 Starting data migration...\n')
  console.log(`📊 Data to migrate:`)
  console.log(`   - Education: ${educationData.length} entries`)
  console.log(`   - Publications: ${publicationsData.length} entries`)
  console.log(`   - Work Experience: ${workExperienceData.length} entries`)
  console.log(`   - Projects: ${projectsData.length} entries`)
  console.log(`   - Research Areas: ${researchAreasData.length} entries`)
  console.log(`   - Courses: ${coursesData.length} entries`)
  console.log('')
  console.log('🔄 Checking for existing records to avoid duplicates...\n')

  try {
    // Migrate Education (check by institution + degree/program)
    if (educationData.length > 0) {
      const results = []
      let inserted = 0
      let skipped = 0

      for (const edu of educationData) {
        const { data: existing } = await supabase
          .from('education')
          .select('id')
          .eq('institution', edu.institution)
          .eq(edu.degree ? 'degree' : 'program', edu.degree || edu.program)
          .limit(1)

        if (existing && existing.length > 0) {
          skipped++
          continue
        }

        const { data, error } = await supabase
          .from('education')
          .insert(edu)
          .select()
          .single()

        if (error) {
          console.error(`Error inserting education:`, error.message)
        } else {
          results.push(data)
          inserted++
        }
      }

      if (inserted > 0) {
        console.log(`✅ Migrated ${inserted} education entries${skipped > 0 ? ` (${skipped} already existed, skipped)` : ''}`)
      } else if (skipped > 0) {
        console.log(`⏭️  All ${skipped} education entries already exist, skipped`)
      }
    }

    // Migrate Publications (check by title)
    if (publicationsData.length > 0) {
      const { inserted, skipped } = await insertIfNotExists('publications', publicationsData, 'title')
      if (inserted > 0) {
        console.log(`✅ Migrated ${inserted} publications${skipped > 0 ? ` (${skipped} already existed, skipped)` : ''}`)
      } else if (skipped > 0) {
        console.log(`⏭️  All ${skipped} publications already exist, skipped`)
      }
    }

    // Migrate Work Experience (check by title + organization)
    if (workExperienceData.length > 0) {
      const results = []
      let inserted = 0
      let skipped = 0

      for (const work of workExperienceData) {
        const { data: existing } = await supabase
          .from('work_experience')
          .select('id')
          .eq('title', work.title)
          .eq('organization', work.organization)
          .limit(1)

        if (existing && existing.length > 0) {
          skipped++
          continue
        }

        const { data, error } = await supabase
          .from('work_experience')
          .insert(work)
          .select()
          .single()

        if (error) {
          console.error(`Error inserting work experience:`, error.message)
        } else {
          results.push(data)
          inserted++
        }
      }

      if (inserted > 0) {
        console.log(`✅ Migrated ${inserted} work experience entries${skipped > 0 ? ` (${skipped} already existed, skipped)` : ''}`)
      } else if (skipped > 0) {
        console.log(`⏭️  All ${skipped} work experience entries already exist, skipped`)
      }
    }

    // Migrate Projects (check by title)
    if (projectsData.length > 0) {
      const { inserted, skipped } = await insertIfNotExists('projects', projectsData, 'title')
      if (inserted > 0) {
        console.log(`✅ Migrated ${inserted} projects${skipped > 0 ? ` (${skipped} already existed, skipped)` : ''}`)
      } else if (skipped > 0) {
        console.log(`⏭️  All ${skipped} projects already exist, skipped`)
      }
    }

    // Migrate Research Areas (check by title)
    if (researchAreasData.length > 0) {
      const { inserted, skipped } = await insertIfNotExists('research_areas', researchAreasData, 'title')
      if (inserted > 0) {
        console.log(`✅ Migrated ${inserted} research areas${skipped > 0 ? ` (${skipped} already existed, skipped)` : ''}`)
      } else if (skipped > 0) {
        console.log(`⏭️  All ${skipped} research areas already exist, skipped`)
      }
    }

    // Migrate Courses (check by title)
    if (coursesData.length > 0) {
      const { inserted, skipped } = await insertIfNotExists('courses', coursesData, 'title')
      if (inserted > 0) {
        console.log(`✅ Migrated ${inserted} courses${skipped > 0 ? ` (${skipped} already existed, skipped)` : ''}`)
      } else if (skipped > 0) {
        console.log(`⏭️  All ${skipped} courses already exist, skipped`)
      }
    }

    console.log('\n✨ Migration complete!')
    console.log('\n💡 Tip: You can safely run this script multiple times - duplicates are automatically skipped.')
    console.log('💡 You can now use the admin panel at /admin to manage your content.')
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  }
}

migrateData()

