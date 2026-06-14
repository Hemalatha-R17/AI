import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, LayoutDashboard, Kanban, Search, Settings as SettingsIcon, Plus,
} from 'lucide-react';
import { useStore, useView, useHydrated } from './store/useStore';
import { Landing }       from './pages/Landing';
import { Dashboard }     from './pages/Dashboard';
import { Pipeline }      from './pages/Pipeline';
import { Directory }     from './pages/Directory';
import { Calendars }     from './pages/Calendars';
import { Analytics }     from './pages/Analytics';
import { ResumeStudio }  from './pages/ResumeStudio';
import { InterviewPrep } from './pages/InterviewPrep';
import { JobDiscovery }  from './pages/JobDiscovery';
import { CoverLetter }   from './pages/CoverLetter';
import { Settings }      from './pages/Settings';
import { Sidebar }       from './components/layout/Sidebar';
import { Header }        from './components/layout/Header';
import { ToastStack }    from './components/layout/Toast';
import { AIPanel }       from './components/ai/AIPanel';
import { ThemeStudio }   from './components/theme/ThemeStudio';
import { AddEditModal }  from './components/modal/AddEditModal';
import type { View }     from './types';
import './index.css';

const PAGES: Record<string, React.ComponentType> = {
  dashboard:   Dashboard,
  pipeline:    Pipeline,
  directory:   Directory,
  calendars:   Calendars,
  analytics:   Analytics,
  resume:      ResumeStudio,
  interview:   InterviewPrep,
  discovery:   JobDiscovery,
  coverletter: CoverLetter,
  settings:    Settings,
};

const BOTTOM_NAV = [
  { id: 'dashboard' as View, icon: LayoutDashboard, label: 'Home'     },
  { id: 'pipeline'  as View, icon: Kanban,          label: 'Pipeline' },
  { id: 'discovery' as View, icon: Search,           label: 'Jobs'     },
  { id: 'settings'  as View, icon: SettingsIcon,     label: 'Settings' },
];

function useIsMobile() {
  const [mobile, setMobile] = useState(() => window.innerWidth < 768);
  useEffect(() => {
    const handler = () => setMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler, { passive: true });
    return () => window.removeEventListener('resize', handler);
  }, []);
  return mobile;
}

function BottomNav({ onAdd }: { onAdd: () => void }) {
  const view    = useView();
  const setView = useStore((s) => s.setView);
  return (
    <nav className="bottom-nav">
      {BOTTOM_NAV.slice(0, 2).map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          className={`bottom-nav-btn${view === id ? ' active' : ''}`}
          onClick={() => setView(id)}
        >
          <Icon size={22} />
          <span>{label}</span>
        </button>
      ))}
      <button className="bottom-nav-btn add-btn" onClick={onAdd} aria-label="Add application">
        <Plus size={24} />
      </button>
      {BOTTOM_NAV.slice(2).map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          className={`bottom-nav-btn${view === id ? ' active' : ''}`}
          onClick={() => setView(id)}
        >
          <Icon size={22} />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}

function Skeleton() {
  return (
    <div style={{ flex: 1, padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {[1,2,3,4].map((i) => <div key={i} className="skeleton" style={{ height: 90 }} />)}
      </div>
      {[1,2].map((i) => <div key={i} className="skeleton" style={{ height: 200 }} />)}
    </div>
  );
}

function WelcomeSplash({ name, onDone }: { name: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2200);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 16,
      }}
    >
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.15, type: 'spring', stiffness: 200, damping: 18 }}
        style={{ width: 72, height: 72, borderRadius: 20, background: 'linear-gradient(135deg,#7c3aed,#2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Activity size={36} color="#fff" />
      </motion.div>
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.35 }}
        style={{ textAlign: 'center' }}
      >
        <div style={{ fontSize: 32, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
          Welcome, <span style={{ background: 'linear-gradient(90deg,#a78bfa,#60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{name}</span>!
        </div>
        <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', marginTop: 8 }}>
          Your career dashboard is ready.
        </div>
      </motion.div>
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.5, duration: 1.5, ease: 'linear' }}
        style={{ width: 180, height: 3, background: 'linear-gradient(90deg,#7c3aed,#2563eb)', borderRadius: 999, transformOrigin: 'left', marginTop: 8 }}
      />
    </motion.div>
  );
}

export default function App() {
  const hydrate  = useStore((s) => s.hydrate);
  const hydrated = useHydrated();
  const view     = useView();
  const aiOpen   = useStore((s) => s.aiPanelOpen);
  const isMobile = useIsMobile();

  const [loggedIn,     setLoggedIn]     = useState(false);
  const [welcomeName,  setWelcomeName]  = useState('');
  const [showWelcome,  setShowWelcome]  = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => { hydrate(); }, []);

  const handleLogin = (name: string) => { setWelcomeName(name); setShowWelcome(true); };

  if (!loggedIn && !showWelcome) return <Landing onLogin={handleLogin} />;

  const Page = PAGES[view] || Dashboard;

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--color-bg)', position: 'relative' }}>
      <AnimatePresence>
        {showWelcome && (
          <WelcomeSplash
            name={welcomeName}
            onDone={() => { setShowWelcome(false); setLoggedIn(true); }}
          />
        )}
      </AnimatePresence>

      <Sidebar />

      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          marginRight: aiOpen && !isMobile ? 520 : 0,
          transition: 'margin-right 0.3s cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        <Header />
        <main style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {!hydrated ? <Skeleton /> : (
            <AnimatePresence mode="wait">
              <motion.div
                key={view}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{   opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
                style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
              >
                <Page />
              </motion.div>
            </AnimatePresence>
          )}
        </main>
      </div>

      <AIPanel />
      <ThemeStudio />
      <ToastStack />
      <BottomNav onAdd={() => setShowAddModal(true)} />
      {showAddModal && <AddEditModal onClose={() => setShowAddModal(false)} />}
    </div>
  );
}
