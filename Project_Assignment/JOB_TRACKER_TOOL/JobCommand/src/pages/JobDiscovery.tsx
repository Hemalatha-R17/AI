import { useState } from 'react';
import { Search, Bookmark, Sparkles, ExternalLink, Plus } from 'lucide-react';
import { useStore } from '../store/useStore';
import { today } from '../lib/format';
import type { Job } from '../types';

interface Bookmark { id: string; company: string; role: string; url: string; notes: string; addedAt: string }

export function JobDiscovery() {
  const addJob    = useStore((s) => s.addJob);
  const setAI     = useStore((s) => s.setAiPanelOpen);
  const setPrompt = useStore((s) => s.setAiPanelPrompt);

  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [jdText, setJdText] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [url, setUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [tab, setTab] = useState<'bookmarks' | 'parser'>('bookmarks');

  const addBookmark = () => {
    if (!company.trim() || !role.trim()) return;
    setBookmarks((bs) => [...bs, { id: Date.now().toString(), company, role, url, notes, addedAt: today() }]);
    setCompany(''); setRole(''); setUrl(''); setNotes('');
  };

  const convertToApplication = async (bk: Bookmark) => {
    const job: Job = {
      id: `job-${Date.now()}`,
      createdAt: new Date().toISOString(),
      company: bk.company,
      role: bk.role,
      location: '',
      status: 'Submitted',
      priority: 'Medium',
      jobType: 'Full-time',
      currency: 'USD',
      salaryMin: null,
      salaryMax: null,
      tags: [],
      source: 'Company Website',
      appliedDate: today(),
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
      history: [{ status: 'Submitted', at: new Date().toISOString() }],
      coverLetter: '',
    };
    await addJob(job);
    setBookmarks((bs) => bs.filter((b) => b.id !== bk.id));
  };

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

  const aiSearch = () => {
    setPrompt('Help me find relevant job postings. I am looking for senior frontend engineering roles (React/TypeScript) with remote options. Suggest 5 specific companies that would be a great fit and why.');
    setAI(true);
  };

  return (
    <div style={{ padding: 24, flex: 1, overflow: 'auto' }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <button className={`btn ${tab === 'bookmarks' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab('bookmarks')}>
          <Bookmark size={13} /> Bookmarked Roles
        </button>
        <button className={`btn ${tab === 'parser' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab('parser')}>
          <Sparkles size={13} /> JD Parser
        </button>
        <button className="btn btn-ghost" onClick={aiSearch}>
          <Search size={13} /> AI Job Search
        </button>
      </div>

      {tab === 'bookmarks' && (
        <div>
          {/* Add bookmark form */}
          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Save a Role</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Company *</label>
                <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="e.g. Stripe" />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Role *</label>
                <input value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. Frontend Engineer" />
              </div>
            </div>
            <div className="form-group">
              <label>Job URL</label>
              <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://company.com/jobs/..." />
            </div>
            <div className="form-group">
              <label>Notes</label>
              <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Why you're interested…" />
            </div>
            <button className="btn btn-primary" onClick={addBookmark}>
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
                <div key={bk.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: 'var(--color-text)', fontSize: 13 }}>{bk.company}</div>
                    <div style={{ color: 'var(--color-text-dim)', fontSize: 12 }}>{bk.role}</div>
                    {bk.notes && <div style={{ color: 'var(--color-muted)', fontSize: 11, marginTop: 2 }}>{bk.notes}</div>}
                  </div>
                  {bk.url && (
                    <a href={bk.url} target="_blank" rel="noopener noreferrer" className="btn-icon" title="Open job posting">
                      <ExternalLink size={13} />
                    </a>
                  )}
                  <button className="btn btn-primary" style={{ padding: '5px 10px', fontSize: 11 }} onClick={() => convertToApplication(bk)}>
                    → Apply
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

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
          <button className="btn btn-primary" onClick={parseJD} disabled={!jdText.trim()}>
            <Sparkles size={14} /> Parse JD with AI
          </button>
          <p style={{ fontSize: 12, color: 'var(--color-muted)', marginTop: 8 }}>
            AI will extract key requirements and you can use the output to pre-fill an application.
          </p>
        </div>
      )}
    </div>
  );
}
