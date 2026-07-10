export default function SimilarityChart({ similarities, usedCount }) {
  if (!similarities || similarities.length <= usedCount) return null;

  const max = Math.max(...similarities);

  return (
    <div className="sim-chart">
      <div className="sim-chart__header">
        <span>Similarity across top {similarities.length} candidates</span>
        <span className="sim-chart__legend">
          <span className="sim-chart__swatch sim-chart__swatch--used" />
          used
          <span className="sim-chart__swatch sim-chart__swatch--rest" />
          not used
        </span>
      </div>
      <div className="sim-chart__bars">
        {similarities.map((s, i) => {
          const rank = i + 1;
          const used = rank <= usedCount;
          const heightPct = Math.max(6, (s / max) * 100);
          return (
            <div key={rank} className="sim-chart__bar-wrap">
              {rank === usedCount + 1 && <div className="sim-chart__cutoff" aria-hidden="true" />}
              <div
                className={`sim-chart__bar${used ? " sim-chart__bar--used" : ""}`}
                style={{ height: `${heightPct}%` }}
                title={`#${rank} · similarity ${s.toFixed(3)}`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
