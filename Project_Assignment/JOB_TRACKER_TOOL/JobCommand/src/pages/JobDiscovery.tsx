import { useState } from 'react';
import { Search, Bookmark, Sparkles, ExternalLink, Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import { useStore, useJobs } from '../store/useStore';
import { today } from '../lib/format';
import { SOURCES } from '../lib/constants';
import { CustomSelect } from '../components/ui/CustomSelect';
import type { Job, Bookmark as BK } from '../types';

export function JobDiscovery() {
  const jobs           = useJobs();
  const addJob         = useStore((s) => s.addJob);
  const addToast       = useStore((s) => s.addToast);
  const setAI          = useStore((s) => s.setAiPanelOpen);
  const setPrompt      = useStore((s) => s.setAiPanelPrompt);
  const bookmarks      = useStore((s) => s.bookmarks);
  const addBookmark    = useStore((s) => s.addBookmark);
  const updateBookmark = useStore((s) => s.updateBookmark);
  const deleteBookmark = useStore((s) => s.deleteBookmark);

  // New bookmark form
  const [company, setCompany] = useState('');
  const [role, setRole]       = useState('');
  const [url, setUrl]         = useState('');
  const [notes, setNotes]     = useState('');
  const [source, setSource]   = useState('');

  // Inline edit state
  const [editId, setEditId]     = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<BK>>({});

  // JD parser state
  const [jdText, setJdText]       = useState('');
  const [jdCompany, setJdCompany] = useState('');
  const [jdRole, setJdRole]       = useState('');
  const [jdSource, setJdSource]   = useState('');
  const [jdCreating, setJdCreating] = useState(false);

  const [tab, setTab]             = useState<'bookmarks' | 'parser'>('bookmarks');
  const [searchQuery, setSearchQuery] = useState('');

  // ── Bookmark actions ──────────────────────────────────────────────────────

  const isDupe = (comp: string, rl: string) =>
    jobs.some(
      (j) => j.company.trim().toLowerCase() === comp.trim().toLowerCase() &&
             j.role.trim().toLowerCase()    === rl.trim().toLowerCase()
    );

  const handleAddBookmark = async () => {
    if (!company.trim() || !role.trim()) return;
    await addBookmark({
      id: `bk-${Date.now()}`,
      company: company.trim(),
      role: role.trim(),
      url, notes,
      source,
      addedAt: today(),
    });
    setCompany(''); setRole(''); setUrl(''); setNotes(''); setSource('');
  };

  const startEdit = (bk: BK) => {
    setEditId(bk.id);
    setEditForm({ ...bk });
  };

  const saveEdit = async () => {
    if (!editId) return;
    const bk = bookmarks.find((b) => b.id === editId);
    if (!bk) return;
    await updateBookmark({ ...bk, ...editForm } as BK);
    setEditId(null);
  };

  const convertToApplication = async (bk: BK) => {
    if (isDupe(bk.company, bk.role)) {
      addToast(`"${bk.role}" at ${bk.company} already exists in your tracker`, 'error');
      return;
    }
    const job: Job = {
      id: `job-${Date.now()}`,
      createdAt: new Date().toISOString(),
      company: bk.company,
      role: bk.role,
      location: '',
      status: 'Saved',
      priority: 'Medium',
      jobType: 'Full-time',
      currency: 'USD',
      salaryMin: null,
      salaryMax: null,
      tags: [],
      source: bk.source || 'Company Website',
      appliedDate: '',
      nextAction: '',
      followUpDate: '',
      interviewRound: '',
      url: bk.url,
      jdText: '',
      contactName: '',
      contactRole: '',
      contactEmail: '',
      contactPhone: '',
      notes: bk.notes,
      history: [{ status: 'Saved', at: new Date().toISOString() }],
      coverLetter: '',
      resumeName: '', resumeData: '', resumeType: '', resumeUpdatedAt: '',
    };
    await addJob(job);
    await deleteBookmark(bk.id);
  };

  // ── JD parser actions ─────────────────────────────────────────────────────

  const parseJD = () => {
    if (!jdText.trim()) return;
    setPrompt(`Parse this job description and extract:
1. Required skills (as comma-separated list)
2. Years of experience required
3. Salary range (if mentioned)
4. Location
5. Role summary (2-3 sentences)

JD:
${jdText}`);
    setAI(true);
  };

  const createFromJD = async () => {
    if (!jdCompany.trim() || !jdRole.trim()) {
      addToast('Enter company and role to create an application', 'error');
      return;
    }
    if (isDupe(jdCompany, jdRole)) {
      addToast(`"${jdRole}" at ${jdCompany} already exists in your tracker`, 'error');
      return;
    }
    setJdCreating(true);
    const job: Job = {
      id: `job-${Date.now()}`,
      createdAt: new Date().toISOString(),
      company: jdCompany.trim(),
      role: jdRole.trim(),
      location: '',
      status: 'Saved',
      priority: 'Medium',
      jobType: 'Full-time',
      currency: 'USD',
      salaryMin: null,
      salaryMax: null,
      tags: [],
      source: jdSource || 'Company Website',
      appliedDate: '',
      nextAction: '',
      followUpDate: '',
      interviewRound: '',
      url: '',
      jdText: jdText.trim(),
      contactName: '',
      contactRole: '',
      contactEmail: '',
      contactPhone: '',
      notes: '',
      history: [{ status: 'Saved', at: new Date().toISOString() }],
      coverLetter: '',
      resumeName: '', resumeData: '', resumeType: '', resumeUpdatedAt: '',
    };
    await addJob(job);
    setJdCompany(''); setJdRole(''); setJdSource(''); setJdText('');
    setJdCreating(false);
  };

  const aiSearch = () => {
    let prompt: string;
    if (jdText.trim()) {
      prompt = `Based on the following job description, suggest 5 similar roles and companies I should target. For each suggestion include: company name, role title, why it's a good fit, and where to find the job posting.

Job Description:
${jdText}`;
    } else if (searchQuery.trim()) {
      prompt = `Help me find relevant job postings. I am looking for: ${searchQuery}. Suggest 5 specific companies that would be a great fit, the exact role title to search for, and why each is a match.`;
    } else {
      prompt = `Help me discover relevant job opportunities. Ask me what kind of role, location, and experience level I am targeting, then suggest 5 specific companies and job titles I should apply to.`;
    }
    setPrompt(prompt);
    setAI(true);
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div style={{ padding: 24, flex: 1, overflow: 'auto' }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <button className={`btn ${tab === 'bookmarks' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab('bookmarks')}>
          <Bookmark size={13} /> Bookmarked Roles
          {bookmarks.length > 0 && (
            <span style={{ marginLeft: 4, fontSize: 10, background: 'rgba(56,189,248,0.2)', color: 'var(--color-accent)', borderRadius: 999, padding: '1px 6px' }}>
              {bookmarks.length}
            </span>
          )}
        </button>
        <button className={`btn ${tab === 'parser' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab('parser')}>
          <Sparkles size={13} /> JD Parser
        </button>
        <div style={{ display: 'flex', gap: 6, flex: 1, minWidth: 220 }}>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && aiSearch()}
            placeholder={jdText.trim() ? 'JD pasted — click to search from it' : 'e.g. QA Automation Engineer, remote…'}
            disabled={!!jdText.trim()}
            style={{ flex: 1, fontSize: 12, opacity: jdText.trim() ? 0.6 : 1 }}
          />
          <button className="btn btn-ghost" onClick={aiSearch}>
            <Search size={13} /> AI Job Search
          </button>
        </div>
      </div>

      {/* ── BOOKMARKS TAB ───────────────────────────────────────────────── */}
      {tab === 'bookmarks' && (
        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Save a Role</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Company *</label>
                <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="e.g. Stripe" />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Role *</label>
                <input value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. Automation QA Engineer"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddBookmark()} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Source</label>
                <CustomSelect value={source} onChange={setSource} options={SOURCES} placeholder="Where did you find it?" />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Job URL</label>
                <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://company.com/jobs/..." />
              </div>
            </div>
            <div className="form-group">
              <label>Notes</label>
              <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Why you're interested…" />
            </div>
            <button className="btn btn-primary" onClick={handleAddBookmark} disabled={!company.trim() || !role.trim()}>
              <Plus size={13} /> Save Bookmark
            </button>
          </div>

          {bookmarks.length === 0 ? (
            <div className="empty-state">
              <Bookmark size={40} style={{ opacity: 0.3 }} />
              <div>No bookmarks yet</div>
              <div style={{ fontSize: 12 }}>Save roles you're interested in before applying</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {bookmarks.map((bk) => (
                <div key={bk.id} className="card">
                  {editId === bk.id ? (
                    /* ── Inline edit ── */
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label style={{ fontSize: 11 }}>Company</label>
                          <input value={editForm.company || ''} onChange={(e) => setEditForm((f) => ({ ...f, company: e.target.value }))} autoFocus />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label style={{ fontSize: 11 }}>Role</label>
                          <input value={editForm.role || ''} onChange={(e) => setEditForm((f) => ({ ...f, role: e.target.value }))} />
                        </div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label style={{ fontSize: 11 }}>Source</label>
                          <CustomSelect value={editForm.source || ''} onChange={(v) => setEditForm((f) => ({ ...f, source: v }))} options={SOURCES} placeholder="Source…" />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label style={{ fontSize: 11 }}>Job URL</label>
                          <input type="url" value={editForm.url || ''} onChange={(e) => setEditForm((f) => ({ ...f, url: e.target.value }))} />
                        </div>
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label style={{ fontSize: 11 }}>Notes</label>
                        <input value={editForm.notes || ''} onChange={(e) => setEditForm((f) => ({ ...f, notes: e.target.value }))} />
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-primary" style={{ fontSize: 12, padding: '5px 12px' }} onClick={saveEdit}>
                          <Check size={12} /> Save
                        </button>
                        <button className="btn btn-ghost" style={{ fontSize: 12, padding: '5px 12px' }} onClick={() => setEditId(null)}>
                          <X size={12} /> Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* ── View mode ── */
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, color: 'var(--color-text)', fontSize: 13 }}>{bk.company}</div>
                        <div style={{ color: 'var(--color-text-dim)', fontSize: 12 }}>{bk.role}</div>
                        {(bk.source || bk.notes) && (
                          <div style={{ color: 'var(--color-muted)', fontSize: 11, marginTop: 2, display: 'flex', gap: 8 }}>
                            {bk.source && <span>{bk.source}</span>}
                            {bk.source && bk.notes && <span>·</span>}
                            {bk.notes && <span>{bk.notes}</span>}
                          </div>
                        )}
                      </div>
                      {bk.url && (
                        <a href={bk.url} target="_blank" rel="noopener noreferrer" className="btn-icon" title="Open job posting">
                          <ExternalLink size={13} />
                        </a>
                      )}
                      <button className="btn-icon" title="Edit bookmark" onClick={() => startEdit(bk)}>
                        <Pencil size={13} />
                      </button>
                      <button className="btn-icon" title="Delete bookmark" style={{ color: 'var(--color-danger)' }}
                        onClick={() => deleteBookmark(bk.id)}>
                        <Trash2 size={13} />
                      </button>
                      <button className="btn btn-primary" style={{ padding: '5px 10px', fontSize: 11 }}
                        onClick={() => convertToApplication(bk)}>
                        → Apply
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── JD PARSER TAB ───────────────────────────────────────────────── */}
      {tab === 'parser' && (
        <div style={{ maxWidth: 640 }}>
          <div className="form-group">
            <label>Paste Job Description</label>
            <textarea
              rows={10}
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              placeholder="Paste the full job description here. AI will extract skills, experience requirements, salary, and location."
            />
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            <button className="btn btn-primary" onClick={parseJD} disabled={!jdText.trim()}>
              <Sparkles size={14} /> Parse JD with AI
            </button>
            <button className="btn btn-ghost" onClick={aiSearch} disabled={!jdText.trim()}>
              <Search size={13} /> Find Similar Roles
            </button>
          </div>

          {/* Create Application from JD */}
          <div className="card" style={{ borderTop: '1px solid var(--color-border)', paddingTop: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: 'var(--color-text)' }}>
              Create Application from this JD
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Company *</label>
                <input value={jdCompany} onChange={(e) => setJdCompany(e.target.value)} placeholder="e.g. Stripe" />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Role *</label>
                <input value={jdRole} onChange={(e) => setJdRole(e.target.value)} placeholder="e.g. Senior QA Engineer" />
              </div>
            </div>
            <div className="form-group">
              <label>Source</label>
              <CustomSelect value={jdSource} onChange={setJdSource} options={SOURCES} placeholder="Where did you find it?" />
            </div>
            <button
              className="btn btn-primary"
              onClick={createFromJD}
              disabled={!jdText.trim() || !jdCompany.trim() || !jdRole.trim() || jdCreating}
            >
              <Plus size={13} /> {jdCreating ? 'Creating…' : 'Create Application (Saved)'}
            </button>
            <p style={{ fontSize: 11, color: 'var(--color-muted)', marginTop: 8 }}>
              Creates a "Saved" application with the JD pre-filled — edit it to apply when ready.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
