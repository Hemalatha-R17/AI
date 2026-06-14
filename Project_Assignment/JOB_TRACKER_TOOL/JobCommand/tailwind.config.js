/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'JetBrains Mono', 'monospace'],
      },
      colors: {
        surface:  'var(--color-surface)',
        'surface-2': 'var(--color-surface-2)',
        border:   'var(--color-border)',
        accent:   'var(--color-accent)',
        'accent-hover': 'var(--color-accent-hover)',
        muted:    'var(--color-muted)',
      },
    },
  },
  plugins: [],
};
