import { useState, useCallback } from "react";
import Header from "./components/Header";
import SettingsModal from "./components/SettingsModal";
import TestPlanDisplay from "./components/TestPlanDisplay";
import { fetchJiraIssue } from "./utils/jiraApi";
import { generateTestPlan } from "./utils/groqApi";

const CONFIG_KEY = "jtpg_config";

export default function App() {
  const [showSettings, setShowSettings] = useState(false);
  const [jiraId, setJiraId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [jiraIssue, setJiraIssue] = useState(null);
  const [testPlan, setTestPlan] = useState(null);

  const getConfig = () => JSON.parse(localStorage.getItem(CONFIG_KEY) || "{}");

  const handleGenerate = useCallback(async () => {
    const trimmedId = jiraId.trim().toUpperCase();
    if (!trimmedId) return;

    const config = getConfig();
    if (
      !config.jiraEmail ||
      !config.jiraToken ||
      !config.jiraBaseUrl ||
      !config.groqApiKey
    ) {
      setError(
        "Please configure your Jira and GROQ settings first — click the Settings button above.",
      );
      return;
    }

    setLoading(true);
    setError(null);
    setJiraIssue(null);
    setTestPlan(null);

    try {
      const issue = await fetchJiraIssue(trimmedId, config);
      setJiraIssue(issue);
      const plan = await generateTestPlan(issue, config);
      setTestPlan(plan);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [jiraId]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleGenerate();
  };

  return (
    <div className="app">
      <Header onSettingsClick={() => setShowSettings(true)} />
      {showSettings && (
        <SettingsModal
          configKey={CONFIG_KEY}
          onClose={() => setShowSettings(false)}
        />
      )}
      <main className="main">
        <div className="card input-card">
          <div className="input-card-eyebrow">
            <span className="input-card-chip">AI Powered</span>
          </div>
          <h1 className="input-card-title">Test Plan Generator</h1>
          <p className="input-card-subtitle">
            Enter a Jira Issue ID — we'll fetch the ticket and craft a complete
            QA test plan in seconds.
          </p>
          <div className="input-row">
            <div className="input-wrapper">
              <input
                className="jira-input"
                type="text"
                placeholder="e.g. SCRUM-6"
                value={jiraId}
                onChange={(e) => setJiraId(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loading}
                autoFocus
              />
              {jiraId.trim() && !loading && (
                <span className="input-hint">Press Enter ↵</span>
              )}
            </div>
            <button
              className="generate-btn"
              onClick={handleGenerate}
              disabled={loading || !jiraId.trim()}
            >
              {loading ? (
                <>
                  <span className="btn-spinner" />
                  Working...
                </>
              ) : (
                <>
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M13 2.05v2.02c3.95.49 7 3.85 7 7.93 0 3.21-1.81 6-4.72 7.72L13 17v5h5l-1.22-1.22C19.91 19.07 22 15.76 22 12c0-5.18-3.95-9.45-9-9.95zM11 2.05C5.95 2.55 2 6.82 2 12c0 3.76 2.09 7.07 5.22 8.78L6 22h5v-5l-2.28 2.28C7.06 18.14 6 15.18 6 12c0-4.08 3.05-7.44 7-7.93V2.05z" />
                  </svg>
                  Generate Test Plan
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="error-box">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
              style={{ flexShrink: 0, marginTop: "2px" }}
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
            </svg>
            <span>
              <strong>Error:</strong> {error}
            </span>
          </div>
        )}

        {(loading || jiraIssue) && (
          <TestPlanDisplay
            jiraIssue={jiraIssue}
            testPlan={testPlan}
            loading={loading}
          />
        )}
      </main>
    </div>
  );
}
