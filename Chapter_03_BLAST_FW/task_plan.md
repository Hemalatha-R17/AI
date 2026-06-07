# Task Plan — Jira Test Plan Generator

## Objective
Lightweight React (Vite) SPA that takes a Jira ID, fetches the ticket via REST API,
and generates a complete test plan using GROQ AI — all configured from a Settings UI.

## Blueprint (Approved)

| Decision | Choice |
|----------|--------|
| Frontend | React 18 + Vite 5 |
| Backend | None — direct browser API calls |
| Config store | localStorage (key: `jtpg_config`) |
| Jira auth | Basic Auth — base64(email:token) |
| GROQ model | openai/gpt-oss-120b (free, user-configurable) |
| Prompt method | RICE-POT framework |

## Phases & Checklists

### Protocol 0 — Initialization ✅
- [x] task_plan.md, findings.md, progress.md, LLM.md created
- [x] Discovery Questions answered (objective + .env reviewed)
- [x] Data Schema confirmed in LLM.md
- [x] Blueprint approved

### Phase 1 — Blueprint ✅
- [x] North Star: Jira ID → auto-fetched ticket → AI test plan
- [x] Integration: Jira REST API v3 + GROQ API (openai/gpt-oss-120b)
- [x] Source of Truth: Jira ticket fields (summary, description, ADF)
- [x] Delivery Payload: Markdown test plan rendered in-browser + copyable
- [x] Behavioral Rules: RICE-POT prompt, anti-hallucination, no hardcoded creds

### Phase 2 — Link ✅
- [x] Jira base URL confirmed: https://hemalathar212.atlassian.net
- [x] Jira auth: email + API token (Basic Auth)
- [x] GROQ endpoint: https://api.groq.com/openai/v1/chat/completions
- [x] GROQ key confirmed in .env

### Phase 3 — Architect ✅
- [x] src/utils/adfParser.js — ADF → plain text
- [x] src/utils/jiraApi.js — fetchJiraIssue + extractIssueText
- [x] src/utils/groqApi.js — generateTestPlan (RICE-POT prompt)
- [x] src/components/Header.jsx
- [x] src/components/SettingsModal.jsx
- [x] src/components/TestPlanDisplay.jsx
- [x] src/App.jsx — orchestration + state
- [x] src/App.css — professional Jira-style UI

### Phase 4 — Stylize ✅
- [x] Jira blue color palette (#0052CC, #172B4D)
- [x] Markdown tables, headings, code blocks styled
- [x] Copy to clipboard + Download .md buttons
- [x] Loading steps shown ("Fetching...", "Generating...")

### Phase 5 — Trigger ⬜
- [ ] Run `npm install && npm run dev` to start
- [ ] Enter credentials in Settings UI
- [ ] Test with VWO-48 or SCRUM-6
