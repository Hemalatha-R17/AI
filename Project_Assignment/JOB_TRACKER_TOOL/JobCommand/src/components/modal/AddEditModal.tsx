import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown, ChevronUp, Copy, Check, FileText, Paperclip, Download, Trash2, Library } from 'lucide-react';
import { useStore } from '../../store/useStore';
import type { Job, Status, Priority, JobType, Currency } from '../../types';
import { STATUSES, PRIORITIES, JOB_TYPES, CURRENCIES, SOURCES, CONTACT_ROLES, INTERVIEW_ROUNDS } from '../../lib/constants';
import { today } from '../../lib/format';
import { CustomSelect } from '../ui/CustomSelect';
import { CustomDatePicker } from '../ui/CustomDatePicker';

interface Props {
  job?: Job;
  onClose: () => void;
}

const blank = (): Omit<Job, 'id' | 'createdAt' | 'history'> => ({
  company: '', role: '', location: '', status: '' as Status, priority: '' as Priority,
  jobType: '' as JobType, currency: '' as Currency,
  salaryMin: null, salaryMax: null, tags: [],
  source: '', appliedDate: today(), nextAction: '', followUpDate: '', interviewRound: '',
  url: '', jdText: '',
  contactName: '', contactRole: '', contactEmail: '', contactPhone: '', notes: '',
  coverLetter: '',
  resumeName: '', resumeData: '', resumeType: '', resumeUpdatedAt: '',
});

function ResumePickerSection({ form, set, readResume }: {
  form: Record<string, unknown>;
  set: (field: string, value: unknown) => void;
  readResume: (file: File) => void;
}) {
  const resumes = useStore((s) => s.resumes);

  const attachFromLibrary = (id: string) => {
    const r = resumes.find((x) => x.id === id);
    if (!r) return;
    set('resumeName', r.label + (r.fileName.match(/\.[^.]+$/) ? r.fileName.match(/\.[^.]+$/)?.[0] : ''));
    set('resumeData', r.data);
    set('resumeType', r.type);
    set('resumeUpdatedAt', r.updatedAt);
  };

  const clear = () => {
    set('resumeName', ''); set('resumeData', ''); set('resumeType', ''); set('resumeUpdatedAt', '');
  };

  const download = () => {
    const a = document.createElement('a');
    a.href = `data:${form.resumeType};base64,${form.resumeData}`;
    a.download = form.resumeName as string;
    a.click();
  };

  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--color-muted)', textTransform: 'uppercase', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
        <Paperclip size={12} /> RESUME FOR THIS APPLICATION
        {!!(form.resumeName as string) && <span style={{ background: 'rgba(99,102,241,0.15)', color: 'var(--color-accent)', borderRadius: 999, padding: '1px 6px', fontSize: 9, fontWeight: 700 }}>ATTACHED</span>}
      </div>

      {form.resumeName ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--color-surface-2)', borderRadius: 8, padding: '10px 14px', border: '1px solid var(--color-border)' }}>
          <Paperclip size={14} style={{ color: 'var(--color-accent)', flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, color: 'var(--color-text)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{String(form.resumeName)}</div>
            {!!(form.resumeUpdatedAt as string) && <div style={{ fontSize: 11, color: 'var(--color-muted)' }}>Uploaded {new Date(String(form.resumeUpdatedAt)).toLocaleDateString()}</div>}
          </div>
          <button className="btn-icon" title="Download" onClick={download}><Download size={14} /></button>
          <button className="btn-icon" title="Remove" onClick={clear} style={{ color: 'var(--color-danger)' }}><Trash2 size={14} /></button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {/* Pick from library */}
          {resumes.length > 0 && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <Library size={14} style={{ color: 'var(--color-muted)', flexShrink: 0 }} />
              <CustomSelect
                value=""
                onChange={(v) => { if (v) attachFromLibrary(v); }}
                options={resumes.map((r) => ({ value: r.id, label: `${r.label} — ${r.fileName}` }))}
                placeholder="Pick from Resume Library…"
                style={{ flex: 1, fontSize: 13 }}
              />
            </div>
          )}
          {/* Or upload new */}
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', background: 'var(--color-surface-2)', border: '1px dashed var(--color-border)', borderRadius: 8, padding: '12px 16px' }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) readResume(f); }}
          >
            <Paperclip size={15} style={{ color: 'var(--color-muted)' }} />
            <span style={{ fontSize: 13, color: 'var(--color-muted)' }}>
              {resumes.length > 0 ? 'Or upload a new file (PDF, DOC, DOCX)' : 'Upload resume (PDF, DOC, DOCX) or drag & drop'}
            </span>
            <input type="file" accept=".pdf,.doc,.docx" style={{ display: 'none' }}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) readResume(f); e.target.value = ''; }}
            />
          </label>
        </div>
      )}
    </div>
  );
}

function F({ label, children, err }: { label: string; children: React.ReactNode; err?: string }) {
  return (
    <div className="form-group">
      <label>{label}</label>
      {children}
      {err && <span className="field-err">{err}</span>}
    </div>
  );
}

export function AddEditModal({ job, onClose }: Props) {
  const addJob    = useStore((s) => s.addJob);
  const updateJob = useStore((s) => s.updateJob);
  const jobs      = useStore((s) => s.jobs);
  const isEdit    = !!job;

  const [form, setForm]     = useState(job ? { ...job } : { ...blank(), id: '', createdAt: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tagsInput, setTagsInput] = useState((job?.tags || []).join(', '));
  const [contactOpen, setContactOpen] = useState(!!job?.contactName);
  const [coverOpen, setCoverOpen]     = useState(!!job?.coverLetter);
  const [clCopied, setClCopied]       = useState(false);
  const companyRef = useRef<HTMLInputElement>(null);

  useEffect(() => { companyRef.current?.focus(); }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') handleSave();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  });

  const set = (field: string, value: unknown) =>
    setForm((f) => ({ ...f, [field]: value }));

  const readResume = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      setForm((f) => ({
        ...f,
        resumeName: file.name,
        resumeData: base64,
        resumeType: file.type || 'application/octet-stream',
        resumeUpdatedAt: new Date().toISOString(),
      }));
    };
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.company.trim() || form.company.trim().length < 2)
      errs.company = 'Company must be at least 2 characters';
    if (!form.role.trim() || form.role.trim().length < 2)
      errs.role = 'Role must be at least 2 characters';
    if (!form.status)
      errs.status = 'Status is required';
    if (form.url && !/^https?:\/\//i.test(form.url))
      errs.url = 'URL must start with http:// or https://';
    if (form.salaryMin !== null && form.salaryMax !== null && form.salaryMin > form.salaryMax)
      errs.salaryMax = 'Max salary must be ≥ Min salary';
    if (form.appliedDate && form.appliedDate > today()) {
      if (!window.confirm('Application date is in the future — is that correct?'))
        errs.appliedDate = 'Future date — please verify';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    const now = new Date().toISOString();
    const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean);
    if (isEdit && job) {
      const historyEntry = job.status !== form.status
        ? [...(job.history || []), { status: form.status as Status, at: now }]
        : job.history;
      await updateJob({ ...job, ...form, tags, history: historyEntry });
    } else {
      const dupe = jobs.find(
        (j) => j.company.trim().toLowerCase() === form.company.trim().toLowerCase() &&
               j.role.trim().toLowerCase() === form.role.trim().toLowerCase()
      );
      if (dupe) {
        const proceed = window.confirm(
          `You already have a "${form.role}" application at ${form.company} (Status: ${dupe.status}).\n\nAdd anyway?`
        );
        if (!proceed) return;
      }
      const newJob: Job = {
        ...form,
        id: `job-${Date.now()}`,
        createdAt: now,
        tags,
        history: form.status ? [{ status: form.status as Status, at: now }] : [],
      };
      await addJob(newJob);
    }
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        className="modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          className="modal"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Header */}
          <div className="modal-header">
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text)' }}>
                {isEdit ? 'Edit Application' : 'Add Application'}
              </h2>
              <p style={{ fontSize: 12, color: 'var(--color-muted)', marginTop: 2 }}>
                Ctrl+Enter to save · Esc to close
              </p>
            </div>
            <button className="btn-icon" onClick={onClose}><X size={16} /></button>
          </div>

          {/* Body */}
          <div className="modal-body">
            {/* JOB DETAILS */}
            <div className="form-section-title">JOB DETAILS</div>
            <div className="form-row">
              <F label="Company *" err={errors.company}>
                <input
                  ref={companyRef}
                  value={form.company}
                  onChange={(e) => set('company', e.target.value)}
                  placeholder="e.g. Anthropic"
                />
              </F>
              <F label="Role / Title *" err={errors.role}>
                <input
                  value={form.role}
                  onChange={(e) => set('role', e.target.value)}
                  placeholder="e.g. Senior Engineer"
                />
              </F>
            </div>

            <div className="form-row">
              <F label="Status *" err={errors.status}>
                <CustomSelect
                  value={form.status}
                  onChange={(v) => set('status', v)}
                  options={STATUSES}
                  placeholder="Select status…"
                />
              </F>
              <F label="Location">
                <input
                  value={form.location}
                  onChange={(e) => set('location', e.target.value)}
                  placeholder="e.g. Remote or San Francisco"
                />
              </F>
            </div>

            {/* Salary */}
            <div className="form-group">
              <label>Salary Range</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <CustomSelect
                  value={form.currency}
                  onChange={(v) => set('currency', v)}
                  options={CURRENCIES}
                  placeholder="Currency"
                  style={{ flex: '0 0 110px' }}
                />
                <input
                  type="number" min={0} step={1000}
                  value={form.salaryMin ?? ''}
                  onChange={(e) => set('salaryMin', e.target.value === '' ? null : Number(e.target.value))}
                  placeholder="Min e.g. 120000"
                  style={{ flex: 1 }}
                />
                <input
                  type="number" min={0} step={1000}
                  value={form.salaryMax ?? ''}
                  onChange={(e) => set('salaryMax', e.target.value === '' ? null : Number(e.target.value))}
                  placeholder="Max e.g. 150000"
                  style={{ flex: 1 }}
                />
              </div>
              {errors.salaryMax && <span className="field-err">{errors.salaryMax}</span>}
              <span style={{ fontSize: 11, color: 'var(--color-muted)', marginTop: 4, display: 'block' }}>
                Enter annual amount as a number — e.g. 700000 for ₹7L
              </span>
            </div>

            <div className="form-row">
              <F label="Job Type">
                <CustomSelect
                  value={form.jobType}
                  onChange={(v) => set('jobType', v)}
                  options={JOB_TYPES}
                  placeholder="Select type…"
                />
              </F>
              <F label="Priority">
                <CustomSelect
                  value={form.priority}
                  onChange={(v) => set('priority', v)}
                  options={PRIORITIES}
                  placeholder="Select priority…"
                />
              </F>
            </div>

            <F label="Tech Stack Tags (comma-separated)">
              <input
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="React, TypeScript, Node.js"
              />
            </F>

            {/* TRACKING */}
            <div className="form-section-title" style={{ marginTop: 8 }}>TRACKING</div>

            <div className="form-row">
              <F label="Source">
                <CustomSelect
                  value={form.source}
                  onChange={(v) => set('source', v)}
                  options={SOURCES}
                  placeholder="Select source…"
                />
              </F>
              <F label="Application Date" err={errors.appliedDate}>
                <CustomDatePicker
                  value={form.appliedDate}
                  onChange={(v) => set('appliedDate', v)}
                />
              </F>
            </div>

            <div className="form-row">
              <F label="Next Action">
                <input
                  value={form.nextAction}
                  onChange={(e) => set('nextAction', e.target.value)}
                  placeholder="e.g. Send thank-you note"
                />
              </F>
              <F label="Follow-up Date">
                <CustomDatePicker
                  value={form.followUpDate}
                  onChange={(v) => set('followUpDate', v)}
                />
              </F>
            </div>

            {(form.status === 'Interview' || form.status === 'Phone Screen') && (
              <div className="form-row">
                {form.status === 'Interview' && (
                  <F label="Interview Round">
                    <CustomSelect
                      value={form.interviewRound}
                      onChange={(v) => set('interviewRound', v)}
                      options={INTERVIEW_ROUNDS}
                      placeholder="Select round…"
                    />
                  </F>
                )}
                <F label="Interview Date (scheduled)">
                  <CustomDatePicker
                    value={form.interviewDate || ''}
                    onChange={(v) => set('interviewDate', v)}
                  />
                </F>
              </div>
            )}

            <F label="Job Posting URL" err={errors.url}>
              <input
                type="url"
                value={form.url}
                onChange={(e) => set('url', e.target.value)}
                placeholder="https://company.com/careers/role"
              />
            </F>

            <F label="Job Description (paste for AI matching)">
              <textarea
                rows={3}
                value={form.jdText}
                onChange={(e) => set('jdText', e.target.value)}
                placeholder="Paste the full job description here…"
              />
            </F>

            {/* CONTACT & NOTES (collapsible) */}
            <div
              className="collapsible-header"
              onClick={() => setContactOpen((o) => !o)}
              style={{ marginTop: 8 }}
            >
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--color-muted)', textTransform: 'uppercase' }}>
                CONTACT & NOTES (optional)
              </span>
              {contactOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </div>

            {contactOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
              >
                <div className="form-row">
                  <F label="Contact Name">
                    <input
                      value={form.contactName}
                      onChange={(e) => set('contactName', e.target.value)}
                      placeholder="e.g. Sarah Chen"
                    />
                  </F>
                  <F label="Contact Role">
                    <CustomSelect
                      value={form.contactRole}
                      onChange={(v) => set('contactRole', v)}
                      options={CONTACT_ROLES}
                      placeholder="Select…"
                    />
                  </F>
                </div>
                <div className="form-row">
                  <F label="Email">
                    <input
                      type="email"
                      value={form.contactEmail}
                      onChange={(e) => set('contactEmail', e.target.value)}
                      placeholder="recruiter@company.com"
                    />
                  </F>
                  <F label="Phone">
                    <input
                      value={form.contactPhone}
                      onChange={(e) => set('contactPhone', e.target.value)}
                      placeholder="+1-555-0100"
                    />
                  </F>
                </div>
                <F label="Notes">
                  <textarea
                    rows={3}
                    value={form.notes}
                    onChange={(e) => set('notes', e.target.value)}
                    placeholder="Notes about this application…"
                  />
                </F>
              </motion.div>
            )}

            {/* Status history */}
            {isEdit && job && job.history && job.history.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--color-muted)', textTransform: 'uppercase', marginBottom: 10 }}>
                  STATUS TIMELINE
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {job.history.map((h, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-accent)', flexShrink: 0 }} />
                      <span style={{ color: 'var(--color-text)', fontWeight: 500 }}>{h.status}</span>
                      <span style={{ color: 'var(--color-muted)' }}>
                        {new Date(h.at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Cover Letter (edit mode only, shown if one exists) */}
            {isEdit && (
              <div style={{ marginTop: 16 }}>
                <div
                  className="collapsible-header"
                  onClick={() => setCoverOpen((o) => !o)}
                  style={{ cursor: 'pointer' }}
                >
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--color-muted)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <FileText size={12} /> COVER LETTER
                    {form.coverLetter && <span style={{ background: 'rgba(16,185,129,0.15)', color: 'var(--color-success)', borderRadius: 999, padding: '1px 6px', fontSize: 9, fontWeight: 700 }}>SAVED</span>}
                  </span>
                  {coverOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </div>
                {coverOpen && (
                  <div style={{ marginTop: 8 }}>
                    {form.coverLetter ? (
                      <>
                        <textarea
                          rows={8}
                          value={form.coverLetter}
                          onChange={(e) => set('coverLetter', e.target.value)}
                          style={{ fontFamily: 'var(--font-sans)', fontSize: 12, lineHeight: 1.6 }}
                        />
                        <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                          <button
                            className="btn btn-ghost"
                            style={{ fontSize: 11, padding: '4px 10px' }}
                            onClick={() => {
                              navigator.clipboard.writeText(form.coverLetter);
                              setClCopied(true);
                              setTimeout(() => setClCopied(false), 2000);
                            }}
                          >
                            {clCopied ? <Check size={11} /> : <Copy size={11} />}
                            {clCopied ? 'Copied!' : 'Copy'}
                          </button>
                          <button
                            className="btn btn-ghost"
                            style={{ fontSize: 11, padding: '4px 10px', color: 'var(--color-danger)' }}
                            onClick={() => set('coverLetter', '')}
                          >
                            Clear
                          </button>
                        </div>
                      </>
                    ) : (
                      <div style={{ fontSize: 12, color: 'var(--color-muted)', padding: '12px 0' }}>
                        No cover letter saved yet. Generate one from the <strong>Cover Letter Gen</strong> page and click "Save to Application".
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            {/* RESUME FOR THIS APPLICATION */}
            <ResumePickerSection form={form} set={set} readResume={readResume} />
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave}>
              {isEdit ? 'Save Changes' : 'Add Application'}
              <span style={{ fontSize: 10, opacity: 0.7, marginLeft: 4 }}>Ctrl+↵</span>
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
