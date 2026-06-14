import { useState } from 'react';
import { Sparkles, Copy, Check, Loader } from 'lucide-react';
import { useJobs, useStore, useProfile } from '../store/useStore';
import { callAI } from '../lib/ai';

const TONES = ['Professional', 'Enthusiastic', 'Concise', 'Creative'] as const;

export function CoverLetter() {
  const jobs            = useJobs();
  const profile         = useProfile();
  const updateJob       = useStore((s) => s.updateJob);
  const addToast        = useStore((s) => s.addToast);
  const activeProviders = useStore((s) => s.activeProviders);
  const selectedProvider = useStore((s) => s.selectedProvider);

  const [selectedJobId, setSelectedJobId] = useState('');
  const [tone, setTone]     = useState<typeof TONES[number]>('Professional');
  const [letter, setLetter] = useState('');
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);

  const selectedJob = jobs.find((j) => j.id === selectedJobId);

  const getActiveProvider = () => {
    const p = activeProviders[selectedProvider] || Object.values(activeProviders)[0];
    return p ?? null;
  };

  const generate = async () => {
    if (!selectedJob) return;
    const prov = getActiveProvider();
    if (!prov) {
      addToast('No AI provider connected — add an API key in Settings', 'error');
      return;
    }

    const prompt = `Write a ${tone.toLowerCase()} cover letter for the ${selectedJob.role} position at ${selectedJob.company}.

${selectedJob.jdText ? `Job Description:\n${selectedJob.jdText}\n\n` : ''}${profile.masterResume ? `My Resume:\n${profile.masterResume}\n\n` : profile.skillProfile ? `My Skills: ${profile.skillProfile}\n\n` : ''}${selectedJob.notes ? `Notes about this application: ${selectedJob.notes}\n\n` : ''}Tone: ${tone}

Output the complete cover letter only, ready to copy and paste. Use placeholders like [Your Name] and [Date] where needed.`;

    setGenerating(true);
    try {
      const result = await callAI(
        { id: prov.id, apiKey: prov.apiKey, model: prov.model },
        [{ role: 'user', content: prompt }]
      );
      setLetter(result);
      addToast('Cover letter generated!', 'success');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      addToast(`Generation failed: ${msg.slice(0, 80)}`, 'error');
    } finally {
      setGenerating(false);
    }
  };

  const copyLetter = () => {
    navigator.clipboard.writeText(letter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    addToast('Cover letter copied!', 'success');
  };

  const saveLetter = async () => {
    if (!selectedJob || !letter.trim()) return;
    await updateJob({ ...selectedJob, coverLetter: letter });
    addToast('Cover letter saved to application', 'success');
  };

  return (
    <div style={{ padding: 24, flex: 1, overflow: 'auto' }}>
      <div style={{ maxWidth: 720 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text)', marginBottom: 20 }}>
          AI Cover Letter Generator
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Select Application</label>
            <select value={selectedJobId} onChange={(e) => { setSelectedJobId(e.target.value); setLetter(''); }}>
              <option value="">Choose an application…</option>
              {jobs.map((j) => <option key={j.id} value={j.id}>{j.company} — {j.role}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Tone</label>
            <select value={tone} onChange={(e) => setTone(e.target.value as typeof TONES[number])}>
              {TONES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>

        <button
          className="btn btn-primary"
          onClick={generate}
          disabled={!selectedJob || generating}
          style={{ marginBottom: 20, minWidth: 160 }}
        >
          {generating
            ? <><Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> Generating…</>
            : <><Sparkles size={14} /> Generate with AI</>}
        </button>

        {selectedJob?.coverLetter && !letter && (
          <div className="card" style={{ marginBottom: 12, padding: '10px 14px' }}>
            <div style={{ fontSize: 12, color: 'var(--color-muted)', marginBottom: 6 }}>Previously saved cover letter:</div>
            <button className="btn btn-ghost" style={{ fontSize: 12 }} onClick={() => setLetter(selectedJob.coverLetter)}>
              Load saved letter
            </button>
          </div>
        )}

        <div className="form-group">
          <label>Cover Letter (edit before copying)</label>
          <textarea
            rows={20}
            value={letter}
            onChange={(e) => setLetter(e.target.value)}
            placeholder="Click 'Generate with AI' — the cover letter will appear here for you to edit."
            style={{ fontFamily: 'var(--font-sans)', lineHeight: 1.7, fontSize: 13 }}
          />
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost" onClick={copyLetter} disabled={!letter.trim()}>
            {copied ? <Check size={13} /> : <Copy size={13} />} {copied ? 'Copied!' : 'Copy'}
          </button>
          <button className="btn btn-primary" onClick={saveLetter} disabled={!letter.trim() || !selectedJob}>
            Save to Application
          </button>
        </div>
      </div>
    </div>
  );
}
