/**
 * Central Lucide Icon Registry
 * Next.js 14 / TypeScript / Vercel safe
 */

import type { LucideIcon } from 'lucide-react'

import {
  /* UI */
  Home, Menu, X, Search, Filter, Grid, List, Settings, Cog,
  ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
  ArrowLeft, ArrowRight, ArrowUp, ArrowDown,

  /* Actions */
  Plus, Minus, Check, Edit, Trash, Trash2, Save,
  Download, Upload, Share, Copy, Clipboard,

  /* Status */
  AlertCircle, AlertTriangle, Info, HelpCircle,
  CheckCircle, XCircle, Eye, EyeOff, Lock, Unlock, Shield, Key,

  /* Social */
  Github, Linkedin, Twitter, Facebook, Instagram, Youtube, Globe,
  Mail, Phone, MessageSquare, Send, Bell,

  /* Users */
  User, Users, UserPlus, UserMinus, UserCheck,

  /* Files */
  File, FileText, FileCode, Folder, FolderOpen, Archive, Inbox,

  /* Business */
  Briefcase, Building, Store, ShoppingCart, ShoppingBag,
  Package, Box, Layers,
  DollarSign, CreditCard, Wallet, Receipt,

  /* Tech / Dev */
  Code, Code2, Terminal, Command,
  Monitor, Laptop, Smartphone, Tablet,
  Cpu, Server, Database, HardDrive,
  Wifi, Bluetooth, Radio,
  GitBranch, GitCommit, GitMerge, GitPullRequest,

  /* Charts */
  BarChart, BarChart3, PieChart, LineChart, TrendingUp,

  /* Media */
  Image, Video, Music, Camera, Film, Mic, Headphones,

  /* Time */
  Calendar, Clock, Timer,

  /* Location */
  Map, MapPin, Compass, Navigation,

  /* Nature */
  Sun, Moon, Cloud, CloudRain, Wind, Flame, Leaf,

  /* Education */
  Book, BookOpen, Library, School, GraduationCap,

  /* Misc */
  Heart, Star, Coffee, Lightbulb, Brain, Sparkles, Wand2,
} from 'lucide-react'

/* ======================================================
   EXPLICIT EXPORTS (FIXES YOUR BUILD ERROR)
====================================================== */

export {
  Home, Menu, X, Search, Filter, Grid, List, Settings,
  ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
  ArrowLeft, ArrowRight, ArrowUp, ArrowDown,

  Plus, Minus, Check, Edit, Trash, Save,
  Download, Upload, Share,

  Github, Linkedin, Twitter, Facebook, Instagram, Youtube, Globe,
  Mail, Phone,

  User, Users,

  File, FileText, Folder,

  Briefcase, Store, ShoppingCart,

  Code, Code2, Terminal,

  Calendar, Clock,

  Book, GraduationCap,
}

/* ======================================================
   DYNAMIC ICON MAP (CMS / DB / JSON SAFE)
====================================================== */

export const iconMap: Record<string, LucideIcon> = {
  /* Core */
  Home, Menu, X, Search, Filter, Grid, List, Settings, Cog,
  ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
  ArrowLeft, ArrowRight, ArrowUp, ArrowDown,

  /* Actions */
  Plus, Minus, Check, Edit, Trash, Trash2, Save,
  Download, Upload, Share, Copy, Clipboard,

  /* Status */
  AlertCircle, AlertTriangle, Info, HelpCircle,
  CheckCircle, XCircle, Eye, EyeOff,
  Lock, Unlock, Shield, Key,

  /* Social */
  Github, Linkedin, Twitter, Facebook, Instagram, Youtube, Globe,
  Mail, Phone, MessageSquare, Send, Bell,

  /* Users */
  User, Users, UserPlus, UserMinus, UserCheck,

  /* Files */
  File, FileText, FileCode,
  Folder, FolderOpen, Archive, Inbox,

  /* Business */
  Briefcase, Building, Store,
  ShoppingCart, ShoppingBag,
  Package, Box, Layers,
  DollarSign, CreditCard, Wallet, Receipt,

  /* Tech */
  Code, Code2, Terminal, Command,
  Monitor, Laptop, Smartphone, Tablet,
  Cpu, Server, Database, HardDrive,
  Wifi, Bluetooth, Radio,
  GitBranch, GitCommit, GitMerge, GitPullRequest,

  /* Charts */
  BarChart, BarChart3, PieChart, LineChart, TrendingUp,

  /* Media */
  Image, Video, Music, Camera, Film, Mic, Headphones,

  /* Time */
  Calendar, Clock, Timer,

  /* Location */
  Map, MapPin, Compass, Navigation,

  /* Nature */
  Sun, Moon, Cloud, CloudRain, Wind, Flame, Leaf,

  /* Education */
  Book, BookOpen, Library, School, GraduationCap,

  /* Misc */
  Heart, Star, Coffee, Lightbulb, Brain, Sparkles, Wand2,

  /* ==================================================
     PROGRAMMING LANGUAGE ALIASES (REQUESTED)
  ================================================== */

  Python: Code,
  PythonIcon: Code,

  C: Cpu,
  CIcon: Cpu,

  CPP: Code2,
  Cpp: Code2,
  CPlusPlus: Code2,

  Java: Coffee,
  JavaIcon: Coffee,

  JavaScript: Code,
  JS: Code,

  TypeScript: Code2,
  TS: Code2,

  Flutter: Smartphone,
  FlutterIcon: Smartphone,

  Firebase: Database,
  FirebaseIcon: Database,

  Docker: Package,
  DockerIcon: Package,

  Linux: Terminal,
  LinuxIcon: Terminal,

  React: Code,
  NextJS: Code,
}

/* ======================================================
   HELPERS
====================================================== */

export function getIcon(name: string): LucideIcon | null {
  return iconMap[name] ?? null
}

export function hasIcon(name: string): boolean {
  return name in iconMap
}
