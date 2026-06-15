const VARS = [
  '--color-bg', '--color-surface', '--color-surface-2', '--color-border',
  '--color-text', '--color-text-dim', '--color-muted',
  '--color-accent', '--grad-start', '--grad-end',
  '--font-sans', '--tbl-cell-pad',
];

const KEY = 'cp-theme';

export interface ThemeMeta {
  colorId: string;
  styleId: string;
  fontId: string;
  layoutId: string;
}

export function saveTheme(meta: ThemeMeta) {
  const root = document.documentElement;
  const vars: Record<string, string> = {};
  for (const v of VARS) {
    const val = root.style.getPropertyValue(v);
    if (val) vars[v] = val;
  }
  localStorage.setItem(KEY, JSON.stringify({ vars, ...meta }));
}

/** Call this before React mounts to avoid flash of default theme. */
export function restoreTheme(): ThemeMeta | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw) as { vars: Record<string, string> } & ThemeMeta;
    const root = document.documentElement;
    for (const [k, v] of Object.entries(saved.vars)) {
      if (v) root.style.setProperty(k, v);
    }
    // Re-inject Google Fonts link if a non-system font was saved
    const fontVar = saved.vars['--font-sans'] || '';
    if (fontVar && !fontVar.startsWith('system') && !fontVar.startsWith('monospace') && !fontVar.startsWith('Inter')) {
      const name = fontVar.split(',')[0].replace(/'/g, '').trim();
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(name)}:wght@400;500;600;700&display=swap`;
      document.head.appendChild(link);
    }
    return { colorId: saved.colorId, styleId: saved.styleId, fontId: saved.fontId, layoutId: saved.layoutId };
  } catch {
    return null;
  }
}

export function loadThemeMeta(): ThemeMeta | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as ThemeMeta) : null;
  } catch {
    return null;
  }
}
