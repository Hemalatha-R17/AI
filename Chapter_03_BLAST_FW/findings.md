# Findings — Jira Test Plan Generator

## Jira REST API v3

- **Endpoint:** `{baseUrl}/rest/api/3/issue/{issueId}`
- **Auth:** Basic Auth — `Authorization: Basic base64(email:token)`
- **Base URL:** `https://hemalathar212.atlassian.net` (strip `/browse/...`)
- **CORS:** Atlassian Cloud supports CORS for browser REST API calls with Basic Auth
- **Description format:** ADF (Atlassian Document Format) — JSON tree, needs custom recursive parser
- **Key fields:** `fields.summary`, `fields.description`, `fields.issuetype`, `fields.priority`, `fields.status`

## GROQ API

- **Endpoint:** `https://api.groq.com/openai/v1/chat/completions`
- **Auth:** `Authorization: Bearer {groqApiKey}`
- **Model:** `openai/gpt-oss-120b` (free tier, user-confirmed)
- **CORS:** Supported — GROQ explicitly allows browser-side calls
- **Format:** Identical to OpenAI Chat Completions API

## ADF Parser

- Description returns as `{ "type": "doc", "content": [...] }` — must recursively walk nodes
- Node types handled: `doc`, `paragraph`, `text`, `heading`, `bulletList`, `orderedList`,
  `listItem`, `codeBlock`, `blockquote`, `table`, `tableRow`, `tableHeader`, `tableCell`, `hardBreak`, `rule`

## Constraints

1. Jira base URL must NOT end with trailing slash or include `/browse/...`
2. GROQ `max_tokens: 4096` gives enough room for a full test plan
3. `temperature: 0.2` keeps the plan deterministic and professional
4. `remark-gfm` plugin required for react-markdown to render GFM tables
5. localStorage is sufficient for config in this local-only tool

## RICE-POT Prompt Design

| Letter | Applied As |
|--------|------------|
| R | Senior QA Engineer, 15 years experience |
| I | Generate plan from ticket only; mark inferences; no invented features |
| C | Jira ticket fields (key, type, priority, summary, description) |
| E | Exact section format with markdown headers and table schema |
| P | Anti-hallucination: every assertion traceable to ticket; "TBD" if unknown |
| O | Markdown with 7 defined sections, min 5 test cases in GFM table |
| T | Technical, professional, output-only |
