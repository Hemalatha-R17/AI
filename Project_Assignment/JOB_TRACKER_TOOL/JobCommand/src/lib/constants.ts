import type { Status, Priority, JobType, Currency } from '../types';

export const STATUSES: Status[] = [
  'Saved', 'Submitted', 'Phone Screen', 'Interview',
  'Offer', 'Accepted', 'Rejected', 'Withdrawn',
];

export const STATUS_COLORS: Record<Status, string> = {
  'Saved':        '#64748b',
  'Submitted':    '#2563eb',
  'Phone Screen': '#f59e0b',
  'Interview':    '#a855f7',
  'Offer':        '#10b981',
  'Accepted':     '#059669',
  'Rejected':     '#ef4444',
  'Withdrawn':    '#6b7280',
};

export const PRIORITIES: Priority[] = ['Urgent', 'High', 'Medium', 'Low'];

export const PRIORITY_ICONS: Record<Priority, string> = {
  Urgent: '🔥', High: '🔴', Medium: '🟡', Low: '🟢',
};

export const JOB_TYPES: JobType[] = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'];

export const CURRENCIES: Currency[] = ['INR', 'USD', 'GBP', 'EUR', 'CAD', 'AUD', 'SGD'];

export const SOURCES = [
  'LinkedIn', 'Indeed', 'Naukri', 'Glassdoor', 'Monster',
  'AngelList / Wellfound', 'Company Website', 'Referral',
  'Job Fair', 'Recruiter', 'GitHub Jobs', 'Other',
];

export const CONTACT_ROLES = ['Recruiter', 'HR', 'Hiring Manager', 'Referrer'];

export const INTERVIEW_ROUNDS = ['Phone Screen', 'Round 1', 'Round 2', 'Final', 'Panel'];

export const STATUS_ORDER: Record<Status, number> = {
  'Saved': 0, 'Submitted': 1, 'Phone Screen': 2, 'Interview': 3,
  'Offer': 4, 'Accepted': 5, 'Rejected': 6, 'Withdrawn': 7,
};

export const AI_PROVIDERS = [
  {
    id: 'groq', label: 'Groq', free: true,
    model: 'llama-3.3-70b-versatile',
    baseUrl: 'https://api.groq.com/openai/v1',
    models: ['llama-3.3-70b-versatile', 'llama3-8b-8192', 'llama-3.1-8b-instant', 'meta-llama/llama-4-scout-17b-16e-instruct'],
  },
  {
    id: 'gemini', label: 'Gemini', free: true,
    model: 'gemini-2.0-flash',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    models: ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.5-flash-preview-05-20'],
  },
  {
    id: 'openrouter', label: 'OpenRouter', free: true,
    model: 'meta-llama/llama-3.3-70b-instruct:free',
    baseUrl: 'https://openrouter.ai/api/v1',
    models: ['meta-llama/llama-3.3-70b-instruct:free', 'google/gemma-3-12b-it:free', 'openai/gpt-4o-mini', 'anthropic/claude-3.5-haiku'],
  },
  {
    id: 'mistral', label: 'Mistral', free: true,
    model: 'mistral-small-latest',
    baseUrl: 'https://api.mistral.ai/v1',
    models: ['mistral-small-latest', 'open-mistral-7b', 'open-mixtral-8x7b', 'mistral-medium-latest'],
  },
  {
    id: 'openai', label: 'OpenAI', free: false,
    model: 'gpt-4o-mini',
    baseUrl: 'https://api.openai.com/v1',
    models: ['gpt-4o-mini', 'gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo'],
  },
  {
    id: 'claude', label: 'Claude', free: false,
    model: 'claude-sonnet-4-6',
    baseUrl: 'https://api.anthropic.com/v1',
    models: ['claude-sonnet-4-6', 'claude-opus-4-8', 'claude-haiku-4-5-20251001', 'claude-3-5-sonnet-20241022'],
  },
];

export const COLOR_THEMES = [
  { id: 'default',   label: 'Default',   start: '#7c3aed', end: '#2563eb' },
  { id: 'sunset',    label: 'Sunset',    start: '#f97316', end: '#ec4899' },
  { id: 'ocean',     label: 'Ocean',     start: '#0ea5e9', end: '#06b6d4' },
  { id: 'forest',    label: 'Forest',    start: '#22c55e', end: '#10b981' },
  { id: 'galaxy',    label: 'Galaxy',    start: '#8b5cf6', end: '#6366f1' },
  { id: 'aurora',    label: 'Aurora',    start: '#a3e635', end: '#06b6d4' },
  { id: 'rose',      label: 'Rose',      start: '#f43f5e', end: '#fb7185' },
  { id: 'midnight',  label: 'Midnight',  start: '#1e40af', end: '#7e22ce' },
  { id: 'candy',     label: 'Candy',     start: '#f472b6', end: '#a855f7' },
  { id: 'arctic',    label: 'Arctic',    start: '#7dd3fc', end: '#67e8f9' },
  { id: 'earth',     label: 'Earth',     start: '#92400e', end: '#d97706' },
  { id: 'citrus',    label: 'Citrus',    start: '#eab308', end: '#f97316' },
  { id: 'lava',      label: 'Lava',      start: '#dc2626', end: '#f97316' },
  { id: 'mint',      label: 'Mint',      start: '#34d399', end: '#6ee7b7' },
  { id: 'slate',     label: 'Slate',     start: '#475569', end: '#64748b' },
];

export const FONT_OPTIONS = [
  { id: 'inter',     label: 'Inter',          value: 'Inter, system-ui, sans-serif' },
  { id: 'poppins',   label: 'Poppins',         value: 'Poppins, sans-serif' },
  { id: 'space',     label: 'Space Grotesk',   value: "'Space Grotesk', sans-serif" },
  { id: 'dm',        label: 'DM Sans',         value: "'DM Sans', sans-serif" },
];

export const LAYOUT_OPTIONS = [
  { id: 'compact',     label: 'Compact',     pad: '6px 10px' },
  { id: 'comfortable', label: 'Comfortable', pad: '10px 12px' },
  { id: 'spacious',    label: 'Spacious',    pad: '14px 16px' },
];
