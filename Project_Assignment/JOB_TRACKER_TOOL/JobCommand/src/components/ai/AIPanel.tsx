import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Sparkles, Loader } from 'lucide-react';
import { useStore, useJobs } from '../../store/useStore';
import { AI_PROVIDERS } from '../../lib/constants';
import { callAI } from '../../lib/ai';

interface Message { role: 'user' | 'assistant'; content: string }

const SEED_PROMPTS = [
  (company: string, role: string) => `Draft a follow-up email for my ${role} role at ${company}`,
  (_c: string, role: string, company: string) => `Write a cover letter for the ${role} position at ${company}`,
  (company: string, role: string) => `Help me prep for my ${role} interview at ${company}`,
  () => 'Summarize this job description into key requirements',
  (_c: string, role: string, _co: string, loc: string) => `What salary should I expect for a ${role} role in ${loc}?`,
];

export function AIPanel() {
  const open           = useStore((s) => s.aiPanelOpen);
  const initPrompt     = useStore((s) => s.aiPanelPrompt);
  const setOpen        = useStore((s) => s.setAiPanelOpen);
  const setInitPrompt  = useStore((s) => s.setAiPanelPrompt);
  const activeProviders = useStore((s) => s.activeProviders);
  const selectedProvider = useStore((s) => s.selectedProvider);
  const setSelectedProvider = useStore((s) => s.setSelectedProvider);
  const jobs           = useJobs();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const latestJob = jobs[0];

  useEffect(() => {
    if (initPrompt) { setInput(initPrompt); setInitPrompt(''); }
  }, [initPrompt, setInitPrompt]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const connectedProviders = AI_PROVIDERS.filter((p) => activeProviders[p.id as string]?.apiKey);
  const providerDef = connectedProviders.find((p) => p.id === selectedProvider) || connectedProviders[0];
  const providerActive = providerDef ? activeProviders[providerDef.id] : null;
  const provider = providerActive ? { id: providerDef!.id, label: providerDef!.label, apiKey: providerActive.apiKey, model: providerActive.model } : null;

  const send = async (msg?: string) => {
    const text = (msg ?? input).trim();
    if (!text || loading) return;
    setInput('');
    setError('');

    const userMsg: Message = { role: 'user', content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setLoading(true);

    if (!provider || !provider.apiKey) {
      setMessages((ms) => [...ms, { role: 'assistant', content: '⚠️ No AI provider connected. Go to Settings to add an API key.' }]);
      setLoading(false);
      return;
    }

    try {
      const response = await callAI({ id: provider.id, apiKey: provider.apiKey, model: provider.model }, newMessages);
      setMessages((ms) => [...ms, { role: 'assistant', content: response }]);
    } catch (e: unknown) {
      const errMsg = e instanceof Error ? e.message : 'Unknown error';
      setError(`Couldn't reach ${provider.label} — check your API key`);
      setMessages((ms) => [...ms, { role: 'assistant', content: `Error: ${errMsg}` }]);
    } finally {
      setLoading(false);
    }
  };

  const seedPrompts = latestJob
    ? SEED_PROMPTS.slice(0, 4).map((fn) => fn(latestJob.company, latestJob.role, latestJob.company, latestJob.location || 'your city'))
    : ['Help me write a cover letter', 'How do I negotiate salary?', 'Prepare me for interviews', 'Review my resume'];

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="ai-panel slide-in"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {/* Header */}
        <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Sparkles size={16} style={{ color: 'var(--color-accent)' }} />
          <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--color-text)', flex: 1 }}>AI Assistant</span>

          {/* Provider selector */}
          {connectedProviders.length > 0 && (
            <select
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value)}
              style={{ width: 'auto', padding: '3px 6px', fontSize: 11, border: '1px solid var(--color-border)', background: 'var(--color-surface-2)', color: 'var(--color-text)' }}
            >
              {connectedProviders.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
            </select>
          )}

          <button className="btn-icon" onClick={() => setOpen(false)}><X size={15} /></button>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflow: 'auto', padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {messages.length === 0 ? (
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, color: 'var(--color-muted)', marginBottom: 14 }}>
                {connectedProviders.length === 0
                  ? '⚠️ No AI provider connected — add an API key in Settings.'
                  : `Connected: ${provider?.label}. Try a prompt:`}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {seedPrompts.map((p, i) => (
                  <button
                    key={i}
                    className="btn btn-ghost"
                    style={{ textAlign: 'left', justifyContent: 'flex-start', fontSize: 13, padding: '10px 14px', lineHeight: 1.5 }}
                    onClick={() => send(p)}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((m, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '92%',
                  padding: '12px 16px',
                  borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  background: m.role === 'user' ? 'var(--color-accent)' : 'var(--color-surface-2)',
                  color: m.role === 'user' ? '#fff' : 'var(--color-text)',
                  fontSize: 14,
                  lineHeight: 1.7,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}>
                  {m.content}
                </div>
              </div>
            ))
          )}
          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-muted)', fontSize: 13 }}>
              <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} />
              Thinking…
            </div>
          )}
          {error && (
            <div style={{ fontSize: 13, color: 'var(--color-danger)', padding: '10px 14px', background: 'rgba(239,68,68,0.1)', borderRadius: 6 }}>
              {error}
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{ padding: '14px 16px', borderTop: '1px solid var(--color-border)', display: 'flex', gap: 8, alignItems: 'flex-end' }}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Ask anything… (Enter to send, Shift+Enter for newline)"
            rows={3}
            style={{ flex: 1, resize: 'none', fontSize: 14, lineHeight: 1.6 }}
          />
          <button
            className="btn btn-primary"
            style={{ padding: '12px 14px', alignSelf: 'flex-end' }}
            onClick={() => send()}
            disabled={!input.trim() || loading}
          >
            <Send size={15} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

