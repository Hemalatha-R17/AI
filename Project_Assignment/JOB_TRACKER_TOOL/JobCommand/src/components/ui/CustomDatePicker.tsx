import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  format, isValid, startOfMonth, endOfMonth,
  eachDayOfInterval, isSameDay, isSameMonth, isToday,
  addMonths, subMonths, startOfWeek, endOfWeek,
} from 'date-fns';

interface Props {
  value: string;        // YYYY-MM-DD or ''
  onChange: (v: string) => void;
  style?: React.CSSProperties;
  placeholder?: string;
}

const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function parseLocal(s: string): Date | null {
  if (!s) return null;
  const d = new Date(s + 'T00:00:00');
  return isValid(d) ? d : null;
}

export function CustomDatePicker({ value, onChange, style, placeholder = 'Pick a date…' }: Props) {
  const [open, setOpen] = useState(false);
  const [pos,  setPos]  = useState<{ top: number; left: number; width: number } | null>(null);
  const triggerRef      = useRef<HTMLDivElement>(null);

  const parsed      = parseLocal(value);
  const displayVal  = parsed ? format(parsed, 'MMM d, yyyy') : '';

  const [viewDate, setViewDate] = useState<Date>(() => parsed ?? new Date());

  useEffect(() => {
    if (parsed) setViewDate(parsed);
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  const calcPos = useCallback(() => {
    if (!triggerRef.current) return null;
    const r = triggerRef.current.getBoundingClientRect();
    const calH = 320;
    const top  = window.innerHeight - r.bottom < calH + 8 ? r.top - calH - 4 : r.bottom + 4;
    return { top, left: r.left, width: Math.max(r.width, 248) };
  }, []);

  const openPicker = useCallback(() => {
    const p = calcPos();
    if (p) { setPos(p); setOpen(true); }
  }, [calcPos]);

  useEffect(() => {
    if (!open) return;
    const closeOnClick = (e: MouseEvent) => {
      if (!triggerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const closeOnEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    const reposition = () => { const p = calcPos(); if (p) setPos(p); };
    document.addEventListener('mousedown', closeOnClick);
    document.addEventListener('keydown', closeOnEsc);
    window.addEventListener('scroll', reposition, true);  // capture → catches modal scroll
    window.addEventListener('resize', reposition);
    return () => {
      document.removeEventListener('mousedown', closeOnClick);
      document.removeEventListener('keydown', closeOnEsc);
      window.removeEventListener('scroll', reposition, true);
      window.removeEventListener('resize', reposition);
    };
  }, [open, calcPos]);

  const monthStart = startOfMonth(viewDate);
  const monthEnd   = endOfMonth(viewDate);
  const days       = eachDayOfInterval({ start: startOfWeek(monthStart), end: endOfWeek(monthEnd) });

  const pick = (d: Date) => {
    onChange(format(d, 'yyyy-MM-dd'));
    setOpen(false);
  };

  const trigger = (
    <div
      ref={triggerRef}
      role="button"
      tabIndex={0}
      onClick={() => open ? setOpen(false) : openPicker()}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open ? setOpen(false) : openPicker(); } }}
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
        color: displayVal ? 'var(--color-text)' : 'var(--color-muted)',
        boxShadow: open ? '0 0 0 3px rgba(56,189,248,0.14)' : 'none',
        transition: 'border-color 0.15s, box-shadow 0.15s, background 0.15s',
        outline: 'none',
        userSelect: 'none',
        ...style,
      }}
    >
      <Calendar
        size={14}
        style={{ flexShrink: 0, color: open ? 'var(--color-accent)' : 'var(--color-muted)', transition: 'color 0.15s' }}
      />
      <span style={{ flex: 1 }}>{displayVal || placeholder}</span>
      {value && (
        <X
          size={12}
          style={{ flexShrink: 0, color: 'var(--color-muted)' }}
          onClick={(e) => { e.stopPropagation(); onChange(''); }}
        />
      )}
    </div>
  );

  const portal = createPortal(
    <AnimatePresence>
      {open && pos && (
        <motion.div
          initial={{ opacity: 0, y: -6, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, scale: 0.97 }}
          transition={{ duration: 0.14 }}
          onMouseDown={(e) => e.stopPropagation()}
          style={{
            position: 'fixed',
            top: pos.top,
            left: pos.left,
            width: 248,
            zIndex: 99999,
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 10,
            boxShadow: '0 12px 40px rgba(0,0,0,0.65), 0 2px 8px rgba(0,0,0,0.4)',
            padding: '14px 12px 10px',
          }}
        >
          {/* Month navigator */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <button
              onClick={() => setViewDate((d) => subMonths(d, 1))}
              style={navBtnStyle}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-surface-2)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
            >
              <ChevronLeft size={15} />
            </button>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)', letterSpacing: '-0.01em' }}>
              {format(viewDate, 'MMMM yyyy')}
            </span>
            <button
              onClick={() => setViewDate((d) => addMonths(d, 1))}
              style={navBtnStyle}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-surface-2)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
            >
              <ChevronRight size={15} />
            </button>
          </div>

          {/* Day-of-week headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 4 }}>
            {DAY_LABELS.map((d) => (
              <div key={d} style={{ textAlign: 'center', fontSize: 10, fontWeight: 600, color: 'var(--color-muted)', padding: '2px 0' }}>
                {d}
              </div>
            ))}
          </div>

          {/* Day grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
            {days.map((d) => {
              const sel      = parsed ? isSameDay(d, parsed) : false;
              const todayDay = isToday(d);
              const inMonth  = isSameMonth(d, viewDate);
              return (
                <button
                  key={d.toISOString()}
                  onClick={() => pick(d)}
                  style={{
                    background: sel
                      ? 'linear-gradient(135deg, var(--grad-start), var(--grad-end))'
                      : todayDay
                      ? 'rgba(56,189,248,0.1)'
                      : 'transparent',
                    border: todayDay && !sel
                      ? '1px solid rgba(56,189,248,0.35)'
                      : '1px solid transparent',
                    borderRadius: 6,
                    padding: '5px 2px',
                    fontSize: 12,
                    cursor: 'pointer',
                    color: sel ? '#fff' : inMonth ? 'var(--color-text)' : 'var(--color-muted)',
                    opacity: inMonth ? 1 : 0.3,
                    fontWeight: sel || todayDay ? 600 : 400,
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={(e) => {
                    if (!sel) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(56,189,248,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    if (!sel) (e.currentTarget as HTMLButtonElement).style.background = todayDay ? 'rgba(56,189,248,0.1)' : 'transparent';
                  }}
                >
                  {format(d, 'd')}
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, paddingTop: 8, borderTop: '1px solid var(--color-border)' }}>
            <button
              onClick={() => { onChange(''); setOpen(false); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: 'var(--color-muted)', padding: '2px 6px', borderRadius: 4 }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-muted)'; }}
            >
              Clear
            </button>
            <button
              onClick={() => pick(new Date())}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: 'var(--color-accent)', fontWeight: 500, padding: '2px 6px', borderRadius: 4 }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(56,189,248,0.08)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
            >
              Today
            </button>
          </div>
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

const navBtnStyle: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  color: 'var(--color-muted)',
  padding: 5,
  borderRadius: 6,
  display: 'flex',
  alignItems: 'center',
  transition: 'background 0.12s, color 0.12s',
};
