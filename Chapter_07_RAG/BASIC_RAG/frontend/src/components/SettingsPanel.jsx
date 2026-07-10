import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { SettingsIcon } from "./Icons";

export default function SettingsPanel({
  chunkSize,
  chunkOverlap,
  topK,
  onChunkSizeChange,
  onChunkOverlapChange,
  onTopKChange,
  disabled,
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    }
    function handleEsc(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  function handleChunkSizeChange(e) {
    const size = Number(e.target.value);
    onChunkSizeChange(size);
    if (chunkOverlap >= size) onChunkOverlapChange(Math.max(0, size - 50));
  }

  return (
    <div className="settings-anchor" ref={rootRef}>
      <button
        className="icon-btn"
        onClick={() => setOpen((o) => !o)}
        type="button"
        aria-label="Pipeline settings"
        title="Pipeline settings"
        aria-expanded={open}
      >
        <SettingsIcon width={17} height={17} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="settings-popover"
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            role="dialog"
            aria-label="Pipeline settings"
          >
            <span className="settings-popover__title">Ingestion</span>
            <label className="slider-field">
              <span>
                Chunk size <b>{chunkSize}</b> chars
              </span>
              <input
                type="range"
                min={200}
                max={1500}
                step={50}
                value={chunkSize}
                onChange={handleChunkSizeChange}
                disabled={disabled}
              />
            </label>
            <label className="slider-field">
              <span>
                Chunk overlap <b>{chunkOverlap}</b> chars
              </span>
              <input
                type="range"
                min={0}
                max={Math.min(400, chunkSize - 50)}
                step={10}
                value={chunkOverlap}
                onChange={(e) => onChunkOverlapChange(Number(e.target.value))}
                disabled={disabled}
              />
            </label>
            <p className="advanced-hint">Applies on the next upload or re-ingest.</p>

            <div className="settings-divider" />

            <span className="settings-popover__title">Retrieval</span>
            <label className="slider-field">
              <span>
                Chunks to retrieve (top-k) <b>{topK}</b>
              </span>
              <input
                type="range"
                min={1}
                max={8}
                step={1}
                value={topK}
                onChange={(e) => onTopKChange(Number(e.target.value))}
              />
            </label>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
