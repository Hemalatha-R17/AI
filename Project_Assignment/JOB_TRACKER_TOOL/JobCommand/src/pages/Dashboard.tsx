import { motion } from 'framer-motion';
import { useMemo } from 'react';
import {
  Briefcase, BookmarkCheck, SendHorizontal, PhoneCall,
  TrendingUp, Gift, XCircle, Clock, Activity,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useJobs, useProfile } from '../store/useStore';
import { isOverdue, formatDate } from '../lib/format';
import { STATUSES, STATUS_COLORS } from '../lib/constants';

export function Dashboard() {
  const jobs    = useJobs();
  const profile = useProfile();

  const stats = useMemo(() => {
    const total       = jobs.length;
    const saved       = jobs.filter((j) => j.status === 'Saved').length;
    const submitted   = jobs.filter((j) => j.status === 'Submitted').length;
    const interviews  = jobs.filter((j) => ['Phone Screen','Interview'].includes(j.status)).length;
    const offers      = jobs.filter((j) => j.status === 'Offer').length;
    const rejected    = jobs.filter((j) => j.status === 'Rejected').length;
    const accepted    = jobs.filter((j) => j.status === 'Accepted').length;
    const followupsDue = jobs.filter((j) => j.followUpDate && isOverdue(j.followUpDate)).length;
    const active      = jobs.filter((j) => ['Submitted','Phone Screen','Interview','Offer'].includes(j.status)).length;
    const iRate       = submitted ? Math.round((interviews / submitted) * 100) : 0;
    return { total, saved, submitted, interviews, offers, rejected, accepted, followupsDue, active, iRate };
  }, [jobs]);

  const cards = [
    { label: 'Total',         value: stats.total,       icon: Briefcase,        color: '#7c3aed' },
    { label: 'Saved',         value: stats.saved,       icon: BookmarkCheck,    color: '#64748b' },
    { label: 'Submitted',     value: stats.submitted,   icon: SendHorizontal,   color: '#2563eb' },
    { label: 'Interviews',    value: stats.interviews,  icon: PhoneCall,        color: '#a855f7' },
    { label: 'Interview Rate',value: `${stats.iRate}%`, icon: TrendingUp,       color: '#f59e0b' },
    { label: 'Offers',        value: stats.offers,      icon: Gift,             color: '#10b981' },
    { label: 'Rejected',      value: stats.rejected,    icon: XCircle,          color: '#ef4444' },
    { label: 'Follow-ups Due',value: stats.followupsDue,icon: Clock,            color: '#f97316' },
    { label: 'Active Pipeline',value: stats.active,     icon: Activity,         color: '#06b6d4' },
  ];

  // Weekly applications chart
  const weeklyData = useMemo(() => {
    const weeks: Record<string, number> = {};
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i * 7);
      const key = `W${d.getMonth() + 1}/${d.getDate()}`;
      weeks[key] = 0;
    }
    for (const j of jobs) {
      if (!j.appliedDate) continue;
      const d = new Date(j.appliedDate);
      const now2 = new Date();
      const diffDays = Math.floor((now2.getTime() - d.getTime()) / 86400000);
      if (diffDays < 84) {
        const wk = Math.floor(diffDays / 7);
        const d2 = new Date(now2);
        d2.setDate(d2.getDate() - wk * 7);
        const key = `W${d2.getMonth() + 1}/${d2.getDate()}`;
        weeks[key] = (weeks[key] || 0) + 1;
      }
    }
    return Object.entries(weeks).map(([week, count]) => ({ week, count }));
  }, [jobs]);

  // Status pipeline distribution
  const pipelineData = STATUSES.map((s) => ({
    status: s,
    count: jobs.filter((j) => j.status === s).length,
    color: STATUS_COLORS[s],
  })).filter((d) => d.count > 0);

  // Monthly goal
  const thisMonth = useMemo(() => {
    const now = new Date();
    return jobs.filter((j) => {
      if (!j.appliedDate) return false;
      const d = new Date(j.appliedDate);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
  }, [jobs]);
  const goalPct = Math.min(100, Math.round((thisMonth / (profile.monthlyGoal || 10)) * 100));

  // Audit log (last 20 status changes)
  const auditLog = useMemo(() => {
    const entries: { company: string; role: string; status: string; at: string }[] = [];
    for (const j of jobs) {
      for (const h of j.history || []) {
        entries.push({ company: j.company, role: j.role, status: h.status, at: h.at });
      }
    }
    return entries.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()).slice(0, 12);
  }, [jobs]);

  // Overdue follow-ups
  const overdueFU = jobs.filter((j) => j.followUpDate && isOverdue(j.followUpDate));

  return (
    <div style={{ padding: 24, overflowY: 'auto', flex: 1 }}>
      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, marginBottom: 24 }}>
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <motion.div
              key={c.label}
              className="card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              style={{ padding: 0, overflow: 'hidden' }}
            >
              <div className="stat-accent-top" style={{ background: c.color }} />
              <div style={{ padding: '14px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 11, color: 'var(--color-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {c.label}
                  </span>
                  <Icon size={14} style={{ color: c.color, opacity: 0.8 }} />
                </div>
                <motion.div
                  style={{ fontSize: 28, fontWeight: 700, color: 'var(--color-text)' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 + i * 0.04 }}
                >
                  {c.value}
                </motion.div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Two columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20 }}>
        {/* LEFT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Pipeline distribution */}
          <div className="card">
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14, color: 'var(--color-text)' }}>
              Status Pipeline Distribution
            </div>
            {pipelineData.length === 0 ? (
              <div className="empty-state" style={{ padding: '24px 0' }}>No applications yet</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {pipelineData.map((d) => (
                  <div key={d.status} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12 }}>
                    <span style={{ width: 100, color: 'var(--color-text-dim)', flexShrink: 0 }}>{d.status}</span>
                    <div style={{ flex: 1, background: 'var(--color-surface-2)', borderRadius: 4, height: 8 }}>
                      <div style={{
                        height: 8, borderRadius: 4,
                        background: d.color,
                        width: `${Math.round((d.count / jobs.length) * 100)}%`,
                        transition: 'width 0.6s ease',
                      }} />
                    </div>
                    <span style={{ width: 24, textAlign: 'right', color: 'var(--color-text)', fontWeight: 600 }}>
                      {d.count}
                    </span>
                    <span style={{ width: 36, textAlign: 'right', color: 'var(--color-muted)' }}>
                      {Math.round((d.count / jobs.length) * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Weekly chart */}
          <div className="card">
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>Applications per Week</div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={weeklyData} margin={{ top: 4, right: 4, bottom: 4, left: -20 }}>
                <XAxis dataKey="week" tick={{ fontSize: 10, fill: 'var(--color-muted)' }} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--color-muted)' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 6, fontSize: 12 }}
                />
                <Bar dataKey="count" fill="var(--color-accent)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Monthly goal */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>
                Monthly Goal — {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
              </div>
              <span style={{ fontSize: 18, fontWeight: 700, color: goalPct >= 100 ? 'var(--color-success)' : 'var(--color-text)' }}>
                {goalPct >= 100 ? '🎉 ' : ''}{thisMonth} / {profile.monthlyGoal}
              </span>
            </div>
            <div className="progress-track">
              <motion.div
                className="progress-fill"
                initial={{ width: 0 }}
                animate={{ width: `${goalPct}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
            <div style={{ fontSize: 11, color: 'var(--color-muted)', marginTop: 6 }}>
              {goalPct >= 100 ? `You crushed your goal! 🔥` : `${profile.monthlyGoal - thisMonth} more to hit your target`}
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Audit log */}
          <div className="card" style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>Recent Activity</div>
            {auditLog.length === 0 ? (
              <div className="empty-state" style={{ padding: '16px 0' }}>No activity yet</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {auditLog.map((e, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    style={{ display: 'flex', gap: 8, fontSize: 12 }}
                  >
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: STATUS_COLORS[e.status as keyof typeof STATUS_COLORS] || 'var(--color-accent)', flexShrink: 0, marginTop: 4 }} />
                    <div>
                      <div style={{ color: 'var(--color-text)', fontWeight: 500 }}>
                        {e.company} → <span style={{ color: STATUS_COLORS[e.status as keyof typeof STATUS_COLORS] || 'var(--color-accent)' }}>{e.status}</span>
                      </div>
                      <div style={{ color: 'var(--color-muted)', fontSize: 11 }}>
                        {e.role} · {formatDate(e.at.split('T')[0])}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Follow-ups due */}
          <div className="card">
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14, color: overdueFU.length ? 'var(--color-danger)' : 'var(--color-text)' }}>
              Follow-ups Due {overdueFU.length > 0 && `(${overdueFU.length})`}
            </div>
            {overdueFU.length === 0 ? (
              <div style={{ fontSize: 12, color: 'var(--color-muted)' }}>No overdue follow-ups 🎉</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {overdueFU.slice(0, 5).map((j) => (
                  <div key={j.id} style={{ display: 'flex', gap: 8, fontSize: 12, alignItems: 'center' }}>
                    <span style={{ flex: 1, fontWeight: 500, color: 'var(--color-text)' }}>{j.company}</span>
                    <span className="overdue">{formatDate(j.followUpDate)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
