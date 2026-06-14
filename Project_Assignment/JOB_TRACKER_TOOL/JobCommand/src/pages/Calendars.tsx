import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { useJobs } from '../store/useStore';
import { STATUS_COLORS } from '../lib/constants';
import { formatDate } from '../lib/format';

export function Calendars() {
  const jobs  = useJobs();
  const [date, setDate] = useState(new Date());

  const year  = date.getFullYear();
  const month = date.getMonth();

  const prev = () => setDate(new Date(year, month - 1, 1));
  const next = () => setDate(new Date(year, month + 1, 1));

  // Build events
  const events = useMemo(() => {
    const map: Record<string, { label: string; color: string; company: string; url?: string }[]> = {};
    for (const j of jobs) {
      if (j.followUpDate) {
        const key = j.followUpDate;
        map[key] = map[key] || [];
        map[key].push({ label: `📅 ${j.company} follow-up`, color: '#f59e0b', company: j.company });
      }
      const interviewEntry = j.history?.find((h) => h.status === 'Interview' || h.status === 'Phone Screen');
      if (interviewEntry) {
        const key = interviewEntry.at.split('T')[0];
        map[key] = map[key] || [];
        map[key].push({ label: `🎯 ${j.company} ${interviewEntry.status}`, color: STATUS_COLORS[interviewEntry.status] || '#a855f7', company: j.company, url: j.url });
      }
    }
    return map;
  }, [jobs]);

  // Build calendar grid
  const firstDay  = new Date(year, month, 1).getDay();
  const daysInMon = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMon }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const todayStr = new Date().toISOString().split('T')[0];

  // Upcoming events list
  const upcoming = useMemo(() => {
    return Object.entries(events)
      .filter(([k]) => k >= todayStr)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(0, 10)
      .flatMap(([date, evs]) => evs.map((e) => ({ ...e, date })));
  }, [events, todayStr]);

  const monthName = date.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div style={{ padding: 24, flex: 1, overflow: 'auto', display: 'flex', gap: 20 }}>
      {/* Calendar */}
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <button className="btn-icon" onClick={prev}><ChevronLeft size={16} /></button>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text)', flex: 1, textAlign: 'center' }}>{monthName}</h2>
          <button className="btn-icon" onClick={next}><ChevronRight size={16} /></button>
        </div>

        {/* Day headers */}
        <div className="cal-grid" style={{ marginBottom: 4 }}>
          {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((d) => (
            <div key={d} style={{ padding: '4px', textAlign: 'center', fontSize: 11, fontWeight: 600, color: 'var(--color-muted)' }}>
              {d}
            </div>
          ))}
        </div>

        <div className="cal-grid">
          {cells.map((day, i) => {
            if (!day) return <div key={i} style={{ minHeight: 80 }} />;
            const key = `${year}-${String(month + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
            const dayEvents = events[key] || [];
            const isToday = key === todayStr;
            return (
              <div key={i} className={`cal-cell ${isToday ? 'today' : ''}`}>
                <div style={{ fontSize: 12, fontWeight: isToday ? 700 : 500, color: isToday ? 'var(--color-accent)' : 'var(--color-text-dim)', marginBottom: 2 }}>
                  {day}
                </div>
                {dayEvents.slice(0, 2).map((ev, j) => (
                  <div
                    key={j}
                    className="cal-event"
                    style={{ background: `${ev.color}22`, color: ev.color }}
                    title={ev.label}
                  >
                    {ev.label}
                  </div>
                ))}
                {dayEvents.length > 2 && (
                  <div style={{ fontSize: 9, color: 'var(--color-muted)', marginTop: 2 }}>+{dayEvents.length - 2} more</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming sidebar */}
      <div style={{ width: 280, flexShrink: 0 }}>
        <div className="card" style={{ position: 'sticky', top: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <CalendarDays size={14} /> Upcoming Events
          </div>
          {upcoming.length === 0 ? (
            <div className="empty-state" style={{ padding: '24px 0', fontSize: 12 }}>No upcoming events</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {upcoming.map((ev, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, fontSize: 12 }}>
                  <div style={{ width: 4, background: ev.color, borderRadius: 2, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--color-text)' }}>{ev.company}</div>
                    <div style={{ color: 'var(--color-muted)' }}>{ev.label.replace(/^[^ ]+ /, '')}</div>
                    <div style={{ color: 'var(--color-muted)', fontSize: 10 }}>{formatDate(ev.date)}</div>
                    {ev.url && (
                      <a
                        href={ev.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: 10, color: 'var(--color-accent)', textDecoration: 'none' }}
                      >
                        Join Meeting →
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
