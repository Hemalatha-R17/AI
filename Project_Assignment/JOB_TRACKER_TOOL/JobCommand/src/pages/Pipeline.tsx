import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, Sparkles, Pencil, Trash2 } from 'lucide-react';
import { useJobs, useStore } from '../store/useStore';
import { STATUSES, STATUS_COLORS, PRIORITY_ICONS } from '../lib/constants';
import { formatSalaryRange, isOverdue, formatDate } from '../lib/format';
import type { Status, Job } from '../types';
import { AddEditModal } from '../components/modal/AddEditModal';
import { ConfirmModal } from '../components/modal/ConfirmModal';

function safeHost(url: string) {
  try { return new URL(url).hostname; } catch { return ''; }
}

function KCard({ job, onEdit, onDelete, onAI }: { job: Job; onEdit: () => void; onDelete: () => void; onAI: () => void }) {
  const [hovered, setHovered] = useState(false);
  const pIcon = PRIORITY_ICONS[job.priority] || '⬜';
  const host  = job.url ? safeHost(job.url) : '';
  const overdue = job.followUpDate && isOverdue(job.followUpDate);

  return (
    <motion.div
      className="kcard"
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Company header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
        {host && (
          <img
            src={`https://www.google.com/s2/favicons?domain=${host}&sz=16`}
            width={14} height={14}
            style={{ borderRadius: 2, flexShrink: 0 }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            alt=""
          />
        )}
        <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--color-text)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {job.company}
        </span>
        <span title={job.priority}>{pIcon}</span>
      </div>

      {/* Role */}
      <div style={{ fontSize: 12, color: 'var(--color-text-dim)', marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {job.role}
      </div>

      {/* Tags */}
      {job.tags.length > 0 && (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 6 }}>
          {job.tags.slice(0, 3).map((t) => (
            <span key={t} className="chip" style={{ fontSize: 10 }}>{t}</span>
          ))}
        </div>
      )}

      {/* Salary + location */}
      {(job.salaryMin || job.salaryMax) && (
        <div style={{ fontSize: 11, color: 'var(--color-muted)', marginBottom: 4 }}>
          💰 {formatSalaryRange(job.salaryMin, job.salaryMax, job.currency || 'USD')}
        </div>
      )}
      {job.location && (
        <div style={{ fontSize: 11, color: 'var(--color-muted)', marginBottom: 4 }}>
          📍 {job.location}
        </div>
      )}

      {/* Applied date */}
      {job.appliedDate && (
        <div style={{ fontSize: 11, color: 'var(--color-muted)', marginBottom: 4 }}>
          📅 {formatDate(job.appliedDate)} · {job.source || '—'}
        </div>
      )}

      {/* Interview round */}
      {job.status === 'Interview' && job.interviewRound && (
        <div style={{ display: 'inline-block', fontSize: 10, fontWeight: 700, background: 'rgba(168,85,247,0.15)', color: '#c084fc', borderRadius: 999, padding: '2px 8px', marginBottom: 4 }}>
          🎯 {job.interviewRound}
        </div>
      )}

      {/* Next action */}
      {job.nextAction && (
        <div style={{ fontSize: 11, color: 'var(--color-text-dim)', marginBottom: 4 }}>
          ▶ {job.nextAction}
          {job.followUpDate && (
            <span className={overdue ? 'overdue' : ''} style={{ marginLeft: 4 }}>
              · {formatDate(job.followUpDate)} {overdue ? '⚠' : ''}
            </span>
          )}
        </div>
      )}

      {/* Actions */}
      {hovered && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ display: 'flex', gap: 4, marginTop: 8, justifyContent: 'flex-end' }}
        >
          <button className="btn-icon" onClick={onEdit} title="Edit"><Pencil size={12} /></button>
          <button className="btn-icon" onClick={onAI}   title="AI actions"><Sparkles size={12} style={{ color: '#a855f7' }} /></button>
          <button className="btn-icon" onClick={onDelete} title="Delete" style={{ color: 'var(--color-danger)' }}><Trash2 size={12} /></button>
        </motion.div>
      )}
    </motion.div>
  );
}

export function Pipeline() {
  const jobs    = useJobs();
  const moveJob = useStore((s) => s.moveJob);
  const deleteJob = useStore((s) => s.deleteJob);
  const setAI   = useStore((s) => s.setAiPanelOpen);
  const setPrompt = useStore((s) => s.setAiPanelPrompt);

  const [editJob,    setEditJob]    = useState<Job | null>(null);
  const [deleteId,   setDeleteId]   = useState<string | null>(null);
  const [dragId,     setDragId]     = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<Status | null>(null);
  const [addStatus,  setAddStatus]  = useState<Status | null>(null);

  const handleDragStart = useCallback((id: string) => setDragId(id), []);
  const handleDragOver  = useCallback((e: React.DragEvent, status: Status) => {
    e.preventDefault();
    setDragOverCol(status);
  }, []);
  const handleDrop = useCallback((status: Status) => {
    if (dragId) moveJob(dragId, status);
    setDragId(null);
    setDragOverCol(null);
  }, [dragId, moveJob]);

  const aiAction = (job: Job, type: string) => {
    const prompts: Record<string, string> = {
      followup: `Draft a professional follow-up email for my ${job.role} role at ${job.company}${job.contactName ? `. Contact: ${job.contactName}` : ''}. Keep it concise and polite.`,
      cover:    `Write a compelling cover letter for the ${job.role} position at ${job.company}. Highlight enthusiasm, relevant skills, and cultural fit.`,
      prep:     `Help me prepare for my ${job.role} interview at ${job.company}. Generate 10 likely interview questions with STAR method tips for each.`,
    };
    setPrompt(prompts[type] || '');
    setAI(true);
  };

  return (
    <div style={{ padding: '16px 20px', overflowX: 'auto', flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div className="kboard">
        {STATUSES.map((status) => {
          const colJobs = jobs.filter((j) => j.status === status);
          const isDragTarget = dragOverCol === status;

          return (
            <div
              key={status}
              className={`kcol ${isDragTarget ? 'drag-over' : ''}`}
              onDragOver={(e) => handleDragOver(e, status)}
              onDrop={() => handleDrop(status)}
              onDragLeave={() => setDragOverCol(null)}
            >
              <div className="kcol-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: STATUS_COLORS[status], flexShrink: 0 }} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text)' }}>{status}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 11, background: 'var(--color-surface-2)', padding: '2px 8px', borderRadius: 999, color: 'var(--color-muted)' }}>
                    {colJobs.length}
                  </span>
                  <button className="btn-icon" onClick={() => setAddStatus(status)} title="Add to column">
                    <Plus size={12} />
                  </button>
                </div>
              </div>

              <div className="kcol-body">
                {colJobs.length === 0 ? (
                  <div className="kcol-empty">
                    Drop here or<br />+ Add role
                  </div>
                ) : (
                  colJobs.map((job) => (
                    <div
                      key={job.id}
                      draggable
                      onDragStart={() => handleDragStart(job.id)}
                      onDragEnd={() => { setDragId(null); setDragOverCol(null); }}
                    >
                      <KCard
                        job={job}
                        onEdit={() => setEditJob(job)}
                        onDelete={() => setDeleteId(job.id)}
                        onAI={() => aiAction(job, 'followup')}
                      />
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {editJob && <AddEditModal job={editJob} onClose={() => setEditJob(null)} />}

      {addStatus && (
        <AddEditModal
          job={{ id: '', createdAt: '', company: '', role: '', location: '', status: addStatus, priority: 'Medium', jobType: 'Full-time', currency: 'USD', salaryMin: null, salaryMax: null, tags: [], source: '', appliedDate: '', nextAction: '', followUpDate: '', interviewRound: '', url: '', jdText: '', contactName: '', contactRole: '', contactEmail: '', contactPhone: '', notes: '', history: [], coverLetter: '' }}
          onClose={() => setAddStatus(null)}
        />
      )}

      {deleteId && (
        <ConfirmModal
          title="Delete Application"
          message="This will permanently delete this application. This can't be undone."
          confirmLabel="Delete"
          onConfirm={() => { deleteJob(deleteId); setDeleteId(null); }}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  );
}
