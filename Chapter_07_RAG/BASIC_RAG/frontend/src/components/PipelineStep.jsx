import { AnimatePresence, motion } from "framer-motion";

function Checkmark() {
  return (
    <motion.svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <motion.path
        d="M3.5 8.5L6.5 11.5L12.5 4.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      />
    </motion.svg>
  );
}

export default function PipelineStep({
  number,
  title,
  description,
  status,
  done,
  children,
  isLast,
  accent,
  Icon,
}) {
  const style = { "--stage-color": accent };

  return (
    <motion.div
      className="step-col"
      style={style}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: (number - 1) * 0.1, ease: "easeOut" }}
    >
      <div className="step-rail-h">
        <motion.div
          className={`step-dot${done ? " step-dot--done" : ""}`}
          animate={{ scale: done ? [1, 1.2, 1] : 1 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          <AnimatePresence mode="wait" initial={false}>
            {done ? (
              <motion.span
                key="check"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.2 }}
              >
                <Checkmark />
              </motion.span>
            ) : (
              <motion.span
                key="num"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.2 }}
              >
                {number}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>
        {!isLast && (
          <div className="step-line-h">
            <motion.div
              className="step-line-h__fill"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: done ? 1 : 0 }}
              style={{ transformOrigin: "left" }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        )}
      </div>

      <section className="step-card">
        <div className="step-header">
          {Icon && (
            <div className="step-icon" aria-hidden="true">
              <Icon width={17} height={17} />
            </div>
          )}
          <div className="step-heading">
            <h2>{title}</h2>
            <p>{description}</p>
          </div>
          <AnimatePresence mode="wait">
            {status && (
              <motion.div
                key={status.label}
                className={`badge badge--${status.tone}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                <span className={`badge-dot${status.tone === "good" ? " badge-dot--pulse" : ""}`} />
                {status.label}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="step-body">{children}</div>
      </section>
    </motion.div>
  );
}
