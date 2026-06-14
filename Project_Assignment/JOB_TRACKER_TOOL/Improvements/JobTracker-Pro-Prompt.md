# RICE-POT Prompt — Job Application Tracker (Pro Edition)

> A single, comprehensive prompt that combines the enhanced feature roadmap with all
> UI/UX learnings from prior reviews. Built on the RICE-POT framework. Copy the prompt
> section into your AI tool of choice.

---

## Quick Reference: RICE-POT

| Letter | Component    | What goes here |
|--------|--------------|----------------|
| **R**  | Role         | The persona the AI adopts |
| **I**  | Instructions | Step-by-step build commands + "Don't" rules |
| **C**  | Context      | The why — what problem this solves |
| **E**  | Example      | Sample data shape and interaction patterns |
| **P**  | Parameters   | Quality, accuracy, and tech constraints |
| **O**  | Output       | The exact artifact to produce |
| **T**  | Tone         | Communication style |

---

## The Prompt (copy from here)

### R — Role
You are a **senior full-stack product engineer with 10+ years of experience** building polished,
production-grade SaaS dashboards. You specialize in React + TailwindCSS, accessible interfaces,
data visualization, and integrating AI features into real workflows. You ship pixel-perfect,
bug-free tools that look and feel like products from top-tier startups (Linear, Notion, Vercel).

### I — Instructions

Build a **Job Application Tracker** — a single-page web app that helps a job seeker manage every
application from "Saved" to "Accepted" with AI-powered assistance, analytics, and a polished UX.

**1. Core data model.** Each application entry must capture:
- **Job Details:** Company, Role/Title, Location (or Remote), Job Type (Full-time / Contract / Internship), Priority (High / Medium / Low), Salary Min, Salary Max, Currency (INR / USD / GBP), Job Posting URL
- **Tracking:** Status, Source, Application Date (default: today), Next Action, Follow-up Date, Interview Round (shown only when Status = Interview)
- **Contact:** Contact Name, Contact Role (Recruiter / HR / Hiring Manager / Referrer), Email, Phone
- **Notes:** free-text

**2. Status pipeline (exact values):**
**Saved → Submitted → Phone Screen → Interview → Offer → Accepted → Rejected → Withdrawn**

**3. Three primary views:**
- **Table view** — sortable columns, multi-select with bulk actions (Move / Export / Delete), inline status change dropdown per row, hover-tooltip on truncated Notes
- **Kanban board** — drag-and-drop between columns, cards show: company favicon (auto-fetched from URL domain), role, salary (abbreviated), priority dot (🔴/🟡/🟢), follow-up date (red if overdue), interview round badge if applicable
- **Analytics dashboard** — see Analytics section below

**4. Dashboard stat cards (above filters):**
Total · Saved · Submitted · Interviews · Interview Rate (%) · Offers · Rejected · Follow-ups Due (today/overdue) · Active Pipeline (Submitted → Offer)

**5. Filters & search:**
Search by company or role · Filter by status · Filter by source · Date range filter (Applied From / To) · CSV export of filtered results

**6. Analytics dashboard (separate tab):**
- Applications per week (bar chart)
- Conversion funnel: Saved → Submitted → Phone Screen → Interview → Offer → Accepted, with % conversion at each stage
- Source effectiveness: interview rate by source (LinkedIn, Referral, Indeed, Naukri, etc.)
- Average response time per source
- Salary distribution histogram

**7. AI Assistant panel (slide-in from right, resizable, pushes content left — does not overlap):**
- Multi-provider support: Groq, Gemini, OpenRouter, Mistral, OpenAI, Claude (API keys stored only in browser)
- After connecting, seed 4 example prompts:
  - "Draft a follow-up email for [Company]"
  - "Write a cover letter for this role"
  - "Help me prep for my [Role] interview at [Company]"
  - "Summarize this job description into key requirements"
- **Context-aware actions on each entry:** ✨ button on every card and row with one-click options:
  - Draft follow-up email (auto-reads contact name, role, next action)
  - Generate cover letter (auto-reads company, role, notes)
  - Interview prep (generates likely questions for the role)
- **Job Description parsing:** paste a JD URL or raw text → AI extracts skills, years of experience, key responsibilities → pre-fills modal fields
- **Skill Gap Analysis:** compare JD requirements vs a user-defined skills profile → highlight missing skills
- **Salary benchmarking:** when user enters Role + Location → AI suggests a market salary range with a "verify on Glassdoor" disclaimer

**8. Theme Studio:**
- **Colors tab:** 12+ gradient presets (Default, Sunset, Ocean, Forest, Galaxy, Aurora, Rose, Midnight, Candy, Arctic, Earth, Citrus, Lava, Mint, Slate) — hover to preview, click to apply
- **Styles tab:** Default (Glass + Gradient), Cartoon (Bold + Comic), Classic (Clean + Professional), Neon (Cyber + Glow), Retro (Terminal + Pixel) — Neon/Retro show a "high contrast — best for personal use" warning
- **Image tab:** custom background image (URL or upload) **with opacity slider and blur slider** so table data stays readable; show live preview before applying
- **Fonts tab:** Inter / Poppins / JetBrains Mono / system default
- **Layouts tab:** Compact (dense) / Comfortable (default) / Spacious

**9. Add Application modal:**
- Section-grouped: **JOB DETAILS** / **TRACKING** / **CONTACT & NOTES (optional, collapsible)**
- Default values to reduce friction: Status → Submitted, Job Type → Full-time, Priority → Medium, Application Date → today
- Autofocus on Company field on open
- Real-time validation on blur (not just on submit)
- URL format validation before save
- Salary Min must be ≤ Salary Max
- Currency selector beside salary
- `Cmd/Ctrl + Enter` to save; `Esc` to close
- Sticky modal header and footer; scroll indicator on smaller screens

**10. Bulk actions on table:**
- Header checkbox toggles select-all for visible rows
- On selection, show a sticky action bar (neutral / brand-purple color, NOT red) with: "N selected · Move to ▾ · Export · Delete · Clear"
- Delete requires a confirmation modal: "Delete N applications? This can't be undone."
- Keyboard shortcuts: `Cmd/Ctrl + A` (select all), `Esc` (clear), `Delete` (bulk delete with confirmation)

**11. Reliability & data quality:**
- **Validation rules:** block placeholder/test entries (single-char Company or Role, etc.); warn on future Application Dates; validate URL format
- **Audit trail:** every status change logged with timestamp, visible in the entry detail view as a timeline
- **Data security:** encrypt salary and recruiter contact in localStorage; add "Export & Wipe" (download JSON + clear storage); show a "Your data never leaves your browser" trust badge
- **Date format consistency:** ISO display (YYYY-MM-DD) everywhere, or localized to user locale — pick one and apply globally
- **Error handling:** empty-state messages per view; friendly error if AI provider fails ("Couldn't reach [Provider] — check your API key")

**12. Notifications:**
- In-app: daily browser notification when follow-ups are due today (if permission granted)
- Optional: calendar sync (Google / Outlook) for interview events and follow-up reminders

**13. Collaboration mode (optional):**
- Generate a read-only share link with selected entries hidden (e.g. hide salary)
- Mentors can leave comments per entry

**14. Mobile experience:**
- < 768px: hide Table view, default to Kanban as a single vertical scroll grouped by status
- Modal becomes a bottom sheet instead of a centered dialog
- Bulk actions move to a bottom action sheet

**15. Polish moments:**
- Confetti animation when an entry moves to Offer or Accepted
- Overdue follow-up rows pulse subtly in the table; overdue text turns red on Kanban cards
- Quick-add floating button stays visible but **never overlaps row actions** (Edit/Delete buttons or AI sparkle)

**Mandatory "Don't" rules:**
- Do **not** include test/demo data in the final build — start with an empty state and an onboarding tour
- Do **not** require backend or accounts in v1 — everything must work locally with browser storage
- Do **not** use red for neutral states (like "N selected"); reserve red for destructive actions only
- Do **not** let any popover, dropdown, or modal render with a transparent background — always solid + drop shadow + appropriate `z-index`
- Do **not** mix salary display formats across views — pick one (abbreviated with currency) and use it everywhere
- Do **not** display contact info as a single combined string — use structured Name / Role / Email / Phone
- Do **not** require API keys for the app to function — AI features are opt-in, not gating

### C — Context

- **Who:** A job seeker actively managing 20–100+ applications across many companies, sources, and stages
- **Why:** Existing trackers (spreadsheets, Notion, paid SaaS) either lack pipeline visualization, ignore follow-ups, or charge for AI features. This tool solves all three in one polished package
- **Where:** Primarily desktop browser, with full mobile support for on-the-go updates
- **Pain points solved:** missed follow-ups, scattered application data, no insight into which sources work, no easy way to draft personalized follow-up emails or prep for interviews

### E — Example

A single Kanban card should render like this (illustrative):

```
┌─────────────────────────────────┐
│ 🟡 [Acme logo] Acme Corp        │
│ Senior QA Engineer              │
│ 📍 Remote (US) · 💰 $120k–$140k │
│ 📅 2026-05-20 · LinkedIn        │
│ ▶ Send thank-you · 2026-06-15   │
│                       ✏️ ✨ 🗑️ │
└─────────────────────────────────┘
```

A single table row inline-edits status without opening a modal. Hovering Notes shows the full
text in a tooltip. Hovering the ✨ icon opens a small menu: "Draft email · Cover letter · Prep me."

### P — Parameters

**Tech stack (required):**
- **Frontend:** React 18+ with TailwindCSS
- **UI primitives:** shadcn/ui or Radix UI (accessible, unstyled primitives) — avoid heavy frameworks like Material UI unless explicitly requested
- **Charts:** Recharts (preferred) or Chart.js
- **Drag-and-drop:** `@dnd-kit/core` (modern, accessible) — not `react-beautiful-dnd` (deprecated)
- **State:** Zustand (lighter than Redux, ideal for this scope)
- **Date handling:** `date-fns` (smaller than Moment)
- **Icons:** `lucide-react`
- **Storage:** IndexedDB via `idb` for large data, or `localStorage` for v1 simplicity
- **No backend required** for v1; design data layer so a future Node.js + Postgres backend can swap in cleanly

**Quality bar:**
- Working tool on first response — no TODOs, stubs, or unfinished functions
- Every interaction (add / edit / delete / drag / filter / search / bulk action / AI call) must work end-to-end
- Fully keyboard-navigable; WCAG AA color contrast; labeled inputs; visible focus rings
- All popovers/dropdowns have solid backgrounds, drop shadows, and correct `z-index` stacking
- Responsive from 360px (mobile) to 1920px (desktop)
- Empty states for every view (no data yet, no filter results, AI not connected)
- All numeric displays use consistent formatting (salary abbreviation, currency symbol, locale-aware dates)

### O — Output

- A **modular React project** with components organized by feature:
  - `components/dashboard/` (stat cards, charts)
  - `components/table/` (rows, bulk action bar, filters)
  - `components/kanban/` (board, column, card)
  - `components/modal/` (add/edit form with sections)
  - `components/ai/` (assistant panel, action buttons, prompt seeds)
  - `components/theme/` (theme studio tabs and presets)
  - `lib/` (storage, AI providers, date utils, formatters)
  - `store/` (Zustand store)
- A **README** describing setup, tech choices, and architectural decisions
- **Seeded onboarding state** (empty, with a "Get started" CTA) — never seed test entries like "aloo" or "aba"
- After the code, list in **5–8 bullets** exactly what was built, any assumptions made, and any deferred items with rationale

### T — Tone

Practical, opinionated, and confident. Prioritize a tool that works end-to-end and feels like a
premium product over decorative extras. Avoid hedging language; make strong defaults and explain
the reasoning briefly when relevant.

---

## Notes on Using This Prompt

- **Anti-hallucination guard:** the "Don't" rules block the most common failure modes seen across
  prior iterations (test data leaking into production, transparent popovers, red used for neutral
  states, salary format drift, contact as a single string).
- **Defaults reduce friction:** every default chosen (Status = Submitted, Today's date, Priority = Medium)
  is calibrated to cut one click out of the most common path.
- **AI is context-aware, not generic:** the biggest differentiator vs every other free tracker is
  the AI panel reading actual entry data — not making the user copy-paste.
- **Tech stack is opinionated for a reason:** Zustand over Redux, Recharts over D3, `@dnd-kit`
  over the deprecated `react-beautiful-dnd`, shadcn/ui over Material — all chosen for build speed,
  accessibility, and a modern look.
- **v1 is local-first:** no backend, no accounts. A backend swap-in is designed for but not required.

---

## Suggested Build Order (if breaking into phases)

1. **Foundation:** data model, Zustand store, table view with filters and CSV export
2. **Modal:** add/edit form with sections, defaults, validation
3. **Kanban:** drag-and-drop board with priority dots and follow-up highlighting
4. **Dashboard:** stat cards + Follow-ups Due + Active Pipeline
5. **Bulk actions:** select-all, move, export, delete with confirmation, keyboard shortcuts
6. **AI Panel:** multi-provider config, seeded prompts, context-aware one-click actions per entry
7. **Analytics tab:** conversion funnel, source effectiveness, response time, applications per week
8. **Theme Studio:** Colors / Styles / Image (with opacity + blur) / Fonts / Layouts
9. **Reliability:** validation rules, audit trail, error handling, encrypted storage, export & wipe
10. **Polish:** mobile view, confetti on Offer/Accepted, onboarding empty state, notifications
