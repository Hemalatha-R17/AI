import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays, TrendingUp } from 'lucide-react';
import { useJobs } from '../store/useStore';
import { STATUS_COLORS, STATUS_ORDER } from '../lib/constants';
import { formatDate } from '../lib/format';

const PIPELINE_STAGES = ['Submitted', 'Phone Screen', 'Interview', 'Offer', 'Accepted'] as const;

function ActivePipeline() {
  const jobs = useJobs();
  const active = useMemo(() =>
    jobs
      .filter((j) => ['Submitted', 'Phone Screen', 'Interview', 'Offer'].includes(j.status))
      .sort((a, b) => STATUS_ORDER[b.status as keyof typeof STATUS_ORDER] - STATUS_ORDER[a.status as keyof typeof STATUS_ORDER])
      .slice(0, 8),
    [jobs]
  );

  if (active.length === 0) return null;

  return (
    <div className="card">
      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
        <TrendingUp size={14} style={{ color: 'var(--color-accent)' }} /> Active Pipeline
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {active.map((job) => {
          const currentIdx = PIPELINE_STAGES.indexOf(job.status as typeof PIPELINE_STAGES[number]);
          return (
            <div key={job.id}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text)', marginBottom: 4 }}>
                {job.company}
                <span style={{ fontWeight: 400, color: 'var(--color-muted)', marginLeft: 6 }}>{job.role}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                {PIPELINE_STAGES.map((stage, i) => {
                  const reached = i <= currentIdx;
                  const isCurrent = i === currentIdx;
                  const color = STATUS_COLORS[stage as keyof typeof STATUS_COLORS];
                  return (
                    <div key={stage} style={{ display: 'flex', alignItems: 'center', flex: i < PIPELINE_STAGES.length - 1 ? 1 : 0 }}>
                      <div
                        title={stage}
                        style={{
                          width: isCurrent ? 10 : 7,
                          height: isCurrent ? 10 : 7,
                          borderRadius: '50%',
                          background: reached ? color : 'var(--color-border)',
                          border: isCurrent ? `2px solid ${color}` : 'none',
                          boxShadow: isCurrent ? `0 0 6px ${color}` : 'none',
                          flexShrink: 0,
                          transition: 'all 0.2s',
                        }}
                      />
                      {i < PIPELINE_STAGES.length - 1 && (
                        <div style={{
                          flex: 1,
                          height: 2,
                          background: i < currentIdx ? color : 'var(--color-border)',
                          transition: 'background 0.3s',
                        }} />
                      )}
                    </div>
                  );
                })}
              </div>
              <div style={{ fontSize: 9, color: STATUS_COLORS[job.status as keyof typeof STATUS_COLORS], fontWeight: 600, marginTop: 3 }}>
                {job.status}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

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
        const key = j.interviewDate || interviewEntry.at.split('T')[0];
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
    <div className="cal-layout" style={{ padding: 24, flex: 1, overflow: 'auto', display: 'flex', gap: 20 }}>
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

      {/* Upcoming + Pipeline sidebar */}
      <div className="cal-sidebar" style={{ width: 300, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Upcoming events */}
        <div className="card">
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

        {/* Interview pipeline timeline */}
        <ActivePipeline />
      </div>
    </div>
  );
}
