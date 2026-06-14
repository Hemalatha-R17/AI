import { useState } from 'react';
import { CheckCircle, Circle, AlertCircle, Plus, Sparkles, RefreshCw } from 'lucide-react';
import { useJobs, useStore } from '../store/useStore';
import { callAI } from '../lib/ai';

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
  const jobs             = useJobs();
  const activeProviders  = useStore((s) => s.activeProviders);
  const selectedProvider = useStore((s) => s.selectedProvider);
  const [tab, setTab] = useState<'bank' | 'coach' | 'checklist'>('bank');
  const [selectedJobId, setSelectedJobId] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [newQ, setNewQ] = useState('');
  const [newQType, setNewQType] = useState<QType>('Behavioral');
  const [checklist, setChecklist] = useState<boolean[]>(CHECKLIST.map(() => false));
  const [coachResponse, setCoachResponse] = useState('');
  const [coachLoading, setCoachLoading] = useState(false);
  const [coachError, setCoachError] = useState('');

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

  const aiCoach = async () => {
    if (!selectedJob) return;
    const provider = activeProviders[selectedProvider];
    if (!provider) {
      setCoachError('No AI provider connected. Go to Settings → AI Providers and add a key.');
      return;
    }
    setCoachLoading(true);
    setCoachError('');
    setCoachResponse('');
    try {
      const prompt = `You are an expert interview coach. Help me prepare for my ${selectedJob.role} interview at ${selectedJob.company}.

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
    } catch (e) {
      setCoachError(e instanceof Error ? e.message : 'AI call failed');
    } finally {
      setCoachLoading(false);
    }
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
        <div>
          {/* Generate button row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <button
              className="btn btn-primary"
              onClick={aiCoach}
              disabled={!selectedJob || coachLoading}
            >
              {coachLoading
                ? <><RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> Generating…</>
                : <><Sparkles size={14} /> Generate Interview Prep</>}
            </button>
            {coachResponse && !coachLoading && (
              <button className="btn btn-ghost" onClick={aiCoach} style={{ fontSize: 12 }}>
                <RefreshCw size={12} /> Regenerate
              </button>
            )}
            {!selectedJob && <span style={{ fontSize: 12, color: 'var(--color-muted)' }}>Select an application first</span>}
          </div>

          {/* Error */}
          {coachError && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '12px 16px', fontSize: 13, color: 'var(--color-danger)', marginBottom: 16 }}>
              {coachError}
            </div>
          )}

          {/* Loading skeleton */}
          {coachLoading && (
            <div className="card" style={{ padding: 24 }}>
              {[80, 60, 90, 55, 70, 65, 85, 50].map((w, i) => (
                <div key={i} style={{ height: 14, background: 'var(--color-border)', borderRadius: 4, marginBottom: 10, width: `${w}%`, opacity: 0.5 }} />
              ))}
            </div>
          )}

          {/* Response */}
          {coachResponse && !coachLoading && (
            <div className="card" style={{ padding: '20px 24px', maxWidth: 720 }}>
              <div style={{
                fontSize: 13,
                lineHeight: 1.75,
                color: 'var(--color-text)',
                whiteSpace: 'pre-wrap',
                fontFamily: 'var(--font-sans)',
              }}>
                {coachResponse.split('\n').map((line, i) => {
                  if (line.startsWith('## ')) {
                    return <div key={i} style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-accent)', marginTop: i === 0 ? 0 : 20, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{line.replace('## ', '')}</div>;
                  }
                  if (/^\d+\./.test(line)) {
                    return <div key={i} style={{ paddingLeft: 4, marginBottom: 6, color: 'var(--color-text)' }}>{line}</div>;
                  }
                  if (line.startsWith('- ') || line.startsWith('• ')) {
                    return <div key={i} style={{ paddingLeft: 12, marginBottom: 4, color: 'var(--color-text-dim)' }}>{line}</div>;
                  }
                  if (line.startsWith('**') && line.endsWith('**')) {
                    return <div key={i} style={{ fontWeight: 600, marginBottom: 4, color: 'var(--color-text)' }}>{line.replace(/\*\*/g, '')}</div>;
                  }
                  if (line.trim() === '') return <div key={i} style={{ height: 4 }} />;
                  return <div key={i} style={{ marginBottom: 4, color: 'var(--color-text-dim)' }}>{line}</div>;
                })}
              </div>
            </div>
          )}

          {/* Empty state */}
          {!coachResponse && !coachLoading && !coachError && (
            <div className="card" style={{ textAlign: 'center', padding: 48 }}>
              <Sparkles size={40} style={{ color: 'var(--color-accent)', marginBottom: 16, opacity: 0.6 }} />
              <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text)', marginBottom: 8 }}>AI Interview Coach</h3>
              <p style={{ color: 'var(--color-muted)', fontSize: 13, lineHeight: 1.6 }}>
                Select an application above and click <strong>Generate Interview Prep</strong> to get role-specific questions, STAR method tips, and study topics.
              </p>
            </div>
          )}
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
