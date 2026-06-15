import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export type SelectOption = string | { value: string; label: string; sublabel?: string };

interface Props {
  value: string;
  onChange: (v: string) => void;
  options: SelectOption[];
  placeholder?: string;
  style?: React.CSSProperties;
}

function norm(o: SelectOption) {
  return typeof o === 'string' ? { value: o, label: o, sublabel: undefined } : { sublabel: undefined, ...o };
}

export function CustomSelect({ value, onChange, options, placeholder = 'Select…', style }: Props) {
  const [open, setOpen]   = useState(false);
  const [pos,  setPos]    = useState<{ top: number; left: number; width: number } | null>(null);
  const triggerRef        = useRef<HTMLDivElement>(null);

  const opts     = options.map(norm);
  const selected = opts.find((o) => o.value === value);

  const calcPos = useCallback(() => {
    if (!triggerRef.current) return null;
    const r = triggerRef.current.getBoundingClientRect();
    const listHeight = Math.min(opts.length * 38 + 56, 260);
    const spaceBelow = window.innerHeight - r.bottom;
    const top = spaceBelow < listHeight + 8 ? r.top - listHeight - 4 : r.bottom + 4;
    return { top, left: r.left, width: r.width };
  }, [opts.length]);

  const openDropdown = useCallback(() => {
    const p = calcPos();
    if (p) { setPos(p); setOpen(true); }
  }, [calcPos]);

  useEffect(() => {
    if (!open) return;
    const closeOnClick = (e: MouseEvent) => {
      if (!triggerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const closeOnEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    // Recalculate position whenever any ancestor scrolls or window resizes
    const reposition = () => { const p = calcPos(); if (p) setPos(p); };
    document.addEventListener('mousedown', closeOnClick);
    document.addEventListener('keydown', closeOnEsc);
    window.addEventListener('scroll', reposition, true);   // capture → catches modal scroll
    window.addEventListener('resize', reposition);
    return () => {
      document.removeEventListener('mousedown', closeOnClick);
      document.removeEventListener('keydown', closeOnEsc);
      window.removeEventListener('scroll', reposition, true);
      window.removeEventListener('resize', reposition);
    };
  }, [open, calcPos]);

  const trigger = (
    <div
      ref={triggerRef}
      role="combobox"
      aria-expanded={open}
      tabIndex={0}
      onClick={() => open ? setOpen(false) : openDropdown()}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open ? setOpen(false) : openDropdown(); }
      }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '0 12px',
        height: 36,
        background: open
          ? 'color-mix(in srgb, var(--color-surface-2) 85%, var(--color-accent) 15%)'
          : 'var(--color-surface-2)',
        border: `1px solid ${open ? 'var(--color-accent)' : 'var(--color-border)'}`,
        borderRadius: 'var(--radius-sm, 6px)',
        cursor: 'pointer',
        fontSize: 13,
        color: selected ? 'var(--color-text)' : 'var(--color-muted)',
        boxShadow: open ? '0 0 0 3px rgba(56,189,248,0.14), inset 0 1px 2px rgba(0,0,0,0.25)' : 'none',
        transition: 'border-color 0.15s, box-shadow 0.15s, background 0.15s',
        outline: 'none',
        userSelect: 'none',
        ...style,
      }}
    >
      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {selected
          ? selected.sublabel
            ? `${selected.label}  —  ${selected.sublabel.split('  ·  ')[0]}`
            : selected.label
          : placeholder}
      </span>
      <ChevronDown
        size={14}
        style={{
          flexShrink: 0,
          color: open ? 'var(--color-accent)' : 'var(--color-muted)',
          transform: open ? 'rotate(180deg)' : 'none',
          transition: 'transform 0.2s, color 0.15s',
        }}
      />
    </div>
  );

  const portal = createPortal(
    <AnimatePresence>
      {open && pos && (
        <motion.div
          initial={{ opacity: 0, y: -6, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, scale: 0.97 }}
          transition={{ duration: 0.13 }}
          onMouseDown={(e) => e.stopPropagation()}
          style={{
            position: 'fixed',
            top: pos.top,
            left: pos.left,
            width: pos.width,
            zIndex: 99999,
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 8,
            boxShadow: '0 12px 40px rgba(0,0,0,0.65), 0 2px 8px rgba(0,0,0,0.4)',
            overflow: 'hidden',
            maxHeight: 260,
            overflowY: 'auto',
          }}
        >
          {/* Placeholder / clear row */}
          <div
            onClick={() => { onChange(''); setOpen(false); }}
            style={{
              padding: '9px 14px',
              fontSize: 13,
              cursor: 'pointer',
              color: 'var(--color-muted)',
              borderLeft: '2px solid transparent',
              borderBottom: '1px solid var(--color-border)',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(56,189,248,0.05)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
          >
            {placeholder}
          </div>

          {opts.map((opt) => {
            const active = opt.value === value;
            return (
              <div
                key={opt.value}
                onClick={() => { onChange(opt.value); setOpen(false); }}
                style={{
                  padding: opt.sublabel ? '7px 14px' : '9px 14px',
                  fontSize: 13,
                  cursor: 'pointer',
                  color: active ? 'var(--color-accent)' : 'var(--color-text)',
                  background: active ? 'rgba(56,189,248,0.08)' : 'transparent',
                  borderLeft: active ? '2px solid var(--color-accent)' : '2px solid transparent',
                  transition: 'background 0.1s',
                  fontWeight: active ? 500 : 400,
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = active ? 'rgba(56,189,248,0.12)' : 'rgba(56,189,248,0.05)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = active ? 'rgba(56,189,248,0.08)' : 'transparent'; }}
              >
                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{opt.label}</div>
                {opt.sublabel && (
                  <div style={{ fontSize: 11, color: active ? 'var(--color-accent)' : 'var(--color-muted)', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 400 }}>
                    {opt.sublabel}
                  </div>
                )}
              </div>
            );
          })}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );

  return (
    <>
      {trigger}
      {portal}
    </>
  );
}
