import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import SimilarityChart from "./SimilarityChart";
import SkeletonChunks from "./SkeletonChunks";

const PREVIEW_LENGTH = 150;

function buildChunksText(chunks) {
  return chunks
    .map((c) => `[chunk ${c.rank}] (page ${c.page_number}, similarity ${c.similarity.toFixed(3)})\n${c.text}`)
    .join("\n\n---\n\n");
}

function CopyAllButton({ chunks }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(buildChunksText(chunks));
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable — no-op */
    }
  }

  return (
    <button type="button" className="copy-btn copy-btn--small" onClick={handleCopy}>
      {copied ? "✓ Copied" : "Copy all"}
    </button>
  );
}

function ChunkCard({ chunk, index, highlight }) {
  const [expanded, setExpanded] = useState(false);
  const [flash, setFlash] = useState(false);
  const ref = useRef(null);
  const isLong = chunk.text.length > PREVIEW_LENGTH;
  const preview = isLong ? chunk.text.slice(0, PREVIEW_LENGTH).trimEnd() + "…" : chunk.text;

  useEffect(() => {
    if (highlight && highlight.rank === chunk.rank) {
      ref.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 1600);
      return () => clearTimeout(t);
    }
  }, [highlight, chunk.rank]);

  return (
    <motion.li
      ref={ref}
      id={`chunk-${chunk.rank}`}
      className={`chunk-card${flash ? " chunk-card--flash" : ""}`}
      layout
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, delay: index * 0.1, ease: "easeOut" }}
    >
      <div className="chunk-top">
        <div className="chunk-rank">#{chunk.rank}</div>
        <span className="chunk-page">page {chunk.page_number}</span>
        <div className="meter">
          <motion.div
            className="meter__fill"
            initial={{ width: 0 }}
            animate={{
              width: `${Math.max(0, Math.min(1, chunk.similarity)) * 100}%`,
            }}
            transition={{ duration: 0.6, delay: index * 0.1 + 0.15, ease: "easeOut" }}
          />
        </div>
        <span className="chunk-similarity">{chunk.similarity.toFixed(3)}</span>
      </div>
      <motion.p layout="position" className="chunk-text">
        {expanded ? chunk.text : preview}
      </motion.p>
      {isLong && (
        <button type="button" className="chunk-toggle" onClick={() => setExpanded((e) => !e)}>
          {expanded ? "Show less" : "Show more"}
        </button>
      )}
    </motion.li>
  );
}

export default function RetrievedChunks({ chunks, candidateSimilarities, loading, topK, highlight }) {
  if (loading && (!chunks || chunks.length === 0)) {
    return <SkeletonChunks count={Math.min(topK || 4, 4)} />;
  }

  if (!chunks || chunks.length === 0) {
    return <p className="empty-hint">Ask a question to see the retrieved chunks here.</p>;
  }

  return (
    <div className="chunk-panel">
      <div className="chunk-panel__toolbar">
        <CopyAllButton chunks={chunks} />
      </div>
      <SimilarityChart similarities={candidateSimilarities} usedCount={chunks.length} />
      <ul className="chunk-list">
        <AnimatePresence>
          {chunks.map((chunk, i) => (
            <ChunkCard key={chunk.chunk_id} chunk={chunk} index={i} highlight={highlight} />
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}
