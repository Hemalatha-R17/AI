import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Activity, Cpu, BarChart3, ArrowRight, Zap, Kanban,
  Search, FileText, Lock,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { dbSaveProfile } from '../lib/db';

interface Props { onLogin: (name: string) => void }

/* ── Typewriter ───────────────────────────────────── */
function useTypewriter(words: string[], typeMs = 72, deleteMs = 38, pauseMs = 2400) {
  const [wi, setWi] = useState(0);
  const [ci, setCi] = useState(0);
  const [del, setDel] = useState(false);
  const [text, setText] = useState('');

  useEffect(() => {
    const word = words[wi];
    if (!del && ci < word.length) {
      const t = setTimeout(() => setCi((c) => c + 1), typeMs);
      return () => clearTimeout(t);
    }
    if (!del && ci === word.length) {
      const t = setTimeout(() => setDel(true), pauseMs);
      return () => clearTimeout(t);
    }
    if (del && ci > 0) {
      const t = setTimeout(() => setCi((c) => c - 1), deleteMs);
      return () => clearTimeout(t);
    }
    if (del && ci === 0) {
      setDel(false);
      setWi((i) => (i + 1) % words.length);
    }
  }, [ci, del, wi, words, typeMs, deleteMs, pauseMs]);

  useEffect(() => { setText(words[wi].substring(0, ci)); }, [ci, wi, words]);
  return text;
}

/* ── Animated counter ────────────────────────────── */
function Counter({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let f = 0;
    const steps = 55;
    const id = setInterval(() => {
      f++;
      setN(Math.round((f / steps) * value));
      if (f >= steps) clearInterval(id);
    }, 18);
    return () => clearInterval(id);
  }, [value]);
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 30, fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1 }}>
        {n}{suffix}
      </div>
      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.38)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </div>
    </div>
  );
}

/* ── Static data ─────────────────────────────────── */
const FEATURES = [
  { icon: Kanban,    label: 'Kanban Pipeline',  color: '#6366f1', desc: '8 stages'        },
  { icon: Cpu,       label: 'AI Resume Coach',  color: '#38bdf8', desc: 'Multi-provider'  },
  { icon: Zap,       label: 'Interview Prep',   color: '#f59e0b', desc: 'STAR coaching'   },
  { icon: BarChart3, label: 'Analytics',        color: '#10b981', desc: 'Funnel & trends' },
  { icon: Search,    label: 'Job Discovery',    color: '#ec4899', desc: 'AI-powered'      },
  { icon: FileText,  label: 'Cover Letter',     color: '#06b6d4', desc: 'AI-generated'    },
];

const PHRASES = ['Land the role.', 'Ace every interview.', 'Own your career.', 'Beat the ATS.'];

const STATS = [
  { value: 8,   suffix: '+',  label: 'Pipeline Stages' },
  { value: 15,  suffix: '+',  label: 'Themes'          },
  { value: 6,   suffix: '',   label: 'AI Providers'    },
  { value: 100, suffix: '%',  label: 'Private'         },
];

// Seeded particles — fixed on mount, reused across renders
const PARTICLES = Array.from({ length: 14 }, (_, i) => ({
  id: i,
  left: 5 + (i * 6.5) % 90,
  size: 2 + (i % 3),
  delay: (i * 0.7) % 9,
  dur: 7 + (i % 5),
  op: 0.12 + (i % 4) * 0.06,
}));

/* ── Component ───────────────────────────────────── */
export function Landing({ onLogin }: Props) {
  const hydrate = useStore((s) => s.hydrate);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const typeText = useTypewriter(PHRASES);

  const login = async () => {
    setLoading(true);
    const displayName = name.trim() || 'there';
    await dbSaveProfile({
      id: 'default', name: displayName,
      createdAt: new Date().toISOString().split('T')[0],
      monthlyGoal: 10, defaultCurrency: 'USD',
      skillProfile: '', masterResume: '',
    });
    hydrate();
    onLogin(displayName);
  };

  return (
    <div
      className="landing-bg"
      style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#07091a', position: 'relative' }}
    >
      {/* ══ HERO PANEL (left) ══════════════════════════ */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7 }}
        style={{
          flex: 1, position: 'relative', display: 'flex', flexDirection: 'column',
          justifyContent: 'center', padding: '48px 60px', overflow: 'hidden',
        }}
      >
        {/* Dot grid */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'radial-gradient(circle, rgba(99,102,241,0.22) 1px, transparent 1px)',
          backgroundSize: '38px 38px', opacity: 0.55,
        }} />

        {/* Orb 1 — purple */}
        <motion.div
          animate={{ x: [0, 90, -50, 70, 0], y: [0, -70, 90, -40, 0] }}
          transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut' }}
          style={{ position: 'absolute', top: -140, left: -100, width: 520, height: 520, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 65%)', pointerEvents: 'none' }}
        />
        {/* Orb 2 — blue */}
        <motion.div
          animate={{ x: [0, -80, 60, -40, 0], y: [0, 80, -60, 70, 0] }}
          transition={{ duration: 19, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
          style={{ position: 'absolute', bottom: -100, right: 40, width: 420, height: 420, borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.16) 0%, transparent 65%)', pointerEvents: 'none' }}
        />
        {/* Orb 3 — cyan accent */}
        <motion.div
          animate={{ x: [0, 60, -90, 40, 0], y: [0, 50, -70, 90, 0] }}
          transition={{ duration: 28, repeat: Infinity, ease: 'easeInOut', delay: 9 }}
          style={{ position: 'absolute', top: '38%', left: '48%', width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 65%)', pointerEvents: 'none' }}
        />

        {/* Floating particles */}
        {PARTICLES.map((p) => (
          <motion.div
            key={p.id}
            animate={{ y: [0, -90, 0], opacity: [0, p.op, 0] }}
            transition={{ duration: p.dur, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }}
            style={{ position: 'absolute', left: `${p.left}%`, bottom: '8%', width: p.size, height: p.size, borderRadius: '50%', background: '#818cf8', pointerEvents: 'none' }}
          />
        ))}

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 44 }}
        >
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              boxShadow: ['0 0 0px rgba(99,102,241,0)', '0 0 28px rgba(99,102,241,0.7)', '0 0 0px rgba(99,102,241,0)'],
            }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
            style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg,#6366f1,#06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <Activity size={22} color="#fff" />
          </motion.div>
          <div>
            <div style={{ fontSize: 21, fontWeight: 800, color: '#fff', letterSpacing: '-0.01em' }}>CareerPulse</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.38)' }}>Job Tracker AI</div>
          </div>
        </motion.div>

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          style={{ marginBottom: 30 }}
        >
          <h1 style={{ fontSize: 46, fontWeight: 900, lineHeight: 1.08, color: '#fff', marginBottom: 6, letterSpacing: '-0.03em' }}>
            Track every<br />application.
          </h1>
          <div style={{ fontSize: 42, fontWeight: 900, lineHeight: 1.08, letterSpacing: '-0.03em', minHeight: 52, display: 'flex', alignItems: 'center' }}>
            <span style={{ background: 'linear-gradient(90deg,#818cf8,#38bdf8,#10d9a0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              {typeText}
            </span>
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.55, repeat: Infinity, repeatType: 'reverse' }}
              style={{ display: 'inline-block', width: 3, height: 42, marginLeft: 3, background: 'linear-gradient(180deg,#818cf8,#38bdf8)', borderRadius: 2, verticalAlign: 'bottom', flexShrink: 0 }}
            />
          </div>
        </motion.div>

        {/* Feature cards grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 32 }}>
          {FEATURES.map(({ icon: Icon, label, color, desc }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 18, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.45, delay: 0.35 + i * 0.08 }}
              whileHover={{ y: -4, scale: 1.03, transition: { duration: 0.18 } }}
              style={{
                padding: '12px 13px', borderRadius: 12,
                background: 'rgba(255,255,255,0.035)',
                border: '1px solid rgba(255,255,255,0.07)',
                backdropFilter: 'blur(6px)',
                cursor: 'default',
              }}
            >
              <motion.div
                whileHover={{ rotate: [0, -8, 8, 0], transition: { duration: 0.3 } }}
                style={{ width: 30, height: 30, borderRadius: 8, background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}
              >
                <Icon size={14} style={{ color }} />
              </motion.div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#fff', marginBottom: 2 }}>{label}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.38)' }}>{desc}</div>
            </motion.div>
          ))}
        </div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.95 }}
          style={{ display: 'flex', gap: 28, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          {STATS.map((s) => <Counter key={s.label} value={s.value} suffix={s.suffix} label={s.label} />)}
        </motion.div>
      </motion.div>

      {/* ══ LOGIN PANEL (right) ════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, x: 36 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.18 }}
        style={{
          width: 420, display: 'flex', flexDirection: 'column', justifyContent: 'center',
          padding: '48px 44px', position: 'relative', overflow: 'hidden',
          background: 'rgba(12,15,32,0.96)',
          borderLeft: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        {/* Corner glows */}
        <div style={{ position: 'absolute', top: -70, right: -70, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle,rgba(99,102,241,0.22) 0%,transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -50, left: -50, width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle,rgba(6,182,212,0.16) 0%,transparent 70%)', pointerEvents: 'none' }} />

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>

          {/* Live badge */}
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '5px 13px', borderRadius: 999, background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.28)', marginBottom: 22 }}
          >
            <motion.div
              animate={{ scale: [1, 1.4, 1], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 1.4, repeat: Infinity }}
              style={{ width: 7, height: 7, borderRadius: '50%', background: '#38bdf8', flexShrink: 0 }}
            />
            <span style={{ fontSize: 11, fontWeight: 600, color: '#38bdf8' }}>No account needed · Always free</span>
          </motion.div>

          <h2 style={{ fontSize: 27, fontWeight: 800, color: '#fff', marginBottom: 7, letterSpacing: '-0.02em' }}>
            Get started
          </h2>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.42)', marginBottom: 26, lineHeight: 1.65 }}>
            Your data stays on your device, forever.
          </p>

          {/* Name field */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 7 }}>
              Your name (optional)
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !loading && login()}
              placeholder="e.g. Alex"
              autoFocus
              style={{
                width: '100%', padding: '12px 15px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 10, color: '#fff', fontSize: 14,
                outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'rgba(56,189,248,0.7)';
                e.target.style.boxShadow = '0 0 0 3px rgba(56,189,248,0.15)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* CTA button */}
          <motion.button
            onClick={login}
            disabled={loading}
            whileHover={!loading ? { scale: 1.02, boxShadow: '0 0 36px rgba(99,102,241,0.6), 0 0 60px rgba(6,182,212,0.2)' } : {}}
            whileTap={!loading ? { scale: 0.97 } : {}}
            style={{
              width: '100%', padding: '14px', borderRadius: 10, border: 'none',
              background: 'linear-gradient(135deg,#6366f1,#06b6d4)',
              color: '#fff', fontSize: 15, fontWeight: 700, cursor: loading ? 'wait' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              marginBottom: 18, letterSpacing: '-0.01em',
              boxShadow: '0 4px 24px rgba(99,102,241,0.35)',
              transition: 'box-shadow 0.2s',
            }}
          >
            {loading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 0.75, repeat: Infinity, ease: 'linear' }}
                style={{ width: 17, height: 17, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }}
              />
            ) : (
              <>Enter CareerPulse <motion.span animate={{ x: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity }}><ArrowRight size={16} /></motion.span></>
            )}
          </motion.button>

          {/* Privacy note */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.65 }}
            style={{ display: 'flex', alignItems: 'flex-start', gap: 9, padding: '11px 13px', background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.18)', borderRadius: 9, marginBottom: 22 }}
          >
            <Lock size={12} style={{ color: '#34d399', marginTop: 2, flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.42)', lineHeight: 1.65 }}>
              100% local — no backend, no login server, no cloud sync. Job data never leaves your browser.
            </span>
          </motion.div>

          {/* Feature chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
            {['8 Pipeline Stages', 'AI Multi-Provider', '15 Themes', 'Analytics', 'Job Discovery'].map((f, i) => (
              <motion.span
                key={f}
                initial={{ opacity: 0, scale: 0.82 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.72 + i * 0.06 }}
                style={{
                  fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.45)',
                  padding: '4px 10px', borderRadius: 999,
                  border: '1px solid rgba(255,255,255,0.08)',
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                }}
              >
                <span style={{ color: '#34d399', fontSize: 11 }}>✓</span>{f}
              </motion.span>
            ))}
          </div>

        </motion.div>
      </motion.div>
    </div>
  );
}
