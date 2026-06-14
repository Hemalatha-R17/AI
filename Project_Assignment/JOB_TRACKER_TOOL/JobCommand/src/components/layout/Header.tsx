import { Sparkles, Palette, Plus } from 'lucide-react';
import { useStore, useView } from '../../store/useStore';
import { useState } from 'react';
import { AddEditModal } from '../modal/AddEditModal';

const VIEW_LABELS: Record<string, string> = {
  dashboard:   'Dashboard',
  pipeline:    'Application Pipeline',
  directory:   'Directory Index',
  calendars:   'Calendars',
  analytics:   'Analytics & Funnels',
  resume:      'Resume Studio',
  interview:   'Interview Prep',
  discovery:   'Job Discovery',
  coverletter: 'Cover Letter Gen',
  settings:    'Settings & Backup',
};

export function Header() {
  const view    = useView();
  const openAI  = useStore((s) => s.setAiPanelOpen);
  const openTS  = useStore((s) => s.setThemeStudioOpen);
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <header style={{
        height: 56,
        flexShrink: 0,
        background: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
        gap: 12,
      }}>
        <h1 style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text)', flex: 1 }}>
          {VIEW_LABELS[view] || view}
        </h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            className="btn btn-ghost"
            onClick={() => openAI(true)}
            title="AI Assistant"
            style={{ padding: '6px 10px' }}
          >
            <Sparkles size={14} />
            <span>AI</span>
          </button>
          <button
            className="btn btn-ghost"
            onClick={() => openTS(true)}
            title="Theme Studio"
            style={{ padding: '6px 10px' }}
          >
            <Palette size={14} />
          </button>
          <button
            className="btn btn-primary"
            onClick={() => setShowModal(true)}
          >
            <Plus size={14} />
            Add Application
          </button>
        </div>
      </header>

      {showModal && <AddEditModal onClose={() => setShowModal(false)} />}
    </>
  );
}
