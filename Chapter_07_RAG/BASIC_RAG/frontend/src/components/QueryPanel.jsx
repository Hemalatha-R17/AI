import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import Spinner from "./Spinner";

const FALLBACK_QUESTIONS = [
  "What is this document about?",
  "What are the key requirements described?",
  "Who is the intended audience?",
  "What features or capabilities are covered?",
];

export default function QueryPanel({ onAsk, loading, disabled, topK, history, onSelectHistory, sampleQuestions }) {
  const [question, setQuestion] = useState("");
  const questions = sampleQuestions?.length ? sampleQuestions : FALLBACK_QUESTIONS;

  function submit(e) {
    e?.preventDefault();
    if (question.trim() && !disabled && !loading) onAsk(question.trim());
  }

  function handleKeyDown(e) {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      submit();
    } else if (e.key === "Escape") {
      setQuestion("");
      e.target.blur();
    }
  }

  return (
    <form className="query-panel" onSubmit={submit}>
      <div className="query-row">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            disabled ? "Ingest a document first..." : "Ask a question about the document..."
          }
          disabled={disabled || loading}
        />
        <motion.button
          className="btn btn--primary"
          type="submit"
          disabled={disabled || loading || !question.trim()}
          whileHover={!disabled && !loading ? { scale: 1.03 } : {}}
          whileTap={!disabled && !loading ? { scale: 0.97 } : {}}
        >
          <span className="btn-label">
            {loading && <Spinner />}
            {loading ? "Thinking..." : "Ask"}
          </span>
        </motion.button>
      </div>

      <p className="upload-hint">
        {navigator.platform.includes("Mac") ? "⌘" : "Ctrl"}+Enter to submit &middot; retrieving
        top-{topK} chunks
      </p>

      <div className="sample-questions">
        <AnimatePresence>
          {questions.map((q, i) => (
            <motion.button
              key={q}
              type="button"
              className="chip"
              disabled={disabled || loading}
              onClick={() => setQuestion(q)}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.25 }}
              whileHover={!disabled && !loading ? { scale: 1.05 } : {}}
              whileTap={!disabled && !loading ? { scale: 0.95 } : {}}
            >
              {q}
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      {history.length > 0 && (
        <div className="history-list">
          <span className="history-label">Recent questions</span>
          {history.map((entry, i) => (
            <button
              key={`${entry.question}-${i}`}
              type="button"
              className="history-item"
              onClick={() => onSelectHistory(entry)}
              disabled={loading}
            >
              {entry.question}
            </button>
          ))}
        </div>
      )}
    </form>
  );
}
