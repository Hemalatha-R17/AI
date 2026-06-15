import { motion } from 'framer-motion';
import { useMemo, useState, useEffect } from 'react';
import {
  Briefcase, BookmarkCheck, SendHorizontal, PhoneCall,
  TrendingUp, Gift, XCircle, Clock, Activity, AlertTriangle,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { useJobs, useProfile } from '../store/useStore';
import { isOverdue, formatDate } from '../lib/format';
import { STATUSES, STATUS_COLORS } from '../lib/constants';

/* ── Animated counter ──────────────────────────────────── */
function useCounter(target: number, duration = 900) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (target === 0) { setV(0); return; }
    const t0 = Date.now();
    const id = setInterval(() => {
      const p = Math.min((Date.now() - t0) / duration, 1);
      setV(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p >= 1) clearInterval(id);
    }, 16);
    return () => clearInterval(id);
  }, [target]);
  return v;
}

/* ── SVG circular ring progress ────────────────────────── */
function Ring({ pct, color, size = 96, stroke = 7 }: {
  pct: number; color: string; size?: number; stroke?: number;
}) {
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const off = circ - (Math.min(pct, 100) / 100) * circ;
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', position: 'absolute', top: 0, left: 0 }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: off }}
          transition={{ duration: 1.4, ease: 'easeOut', delay: 0.3 }}
          style={{ filter: `drop-shadow(0 0 8px ${color}90)` }}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-text)', lineHeight: 1 }}>{Math.min(pct, 100)}%</div>
        <div style={{ fontSize: 9, color: 'var(--color-muted)', marginTop: 3, letterSpacing: '0.06em', textTransform: 'uppercase' }}>GOAL</div>
      </div>
    </div>
  );
}

/* ── Stat card ──────────────────────────────────────────── */
function SCard({ label, val, suf = '', icon: I, color, delay }: {
  label: string; val: number; suf?: string; icon: React.ElementType; color: string; delay: number;
}) {
  const n = useCounter(val);
  return (
    <motion.div
      initial={{ opacity: 0, y: 22, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, type: 'spring', stiffness: 200, damping: 22 }}
      whileHover={{
        y: -5,
        boxShadow: `0 16px 44px ${color}28, 0 0 0 1px ${color}55`,
        borderColor: `${color}66`,
        transition: { duration: 0.18 },
      }}
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius)',
        padding: '18px 16px 16px',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'default',
      }}
    >
      {/* Glowing top accent bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, transparent 0%, ${color} 50%, transparent 100%)`,
        boxShadow: `0 0 18px ${color}`,
      }} />
      {/* Corner glow orb */}
      <div style={{
        position: 'absolute', top: -28, right: -28, width: 96, height: 96,
        borderRadius: '50%', background: color, opacity: 0.055, filter: 'blur(24px)',
        pointerEvents: 'none',
      }} />
      {/* Label + icon row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {label}
        </span>
        <div style={{
          width: 30, height: 30, borderRadius: 8,
          background: `${color}18`, border: `1px solid ${color}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 0 12px ${color}22`,
        }}>
          <I size={14} style={{ color }} />
        </div>
      </div>
      {/* Animated value */}
      <div style={{ fontSize: 34, fontWeight: 800, color: 'var(--color-text)', lineHeight: 1, letterSpacing: '-0.03em' }}>
        {n}{suf}
      </div>
    </motion.div>
  );
}

/* ── Dashboard ──────────────────────────────────────────── */
export function Dashboard() {
  const jobs    = useJobs();
  const profile = useProfile();

  const stats = useMemo(() => {
    const total        = jobs.length;
    const saved        = jobs.filter((j) => j.status === 'Saved').length;
    const submitted    = jobs.filter((j) => j.status === 'Submitted').length;
    const interviews   = jobs.filter((j) => ['Phone Screen', 'Interview'].includes(j.status)).length;
    const offers       = jobs.filter((j) => j.status === 'Offer').length;
    const rejected     = jobs.filter((j) => j.status === 'Rejected').length;
    const followupsDue = jobs.filter((j) => j.followUpDate && isOverdue(j.followUpDate)).length;
    const active       = jobs.filter((j) => ['Submitted', 'Phone Screen', 'Interview', 'Offer'].includes(j.status)).length;
    const iRate        = submitted ? Math.round((interviews / submitted) * 100) : 0;
    return { total, saved, submitted, interviews, offers, rejected, followupsDue, active, iRate };
  }, [jobs]);

  const CARDS = [
    { label: 'Total',          val: stats.total,        suf: '',  icon: Briefcase,      color: '#6366f1' },
    { label: 'Saved',          val: stats.saved,        suf: '',  icon: BookmarkCheck,  color: '#475569' },
    { label: 'Submitted',      val: stats.submitted,    suf: '',  icon: SendHorizontal, color: '#38bdf8' },
    { label: 'Interviews',     val: stats.interviews,   suf: '',  icon: PhoneCall,      color: '#818cf8' },
    { label: 'Interview Rate', val: stats.iRate,        suf: '%', icon: TrendingUp,     color: '#fbbf24' },
    { label: 'Offers',         val: stats.offers,       suf: '',  icon: Gift,           color: '#10d9a0' },
    { label: 'Rejected',       val: stats.rejected,     suf: '',  icon: XCircle,        color: '#fb7185' },
    { label: 'Follow-ups Due', val: stats.followupsDue, suf: '',  icon: Clock,          color: '#fb923c' },
    { label: 'Active Pipeline',val: stats.active,       suf: '',  icon: Activity,       color: '#06b6d4' },
  ];

  /* Weekly area chart data */
  const weeklyData = useMemo(() => {
    const weeks: Record<string, number> = {};
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i * 7);
      weeks[`W${d.getMonth() + 1}/${d.getDate()}`] = 0;
    }
    for (const j of jobs) {
      if (!j.appliedDate) continue;
      const diff = Math.floor((Date.now() - new Date(j.appliedDate).getTime()) / 86400000);
      if (diff < 84) {
        const wk = Math.floor(diff / 7);
        const d2 = new Date(now);
        d2.setDate(d2.getDate() - wk * 7);
        const key = `W${d2.getMonth() + 1}/${d2.getDate()}`;
        weeks[key] = (weeks[key] || 0) + 1;
      }
    }
    return Object.entries(weeks).map(([week, count]) => ({ week, count }));
  }, [jobs]);

  /* Pipeline distribution */
  const pipelineData = STATUSES.map((s) => ({
    status: s,
    count: jobs.filter((j) => j.status === s).length,
    color: STATUS_COLORS[s],
  })).filter((d) => d.count > 0);

  /* Monthly goal */
  const thisMonth = useMemo(() => {
    const now = new Date();
    return jobs.filter((j) => {
      if (!j.appliedDate) return false;
      const d = new Date(j.appliedDate);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
  }, [jobs]);
  const goalTarget = profile.monthlyGoal || 10;
  const goalPct    = Math.min(100, Math.round((thisMonth / goalTarget) * 100));

  /* Activity log */
  const auditLog = useMemo(() => {
    const entries: { company: string; role: string; status: string; at: string }[] = [];
    for (const j of jobs) {
      for (const h of j.history || []) {
        entries.push({ company: j.company, role: j.role, status: h.status, at: h.at });
      }
    }
    return entries.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()).slice(0, 10);
  }, [jobs]);

  const overdueFU = jobs.filter((j) => j.followUpDate && isOverdue(j.followUpDate));

  const cardAccent = (color: string) => (
    <div style={{ width: 3, height: 14, borderRadius: 2, background: color, boxShadow: `0 0 8px ${color}`, flexShrink: 0 }} />
  );

  return (
    <div style={{ padding: 24, overflowY: 'auto', flex: 1 }}>

      {/* ── Stat cards ─────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(162px, 1fr))', gap: 12, marginBottom: 28 }}>
        {CARDS.map((c, i) => <SCard key={c.label} {...c} delay={i * 0.045} />)}
      </div>

      {/* ── Main grid ──────────────────────────────────── */}
      <div className="dashboard-main-grid">

        {/* LEFT column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Area chart */}
          <motion.div
            className="card"
            initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.42 }}
          >
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
              {cardAccent('var(--color-accent)')} Applications per Week
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={weeklyData} margin={{ top: 4, right: 4, bottom: 0, left: -24 }}>
                <defs>
                  <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-accent)" stopOpacity={0.32} />
                    <stop offset="100%" stopColor="var(--color-accent)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="week" tick={{ fontSize: 10, fill: 'var(--color-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--color-muted)' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.45)' }}
                  cursor={{ stroke: 'var(--color-accent)', strokeWidth: 1, strokeDasharray: '4 2' }}
                />
                <Area
                  type="monotone" dataKey="count"
                  stroke="var(--color-accent)" strokeWidth={2}
                  fill="url(#areaFill)" dot={false}
                  activeDot={{ r: 5, fill: 'var(--color-accent)', stroke: 'var(--color-surface)', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Pipeline distribution */}
          <motion.div
            className="card"
            initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.52 }}
          >
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
              {cardAccent('#06b6d4')} Pipeline Distribution
            </div>
            {pipelineData.length === 0 ? (
              <div className="empty-state" style={{ padding: '24px 0' }}>No applications yet</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                {pipelineData.map((d, i) => (
                  <motion.div
                    key={d.status}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.58 + i * 0.05 }}
                    style={{ display: 'flex', alignItems: 'center', gap: 10 }}
                  >
                    <span style={{ width: 110, fontSize: 11, color: 'var(--color-text-dim)', flexShrink: 0 }}>{d.status}</span>
                    <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', borderRadius: 6, height: 10, overflow: 'hidden' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.round((d.count / jobs.length) * 100)}%` }}
                        transition={{ duration: 0.85, delay: 0.62 + i * 0.05, ease: 'easeOut' }}
                        style={{ height: '100%', borderRadius: 6, background: d.color, boxShadow: `0 0 10px ${d.color}80` }}
                      />
                    </div>
                    <span style={{ width: 22, textAlign: 'right', color: 'var(--color-text)', fontWeight: 700, fontSize: 11 }}>{d.count}</span>
                    <span style={{ width: 34, textAlign: 'right', color: 'var(--color-muted)', fontSize: 10 }}>
                      {Math.round((d.count / jobs.length) * 100)}%
                    </span>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* RIGHT column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Monthly goal */}
          <motion.div
            className="card"
            initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.48 }}
          >
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
              {cardAccent('#10d9a0')} Monthly Goal — {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <Ring pct={goalPct} color={goalPct >= 100 ? '#10d9a0' : 'var(--color-accent)'} size={96} stroke={7} />
              <div>
                <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--color-text)', lineHeight: 1, letterSpacing: '-0.02em' }}>
                  {thisMonth}
                  <span style={{ fontSize: 18, color: 'var(--color-muted)', fontWeight: 500 }}>/{goalTarget}</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--color-muted)', marginTop: 6 }}>applied this month</div>
                <div style={{ fontSize: 11, marginTop: 6, fontWeight: 600, color: goalPct >= 100 ? '#10d9a0' : 'var(--color-text-dim)' }}>
                  {goalPct >= 100 ? '🎉 Goal crushed!' : `${goalTarget - thisMonth} more to hit target`}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Timeline activity */}
          <motion.div
            className="card"
            initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.58 }}
            style={{ flex: 1 }}
          >
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
              {cardAccent('#818cf8')} Recent Activity
            </div>
            {auditLog.length === 0 ? (
              <div className="empty-state" style={{ padding: '16px 0' }}>No activity yet</div>
            ) : (
              <div style={{ position: 'relative' }}>
                {/* Vertical timeline line */}
                <div style={{ position: 'absolute', left: 7, top: 6, bottom: 6, width: 1, background: 'linear-gradient(to bottom, var(--color-border), transparent)' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
                  {auditLog.map((e, i) => {
                    const dot = STATUS_COLORS[e.status as keyof typeof STATUS_COLORS] || 'var(--color-accent)';
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: 12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.62 + i * 0.04 }}
                        style={{ display: 'flex', paddingLeft: 22, position: 'relative', gap: 8 }}
                      >
                        <div style={{
                          position: 'absolute', left: 3, top: 5,
                          width: 9, height: 9, borderRadius: '50%',
                          background: dot, boxShadow: `0 0 7px ${dot}`,
                          border: '2px solid var(--color-surface)',
                        }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-text)', lineHeight: 1.3 }}>
                            {e.company}
                            <span style={{ color: dot, marginLeft: 6, fontWeight: 700 }}>→ {e.status}</span>
                          </div>
                          <div style={{ fontSize: 10, color: 'var(--color-muted)', marginTop: 2 }}>
                            {e.role} · {formatDate(e.at.split('T')[0])}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>

          {/* Follow-ups */}
          <motion.div
            className="card"
            initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.68 }}
            style={overdueFU.length > 0 ? { borderColor: 'rgba(251,113,133,0.38)', background: 'rgba(251,113,133,0.04)' } : {}}
          >
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              {overdueFU.length > 0
                ? <AlertTriangle size={14} style={{ color: '#fb7185' }} />
                : cardAccent('#10d9a0')
              }
              <span style={{ color: overdueFU.length > 0 ? '#fb7185' : 'var(--color-text)' }}>
                Follow-ups Due {overdueFU.length > 0 && `(${overdueFU.length})`}
              </span>
            </div>
            {overdueFU.length === 0 ? (
              <div style={{ fontSize: 12, color: '#10d9a0', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 14 }}>✓</span> All clear — no overdue follow-ups
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {overdueFU.slice(0, 5).map((j) => (
                  <div key={j.id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    fontSize: 12, padding: '7px 10px',
                    background: 'rgba(251,113,133,0.07)',
                    borderRadius: 6, border: '1px solid rgba(251,113,133,0.18)',
                  }}>
                    <span style={{ fontWeight: 500, color: 'var(--color-text)' }}>{j.company}</span>
                    <span className="overdue" style={{ fontSize: 10 }}>{formatDate(j.followUpDate)}</span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

        </div>
      </div>
    </div>
  );
}
