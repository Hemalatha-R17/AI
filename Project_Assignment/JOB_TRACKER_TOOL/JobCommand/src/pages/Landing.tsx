import { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Shield, Cpu, BarChart3, ArrowRight, Zap, Kanban } from 'lucide-react';
import { useStore } from '../store/useStore';
import { dbSaveProfile } from '../lib/db';

interface Props { onLogin: (name: string) => void }

export function Landing({ onLogin }: Props) {
  const hydrate = useStore((s) => s.hydrate);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const login = async () => {
    setLoading(true);
    const displayName = name.trim() || 'there';
    const profile = { id: 'default', name: displayName, createdAt: new Date().toISOString().split('T')[0], monthlyGoal: 10, defaultCurrency: 'USD' as const, skillProfile: '', masterResume: '' };
    await dbSaveProfile(profile);
    await hydrate();
    onLogin(displayName);
  };

  const FEATURES = [
    { icon: Kanban,   text: 'Kanban Pipeline'     },
    { icon: Cpu,      text: 'AI Resume Coach'      },
    { icon: Zap,      text: 'Interview Prep'       },
    { icon: BarChart3,text: 'Smart Analytics'      },
  ];

  const BADGES = ['100% Local', 'Zero Cloud', 'AI-Powered'];

  return (
    <div className="landing-bg" style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Left panel */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '48px 56px',
          background: 'linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(37,99,235,0.1) 100%)',
          borderRight: '1px solid var(--color-border)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative orbs */}
        <div style={{ position: 'absolute', top: -100, left: -100, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -50, right: -50, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 40 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #7c3aed, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Activity size={22} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-text)' }}>CareerPulse</div>
            <div style={{ fontSize: 12, color: 'var(--color-muted)' }}>Job Tracker AI</div>
          </div>
        </div>

        {/* Headline */}
        <h1 style={{ fontSize: 36, fontWeight: 800, lineHeight: 1.15, color: 'var(--color-text)', marginBottom: 16, letterSpacing: '-0.02em' }}>
          Track every application.<br />
          <span className="grad-text">Land the role</span><br />
          you deserve.
        </h1>

        {/* Trust badges */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 32, flexWrap: 'wrap' }}>
          {BADGES.map((b) => (
            <span key={b} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, padding: '4px 10px', background: 'rgba(16,185,129,0.1)', color: '#34d399', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 999 }}>
              <Shield size={10} /> {b}
            </span>
          ))}
        </div>

        {/* Feature pills */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {FEATURES.map(({ icon: Icon, text }) => (
            <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'var(--color-text-dim)' }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(124,58,237,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={13} style={{ color: 'var(--color-accent)' }} />
              </div>
              {text}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Right panel */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        style={{
          width: 420,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '48px 48px',
          background: 'var(--color-surface)',
        }}
      >
        <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-text)', marginBottom: 8 }}>
          Get started
        </h2>
        <p style={{ fontSize: 13, color: 'var(--color-muted)', marginBottom: 32, lineHeight: 1.6 }}>
          No account needed. Your data stays on your device.
        </p>

        <div className="form-group">
          <label>Your name (optional)</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Alex"
            onKeyDown={(e) => e.key === 'Enter' && login()}
            autoFocus
          />
        </div>

        <button
          className="btn btn-primary"
          style={{ width: '100%', padding: '12px', fontSize: 15, justifyContent: 'center', marginBottom: 20 }}
          onClick={login}
          disabled={loading}
        >
          {loading ? 'Loading…' : 'Enter CareerPulse'}
          <ArrowRight size={15} />
        </button>

        <p style={{ fontSize: 11, color: 'var(--color-muted)', textAlign: 'center', lineHeight: 1.6 }}>
          🔒 100% local. No backend, no login server, no cloud sync.<br />
          Your job data never leaves your browser.
        </p>

        <div style={{ marginTop: 32, paddingTop: 20, borderTop: '1px solid var(--color-border)', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {[
            ['8 Pipeline Stages', ''],
            ['AI Multi-Provider', ''],
            ['15 Themes', ''],
            ['Analytics', ''],
          ].map(([label]) => (
            <div key={label} style={{ fontSize: 11, color: 'var(--color-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ color: 'var(--color-success)' }}>✓</span> {label}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
