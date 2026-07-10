import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { ChatIcon, CloseIcon, SearchIcon, SparklesIcon, UploadIcon } from "./Icons";

const STAGES = [
  {
    Icon: UploadIcon,
    title: "1. Ingest & chunk",
    body: "Your file (PDF, CSV, TXT, or JSON) is parsed, then split into overlapping text chunks so related context isn't cut off mid-thought.",
  },
  {
    Icon: SparklesIcon,
    title: "2. Embed & store",
    body: "Each chunk is converted into a vector with the Nomic Embed model and saved in a local ChromaDB collection alongside its page number and text.",
  },
  {
    Icon: ChatIcon,
    title: "3. Embed the question",
    body: "Your question is embedded with the same model, landing it in the same vector space as the stored chunks.",
  },
  {
    Icon: SearchIcon,
    title: "4. Retrieve top-k",
    body: "ChromaDB ranks every stored chunk by cosine similarity to the question and returns the closest matches.",
  },
  {
    Icon: ChatIcon,
    title: "5. Generate the answer",
    body: "The question and retrieved chunks are sent to Groq (openai/gpt-oss-120b), which is instructed to answer strictly from that context and cite the chunk numbers it relied on.",
  },
];

export default function InfoModal({ open, onClose }) {
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
            className="modal-card"
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            role="dialog"
            aria-modal="true"
            aria-label="How this works"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-card__header">
              <h2>How this works</h2>
              <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
                <CloseIcon width={16} height={16} />
              </button>
            </div>
            <ol className="modal-stage-list">
              {STAGES.map((s) => (
                <li key={s.title}>
                  <div className="modal-stage__icon" aria-hidden="true">
                    <s.Icon width={18} height={18} />
                  </div>
                  <div>
                    <strong>{s.title}</strong>
                    <p>{s.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
