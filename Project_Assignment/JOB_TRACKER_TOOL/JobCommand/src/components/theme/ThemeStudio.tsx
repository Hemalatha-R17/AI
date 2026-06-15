import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { COLOR_THEMES, FONT_OPTIONS, LAYOUT_OPTIONS } from '../../lib/constants';
import { saveTheme, loadThemeMeta } from '../../lib/theme';

type Tab = 'colors' | 'styles' | 'image' | 'font' | 'layout';

const STYLES = [
  { id: 'default', label: 'Default', desc: 'Deep Space + Indigo', preview: { bg: '#04080f', accent: '#6366f1' } },
  { id: 'classic', label: 'Classic', desc: 'Clean + Professional', preview: { bg: '#f8fafc', accent: '#6366f1' } },
  { id: 'neon',    label: 'Neon',    desc: 'Cyber + Glow', preview: { bg: '#030712', accent: '#00ff88' }, warning: true },
  { id: 'retro',   label: 'Retro',   desc: 'Terminal + Pixel', preview: { bg: '#001100', accent: '#00ff00' }, warning: true },
  { id: 'cartoon', label: 'Cartoon', desc: 'Bold + Comic', preview: { bg: '#fef3c7', accent: '#7c3aed' } },
];

export function ThemeStudio() {
  const open    = useStore((s) => s.themeStudioOpen);
  const setOpen = useStore((s) => s.setThemeStudioOpen);
  const addToast = useStore((s) => s.addToast);

  const [tab, setTab]         = useState<Tab>('colors');
  const saved = loadThemeMeta();
  const [activeColor,  setActiveColor]  = useState(saved?.colorId  || 'default');
  const [activeStyle,  setActiveStyle]  = useState(saved?.styleId  || 'default');
  const [activeFont,   setActiveFont]   = useState(saved?.fontId   || 'inter');
  const [activeLayout, setActiveLayout] = useState(saved?.layoutId || 'comfortable');
  const [bgUrl,    setBgUrl]    = useState('');
  const [bgOpacity, setBgOpacity] = useState(80);
  const [bgBlur,   setBgBlur]   = useState(4);

  const applyColor = (theme: typeof COLOR_THEMES[0]) => {
    document.documentElement.style.setProperty('--grad-start', theme.start);
    document.documentElement.style.setProperty('--grad-end',   theme.end);
    document.documentElement.style.setProperty('--color-accent', theme.start);
    const isLight = getComputedStyle(document.documentElement).getPropertyValue('--color-bg').trim().startsWith('#f');
    document.documentElement.style.setProperty('--color-muted',    isLight ? '#94a3b8' : '#64748b');
    document.documentElement.style.setProperty('--color-text-dim', isLight ? '#475569' : '#94a3b8');
    setActiveColor(theme.id);
    saveTheme({ colorId: theme.id, styleId: activeStyle, fontId: activeFont, layoutId: activeLayout });
    addToast(`Theme: ${theme.label}`, 'info');
  };

  const applyStyle = (id: string) => {
    document.documentElement.removeAttribute('data-style');
    document.documentElement.setAttribute('data-style', id);

    const vars: Record<string, Record<string, string>> = {
      default: {
        '--color-bg': '#04080f', '--color-surface': '#080f1e', '--color-surface-2': '#0d1728',
        '--color-border': '#172438', '--color-text': '#e8f4ff', '--color-text-dim': '#7aadcc',
        '--color-muted': '#4a6582',
        '--color-accent': '#38bdf8', '--grad-start': '#6366f1', '--grad-end': '#06b6d4',
      },
      classic: {
        '--color-bg': '#f8fafc', '--color-surface': '#ffffff', '--color-surface-2': '#f1f5f9',
        '--color-border': '#e2e8f0', '--color-text': '#1e293b', '--color-text-dim': '#475569',
        '--color-muted': '#94a3b8',
      },
      neon: {
        '--color-bg': '#030712', '--color-surface': '#050d16', '--color-surface-2': '#0a1628',
        '--color-border': '#00ff8833', '--color-text': '#00ff88', '--color-text-dim': '#00cc66',
        '--color-muted': '#007744',
        '--color-accent': '#00ff88', '--grad-start': '#00ff88', '--grad-end': '#0088ff',
      },
      retro: {
        '--color-bg': '#001100', '--color-surface': '#001a00', '--color-surface-2': '#002200',
        '--color-border': '#00440033', '--color-text': '#00ff00', '--color-text-dim': '#00cc00',
        '--color-muted': '#006600',
        '--color-accent': '#00ff00', '--grad-start': '#00ff00', '--grad-end': '#00aa00',
        '--font-sans': 'monospace',
      },
      cartoon: {
        '--color-bg': '#fffbeb', '--color-surface': '#ffffff', '--color-surface-2': '#fef3c7',
        '--color-border': '#000', '--color-text': '#1c1917', '--color-text-dim': '#44403c',
        '--color-muted': '#78716c',
        '--color-accent': '#7c3aed',
      },
    };
    const v = vars[id] || vars.default;
    Object.entries(v).forEach(([k, val]) => document.documentElement.style.setProperty(k, val));
    setActiveStyle(id);
    saveTheme({ colorId: activeColor, styleId: id, fontId: activeFont, layoutId: activeLayout });
    addToast(`Style: ${id}`, 'info');
  };

  const applyFont = (fontId: string, fontValue: string) => {
    document.documentElement.style.setProperty('--font-sans', fontValue);
    if (!fontValue.startsWith('system') && !fontValue.startsWith('monospace')) {
      const name = fontValue.split(',')[0].replace(/'/g, '').trim();
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(name)}:wght@400;500;600;700&display=swap`;
      document.head.appendChild(link);
    }
    setActiveFont(fontId);
    saveTheme({ colorId: activeColor, styleId: activeStyle, fontId, layoutId: activeLayout });
    addToast(`Font updated`, 'info');
  };

  const applyBg = () => {
    if (!bgUrl.trim()) return;
    document.documentElement.style.setProperty('--bg-image', `url('${bgUrl}')`);
    // Target the app root div — body is covered by the root <div> with background: var(--color-bg)
    const appRoot = document.querySelector<HTMLElement>('#root > div');
    const target = appRoot ?? document.body;
    target.style.backgroundImage    = `url('${bgUrl}')`;
    target.style.backgroundSize     = 'cover';
    target.style.backgroundPosition = 'center';
    target.style.backgroundRepeat   = 'no-repeat';
    // Mark root so CSS can make content areas opaque against the background image
    document.documentElement.classList.add('has-bg-image');
    // Optional blur on glass surfaces
    const blur = bgBlur > 0 ? `blur(${bgBlur}px)` : '';
    document.querySelectorAll<HTMLElement>('.card,.kcol').forEach((el) => {
      el.style.backdropFilter = blur;
    });
    addToast('Background applied', 'success');
  };

  const applyLayout = (layoutId: string, pad: string) => {
    document.documentElement.style.setProperty('--tbl-cell-pad', pad);
    setActiveLayout(layoutId);
    saveTheme({ colorId: activeColor, styleId: activeStyle, fontId: activeFont, layoutId });
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
          <div className="ts-tabbar" style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', padding: '0 20px' }}>
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
              <div className="ts-colors-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
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
              <div className="ts-styles-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
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
                    onClick={() => applyFont(f.id, f.value)}
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
                    onClick={() => applyLayout(l.id, l.pad)}
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
