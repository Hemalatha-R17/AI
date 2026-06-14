# progress.md — Build Log: Job Application Tracker

---

## Build Summary

**Deliverable:** `job-tracker.html` — single self-contained file, no server, no install.
**Lines:** ~5,170 (HTML + inline CSS + inline JS)
**Status:** ✅ Complete — all RICE-POT requirements satisfied

---

## What Was Built

### Core Features
- Full CRUD: add, edit, delete job entries via modal form
- 12-field schema: Company, Role, Location, Salary, Source, Applied Date, Status, URL, Contact, Follow-up Date, Next Action, Notes
- Status pipeline enum: `Wishlist → Applied → Phone Screen → Interview → Offer → Accepted → Rejected`
- localStorage persistence with JSON (de)serialization; in-memory fallback if storage blocked
- 3 labeled sample rows seeded on first launch (Acme Corp/Interview, Bright Systems/Applied, Meridian Labs/Phone Screen)

### Views
- **Table view:** Sortable on 7 columns (Company, Role, Location, Status, Applied Date, Salary, Follow-up); asc/desc toggle; status badges with per-status color; staggered row animation
- **Kanban view:** 7 columns, one per status; HTML5 drag-and-drop between columns; drag updates `status` and auto-saves; column card counts; per-status accent headers

### Filters & Search
- Free-text search on Company OR Role (case-insensitive, real-time)
- Status dropdown filter (All + 7 statuses)
- Source dropdown filter (dynamically populated from live data, updates on every mutation)
- All three filters compose (AND logic)

### Dashboard
- 7 stat cards: Total, Wishlist, Applied, Interviews, Response Rate, Offers, Rejected
- Animated count-up on value change (ease-out-cubic, 500 ms)
- Response rate = interviews ÷ applied (shows `—` when applied = 0)
- Interviews counted as: Phone Screen + Interview + Offer + Accepted

### UI / UX
- Light / Dark mode toggle — respects OS preference on first visit; persisted to `localStorage`
- Theme Studio: 15 gradient background presets + 5 UI style modes (Default · Cartoon · Classic · Neon · Retro)
- Custom background: URL paste or local file upload (compressed to JPEG before storage)
- Accent colors follow the active background preset automatically
- Animated app logo (walking figure with resume), ripple effects on buttons, stat card pop animation
- Delete confirmation dialog with animated trash icon (2-step: click Delete → confirm in dialog)
- Escape key closes modal / chat / bg-picker / delete dialog
- Click-outside closes modal and bg-picker

### Responsive / Mobile
- Desktop: full table layout, sidebar padding
- Tablet (≤768 px): single-column form grid, 2-column dashboard
- Mobile (≤640 px): fixed bottom nav bar (Table / Add / Kanban), header view-toggle hidden
- Kanban on mobile: horizontal snap-scroll between columns

### Accessibility
- Labeled form inputs (`<label for="">`, `aria-label`)
- `role="dialog"`, `aria-modal="true"`, `aria-labelledby` on modals
- `role="group"` on view toggle, `aria-pressed` on toggle buttons
- `role="article"`, `tabindex="0"` on kanban cards
- `aria-live="polite"` on empty state and chat message log
- Focus management: modal opens → focuses first input; delete dialog opens → focuses confirm button

### AI Chat (Optional)
- Floating action button → slide-in panel
- 6 provider choices: Groq (free), Gemini (free), OpenRouter (free), Mistral (free), OpenAI (paid), Claude (paid)
- Per-provider model dropdown and API key input
- Keys stored per-provider in `localStorage` (never shared)
- System prompt injects full dataset + stats + upcoming follow-ups
- Suggestion chips: Progress summary, Follow-ups due, Interview tips, Strategy advice

---

## Test Results

| Feature | Status | Notes |
|---|---|---|
| Add new entry (required fields) | ✅ | Validates Company, Role, Status |
| Add new entry (all fields) | ✅ | All 12 fields saved correctly |
| Edit existing entry | ✅ | Form pre-populated; all fields update |
| Delete entry | ✅ | Confirmation dialog; updates all views |
| Table sort (each column) | ✅ | Stable asc/desc toggle; indicator shown |
| Search by company | ✅ | Real-time, case-insensitive |
| Search by role | ✅ | Real-time, case-insensitive |
| Status filter | ✅ | Composes with search and source filter |
| Source filter | ✅ | Dynamically populated; clears when source deleted |
| Kanban drag between columns | ✅ | Status updates, auto-saves, re-renders |
| Dashboard counts | ✅ | Accurate after every mutation |
| Response rate formula | ✅ | Matches spec: interviews ÷ applied |
| localStorage persistence | ✅ | Data survives page reload |
| Dark mode | ✅ | Persisted; respects OS on first visit |
| Theme Studio — colors | ✅ | 15 presets; hover-preview; click-apply |
| Theme Studio — styles | ✅ | 5 modes; instant apply |
| Theme Studio — custom image | ✅ | URL + file upload; JPEG compression |
| Mobile bottom nav | ✅ | Visible ≤640 px; hides header toggle |
| Responsive form grid | ✅ | 2-col desktop → 1-col mobile |
| Empty state | ✅ | Shown when no results match filter |
| Escape key behavior | ✅ | Closes modal / dialog / chat / bg-picker |

---

## Known Limitations / Future Enhancements

- `aria-sort` attribute on `<th>` not set (screen readers won't announce sort direction)
- Keyboard drag-and-drop between Kanban columns not implemented (use Table view status dropdown as keyboard path)
- No export to CSV/JSON (could be added as a future enhancement)
- AI chat does not stream responses (full reply returned at once)
