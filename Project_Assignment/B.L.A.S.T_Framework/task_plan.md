# task_plan.md — Blueprint

## Project: B.L.A.S.T Test Plan Generator

### North Star
Auto-generate a complete, structured QA test plan from a Jira issue ID using AI (GROQ LLM), and provide an E-Commerce test case generator — all in a single lightweight web app.

### Phases

| Phase | Description | Status |
|-------|-------------|--------|
| B — Blueprint | Define schema, architecture, discovery questions | ✅ Done |
| L — Link | Verify Jira API + GROQ API connectivity | ✅ Done |
| A — Architect | Build 3-layer: server.js (proxy) + public/index.html (React) | ✅ Done |
| S — Stylize | Dark/light mode, responsive UI, animations, Markdown rendering | ✅ Done |
| T — Trigger | `npm start` command, `.env` config, ready to use | ✅ Done |

### Checklist

- [x] Express server with Jira proxy (`GET /api/jira/:issueId`)
- [x] Express server with GROQ proxy (`POST /api/generate`)
- [x] Health endpoint (`GET /api/health`) showing env status
- [x] React frontend served as static files from `/public`
- [x] Dark / Light mode with persistence (localStorage)
- [x] Settings drawer (Jira + GROQ config, override .env)
- [x] Jira issue card with ADF description parsing
- [x] Test Plan Generator tab (fetch → generate B.L.A.S.T plan)
- [x] Test Case Generator tab (10 E-Commerce modules, type/priority selectors)
- [x] Markdown rendering with copy + download buttons
- [x] Token usage display after generation
- [x] Toast notifications for success/error states
- [x] Loading shimmer animations
- [x] Anti-hallucination prompt protocol

### How to run

```bash
cd Project_Assignment/B.L.A.S.T_Framework
npm install
npm start
# → http://localhost:8787
```
