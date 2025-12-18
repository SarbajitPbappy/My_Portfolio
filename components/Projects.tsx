'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Github, Database, Mail, Cloud, Code, Sparkles, Split,
  ShoppingBag, Store, Briefcase, ShoppingCart,
  Package, Box, Layers, Server, Globe, Monitor,
  Smartphone, Tablet, Laptop, Cpu, HardDrive,
  Zap, Rocket, Target, Award, Star, Heart,
  Music, Video, Image, FileText, Book, GraduationCap,
  Building, Home, Car, Plane, Train, Bike,
  Gamepad2, Palette, Camera, Mic, Headphones,
  Wrench, Settings, Cog, Lock, Key, Shield,
  Bell, MessageSquare, Phone, Users, User,
  Search, Filter, Grid, List, Menu, X,
  Check, Plus, Minus, Edit, Trash, Save,
  Download, Upload, Share, ExternalLink,
  Eye, EyeOff, ThumbsUp,
  TrendingUp, BarChart, PieChart, LineChart,
  DollarSign, CreditCard, Wallet, Receipt,
  Calendar, Clock, Timer, AlarmClock,
  Map, MapPin, Navigation, Compass, Flag,
  Sun, Moon, CloudRain, CloudSnow, Wind,
  Flame, Droplet, Leaf, Flower, Trees,
  Bug, Code2, Terminal, Command, GitBranch,
  GitCommit, GitMerge, GitPullRequest, GitCompare,
  Folder, FolderOpen, File, FileCode, FileImage,
  FileVideo, FileAudio, FileSpreadsheet,
  Archive, FolderPlus, FilePlus, FolderMinus, FileMinus,
  Scissors, Copy, Clipboard, ClipboardCheck, ClipboardCopy,
  ClipboardList, ClipboardPaste, ClipboardX, ClipboardEdit,
  BookOpen, BookMarked, BookText, Library, School,
  Trophy, Medal, Badge,
  Brain, Lightbulb
} from 'lucide-react'
import Link from 'next/link'
import type { Project } from '@/lib/types'

const fadeIn = {
  initial: { opacity: 0, y: 12 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.35, ease: 'easeOut' },
}

// Icon map with all common Lucide icons
const iconMap: Record<string, any> = {
  // Original icons
  Cloud,
  Database,
  Mail,
  Code,
  Split,
  Github,
  // Shopping/Bag icons - Map common names
  Shop: Store,
  ShoppingBag,
  Bag: ShoppingBag, // Map "Bag" to ShoppingBag
  Store,
  ShoppingCart,
  // Business/Work icons
  Briefcase,
  Package,
  Box,
  // Tech icons
  Server,
  Globe,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  Cpu,
  HardDrive,
  Layers,
  // Action icons
  Zap,
  Rocket,
  Target,
  Award,
  Star,
  Heart,
  // Media icons
  Music,
  Video,
  Image,
  Camera,
  Mic,
  Headphones,
  // Creative icons
  Palette,
  Gamepad2,
  // Tools icons
  Wrench,
  Settings,
  Cog,
  // Security icons
  Lock,
  Key,
  Shield,
  // Communication icons
  Bell,
  MessageSquare,
  Phone,
  Users,
  User,
  // UI icons
  Search,
  Filter,
  Grid,
  List,
  Menu,
  X,
  Check,
  Plus,
  Minus,
  Edit,
  Trash,
  Save,
  Download,
  Upload,
  Share,
  ExternalLink,
  Eye,
  EyeOff,
  ThumbsUp,
  // Chart icons
  TrendingUp,
  BarChart,
  PieChart,
  LineChart,
  // Finance icons
  DollarSign,
  CreditCard,
  Wallet,
  Receipt,
  // Time icons
  Calendar,
  Clock,
  Timer,
  AlarmClock,
  // Location icons
  Map,
  MapPin,
  Navigation,
  Compass,
  Flag,
  // Weather icons
  Sun,
  Moon,
  CloudRain,
  CloudSnow,
  Wind,
  // Nature icons
  Flame,
  Droplet,
  Leaf,
  Flower,
  Trees, // Note: Lucide uses "Trees" not "Tree"
  // Development icons
  Bug,
  Code2,
  Terminal,
  Command,
  GitBranch,
  GitCommit,
  GitMerge,
  GitPullRequest,
  GitCompare,
  // File icons
  Folder,
  FolderOpen,
  File,
  FileCode,
  FileImage,
  FileVideo,
  FileAudio,
  FileSpreadsheet,
  FileText,
  Archive,
  FolderPlus,
  FilePlus,
  FolderMinus,
  FileMinus,
  // Clipboard icons
  Scissors,
  Copy,
  Clipboard,
  ClipboardCheck,
  ClipboardCopy,
  ClipboardList,
  ClipboardPaste,
  ClipboardX,
  ClipboardEdit,
  // Education icons
  BookOpen,
  BookMarked,
  BookText,
  Library,
  School,
  GraduationCap,
  Trophy,
  Medal,
  Badge,
  // Brain/Thinking icons
  Brain,
  Lightbulb,
  Sparkles,
}

// Fallback projects
const fallbackProjects: Project[] = [
  {
    icon: 'Cloud',
    title: 'Rainfall and Temperature Prediction',
    description: 'ML-based analysis for climate and agriculture forecasting. Developed machine learning models to predict rainfall patterns and temperature variations, supporting agricultural planning and climate analysis.',
    technologies: ['Machine Learning', 'Time Series', 'Climate Analysis', 'Python'],
    github: 'https://github.com/SarbajitPbappy/RainfallML',
    category: 'Machine Learning',
    gradient: 'from-blue-500 to-cyan-500',
    order: 0,
  },
  {
    icon: 'Database',
    title: 'Population Analysis with MySQL',
    description: 'Demographic and urbanization insights using advanced SQL queries. Analyzed large-scale population datasets to extract meaningful insights about demographic trends and urbanization patterns.',
    technologies: ['MySQL', 'SQL', 'Data Analysis', 'Database Design'],
    github: 'https://github.com/SarbajitPbappy/Project-ONE',
    category: 'Data Analysis',
    gradient: 'from-purple-500 to-pink-500',
    order: 1,
  },
  {
    icon: 'Mail',
    title: 'Email Spam Classification',
    description: 'ML models for spam filtering using Random Forest and Decision Trees. Built and compared multiple machine learning algorithms to accurately classify emails as spam or legitimate messages.',
    technologies: ['Random Forest', 'Decision Trees', 'NLP', 'Classification'],
    github: 'https://github.com/SarbajitPbappy/Project-NOT',
    category: 'Machine Learning',
    gradient: 'from-green-500 to-emerald-500',
    order: 2,
  },
  {
    icon: 'Code',
    title: 'Medical Image Classification Projects',
    description: 'Deep learning models for disease detection from medical images. Includes projects on skin disease classification, medical image analysis, and explainable AI implementations.',
    technologies: ['Deep Learning', 'CNN', 'Medical Imaging', 'TensorFlow', 'Keras'],
    github: 'https://github.com/SarbajitPbappy/Lyme-Disease',
    category: 'Deep Learning',
    gradient: 'from-red-500 to-rose-500',
    order: 3,
  },
  {
    icon: 'Split',
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
    order: 4,
  },
]

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProjects()
    
    const handleUpdate = () => {
      fetchProjects()
    }
    window.addEventListener('content-updated', handleUpdate)
    
    return () => {
      window.removeEventListener('content-updated', handleUpdate)
    }
  }, [])

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects')
      const data = await res.json()
      setProjects(data && data.length > 0 ? data : fallbackProjects)
    } catch (error) {
      console.error('Error fetching projects:', error)
      setProjects(fallbackProjects)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <section id="projects" className="section-container bg-white">
        <div className="text-center py-12 text-gray-600">Loading...</div>
      </section>
    )
  }
  return (
    <section id="projects" className="section-container bg-white relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-80 h-80 bg-primary-200/12 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary-300/12 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        <motion.div {...fadeIn} className="text-center mb-12">
          <h2 className="text-5xl md:text-6xl font-bold mb-4">
            <span className="gradient-text">Projects</span>
          </h2>
          <p className="text-lg text-gray-600">
            Showcasing my work in machine learning, deep learning, and data analysis
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, idx) => (
            <motion.div
              key={project.title}
              {...fadeIn}
              transition={{ ...fadeIn.transition, delay: idx * 0.05 }}
              className="group relative bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all hover:-translate-y-1"
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${project.gradient} flex items-center justify-center mb-4 text-white shadow-lg`}>
                {(() => {
                  const Icon = project.icon && iconMap[project.icon] ? iconMap[project.icon] : Code
                  return <Icon className="w-7 h-7" />
                })()}
              </div>

              <div className="flex items-start justify-between gap-3 mb-3">
                <h3 className="text-xl font-bold text-gray-900 leading-tight flex-1">{project.title}</h3>
                <span className={`px-3 py-1 bg-gradient-to-r ${project.gradient} text-white rounded-full text-xs font-semibold whitespace-nowrap`}>
                  {project.category}
                </span>
              </div>

              <p className="text-gray-600 mb-4 leading-relaxed text-sm">{project.description}</p>

              <div className="flex flex-wrap gap-2 mb-4">
                {project.technologies.map((tech) => (
                  <span
                    key={tech}
                    className="px-3 py-1.5 bg-gray-50 text-gray-700 rounded-lg text-xs font-medium border border-gray-200"
                  >
                    {tech}
                  </span>
                ))}
              </div>

              {project.github && (
                <div className="flex gap-2 mt-auto pt-4 border-t border-gray-100">
                  <Link
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold text-sm"
                  >
                    <Github className="w-5 h-5" />
                    <span>View on GitHub</span>
                  </Link>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        <motion.div {...fadeIn} className="mt-12 text-center">
          <Link
            href="https://github.com/SarbajitPbappy"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-gradient-to-r from-primary-600 to-primary-500 text-white px-8 py-4 rounded-xl hover:from-primary-700 hover:to-primary-600 transition-all font-semibold shadow-lg"
          >
            <Github className="w-5 h-5" />
            <span>View All Projects on GitHub</span>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
