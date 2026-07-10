import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import "./App.css";
import {
  activateDocument,
  deleteDocument,
  getStatus,
  streamIngest,
  streamQuestion,
  uploadFile,
} from "./api";
import AnswerPanel from "./components/AnswerPanel";
import { ChatIcon, InfoIcon, SearchIcon, UploadIcon } from "./components/Icons";
import IngestPanel from "./components/IngestPanel";
import InfoModal from "./components/InfoModal";
import MetricsStrip from "./components/MetricsStrip";
import PipelineStep from "./components/PipelineStep";
import QueryPanel from "./components/QueryPanel";
import RetrievedChunks from "./components/RetrievedChunks";
import SettingsPanel from "./components/SettingsPanel";
import ThemeToggle from "./components/ThemeToggle";
import ToastStack from "./components/ToastStack";
import useTheme from "./useTheme";
import useToasts from "./useToasts";

const DEFAULT_CHUNK_SIZE = 800;
const DEFAULT_CHUNK_OVERLAP = 120;
const DEFAULT_TOP_K = 4;
const MAX_HISTORY = 8;
const HISTORY_KEY = "rag-explorer-history";
const RESULT_KEY = "rag-explorer-last-result";
const METRICS_KEY = "rag-explorer-metrics";
const EMPTY_METRICS = {
  count: 0,
  totalRetrievalMs: 0,
  totalGenerationMs: 0,
  totalSimilarity: 0,
  totalPromptTokens: 0,
  totalCompletionTokens: 0,
};

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function App() {
  const [status, setStatus] = useState(null);
  const [ingestLoading, setIngestLoading] = useState(false);
  const [ingestError, setIngestError] = useState(null);
  const [ingestLog, setIngestLog] = useState([]);
  const [chunkSize, setChunkSize] = useState(DEFAULT_CHUNK_SIZE);
  const [chunkOverlap, setChunkOverlap] = useState(DEFAULT_CHUNK_OVERLAP);

  const [topK, setTopK] = useState(DEFAULT_TOP_K);
  const [queryLoading, setQueryLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [queryError, setQueryError] = useState(null);
  const [result, setResult] = useState(() => readJSON(RESULT_KEY, null));
  const [history, setHistory] = useState(() => readJSON(HISTORY_KEY, []));
  const [highlight, setHighlight] = useState(null);
  const [infoOpen, setInfoOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [metrics, setMetrics] = useState(() => readJSON(METRICS_KEY, EMPTY_METRICS));

  const [revealed, setRevealed] = useState(() => {
    const restored = readJSON(RESULT_KEY, null);
    return { step2: !!restored, step3: !!restored };
  });

  const { theme, cycleTheme } = useTheme();
  const { toasts, pushToast, dismissToast } = useToasts();

  useEffect(() => {
    getStatus().then(setStatus).catch(() => {});
  }, []);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 48);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch {
      /* storage unavailable — no-op */
    }
  }, [history]);

  useEffect(() => {
    try {
      localStorage.setItem(METRICS_KEY, JSON.stringify(metrics));
    } catch {
      /* storage unavailable — no-op */
    }
  }, [metrics]);

  useEffect(() => {
    if (isStreaming) return;
    try {
      if (result) localStorage.setItem(RESULT_KEY, JSON.stringify(result));
      else localStorage.removeItem(RESULT_KEY);
    } catch {
      /* storage unavailable — no-op */
    }
  }, [result, isStreaming]);

  async function handleIngest(file, documentId) {
    setIngestLoading(true);
    setIngestError(null);
    setIngestLog([]);
    try {
      if (file) await uploadFile(file);
      let finalResult = null;
      await streamIngest(chunkSize, chunkOverlap, documentId, (event) => {
        if (event.type === "step") {
          setIngestLog((log) => [...log, event.message]);
        } else if (event.type === "done") {
          finalResult = event;
        }
      });
      const freshStatus = await getStatus();
      setStatus(freshStatus);
      if (finalResult) {
        pushToast(`Ingested ${finalResult.chunk_count} chunks from ${finalResult.source_pdf}`);
      }
    } catch (err) {
      setIngestError(err.message);
    } finally {
      setIngestLoading(false);
    }
  }

  async function handleActivateDocument(documentId) {
    setIngestLoading(true);
    setIngestError(null);
    try {
      const freshStatus = await activateDocument(documentId);
      setStatus(freshStatus);
      setResult(null);
      setRevealed({ step2: false, step3: false });
      setHighlight(null);
      pushToast(`Switched to ${freshStatus.source_pdf}`);
    } catch (err) {
      setIngestError(err.message);
    } finally {
      setIngestLoading(false);
    }
  }

  async function handleDeleteDocument(documentId) {
    setIngestLoading(true);
    setIngestError(null);
    try {
      const freshStatus = await deleteDocument(documentId);
      setStatus(freshStatus);
      setResult(null);
      setRevealed({ step2: false, step3: false });
      setHighlight(null);
      pushToast("Document removed");
    } catch (err) {
      setIngestError(err.message);
    } finally {
      setIngestLoading(false);
    }
  }

  async function handleAsk(question) {
    setQueryLoading(true);
    setQueryError(null);
    setIsStreaming(true);
    setRevealed({ step2: false, step3: false });
    setResult(null);
    setHighlight(null);

    let chunks = [];
    let candidateSimilarities = [];
    let prompt = [];
    let promptTokensEst = 0;
    let answer = "";
    let llmModel = null;
    let retrievalMs = null;
    let generationMs = null;
    let completionTokensEst = 0;

    try {
      await streamQuestion(question, topK, (event) => {
        if (event.type === "retrieved") {
          chunks = event.chunks;
          candidateSimilarities = event.candidate_similarities || [];
          prompt = event.prompt || [];
          promptTokensEst = event.prompt_tokens_est || 0;
          setRevealed({ step2: true, step3: true });
          setResult({ question, retrieved_chunks: chunks, answer: "", llm_model: null });
        } else if (event.type === "token") {
          answer += event.text;
          setResult((r) => (r ? { ...r, answer } : r));
        } else if (event.type === "done") {
          llmModel = event.llm_model;
          retrievalMs = event.retrieval_ms;
          generationMs = event.generation_ms;
          completionTokensEst = event.completion_tokens_est || 0;
        }
      });

      const finalEntry = {
        question,
        retrieved_chunks: chunks,
        candidate_similarities: candidateSimilarities,
        prompt,
        prompt_tokens_est: promptTokensEst,
        answer,
        llm_model: llmModel,
        retrieval_ms: retrievalMs,
        generation_ms: generationMs,
        completion_tokens_est: completionTokensEst,
      };
      setResult(finalEntry);
      setHistory((h) => [finalEntry, ...h].slice(0, MAX_HISTORY));

      const avgSimilarity = chunks.length
        ? chunks.reduce((sum, c) => sum + c.similarity, 0) / chunks.length
        : 0;
      setMetrics((m) => ({
        count: m.count + 1,
        totalRetrievalMs: m.totalRetrievalMs + (retrievalMs || 0),
        totalGenerationMs: m.totalGenerationMs + (generationMs || 0),
        totalSimilarity: m.totalSimilarity + avgSimilarity,
        totalPromptTokens: m.totalPromptTokens + promptTokensEst,
        totalCompletionTokens: m.totalCompletionTokens + completionTokensEst,
      }));
    } catch (err) {
      setQueryError(err.message);
      setResult(null);
      setRevealed({ step2: false, step3: false });
    } finally {
      setQueryLoading(false);
      setIsStreaming(false);
    }
  }

  function handleSelectHistory(entry) {
    setResult(entry);
    setRevealed({ step2: true, step3: true });
    setIsStreaming(false);
    setQueryError(null);
    setHighlight(null);
  }

  function handleCitationClick(rank) {
    setHighlight({ rank, key: Date.now() });
  }

  const ingestStatus = status?.ingested
    ? { tone: "good", label: "ready" }
    : { tone: "neutral", label: "not ingested" };

  const isGroqKeyMissing = queryError?.toLowerCase().includes("groq_api_key");

  return (
    <div className="app">
      <ToastStack toasts={toasts} onDismiss={dismissToast} />

      <motion.header
        className={`app-header${scrolled ? " app-header--compact" : ""}`}
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="app-header__actions">
          <button
            className="icon-btn"
            onClick={() => setInfoOpen(true)}
            type="button"
            aria-label="How this works"
            title="How this works"
          >
            <InfoIcon width={17} height={17} />
          </button>
          <ThemeToggle theme={theme} onCycle={cycleTheme} />
          <SettingsPanel
            chunkSize={chunkSize}
            chunkOverlap={chunkOverlap}
            topK={topK}
            onChunkSizeChange={setChunkSize}
            onChunkOverlapChange={setChunkOverlap}
            onTopKChange={setTopK}
            disabled={ingestLoading}
          />
        </div>
        <h1>RAG Explorer</h1>
      </motion.header>

      <main className="pipeline">
        <PipelineStep
          number={1}
          title="Ingest & Embed"
          description="Upload a PDF, CSV, TXT, or JSON file — it's split into overlapping chunks, embedded with Nomic Embed, and stored in a local ChromaDB collection."
          status={ingestStatus}
          done={!!status?.ingested}
          accent="var(--stage-1)"
          Icon={UploadIcon}
        >
          <IngestPanel
            status={status}
            onIngest={() => handleIngest(null, status?.active_document_id)}
            onUpload={handleIngest}
            onActivate={handleActivateDocument}
            onDelete={handleDeleteDocument}
            loading={ingestLoading}
            error={ingestError}
            chunkSize={chunkSize}
            chunkOverlap={chunkOverlap}
            ingestLog={ingestLog}
          />
        </PipelineStep>

        <PipelineStep
          number={2}
          title="Ask a Question"
          description="Your question is embedded with the same Nomic Embed model and used to search ChromaDB for the closest chunks."
          done={revealed.step2}
          accent="var(--stage-2)"
          Icon={ChatIcon}
        >
          <QueryPanel
            onAsk={handleAsk}
            loading={queryLoading}
            disabled={!status?.ingested}
            topK={topK}
            history={history}
            onSelectHistory={handleSelectHistory}
            sampleQuestions={status?.sample_questions}
          />
          <AnimatePresence>
            {queryError && !isGroqKeyMissing && (
              <motion.p
                className="error-text"
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
              >
                {queryError}
              </motion.p>
            )}
            {isGroqKeyMissing && (
              <motion.div
                className="setup-callout"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <strong>Groq API key missing.</strong>
                <p>
                  Add <code>GROQ_API_KEY=your_key</code> to <code>backend/.env</code>, then
                  restart the backend. Get a free key at{" "}
                  <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer">
                    console.groq.com/keys
                  </a>
                  .
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </PipelineStep>

        <PipelineStep
          number={3}
          title="Retrieved Chunks"
          description={`The top ${topK} most similar chunk${topK === 1 ? "" : "s"} fetched from ChromaDB, ranked by cosine similarity.`}
          done={revealed.step3}
          accent="var(--stage-3)"
          Icon={SearchIcon}
          isLast
        >
          <RetrievedChunks
            chunks={revealed.step3 ? result?.retrieved_chunks : null}
            candidateSimilarities={revealed.step3 ? result?.candidate_similarities : null}
            loading={queryLoading}
            topK={topK}
            highlight={highlight}
          />
        </PipelineStep>
      </main>

      <AnswerPanel result={result} isStreaming={isStreaming} onCitationClick={handleCitationClick} />

      <MetricsStrip metrics={metrics} />

      <InfoModal open={infoOpen} onClose={() => setInfoOpen(false)} />
    </div>
  );
}

export default App;
