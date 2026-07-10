export default function SkeletonChunks({ count = 3 }) {
  return (
    <ul className="chunk-list" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <li key={i} className="chunk-card chunk-card--skeleton">
          <div className="skeleton-line skeleton-line--meta" />
          <div className="skeleton-line" />
          <div className="skeleton-line" />
          <div className="skeleton-line skeleton-line--short" />
        </li>
      ))}
    </ul>
  );
}
