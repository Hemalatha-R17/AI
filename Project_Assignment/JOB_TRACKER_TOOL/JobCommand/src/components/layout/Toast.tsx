import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { useStore, useToasts } from '../../store/useStore';

export function ToastStack() {
  const toasts   = useToasts();
  const remove   = useStore((s) => s.removeToast);

  return (
    <div className="toast-stack">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0,  scale: 1 }}
            exit={{   opacity: 0, y: 10,  scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`toast toast-${t.type}`}
          >
            {t.type === 'success' && <CheckCircle size={15} style={{ color: 'var(--color-success)', flexShrink: 0 }} />}
            {t.type === 'error'   && <AlertCircle size={15} style={{ color: 'var(--color-danger)',  flexShrink: 0 }} />}
            {t.type === 'info'    && <Info         size={15} style={{ color: 'var(--color-accent)',  flexShrink: 0 }} />}
            <span style={{ flex: 1, color: 'var(--color-text)', fontSize: 13 }}>{t.message}</span>
            <button className="btn-icon" onClick={() => remove(t.id)} style={{ padding: 2 }}>
              <X size={13} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
