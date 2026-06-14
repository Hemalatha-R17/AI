# B.L.A.S.T. Protocol — Worked Example: Job Application Tracker

> A worked example of the **B.L.A.S.T.** build protocol applied to a real project.
> Reference subject: the **Job Application Tracker** specified in `RICE-POT-JobTracker-Prompt.md`.
>
> Read `B_L_A_S_T.md` for the generic protocol. This file shows what each phase produces
> when the protocol is run against one concrete deliverable: a single-file job tracker web app.

---

## Quick Reference: What B.L.A.S.T. Means

| Letter | Phase     | What this phase produces for the Job Tracker |
|--------|-----------|----------------------------------------------|
| **0**  | Initialize | Project-memory files + `LLM.md` constitution with the data schema |
| **B**  | Blueprint  | The 5 Discovery answers + confirmed JSON schema + research notes |
| **L**  | Link       | Verify the *one* dependency: browser storage (no external APIs here) |
| **A**  | Architect  | 3-layer build — SOPs, navigation/routing, atomic JS tool functions |
| **S**  | Stylize    | Table view, Kanban board, dashboard, responsive + accessible UI |
| **T**  | Trigger    | "Deploy" = open the single file in a browser + maintenance log |

---

## 🟢 Protocol 0: Initialization

Before any code is written:

**Project-memory files created:**
- `task_plan.md` → the five BLAST phases below, each with a checklist.
- `findings.md` → research, browser-storage constraints, sandbox caveats.
- `progress.md` → what was built, what broke, test results per feature.
- `LLM.md` → **Project Constitution** (schema + rules + invariants), seeded below.

**Halt condition (honored):** No script enters `tools/` until the Discovery Questions are
answered, the data schema is locked, and `task_plan.md` has an approved Blueprint.

### `LLM.md` seed — Data Schema (the Source of Truth shape)

A single job application entry:

```json
{
  "id": "uuid-v4-string",
  "company": "Acme Corp",
  "role": "Senior QA Engineer",
  "location": "Remote (US)",
  "salaryRange": "$120k–$140k",
  "source": "LinkedIn",
  "appliedDate": "2026-06-01",
  "status": "Interview",
  "url": "https://acme.com/careers/123",
  "contactName": "Jane Doe (Recruiter)",
  "nextActionDate": "2026-06-15",
  "notes": "Strong culture fit; second round scheduled."
}
```

The full dataset is an array of these objects, persisted as one JSON blob.

### `LLM.md` seed — Behavioral Rules (architectural invariants)

- **Status is an enum**, in pipeline order:
  `Wishlist → Applied → Phone Screen → Interview → Offer → Accepted → Rejected`.
- **Scope guard:** no login, no backend, no external accounts, no API keys, no paid services.
  If a requirement is ambiguous or conflicting, **STOP and ask** — never silently guess.
- **No filler data:** seed at most 2–3 clearly-labeled sample rows the user can delete.
  No lorem ipsum.
- **Deterministic logic only:** computed values (counts, response rate) derive purely
  from the dataset; no probabilistic guessing.

---

## 🏗️ Phase 1: B — Blueprint (Vision & Logic)

### Discovery — the 5 questions, answered for this project

- **North Star:** One single-page tool that lets a job seeker manage every application
  from *saved* to *offer*, so nothing is scattered across email, spreadsheets, and memory.
- **Integrations:** **None.** No Slack/Shopify/etc., no keys required. This is deliberately
  a zero-dependency personal tool.
- **Source of Truth:** The browser itself — `localStorage` holds the JSON dataset so it
  survives reload. *(Sandbox caveat: if `localStorage` is blocked, fall back to in-memory
  session state — see `findings.md`.)*
- **Delivery Payload:** A **single self-contained file** (one `.html` with inline CSS/JS,
  or one React component) the user opens in a browser and uses immediately. No install, no server.
- **Behavioral Rules:** Practical and professional. Honor the scope guard above; every
  interaction (add / edit / delete / drag / filter / search) must work with no errors;
  prioritize a tool that *works and feels good* over decorative extras.

### Data-First Rule (satisfied)

The JSON Input/Output shape is the entry schema locked in `LLM.md` (Protocol 0). Coding
begins only now that the payload shape is confirmed.

### Research

- Confirm `localStorage` get/set/JSON-serialization patterns and quota behavior.
- Drag-and-drop approaches for the Kanban board (native HTML5 DnD vs. pointer events;
  pick whichever keeps the single-file constraint and stays keyboard-accessible).
- Accessible table sorting and labeled-input patterns.
- Reference repos: lightweight single-file kanban / CRUD-table examples for layout cues only —
  no external runtime dependencies pulled in.

---

## 🔗 Phase 2: L — Link (Connectivity)

This project has **no external services**, so "Link" reduces to verifying the one real
dependency — the persistence layer — before building full logic.

- **Verification:** Feature-detect `localStorage` at startup
  (`try { localStorage.setItem('__t','1'); localStorage.removeItem('__t'); }`).
- **Handshake:** A minimal probe in `tools/` writes a dummy entry, reads it back, and
  confirms the round-trip survives a simulated reload.
- **Broken-link rule:** If storage is unavailable (e.g. a sandbox that blocks it), do **not**
  proceed as if persistence works. Degrade gracefully to in-memory session state and surface
  a clear note to the user that data won't survive reload.

---

## ⚙️ Phase 3: A — Architect (The 3-Layer Build)

LLM reasoning is probabilistic; this tool's business logic must be deterministic. Concerns
are split across three layers.

### Layer 1 — Architecture (`architecture/`)

Technical SOPs in Markdown. The Golden Rule applies: **if logic changes, update the SOP
before the code.** SOPs to write:

- `sop_crud.md` — add / edit / delete an entry; validation; id generation.
- `sop_persistence.md` — load on startup, save on every mutation, JSON (de)serialize, fallback.
- `sop_kanban.md` — render columns per status; drag-and-drop moves an entry between columns
  and updates its `status`; keyboard-accessible equivalent.
- `sop_table.md` — sortable columns; stable sort; ascending/descending toggle.
- `sop_search_filter.md` — free-text search (company OR role) combined with status and source filters.
- `sop_dashboard.md` — totals, count-per-status, response rate = interviews ÷ applied.

### Layer 2 — Navigation (Decision Making / Routing)

The reasoning layer routes data between SOPs and Tools rather than doing heavy work itself:

- Switch between **Table view** and **Kanban view** (shared dataset, different render).
- On any mutation, route through the persistence tool, then re-derive the dashboard.
- On search/filter change, route the dataset through the filter tool, then re-render the
  active view.
- Edge cases routed explicitly: empty dataset, deleting the last entry, a drag dropped
  outside any column (no-op), invalid date input.

### Layer 3 — Tools (`tools/`)

Atomic, testable functions — the deterministic core. Each does one thing:

- `addEntry(data)`, `editEntry(id, patch)`, `deleteEntry(id)`
- `loadAll()`, `saveAll(entries)` — wrap the storage handshake from Phase L.
- `setStatus(id, status)` — used by both the table dropdown and Kanban drag.
- `filterEntries(entries, {query, status, source})`
- `sortEntries(entries, key, direction)`
- `computeDashboard(entries)` → `{ total, perStatus, responseRate }`

Intermediate file operations (if any) live in `.tmp/`. There are no secrets, so `.env`
is empty for this project by design.

---

## ✨ Phase 4: S — Stylize (Refinement & UI)

- **Payload refinement:** Present both views cleanly — a sortable **table** and a
  **Kanban board** grouped by the seven pipeline statuses with drag-and-drop between columns.
  A search box plus status/source filters sit above both; a **summary dashboard**
  (total applications, count per status, response rate) sits at the top.
- **UI/UX:** Clean, modern, uncluttered. Responsive so it's usable on mobile and desktop.
  **Accessible:** keyboard-navigable, labeled inputs, sufficient color contrast, a
  keyboard path for every drag action.
- **Feedback:** Seed 2–3 clearly-labeled sample rows (deletable), then present the styled
  result to the user for feedback before "deployment."

---

## 🛰️ Phase 5: T — Trigger (Deployment)

No cloud is required — the deliverable *is* the deployment.

- **Transfer:** Finalize the single self-contained file as the production artifact.
  "Deploying" means the user opens that one file in any browser and uses it immediately.
- **Automation:** There are no cron jobs or webhooks. The only "trigger" is page load,
  which calls `loadAll()` to restore the dataset; every mutation auto-saves.
- **Documentation — Maintenance Log in `LLM.md`:**
  - How to add a new status to the pipeline (update the enum in *one* place; both views read it).
  - How to add a new field (extend the schema, the form, and the table column together).
  - The storage-fallback behavior and its user-facing message.
  - The response-rate formula and which statuses count as "interview."

---

### After the build — what was produced (3–5 bullets)

- A single self-contained job application tracker (one HTML/JS file or one React component),
  working on first delivery with no TODOs or stubs.
- Full CRUD over entries using the locked schema, with a 7-stage status pipeline.
- Table view (sortable) **and** Kanban view (drag-and-drop), plus search + status/source filters.
- Summary dashboard with totals, per-status counts, and response rate (interviews ÷ applied).
- Local persistence via `localStorage`, with an in-memory fallback for sandboxes that block it.
