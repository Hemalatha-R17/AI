import { AnimatePresence, motion } from "framer-motion";
import { CheckCircleIcon, CloseIcon } from "./Icons";

export default function ToastStack({ toasts, onDismiss }) {
  return (
    <div className="toast-stack" aria-live="polite">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            className={`toast toast--${toast.type}`}
            initial={{ opacity: 0, y: 16, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40, transition: { duration: 0.15 } }}
            transition={{ duration: 0.25 }}
          >
            <CheckCircleIcon width={16} height={16} />
            <span>{toast.message}</span>
            <button
              className="toast__close"
              onClick={() => onDismiss(toast.id)}
              aria-label="Dismiss notification"
              type="button"
            >
              <CloseIcon width={12} height={12} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
