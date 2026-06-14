import { useState } from 'react';
import { CheckCircle, Circle, AlertCircle, Plus, Sparkles } from 'lucide-react';
import { useJobs, useStore } from '../store/useStore';

type QType = 'Behavioral' | 'Technical' | 'System Design' | 'Culture Fit';
interface Question { id: string; text: string; type: QType; status: 'not-started' | 'needs-work' | 'practiced' }

const CHECKLIST = [
  'Research company mission, products, and recent news',
  'Prepare 3–5 STAR method stories (Situation, Task, Action, Result)',
  'Review the job description and match skills',
  'Test your tech setup (camera, mic, internet)',
  'Prepare thoughtful questions to ask the interviewer',
  'Send thank-you email within 24 hours post-interview',
];

export function InterviewPrep() {
  const jobs    = useJobs();
  const setAI   = useStore((s) => s.setAiPanelOpen);
  const setPrompt = useStore((s) => s.setAiPanelPrompt);
  const [tab, setTab] = useState<'bank' | 'coach' | 'checklist'>('bank');
  const [selectedJobId, setSelectedJobId] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [newQ, setNewQ] = useState('');
  const [newQType, setNewQType] = useState<QType>('Behavioral');
  const [checklist, setChecklist] = useState<boolean[]>(CHECKLIST.map(() => false));

  const interviewJobs = jobs.filter((j) => ['Interview', 'Phone Screen', 'Offer'].includes(j.status));
  const selectedJob = jobs.find((j) => j.id === selectedJobId);

  const addQuestion = () => {
    if (!newQ.trim()) return;
    setQuestions((qs) => [...qs, { id: Date.now().toString(), text: newQ.trim(), type: newQType, status: 'not-started' }]);
    setNewQ('');
  };

  const cycleStatus = (id: string) => {
    setQuestions((qs) => qs.map((q) => {
      if (q.id !== id) return q;
      const next = q.status === 'not-started' ? 'needs-work' : q.status === 'needs-work' ? 'practiced' : 'not-started';
      return { ...q, status: next };
    }));
  };

  const aiCoach = () => {
    if (!selectedJob) return;
    setPrompt(`Help me prepare for my ${selectedJob.role} interview at ${selectedJob.company}. Generate 10 likely interview questions with STAR method tips and system design topics relevant to their tech stack (${selectedJob.tags.join(', ') || 'general engineering'}).`);
    setAI(true);
  };

  const statusIcon = (s: Question['status']) => {
    if (s === 'practiced')   return <CheckCircle size={14} style={{ color: 'var(--color-success)' }} />;
    if (s === 'needs-work')  return <AlertCircle size={14} style={{ color: 'var(--color-warn)' }} />;
    return <Circle size={14} style={{ color: 'var(--color-muted)' }} />;
  };

  const TABS = [
    { id: 'bank', label: 'Question Bank' },
    { id: 'coach', label: 'AI Coach' },
    { id: 'checklist', label: 'Interview Checklist' },
  ] as const;

  return (
    <div style={{ padding: 24, flex: 1, overflow: 'auto' }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`btn ${tab === t.id ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Job selector */}
      {(tab === 'bank' || tab === 'coach') && (
        <div style={{ marginBottom: 16 }}>
          <select value={selectedJobId} onChange={(e) => setSelectedJobId(e.target.value)} style={{ maxWidth: 320 }}>
            <option value="">Select an application…</option>
            {interviewJobs.map((j) => (
              <option key={j.id} value={j.id}>{j.company} — {j.role}</option>
            ))}
          </select>
        </div>
      )}

      {tab === 'bank' && (
        <div>
          {/* Add question */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <input
              value={newQ}
              onChange={(e) => setNewQ(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addQuestion()}
              placeholder="Add a practice question…"
              style={{ flex: 1 }}
            />
            <select value={newQType} onChange={(e) => setNewQType(e.target.value as QType)} style={{ width: 140 }}>
              {(['Behavioral','Technical','System Design','Culture Fit'] as QType[]).map((t) => <option key={t}>{t}</option>)}
            </select>
            <button className="btn btn-primary" onClick={addQuestion}><Plus size={13} /></button>
          </div>

          {questions.length === 0 ? (
            <div className="empty-state">
              <div>No questions yet</div>
              <div style={{ fontSize: 12 }}>Add practice questions above</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {questions.map((q) => (
                <div key={q.id} className="card" style={{ padding: '12px 16px', display: 'flex', gap: 12, alignItems: 'flex-start', cursor: 'pointer' }} onClick={() => cycleStatus(q.id)}>
                  {statusIcon(q.status)}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: 'var(--color-text)' }}>{q.text}</div>
                    <span style={{ fontSize: 10, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{q.type}</span>
                  </div>
                  <span style={{ fontSize: 11, color: q.status === 'practiced' ? 'var(--color-success)' : q.status === 'needs-work' ? 'var(--color-warn)' : 'var(--color-muted)' }}>
                    {q.status.replace('-', ' ')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'coach' && (
        <div className="card" style={{ textAlign: 'center', padding: 40 }}>
          <Sparkles size={40} style={{ color: 'var(--color-accent)', marginBottom: 16 }} />
          <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text)', marginBottom: 8 }}>AI Interview Coach</h3>
          <p style={{ color: 'var(--color-muted)', marginBottom: 24, fontSize: 14, lineHeight: 1.6 }}>
            Select an application above, then let AI generate role-specific questions, STAR prompts, and topics to study.
          </p>
          <button className="btn btn-primary" onClick={aiCoach} disabled={!selectedJob}>
            <Sparkles size={14} /> Generate Interview Prep
          </button>
          {!selectedJob && <p style={{ fontSize: 12, color: 'var(--color-muted)', marginTop: 10 }}>Select an application first</p>}
        </div>
      )}

      {tab === 'checklist' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 560 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)', marginBottom: 4 }}>Pre-Interview Checklist</h3>
          {CHECKLIST.map((item, i) => (
            <div
              key={i}
              className="card"
              style={{ padding: '12px 16px', display: 'flex', gap: 12, alignItems: 'center', cursor: 'pointer' }}
              onClick={() => setChecklist((c) => { const nc = [...c]; nc[i] = !nc[i]; return nc; })}
            >
              {checklist[i]
                ? <CheckCircle size={16} style={{ color: 'var(--color-success)', flexShrink: 0 }} />
                : <Circle size={16} style={{ color: 'var(--color-muted)', flexShrink: 0 }} />}
              <span style={{ fontSize: 13, color: checklist[i] ? 'var(--color-muted)' : 'var(--color-text)', textDecoration: checklist[i] ? 'line-through' : 'none' }}>
                {item}
              </span>
            </div>
          ))}
          <div style={{ fontSize: 12, color: 'var(--color-muted)', marginTop: 8 }}>
            {checklist.filter(Boolean).length} / {CHECKLIST.length} completed
          </div>
        </div>
      )}
    </div>
  );
}
