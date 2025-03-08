// Color Theme Constants
export const COLORS = {
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
    950: '#082f49',
  },
  secondary: {
    50: '#f5f3ff',
    100: '#ede9fe',
    200: '#ddd6fe',
    300: '#c4b5fd',
    400: '#a78bfa',
    500: '#8b5cf6',
    600: '#7c3aed',
    700: '#6d28d9',
    800: '#5b21b6',
    900: '#4c1d95',
    950: '#2e1065',
  },
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
    950: '#030712',
  },
  success: '#10b981',
  error: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
};

// Gradients
export const GRADIENTS = {
  primary: 'linear-gradient(to right, #0ea5e9, #7c3aed)',
  subtle: 'linear-gradient(to right, #f0f9ff, #f5f3ff)',
  grayLight: 'linear-gradient(to right, #f9fafb, #f3f4f6)',
  card: 'linear-gradient(to bottom right, #ffffff, #f5f3ff)',
  buttonHover: 'linear-gradient(to right, #0284c7, #6d28d9)',
};

// Application Process Steps
export const APPLICATION_STEPS = [
  { id: 'personal', title: 'Personal Information' },
  { id: 'loan', title: 'Loan Details' },
  { id: 'terms', title: 'Terms & Conditions' },
  { id: 'review', title: 'Review & Submit' },
];

// Loan Types
export const LOAN_TYPES = [
  { value: 'personal', label: 'Personal Loan' },
  { value: 'home', label: 'Home Loan' },
  { value: 'auto', label: 'Auto Loan' },
  { value: 'education', label: 'Education Loan' },
  { value: 'business', label: 'Business Loan' },
];

// Loan Terms (in months)
export const LOAN_TERMS = [
  { value: '12', label: '12 months' },
  { value: '24', label: '24 months' },
  { value: '36', label: '36 months' },
  { value: '48', label: '48 months' },
  { value: '60', label: '60 months' },
];

// Application Status Types
export const APPLICATION_STATUS = {
  PENDING: 'pending',
  REVIEW: 'under_review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CONTRACTED: 'contracted',
  DISBURSED: 'disbursed',
};

// Navigation Routes
export const ROUTES = {
  HOME: '/',
  APPLICATION: '/application',
  APPLY: '/apply',
  DASHBOARD: '/dashboard',
  COUNSELING: '/counseling',
  LOGIN: '/login',
  REGISTER: '/register',
  TERMS: '/terms',
  JUDGMENTS: '/judgments',
  REPAYMENTS: '/repayments',
};

// API Endpoints
export const API_ENDPOINTS = {
  COUNSELS: '/api/counsels',
  TERMS: '/api/terms',
  APPLICATIONS: '/api/applications',
  JUDGMENTS: '/api/judgments',
  INTERNAL: '/api/internal/applications',
};