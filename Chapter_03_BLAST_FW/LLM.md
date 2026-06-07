# Project Constitution — Jira Test Plan Generator

## Data Schema (Confirmed)

### Input: Jira Issue (REST API v3)
```json
{
  "id": "string",
  "key": "string (e.g. VWO-48, SCRUM-6)",
  "fields": {
    "summary": "string",
    "description": { "type": "doc", "content": [] },
    "issuetype": { "name": "string" },
    "priority":  { "name": "string" },
    "status":    { "name": "string" },
    "assignee":  { "displayName": "string" },
    "reporter":  { "displayName": "string" }
  }
}
```

### Config (localStorage key: `jtpg_config`)
```json
{
  "jiraEmail":   "hemalathar212@gmail.com",
  "jiraToken":   "<JIRA_API_TOKEN from .env>",
  "jiraBaseUrl": "https://hemalathar212.atlassian.net",
  "groqApiKey":  "<GROQ_KEY from .env>",
  "groqModel":   "openai/gpt-oss-120b"
}
```

### Output: Test Plan (Markdown string)
Sections: Objectives → Scope → Approach → Test Cases → Entry/Exit Criteria → Risks → Environment

---

## Behavioral Rules

1. **Never hardcode credentials** — all config via localStorage UI only
2. **Anti-hallucination (RICE-POT P):** Test plan content must trace to Jira ticket data
3. **Error transparency:** Specific messages for 401 (bad token), 404 (bad ID), CORS
4. **ADF parsing:** Recursively parse Atlassian Document Format to extract plain text
5. **Model is user-configurable** — default `openai/gpt-oss-120b`, editable in Settings

---

## Architectural Invariants (3-Layer)

| Layer | Location | Purpose |
|-------|----------|---------|
| Architecture | `LLM.md`, `task_plan.md` | SOPs, schemas, behavioral rules |
| Navigation   | `src/App.jsx` | Routes data between Jira fetch → GROQ generation |
| Tools        | `src/utils/` | Atomic, testable API functions |

---

## Tool Contracts

| Tool | Input | Output |
|------|-------|--------|
| `jiraApi.fetchJiraIssue(id, config)` | Jira ID string, config object | Jira issue JSON |
| `jiraApi.extractIssueText(issue)` | Jira issue JSON | Flat text object |
| `adfParser.parseADF(node)` | ADF node object or null | Plain text string |
| `groqApi.generateTestPlan(issue, config)` | Jira issue JSON, config object | Markdown string |

---

## Maintenance Log

| Date       | Change | Author |
|------------|--------|--------|
| 2026-06-07 | Constitution initialized (Protocol 0) | Claude Code |
| 2026-06-07 | Schema confirmed, React app built (Phase 1–3) | Claude Code |
