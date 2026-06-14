# Job Application Tracker — Bulk Action Bar Review & Improvements

> Based on a review of the table view with bulk-select active and the "Move to..." dropdown open.
> Bulk action bar is live with: "5 selected" indicator, Move dropdown, Export, Delete, and Clear.

---

## 1. Bulk Action Bar Issues

- **"5 selected" is in red** — red usually signals error or destructive action. Selection is a
  neutral state. Use your **brand purple** or a neutral gray instead.
- **"Move to..." is the dropdown's first option** but it's not selectable (it's the placeholder) —
  slightly confusing. Either remove it from the list or label the dropdown clearly as "Move to"
  outside the dropdown.
- **Delete button is red-outlined** — good for destructive emphasis, but add a **confirmation step**:
  "Delete 5 applications? This can't be undone."
- **No "Select All" toggle in the header checkbox column** — clicking the header checkbox should
  select/deselect all visible rows.
- **"Move" button state is unclear** — is it grayed because you need to pick a status first, or
  do Move + dropdown work together? Either:
  - Make Move a button that opens the status picker, OR
  - Remove the standalone "Move" button since the dropdown already triggers the move.

---

## 2. Table Inconsistencies

- **Salary still shows raw numbers** ("567,899–678,900" for `aloo` vs "$130k–$150k" for Meridian Labs).
  The formatting fix from the previous review hasn't landed everywhere — standardize to a single format.
- **Contact column wrapping** — "Hemalatha R · Recruiter" and "Sam Lee (Eng Manager)" wrap onto
  multiple lines. Either widen the column or truncate with a tooltip on hover.
- **"Offer" status pill** appears on 3 rows but each has slightly different visual weight — make sure
  all status pills are the same size and shape regardless of word length.

---

## 3. Data Quality Problems

- **Test entries are still in production view** — `aloo` (role `aloo`), `aba` (role `sd`), location `ff`.
  These make the tool look unfinished.
- Either hide them behind a **"Demo data" toggle** in settings or remove them entirely.
- Add a **"Clear demo data"** button in settings for first-time users.

---

## 4. Layout & Spacing

- **Bulk action bar overlaps the dropdown** when "Move to..." is open — the dropdown extends below
  the action bar and covers the column headers ("COM" is partially hidden behind the dropdown).
  Increase `z-index` on the dropdown menu.
- **Top stat cards are cut off** ("today or overdue" and "applied → offer" are partially visible at
  the top) — when the bulk action bar appears, the page should auto-scroll to keep the table headers
  in view.

---

## 5. Missing Affordances

- **No keyboard shortcuts** for bulk actions:
  - `Cmd/Ctrl + A` → select all
  - `Delete` key → trigger bulk delete
  - `Escape` → clear selection
- **"5 selected"** could show a clear count with a subtle background pill: `📋 5 selected`.
- **Export in bulk action bar** — clarify whether it exports *only selected* (likely) or *all visible*
  with a tiny tooltip on hover.

---

## 6. Floating AI Button Overlap

- The **floating AI button** (bottom right, purple sparkle) overlaps the Delete button on the bottom
  row. Reposition the floating button or add safe-area padding so it never sits over a row action.

---

## 7. Priority Fix Order

1. **Hide or delete test entries** (`aloo`, `aba`, `ff`) — biggest visual win; makes the tool look
   production-ready
2. **Fix salary display consistency** — still showing raw numbers in 2 rows
3. **Change "5 selected" color** from red to neutral / brand purple
4. **Add Select All header checkbox** behavior
5. **Add delete confirmation modal** for bulk delete
6. **Fix dropdown z-index** so it doesn't get cut off by the action bar
7. **AI button positioning** — don't let it sit over Delete buttons
8. **Add keyboard shortcuts** (`Cmd+A`, `Esc`, `Delete`)
9. **Clarify Move button vs dropdown** — pick one pattern
10. **Add tooltip to bulk Export** clarifying scope (selected vs visible)
