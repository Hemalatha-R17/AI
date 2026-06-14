import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { useJobs } from '../store/useStore';
import { STATUS_COLORS, STATUS_ORDER } from '../lib/constants';
import type { Status } from '../types';

export function Analytics() {
  const jobs = useJobs();

  // Conversion funnel
  const funnel = useMemo(() => {
    const stages: Status[] = ['Saved', 'Submitted', 'Phone Screen', 'Interview', 'Offer', 'Accepted'];
    return stages.map((s) => ({
      name: s,
      value: jobs.filter((j) => STATUS_ORDER[j.status] >= STATUS_ORDER[s]).length,
      fill: STATUS_COLORS[s],
    }));
  }, [jobs]);

  // Applications per week
  const weekly = useMemo(() => {
    const weeks: Record<string, number> = {};
    for (let i = 11; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i * 7);
      weeks[`${d.getMonth()+1}/${d.getDate()}`] = 0;
    }
    for (const j of jobs) {
      if (!j.appliedDate) continue;
      const d = new Date(j.appliedDate);
      const diff = Math.floor((Date.now() - d.getTime()) / 86400000);
      if (diff < 84) {
        const d2 = new Date(); d2.setDate(d2.getDate() - Math.floor(diff / 7) * 7);
        const k = `${d2.getMonth()+1}/${d2.getDate()}`;
        weeks[k] = (weeks[k] || 0) + 1;
      }
    }
    return Object.entries(weeks).map(([week, count]) => ({ week, count }));
  }, [jobs]);

  // Source effectiveness
  const sourceData = useMemo(() => {
    const sources = [...new Set(jobs.map((j) => j.source).filter(Boolean))];
    return sources.map((src) => {
      const total = jobs.filter((j) => j.source === src).length;
      const interviewed = jobs.filter((j) => j.source === src && STATUS_ORDER[j.status] >= STATUS_ORDER['Phone Screen']).length;
      const rate = total < 3 ? null : Math.round((interviewed / total) * 100);
      return { source: src, total, interviewed, rate };
    }).sort((a, b) => (b.rate ?? -1) - (a.rate ?? -1));
  }, [jobs]);

  // Salary distribution
  const salaryData = useMemo(() => {
    const buckets: Record<string, number> = { '<50k': 0, '50-100k': 0, '100-150k': 0, '150-200k': 0, '200k+': 0 };
    for (const j of jobs) {
      const s = j.salaryMin ?? j.salaryMax;
      if (s === null || s === undefined) continue;
      const usd = j.currency === 'INR' ? s / 83 : s;
      if (usd < 50000)        buckets['<50k']++;
      else if (usd < 100000)  buckets['50-100k']++;
      else if (usd < 150000)  buckets['100-150k']++;
      else if (usd < 200000)  buckets['150-200k']++;
      else                    buckets['200k+']++;
    }
    return Object.entries(buckets).map(([range, count]) => ({ range, count }));
  }, [jobs]);

  const chartTip = {
    contentStyle: { background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 6, fontSize: 12 },
    labelStyle: { color: 'var(--color-text)' },
  };

  return (
    <div style={{ padding: 24, overflowY: 'auto', flex: 1 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* Conversion funnel */}
        <div className="card">
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 16 }}>📈 Conversion Funnel</div>
          {funnel.every((f) => f.value === 0) ? (
            <div className="empty-state" style={{ padding: '32px 0' }}>No data yet</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {funnel.map((f) => {
                const base = funnel[0].value || 1;
                const pct = Math.round((f.value / base) * 100);
                return (
                  <div key={f.name} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12 }}>
                    <span style={{ width: 90, color: 'var(--color-text-dim)', flexShrink: 0 }}>{f.name}</span>
                    <div style={{ flex: 1, background: 'var(--color-surface-2)', borderRadius: 4, height: 20, position: 'relative' }}>
                      <div style={{ height: 20, borderRadius: 4, background: f.fill, width: `${pct}%`, opacity: 0.8, transition: 'width 0.6s' }} />
                    </div>
                    <span style={{ width: 36, textAlign: 'right', fontWeight: 600, color: 'var(--color-text)' }}>{f.value}</span>
                    <span style={{ width: 42, textAlign: 'right', color: 'var(--color-muted)' }}>{pct}%</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Weekly bar chart */}
        <div className="card">
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 16 }}>📊 Applications per Week</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weekly} margin={{ top: 4, right: 4, bottom: 4, left: -20 }}>
              <XAxis dataKey="week" tick={{ fontSize: 10, fill: 'var(--color-muted)' }} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--color-muted)' }} allowDecimals={false} />
              <Tooltip {...chartTip} />
              <Bar dataKey="count" fill="var(--color-accent)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Source effectiveness */}
        <div className="card">
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 16 }}>🎯 Source Effectiveness</div>
          {sourceData.length === 0 ? (
            <div className="empty-state" style={{ padding: '24px 0' }}>No source data yet</div>
          ) : (
            <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '4px 8px', color: 'var(--color-muted)', fontWeight: 600, fontSize: 10, textTransform: 'uppercase' }}>Source</th>
                  <th style={{ textAlign: 'right', padding: '4px 8px', color: 'var(--color-muted)', fontWeight: 600, fontSize: 10, textTransform: 'uppercase' }}>Total</th>
                  <th style={{ textAlign: 'right', padding: '4px 8px', color: 'var(--color-muted)', fontWeight: 600, fontSize: 10, textTransform: 'uppercase' }}>Interviews</th>
                  <th style={{ textAlign: 'right', padding: '4px 8px', color: 'var(--color-muted)', fontWeight: 600, fontSize: 10, textTransform: 'uppercase' }}>Rate</th>
                </tr>
              </thead>
              <tbody>
                {sourceData.map((s) => (
                  <tr key={s.source}>
                    <td style={{ padding: '6px 8px' }}>{s.source}</td>
                    <td style={{ padding: '6px 8px', textAlign: 'right', color: 'var(--color-text-dim)' }}>{s.total}</td>
                    <td style={{ padding: '6px 8px', textAlign: 'right', color: 'var(--color-text-dim)' }}>{s.interviewed}</td>
                    <td style={{ padding: '6px 8px', textAlign: 'right' }}>
                      {s.rate === null ? (
                        <span style={{ color: 'var(--color-muted)', fontSize: 10 }}>Insufficient data</span>
                      ) : (
                        <span style={{ color: s.rate >= 30 ? 'var(--color-success)' : s.rate >= 15 ? 'var(--color-warn)' : 'var(--color-danger)', fontWeight: 700 }}>
                          {s.rate}%
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Salary distribution */}
        <div className="card">
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 16 }}>💰 Salary Distribution (USD equiv.)</div>
          {salaryData.every((d) => d.count === 0) ? (
            <div className="empty-state" style={{ padding: '24px 0' }}>No salary data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={salaryData} margin={{ top: 4, right: 4, bottom: 4, left: -20 }}>
                <XAxis dataKey="range" tick={{ fontSize: 10, fill: 'var(--color-muted)' }} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--color-muted)' }} allowDecimals={false} />
                <Tooltip {...chartTip} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {salaryData.map((_d, i) => (
                    <Cell key={i} fill={['#7c3aed','#2563eb','#0ea5e9','#10b981','#f59e0b'][i % 5]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
