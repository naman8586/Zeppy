// ============================================
// FILE: src/lib/constants.js
// Application Constants with Tactical Theme
// ============================================

export const APP_CONFIG = {
  NAME: 'ZAPPY',
  VERSION: '2.0.0',
  TAGLINE: 'Elite Protocol for Vendor Event Execution',
  THEME: 'tactical-noir',
};

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// ============================================
// EVENT STATUS
// ============================================
export const EVENT_STATUS = {
  PENDING: 'pending',
  CHECKED_IN: 'checked_in',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

// Tactical Status Labels
export const EVENT_STATUS_LABELS = {
  [EVENT_STATUS.PENDING]: 'Standby',
  [EVENT_STATUS.CHECKED_IN]: 'On-Site',
  [EVENT_STATUS.IN_PROGRESS]: 'Active Mission',
  [EVENT_STATUS.COMPLETED]: 'Mission Complete',
  [EVENT_STATUS.CANCELLED]: 'Abort',
};

// Glassmorphism Status Styles
export const EVENT_STATUS_STYLES = {
  [EVENT_STATUS.PENDING]: 'border-zinc-800 bg-zinc-900/50 text-zinc-400',
  [EVENT_STATUS.CHECKED_IN]: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
  [EVENT_STATUS.IN_PROGRESS]: 'border-purple-500/30 bg-purple-500/10 text-purple-400',
  [EVENT_STATUS.COMPLETED]: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
  [EVENT_STATUS.CANCELLED]: 'border-red-500/30 bg-red-500/10 text-red-400',
};

// Status Icons (lucide-react)
export const EVENT_STATUS_ICONS = {
  [EVENT_STATUS.PENDING]: 'Clock',
  [EVENT_STATUS.CHECKED_IN]: 'MapPin',
  [EVENT_STATUS.IN_PROGRESS]: 'Zap',
  [EVENT_STATUS.COMPLETED]: 'CheckCircle',
  [EVENT_STATUS.CANCELLED]: 'XCircle',
};

// ============================================
// OTP TYPES
// ============================================
export const OTP_TYPE = {
  EVENT_START: 'event_start',
  EVENT_COMPLETION: 'event_completion',
};

export const OTP_LABELS = {
  [OTP_TYPE.EVENT_START]: 'Mission Launch Code',
  [OTP_TYPE.EVENT_COMPLETION]: 'Mission Complete Code',
};

// ============================================
// PROGRESS TYPES
// ============================================
export const PROGRESS_TYPE = {
  PRE_SETUP: 'pre_setup',
  POST_SETUP: 'post_setup',
};

export const PROGRESS_LABELS = {
  [PROGRESS_TYPE.PRE_SETUP]: 'Initial Deployment',
  [PROGRESS_TYPE.POST_SETUP]: 'Final Configuration',
};

// ============================================
// USER ROLES
// ============================================
export const USER_ROLES = {
  VENDOR: 'vendor',
  CUSTOMER: 'customer',
  ADMIN: 'admin',
};

export const ROLE_LABELS = {
  [USER_ROLES.VENDOR]: 'Field Operator',
  [USER_ROLES.CUSTOMER]: 'Mission Command',
  [USER_ROLES.ADMIN]: 'System Admin',
};

// ============================================
// MEDIA CONFIGURATION
// ============================================
export const MEDIA_CONFIG = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  MAX_IMAGES_PER_UPLOAD: 10,
};

// ============================================
// VALIDATION RULES
// ============================================
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 6,
  OTP_LENGTH: 6,
  PHONE_PATTERN: /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/,
  EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
};

// ============================================
// ROUTES
// ============================================
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  VENDOR_DASHBOARD: '/vendor/dashboard',
  CUSTOMER_DASHBOARD: '/customer/dashboard',
  EVENT_DETAILS: (id) => `/vendor/events/${id}`,
  CHECK_IN: (id) => `/vendor/check-in/${id}`,
  PROGRESS: (id) => `/vendor/progress/${id}`,
  VERIFY: (id) => `/customer/verify/${id}`,
};

// ============================================
// ANIMATION VARIANTS (for framer-motion)
// ============================================
export const ANIMATION_VARIANTS = {
  fadeIn: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },
  slideIn: {
    initial: { x: -20, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: 20, opacity: 0 },
  },
  scale: {
    initial: { scale: 0.9, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.9, opacity: 0 },
  },
};