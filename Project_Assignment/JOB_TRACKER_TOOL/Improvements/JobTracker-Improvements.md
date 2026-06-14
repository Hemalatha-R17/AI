# Job Application Tracker — Improvement Suggestions

> Based on a UI review of the current tool at `localhost:3000/job-tracker`.

---

## 1. UX & Usability

- **Notes column is missing** from the table view — it's one of the most useful fields during an active search.
- **Clicking a row** should open the full entry detail; right now Edit is the only way in, which adds friction.
- The **"+ Add Application" modal** likely needs a better tab order and keyboard shortcut (e.g. `N` for new entry).
- Add **inline status change** directly from the table (a dropdown in the Status cell) so you don't need to open Edit just to move a stage forward.

---

## 2. Dashboard / Metrics

- **Response rate (25%)** is calculated as interviews ÷ applied, but "Phone Screen" and "Interview" are separate stages — make clear which counts. Currently it shows "1 interview" but Meridian Labs is still at Phone Screen.
- Add a **"Follow-ups Due Today / Overdue"** count card — this is the #1 pain point the tool is meant to solve, yet the dashboard doesn't surface it.
- Add an **"Active Pipeline"** count (everything between Applied and Offer, excluding Rejected/Accepted).

---

## 3. Data & Filtering

- The **Salary column sorts lexicographically** ("$100k" vs "$120k") rather than numerically — salary ranges need to be split into Min/Max fields for proper sorting.
- **Source filter** is useful, but a **date range filter** (applied between X and Y) would be far more practical for long searches.
- No way to **bulk delete** rejected/old entries — this becomes painful after 50+ rows.

---

## 4. Visual Design

- The **left-side colored border** on rows (visible on Acme Corp) looks like a status indicator — if it is, make it consistent across all rows; if it isn't, remove it to reduce confusion.
- The **Kanban button** in the header is visually de-emphasized (outline only) even though it's a primary view — both views should feel equal weight.
- **Mobile responsiveness** on the table with 11 columns will be very tight — consider hiding lower-priority columns (URL, Contact) behind an expandable row on small screens.

---

## 5. Missing Features Worth Adding

| Feature | Why It Matters |
|---|---|
| **Export to CSV** | Power users always want this for backup or sharing |
| **Follow-up reminders** | Even a simple visual highlight (red text) when a follow-up date has passed |
| **Interview stage counter** | Distinguish Phone Screen, Round 1, Round 2, Final so the pipeline is more granular |

---

## Priority Recommendation

> **Single highest-impact fix:** The **overdue follow-up highlight + dashboard card** — this directly addresses the "missed follow-ups" pain point the tool was built to solve.

### Suggested Fix Order

1. Overdue follow-up highlight + dashboard card
2. Inline status change from table row
3. Notes column in table view
4. Salary Min/Max split for correct sorting
5. Bulk delete for old/rejected entries
6. CSV export
7. Kanban button visual parity
8. Mobile: collapsible columns
