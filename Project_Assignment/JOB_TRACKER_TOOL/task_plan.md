# task_plan.md — B.L.A.S.T. Build Checklist: Job Application Tracker

---

## Protocol 0 — Initialization ✅

- [x] `LLM.md` created — schema locked, behavioral rules set
- [x] `task_plan.md` created (this file)
- [x] `findings.md` created — storage research, DnD approach, accessibility notes
- [x] `progress.md` created — build log
- [x] Halt condition honored: Discovery Questions answered before any code written

---

## Phase B — Blueprint ✅

- [x] North Star defined: single-page tool, saved → offer pipeline, no scattered data
- [x] Integrations: None (zero-dependency, no keys required for core tracker)
- [x] Source of Truth: `localStorage` with in-memory fallback
- [x] Delivery Payload: single `.html` file, open in browser, use immediately
- [x] Behavioral Rules: scope guard, no placeholder data, deterministic logic
- [x] Data schema locked in `LLM.md` (12 fields)
- [x] Status enum confirmed: `Wishlist → Applied → Phone Screen → Interview → Offer → Accepted → Rejected`

---

## Phase L — Link ✅

- [x] `localStorage` feature-detected via try/catch at startup (`seedIfEmpty` / `loadJobs`)
- [x] Handshake: `loadJobs()` / `persist()` wrap all storage access
- [x] Broken-link rule: `try { JSON.parse(...) } catch { return [] }` prevents crash on corrupt data
- [x] Degradation: if storage write throws, in-memory state continues for the session

---

## Phase A — Architect ✅

### Layer 1 — SOPs

- [x] `sop_crud.md` — add/edit/delete; validation; id generation
- [x] `sop_persistence.md` — load on startup, save on mutation, JSON, fallback
- [x] `sop_kanban.md` — render columns; drag-and-drop; status update
- [x] `sop_table.md` — sortable columns; stable sort; asc/desc toggle
- [x] `sop_search_filter.md` — free-text + status + source combined filter
- [x] `sop_dashboard.md` — totals, per-status, response rate formula

### Layer 2 — Navigation (Routing)

- [x] Table ↔ Kanban switch via `switchView()`
- [x] Every mutation routes through `persist()` then `renderAll()`
- [x] Search/filter change routes through `getFiltered()` then re-renders active view
- [x] Edge cases handled: empty dataset (empty state shown), last entry deleted (board/table clears), drag outside column (no-op), invalid date (field left empty)

### Layer 3 — Tools (Functions)

- [x] `uid()` — generates unique id
- [x] `loadJobs()` / `persist(jobs)` — storage handshake
- [x] `saveJob(e)` — covers both add and edit paths
- [x] `deleteJob(id)` / `delConfirm()` — two-step delete with confirmation dialog
- [x] `setStatus` — handled inline via `onDrop()` in kanban
- [x] `getFiltered()` — `filterEntries` equivalent (query + status + source)
- [x] `sorted(jobs)` — `sortEntries` equivalent (stable string sort, asc/desc)
- [x] `renderDashboard()` — `computeDashboard` equivalent (total, per-status, rate)
- [x] `refreshSourceFilter()` — dynamic source dropdown from live data

---

## Phase S — Stylize ✅

- [x] Table view: sortable headers (7 columns), status badges, URL link, action buttons
- [x] Kanban board: 7 columns, drag-and-drop between columns, keyboard accessible
- [x] Search box + status dropdown + dynamic source dropdown
- [x] Dashboard: 7 stat cards with animated count-up
- [x] Light / Dark mode toggle (respects system preference on first visit)
- [x] Theme Studio: 15 gradient background presets + 5 UI style modes (Default, Cartoon, Classic, Neon, Retro)
- [x] Custom background: URL input + file upload (compressed to JPEG)
- [x] Responsive: desktop table, mobile bottom nav, mobile Kanban snap-scroll
- [x] Accessible: labeled inputs, `aria-label`, `role` attributes, keyboard focus management
- [x] AI Chat panel: 6 provider support (Groq, Gemini, OpenRouter, Mistral, OpenAI, Claude)
- [x] 3 sample rows seeded, clearly labeled, deletable
- [x] Animated logo, ripple effects, stat card animations, modal spring

---

## Phase T — Trigger ✅

- [x] Deliverable: `job-tracker.html` — single file, open in any browser, works immediately
- [x] Boot sequence: `initTheme()` → `applyStyle()` → `seedIfEmpty()` → `renderAll()`
- [x] Auto-save: every mutation calls `persist(jobs)` before re-rendering
- [x] Page load restores full dataset via `loadJobs()`
- [x] Maintenance Log documented in `LLM.md`
- [x] Build summary comment block at bottom of HTML file
