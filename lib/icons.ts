/**
 * Lucide Icon Registry
 * ------------------------------------------------------------
 * - Centralized icon imports
 * - Static exports for tree-shaking
 * - Dynamic lookup by string
 * - Alias support
 * - Strict TypeScript safety
 * ------------------------------------------------------------
 */

import type { LucideIcon } from 'lucide-react'

import {
  /* =========================
     Navigation & UI
  ========================= */
  Home, Menu, X, Search, Filter, Grid, List, Settings, Cog, Wrench,
  ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
  ChevronsDown, ChevronsUp,
  ArrowLeft, ArrowRight, ArrowUp, ArrowDown, ArrowUpDown,
  Plus, Minus, Check, Circle, Square, Triangle,

  /* =========================
     Actions & Status
  ========================= */
  Edit, Trash, Trash2, Save, Download, Upload, Share, Copy, Clipboard,
  Eye, EyeOff, Lock, Unlock, Key, Shield,
  AlertCircle, AlertTriangle, Info, HelpCircle,
  CheckCircle, CheckCircle2, XCircle,

  /* =========================
     Social & Communication
  ========================= */
  Mail, Phone, MessageSquare, MessageCircle, Send,
  Bell, BellOff,
  Users, User, UserPlus, UserMinus, UserCheck, UserX,
  Github, Linkedin, Twitter, Facebook, Instagram, Youtube, Globe,

  /* =========================
     Files & Documents
  ========================= */
  File, FileText, FileCode, FileImage, FileVideo, FileAudio, FileSpreadsheet,
  Folder, FolderOpen, FolderPlus, FolderMinus,
  Archive, Book, BookOpen, BookMarked, BookText,
  Library, School, GraduationCap, Inbox,

  /* =========================
     Business & Finance
  ========================= */
  Briefcase, Building, Building2, Store,
  ShoppingBag, ShoppingCart,
  Package, Box, Layers,
  Server, Database, HardDrive, Cpu,
  DollarSign, CreditCard, Wallet, Receipt,
  TrendingUp, BarChart, BarChart3, PieChart, LineChart,
  Activity, Target, Award, Trophy, Medal, Badge, Star,

  /* =========================
     Technology
  ========================= */
  Code, Code2, Terminal, Command,
  Monitor, Laptop, Smartphone, Tablet,
  Wifi, Radio, Bluetooth,
  Zap, Rocket,
  GitBranch, GitCommit, GitMerge, GitPullRequest, GitCompare,
  Network, Fingerprint, Scan,

  /* =========================
     Media & Creative
  ========================= */
  Image, Video, Music, Mic, Headphones,
  Camera, Film, Palette, Brush,
  Scissors, Crop, Maximize, Minimize,
  Move, RotateCw, RotateCcw,
  Sparkles, Wand2,

  /* =========================
     Time & Calendar
  ========================= */
  Calendar, Clock, Timer, AlarmClock, Watch,
  CalendarDays, CalendarCheck,

  /* =========================
     Location & Travel
  ========================= */
  Map, MapPin, Navigation, Navigation2,
  Compass, Flag, Plane, Car, Train, Bike, Ship,

  /* =========================
     Nature & Weather
  ========================= */
  Sun, Moon, Cloud, CloudRain, CloudSnow, CloudLightning,
  Wind, Droplet, Flame, Leaf, Flower, Trees, Mountain, Waves,

  /* =========================
     Layout & Panels
  ========================= */
  Layout, LayoutGrid, LayoutList,
  Sidebar, PanelLeft, PanelRight,
  Columns, Rows, Split,
  AlignLeft, AlignRight, AlignCenter,

  /* =========================
     Miscellaneous
  ========================= */
  Heart, ThumbsUp, ThumbsDown, Smile, Frown,
  Coffee, Utensils, Gamepad2, Puzzle, Dice1,
  ExternalLink, Link, Unlink,
  Lightbulb, Brain,
} from 'lucide-react'

/* ============================================================
   STATIC EXPORTS (for direct imports & tree-shaking)
============================================================ */

export {
  Home, Menu, X, Search, Filter, Grid, List, Settings,
  ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
  ArrowLeft, ArrowRight, ArrowUp, ArrowDown,
  Plus, Minus, Check,

  Edit, Trash, Save, Download, Upload, Share,

  Mail, Phone, Users, User,

  File, Folder, Book, GraduationCap,

  Briefcase, Store, ShoppingCart,

  Code, Terminal, Monitor,

  Calendar, Clock,

  Map, Sun, Moon,
}

/* ============================================================
   DYNAMIC ICON MAP
============================================================ */

export const iconMap: Record<string, LucideIcon> = {
  /* Core */
  Home, Menu, X, Search, Filter, Grid, List, Settings, Cog, Wrench,
  ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
  ChevronsDown, ChevronsUp,
  ArrowLeft, ArrowRight, ArrowUp, ArrowDown, ArrowUpDown,
  Plus, Minus, Check, Circle, Square, Triangle,

  /* Actions */
  Edit, Trash, Trash2, Save, Download, Upload, Share, Copy, Clipboard,
  Eye, EyeOff, Lock, Unlock, Key, Shield,
  AlertCircle, AlertTriangle, Info, HelpCircle,
  CheckCircle, CheckCircle2, XCircle,

  /* Social */
  Mail, Phone, MessageSquare, MessageCircle, Send,
  Bell, BellOff,
  Users, User, UserPlus, UserMinus, UserCheck, UserX,
  Github, Linkedin, Twitter, Facebook, Instagram, Youtube, Globe,

  /* Files */
  File, FileText, FileCode, FileImage, FileVideo, FileAudio, FileSpreadsheet,
  Folder, FolderOpen, FolderPlus, FolderMinus,
  Archive, Book, BookOpen, BookMarked, BookText,
  Library, School, GraduationCap, Inbox,

  /* Business */
  Briefcase, Building, Building2, Store,
  ShoppingBag, ShoppingCart,
  Package, Box, Layers,
  Server, Database, HardDrive, Cpu,
  DollarSign, CreditCard, Wallet, Receipt,
  TrendingUp, BarChart, BarChart3, PieChart, LineChart,
  Activity, Target, Award, Trophy, Medal, Badge, Star,

  /* Technology */
  Code, Code2, Terminal, Command,
  Monitor, Laptop, Smartphone, Tablet,
  Wifi, Radio, Bluetooth,
  Zap, Rocket,
  GitBranch, GitCommit, GitMerge, GitPullRequest, GitCompare,
  Network, Fingerprint, Scan,

  /* Media */
  Image, Video, Music, Mic, Headphones,
  Camera, Film, Palette, Brush,
  Scissors, Crop, Maximize, Minimize,
  Move, RotateCw, RotateCcw,
  Sparkles, Wand2,

  /* Time */
  Calendar, Clock, Timer, AlarmClock, Watch,
  CalendarDays, CalendarCheck,

  /* Location */
  Map, MapPin, Navigation, Navigation2,
  Compass, Flag, Plane, Car, Train, Bike, Ship,

  /* Nature */
  Sun, Moon, Cloud, CloudRain, CloudSnow, CloudLightning,
  Wind, Droplet, Flame, Leaf, Flower, Trees, Mountain, Waves,

  /* Layout */
  Layout, LayoutGrid, LayoutList,
  Sidebar, PanelLeft, PanelRight,
  Columns, Rows, Split,
  AlignLeft, AlignRight, AlignCenter,

  /* Misc */
  Heart, ThumbsUp, ThumbsDown, Smile, Frown,
  Coffee, Utensils, Gamepad2, Puzzle, Dice1,
  ExternalLink, Link, Unlink,
  Lightbulb, Brain,

  /* ==================================================
     ALIASES (semantic + legacy + CMS friendly)
  ================================================== */
  Shop: Store,
  Cart: ShoppingCart,
  Bag: ShoppingBag,
  Email: Mail,
  Envelope: Mail,
  People: Users,
  Group: Users,
  Document: FileText,
  CodeIcon: Code,
  TerminalIcon: Terminal,
  ServerIcon: Server,
  DatabaseIcon: Database,
  CloudIcon: Cloud,
  ImageIcon: Image,
  VideoIcon: Video,
  MusicIcon: Music,
  CameraIcon: Camera,
  HomeIcon: Home,
  MenuIcon: Menu,
  SettingsIcon: Settings,
  EditIcon: Edit,
  TrashIcon: Trash,
  SaveIcon: Save,
  DownloadIcon: Download,
  UploadIcon: Upload,
  ShareIcon: Share,
  LockIcon: Lock,
  ShieldIcon: Shield,
  AlertIcon: AlertCircle,
  InfoIcon: Info,
  HelpIcon: HelpCircle,
  CalendarIcon: Calendar,
  ClockIcon: Clock,
  MapIcon: Map,
  SunIcon: Sun,
  MoonIcon: Moon,
  MagicIcon: Wand2,
  WandIcon: Wand2,
}

/* ============================================================
   HELPERS
============================================================ */

/**
 * Get icon by name (safe)
 */
export function getIcon(name: string): LucideIcon | null {
  return iconMap[name] ?? null
}

/**
 * Check icon existence
 */
export function hasIcon(name: string): boolean {
  return name in iconMap
}
