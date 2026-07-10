import { AnimatePresence, motion } from "framer-motion";

export default function ProcessingLog({ messages }) {
  if (!messages || messages.length === 0) return null;

  return (
    <div className="process-log">
      <AnimatePresence>
        {messages.map((line, i) => (
          <motion.div
            key={`${i}-${line}`}
            className="process-log__line"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25 }}
          >
            <span className="process-log__dot" />
            {line}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
