import { AnimatePresence, motion } from "framer-motion";
import { useRef } from "react";
import { CloseIcon } from "./Icons";
import ProcessingLog from "./ProcessingLog";
import Spinner from "./Spinner";
import useCountUp from "../useCountUp";

const EMPTY_STEPS = [
  "Upload a file, or use the bundled sample PDF",
  "It's chunked, embedded, and stored in ChromaDB",
  "Ask a question below to see retrieval + the generated answer",
];

function EmptyHint() {
  return (
    <ol className="empty-ingest-hint">
      {EMPTY_STEPS.map((step, i) => (
        <li key={step}>
          <span className="empty-ingest-hint__num">{i + 1}</span>
          <p>{step}</p>
        </li>
      ))}
    </ol>
  );
}

const tileVariants = {
  hidden: { opacity: 0, y: 10 },
  show: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.3 } }),
};

function StatTile({ index, label, value, animateNumber }) {
  const count = useCountUp(animateNumber ? value : 0);
  return (
    <motion.div
      className="stat-tile"
      custom={index}
      variants={tileVariants}
      initial="hidden"
      animate="show"
    >
      <dt>{label}</dt>
      <dd>{animateNumber ? count : value}</dd>
    </motion.div>
  );
}

function DocumentList({ documents, activeId, onActivate, onDelete, disabled }) {
  if (!documents || documents.length === 0) return null;

  return (
    <div className="doc-list">
      <span className="doc-list__label">
        Ingested document{documents.length === 1 ? "" : "s"} ({documents.length})
      </span>
      <ul>
        {documents.map((doc) => {
          const isActive = doc.id === activeId;
          return (
            <li key={doc.id} className={`doc-item${isActive ? " doc-item--active" : ""}`}>
              <button
                type="button"
                className="doc-item__select"
                onClick={() => onActivate(doc.id)}
                disabled={disabled || isActive}
                title={doc.filename}
              >
                <span className="doc-item__dot" aria-hidden="true" />
                <span className="doc-item__name">{doc.filename}</span>
                <span className="doc-item__count">{doc.chunk_count}</span>
              </button>
              <button
                type="button"
                className="doc-item__remove"
                onClick={() => onDelete(doc.id)}
                disabled={disabled}
                aria-label={`Remove ${doc.filename}`}
                title="Remove"
              >
                <CloseIcon width={12} height={12} />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default function IngestPanel({
  status,
  onIngest,
  onUpload,
  onActivate,
  onDelete,
  loading,
  error,
  chunkSize,
  chunkOverlap,
  ingestLog,
}) {
  const ingested = status?.ingested;
  const fileInputRef = useRef(null);

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) onUpload(file);
  }

  return (
    <div className="ingest-panel">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.csv,.txt,.json"
        onChange={handleFileChange}
        hidden
      />

      <motion.button
        className="btn btn--primary"
        onClick={() => fileInputRef.current?.click()}
        disabled={loading}
        whileHover={!loading ? { scale: 1.03 } : {}}
        whileTap={!loading ? { scale: 0.97 } : {}}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={loading ? "loading" : "upload"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="btn-label"
          >
            {loading && <Spinner />}
            {loading ? "Processing..." : "Upload file"}
          </motion.span>
        </AnimatePresence>
      </motion.button>

      <p className="upload-hint">
        PDF, CSV, TXT, or JSON &middot; chunk size {chunkSize} / overlap {chunkOverlap}
      </p>

      <div className="link-row">
        <button className="link-btn" onClick={onIngest} disabled={loading} type="button">
          {ingested ? "Re-ingest current file" : "Use bundled sample PDF"}
        </button>
      </div>

      <DocumentList
        documents={status?.documents}
        activeId={status?.active_document_id}
        onActivate={onActivate}
        onDelete={onDelete}
        disabled={loading}
      />

      {loading && <ProcessingLog messages={ingestLog} />}

      <AnimatePresence>
        {error && (
          <motion.p
            className="error-text"
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {ingested ? (
          <motion.div
            key="stats"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <dl className="stat-tiles">
              <StatTile index={0} label="Source file" value={status.source_pdf || "—"} />
              <StatTile index={1} label="Chunks stored" value={status.chunk_count} animateNumber />
              <StatTile index={2} label="Embedding model" value={status.embedding_model} />
              <StatTile index={3} label="ChromaDB collection" value={status.collection_name} />
            </dl>
          </motion.div>
        ) : (
          !loading && (
            <motion.div
              key="hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <EmptyHint />
            </motion.div>
          )
        )}
      </AnimatePresence>
    </div>
  );
}
