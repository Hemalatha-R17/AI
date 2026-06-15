export type Status =
  | 'Saved' | 'Submitted' | 'Phone Screen' | 'Interview'
  | 'Offer' | 'Accepted' | 'Rejected' | 'Withdrawn';

export type Priority = 'Urgent' | 'High' | 'Medium' | 'Low';
export type JobType  = 'Full-time' | 'Part-time' | 'Contract' | 'Internship' | 'Freelance';
export type Currency = 'INR' | 'USD' | 'GBP' | 'EUR' | 'CAD' | 'AUD' | 'SGD';

export interface HistoryEntry {
  status: Status;
  at: string; // ISO
  note?: string;
}

export interface Job {
  id: string;
  createdAt: string;
  // Job Details
  company: string;
  role: string;
  location: string;
  status: Status;
  priority: Priority;
  jobType: JobType;
  currency: Currency;
  salaryMin: number | null;
  salaryMax: number | null;
  tags: string[];
  // Tracking
  source: string;
  appliedDate: string;
  nextAction: string;
  followUpDate: string;
  interviewRound: string;
  interviewDate?: string;
  url: string;
  jdText: string;
  // Contact
  contactName: string;
  contactRole: string;
  contactEmail: string;
  contactPhone: string;
  // Notes & history
  notes: string;
  history: HistoryEntry[];
  coverLetter: string;
  // Resume
  resumeName: string;
  resumeData: string;   // base64
  resumeType: string;   // MIME type
  resumeUpdatedAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  createdAt: string;
  monthlyGoal: number;
  defaultCurrency: Currency;
  skillProfile: string;
  masterResume: string;
}

export interface AIProvider {
  id: 'groq' | 'gemini' | 'openrouter' | 'mistral' | 'openai' | 'claude';
  label: string;
  apiKey: string;
  model: string;
  free: boolean;
}

export interface ResumeEntry {
  id: string;
  label: string;       // user-given name e.g. "QA Automation – 2026"
  fileName: string;    // original file name
  data: string;        // base64
  type: string;        // MIME type
  notes: string;
  uploadedAt: string;  // ISO
  updatedAt: string;   // ISO
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface Bookmark {
  id: string;
  company: string;
  role: string;
  url: string;
  notes: string;
  source: string;
  addedAt: string;
}

export type View =
  | 'dashboard' | 'pipeline' | 'directory' | 'calendars' | 'analytics'
  | 'resume' | 'interview' | 'discovery' | 'coverletter' | 'settings';
