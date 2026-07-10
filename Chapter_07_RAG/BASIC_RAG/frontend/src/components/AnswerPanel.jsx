import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { SparklesIcon } from "./Icons";
import PromptModal from "./PromptModal";

const CITATION_RE = /\[chunk\s+(\d+(?:\s*,\s*\d+)*)\]/gi;
const NOT_FOUND_RE =
  /don't have enough information|do not have enough information|not enough information|no information (about|on|regarding)/i;

function formatMs(ms) {
  if (typeof ms !== "number" || Number.isNaN(ms)) return null;
  return ms < 1000 ? `${Math.round(ms)}ms` : `${(ms / 1000).toFixed(1)}s`;
}

function renderAnswerWithCitations(text, onCiteClick) {
  const nodes = [];
  let lastIndex = 0;
  let match;
  let key = 0;
  CITATION_RE.lastIndex = 0;

  while ((match = CITATION_RE.exec(text)) !== null) {
    if (match.index > lastIndex) nodes.push(text.slice(lastIndex, match.index));
    const numbers = match[1].split(",").map((n) => n.trim());
    nodes.push(
      <span className="citation-group" key={`cite-${key++}`}>
        [
        {numbers.map((n, i) => (
          <span key={n}>
            <button type="button" className="citation-pill" onClick={() => onCiteClick(Number(n))}>
              chunk {n}
            </button>
            {i < numbers.length - 1 ? ", " : ""}
          </span>
        ))}
        ]
      </span>
    );
    lastIndex = CITATION_RE.lastIndex;
  }
  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes;
}

function buildMarkdown(result) {
  const lines = [
    "# RAG Explorer Q&A",
    "",
    `**Question:** ${result.question}`,
    "",
    "**Answer:**",
    "",
    result.answer,
    "",
    `**Model:** ${result.llm_model || "—"}`,
    "",
    "## Retrieved Chunks",
    "",
  ];
  for (const c of result.retrieved_chunks || []) {
    lines.push(`### Chunk ${c.rank} — page ${c.page_number} (similarity ${c.similarity.toFixed(3)})`);
    lines.push("");
    lines.push(c.text);
    lines.push("");
  }
  return lines.join("\n");
}

function downloadFile(filename, content, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable — no-op */
    }
  }

  return (
    <motion.button
      className="copy-btn"
      onClick={handleCopy}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      type="button"
    >
      <AnimatePresence mode="wait" initial={false}>
        {copied ? (
          <motion.span
            key="copied"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.15 }}
          >
            ✓ Copied
          </motion.span>
        ) : (
          <motion.span
            key="copy"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.15 }}
          >
            Copy
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

function ExportButton({ label, onExport }) {
  const [done, setDone] = useState(false);

  function handleClick() {
    onExport();
    setDone(true);
    setTimeout(() => setDone(false), 1600);
  }

  return (
    <motion.button
      type="button"
      className="copy-btn"
      onClick={handleClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <AnimatePresence mode="wait" initial={false}>
        {done ? (
          <motion.span
            key="done"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.15 }}
          >
            ✓ Saved
          </motion.span>
        ) : (
          <motion.span
            key="label"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.15 }}
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

function ExportButtons({ result }) {
  return (
    <div className="export-buttons">
      <ExportButton
        label="Export .md"
        onExport={() => downloadFile("rag-explorer-qa.md", buildMarkdown(result), "text/markdown")}
      />
      <ExportButton
        label="Export .json"
        onExport={() =>
          downloadFile("rag-explorer-qa.json", JSON.stringify(result, null, 2), "application/json")
        }
      />
    </div>
  );
}

export default function AnswerPanel({ result, isStreaming, onCitationClick }) {
  const [promptOpen, setPromptOpen] = useState(false);
  const hasText = result?.answer && result.answer.length > 0;
  const retrievalLabel = formatMs(result?.retrieval_ms);
  const generationLabel = formatMs(result?.generation_ms);
  const showGroundedBadge = !isStreaming && hasText;
  const notFound = showGroundedBadge && NOT_FOUND_RE.test(result.answer);
  const chunkCount = result?.retrieved_chunks?.length || 0;
  const hasPrompt = result?.prompt?.length > 0;

  return (
    <motion.section
      className="answer-hero"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="answer-hero__glow" />
      <div className="answer-hero__header">
        <div className="answer-hero__icon" aria-hidden="true">
          <SparklesIcon width={20} height={20} />
        </div>
        <div>
          <h2>Generated Answer</h2>
          <p>Groq (openai/gpt-oss-120b) synthesizes the final answer, grounded strictly in the chunks retrieved above.</p>
        </div>
        {showGroundedBadge && (
          <span className={`badge badge--${notFound ? "warn" : "good"} answer-hero__badge`}>
            <span className="badge-dot" />
            {notFound ? "Not found in document" : `Grounded in ${chunkCount} chunk${chunkCount === 1 ? "" : "s"}`}
          </span>
        )}
      </div>

      <AnimatePresence mode="wait">
        {result ? (
          <motion.div
            key="answer"
            className="answer-hero__body"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          >
            <p className="answer-text" aria-live="polite">
              {hasText
                ? isStreaming
                  ? result.answer
                  : renderAnswerWithCitations(result.answer, onCitationClick)
                : isStreaming
                ? "Generating answer…"
                : ""}
              {isStreaming && <span className="stream-cursor" aria-hidden="true" />}
            </p>
            {!isStreaming && result.llm_model && (
              <div className="answer-hero__footer">
                <span className="answer-model">
                  generated by {result.llm_model} via Groq
                  {retrievalLabel && generationLabel && (
                    <>
                      {" "}
                      &middot; retrieved in {retrievalLabel} &middot; generated in {generationLabel}
                    </>
                  )}
                </span>
                <div className="answer-hero__actions">
                  {hasPrompt && (
                    <button type="button" className="copy-btn" onClick={() => setPromptOpen(true)}>
                      View prompt
                    </button>
                  )}
                  <ExportButtons result={result} />
                  <CopyButton text={result.answer} />
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.p
            key="empty"
            className="empty-hint"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            The generated answer will appear here after you ask a question.
          </motion.p>
        )}
      </AnimatePresence>

      <PromptModal
        open={promptOpen}
        onClose={() => setPromptOpen(false)}
        messages={result?.prompt}
        promptTokensEst={result?.prompt_tokens_est}
        completionTokensEst={result?.completion_tokens_est}
      />
    </motion.section>
  );
}
