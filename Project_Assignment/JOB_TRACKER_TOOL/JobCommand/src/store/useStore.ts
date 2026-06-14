import { create } from 'zustand';
import type { Job, UserProfile, Toast, View, Status, AIProvider, ResumeEntry } from '../types';
import {
  dbGetJobs, dbSaveJob, dbDeleteJob,
  dbGetProfiles, dbSaveProfile, dbGetSetting, dbSetSetting,
  dbGetResumes, dbSaveResume, dbDeleteResume,
} from '../lib/db';
import { SEED_JOBS, DEFAULT_PROFILE } from '../data/seed';

interface State {
  // Data
  jobs: Job[];
  resumes: ResumeEntry[];
  profile: UserProfile;
  activeProfileId: string | null;
  profiles: UserProfile[];
  hydrated: boolean;

  // UI State
  view: View;
  toasts: Toast[];
  aiPanelOpen: boolean;
  aiPanelPrompt: string;
  activeProviders: Partial<Record<string, AIProvider>>;
  selectedProvider: string;
  themeStudioOpen: boolean;

  // Actions
  hydrate: () => Promise<void>;
  setView: (v: View) => void;

  addJob: (job: Job) => Promise<void>;
  updateJob: (job: Job) => Promise<void>;
  deleteJob: (id: string) => Promise<void>;
  moveJob: (id: string, status: Status) => Promise<void>;
  bulkDelete: (ids: string[]) => Promise<void>;
  bulkMove: (ids: string[], status: Status) => Promise<void>;

  updateProfile: (p: Partial<UserProfile>) => Promise<void>;
  setActiveProfile: (id: string) => void;

  addToast: (msg: string, type?: Toast['type']) => void;
  removeToast: (id: string) => void;

  setAiPanelOpen: (open: boolean, prompt?: string) => void;
  setAiPanelPrompt: (prompt: string) => void;
  saveProvider: (provider: AIProvider) => Promise<void>;
  loadProviders: () => Promise<void>;
  setSelectedProvider: (id: string) => void;

  setThemeStudioOpen: (open: boolean) => void;

  exportData: () => Promise<void>;
  exportCSV: () => void;
  importData: (json: string) => Promise<void>;
  clearAllData: () => Promise<void>;

  // Resume library
  addResume: (r: ResumeEntry) => Promise<void>;
  updateResume: (r: ResumeEntry) => Promise<void>;
  deleteResume: (id: string) => Promise<void>;
}

let toastId = 0;

export const useStore = create<State>((set, get) => ({
  jobs: [],
  resumes: [],
  profile: DEFAULT_PROFILE,
  activeProfileId: null,
  profiles: [],
  hydrated: false,
  view: 'dashboard',
  toasts: [],
  aiPanelOpen: false,
  aiPanelPrompt: '',
  activeProviders: {},
  selectedProvider: '',
  themeStudioOpen: false,

  hydrate: async () => {
    try {
      let jobs = await dbGetJobs();
      if (jobs.length === 0) {
        for (const j of SEED_JOBS) await dbSaveJob(j);
        jobs = SEED_JOBS;
      }
      const profiles = await dbGetProfiles();
      let profile: UserProfile = DEFAULT_PROFILE;
      if (profiles.length === 0) {
        await dbSaveProfile(DEFAULT_PROFILE);
      } else {
        profile = profiles[0];
      }
      const resumes = await dbGetResumes();
      set({ jobs, profile, profiles, resumes, hydrated: true, activeProfileId: profile.id });
      await get().loadProviders();

      // Run notification alerts once per day
      const { checkJobAlerts, DEFAULT_NOTIF } = await import('../lib/notifications');
      const rawNotif  = await dbGetSetting('notif-settings');
      const rawLast   = await dbGetSetting('notif-last-checked');
      const notifSettings = rawNotif ? JSON.parse(rawNotif) : DEFAULT_NOTIF;
      const lastChecked   = rawLast || '';
      await checkJobAlerts(jobs, notifSettings, lastChecked, async () => {
        await dbSetSetting('notif-last-checked', new Date().toISOString().split('T')[0]);
      });
    } catch (e) {
      console.error('Hydration error', e);
      set({ jobs: SEED_JOBS, hydrated: true });
    }
  },

  setView: (view) => set({ view }),

  addJob: async (job) => {
    await dbSaveJob(job);
    set((s) => ({ jobs: [...s.jobs, job] }));
    get().addToast(`Added ${job.company} — ${job.role}`, 'success');
    if (job.status === 'Offer' || job.status === 'Accepted') {
      launchConfetti();
      fireStatusNotif(job, job.status);
    }
  },

  updateJob: async (job) => {
    await dbSaveJob(job);
    set((s) => ({ jobs: s.jobs.map((j) => (j.id === job.id ? job : j)) }));
    get().addToast('Application updated', 'success');
    if (job.status === 'Offer' || job.status === 'Accepted') {
      launchConfetti();
      fireStatusNotif(job, job.status);
    }
  },

  deleteJob: async (id) => {
    await dbDeleteJob(id);
    set((s) => ({ jobs: s.jobs.filter((j) => j.id !== id) }));
    get().addToast('Application deleted', 'info');
  },

  moveJob: async (id, status) => {
    const jobs = get().jobs;
    const job = jobs.find((j) => j.id === id);
    if (!job) return;
    const updated: Job = {
      ...job,
      status,
      history: [...(job.history || []), { status, at: new Date().toISOString() }],
    };
    await dbSaveJob(updated);
    set((s) => ({ jobs: s.jobs.map((j) => (j.id === id ? updated : j)) }));
    get().addToast(`Moved to ${status}`, 'success');
    if (status === 'Offer' || status === 'Accepted') {
      launchConfetti();
      fireStatusNotif(updated, status);
    }
  },

  bulkDelete: async (ids) => {
    for (const id of ids) await dbDeleteJob(id);
    set((s) => ({ jobs: s.jobs.filter((j) => !ids.includes(j.id)) }));
    get().addToast(`Deleted ${ids.length} applications`, 'info');
  },

  bulkMove: async (ids, status) => {
    const jobs = get().jobs;
    for (const id of ids) {
      const job = jobs.find((j) => j.id === id);
      if (!job) continue;
      const updated = { ...job, status, history: [...(job.history || []), { status, at: new Date().toISOString() }] };
      await dbSaveJob(updated);
    }
    set((s) => ({
      jobs: s.jobs.map((j) =>
        ids.includes(j.id)
          ? { ...j, status, history: [...(j.history || []), { status, at: new Date().toISOString() }] }
          : j,
      ),
    }));
    get().addToast(`Moved ${ids.length} applications to ${status}`, 'success');
    if (status === 'Offer' || status === 'Accepted') launchConfetti();
  },

  updateProfile: async (updates) => {
    const profile = { ...get().profile, ...updates };
    await dbSaveProfile(profile);
    set({ profile });
  },

  setActiveProfile: (id) => set({ activeProfileId: id }),

  addToast: (message, type = 'info') => {
    const id = String(++toastId);
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }));
    setTimeout(() => get().removeToast(id), 3500);
  },

  removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  setAiPanelOpen: (open, prompt) => {
    set({ aiPanelOpen: open });
    if (prompt) set({ aiPanelPrompt: prompt });
  },

  setAiPanelPrompt: (aiPanelPrompt) => set({ aiPanelPrompt }),

  saveProvider: async (provider) => {
    await dbSetSetting(`provider-${provider.id}`, JSON.stringify(provider));
    set((s) => ({
      activeProviders: { ...s.activeProviders, [provider.id]: provider },
      selectedProvider: provider.id,
    }));
    get().addToast(`${provider.label} connected`, 'success');
  },

  loadProviders: async () => {
    const { AI_PROVIDERS } = await import('../lib/constants');
    // Models Groq/others have officially decommissioned → map to replacement
    const DEAD_MODELS: Record<string, string> = {
      'llama-3.1-70b-versatile': 'llama-3.3-70b-versatile',
      'llama-3.1-8b-instant':    'llama-3.3-70b-versatile',
      'gemma2-9b-it':            'llama-3.3-70b-versatile',
      'gemma-7b-it':             'llama-3.3-70b-versatile',
    };
    const ids = ['groq', 'gemini', 'openrouter', 'mistral', 'openai', 'claude'];
    const providers: Record<string, AIProvider> = {};
    let firstId = '';
    for (const id of ids) {
      const raw = await dbGetSetting(`provider-${id}`);
      if (raw) {
        const p = JSON.parse(raw) as AIProvider;
        if (p.apiKey) {
          // auto-heal decommissioned models
          if (DEAD_MODELS[p.model]) {
            const pDef = AI_PROVIDERS.find((x) => x.id === id);
            p.model = DEAD_MODELS[p.model] || pDef?.model || p.model;
            await dbSetSetting(`provider-${id}`, JSON.stringify(p));
          }
          providers[id] = p;
          if (!firstId) firstId = id;
        }
      }
    }
    set({ activeProviders: providers, selectedProvider: firstId });
  },

  setSelectedProvider: (id) => set({ selectedProvider: id }),

  setThemeStudioOpen: (open) => set({ themeStudioOpen: open }),

  exportData: async () => {
    const jobs = get().jobs;
    const blob = new Blob([JSON.stringify({ jobs }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jobcommand-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    get().addToast('Data exported', 'success');
  },

  exportCSV: () => {
    const jobs = get().jobs;
    const headers = [
      'Company', 'Role', 'Status', 'Location', 'Priority', 'Job Type',
      'Currency', 'Salary Min', 'Salary Max', 'Tags',
      'Source', 'Applied Date', 'Next Action', 'Follow-up Date', 'Interview Round',
      'Job URL', 'Contact Name', 'Contact Role', 'Contact Email', 'Contact Phone',
      'Notes', 'Cover Letter', 'Resume File', 'Resume Uploaded', 'Created At',
    ];
    const esc = (v: unknown) => {
      const s = v == null ? '' : String(v);
      return s.includes(',') || s.includes('"') || s.includes('\n')
        ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const rows = jobs.map((j) => [
      j.company, j.role, j.status, j.location, j.priority, j.jobType,
      j.currency, j.salaryMin ?? '', j.salaryMax ?? '', (j.tags || []).join('; '),
      j.source, j.appliedDate, j.nextAction, j.followUpDate, j.interviewRound,
      j.url, j.contactName, j.contactRole, j.contactEmail, j.contactPhone,
      j.notes ? 'Yes' : 'No',
      j.coverLetter ? 'Yes' : 'No',
      j.resumeName || '',
      j.resumeUpdatedAt ? new Date(j.resumeUpdatedAt).toLocaleDateString() : '',
      j.createdAt ? new Date(j.createdAt).toLocaleDateString() : '',
    ].map(esc).join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `careerpulse-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    get().addToast('CSV exported', 'success');
  },

  importData: async (json) => {
    try {
      const { jobs } = JSON.parse(json) as { jobs: Job[] };
      for (const j of jobs) await dbSaveJob(j);
      set({ jobs });
      get().addToast(`Imported ${jobs.length} applications`, 'success');
    } catch {
      get().addToast('Import failed — invalid JSON', 'error');
    }
  },

  clearAllData: async () => {
    const { dbClear } = await import('../lib/db');
    await dbClear();
    set({ jobs: [] });
    get().addToast('All data cleared', 'info');
  },

  addResume: async (r) => {
    await dbSaveResume(r);
    set((s) => ({ resumes: [...s.resumes, r] }));
    get().addToast(`Resume "${r.label}" saved`, 'success');
  },

  updateResume: async (r) => {
    await dbSaveResume(r);
    set((s) => ({ resumes: s.resumes.map((x) => x.id === r.id ? r : x) }));
    get().addToast('Resume updated', 'success');
  },

  deleteResume: async (id) => {
    await dbDeleteResume(id);
    set((s) => ({ resumes: s.resumes.filter((x) => x.id !== id) }));
    get().addToast('Resume deleted', 'info');
  },
}));

// Zustand selector helpers
export const useJobs       = () => useStore((s) => s.jobs);
export const useView       = () => useStore((s) => s.view);
export const useProfile    = () => useStore((s) => s.profile);
export const useToasts     = () => useStore((s) => s.toasts);
export const useHydrated   = () => useStore((s) => s.hydrated);
export const useAiPanel    = () => useStore((s) => ({ open: s.aiPanelOpen, prompt: s.aiPanelPrompt }));

// Fire offer/accepted notification immediately (no daily guard)
async function fireStatusNotif(job: import('../types').Job, status: string) {
  try {
    const { notifyStatusChange, DEFAULT_NOTIF } = await import('../lib/notifications');
    const { dbGetSetting } = await import('../lib/db');
    const raw = await dbGetSetting('notif-settings');
    const settings = raw ? JSON.parse(raw) : DEFAULT_NOTIF;
    await notifyStatusChange(job, status, settings);
  } catch (e) {
    console.warn('Status notif failed', e);
  }
}

// confetti helper (canvas-based, no external library needed)
function launchConfetti() {
  const canvas = document.createElement('canvas');
  canvas.id = 'confetti-canvas';
  canvas.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9999;';
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d')!;
  const particles = Array.from({ length: 120 }, () => ({
    x: Math.random() * canvas.width,
    y: -10,
    w: 6 + Math.random() * 8,
    h: 8 + Math.random() * 6,
    color: ['#7c3aed','#2563eb','#10b981','#f59e0b','#ec4899','#06b6d4'][Math.floor(Math.random()*6)],
    vx: (Math.random() - 0.5) * 4,
    vy: 2 + Math.random() * 4,
    rot: Math.random() * 360,
    rSpeed: (Math.random() - 0.5) * 6,
  }));
  let frame = 0;
  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const p of particles) {
      p.x += p.vx; p.y += p.vy; p.rot += p.rSpeed; p.vy += 0.08;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rot * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }
    frame++;
    if (frame < 180) requestAnimationFrame(animate);
    else canvas.remove();
  };
  animate();
}
