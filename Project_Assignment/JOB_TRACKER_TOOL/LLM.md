# LLM.md — Project Constitution: Job Application Tracker

> Single source of truth for schema, behavioral rules, and maintenance guidance.

---

## Data Schema

A single job application entry:

```json
{
  "id": "uuid-v4-string",
  "company": "Acme Corp",
  "role": "Senior QA Engineer",
  "location": "Remote (US)",
  "salary": "$120k–$140k",
  "source": "LinkedIn",
  "appliedDate": "2026-06-01",
  "status": "Interview",
  "url": "https://acme.com/careers/123",
  "contact": "Jane Doe (Recruiter)",
  "nextActionDate": "2026-06-15",
  "nextAction": "Send thank-you note",
  "notes": "Strong culture fit; second round scheduled."
}
```

The full dataset is an array of these objects, persisted as one JSON blob under `localStorage` key `jat-v1`.

---

## Behavioral Rules (Invariants)

- **Status is an enum**, in pipeline order:
  `Wishlist → Applied → Phone Screen → Interview → Offer → Accepted → Rejected`
- **Scope guard:** no login, no backend, no external accounts, no required API keys.
  The AI chat panel is opt-in and uses the user's own key, stored only in their browser.
- **No filler data:** 3 clearly-labeled sample rows are seeded on first launch. User can delete them.
- **Deterministic logic only:** dashboard counts derive purely from the dataset; no guessing.
- **XSS safety:** all user-supplied strings pass through `esc()` before being inserted into innerHTML.
- **Persistence guard:** `localStorage` is feature-detected at startup; if blocked, the app degrades to in-memory session state and surfaces a note.

---

## Response Rate Formula

```
response_rate = interviews / applied
interviews = count of entries with status in {Interview, Offer, Accepted}
applied     = count of entries with status NOT in {Wishlist}
```

Displayed as a percentage. Shows `—` when `applied === 0`.

---

## Maintenance Log

### How to add a new status to the pipeline

1. Add the value to the `STATUSES` array in the `<script>` block (one place; both views read it).
2. Add a matching `<option>` in the modal `<select id="f-status">` and the filter `<select id="filter-status">`.
3. Add CSS classes `.s-NewStatus`, `.row-NewStatus`, `.kcard-NewStatus`, and `.col-accent-NewStatus` following the existing pattern.
4. Update the dashboard logic in `renderDashboard()` if the new status should count toward any stat card.

### How to add a new field

1. Extend the schema above with the new key.
2. Add a form group in the modal `<form id="job-form">`.
3. Read and write the field in `saveJob()` (the `payload` object).
4. Display it in `renderTable()` (new `<td>`) and `kanbanCard()` as a chip or label.
5. Add a `<th>` in the table header; wire `onclick="sortBy('newField')"` if sortable.
6. Update `setField()` call list in `openModal()` for the edit path.

### Storage fallback

If `localStorage.setItem()` throws (quota exceeded or sandboxed origin), the app continues with in-memory state. Data is lost on reload. A future enhancement could display a banner; current behavior is silent degradation.

### AI Chat

The AI chat panel is purely opt-in. No key is required to use the core tracker. Keys are stored per-provider in `localStorage` under keys `jat-key-<provider>`. Clearing browser storage removes them.
