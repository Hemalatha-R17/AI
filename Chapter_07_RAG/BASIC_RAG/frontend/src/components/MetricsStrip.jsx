import { motion } from "framer-motion";

function formatMs(ms) {
  return ms < 1000 ? `${Math.round(ms)}ms` : `${(ms / 1000).toFixed(1)}s`;
}

function Tile({ label, value }) {
  return (
    <div className="metrics-strip__tile">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

export default function MetricsStrip({ metrics }) {
  if (!metrics || metrics.count === 0) return null;

  const { count, totalRetrievalMs, totalGenerationMs, totalSimilarity, totalPromptTokens, totalCompletionTokens } =
    metrics;

  return (
    <motion.section
      className="metrics-strip"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <span className="metrics-strip__title">Session metrics</span>
      <dl className="metrics-strip__tiles">
        <Tile label="Queries asked" value={count} />
        <Tile label="Avg retrieval" value={formatMs(totalRetrievalMs / count)} />
        <Tile label="Avg generation" value={formatMs(totalGenerationMs / count)} />
        <Tile label="Avg similarity" value={`${((totalSimilarity / count) * 100).toFixed(1)}%`} />
        <Tile label="Avg prompt tokens" value={Math.round(totalPromptTokens / count)} />
        <Tile label="Avg answer tokens" value={Math.round(totalCompletionTokens / count)} />
      </dl>
    </motion.section>
  );
}
