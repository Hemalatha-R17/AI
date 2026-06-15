import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, CartesianGrid,
} from 'recharts';
import { useJobs } from '../store/useStore';
import { STATUS_COLORS, STATUS_ORDER } from '../lib/constants';
import type { Status } from '../types';

const fade = (i: number) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, delay: i * 0.08, ease: [0.25, 0.1, 0.25, 1] as [number,number,number,number] },
});

const chartTip = {
  contentStyle: {
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: 8,
    fontSize: 12,
    boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
  },
  labelStyle: { color: 'var(--color-text)' },
  cursor: { fill: 'rgba(124,58,237,0.06)' },
};

const KPI_COLORS = ['#10b981', '#2563eb', '#f59e0b'];

export function Analytics() {
  const jobs = useJobs();

  const funnel = useMemo(() => {
    const stages: Status[] = ['Saved', 'Submitted', 'Phone Screen', 'Interview', 'Offer', 'Accepted'];
    return stages.map((s) => ({
      name: s,
      value: jobs.filter((j) => STATUS_ORDER[j.status] >= STATUS_ORDER[s]).length,
      fill: STATUS_COLORS[s],
    }));
  }, [jobs]);

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

  const sourceData = useMemo(() => {
    const sources = [...new Set(jobs.map((j) => j.source).filter(Boolean))];
    return sources.map((src) => {
      const total = jobs.filter((j) => j.source === src).length;
      const interviewed = jobs.filter((j) => j.source === src && STATUS_ORDER[j.status] >= STATUS_ORDER['Phone Screen']).length;
      const rate = total < 3 ? null : Math.round((interviewed / total) * 100);
      return { source: src, total, interviewed, rate };
    }).sort((a, b) => (b.rate ?? -1) - (a.rate ?? -1));
  }, [jobs]);

  const avgDaysToOffer = useMemo(() => {
    const durations: number[] = [];
    for (const j of jobs) {
      if (!j.history || j.history.length < 2) continue;
      const submitted = j.history.find((h) => h.status === 'Submitted');
      const offered   = j.history.find((h) => h.status === 'Offer');
      if (!submitted || !offered) continue;
      const days = Math.round((new Date(offered.at).getTime() - new Date(submitted.at).getTime()) / 86400000);
      if (days >= 0) durations.push(days);
    }
    return durations.length ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : null;
  }, [jobs]);

  const responseRate = useMemo(() => {
    const applied = jobs.filter((j) => j.status !== 'Saved');
    if (!applied.length) return null;
    const responded = applied.filter((j) => STATUS_ORDER[j.status] > STATUS_ORDER['Submitted']);
    return Math.round((responded.length / applied.length) * 100);
  }, [jobs]);

  const offerAcceptanceRate = useMemo(() => {
    const withOffer = jobs.filter((j) => j.history?.some((h) => h.status === 'Offer'));
    if (!withOffer.length) return null;
    const accepted = withOffer.filter((j) => j.status === 'Accepted').length;
    return Math.round((accepted / withOffer.length) * 100);
  }, [jobs]);

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

  const kpiCards = [
    {
      label: 'Avg. Days to Offer',
      value: avgDaysToOffer !== null ? `${avgDaysToOffer}d` : '—',
      sub: avgDaysToOffer !== null ? 'Submitted → Offer' : 'No offer data yet',
      color: KPI_COLORS[0],
      icon: '⚡',
    },
    {
      label: 'Response Rate',
      value: responseRate !== null ? `${responseRate}%` : '—',
      sub: responseRate !== null ? 'of submitted got reply' : 'No submissions yet',
      color: KPI_COLORS[1],
      icon: '📬',
    },
    {
      label: 'Offer Acceptance',
      value: offerAcceptanceRate !== null ? `${offerAcceptanceRate}%` : '—',
      sub: offerAcceptanceRate !== null ? 'of offers accepted' : 'No offers yet',
      color: KPI_COLORS[2],
      icon: '🏆',
    },
  ];

  const funnelBase = funnel[0].value || 1;

  return (
    <div style={{ padding: 24, overflowY: 'auto', flex: 1 }}>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
        {kpiCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            {...fade(i)}
            whileHover={{
              y: -5,
              boxShadow: `0 16px 40px ${stat.color}28, 0 0 0 1px ${stat.color}40`,
              borderColor: `${stat.color}60`,
            }}
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 14,
              padding: '20px 20px 18px',
              position: 'relative',
              overflow: 'hidden',
              cursor: 'default',
            }}
          >
            {/* Top accent bar */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: 3,
              background: `linear-gradient(90deg, transparent, ${stat.color}, transparent)`,
              boxShadow: `0 0 12px ${stat.color}`,
            }} />
            {/* Glow orb */}
            <div style={{
              position: 'absolute', top: -20, right: -20,
              width: 80, height: 80, borderRadius: '50%',
              background: stat.color, opacity: 0.06, filter: 'blur(20px)',
            }} />
            <div style={{ fontSize: 24, marginBottom: 8 }}>{stat.icon}</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
              {stat.label}
            </div>
            <div style={{ fontSize: 36, fontWeight: 800, color: stat.color, lineHeight: 1 }}>
              {stat.value}
            </div>
            <div style={{ fontSize: 11, color: 'var(--color-muted)', marginTop: 6 }}>{stat.sub}</div>
          </motion.div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* Conversion Funnel */}
        <motion.div className="card" {...fade(3)}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 18, color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16 }}>📈</span> Conversion Funnel
          </div>
          {funnel.every((f) => f.value === 0) ? (
            <div className="empty-state" style={{ padding: '32px 0' }}>No data yet</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {funnel.map((f, i) => {
                const pct = Math.round((f.value / funnelBase) * 100);
                return (
                  <div key={f.name} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12 }}>
                    <span style={{ width: 90, color: 'var(--color-text-dim)', flexShrink: 0, fontSize: 11 }}>{f.name}</span>
                    <div style={{ flex: 1, background: 'var(--color-surface-2)', borderRadius: 6, height: 22, position: 'relative', overflow: 'hidden' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, delay: 0.3 + i * 0.06, ease: 'easeOut' }}
                        style={{
                          height: '100%', borderRadius: 6,
                          background: f.fill,
                          opacity: 0.85,
                          boxShadow: `0 0 10px ${f.fill}80`,
                        }}
                      />
                    </div>
                    <span style={{ width: 28, textAlign: 'right', fontWeight: 700, color: 'var(--color-text)', fontSize: 12 }}>{f.value}</span>
                    <span style={{ width: 38, textAlign: 'right', color: 'var(--color-muted)', fontSize: 11 }}>{pct}%</span>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Weekly Area Chart */}
        <motion.div className="card" {...fade(4)}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 16, color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16 }}>📊</span> Applications per Week
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={weekly} margin={{ top: 4, right: 4, bottom: 0, left: -24 }}>
              <defs>
                <linearGradient id="weeklyFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-accent)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--color-accent)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="week" tick={{ fontSize: 9, fill: 'var(--color-muted)' }} />
              <YAxis tick={{ fontSize: 9, fill: 'var(--color-muted)' }} allowDecimals={false} />
              <Tooltip {...chartTip} />
              <Area
                type="monotone" dataKey="count"
                stroke="var(--color-accent)" strokeWidth={2}
                fill="url(#weeklyFill)" dot={false}
                activeDot={{ r: 5, fill: 'var(--color-accent)', stroke: 'var(--color-surface)', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Source Effectiveness */}
        <motion.div className="card" {...fade(5)}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 16, color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16 }}>🎯</span> Source Effectiveness
          </div>
          {sourceData.length === 0 ? (
            <div className="empty-state" style={{ padding: '24px 0' }}>No source data yet</div>
          ) : (
            <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Source','Total','Interviews','Rate'].map((h) => (
                    <th key={h} style={{ textAlign: h === 'Source' ? 'left' : 'right', padding: '4px 8px', color: 'var(--color-muted)', fontWeight: 600, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--color-border)' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sourceData.map((s, i) => (
                  <motion.tr
                    key={s.source}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.05 }}
                    style={{ borderBottom: '1px solid var(--color-border)' }}
                  >
                    <td style={{ padding: '8px 8px', color: 'var(--color-text)', fontWeight: 500 }}>{s.source}</td>
                    <td style={{ padding: '8px 8px', textAlign: 'right', color: 'var(--color-text-dim)' }}>{s.total}</td>
                    <td style={{ padding: '8px 8px', textAlign: 'right', color: 'var(--color-text-dim)' }}>{s.interviewed}</td>
                    <td style={{ padding: '8px 8px', textAlign: 'right' }}>
                      {s.rate === null ? (
                        <span style={{ color: 'var(--color-muted)', fontSize: 10 }}>—</span>
                      ) : (
                        <span style={{
                          color: s.rate >= 30 ? '#10b981' : s.rate >= 15 ? '#f59e0b' : '#ef4444',
                          fontWeight: 700,
                          textShadow: s.rate >= 30 ? '0 0 8px #10b98144' : s.rate >= 15 ? '0 0 8px #f59e0b44' : '0 0 8px #ef444444',
                        }}>
                          {s.rate}%
                        </span>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </motion.div>

        {/* Salary Distribution */}
        <motion.div className="card" {...fade(6)}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 16, color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16 }}>💰</span> Salary Distribution (USD)
          </div>
          {salaryData.every((d) => d.count === 0) ? (
            <div className="empty-state" style={{ padding: '24px 0' }}>No salary data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={salaryData} margin={{ top: 4, right: 4, bottom: 4, left: -20 }}>
                <defs>
                  {['#7c3aed','#2563eb','#0ea5e9','#10b981','#f59e0b'].map((c, i) => (
                    <linearGradient key={i} id={`salaryBar${i}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={c} stopOpacity={0.9} />
                      <stop offset="100%" stopColor={c} stopOpacity={0.4} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="range" tick={{ fontSize: 10, fill: 'var(--color-muted)' }} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--color-muted)' }} allowDecimals={false} />
                <Tooltip {...chartTip} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {salaryData.map((_d, i) => (
                    <Cell key={i} fill={`url(#salaryBar${i % 5})`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>

      </div>
    </div>
  );
}
