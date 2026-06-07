# LLM.md — Project Constitution

> B.L.A.S.T Test Plan Generator · Project Constitution & Data Schema

---

## 1. Data Schemas

### 1.1 Settings (localStorage: `blast-settings`)
```json
{
  "jiraEmail":  "string — Jira account email",
  "jiraToken":  "string — Jira API token (Basic-auth secret)",
  "jiraUrl":    "string — Full Jira base URL or browse URL",
  "groqKey":    "string — GROQ API key (gsk_…)",
  "groqModel":  "string — GROQ model ID"
}
```

### 1.2 Jira Issue (from REST API v3 `/rest/api/3/issue/{key}`)
Key fields consumed by the app:
```
issue.key                          — e.g. SCRUM-6
issue.fields.summary               — issue title
issue.fields.description           — Atlassian Document Format (ADF) object
issue.fields.issuetype.name        — Bug | Story | Task | Epic
issue.fields.priority.name         — Highest | High | Medium | Low | Lowest
issue.fields.status.name           — To Do | In Progress | Done | etc.
issue.fields.reporter.displayName
issue.fields.assignee.displayName
issue.fields.labels[]
issue.fields.components[].name
```

### 1.3 GROQ Request Payload (POST `/api/generate`)
```json
{
  "prompt":   "string — full prompt text",
  "model":    "string — GROQ model ID (defaults to llama-3.3-70b-versatile)",
  "groqKey":  "string | undefined — overrides server .env"
}
```

### 1.4 GROQ Response
```json
{
  "content": "string — generated Markdown",
  "model":   "string — actual model used",
  "usage":   { "prompt_tokens": 0, "completion_tokens": 0 }
}
```

---

## 2. Behavioral Rules

1. **Anti-hallucination** — LLM is instructed to only use data from the provided Jira issue. Inferences are tagged `[INFERENCE]`, assumptions `[ASSUMPTION]`, missing data flagged `⚠️ Insufficient information`.
2. **Model fallback** — Default model `llama-3.3-70b-versatile` (free tier GROQ). User can override in Settings.
3. **Env priority** — User settings (localStorage) override server `.env`. `.env` is the backend fallback.
4. **CORS avoidance** — All external API calls are proxied through `/api/*` on the same-origin Express server.
5. **Temperature** — Fixed at 0.2 for deterministic, professional output.
6. **Max tokens** — 4096 for comprehensive test plans.

---

## 3. Architectural Invariants

- **No build step** — Frontend is plain HTML + CDN React + CDN Tailwind. `npm install` only installs the backend (Express + dotenv).
- **Single server** — `server.js` serves static files AND acts as API proxy. No separate frontend server.
- **Stateless backend** — No database. State lives in browser localStorage.
- **ADF parsing** — Atlassian Document Format is recursively parsed client-side via `extractDesc()`.
- **Sensitive data** — API tokens are never logged server-side. In the UI they are masked by default.

---

## 4. Maintenance Log

| Date | Change | Author |
|------|--------|--------|
| 2026-06-07 | Initial implementation — Jira proxy, GROQ proxy, React frontend with dark/light mode | B.L.A.S.T Agent |
