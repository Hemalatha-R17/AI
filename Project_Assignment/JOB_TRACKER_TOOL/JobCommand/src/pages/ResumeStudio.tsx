import { useState } from 'react';
import { Upload, FileText, Sparkles, Trash2, Download, Eye, Pencil, Check, X, Paperclip } from 'lucide-react';
import { useStore, useProfile } from '../store/useStore';
import type { ResumeEntry } from '../types';

export function ResumeStudio() {
  const profile       = useProfile();
  const updateProfile = useStore((s) => s.updateProfile);
  const setAI         = useStore((s) => s.setAiPanelOpen);
  const setPrompt     = useStore((s) => s.setAiPanelPrompt);
  const resumes       = useStore((s) => s.resumes);
  const addResume     = useStore((s) => s.addResume);
  const updateResume  = useStore((s) => s.updateResume);
  const deleteResume  = useStore((s) => s.deleteResume);
  const addToast      = useStore((s) => s.addToast);

  const [tab, setTab]   = useState<'resumes' | 'analyzer' | 'skills'>('resumes');
  const [jd, setJd]     = useState('');
  const [skills, setSkills] = useState(profile.skillProfile || '');

  // Edit state
  const [editId, setEditId]     = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [editNotes, setEditNotes] = useState('');

  const readFile = (file: File): Promise<{ data: string; type: string }> =>
    new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve({ data: base64, type: file.type || 'application/octet-stream' });
      };
      reader.readAsDataURL(file);
    });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    const { data, type } = await readFile(file);
    const now = new Date().toISOString();
    const entry: ResumeEntry = {
      id: `resume-${Date.now()}`,
      label: file.name.replace(/\.[^/.]+$/, ''),
      fileName: file.name,
      data, type,
      notes: '',
      uploadedAt: now,
      updatedAt: now,
    };
    await addResume(entry);
  };

  const handleReplaceFile = async (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    const existing = resumes.find((r) => r.id === id);
    if (!existing) return;
    const { data, type } = await readFile(file);
    await updateResume({ ...existing, data, type, fileName: file.name, updatedAt: new Date().toISOString() });
  };

  const viewResume = (r: ResumeEntry) => {
    if (!r.data) return;
    const byteChars = atob(r.data);
    const byteArr = new Uint8Array(byteChars.length);
    for (let i = 0; i < byteChars.length; i++) byteArr[i] = byteChars.charCodeAt(i);
    const blob = new Blob([byteArr], { type: r.type });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  };

  const downloadResume = (r: ResumeEntry) => {
    const a = document.createElement('a');
    a.href = `data:${r.type};base64,${r.data}`;
    a.download = r.fileName;
    a.click();
  };

  const startEdit = (r: ResumeEntry) => {
    setEditId(r.id);
    setEditLabel(r.label);
    setEditNotes(r.notes);
  };

  const saveEdit = async () => {
    const r = resumes.find((x) => x.id === editId);
    if (!r) return;
    await updateResume({ ...r, label: editLabel.trim() || r.label, notes: editNotes, updatedAt: new Date().toISOString() });
    setEditId(null);
  };

  const analyzeResume = () => {
    const resumeContext = profile.masterResume
      ? `My Resume:\n${profile.masterResume}`
      : skills
      ? `My Skills: ${skills}`
      : '(no resume text or skill profile provided — add one in the Skill Profile tab)';

    setPrompt(`Analyze this job description against my resume/skills profile.

JD: ${jd || 'No JD provided'}

${resumeContext}

Provide:
1. Match score (0-100%)
2. Matching skills
3. Missing skills
4. Top 3 suggested improvements for my resume`);
    setAI(true);
  };

  const saveSkills = () => {
    updateProfile({ skillProfile: skills });
    addToast('Skill profile saved', 'success');
  };

  return (
    <div style={{ padding: 24, flex: 1, overflow: 'auto' }}>
      <div className="page-tabs" style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {[['resumes','Resume Library'], ['analyzer','AI Analyzer'], ['skills','Skill Profile']].map(([id, label]) => (
          <button key={id} className={`btn ${tab === id ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab(id as typeof tab)}>
            {label}
          </button>
        ))}
      </div>

      {/* ── RESUME LIBRARY ─────────────────────────────────────────────── */}
      {tab === 'resumes' && (
        <div style={{ maxWidth: 720 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ fontSize: 13, color: 'var(--color-muted)' }}>
              {resumes.length} resume{resumes.length !== 1 ? 's' : ''} in library · Pick one when adding a job application
            </div>
            <label style={{ cursor: 'pointer' }}>
              <input type="file" accept=".pdf,.doc,.docx" onChange={handleUpload} style={{ display: 'none' }} />
              <div className="btn btn-primary" style={{ display: 'inline-flex' }}>
                <Upload size={13} /> Upload Resume
              </div>
            </label>
          </div>

          {resumes.length === 0 ? (
            <div className="empty-state">
              <FileText size={40} style={{ opacity: 0.3 }} />
              <div>No resumes yet</div>
              <div style={{ fontSize: 12 }}>Upload resumes here, then attach them to job applications</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {resumes.map((r) => (
                <div key={r.id} className="card" style={{ padding: '14px 16px' }}>
                  {editId === r.id ? (
                    /* ── Edit mode ── */
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label style={{ fontSize: 11 }}>Label</label>
                        <input
                          value={editLabel}
                          onChange={(e) => setEditLabel(e.target.value)}
                          placeholder="e.g. QA Automation – 2026"
                          autoFocus
                        />
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label style={{ fontSize: 11 }}>Notes</label>
                        <input
                          value={editNotes}
                          onChange={(e) => setEditNotes(e.target.value)}
                          placeholder="e.g. Tailored for fintech roles"
                        />
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-primary" style={{ fontSize: 12, padding: '5px 12px' }} onClick={saveEdit}>
                          <Check size={12} /> Save
                        </button>
                        <button className="btn btn-ghost" style={{ fontSize: 12, padding: '5px 12px' }} onClick={() => setEditId(null)}>
                          <X size={12} /> Cancel
                        </button>
                        <label style={{ cursor: 'pointer', marginLeft: 'auto' }}>
                          <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => handleReplaceFile(r.id, e)} style={{ display: 'none' }} />
                          <div className="btn btn-ghost" style={{ fontSize: 12, padding: '5px 12px', display: 'inline-flex' }}>
                            <Paperclip size={12} /> Replace File
                          </div>
                        </label>
                      </div>
                    </div>
                  ) : (
                    /* ── View mode ── */
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                      <FileText size={22} style={{ color: 'var(--color-accent)', flexShrink: 0, marginTop: 2 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, color: 'var(--color-text)', fontSize: 14 }}>{r.label}</div>
                        <div style={{ fontSize: 12, color: 'var(--color-muted)', marginTop: 1 }}>{r.fileName}</div>
                        {r.notes && <div style={{ fontSize: 12, color: 'var(--color-text-dim)', marginTop: 4, fontStyle: 'italic' }}>{r.notes}</div>}
                        <div style={{ fontSize: 11, color: 'var(--color-muted)', marginTop: 4 }}>
                          Uploaded {new Date(r.uploadedAt).toLocaleDateString()}
                          {r.updatedAt !== r.uploadedAt && ` · Updated ${new Date(r.updatedAt).toLocaleDateString()}`}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                        {r.type === 'application/pdf' && (
                          <button className="btn-icon" title="View" onClick={() => viewResume(r)}>
                            <Eye size={14} />
                          </button>
                        )}
                        <button className="btn-icon" title="Download" onClick={() => downloadResume(r)}>
                          <Download size={14} />
                        </button>
                        <button className="btn-icon" title="Edit label / notes" onClick={() => startEdit(r)}>
                          <Pencil size={14} />
                        </button>
                        <button
                          className="btn-icon"
                          title="Delete"
                          style={{ color: 'var(--color-danger)' }}
                          onClick={() => { if (window.confirm(`Delete "${r.label}"?`)) deleteResume(r.id); }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── AI ANALYZER ─────────────────────────────────────────────────── */}
      {tab === 'analyzer' && (
        <div style={{ maxWidth: 640 }}>
          <div className="form-group">
            <label>Paste Job Description</label>
            <textarea
              rows={8}
              value={jd}
              onChange={(e) => setJd(e.target.value)}
              placeholder="Paste the full job description here…"
            />
          </div>
          <button className="btn btn-primary" onClick={analyzeResume}>
            <Sparkles size={14} /> Analyze vs My Profile
          </button>
          <p style={{ fontSize: 12, color: 'var(--color-muted)', marginTop: 8 }}>
            {profile.masterResume
              ? 'AI will compare the JD against your Master Resume text.'
              : skills
              ? 'AI will compare the JD against your Skill Profile. For better results, add your full resume text in the Skill Profile tab → Master Resume.'
              : 'No resume text found — add your resume in the Skill Profile tab before analyzing.'}
          </p>
        </div>
      )}

      {/* ── SKILL PROFILE ───────────────────────────────────────────────── */}
      {tab === 'skills' && (
        <div style={{ maxWidth: 640 }}>
          <div className="form-group">
            <label>My Skill Profile (comma-separated)</label>
            <textarea
              rows={6}
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="React, TypeScript, Node.js, PostgreSQL, Docker, AWS…"
            />
          </div>
          <div className="form-group">
            <label>Master Resume Text (for AI tools)</label>
            <textarea
              rows={8}
              value={profile.masterResume}
              onChange={(e) => updateProfile({ masterResume: e.target.value })}
              placeholder="Paste your resume text here. AI tools will use this automatically."
            />
          </div>
          <button className="btn btn-primary" onClick={saveSkills}>Save Profile</button>
        </div>
      )}
    </div>
  );
}
