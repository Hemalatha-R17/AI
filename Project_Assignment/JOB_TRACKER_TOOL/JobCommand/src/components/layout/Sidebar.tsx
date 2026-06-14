import {
  LayoutDashboard, Kanban, Table2, Calendar, BarChart3,
  FileText, BookOpen, Search, PenLine, Settings,
  Sparkles, Palette, ChevronRight, Activity, X,
} from 'lucide-react';
import { useStore, useView } from '../../store/useStore';
import type { View } from '../../types';

const NAV = [
  {
    group: 'MAIN',
    items: [
      { id: 'dashboard' as View, label: 'Dashboard',           icon: LayoutDashboard },
      { id: 'pipeline'  as View, label: 'Pipeline',            icon: Kanban          },
      { id: 'directory' as View, label: 'Directory',           icon: Table2          },
      { id: 'calendars' as View, label: 'Calendars',           icon: Calendar        },
      { id: 'analytics' as View, label: 'Analytics & Funnels', icon: BarChart3       },
    ],
  },
  {
    group: 'CAREER TOOLS',
    items: [
      { id: 'resume'      as View, label: 'Resume Studio',    icon: FileText   },
      { id: 'interview'   as View, label: 'Interview Prep',   icon: BookOpen   },
      { id: 'discovery'   as View, label: 'Job Discovery',    icon: Search     },
      { id: 'coverletter' as View, label: 'Cover Letter Gen', icon: PenLine    },
    ],
  },
  {
    group: 'SETTINGS',
    items: [
      { id: 'settings' as View, label: 'Settings & Backup', icon: Settings },
    ],
  },
];

export function Sidebar() {
  const view          = useView();
  const setView       = useStore((s) => s.setView);
  const openAI        = useStore((s) => s.setAiPanelOpen);
  const openTS        = useStore((s) => s.setThemeStudioOpen);
  const mobileOpen    = useStore((s) => s.mobileSidebarOpen);
  const setMobileOpen = useStore((s) => s.setMobileSidebarOpen);

  const navigateTo = (id: View) => { setView(id); setMobileOpen(false); };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div className="sidebar-backdrop" onClick={() => setMobileOpen(false)} />
      )}

      <aside className={`sidebar${mobileOpen ? ' sidebar-open' : ''}`}>
        {/* Logo row */}
        <div style={{ padding: '8px 8px 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, var(--grad-start), var(--grad-end))',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <Activity size={16} color="#fff" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--color-text)' }}>CareerPulse</div>
            <div style={{ fontSize: 10, color: 'var(--color-muted)' }}>Job Tracker AI</div>
          </div>
          <button className="btn-icon mobile-menu-close" onClick={() => setMobileOpen(false)}>
            <X size={16} />
          </button>
        </div>

        {/* Nav groups */}
        {NAV.map((g) => (
          <div key={g.group} style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--color-muted)', padding: '4px 12px 8px', textTransform: 'uppercase' }}>
              {g.group}
            </div>
            {g.items.map((item) => {
              const Icon = item.icon;
              const isActive = view === item.id;
              return (
                <button
                  key={item.id}
                  className={`nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => navigateTo(item.id)}
                >
                  <Icon size={15} />
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {isActive && <ChevronRight size={12} style={{ opacity: 0.5 }} />}
                </button>
              );
            })}
          </div>
        ))}

        {/* Bottom actions */}
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <button className="nav-item" onClick={() => { openAI(true); setMobileOpen(false); }}>
            <Sparkles size={15} />
            <span>AI Assistant</span>
          </button>
          <button className="nav-item" onClick={() => { openTS(true); setMobileOpen(false); }}>
            <Palette size={15} />
            <span>Theme Studio</span>
          </button>
        </div>
      </aside>
    </>
  );
}
