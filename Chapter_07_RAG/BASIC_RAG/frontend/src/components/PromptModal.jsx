import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { CloseIcon } from "./Icons";

export default function PromptModal({ open, onClose, messages, promptTokensEst, completionTokensEst }) {
  useEffect(() => {
    function handleEsc(e) {
      if (e.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="modal-card modal-card--wide"
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            role="dialog"
            aria-modal="true"
            aria-label="Prompt sent to the LLM"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-card__header">
              <h2>Prompt sent to Groq</h2>
              <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
                <CloseIcon width={16} height={16} />
              </button>
            </div>
            <p className="prompt-modal__hint">
              The exact messages sent to the model for this answer
              {typeof promptTokensEst === "number" && (
                <> &middot; ~{promptTokensEst} prompt tokens, ~{completionTokensEst} answer tokens (estimated)</>
              )}
              .
            </p>
            <div className="prompt-modal__messages">
              {(messages || []).map((m, i) => (
                <div className="prompt-modal__message" key={i}>
                  <span className="prompt-modal__role">{m.role}</span>
                  <pre className="prompt-modal__content">{m.content}</pre>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
