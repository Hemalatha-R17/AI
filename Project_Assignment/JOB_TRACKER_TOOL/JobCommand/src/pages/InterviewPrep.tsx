import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
  CheckCircle, Circle, Plus, Sparkles, RefreshCw, Search, Download, Upload,
  Trash2, ChevronDown, ChevronUp, Star, X, Check, FileJson, FileText, Table2,
  Pencil, Eye, Clock, Play, Award, BookOpen,
} from 'lucide-react';
import { useJobs, useStore } from '../store/useStore';
import { callAI } from '../lib/ai';
import { CustomSelect } from '../components/ui/CustomSelect';
import { CustomDatePicker } from '../components/ui/CustomDatePicker';
import { formatDate } from '../lib/format';
import {
  parseFile, applyColumnMapping, normalizeHeader, detectCategory,
  KNOWN_HEADERS, APP_FIELDS, Q_CATEGORIES, Q_STATUS_CYCLE, DIFFICULTIES,
} from '../lib/questionParser';
import type { QCategory, QStatus, Difficulty, ParseResult } from '../lib/questionParser';

// ── Types ─────────────────────────────────────────────────────

interface StarNote { situation: string; task: string; action: string; result: string; }

interface BankQuestion {
  id: string; company: string; role: string; question: string;
  category: QCategory; status: QStatus; notes: string; star?: StarNote;
  dateAdded: string; interviewDate?: string; source?: string;
  difficulty?: Difficulty; confidence?: number; practiceRatings?: number[];
}

interface CompanyBank {
  interviewDate?: string;
  rounds?: Array<{ label: string; date: string }>;
  questions: BankQuestion[];
}

type BankStore = Record<string, CompanyBank>;
interface CustomItem { id: string; text: string; }
interface ImportRecord { hash: string; filename: string; date: string; count: number; }

// ── Constants ─────────────────────────────────────────────────

const Q_STATUS_COLORS: Record<QStatus, string> = {
  'To Prepare': '#64748b', 'Practicing': '#f59e0b', 'Practiced': '#3b82f6',
  'Asked in Interview': '#10b981', 'Skipped': '#ef4444',
};
const CAT_COLORS: Record<QCategory, string> = {
  'Behavioral': '#a855f7', 'Technical': '#3b82f6', 'System Design': '#06b6d4',
  'HR': '#ec4899', 'Coding': '#f97316',
};
const DIFF_COLORS: Record<Difficulty, string> = {
  'Easy': '#10b981', 'Medium': '#f59e0b', 'Hard': '#ef4444',
};

const BANK_KEY        = 'cp-qbank';
const IMPORTS_KEY     = 'cp-qbank-imports';
const CHECKLIST_KEY   = 'cp-checklist-v2';
const CUSTOM_ITEMS_KEY = 'cp-checklist-custom';

const ROUND_LABELS = ['Phone Screen', 'Technical Round 1', 'Technical Round 2', 'HR Round', 'Final Round'];

const DEFAULT_CHECKLIST: Array<{ id: string; text: string }> = [
  { id: 'd0',  text: 'Research company mission, products, and recent news' },
  { id: 'd1',  text: 'Prepare 3–5 STAR method stories (Situation, Task, Action, Result)' },
  { id: 'd2',  text: 'Review the job description and match your skills' },
  { id: 'd3',  text: 'Research salary range for the role and location' },
  { id: 'd4',  text: 'Connect with the interviewer on LinkedIn before the interview' },
  { id: 'd5',  text: 'Review your portfolio, GitHub, or recent projects' },
  { id: 'd6',  text: 'Test your tech setup (camera, mic, internet, backup device)' },
  { id: 'd7',  text: 'Prepare 5 thoughtful questions to ask the interviewer' },
  { id: 'd8',  text: 'Know your "weakness" answer (genuine + growth-focused)' },
  { id: 'd9',  text: 'Review top 50 LeetCode / common coding patterns (if technical)' },
  { id: 'd10', text: 'Send thank-you email within 24 hours post-interview' },
  { id: 'd11', text: 'Prepare salary negotiation range and walk-away number' },
];

const ROLE_TEMPLATES: Record<string, Array<{ q: string; cat: QCategory; diff: Difficulty }>> = {
  'SDE': [
    { q: 'Tell me about a time you debugged a critical production issue.', cat: 'Behavioral', diff: 'Medium' },
    { q: 'Design a distributed rate limiter.', cat: 'System Design', diff: 'Hard' },
    { q: 'Implement an LRU cache.', cat: 'Coding', diff: 'Medium' },
    { q: 'Explain CAP theorem and when you would sacrifice consistency.', cat: 'Technical', diff: 'Medium' },
    { q: 'How do you handle technical debt in a fast-moving team?', cat: 'Behavioral', diff: 'Medium' },
    { q: 'Design a URL shortener that handles 1B requests per day.', cat: 'System Design', diff: 'Hard' },
    { q: 'What is the difference between a process and a thread?', cat: 'Technical', diff: 'Easy' },
    { q: 'Tell me about a technical decision you regret.', cat: 'Behavioral', diff: 'Medium' },
    { q: 'Implement binary search tree insert and search.', cat: 'Coding', diff: 'Easy' },
    { q: 'How do you ensure code quality in your team?', cat: 'Behavioral', diff: 'Easy' },
    { q: 'Design a notification system for 10M users.', cat: 'System Design', diff: 'Hard' },
    { q: 'Explain eventual consistency with a real-world example.', cat: 'Technical', diff: 'Medium' },
    { q: 'Tell me about a time you had to meet a tight deadline.', cat: 'Behavioral', diff: 'Easy' },
    { q: 'Find the first non-repeating character in a string.', cat: 'Coding', diff: 'Easy' },
    { q: 'What is your approach to code reviews?', cat: 'Behavioral', diff: 'Easy' },
    { q: 'Design a distributed cache like Redis.', cat: 'System Design', diff: 'Hard' },
    { q: 'What is the difference between REST and GraphQL?', cat: 'Technical', diff: 'Easy' },
    { q: 'Describe a time you led a project from scratch.', cat: 'Behavioral', diff: 'Medium' },
    { q: 'Where do you see yourself in 5 years?', cat: 'HR', diff: 'Easy' },
    { q: 'What is your greatest technical strength and weakness?', cat: 'HR', diff: 'Easy' },
  ],
  'QA Automation': [
    { q: 'How do you decide what to automate vs leave as manual?', cat: 'Technical', diff: 'Medium' },
    { q: 'Design a test automation framework from scratch.', cat: 'System Design', diff: 'Hard' },
    { q: 'Tell me about a bug you found that no one else caught.', cat: 'Behavioral', diff: 'Medium' },
    { q: 'How do you handle flaky tests in your CI pipeline?', cat: 'Technical', diff: 'Medium' },
    { q: 'Explain the Page Object Model pattern.', cat: 'Technical', diff: 'Easy' },
    { q: 'How do you test an API with no documentation?', cat: 'Technical', diff: 'Medium' },
    { q: 'Tell me about a time you pushed back on a release.', cat: 'Behavioral', diff: 'Medium' },
    { q: 'What metrics do you track to measure QA effectiveness?', cat: 'Technical', diff: 'Medium' },
    { q: 'Design a test strategy for a mobile payment app.', cat: 'System Design', diff: 'Hard' },
    { q: 'How do you approach testing microservices?', cat: 'Technical', diff: 'Hard' },
    { q: 'Explain the difference between regression and smoke testing.', cat: 'Technical', diff: 'Easy' },
    { q: 'Tell me about a time you improved test coverage significantly.', cat: 'Behavioral', diff: 'Medium' },
    { q: 'How do you integrate automation into a CI/CD pipeline?', cat: 'Technical', diff: 'Medium' },
    { q: 'What is your approach to performance testing?', cat: 'Technical', diff: 'Medium' },
    { q: 'Describe a situation where you had to learn a new tool quickly.', cat: 'Behavioral', diff: 'Easy' },
    { q: 'How do you test for security vulnerabilities?', cat: 'Technical', diff: 'Hard' },
    { q: 'Write a Selenium test for a login page.', cat: 'Coding', diff: 'Easy' },
    { q: 'How do you handle test data management?', cat: 'Technical', diff: 'Medium' },
    { q: 'Why do you want to work in QA?', cat: 'HR', diff: 'Easy' },
    { q: 'What is your greatest QA achievement?', cat: 'HR', diff: 'Easy' },
  ],
  'PM': [
    { q: 'How do you prioritize features when everything is urgent?', cat: 'Behavioral', diff: 'Medium' },
    { q: 'Design a product for elderly users to manage medications.', cat: 'System Design', diff: 'Medium' },
    { q: 'Tell me about a product decision you made with incomplete data.', cat: 'Behavioral', diff: 'Hard' },
    { q: 'How do you measure the success of a feature launch?', cat: 'Technical', diff: 'Medium' },
    { q: 'Describe a time you had to say no to a stakeholder.', cat: 'Behavioral', diff: 'Medium' },
    { q: 'What is your process for writing a PRD?', cat: 'Technical', diff: 'Easy' },
    { q: 'How do you build alignment across engineering, design, and business?', cat: 'Behavioral', diff: 'Medium' },
    { q: 'Walk me through how you would improve our onboarding flow.', cat: 'System Design', diff: 'Medium' },
    { q: 'Tell me about a product failure and what you learned.', cat: 'Behavioral', diff: 'Hard' },
    { q: 'How do you decide between user requests and business goals?', cat: 'Behavioral', diff: 'Hard' },
    { q: 'Explain A/B testing and when you would use it.', cat: 'Technical', diff: 'Easy' },
    { q: 'How do you work with engineers who push back on your timeline?', cat: 'Behavioral', diff: 'Medium' },
    { q: 'Design a feature to increase user retention by 10%.', cat: 'System Design', diff: 'Hard' },
    { q: 'What KPIs would you track for a subscription product?', cat: 'Technical', diff: 'Medium' },
    { q: 'Tell me about a time you turned a struggling product around.', cat: 'Behavioral', diff: 'Hard' },
    { q: 'How do you do user research with limited time and budget?', cat: 'Technical', diff: 'Medium' },
    { q: 'What is the difference between a metric and a goal?', cat: 'Technical', diff: 'Easy' },
    { q: 'Tell me about your proudest product launch.', cat: 'Behavioral', diff: 'Easy' },
    { q: 'Where do you see product management going in 5 years?', cat: 'HR', diff: 'Easy' },
    { q: 'What makes a great product manager?', cat: 'HR', diff: 'Easy' },
  ],
  'Data Scientist': [
    { q: 'Explain the bias-variance tradeoff.', cat: 'Technical', diff: 'Medium' },
    { q: 'Tell me about a model you built that failed in production.', cat: 'Behavioral', diff: 'Hard' },
    { q: 'How would you detect fraud in a financial transaction dataset?', cat: 'System Design', diff: 'Hard' },
    { q: 'What is the difference between precision and recall?', cat: 'Technical', diff: 'Easy' },
    { q: 'How do you handle class imbalance in training data?', cat: 'Technical', diff: 'Medium' },
    { q: 'Design an ML pipeline for real-time recommendation.', cat: 'System Design', diff: 'Hard' },
    { q: 'Explain gradient boosting in plain English.', cat: 'Technical', diff: 'Medium' },
    { q: 'Tell me about a time you explained ML results to non-technical stakeholders.', cat: 'Behavioral', diff: 'Medium' },
    { q: 'How do you validate a model before pushing to production?', cat: 'Technical', diff: 'Medium' },
    { q: 'What is feature engineering? Give an example.', cat: 'Technical', diff: 'Easy' },
    { q: 'How would you A/B test a new recommendation algorithm?', cat: 'Technical', diff: 'Medium' },
    { q: 'Explain the curse of dimensionality.', cat: 'Technical', diff: 'Hard' },
    { q: 'Tell me about a time your analysis changed a business decision.', cat: 'Behavioral', diff: 'Medium' },
    { q: 'How do you monitor a model for drift after deployment?', cat: 'Technical', diff: 'Hard' },
    { q: 'Write SQL to find the top 3 products by revenue per region.', cat: 'Coding', diff: 'Medium' },
    { q: 'What is the difference between supervised and unsupervised learning?', cat: 'Technical', diff: 'Easy' },
    { q: 'How do you approach missing data in a dataset?', cat: 'Technical', diff: 'Medium' },
    { q: 'Tell me about your biggest data science project.', cat: 'Behavioral', diff: 'Easy' },
    { q: 'What excites you about data science in this industry?', cat: 'HR', diff: 'Easy' },
    { q: 'What is your greatest weakness as a data scientist?', cat: 'HR', diff: 'Easy' },
  ],
  'DevOps': [
    { q: 'Walk me through your CI/CD pipeline design.', cat: 'Technical', diff: 'Medium' },
    { q: 'Tell me about a production outage you handled.', cat: 'Behavioral', diff: 'Hard' },
    { q: 'Design a zero-downtime deployment strategy.', cat: 'System Design', diff: 'Hard' },
    { q: 'Explain Kubernetes pods, deployments, and services.', cat: 'Technical', diff: 'Medium' },
    { q: 'How do you monitor infrastructure health?', cat: 'Technical', diff: 'Medium' },
    { q: 'What is Infrastructure as Code and what tools do you use?', cat: 'Technical', diff: 'Easy' },
    { q: 'Tell me about a time you improved deployment frequency significantly.', cat: 'Behavioral', diff: 'Medium' },
    { q: 'Design a logging and alerting system for microservices.', cat: 'System Design', diff: 'Hard' },
    { q: 'How do you handle secrets management in a cloud environment?', cat: 'Technical', diff: 'Medium' },
    { q: 'Explain blue-green vs canary deployments.', cat: 'Technical', diff: 'Medium' },
    { q: 'Tell me about a time you automated away a painful manual process.', cat: 'Behavioral', diff: 'Medium' },
    { q: 'How do you approach disaster recovery planning?', cat: 'Technical', diff: 'Hard' },
    { q: 'Design a cost-optimized AWS architecture for a startup.', cat: 'System Design', diff: 'Medium' },
    { q: 'What is the difference between Docker and a VM?', cat: 'Technical', diff: 'Easy' },
    { q: 'How do you handle configuration drift across environments?', cat: 'Technical', diff: 'Medium' },
    { q: 'Tell me about a security incident you prevented or contained.', cat: 'Behavioral', diff: 'Hard' },
    { q: 'Write a basic Dockerfile for a Node.js app.', cat: 'Coding', diff: 'Easy' },
    { q: 'How do you manage on-call rotations and reduce alert fatigue?', cat: 'Behavioral', diff: 'Medium' },
    { q: 'Why did you choose DevOps as a career?', cat: 'HR', diff: 'Easy' },
    { q: 'What is your approach to continuous learning in this field?', cat: 'HR', diff: 'Easy' },
  ],
};

const SAMPLE_CSV = `Company,Role,Question,Category,Status,Notes,Difficulty,Confidence,Interview Date
Google,SWE II,Tell me about a time you handled a production incident.,Behavioral,To Prepare,,Medium,,2026-07-10
Amazon,SDE II,Design a URL shortener that handles 1B requests per day.,System Design,Practicing,Focus on load balancer + Redis,Hard,,
Anthropic,Senior SDET,How do you approach test automation for ML models?,Technical,Practiced,Cover unit + integration + eval tests,Medium,4,2026-07-15
Meta,Frontend Engineer,What is the virtual DOM and why does React use it?,Technical,To Prepare,,Easy,3,
Google,SWE II,Where do you see yourself in 5 years?,HR,To Prepare,,,2,`;

// ── Storage ───────────────────────────────────────────────────

function loadBank(): BankStore { try { return JSON.parse(localStorage.getItem(BANK_KEY) || '{}'); } catch { return {}; } }
function persistBank(b: BankStore) { localStorage.setItem(BANK_KEY, JSON.stringify(b)); }

function loadCheckState(jobId: string): Record<string, boolean> {
  try { const a = JSON.parse(localStorage.getItem(CHECKLIST_KEY) || '{}'); return a[jobId || '__global__'] || {}; }
  catch { return {}; }
}
function persistCheckState(jobId: string, s: Record<string, boolean>) {
  try { const a = JSON.parse(localStorage.getItem(CHECKLIST_KEY) || '{}'); a[jobId || '__global__'] = s; localStorage.setItem(CHECKLIST_KEY, JSON.stringify(a)); }
  catch { /* noop */ }
}
function loadCustomItems(): CustomItem[] { try { return JSON.parse(localStorage.getItem(CUSTOM_ITEMS_KEY) || '[]'); } catch { return []; } }
function saveCustomItems(items: CustomItem[]) { localStorage.setItem(CUSTOM_ITEMS_KEY, JSON.stringify(items)); }
function loadImports(): ImportRecord[] { try { return JSON.parse(localStorage.getItem(IMPORTS_KEY) || '[]'); } catch { return []; } }
function saveImport(r: ImportRecord) { const prev = loadImports().filter(x => x.hash !== r.hash); localStorage.setItem(IMPORTS_KEY, JSON.stringify([r, ...prev])); }

function hashContent(s: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = (h * 0x01000193) >>> 0; }
  return h.toString(16);
}

// ── Export helpers ────────────────────────────────────────────

function dlBlob(content: string, filename: string, mime: string) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([content], { type: mime }));
  a.download = filename; a.click();
}

function exportCSV(qs: BankQuestion[], name: string) {
  const hdr = 'Company,Role,Question,Category,Status,Notes,Situation,Task,Action,Result,Difficulty,Confidence,Date Added,Interview Date';
  const rows = qs.map(q =>
    [q.company, q.role, q.question, q.category, q.status,
     q.notes || '', q.star?.situation || '', q.star?.task || '', q.star?.action || '', q.star?.result || '',
     q.difficulty || '', q.confidence || '', q.dateAdded, q.interviewDate || '']
      .map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')
  );
  dlBlob([hdr, ...rows].join('\n'), name, 'text/csv');
}

function exportJSON(qs: BankQuestion[], name: string) {
  dlBlob(JSON.stringify(qs.map(({ id: _id, dateAdded: _da, ...rest }) => rest), null, 2), name, 'application/json');
}

function exportMarkdown(qs: BankQuestion[], scope: string) {
  const byCompany: Record<string, Record<string, BankQuestion[]>> = {};
  for (const q of qs) {
    const c = q.company || 'General'; const r = q.role || 'General';
    if (!byCompany[c]) byCompany[c] = {};
    if (!byCompany[c][r]) byCompany[c][r] = [];
    byCompany[c][r].push(q);
  }
  const lines: string[] = [`# Interview Questions — ${scope}`, '', `*Exported ${new Date().toLocaleDateString()}*`, ''];
  for (const [co, roles] of Object.entries(byCompany)) {
    lines.push(`## ${co}`, '');
    for (const [ro, cqs] of Object.entries(roles)) {
      lines.push(`### ${ro}`, '');
      const byCat: Record<string, BankQuestion[]> = {};
      for (const q of cqs) { if (!byCat[q.category]) byCat[q.category] = []; byCat[q.category].push(q); }
      for (const [cat, catQs] of Object.entries(byCat)) {
        lines.push(`#### ${cat}`, '');
        catQs.forEach((q, i) => {
          lines.push(`${i + 1}. **${q.question}**`);
          const meta = [`Status: ${q.status}`, q.difficulty ? `Difficulty: ${q.difficulty}` : '', q.confidence ? `Confidence: ${'★'.repeat(q.confidence)}${'☆'.repeat(5 - q.confidence)}` : ''].filter(Boolean).join(' | ');
          lines.push(`   - ${meta}`);
          if (q.notes) lines.push(`   - Notes: ${q.notes}`);
          if (q.star?.situation) lines.push(`   - S: ${q.star.situation}`, `   - T: ${q.star.task}`, `   - A: ${q.star.action}`, `   - R: ${q.star.result}`);
          lines.push('');
        });
      }
    }
  }
  dlBlob(lines.join('\n'), `questions-${scope.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.md`, 'text/markdown');
}

// ── Inline markdown renderer ───────────────────────────────────

function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((p, i) => {
    if (p.startsWith('**') && p.endsWith('**')) return <strong key={i}>{p.slice(2, -2)}</strong>;
    if (p.startsWith('`') && p.endsWith('`')) return <code key={i} style={{ background: 'var(--color-surface-2)', padding: '1px 4px', borderRadius: 3, fontSize: '0.9em' }}>{p.slice(1, -1)}</code>;
    return p;
  });
}

// ── ColumnMapModal ─────────────────────────────────────────────

interface ColumnMapProps {
  headers: string[]; rows: string[][]; filename: string;
  initialMapping: Record<string, string>;
  onConfirm: (mapping: Record<string, string>) => void;
  onCancel: () => void;
}

function ColumnMapModal({ headers, rows, filename, initialMapping, onConfirm, onCancel }: ColumnMapProps) {
  const [mapping, setMapping] = useState<Record<string, string>>(initialMapping);
  const sample = rows[0] || [];
  const hasQ = Object.values(mapping).includes('question');
  return (
    <div className="modal-backdrop" onClick={e => { if (e.target === e.currentTarget) onCancel(); }}>
      <div className="modal" style={{ maxWidth: 580 }}>
        <div className="modal-header">
          <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text)' }}>Map Columns — {filename}</h2>
          <button className="btn-icon" onClick={onCancel}><X size={16} /></button>
        </div>
        <div className="modal-body">
          <p style={{ fontSize: 12, color: 'var(--color-muted)', marginBottom: 16, lineHeight: 1.6 }}>
            We couldn't automatically recognise your column names. Tell us what each column means.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 6, fontSize: 11, fontWeight: 600, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <span>Your Column</span><span>Sample Value</span><span>Maps To</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 360, overflowY: 'auto' }}>
            {headers.map((h, i) => (
              <div key={h} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, alignItems: 'center' }}>
                <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h}</span>
                <span style={{ fontSize: 11, color: 'var(--color-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sample[i] || '—'}</span>
                <CustomSelect value={mapping[h] || ''} onChange={v => setMapping(m => ({ ...m, [h]: v }))} options={APP_FIELDS} placeholder="(skip)" style={{ width: '100%' }} />
              </div>
            ))}
          </div>
          {!hasQ && (
            <div style={{ marginTop: 12, padding: '8px 12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 6, fontSize: 12, color: 'var(--color-danger)' }}>
              ⚠ Map at least one column to "Question" before importing.
            </div>
          )}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, padding: '12px 20px', borderTop: '1px solid var(--color-border)' }}>
          <button className="btn btn-ghost" onClick={onCancel}>Cancel</button>
          <button className="btn btn-primary" disabled={!hasQ} onClick={() => onConfirm(mapping)}>
            <Check size={14} /> Import {rows.length} row{rows.length !== 1 ? 's' : ''}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── ParseFeedback ──────────────────────────────────────────────

function ParseFeedback({ result, onDismiss }: { result: ParseResult; onDismiss: () => void }) {
  const ok = result.questions.length > 0;
  return (
    <div style={{ marginBottom: 12, padding: '10px 14px', fontSize: 12, borderRadius: 8, background: ok ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)', border: `1px solid ${ok ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ flex: 1 }}>
          {ok && <div style={{ color: 'var(--color-success)', fontWeight: 600, marginBottom: result.errors.length || result.warnings.length ? 6 : 0 }}>✓ Imported {result.questions.length} question{result.questions.length !== 1 ? 's' : ''} from {result.fileType} file</div>}
          {result.errors.map((e, i) => <div key={i} style={{ color: 'var(--color-danger)', marginBottom: 3 }}>⚠ {e.message}</div>)}
          {result.warnings.map((w, i) => <div key={i} style={{ color: 'var(--color-warn)', marginBottom: 3 }}>ℹ {w}</div>)}
          {result.suggestions.map((s, i) => <div key={i} style={{ color: 'var(--color-muted)', marginTop: 4 }}>💡 {s}</div>)}
        </div>
        <button onClick={onDismiss} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-muted)', padding: 2, flexShrink: 0 }}><X size={12} /></button>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────

export function InterviewPrep() {
  const jobs            = useJobs();
  const activeProviders = useStore(s => s.activeProviders);
  const selectedProvider = useStore(s => s.selectedProvider);

  const [tab, setTab] = useState<'bank' | 'mock' | 'coach' | 'checklist'>('bank');

  // Bank state
  const [bank, setBank]                 = useState<BankStore>(loadBank);
  const [selectedKey, setSelectedKey]   = useState('');
  const [search, setSearch]             = useState('');
  const [filterCat, setFilterCat]       = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDue, setFilterDue]       = useState(false);
  const [sortBy, setSortBy]             = useState<'dateAdded' | 'category' | 'status' | 'difficulty' | 'confidence'>('dateAdded');
  const [newQ, setNewQ]                 = useState('');
  const [newCat, setNewCat]             = useState<QCategory>('Behavioral');
  const [expandedId, setExpandedId]     = useState<string | null>(null);
  const [editingNote, setEditingNote]   = useState<Record<string, string>>({});
  const noteTimers                      = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  // Inline edit state
  const [editQId, setEditQId]     = useState<string | null>(null);
  const [editQText, setEditQText] = useState('');
  const [editQCat, setEditQCat]   = useState<QCategory>('Behavioral');

  // STAR state
  const [starOpen, setStarOpen]           = useState<Record<string, boolean>>({});
  const [starEditState, setStarEditState] = useState<Record<string, StarNote>>({});
  const starEditRef                       = useRef<Record<string, StarNote>>({});
  const starTimers                        = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  // AI grade state
  const [gradeAnswerText, setGradeAnswerText] = useState<Record<string, string>>({});
  const [gradeResultMap, setGradeResultMap]   = useState<Record<string, string>>({});
  const [gradeLoading, setGradeLoading]       = useState<string | null>(null);
  const [gradeOpen, setGradeOpen]             = useState<Record<string, boolean>>({});

  // Import / export state
  const [parseResult, setParseResult]   = useState<ParseResult | null>(null);
  const [mappingState, setMappingState] = useState<{ headers: string[]; rows: string[][]; filename: string; initialMapping: Record<string, string> } | null>(null);
  const pendingFilenameRef              = useRef('');
  const [showExport, setShowExport]     = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [importError, setImportError]   = useState<string | null>(null);
  const [selectedBuckets, setSelectedBuckets] = useState<Set<string>>(new Set());
  const fileRef = useRef<HTMLInputElement>(null);

  // Multi-round date editing
  const [showRounds, setShowRounds] = useState<Record<string, boolean>>({});

  // AI Coach state
  const [selectedJobId, setSelectedJobId] = useState('');
  const [coachResponse, setCoachResponse] = useState('');
  const [coachLoading, setCoachLoading]   = useState(false);
  const [coachError, setCoachError]       = useState('');
  const [markedAsAsked, setMarkedAsAsked] = useState<Set<string>>(new Set());

  // Checklist state
  const [checkState, setCheckState]   = useState<Record<string, boolean>>({});
  const [customItems, setCustomItems] = useState<CustomItem[]>(loadCustomItems);
  const [newItemText, setNewItemText] = useState('');

  // Mock Interview state
  const [mockBucket, setMockBucket]     = useState('');
  const [mockCatFilter, setMockCatFilter] = useState('');
  const [mockTimerSecs, setMockTimerSecs] = useState(0);
  const [mockSession, setMockSession]   = useState<BankQuestion[] | null>(null);
  const [mockDone, setMockDone]         = useState(false);
  const [mockIndex, setMockIndex]       = useState(0);
  const [mockRevealed, setMockRevealed] = useState(false);
  const [mockRating, setMockRating]     = useState(0);
  const [mockSessionRatings, setMockSessionRatings] = useState<Record<string, number>>({});
  const [mockTimeLeft, setMockTimeLeft] = useState(0);
  const mockTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Effects ─────────────────────────────────────────────────

  useEffect(() => {
    const t = noteTimers.current;
    const st = starTimers.current;
    return () => { Object.values(t).forEach(clearTimeout); Object.values(st).forEach(clearTimeout); };
  }, []);

  useEffect(() => {
    setCheckState(loadCheckState(selectedJobId));
  }, [selectedJobId]);

  useEffect(() => {
    setMarkedAsAsked(new Set());
  }, [selectedJobId]);

  useEffect(() => {
    return () => { if (mockTimerRef.current) clearInterval(mockTimerRef.current); };
  }, []);

  // ── Derived ──────────────────────────────────────────────────

  const updateBank = useCallback((next: BankStore) => { setBank(next); persistBank(next); }, []);
  const ALL_KEY = '__all__';

  const isNotCompany = (company: string) =>
    /\b(table\s*of|contents?|introduction|overview|automation|testing|strategy|methodology|framework|guide|tips?|checklist|preparation|resources?|section|chapter|topic|categories|misc)\b/i.test(company)
    || /^Q\d+[.)]/i.test(company)
    || company.endsWith('?')
    || /^(how |what |why |when |where |tell me|describe |explain |give me|walk me|can you|could you|have you|do you|did you|share a|design a|implement)/i.test(company);

  const allKeys = useMemo(() => {
    const fromJobs = jobs.map(j => `${j.company}:${j.role}`);
    const fromBank = Object.keys(bank).filter(k => !isNotCompany(k.slice(0, k.indexOf(':'))));
    return [...new Set([...fromJobs, ...fromBank])].sort();
  }, [jobs, bank]);

  const totalCount = useMemo(() => Object.values(bank).reduce((s, b) => s + b.questions.length, 0), [bank]);

  const dueCount = useMemo(() => {
    const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    return Object.values(bank).flatMap(b => b.questions)
      .filter(q => (q.confidence ?? 3) <= 2 && q.dateAdded < cutoff).length;
  }, [bank]);

  const currentQuestions = useMemo<BankQuestion[]>(() => {
    if (search) {
      const q = search.toLowerCase();
      return Object.values(bank).flatMap(b => b.questions).filter(
        bq => bq.company.toLowerCase().includes(q) || bq.role.toLowerCase().includes(q) || bq.question.toLowerCase().includes(q)
      );
    }
    if (selectedKey === ALL_KEY) return Object.values(bank).flatMap(b => b.questions);
    return bank[selectedKey]?.questions || [];
  }, [bank, selectedKey, search]);

  const DIFF_ORDER: Record<string, number> = { Easy: 0, Medium: 1, Hard: 2 };

  const filteredQuestions = useMemo(() => {
    let qs = [...currentQuestions];
    if (filterCat) qs = qs.filter(q => q.category === filterCat);
    if (filterStatus) qs = qs.filter(q => q.status === filterStatus);
    if (filterDue) {
      const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      qs = qs.filter(q => (q.confidence ?? 3) <= 2 && q.dateAdded < cutoff);
    }
    qs.sort((a, b) => {
      if (sortBy === 'category')   return a.category.localeCompare(b.category);
      if (sortBy === 'status')     return Q_STATUS_CYCLE.indexOf(a.status) - Q_STATUS_CYCLE.indexOf(b.status);
      if (sortBy === 'difficulty') return (DIFF_ORDER[a.difficulty || ''] ?? 99) - (DIFF_ORDER[b.difficulty || ''] ?? 99);
      if (sortBy === 'confidence') return (a.confidence ?? 6) - (b.confidence ?? 6);
      return b.dateAdded.localeCompare(a.dateAdded);
    });
    return qs;
  }, [currentQuestions, filterCat, filterStatus, filterDue, sortBy]);

  const groupedSearch = useMemo(() => {
    if (!search) return null;
    const g: Record<string, BankQuestion[]> = {};
    for (const q of filteredQuestions) { const k = `${q.company}:${q.role}`; g[k] = g[k] || []; g[k].push(q); }
    return g;
  }, [search, filteredQuestions]);

  const stats = useMemo(() => {
    const qs = selectedKey === ALL_KEY ? Object.values(bank).flatMap(b => b.questions) : bank[selectedKey]?.questions || [];
    return Q_STATUS_CYCLE.reduce((acc, s) => { acc[s] = qs.filter(q => q.status === s).length; return acc; }, {} as Record<QStatus, number>);
  }, [bank, selectedKey]);

  const EXCLUDED_STATUSES = ['Rejected', 'Withdrawn', 'Closed'];
  const interviewJobs = jobs.filter(j => !EXCLUDED_STATUSES.includes(j.status));
  const selectedJob   = jobs.find(j => j.id === selectedJobId);

  const allChecklistItems = useMemo(() => [...DEFAULT_CHECKLIST, ...customItems], [customItems]);

  // ── Bank Actions ──────────────────────────────────────────────

  const addQuestion = () => {
    if (!newQ.trim() || !selectedKey || selectedKey === ALL_KEY) return;
    const ci = selectedKey.indexOf(':');
    const company = selectedKey.slice(0, ci); const role = selectedKey.slice(ci + 1);
    const q: BankQuestion = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      company, role, question: newQ.trim(), category: newCat,
      status: 'To Prepare', notes: '', dateAdded: new Date().toISOString(),
    };
    const next = { ...bank };
    if (!next[selectedKey]) next[selectedKey] = { questions: [] };
    next[selectedKey] = { ...next[selectedKey], questions: [q, ...next[selectedKey].questions] };
    updateBank(next); setNewQ('');
  };

  const deleteQuestion = useCallback((id: string) => {
    const next = { ...bank };
    for (const k of Object.keys(next)) next[k] = { ...next[k], questions: next[k].questions.filter(q => q.id !== id) };
    updateBank(next);
    if (expandedId === id) setExpandedId(null);
  }, [bank, updateBank, expandedId]);

  const cycleStatus = useCallback((id: string) => {
    const next = { ...bank };
    for (const k of Object.keys(next))
      next[k] = { ...next[k], questions: next[k].questions.map(q =>
        q.id !== id ? q : { ...q, status: Q_STATUS_CYCLE[(Q_STATUS_CYCLE.indexOf(q.status) + 1) % Q_STATUS_CYCLE.length] }
      )};
    updateBank(next);
  }, [bank, updateBank]);

  const cycleCategory = useCallback((id: string) => {
    const cats = Q_CATEGORIES;
    const next = { ...bank };
    for (const k of Object.keys(next))
      next[k] = { ...next[k], questions: next[k].questions.map(q =>
        q.id !== id ? q : { ...q, category: cats[(cats.indexOf(q.category) + 1) % cats.length] }
      )};
    updateBank(next);
  }, [bank, updateBank]);

  const cycleDifficulty = useCallback((id: string) => {
    const next = { ...bank };
    for (const k of Object.keys(next))
      next[k] = { ...next[k], questions: next[k].questions.map(q => {
        if (q.id !== id) return q;
        const idx = q.difficulty ? DIFFICULTIES.indexOf(q.difficulty) : -1;
        return { ...q, difficulty: DIFFICULTIES[(idx + 1) % DIFFICULTIES.length] };
      })};
    updateBank(next);
  }, [bank, updateBank]);

  const clearDifficulty = useCallback((id: string) => {
    const next = { ...bank };
    for (const k of Object.keys(next)) next[k] = { ...next[k], questions: next[k].questions.map(q => q.id === id ? { ...q, difficulty: undefined } : q) };
    updateBank(next);
  }, [bank, updateBank]);

  const setConfidence = useCallback((id: string, conf: number | undefined) => {
    const next = { ...bank };
    for (const k of Object.keys(next)) next[k] = { ...next[k], questions: next[k].questions.map(q => q.id === id ? { ...q, confidence: conf } : q) };
    updateBank(next);
  }, [bank, updateBank]);

  const startEditQ = (q: BankQuestion) => { setEditQId(q.id); setEditQText(q.question); setEditQCat(q.category); };
  const saveEditQ = () => {
    if (!editQId || !editQText.trim()) return;
    const next = { ...bank };
    for (const k of Object.keys(next)) next[k] = { ...next[k], questions: next[k].questions.map(q => q.id === editQId ? { ...q, question: editQText.trim(), category: editQCat } : q) };
    updateBank(next); setEditQId(null);
  };

  const handleNoteChange = (id: string, val: string) => {
    setEditingNote(prev => ({ ...prev, [id]: val }));
    clearTimeout(noteTimers.current[id]);
    noteTimers.current[id] = setTimeout(() => {
      setBank(prev => {
        const next = { ...prev };
        for (const k of Object.keys(next)) next[k] = { ...next[k], questions: next[k].questions.map(q => q.id === id ? { ...q, notes: val } : q) };
        persistBank(next); return next;
      });
    }, 500);
  };

  const handleStarChange = (id: string, field: keyof StarNote, val: string) => {
    const current = starEditRef.current[id] ?? { situation: '', task: '', action: '', result: '' };
    const updated = { ...current, [field]: val };
    starEditRef.current[id] = updated;
    setStarEditState(prev => ({ ...prev, [id]: updated }));
    clearTimeout(starTimers.current[id]);
    starTimers.current[id] = setTimeout(() => {
      const star = starEditRef.current[id];
      setBank(prev => {
        const next = { ...prev };
        for (const k of Object.keys(next)) next[k] = { ...next[k], questions: next[k].questions.map(q => q.id === id ? { ...q, star } : q) };
        persistBank(next); return next;
      });
    }, 500);
  };

  const getStarVal = (q: BankQuestion, field: keyof StarNote) => starEditState[q.id]?.[field] ?? q.star?.[field] ?? '';

  const setInterviewDate = (key: string, date: string) => {
    const next = { ...bank };
    if (!next[key]) next[key] = { questions: [] };
    next[key] = { ...next[key], interviewDate: date || undefined };
    updateBank(next);
  };

  const setRoundDate = (key: string, label: string, date: string) => {
    const next = { ...bank };
    if (!next[key]) next[key] = { questions: [] };
    const rounds = [...(next[key].rounds || [])];
    const idx = rounds.findIndex(r => r.label === label);
    if (date) { idx >= 0 ? rounds[idx] = { label, date } : rounds.push({ label, date }); }
    else if (idx >= 0) rounds.splice(idx, 1);
    next[key] = { ...next[key], rounds: rounds.length ? rounds : undefined };
    updateBank(next);
  };

  // ── Role Templates ────────────────────────────────────────────

  const loadRoleTemplate = (roleName: string) => {
    const qs = ROLE_TEMPLATES[roleName];
    if (!qs) return;
    const k = `General:${roleName}`;
    const next = { ...bank };
    if (!next[k]) next[k] = { questions: [] };
    const existing = new Set(next[k].questions.map(q => q.question.toLowerCase()));
    const toAdd = qs.filter(t => !existing.has(t.q.toLowerCase())).map(t => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      company: 'General', role: roleName, question: t.q, category: t.cat,
      status: 'To Prepare' as QStatus, notes: '', dateAdded: new Date().toISOString(),
      difficulty: t.diff, source: 'Template',
    }));
    if (toAdd.length) {
      next[k] = { ...next[k], questions: [...next[k].questions, ...toAdd] };
      updateBank(next);
    }
    setSelectedKey(k); setShowTemplates(false); setTab('bank');
  };

  // ── Import ────────────────────────────────────────────────────

  const applyImportResult = useCallback((result: ParseResult) => {
    const valid = result.questions.filter(q => q.question);
    if (!valid.length) return;
    setBank(prev => {
      const next = { ...prev };
      for (const p of valid) {
        const company = (p.company || '').trim() || 'Unknown Company';
        const role    = (p.role    || '').trim() || 'Unknown Role';
        const k = `${company}:${role}`;
        if (!next[k]) next[k] = { questions: [] };
        next[k] = { ...next[k], questions: [...next[k].questions, {
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          company, role, question: p.question!, category: p.category || 'Behavioral',
          status: p.status || 'To Prepare', notes: p.notes || '',
          dateAdded: new Date().toISOString(),
          interviewDate: p.interviewDate || undefined,
          source: p.source || undefined,
          difficulty: p.difficulty || undefined,
          confidence: p.confidence || undefined,
        }]};
      }
      persistBank(next); return next;
    });
    setSelectedKey(ALL_KEY);
  }, []);

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setParseResult(null); setImportError(null);
    pendingFilenameRef.current = file.name;
    const reader = new FileReader();
    reader.onload = ev => {
      const content = ev.target?.result as string;
      const hash = hashContent(content);
      const prev = loadImports().find(r => r.hash === hash);
      if (prev) {
        const when = new Date(prev.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        setImportError(`"${prev.filename}" was already imported on ${when} (${prev.count} questions).`);
        e.target.value = ''; return;
      }
      const result = parseFile(file.name, content);
      if (result.needsMapping && result.rawHeaders && result.rawRows) {
        const init: Record<string, string> = {};
        result.rawHeaders.forEach(h => { init[h] = KNOWN_HEADERS[normalizeHeader(h)] || ''; });
        setMappingState({ headers: result.rawHeaders, rows: result.rawRows, filename: file.name, initialMapping: init });
      } else {
        setParseResult(result); applyImportResult(result);
        if (result.questions.length > 0) saveImport({ hash, filename: file.name, date: new Date().toISOString(), count: result.questions.length });
      }
    };
    reader.readAsText(file); e.target.value = '';
  };

  const handleMappingConfirm = (mapping: Record<string, string>) => {
    if (!mappingState) return;
    const result = applyColumnMapping(mappingState.headers, mappingState.rows, mapping, mappingState.filename);
    setParseResult(result); applyImportResult(result);
    if (result.questions.length > 0 && pendingFilenameRef.current) {
      const rawText = [mappingState.headers.join(','), ...mappingState.rows.map(r => r.join(','))].join('\n');
      saveImport({ hash: hashContent(rawText), filename: mappingState.filename, date: new Date().toISOString(), count: result.questions.length });
    }
    setMappingState(null);
  };

  const getExportQs = () => (!selectedKey || selectedKey === ALL_KEY) ? Object.values(bank).flatMap(b => b.questions) : (bank[selectedKey]?.questions || []);
  const exportScopeName = () => (!selectedKey || selectedKey === ALL_KEY) ? 'all' : selectedKey.replace(':', '-');

  // ── AI Coach ──────────────────────────────────────────────────

  const saveCoachQsToBank = useCallback(() => {
    if (!selectedJob || !coachResponse) return;
    const lines = coachResponse.split('\n');
    let inQ = false; const extracted: string[] = [];
    for (const line of lines) {
      if (/^##\s*.*question/i.test(line)) { inQ = true; continue; }
      if (/^##/.test(line)) { inQ = false; continue; }
      if (inQ) { const m = line.match(/^\d+\.\s+(.+)/); if (m) extracted.push(m[1].replace(/\*+/g, '').trim()); }
    }
    if (!extracted.length) return;
    const k = `${selectedJob.company}:${selectedJob.role}`;
    setBank(prev => {
      const next = { ...prev };
      if (!next[k]) next[k] = { questions: [] };
      const existing = new Set(next[k].questions.map(q => q.question.toLowerCase()));
      const toAdd = extracted.filter(q => !existing.has(q.toLowerCase()));
      if (!toAdd.length) return prev;
      next[k] = { ...next[k], questions: [...next[k].questions, ...toAdd.map(q => ({
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        company: selectedJob.company, role: selectedJob.role,
        question: q, category: detectCategory(q),
        status: 'To Prepare' as QStatus, notes: '', dateAdded: new Date().toISOString(), source: 'AI Coach',
      }))] };
      persistBank(next); return next;
    });
  }, [selectedJob, coachResponse]);

  const markCoachQAsked = useCallback((qText: string) => {
    if (!selectedJob) return;
    const k = `${selectedJob.company}:${selectedJob.role}`;
    setMarkedAsAsked(prev => new Set([...prev, qText.toLowerCase()]));
    setBank(prev => {
      const next = { ...prev };
      if (!next[k]) next[k] = { questions: [] };
      const existing = next[k].questions.find(q => q.question.toLowerCase() === qText.toLowerCase());
      if (existing) {
        next[k] = { ...next[k], questions: next[k].questions.map(q => q.id === existing.id ? { ...q, status: 'Asked in Interview' as QStatus } : q) };
      } else {
        next[k] = { ...next[k], questions: [...next[k].questions, {
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          company: selectedJob.company, role: selectedJob.role,
          question: qText, category: detectCategory(qText),
          status: 'Asked in Interview' as QStatus, notes: '',
          dateAdded: new Date().toISOString(), source: 'AI Coach',
        }]};
      }
      persistBank(next); return next;
    });
  }, [selectedJob]);

  const aiCoach = async () => {
    if (!selectedJob) return;
    const provider = activeProviders[selectedProvider];
    if (!provider) { setCoachError('No AI provider connected. Go to Settings → AI Providers.'); return; }
    setCoachLoading(true); setCoachError(''); setCoachResponse('');
    try {
      const jd = selectedJob.jdText ? `\n\nJob Description:\n${selectedJob.jdText.slice(0, 1500)}\n` : '';
      const prompt = `You are an expert interview coach. Help me prepare for my ${selectedJob.role} interview at ${selectedJob.company}.${jd}

Generate the following in clearly formatted sections:

## 10 Likely Interview Questions
List 10 role-specific questions (mix of behavioral, technical, and situational). Number each one.

## STAR Method Tips
For 3 of the behavioral questions above, show how to structure an answer using the STAR method (Situation, Task, Action, Result).

## Key Topics to Study
List 8–10 technical topics or concepts I should review before the interview, based on the role: ${selectedJob.role}${selectedJob.tags.length ? ` and tech stack: ${selectedJob.tags.join(', ')}` : ''}.

## Questions to Ask the Interviewer
Suggest 5 thoughtful questions I can ask at the end of the interview.`;
      const result = await callAI(provider, [{ role: 'user', content: prompt }]);
      setCoachResponse(result);
    } catch (e) { setCoachError(e instanceof Error ? e.message : 'AI call failed'); }
    finally { setCoachLoading(false); }
  };

  // ── AI Grade ──────────────────────────────────────────────────

  const gradeMyAnswer = async (q: BankQuestion) => {
    const provider = activeProviders[selectedProvider];
    if (!provider) return;
    const answer = gradeAnswerText[q.id] || '';
    if (!answer.trim()) return;
    setGradeLoading(q.id);
    try {
      const prompt = `You are an expert interview coach. Grade this interview answer.

Question: ${q.question}
Category: ${q.category}

Candidate's Answer:
${answer}

Evaluate using STAR (Situation/Task/Action/Result) if behavioral, or technical depth if technical/coding.

Provide:
1. Score: X/100 — one sentence why
2. What's strong
3. What's missing or weak
4. Improved version (complete rewrite of the answer, 3–5 sentences)

Be specific and constructive.`;
      const result = await callAI(provider, [{ role: 'user', content: prompt }]);
      setGradeResultMap(prev => ({ ...prev, [q.id]: result }));
    } catch (e) {
      setGradeResultMap(prev => ({ ...prev, [q.id]: `Error: ${e instanceof Error ? e.message : 'AI call failed'}` }));
    } finally { setGradeLoading(null); }
  };

  // ── Mock Interview ────────────────────────────────────────────

  const clearMockTimer = () => {
    if (mockTimerRef.current) { clearInterval(mockTimerRef.current); mockTimerRef.current = null; }
  };

  const startMockTimerFn = (secs: number) => {
    clearMockTimer();
    setMockTimeLeft(secs);
    mockTimerRef.current = setInterval(() => {
      setMockTimeLeft(t => { if (t <= 1) { clearInterval(mockTimerRef.current!); mockTimerRef.current = null; return 0; } return t - 1; });
    }, 1000);
  };

  const startMockSession = () => {
    const qs = bank[mockBucket]?.questions || [];
    const filtered = mockCatFilter ? qs.filter(q => q.category === mockCatFilter) : qs;
    if (!filtered.length) return;
    const shuffled = [...filtered].sort(() => Math.random() - 0.5);
    setMockSession(shuffled); setMockIndex(0); setMockRevealed(false);
    setMockRating(0); setMockSessionRatings({}); setMockDone(false);
    if (mockTimerSecs > 0) startMockTimerFn(mockTimerSecs);
  };

  const revealQuestion = () => {
    setMockRevealed(true);
    if (mockTimerSecs > 0 && mockTimeLeft === 0) startMockTimerFn(mockTimerSecs);
  };

  const nextMockQuestion = () => {
    if (!mockSession) return;
    const q = mockSession[mockIndex];
    clearMockTimer();
    if (mockRating > 0) {
      const newRatings = { ...mockSessionRatings, [q.id]: mockRating };
      setMockSessionRatings(newRatings);
      setBank(prev => {
        const next = { ...prev };
        for (const k of Object.keys(next))
          next[k] = { ...next[k], questions: next[k].questions.map(bq => {
            if (bq.id !== q.id) return bq;
            return { ...bq, practiceRatings: [...(bq.practiceRatings || []), mockRating].slice(-5) };
          })};
        persistBank(next); return next;
      });
    }
    if (mockIndex + 1 >= mockSession.length) { setMockDone(true); }
    else { setMockIndex(i => i + 1); setMockRevealed(false); setMockRating(0); if (mockTimerSecs > 0) startMockTimerFn(mockTimerSecs); }
  };

  const masteryTrend = (q: BankQuestion): '↑' | '↓' | '→' | null => {
    if (!q.practiceRatings || q.practiceRatings.length < 2) return null;
    const r = q.practiceRatings.slice(-2);
    return r[1] > r[0] ? '↑' : r[1] < r[0] ? '↓' : '→';
  };

  // ── Checklist ─────────────────────────────────────────────────

  const toggleCheck = (id: string) => {
    setCheckState(prev => {
      const next = { ...prev, [id]: !prev[id] };
      persistCheckState(selectedJobId, next);
      return next;
    });
  };

  const addCustomItem = () => {
    if (!newItemText.trim()) return;
    const item: CustomItem = { id: `ci-${Date.now()}`, text: newItemText.trim() };
    const next = [...customItems, item];
    setCustomItems(next); saveCustomItems(next); setNewItemText('');
  };

  const deleteCustomItem = (id: string) => {
    const next = customItems.filter(i => i.id !== id);
    setCustomItems(next); saveCustomItems(next);
    setCheckState(prev => { const n = { ...prev }; delete n[id]; persistCheckState(selectedJobId, n); return n; });
  };

  // ── Interview date badge ──────────────────────────────────────

  const interviewDateBadge = (key: string) => {
    const d = bank[key]?.interviewDate;
    if (!d) return null;
    const isPast = d < new Date().toISOString().split('T')[0];
    return (
      <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 4, fontWeight: 500, color: isPast ? 'var(--color-muted)' : 'var(--color-success)', background: isPast ? 'var(--color-border)' : 'rgba(16,185,129,0.12)' }}>
        {isPast ? `Interview was ${formatDate(d)} (Past)` : `Interview on ${formatDate(d)}`}
      </span>
    );
  };

  // ── Question Card ─────────────────────────────────────────────

  const renderQuestion = (q: BankQuestion, showMeta = false) => {
    const expanded = expandedId === q.id;
    const isEditing = editQId === q.id;
    const noteVal = editingNote[q.id] !== undefined ? editingNote[q.id] : q.notes;
    const trend = masteryTrend(q);

    return (
      <div key={q.id} className="card" style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            {showMeta && (q.company || q.role) && (
              <div style={{ fontSize: 11, color: 'var(--color-accent)', fontWeight: 600, marginBottom: 4 }}>
                {q.company}{q.role ? ` — ${q.role}` : ''}
              </div>
            )}

            {/* Inline edit mode */}
            {isEditing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 8 }}>
                <textarea
                  autoFocus
                  value={editQText}
                  onChange={e => setEditQText(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); saveEditQ(); } if (e.key === 'Escape') setEditQId(null); }}
                  style={{ width: '100%', fontSize: 13, minHeight: 72, resize: 'vertical', boxSizing: 'border-box' }}
                />
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <CustomSelect value={editQCat} onChange={v => setEditQCat(v as QCategory)} options={Q_CATEGORIES.map(c => ({ value: c, label: c }))} style={{ width: 160 }} />
                  <button className="btn btn-primary" style={{ fontSize: 11 }} onClick={saveEditQ}><Check size={12} /> Save</button>
                  <button className="btn btn-ghost" style={{ fontSize: 11 }} onClick={() => setEditQId(null)}><X size={12} /> Cancel</button>
                </div>
              </div>
            ) : (
              <div style={{ fontSize: 13, color: 'var(--color-text)', lineHeight: 1.55, marginBottom: 8 }}>
                {q.question}
              </div>
            )}

            {!isEditing && (
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                {/* Category — click to cycle */}
                <button title="Click to change category" onClick={() => cycleCategory(q.id)} style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 4, background: `${CAT_COLORS[q.category]}22`, color: CAT_COLORS[q.category], textTransform: 'uppercase', letterSpacing: '0.05em', border: 'none', cursor: 'pointer' }}>
                  {q.category}
                </button>

                {/* Status — click to cycle */}
                <button title="Click to advance status" onClick={() => cycleStatus(q.id)} style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 4, background: `${Q_STATUS_COLORS[q.status]}22`, color: Q_STATUS_COLORS[q.status], border: `1px solid ${Q_STATUS_COLORS[q.status]}44`, cursor: 'pointer' }}>
                  ● {q.status}
                </button>

                {/* Difficulty */}
                <button title="Click to cycle · Right-click to clear" onClick={() => cycleDifficulty(q.id)} onContextMenu={e => { e.preventDefault(); clearDifficulty(q.id); }} style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 4, background: q.difficulty ? `${DIFF_COLORS[q.difficulty]}22` : 'var(--color-border)', color: q.difficulty ? DIFF_COLORS[q.difficulty] : 'var(--color-muted)', border: 'none', cursor: 'pointer' }}>
                  {q.difficulty || '+ difficulty'}
                </button>

                {/* Confidence stars */}
                <div style={{ display: 'flex', gap: 1, alignItems: 'center', marginLeft: 2 }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star key={star} size={11} fill={q.confidence && star <= q.confidence ? 'currentColor' : 'none'} onClick={() => setConfidence(q.id, star === q.confidence ? undefined : star)} style={{ color: q.confidence && star <= q.confidence ? '#f59e0b' : 'var(--color-border)', cursor: 'pointer' }} />
                  ))}
                </div>

                {/* Practice trend */}
                {trend && <span style={{ fontSize: 11, color: trend === '↑' ? 'var(--color-success)' : trend === '↓' ? 'var(--color-danger)' : 'var(--color-muted)', fontWeight: 700 }} title={`Practice trend (last ${q.practiceRatings!.length} sessions)`}>{trend}</span>}

                {q.source && <span style={{ fontSize: 10, color: 'var(--color-muted)', marginLeft: 2 }}>via {q.source}</span>}
                <span style={{ fontSize: 10, color: 'var(--color-muted)', marginLeft: 'auto' }}>{formatDate(q.dateAdded)}</span>
              </div>
            )}
          </div>

          {!isEditing && (
            <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
              <button className="btn-icon" title="Edit question" onClick={() => startEditQ(q)}>
                <Pencil size={12} />
              </button>
              <button className="btn-icon" title="Notes / STAR" style={{ opacity: (q.notes || q.star?.situation) ? 1 : 0.5 }} onClick={() => setExpandedId(expanded ? null : q.id)}>
                {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              </button>
              <button className="btn-icon" title="Delete" style={{ color: 'var(--color-danger)' }} onClick={() => deleteQuestion(q.id)}>
                <Trash2 size={13} />
              </button>
            </div>
          )}
        </div>

        {/* Expanded panel */}
        {expanded && !isEditing && (
          <div style={{ marginTop: 12, borderTop: '1px solid var(--color-border)', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Notes */}
            <div>
              <div style={{ fontSize: 11, color: 'var(--color-muted)', marginBottom: 6 }}>📝 Notes</div>
              <textarea value={noteVal} onChange={e => handleNoteChange(q.id, e.target.value)} placeholder="Key points, resources, follow-up…" style={{ width: '100%', minHeight: 72, fontSize: 12, resize: 'vertical', boxSizing: 'border-box' }} />
            </div>

            {/* STAR accordion */}
            <div>
              <button onClick={() => setStarOpen(prev => ({ ...prev, [q.id]: !prev[q.id] }))} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 600, color: 'var(--color-accent)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                <Award size={12} /> STAR Method {starOpen[q.id] ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
              </button>
              {starOpen[q.id] && (
                <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {(['situation', 'task', 'action', 'result'] as const).map(field => (
                    <div key={field}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>{field}</div>
                      <textarea value={getStarVal(q, field)} onChange={e => handleStarChange(q.id, field, e.target.value)} placeholder={`Describe the ${field}…`} style={{ width: '100%', minHeight: 56, fontSize: 12, resize: 'vertical', boxSizing: 'border-box' }} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Grade My Answer */}
            <div>
              <button onClick={() => setGradeOpen(prev => ({ ...prev, [q.id]: !prev[q.id] }))} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 600, color: 'var(--color-accent)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                <Sparkles size={12} /> Grade My Answer {gradeOpen[q.id] ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
              </button>
              {gradeOpen[q.id] && (
                <div style={{ marginTop: 8 }}>
                  <textarea value={gradeAnswerText[q.id] || ''} onChange={e => setGradeAnswerText(prev => ({ ...prev, [q.id]: e.target.value }))} placeholder="Type your answer here to get AI feedback…" style={{ width: '100%', minHeight: 88, fontSize: 12, resize: 'vertical', boxSizing: 'border-box', marginBottom: 8 }} />
                  <button className="btn btn-ghost" style={{ fontSize: 11 }} onClick={() => gradeMyAnswer(q)} disabled={!gradeAnswerText[q.id]?.trim() || gradeLoading === q.id || !activeProviders[selectedProvider]}>
                    {gradeLoading === q.id ? <><RefreshCw size={11} style={{ animation: 'spin 1s linear infinite' }} /> Grading…</> : <><Sparkles size={11} /> Grade My Answer</>}
                  </button>
                  {!activeProviders[selectedProvider] && <span style={{ fontSize: 11, color: 'var(--color-muted)', marginLeft: 8 }}>No AI provider — configure in Settings</span>}
                  {gradeResultMap[q.id] && (
                    <div style={{ marginTop: 10, padding: '12px 14px', background: 'var(--color-surface-2)', borderRadius: 6, fontSize: 12, color: 'var(--color-text)', lineHeight: 1.65, whiteSpace: 'pre-wrap', borderLeft: '3px solid var(--color-accent)' }}>
                      {gradeResultMap[q.id]}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // ── Render coach response with Mark Asked buttons ─────────────

  const renderCoachResponse = (text: string) => {
    let inQSection = false;
    return text.split('\n').map((line, i) => {
      if (/^## /.test(line)) {
        inQSection = /question/i.test(line);
        return <div key={i} style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-accent)', marginTop: i === 0 ? 0 : 20, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{line.replace('## ', '')}</div>;
      }
      if (/^### /.test(line)) return <div key={i} style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text)', marginTop: 12, marginBottom: 4 }}>{line.replace('### ', '')}</div>;
      const numMatch = line.match(/^(\d+)\.\s+(.+)/);
      if (numMatch) {
        const qText = numMatch[2].replace(/\*+/g, '').trim();
        const isMarked = markedAsAsked.has(qText.toLowerCase());
        return (
          <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 6, paddingLeft: 4 }}>
            <span style={{ flex: 1 }}>{renderInline(line)}</span>
            {inQSection && selectedJob && (
              <button onClick={() => markCoachQAsked(qText)} style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 4, flexShrink: 0, whiteSpace: 'nowrap', background: isMarked ? 'rgba(16,185,129,0.15)' : 'var(--color-surface-2)', color: isMarked ? 'var(--color-success)' : 'var(--color-muted)', border: `1px solid ${isMarked ? 'rgba(16,185,129,0.4)' : 'var(--color-border)'}`, cursor: 'pointer' }}>
                {isMarked ? '✓ Asked' : 'Mark Asked'}
              </button>
            )}
          </div>
        );
      }
      if (/^[-•*] /.test(line)) return <div key={i} style={{ paddingLeft: 16, marginBottom: 4, color: 'var(--color-text-dim)' }}>{renderInline(line.replace(/^[-•*] /, ''))}</div>;
      if (/^\*\*.*\*\*$/.test(line.trim())) return <div key={i} style={{ fontWeight: 600, marginBottom: 4, marginTop: 8 }}>{renderInline(line)}</div>;
      if (line.trim() === '') return <div key={i} style={{ height: 6 }} />;
      return <div key={i} style={{ marginBottom: 4, color: 'var(--color-text-dim)', fontSize: 13, lineHeight: 1.65 }}>{renderInline(line)}</div>;
    });
  };

  // ── TABS ──────────────────────────────────────────────────────

  const TABS = [
    { id: 'bank',      label: dueCount > 0 ? `Question Bank  · ${dueCount} due` : 'Question Bank' },
    { id: 'mock',      label: 'Mock Interview' },
    { id: 'coach',     label: 'AI Coach'       },
    { id: 'checklist', label: 'Checklist'      },
  ] as const;

  // ─────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────

  return (
    <div style={{ padding: 24, flex: 1, overflow: 'auto' }}>
      {mappingState && (
        <ColumnMapModal headers={mappingState.headers} rows={mappingState.rows} filename={mappingState.filename} initialMapping={mappingState.initialMapping} onConfirm={handleMappingConfirm} onCancel={() => setMappingState(null)} />
      )}

      {/* Role templates modal */}
      {showTemplates && (
        <div className="modal-backdrop" onClick={() => setShowTemplates(false)}>
          <div className="modal" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text)' }}>Load Role Template</h2>
              <button className="btn-icon" onClick={() => setShowTemplates(false)}><X size={16} /></button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: 12, color: 'var(--color-muted)', marginBottom: 16, lineHeight: 1.6 }}>
                Load 20 starter questions for a common role. Questions go to a "General:{'{Role}'}" bucket — edit or import more anytime.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {Object.keys(ROLE_TEMPLATES).map(role => (
                  <button key={role} className="btn btn-ghost" style={{ justifyContent: 'flex-start', fontSize: 13 }} onClick={() => loadRoleTemplate(role)}>
                    <BookOpen size={13} /> {role} <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--color-muted)' }}>20 questions</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="page-tabs" style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {TABS.map(t => (
          <button key={t.id} className={`btn ${tab === t.id ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ─── QUESTION BANK ──────────────────────────────────────── */}
      {tab === 'bank' && (
        <div>
          {/* Top bar */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
              <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)', pointerEvents: 'none' }} />
              <input value={search} onChange={e => { setSearch(e.target.value); if (e.target.value) setSelectedKey(''); }} placeholder="Search questions across all companies…" style={{ paddingLeft: 30, width: '100%', boxSizing: 'border-box' }} />
            </div>
            <input ref={fileRef} type="file" accept=".csv,.json,.txt,.md" style={{ display: 'none' }} onChange={handleImport} />
            <button className="btn btn-ghost" style={{ fontSize: 12 }} onClick={() => fileRef.current?.click()}><Upload size={13} /> Import</button>

            <div style={{ position: 'relative' }}>
              <button className="btn btn-ghost" style={{ fontSize: 12 }} onClick={() => setShowExport(v => !v)}><Download size={13} /> Export <ChevronDown size={11} /></button>
              {showExport && (
                <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: 4, zIndex: 999, background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.5)', minWidth: 150, overflow: 'hidden' }}>
                  {[
                    { icon: <Table2 size={13} />,   label: 'CSV',      action: () => exportCSV(getExportQs(), `questions-${exportScopeName()}.csv`) },
                    { icon: <FileJson size={13} />, label: 'JSON',     action: () => exportJSON(getExportQs(), `questions-${exportScopeName()}.json`) },
                    { icon: <FileText size={13} />, label: 'Markdown', action: () => exportMarkdown(getExportQs(), exportScopeName()) },
                  ].map(item => (
                    <button key={item.label} onClick={() => { item.action(); setShowExport(false); }} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '9px 14px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--color-text)', textAlign: 'left' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-surface-2)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                      {item.icon} {item.label}
                    </button>
                  ))}
                  <div style={{ padding: '6px 14px 8px', borderTop: '1px solid var(--color-border)', fontSize: 11, color: 'var(--color-muted)' }}>{selectedKey ? `Exporting: ${selectedKey}` : 'Exporting: all questions'}</div>
                </div>
              )}
            </div>

            <button className="btn btn-ghost" style={{ fontSize: 12 }} onClick={() => setShowTemplates(true)}>
              <BookOpen size={13} /> Templates
            </button>
            <button className="btn btn-ghost" style={{ fontSize: 12 }} onClick={() => dlBlob(SAMPLE_CSV, 'sample-questions.csv', 'text/csv')}>Sample CSV</button>
          </div>

          {importError && (
            <div style={{ marginBottom: 12, padding: '10px 14px', fontSize: 12, borderRadius: 8, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <span style={{ flex: 1, color: 'var(--color-danger)' }}>⚠ {importError}</span>
              <button onClick={() => setImportError(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-muted)', padding: 2 }}><X size={12} /></button>
            </div>
          )}
          {parseResult && <ParseFeedback result={parseResult} onDismiss={() => setParseResult(null)} />}

          {/* Company dropdown + interview dates */}
          {!search && (
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 12, flexWrap: 'wrap' }}>
              <CustomSelect value={selectedKey} onChange={v => { setSelectedKey(v); setSearch(''); }}
                options={[
                  ...(totalCount > 0 ? [{ value: ALL_KEY, label: `All Questions (${totalCount})` }] : []),
                  ...allKeys.map(k => {
                    const count = bank[k]?.questions.length || 0;
                    const ci = k.indexOf(':');
                    return { value: k, label: k.slice(0, ci), sublabel: `${k.slice(ci + 1)}${count ? `  ·  ${count} q` : ''}` };
                  }),
                ]}
                placeholder="Select company & role…" style={{ maxWidth: 320 }}
              />
              {selectedKey && selectedKey !== ALL_KEY && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    {interviewDateBadge(selectedKey)}
                    <CustomDatePicker value={bank[selectedKey]?.interviewDate || ''} onChange={v => setInterviewDate(selectedKey, v)} placeholder="Overall interview date…" style={{ width: 180 }} />
                    <button className="btn btn-ghost" style={{ fontSize: 11 }} onClick={() => setShowRounds(prev => ({ ...prev, [selectedKey]: !prev[selectedKey] }))}>
                      <Clock size={11} /> Rounds {showRounds[selectedKey] ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                    </button>
                  </div>
                  {showRounds[selectedKey] && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingLeft: 4 }}>
                      {ROUND_LABELS.map(label => {
                        const round = bank[selectedKey]?.rounds?.find(r => r.label === label);
                        const isPast = round?.date && round.date < new Date().toISOString().split('T')[0];
                        return (
                          <div key={label} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <span style={{ fontSize: 11, color: 'var(--color-muted)', minWidth: 150 }}>{label}</span>
                            <CustomDatePicker value={round?.date || ''} onChange={v => setRoundDate(selectedKey, label, v)} placeholder="Set date…" style={{ width: 150 }} />
                            {round?.date && <span style={{ fontSize: 11, color: isPast ? 'var(--color-muted)' : 'var(--color-success)' }}>{isPast ? 'Past' : '→ Upcoming'}</span>}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Stats */}
          {selectedKey && !search && (bank[selectedKey]?.questions.length || 0) > 0 && (
            <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
              {Q_STATUS_CYCLE.map(s => stats[s] > 0 && (
                <span key={s} style={{ fontSize: 10, padding: '2px 7px', borderRadius: 4, fontWeight: 600, background: `${Q_STATUS_COLORS[s]}22`, color: Q_STATUS_COLORS[s] }}>{s}: {stats[s]}</span>
              ))}
            </div>
          )}

          {/* Filters */}
          {(selectedKey || search) && (
            <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              <CustomSelect value={filterCat} onChange={setFilterCat} options={[{ value: '', label: 'All Categories' }, ...Q_CATEGORIES.map(c => ({ value: c, label: c }))]} placeholder="All Categories" style={{ width: 150 }} />
              <CustomSelect value={filterStatus} onChange={setFilterStatus} options={[{ value: '', label: 'All Status' }, ...Q_STATUS_CYCLE.map(s => ({ value: s, label: s }))]} placeholder="All Status" style={{ width: 165 }} />
              <CustomSelect value={sortBy} onChange={v => setSortBy(v as typeof sortBy)}
                options={[
                  { value: 'dateAdded',  label: 'Sort: Date Added'      },
                  { value: 'confidence', label: 'Sort: Weakest First'   },
                  { value: 'category',   label: 'Sort: Category'        },
                  { value: 'status',     label: 'Sort: Status'          },
                  { value: 'difficulty', label: 'Sort: Difficulty'      },
                ]}
                placeholder="Sort" style={{ width: 175 }} />
              <button className={`btn ${filterDue ? 'btn-primary' : 'btn-ghost'}`} style={{ fontSize: 11 }} onClick={() => setFilterDue(v => !v)}>
                {dueCount > 0 && !filterDue && <span style={{ background: 'var(--color-danger)', color: '#fff', borderRadius: 8, padding: '0 5px', fontSize: 10, marginRight: 4 }}>{dueCount}</span>}
                Due for Review
              </button>
            </div>
          )}

          {/* Add question */}
          {selectedKey && selectedKey !== ALL_KEY && !search && (
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <input value={newQ} onChange={e => setNewQ(e.target.value)} onKeyDown={e => e.key === 'Enter' && addQuestion()} placeholder="Add a practice question…" style={{ flex: 1, minWidth: 0 }} />
              <CustomSelect value={newCat} onChange={v => setNewCat(v as QCategory)} options={Q_CATEGORIES.map(c => ({ value: c, label: c }))} placeholder="Category…" style={{ width: 145 }} />
              <button className="btn btn-primary" onClick={addQuestion}><Plus size={13} /></button>
            </div>
          )}

          {/* Empty state */}
          {!selectedKey && !search && (
            <div className="empty-state">
              <div>Select a company &amp; role to view questions</div>
              <div style={{ fontSize: 12, marginTop: 4 }}>Or search across all companies · Or load a role template above</div>
              <div style={{ fontSize: 11, color: 'var(--color-muted)', marginTop: 12, lineHeight: 1.8 }}>
                Import: CSV · JSON · TXT · Markdown<br />
                CSV columns: <code>Company, Role, Question, Category, Status, Notes, Difficulty, Confidence, Interview Date</code>
              </div>
            </div>
          )}

          {/* Search results */}
          {search && groupedSearch && Object.keys(groupedSearch).length === 0 && <div className="empty-state">No results for "{search}"</div>}
          {search && groupedSearch && Object.entries(groupedSearch).map(([key, qs]) => (
            <div key={key} style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {key.replace(':', ' — ')} <span style={{ fontWeight: 400 }}>({qs.length})</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{qs.map(q => renderQuestion(q, false))}</div>
            </div>
          ))}

          {/* All Questions grouped */}
          {!search && selectedKey === ALL_KEY && filteredQuestions.length === 0 && <div className="empty-state"><div>No questions in bank yet</div></div>}
          {!search && selectedKey === ALL_KEY && filteredQuestions.length > 0 && (() => {
            const grouped: Record<string, BankQuestion[]> = {};
            for (const q of filteredQuestions) { const k = `${q.company || 'Unknown'}:${q.role || 'Unknown'}`; grouped[k] = grouped[k] || []; grouped[k].push(q); }
            const bucketKeys = Object.keys(grouped);
            const allSelected = bucketKeys.length > 0 && bucketKeys.every(k => selectedBuckets.has(k));
            const anySelected = bucketKeys.some(k => selectedBuckets.has(k));
            const toggleBucket = (key: string) => setSelectedBuckets(prev => { const next = new Set(prev); next.has(key) ? next.delete(key) : next.add(key); return next; });
            const toggleAll = () => setSelectedBuckets(allSelected ? new Set() : new Set(bucketKeys));
            const deleteSelected = () => {
              const count = [...selectedBuckets].reduce((s, k) => s + (grouped[k]?.length || 0), 0);
              if (!window.confirm(`Delete ${count} question(s) across ${selectedBuckets.size} company bucket(s)?`)) return;
              const next = { ...bank }; for (const k of selectedBuckets) delete next[k]; updateBank(next);
              if (selectedBuckets.has(selectedKey)) setSelectedKey(ALL_KEY); setSelectedBuckets(new Set());
            };
            const deleteBucket = (key: string) => {
              if (!window.confirm(`Delete all ${grouped[key].length} question(s) for "${key.replace(':', ' — ')}"?`)) return;
              const next = { ...bank }; delete next[key]; updateBank(next);
              if (selectedKey === key) setSelectedKey(ALL_KEY); setSelectedBuckets(prev => { const s = new Set(prev); s.delete(key); return s; });
            };
            return (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, padding: '8px 12px', background: 'var(--color-surface-2)', borderRadius: 8, border: '1px solid var(--color-border)' }}>
                  <input type="checkbox" checked={allSelected} ref={el => { if (el) el.indeterminate = anySelected && !allSelected; }} onChange={toggleAll} style={{ width: 14, height: 14, cursor: 'pointer', accentColor: 'var(--color-accent)' }} />
                  <span style={{ fontSize: 12, color: 'var(--color-muted)', flex: 1 }}>{anySelected ? `${selectedBuckets.size} of ${bucketKeys.length} selected` : 'Select company buckets to delete'}</span>
                  {anySelected && <button onClick={deleteSelected} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, color: 'var(--color-danger)', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 6, padding: '4px 10px', cursor: 'pointer' }}><Trash2 size={12} /> Delete Selected ({selectedBuckets.size})</button>}
                </div>
                {bucketKeys.map(key => {
                  const qs = grouped[key]; const checked = selectedBuckets.has(key);
                  return (
                    <div key={key} style={{ marginBottom: 20 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <input type="checkbox" checked={checked} onChange={() => toggleBucket(key)} style={{ width: 13, height: 13, cursor: 'pointer', accentColor: 'var(--color-accent)', flexShrink: 0 }} />
                        {key.replace(':', ' — ')} <span style={{ fontWeight: 400 }}>({qs.length})</span>
                        <button onClick={() => setSelectedKey(key)} style={{ fontSize: 10, color: 'var(--color-accent)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}>View only →</button>
                        <button onClick={() => deleteBucket(key)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-danger)', opacity: 0.5, padding: 2, display: 'flex', alignItems: 'center' }} onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.opacity = '1'} onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.opacity = '0.5'}><Trash2 size={12} /></button>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{qs.map(q => renderQuestion(q, false))}</div>
                    </div>
                  );
                })}
              </>
            );
          })()}

          {/* Single company view */}
          {!search && selectedKey && selectedKey !== ALL_KEY && filteredQuestions.length === 0 && (
            <div className="empty-state"><div>No questions yet</div><div style={{ fontSize: 12, marginTop: 4 }}>Add one above or import a file</div></div>
          )}
          {!search && selectedKey && selectedKey !== ALL_KEY && filteredQuestions.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{filteredQuestions.map(q => renderQuestion(q, false))}</div>
          )}
        </div>
      )}

      {/* ─── MOCK INTERVIEW ───────────────────────────────────── */}
      {tab === 'mock' && (
        <div style={{ maxWidth: 640 }}>
          {/* Session complete */}
          {mockDone && mockSession && (
            <div className="card" style={{ padding: 32, textAlign: 'center' }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>🎉</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text)', marginBottom: 8 }}>Session Complete!</h3>
              <div style={{ fontSize: 14, color: 'var(--color-muted)', marginBottom: 20 }}>
                {Object.keys(mockSessionRatings).length} of {mockSession.length} questions rated
                {Object.keys(mockSessionRatings).length > 0 && (
                  <> · Avg rating: {(Object.values(mockSessionRatings).reduce((a, b) => a + b, 0) / Object.values(mockSessionRatings).length).toFixed(1)} ★</>
                )}
              </div>
              {/* Weakest questions */}
              {Object.entries(mockSessionRatings).filter(([, r]) => r <= 2).length > 0 && (
                <div style={{ textAlign: 'left', marginBottom: 20 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-danger)', marginBottom: 8 }}>Questions to revisit (rated ≤ 2):</div>
                  {Object.entries(mockSessionRatings).filter(([, r]) => r <= 2).map(([id]) => {
                    const q = mockSession.find(q => q.id === id);
                    return q ? <div key={id} style={{ fontSize: 12, color: 'var(--color-text)', padding: '4px 0', borderBottom: '1px solid var(--color-border)' }}>• {q.question}</div> : null;
                  })}
                </div>
              )}
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                <button className="btn btn-primary" onClick={startMockSession}><RefreshCw size={13} /> Restart</button>
                <button className="btn btn-ghost" onClick={() => { setMockSession(null); setMockDone(false); }}>Back to Setup</button>
              </div>
            </div>
          )}

          {/* Active session */}
          {mockSession && !mockDone && (() => {
            const q = mockSession[mockIndex];
            const progress = ((mockIndex) / mockSession.length) * 100;
            return (
              <div>
                {/* Progress */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 12, color: 'var(--color-muted)' }}>Question {mockIndex + 1} of {mockSession.length}</span>
                  {mockTimerSecs > 0 && (
                    <span style={{ fontSize: 13, fontWeight: 700, color: mockTimeLeft <= 10 && mockTimeLeft > 0 ? 'var(--color-danger)' : 'var(--color-text)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={13} /> {mockRevealed ? `${Math.floor(mockTimeLeft / 60)}:${String(mockTimeLeft % 60).padStart(2, '0')}` : '—'}
                    </span>
                  )}
                </div>
                <div style={{ height: 4, background: 'var(--color-border)', borderRadius: 2, marginBottom: 20, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${progress}%`, background: 'var(--color-accent)', borderRadius: 2, transition: 'width 0.3s' }} />
                </div>

                <div className="card" style={{ padding: 24, marginBottom: 16 }}>
                  {/* Category + difficulty badges */}
                  <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
                    <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 4, background: `${CAT_COLORS[q.category]}22`, color: CAT_COLORS[q.category], textTransform: 'uppercase' }}>{q.category}</span>
                    {q.difficulty && <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 4, background: `${DIFF_COLORS[q.difficulty]}22`, color: DIFF_COLORS[q.difficulty] }}>{q.difficulty}</span>}
                  </div>

                  {/* Hidden / revealed question */}
                  {!mockRevealed ? (
                    <div style={{ textAlign: 'center', padding: '24px 0' }}>
                      <div style={{ fontSize: 14, color: 'var(--color-muted)', marginBottom: 16 }}>Question is hidden — prepare your answer mentally, then reveal.</div>
                      <button className="btn btn-primary" style={{ fontSize: 14 }} onClick={revealQuestion}><Eye size={14} /> Reveal Question</button>
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontSize: 15, color: 'var(--color-text)', lineHeight: 1.6, fontWeight: 500, marginBottom: 16 }}>{q.question}</div>
                      {q.notes && <div style={{ fontSize: 12, color: 'var(--color-muted)', borderTop: '1px solid var(--color-border)', paddingTop: 12, lineHeight: 1.6 }}>Notes: {q.notes}</div>}
                    </div>
                  )}
                </div>

                {/* Rating */}
                {mockRevealed && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 12, color: 'var(--color-muted)', marginBottom: 8 }}>Rate your answer (1 = struggled, 5 = nailed it):</div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      {[1, 2, 3, 4, 5].map(n => (
                        <button key={n} onClick={() => setMockRating(n === mockRating ? 0 : n)} style={{ width: 36, height: 36, borderRadius: 6, fontSize: 16, fontWeight: 700, border: `2px solid ${mockRating >= n ? '#f59e0b' : 'var(--color-border)'}`, background: mockRating >= n ? 'rgba(245,158,11,0.15)' : 'var(--color-surface)', color: mockRating >= n ? '#f59e0b' : 'var(--color-muted)', cursor: 'pointer' }}>
                          {n}
                        </button>
                      ))}
                      {mockRating > 0 && <span style={{ fontSize: 12, color: 'var(--color-muted)', marginLeft: 8 }}>{['', 'Needs work', 'Weak', 'Okay', 'Good', 'Excellent'][mockRating]}</span>}
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: 8 }}>
                  {mockRevealed && (
                    <button className="btn btn-primary" onClick={nextMockQuestion}>
                      {mockIndex + 1 >= mockSession.length ? 'Finish Session' : 'Next →'}
                    </button>
                  )}
                  <button className="btn btn-ghost" style={{ fontSize: 12 }} onClick={() => { clearMockTimer(); setMockSession(null); setMockDone(false); }}>End Session</button>
                </div>
              </div>
            );
          })()}

          {/* Setup screen */}
          {!mockSession && !mockDone && (
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text)', marginBottom: 16 }}>Mock Interview Setup</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--color-muted)', marginBottom: 6 }}>Company & Role</div>
                  <CustomSelect value={mockBucket} onChange={setMockBucket}
                    options={allKeys.filter(k => (bank[k]?.questions.length || 0) > 0).map(k => ({ value: k, label: k.slice(0, k.indexOf(':')), sublabel: `${k.slice(k.indexOf(':') + 1)} · ${bank[k]?.questions.length} questions` }))}
                    placeholder="Select bucket…" style={{ maxWidth: 360 }} />
                </div>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--color-muted)', marginBottom: 6 }}>Filter by Category (optional)</div>
                  <CustomSelect value={mockCatFilter} onChange={setMockCatFilter}
                    options={[{ value: '', label: 'All Categories' }, ...Q_CATEGORIES.map(c => ({ value: c, label: c }))]}
                    style={{ maxWidth: 240 }} />
                </div>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--color-muted)', marginBottom: 6 }}>Timer per question</div>
                  <CustomSelect value={String(mockTimerSecs)} onChange={v => setMockTimerSecs(Number(v))}
                    options={[{ value: '0', label: 'No timer' }, { value: '30', label: '30 seconds' }, { value: '60', label: '1 minute' }, { value: '90', label: '90 seconds' }, { value: '120', label: '2 minutes' }, { value: '180', label: '3 minutes' }]}
                    style={{ maxWidth: 200 }} />
                </div>
                {mockBucket && (
                  <div style={{ fontSize: 12, color: 'var(--color-muted)' }}>
                    {(() => { const qs = bank[mockBucket]?.questions || []; const filtered = mockCatFilter ? qs.filter(q => q.category === mockCatFilter) : qs; return `${filtered.length} question${filtered.length !== 1 ? 's' : ''} will be shuffled`; })()}
                  </div>
                )}
                <button className="btn btn-primary" style={{ width: 'fit-content', fontSize: 14 }} onClick={startMockSession} disabled={!mockBucket || (bank[mockBucket]?.questions.length || 0) === 0}>
                  <Play size={14} /> Start Session
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── AI COACH ────────────────────────────────────────── */}
      {tab === 'coach' && (
        <div>
          <div style={{ marginBottom: 16 }}>
            <CustomSelect value={selectedJobId} onChange={setSelectedJobId}
              options={interviewJobs.map(j => ({ value: j.id, label: `${j.company} — ${j.role}` }))}
              placeholder="Select an application…" style={{ maxWidth: 320 }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={aiCoach} disabled={!selectedJob || coachLoading}>
              {coachLoading ? <><RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> Generating…</> : <><Sparkles size={14} /> Generate Interview Prep</>}
            </button>
            {coachResponse && !coachLoading && (
              <>
                <button className="btn btn-ghost" onClick={aiCoach} style={{ fontSize: 12 }}><RefreshCw size={12} /> Regenerate</button>
                <button className="btn btn-ghost" onClick={() => { saveCoachQsToBank(); setTab('bank'); setSelectedKey(`${selectedJob!.company}:${selectedJob!.role}`); }} style={{ fontSize: 12, color: 'var(--color-accent)' }}><Plus size={12} /> Save Questions to Bank</button>
              </>
            )}
            {!selectedJob && <span style={{ fontSize: 12, color: 'var(--color-muted)' }}>Select an application first</span>}
          </div>
          {coachError && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '12px 16px', fontSize: 13, color: 'var(--color-danger)', marginBottom: 16 }}>{coachError}</div>}
          {coachLoading && (
            <div className="card" style={{ padding: 24 }}>
              {[80, 60, 90, 55, 70, 65, 85, 50].map((w, i) => <div key={i} style={{ height: 14, background: 'var(--color-border)', borderRadius: 4, marginBottom: 10, width: `${w}%`, opacity: 0.5 }} />)}
            </div>
          )}
          {coachResponse && !coachLoading && (
            <div className="card" style={{ padding: '20px 24px', maxWidth: 720 }}>
              {renderCoachResponse(coachResponse)}
            </div>
          )}
          {!coachResponse && !coachLoading && !coachError && (
            <div className="card" style={{ textAlign: 'center', padding: 48 }}>
              <Sparkles size={40} style={{ color: 'var(--color-accent)', marginBottom: 16, opacity: 0.6 }} />
              <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text)', marginBottom: 8 }}>AI Interview Coach</h3>
              <p style={{ color: 'var(--color-muted)', fontSize: 13, lineHeight: 1.6 }}>
                Select an application above and click <strong>Generate Interview Prep</strong> to get role-specific questions, STAR method tips, and study topics.
                <br /><br />
                <span style={{ color: 'var(--color-muted)', fontSize: 12 }}>Numbered questions in the response will have a <strong>Mark Asked</strong> button — tap it after your interview to sync the question to your bank with "Asked in Interview" status.</span>
              </p>
            </div>
          )}
        </div>
      )}

      {/* ─── CHECKLIST ───────────────────────────────────────── */}
      {tab === 'checklist' && (
        <div style={{ maxWidth: 580 }}>
          <div style={{ marginBottom: 12 }}>
            <CustomSelect value={selectedJobId} onChange={setSelectedJobId}
              options={[{ value: '', label: 'General (no specific job)' }, ...interviewJobs.map(j => ({ value: j.id, label: `${j.company} — ${j.role}` }))]}
              placeholder="General (no specific job)" style={{ maxWidth: 320 }} />
          </div>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)', marginBottom: 12 }}>
            Pre-Interview Checklist{selectedJob ? ` — ${selectedJob.company}` : ''}
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {allChecklistItems.map((item) => (
              <div key={item.id} className="card" style={{ padding: '10px 14px', display: 'flex', gap: 10, alignItems: 'center' }}>
                <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }} onClick={() => toggleCheck(item.id)}>
                  {checkState[item.id] ? <CheckCircle size={16} style={{ color: 'var(--color-success)', flexShrink: 0 }} /> : <Circle size={16} style={{ color: 'var(--color-muted)', flexShrink: 0 }} />}
                </div>
                <span onClick={() => toggleCheck(item.id)} style={{ flex: 1, fontSize: 13, color: checkState[item.id] ? 'var(--color-muted)' : 'var(--color-text)', textDecoration: checkState[item.id] ? 'line-through' : 'none', cursor: 'pointer', lineHeight: 1.45 }}>
                  {item.text}
                </span>
                {!item.id.startsWith('d') && (
                  <button onClick={() => deleteCustomItem(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-danger)', opacity: 0.5, padding: 2, display: 'flex', alignItems: 'center', flexShrink: 0 }} onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.opacity = '1'} onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.opacity = '0.5'}>
                    <X size={12} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Add custom item */}
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <input value={newItemText} onChange={e => setNewItemText(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCustomItem()} placeholder="Add a checklist item…" style={{ flex: 1 }} />
            <button className="btn btn-primary" onClick={addCustomItem}><Plus size={13} /></button>
          </div>

          <div style={{ fontSize: 12, color: 'var(--color-muted)', marginTop: 12 }}>
            {allChecklistItems.filter(i => checkState[i.id]).length} / {allChecklistItems.length} completed
          </div>
        </div>
      )}
    </div>
  );
}
