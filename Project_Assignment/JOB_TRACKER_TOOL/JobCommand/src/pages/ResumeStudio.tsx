import { useState } from 'react';
import { Upload, FileText, Sparkles, Trash2 } from 'lucide-react';
import { useStore, useProfile } from '../store/useStore';

interface Resume { id: string; name: string; content: string; active: boolean; updatedAt: string }

export function ResumeStudio() {
  const profile = useProfile();
  const updateProfile = useStore((s) => s.updateProfile);
  const setAI = useStore((s) => s.setAiPanelOpen);
  const setPrompt = useStore((s) => s.setAiPanelPrompt);

  const [tab, setTab] = useState<'resumes' | 'analyzer' | 'skills'>('resumes');
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [jd, setJd] = useState('');
  const [skills, setSkills] = useState(profile.skillProfile || '');

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      const isFirst = resumes.length === 0;
      setResumes((rs) => [...rs, {
        id: Date.now().toString(),
        name: file.name,
        content,
        active: isFirst,
        updatedAt: new Date().toISOString().split('T')[0],
      }]);
    };
    reader.readAsDataURL(file);
  };

  const toggleActive = (id: string) => {
    setResumes((rs) => rs.map((r) => ({ ...r, active: r.id === id })));
  };

  const deleteResume = (id: string) => {
    setResumes((rs) => rs.filter((r) => r.id !== id));
  };

  const analyzeResume = () => {
    const prompt = `Analyze this job description against my resume/skills profile.

JD: ${jd || 'No JD provided'}

My Skills: ${skills}

Provide:
1. Match score (0-100%)
2. Matching skills
3. Missing skills
4. Top 3 suggested improvements for my resume`;
    setPrompt(prompt);
    setAI(true);
  };

  const saveSkills = () => { updateProfile({ skillProfile: skills }); };

  return (
    <div style={{ padding: 24, flex: 1, overflow: 'auto' }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[['resumes','My Resumes'], ['analyzer','AI Analyzer'], ['skills','Skill Profile']].map(([id, label]) => (
          <button key={id} className={`btn ${tab === id ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab(id as typeof tab)}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'resumes' && (
        <div>
          <label style={{ cursor: 'pointer', textTransform: 'none', fontSize: 13 }}>
            <input type="file" accept=".pdf,.doc,.docx,.txt" onChange={handleUpload} style={{ display: 'none' }} />
            <div className="btn btn-primary" style={{ display: 'inline-flex', marginBottom: 16 }}>
              <Upload size={14} /> Upload Resume
            </div>
          </label>

          {resumes.length === 0 ? (
            <div className="empty-state">
              <FileText size={40} style={{ opacity: 0.3 }} />
              <div>No resumes uploaded yet</div>
              <div style={{ fontSize: 12 }}>Upload your resume to use with AI tools</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {resumes.map((r) => (
                <div key={r.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px' }}>
                  <FileText size={20} style={{ color: 'var(--color-accent)', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: 'var(--color-text)', fontSize: 13 }}>{r.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--color-muted)' }}>Updated {r.updatedAt}</div>
                  </div>
                  <button
                    className={`btn ${r.active ? 'btn-primary' : 'btn-ghost'}`}
                    style={{ padding: '4px 10px', fontSize: 11 }}
                    onClick={() => toggleActive(r.id)}
                  >
                    {r.active ? 'Active ✓' : 'Set Active'}
                  </button>
                  <button className="btn-icon" onClick={() => deleteResume(r.id)} style={{ color: 'var(--color-danger)' }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

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
            AI will compare the JD against your Skill Profile and provide a match score.
          </p>
        </div>
      )}

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
