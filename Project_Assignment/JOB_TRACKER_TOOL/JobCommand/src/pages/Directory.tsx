import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronUp, ChevronDown, Pencil, Trash2, Sparkles, Download, Paperclip } from 'lucide-react';
import { useJobs, useStore } from '../store/useStore';
import { STATUSES, PRIORITY_ICONS } from '../lib/constants';
import { formatSalaryRange, isOverdue, formatDate } from '../lib/format';
import type { Job, Status } from '../types';
import { AddEditModal } from '../components/modal/AddEditModal';
import { ConfirmModal } from '../components/modal/ConfirmModal';

export function Directory() {
  const jobs      = useJobs();
  const moveJob   = useStore((s) => s.moveJob);
  const deleteJob = useStore((s) => s.deleteJob);
  const bulkDelete = useStore((s) => s.bulkDelete);
  const bulkMove   = useStore((s) => s.bulkMove);
  const addToast   = useStore((s) => s.addToast);
  const setAI      = useStore((s) => s.setAiPanelOpen);
  const setPrompt  = useStore((s) => s.setAiPanelPrompt);

  const [search,      setSearch]      = useState('');
  const [statusFilter,setStatusFilter]= useState('');
  const [sourceFilter,setSourceFilter]= useState('');
  const [sortCol,     setSortCol]     = useState<keyof Job>('appliedDate');
  const [sortDir,     setSortDir]     = useState<'asc'|'desc'>('desc');
  const [selected,    setSelected]    = useState<Set<string>>(new Set());
  const [editJob,     setEditJob]     = useState<Job | null>(null);
  const [deleteId,    setDeleteId]    = useState<string | null>(null);
  const [confirmBulk, setConfirmBulk] = useState(false);
  const [bulkMoveTarget, setBulkMoveTarget] = useState<Status | ''>('');

  const filtered = useMemo(() => {
    let list = [...jobs];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((j) => j.company.toLowerCase().includes(q) || j.role.toLowerCase().includes(q));
    }
    if (statusFilter) list = list.filter((j) => j.status === statusFilter);
    if (sourceFilter) list = list.filter((j) => j.source === sourceFilter);
    list.sort((a, b) => {
      const av = a[sortCol] as string | number | null ?? '';
      const bv = b[sortCol] as string | number | null ?? '';
      const cmp = typeof av === 'number' && typeof bv === 'number'
        ? av - bv
        : String(av).localeCompare(String(bv));
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return list;
  }, [jobs, search, statusFilter, sourceFilter, sortCol, sortDir]);

  const toggleSort = (col: keyof Job) => {
    if (sortCol === col) setSortDir((d) => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('asc'); }
  };
  const SortIcon = ({ col }: { col: keyof Job }) =>
    sortCol === col
      ? (sortDir === 'asc' ? <ChevronUp size={11} /> : <ChevronDown size={11} />)
      : null;

  const allChecked = filtered.length > 0 && filtered.every((j) => selected.has(j.id));
  const toggleAll  = () => {
    if (allChecked) setSelected(new Set());
    else setSelected(new Set(filtered.map((j) => j.id)));
  };
  const toggle = (id: string) => {
    const s = new Set(selected);
    s.has(id) ? s.delete(id) : s.add(id);
    setSelected(s);
  };

  const clearSel = () => setSelected(new Set());

  const exportCSV = (ids?: string[]) => {
    const list = ids ? jobs.filter((j) => ids.includes(j.id)) : filtered;
    const headers = [
      'Company', 'Role', 'Status', 'Location', 'Salary', 'Source',
      'Applied', 'Follow-up', 'Priority', 'Contact', 'Contact Role',
      'Contact Email', 'Contact Phone', 'Tags', 'Notes',
      'Cover Letter', 'Resume File', 'Resume Uploaded', 'URL',
    ];
    const rows = list.map((j) => [
      j.company, j.role, j.status, j.location,
      formatSalaryRange(j.salaryMin, j.salaryMax, j.currency || 'USD'),
      j.source, j.appliedDate, j.followUpDate, j.priority,
      j.contactName || '', j.contactRole || '',
      j.contactEmail || '', j.contactPhone || '',
      (j.tags || []).join('; '),
      j.notes || '',
      j.coverLetter ? 'Yes' : 'No',
      j.resumeName || '',
      j.resumeUpdatedAt ? new Date(j.resumeUpdatedAt).toLocaleDateString() : '',
      j.url || '',
    ]);
    const esc = (v: unknown) => {
      const s = String(v ?? '');
      return `"${s.replace(/"/g, '""')}"`;
    };
    const csv = [headers, ...rows].map((r) => r.map(esc).join(',')).join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `careerpulse-${new Date().toISOString().split('T')[0]}.csv`; a.click();
    URL.revokeObjectURL(url);
    addToast('CSV exported', 'success');
  };

  const handleBulkMove = async () => {
    if (!bulkMoveTarget) return;
    await bulkMove(Array.from(selected), bulkMoveTarget);
    setBulkMoveTarget('');
    clearSel();
  };

  const aiAction = (job: Job) => {
    setPrompt(`Draft a professional follow-up email for my ${job.role} role at ${job.company}. Keep it concise.`);
    setAI(true);
  };

  // Source chips
  const usedSources = [...new Set(jobs.map((j) => j.source).filter(Boolean))];

  return (
    <div style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column', gap: 12, overflow: 'hidden' }}>
      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 200px', minWidth: 160 }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)' }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search company or role…"
            style={{ paddingLeft: 32 }}
          />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ flex: '0 0 160px' }}>
          <option value="">All Statuses</option>
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)} style={{ flex: '0 0 160px' }}>
          <option value="">All Sources</option>
          {usedSources.map((s) => <option key={s}>{s}</option>)}
        </select>
        <button className="btn btn-ghost" onClick={() => exportCSV()} style={{ padding: '8px 12px' }}>
          <Download size={13} /> Export CSV
        </button>
      </div>

      {/* Source filter chips */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <button className={`filter-chip ${!sourceFilter ? 'active' : ''}`} onClick={() => setSourceFilter('')}>All</button>
        {usedSources.map((s) => (
          <button
            key={s}
            className={`filter-chip ${sourceFilter === s ? 'active' : ''}`}
            onClick={() => setSourceFilter(sourceFilter === s ? '' : s)}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Bulk action bar */}
      <AnimatePresence>
        {selected.size > 0 && (
          <motion.div
            className="bulk-bar"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-accent)' }}>
              📋 {selected.size} selected
            </span>
            <select
              value={bulkMoveTarget}
              onChange={(e) => setBulkMoveTarget(e.target.value as Status)}
              style={{ width: 'auto', padding: '4px 8px', fontSize: 12 }}
            >
              <option value="">Move to…</option>
              {STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
            {bulkMoveTarget && (
              <button className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: 12 }} onClick={handleBulkMove}>
                Apply Move
              </button>
            )}
            <button className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => exportCSV(Array.from(selected))}>
              ↓ Export
            </button>
            <button className="btn btn-danger" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => setConfirmBulk(true)}>
              🗑 Delete
            </button>
            <button className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: 12 }} onClick={clearSel}>
              ✕ Clear
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      <div style={{ flex: 1, overflow: 'auto', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)' }}>
        <table className="tbl">
          <thead style={{ position: 'sticky', top: 0, background: 'var(--color-surface)', zIndex: 10 }}>
            <tr>
              <th style={{ width: 36 }}>
                <input type="checkbox" checked={allChecked} onChange={toggleAll} />
              </th>
              <th onClick={() => toggleSort('company')}>Company <SortIcon col="company" /></th>
              <th onClick={() => toggleSort('role')}>Role <SortIcon col="role" /></th>
              <th onClick={() => toggleSort('status')}>Status <SortIcon col="status" /></th>
              <th>Salary</th>
              <th onClick={() => toggleSort('source')}>Source <SortIcon col="source" /></th>
              <th onClick={() => toggleSort('appliedDate')}>Applied <SortIcon col="appliedDate" /></th>
              <th onClick={() => toggleSort('followUpDate')}>Follow-up <SortIcon col="followUpDate" /></th>
              <th>Priority</th>
              <th>Contact</th>
              <th style={{ width: 72 }}>Resume</th>
              <th style={{ width: 80 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={12}>
                  <div className="empty-state">
                    {search || statusFilter || sourceFilter ? 'No results match your filters' : 'No applications yet — add one!'}
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((j) => {
                const overdue = j.followUpDate && isOverdue(j.followUpDate);
                return (
                  <tr key={j.id}>
                    <td><input type="checkbox" checked={selected.has(j.id)} onChange={() => toggle(j.id)} /></td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--color-text)' }}>{j.company}</div>
                      {j.location && <div style={{ fontSize: 11, color: 'var(--color-muted)' }}>{j.location}</div>}
                    </td>
                    <td>
                      <div style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                           title={j.role}>{j.role}</div>
                    </td>
                    <td>
                      <select
                        value={j.status}
                        onChange={(e) => moveJob(j.id, e.target.value as Status)}
                        className={`pill pill-${j.status.replace(' ', '')}`}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '2px 4px', fontSize: 11, fontWeight: 600 }}
                      >
                        {STATUSES.map((s) => <option key={s}>{s}</option>)}
                      </select>
                    </td>
                    <td style={{ fontSize: 12, whiteSpace: 'nowrap' }}>
                      {(j.salaryMin || j.salaryMax)
                        ? formatSalaryRange(j.salaryMin, j.salaryMax, j.currency || 'USD')
                        : '—'}
                    </td>
                    <td style={{ fontSize: 12 }}>{j.source || '—'}</td>
                    <td style={{ fontSize: 12, whiteSpace: 'nowrap' }}>{j.appliedDate ? formatDate(j.appliedDate) : '—'}</td>
                    <td style={{ fontSize: 12, whiteSpace: 'nowrap' }}>
                      <span className={overdue ? 'overdue' : ''}>
                        {j.followUpDate ? formatDate(j.followUpDate) : '—'}
                      </span>
                    </td>
                    <td style={{ fontSize: 13 }}>{PRIORITY_ICONS[j.priority] || '—'} <span style={{ fontSize: 11 }}>{j.priority}</span></td>
                    <td style={{ fontSize: 12 }}>
                      {j.contactName ? (
                        <div>
                          <div style={{ fontWeight: 500 }}>{j.contactName}</div>
                          <div style={{ color: 'var(--color-muted)', fontSize: 11 }}>{j.contactRole}</div>
                        </div>
                      ) : '—'}
                    </td>
                    <td>
                      {j.resumeName ? (
                        <button
                          className="btn-icon"
                          title={`Download: ${j.resumeName}`}
                          onClick={() => {
                            const a = document.createElement('a');
                            a.href = `data:${j.resumeType};base64,${j.resumeData}`;
                            a.download = j.resumeName;
                            a.click();
                          }}
                          style={{ color: 'var(--color-accent)' }}
                        >
                          <Paperclip size={13} />
                        </button>
                      ) : (
                        <span style={{ fontSize: 11, color: 'var(--color-muted)' }}>—</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 2 }}>
                        <button className="btn-icon" onClick={() => setEditJob(j)} title="Edit"><Pencil size={12} /></button>
                        <button className="btn-icon" onClick={() => aiAction(j)} title="AI actions"><Sparkles size={12} style={{ color: '#a855f7' }} /></button>
                        <button className="btn-icon" onClick={() => setDeleteId(j.id)} title="Delete" style={{ color: 'var(--color-danger)' }}><Trash2 size={12} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {editJob && <AddEditModal job={editJob} onClose={() => setEditJob(null)} />}

      {deleteId && (
        <ConfirmModal
          title="Delete Application"
          message="This will permanently delete this application. This can't be undone."
          confirmLabel="Delete"
          onConfirm={() => { deleteJob(deleteId); setDeleteId(null); }}
          onCancel={() => setDeleteId(null)}
        />
      )}

      {confirmBulk && (
        <ConfirmModal
          title={`Delete ${selected.size} Applications`}
          message={`Delete ${selected.size} applications? This can't be undone.`}
          confirmLabel={`Delete ${selected.size}`}
          onConfirm={() => { bulkDelete(Array.from(selected)); clearSel(); setConfirmBulk(false); }}
          onCancel={() => setConfirmBulk(false)}
        />
      )}
    </div>
  );
}
