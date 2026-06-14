import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { COLOR_THEMES, FONT_OPTIONS, LAYOUT_OPTIONS } from '../../lib/constants';

type Tab = 'colors' | 'styles' | 'image' | 'font' | 'layout';

const STYLES = [
  { id: 'default', label: 'Default', desc: 'Glass + Gradient', preview: { bg: '#0f1117', accent: '#7c3aed' } },
  { id: 'classic', label: 'Classic', desc: 'Clean + Professional', preview: { bg: '#f8fafc', accent: '#2563eb' } },
  { id: 'neon',    label: 'Neon',    desc: 'Cyber + Glow', preview: { bg: '#030712', accent: '#00ff88' }, warning: true },
  { id: 'retro',   label: 'Retro',   desc: 'Terminal + Pixel', preview: { bg: '#001100', accent: '#00ff00' }, warning: true },
  { id: 'cartoon', label: 'Cartoon', desc: 'Bold + Comic', preview: { bg: '#fef3c7', accent: '#7c3aed' } },
];

export function ThemeStudio() {
  const open    = useStore((s) => s.themeStudioOpen);
  const setOpen = useStore((s) => s.setThemeStudioOpen);
  const addToast = useStore((s) => s.addToast);

  const [tab, setTab]         = useState<Tab>('colors');
  const [activeColor, setActiveColor] = useState('default');
  const [activeStyle, setActiveStyle] = useState('default');
  const [activeFont,  setActiveFont]  = useState('inter');
  const [activeLayout, setActiveLayout] = useState('comfortable');
  const [bgUrl,    setBgUrl]    = useState('');
  const [bgOpacity, setBgOpacity] = useState(80);
  const [bgBlur,   setBgBlur]   = useState(4);

  const applyColor = (theme: typeof COLOR_THEMES[0]) => {
    document.documentElement.style.setProperty('--grad-start', theme.start);
    document.documentElement.style.setProperty('--grad-end',   theme.end);
    document.documentElement.style.setProperty('--color-accent', theme.start);
    setActiveColor(theme.id);
    addToast(`Theme: ${theme.label}`, 'info');
  };

  const applyStyle = (id: string) => {
    document.documentElement.removeAttribute('data-style');
    document.documentElement.setAttribute('data-style', id);

    const vars: Record<string, Record<string, string>> = {
      default: { '--color-bg': '#0f1117', '--color-surface': '#1a1d27', '--color-surface-2': '#22263a', '--color-border': '#2e3347', '--color-text': '#e2e8f0' },
      classic: { '--color-bg': '#f8fafc', '--color-surface': '#ffffff', '--color-surface-2': '#f1f5f9', '--color-border': '#e2e8f0', '--color-text': '#1e293b' },
      neon:    { '--color-bg': '#030712', '--color-surface': '#050d16', '--color-surface-2': '#0a1628', '--color-border': '#00ff8833', '--color-text': '#00ff88', '--color-accent': '#00ff88', '--grad-start': '#00ff88', '--grad-end': '#0088ff' },
      retro:   { '--color-bg': '#001100', '--color-surface': '#001a00', '--color-surface-2': '#002200', '--color-border': '#00440033', '--color-text': '#00ff00', '--color-accent': '#00ff00', '--grad-start': '#00ff00', '--grad-end': '#00aa00', '--font-sans': 'monospace' },
      cartoon: { '--color-bg': '#fffbeb', '--color-surface': '#ffffff', '--color-surface-2': '#fef3c7', '--color-border': '#000', '--color-text': '#1c1917', '--color-accent': '#7c3aed' },
    };
    const v = vars[id] || vars.default;
    Object.entries(v).forEach(([k, val]) => document.documentElement.style.setProperty(k, val));
    setActiveStyle(id);
    addToast(`Style: ${id}`, 'info');
  };

  const applyFont = (fontValue: string) => {
    document.documentElement.style.setProperty('--font-sans', fontValue);
    if (!fontValue.startsWith('system') && !fontValue.startsWith('monospace')) {
      const name = fontValue.split(',')[0].replace(/'/g, '').trim();
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(name)}:wght@400;500;600;700&display=swap`;
      document.head.appendChild(link);
    }
    addToast(`Font updated`, 'info');
  };

  const applyBg = () => {
    if (!bgUrl.trim()) return;
    document.documentElement.style.setProperty('--bg-image', `url('${bgUrl}')`);
    document.body.style.backgroundImage = `url('${bgUrl}')`;
    document.body.style.backgroundSize  = 'cover';
    document.body.style.backgroundPosition = 'center';
    document.body.style.backgroundAttachment = 'fixed';
    document.querySelectorAll<HTMLElement>('.card,.modal,.ai-panel,.kcol,header,aside').forEach((el) => {
      el.style.backdropFilter = `blur(${bgBlur}px)`;
      el.style.opacity = String(bgOpacity / 100);
    });
    addToast('Background applied', 'success');
  };

  const applyLayout = (pad: string) => {
    document.querySelectorAll<HTMLElement>('.tbl td,.tbl th').forEach((el) => {
      el.style.padding = pad;
    });
    addToast('Layout updated', 'info');
  };

  if (!open) return null;

  const TABS: { id: Tab; label: string }[] = [
    { id: 'colors', label: '🎨 Colors' },
    { id: 'styles', label: '✨ Styles' },
    { id: 'image',  label: '🖼 Image'  },
    { id: 'font',   label: 'Aa Font'   },
    { id: 'layout', label: '⊞ Layout'  },
  ];

  return (
    <AnimatePresence>
      <motion.div
        className="modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={(e) => e.target === e.currentTarget && setOpen(false)}
      >
        <motion.div
          className="modal"
          style={{ maxWidth: 560 }}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1,    opacity: 1 }}
          exit={{ scale: 0.95,    opacity: 0 }}
        >
          <div className="modal-header">
            <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text)' }}>Theme Studio</h2>
            <button className="btn-icon" onClick={() => setOpen(false)}><X size={16} /></button>
          </div>

          {/* Tab bar */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', padding: '0 20px' }}>
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  padding: '10px 14px',
                  fontSize: 13,
                  fontWeight: 500,
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  color: tab === t.id ? 'var(--color-accent)' : 'var(--color-muted)',
                  borderBottom: tab === t.id ? '2px solid var(--color-accent)' : '2px solid transparent',
                  transition: 'all 0.15s',
                  whiteSpace: 'nowrap',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="modal-body">
            {/* Colors */}
            {tab === 'colors' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                {COLOR_THEMES.map((theme) => (
                  <div
                    key={theme.id}
                    className={`theme-card ${activeColor === theme.id ? 'selected' : ''}`}
                    onClick={() => applyColor(theme)}
                  >
                    <div
                      className="theme-swatch"
                      style={{ background: `linear-gradient(135deg, ${theme.start}, ${theme.end})` }}
                    />
                    <div style={{ fontSize: 12, color: 'var(--color-text)', fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      {theme.label}
                      {activeColor === theme.id && <Check size={12} style={{ color: 'var(--color-accent)' }} />}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Styles */}
            {tab === 'styles' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {STYLES.map((s) => (
                  <div key={s.id} className={`theme-card ${activeStyle === s.id ? 'selected' : ''}`} onClick={() => applyStyle(s.id)}>
                    <div style={{ height: 48, borderRadius: 6, background: s.preview.bg, border: `2px solid ${s.preview.accent}`, marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                      {[1,2,3].map((i) => <div key={i} style={{ width: 20, height: 10, background: i === 1 ? s.preview.accent : `${s.preview.accent}44`, borderRadius: 3 }} />)}
                    </div>
                    <div style={{ fontWeight: 600, fontSize: 12, color: 'var(--color-text)' }}>{s.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--color-muted)' }}>{s.desc}</div>
                    {s.warning && <div style={{ fontSize: 10, color: 'var(--color-warn)', marginTop: 4 }}>⚠ High contrast — best for personal use</div>}
                  </div>
                ))}
              </div>
            )}

            {/* Image */}
            {tab === 'image' && (
              <div>
                <div className="form-group">
                  <label>Background Image URL</label>
                  <input
                    type="url"
                    value={bgUrl}
                    onChange={(e) => setBgUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/…"
                  />
                </div>
                <div className="form-group">
                  <label>Content Opacity: {bgOpacity}%</label>
                  <input type="range" min={20} max={100} value={bgOpacity} onChange={(e) => setBgOpacity(Number(e.target.value))} />
                </div>
                <div className="form-group">
                  <label>Background Blur: {bgBlur}px</label>
                  <input type="range" min={0} max={20} value={bgBlur} onChange={(e) => setBgBlur(Number(e.target.value))} />
                </div>
                <button className="btn btn-primary" onClick={applyBg} disabled={!bgUrl.trim()}>
                  Apply Background
                </button>
              </div>
            )}

            {/* Font */}
            {tab === 'font' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {FONT_OPTIONS.map((f) => (
                  <div
                    key={f.id}
                    className={`theme-card ${activeFont === f.id ? 'selected' : ''}`}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px' }}
                    onClick={() => { setActiveFont(f.id); applyFont(f.value); }}
                  >
                    <div>
                      <div style={{ fontFamily: f.value, fontSize: 16, color: 'var(--color-text)', fontWeight: 500 }}>Aa</div>
                      <div style={{ fontSize: 12, color: 'var(--color-muted)', marginTop: 2 }}>{f.label}</div>
                    </div>
                    {activeFont === f.id && <Check size={14} style={{ color: 'var(--color-accent)' }} />}
                  </div>
                ))}
              </div>
            )}

            {/* Layout */}
            {tab === 'layout' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {LAYOUT_OPTIONS.map((l) => (
                  <div
                    key={l.id}
                    className={`theme-card ${activeLayout === l.id ? 'selected' : ''}`}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', cursor: 'pointer' }}
                    onClick={() => { setActiveLayout(l.id); applyLayout(l.pad); }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--color-text)' }}>{l.label}</div>
                      <div style={{ fontSize: 11, color: 'var(--color-muted)', marginTop: 2 }}>
                        {l.id === 'compact' ? 'Dense rows — show more data' : l.id === 'comfortable' ? 'Default spacing' : 'Large padding — easier to read'}
                      </div>
                    </div>
                    {activeLayout === l.id && <Check size={14} style={{ color: 'var(--color-accent)' }} />}
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
