import { create } from 'zustand';
import type { Job, UserProfile, Toast, View, Status, AIProvider, ResumeEntry, Bookmark } from '../types';
import {
  dbGetJobs, dbSaveJob, dbDeleteJob,
  dbGetProfiles, dbSaveProfile, dbGetSetting, dbSetSetting,
  dbGetResumes, dbSaveResume, dbDeleteResume,
  dbGetBookmarks, dbSaveBookmark, dbDeleteBookmark,
} from '../lib/db';
import { SEED_JOBS, DEFAULT_PROFILE } from '../data/seed';

interface State {
  // Data
  jobs: Job[];
  resumes: ResumeEntry[];
  bookmarks: Bookmark[];
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
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: (open: boolean) => void;

  exportData: () => Promise<void>;
  exportCSV: () => void;
  importData: (json: string) => Promise<void>;
  importCSV: (csvText: string) => Promise<{ added: number; skipped: number; errors: string[] }>;
  clearAllData: () => Promise<void>;

  // Resume library
  addResume: (r: ResumeEntry) => Promise<void>;
  updateResume: (r: ResumeEntry) => Promise<void>;
  deleteResume: (id: string) => Promise<void>;

  // Bookmarks
  addBookmark: (b: Bookmark) => Promise<void>;
  updateBookmark: (b: Bookmark) => Promise<void>;
  deleteBookmark: (id: string) => Promise<void>;
}

let toastId = 0;

export const useStore = create<State>((set, get) => ({
  jobs: [],
  resumes: [],
  bookmarks: [],
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
  mobileSidebarOpen: false,

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

      // Load bookmarks from IndexedDB; migrate legacy localStorage entries
      let bookmarks = await dbGetBookmarks();
      const lsRaw = localStorage.getItem('cp-bookmarks');
      if (lsRaw) {
        try {
          const legacy = JSON.parse(lsRaw) as Array<Record<string, string>>;
          for (const b of legacy) {
            const migrated: Bookmark = {
              id: b.id || `bk-${Date.now()}-${Math.random().toString(36).slice(2)}`,
              company: b.company || '',
              role: b.role || '',
              url: b.url || '',
              notes: b.notes || '',
              source: b.source || '',
              addedAt: b.addedAt || new Date().toISOString().split('T')[0],
            };
            if (!bookmarks.find((x) => x.id === migrated.id)) {
              await dbSaveBookmark(migrated);
              bookmarks.push(migrated);
            }
          }
          localStorage.removeItem('cp-bookmarks');
        } catch { /* ignore corrupt legacy data */ }
      }

      set({ jobs, profile, profiles, resumes, bookmarks, hydrated: true, activeProfileId: profile.id });
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
  setMobileSidebarOpen: (open) => set({ mobileSidebarOpen: open }),

  exportData: async () => {
    const { jobs, bookmarks } = get();
    const blob = new Blob([JSON.stringify({ jobs, bookmarks }, null, 2)], { type: 'application/json' });
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
      const parsed = JSON.parse(json) as { jobs: Job[]; bookmarks?: Bookmark[] };
      for (const j of parsed.jobs) await dbSaveJob(j);
      set({ jobs: parsed.jobs });
      if (parsed.bookmarks?.length) {
        for (const b of parsed.bookmarks) await dbSaveBookmark(b);
        set({ bookmarks: parsed.bookmarks });
      }
      get().addToast(`Imported ${parsed.jobs.length} applications${parsed.bookmarks?.length ? ` + ${parsed.bookmarks.length} bookmarks` : ''}`, 'success');
    } catch {
      get().addToast('Import failed — invalid JSON', 'error');
    }
  },

  importCSV: async (csvText) => {
    const VALID_STATUSES: Status[] = ['Saved','Submitted','Phone Screen','Interview','Offer','Accepted','Rejected','Withdrawn'];
    const lines = csvText.split(/\r?\n/).filter((l) => l.trim());
    if (lines.length < 2) return { added: 0, skipped: 0, errors: ['CSV has no data rows'] };

    // Parse a single CSV row handling quoted fields
    const parseRow = (line: string): string[] => {
      const result: string[] = [];
      let cur = '';
      let inQ = false;
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') { if (inQ && line[i + 1] === '"') { cur += '"'; i++; } else { inQ = !inQ; } }
        else if (ch === ',' && !inQ) { result.push(cur.trim()); cur = ''; }
        else { cur += ch; }
      }
      result.push(cur.trim());
      return result;
    };

    const headers = parseRow(lines[0]).map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
    const col = (keys: string[]) => { for (const k of keys) { const i = headers.findIndex((h) => h.includes(k)); if (i >= 0) return i; } return -1; };
    const idx = {
      company:   col(['company']),
      role:      col(['role','title','position','jobtitle']),
      status:    col(['status']),
      location:  col(['location']),
      appliedDate: col(['applieddate','dateapplied','applied']),
      source:    col(['source']),
      url:       col(['url','link','joburl']),
      notes:     col(['notes']),
      priority:  col(['priority']),
      tags:      col(['tags']),
      salaryMin: col(['salarymin','minsalary']),
      salaryMax: col(['salarymax','maxsalary']),
      interviewDate: col(['interviewdate','scheduleddate','interviewon']),
    };

    const added: Job[] = [];
    const errors: string[] = [];
    const existing = get().jobs;

    for (let i = 1; i < lines.length; i++) {
      const cells = parseRow(lines[i]);
      const company = idx.company >= 0 ? (cells[idx.company] || '').replace(/^"|"$/g,'').trim() : '';
      const role    = idx.role    >= 0 ? (cells[idx.role]    || '').replace(/^"|"$/g,'').trim() : '';
      if (!company || !role) { errors.push(`Row ${i}: missing company or role`); continue; }

      const rawStatus = idx.status >= 0 ? (cells[idx.status] || '').trim() : '';
      const status = VALID_STATUSES.find((s) => s.toLowerCase() === rawStatus.toLowerCase()) || 'Saved';

      const rawMin = idx.salaryMin >= 0 ? parseInt(cells[idx.salaryMin] || '', 10) : NaN;
      const rawMax = idx.salaryMax >= 0 ? parseInt(cells[idx.salaryMax] || '', 10) : NaN;

      const dupe = existing.find(
        (j) => j.company.toLowerCase() === company.toLowerCase() && j.role.toLowerCase() === role.toLowerCase()
      );
      if (dupe) { errors.push(`Row ${i}: "${role}" at ${company} already exists — skipped`); continue; }

      const job: Job = {
        id: `job-csv-${Date.now()}-${i}`,
        createdAt: new Date().toISOString(),
        company, role,
        location:  idx.location  >= 0 ? (cells[idx.location]  || '') : '',
        status:    status as Status,
        priority:  (['High','Medium','Low'].includes(idx.priority >= 0 ? cells[idx.priority] : '') ? cells[idx.priority] as 'High'|'Medium'|'Low' : 'Medium'),
        jobType:   'Full-time',
        currency:  'USD',
        salaryMin: isNaN(rawMin) ? null : rawMin,
        salaryMax: isNaN(rawMax) ? null : rawMax,
        tags:      idx.tags >= 0 && cells[idx.tags] ? cells[idx.tags].split(';').map((t) => t.trim()).filter(Boolean) : [],
        source:    idx.source    >= 0 ? (cells[idx.source]    || '') : '',
        appliedDate: idx.appliedDate >= 0 ? (cells[idx.appliedDate] || '') : '',
        nextAction: '', followUpDate: '', interviewRound: '',
        interviewDate: idx.interviewDate >= 0 ? (cells[idx.interviewDate] || '') || undefined : undefined,
        url:       idx.url   >= 0 ? (cells[idx.url]   || '') : '',
        jdText:    '',
        contactName: '', contactRole: '', contactEmail: '', contactPhone: '',
        notes:     idx.notes >= 0 ? (cells[idx.notes] || '') : '',
        history:   [{ status: status as Status, at: new Date().toISOString() }],
        coverLetter: '',
        resumeName: '', resumeData: '', resumeType: '', resumeUpdatedAt: '',
      };
      added.push(job);
    }

    for (const j of added) await dbSaveJob(j);
    if (added.length) set((s) => ({ jobs: [...s.jobs, ...added] }));
    get().addToast(
      `Imported ${added.length} job${added.length !== 1 ? 's' : ''}${errors.length ? ` · ${errors.length} skipped` : ''}`,
      added.length > 0 ? 'success' : 'error'
    );
    return { added: added.length, skipped: errors.length, errors };
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

  addBookmark: async (b) => {
    await dbSaveBookmark(b);
    set((s) => ({ bookmarks: [...s.bookmarks, b] }));
  },

  updateBookmark: async (b) => {
    await dbSaveBookmark(b);
    set((s) => ({ bookmarks: s.bookmarks.map((x) => x.id === b.id ? b : x) }));
  },

  deleteBookmark: async (id) => {
    await dbDeleteBookmark(id);
    set((s) => ({ bookmarks: s.bookmarks.filter((x) => x.id !== id) }));
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
