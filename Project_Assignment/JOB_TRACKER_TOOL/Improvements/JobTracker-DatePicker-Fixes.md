# Job Application Tracker — Date Picker Popover Fixes

> Based on a review of the table view with the "Applied From" date-range picker open.
> Good progress: CSV export, date-range filters, Notes column, structured contact, and a
> purple-themed calendar are all in. One critical bug remains.

---

## 1. Critical Bug — Calendar Overlaps Table Content

The date picker is rendering **transparent / with no solid background**, so the table rows behind
it (Meridian Labs' contact "Jane Doe (Recruiter)", the "Link" cells, the date values) bleed through
and tangle with the calendar's own text. "June 2026" overlaps "Select date" and the weekday headers
collide with row data.

**Fixes:**
- Give the calendar popover a **solid opaque background** (white or your card color) — right now the
  background appears missing or semi-transparent.
- Add a **higher `z-index`** so it sits cleanly above the table.
- Add a **subtle drop shadow and border** so it reads as a floating layer, not part of the page.
- Add **box/card padding** around the grid so dates aren't flush against the edges.

> **This is the priority fix** — right now the picker is essentially unusable because the calendar
> can't be told apart from the table behind it.

---

## 2. Positioning Issue

The picker opens **far from the field that triggered it** — it floats over the middle of the table
rather than anchored below the "Applied From" input.

**Fix:** Anchor the popover to its trigger so it appears directly under the date field the user clicked.

---

## 3. Smaller Polish Points

- The **‹ › month arrows** are now correct, but they sit very close to the "June 2026" label (which
  is itself overlapping). Once the background is fixed, give the header row more breathing room.
- **"Today" and "Clear"** links look good in the accent color — keep that styling.
- On smaller screens, ensure the popover **flips or repositions** if there isn't room below, so it
  never gets cut off by the viewport edge.

---

## 4. Suggested Fix Order

1. Add solid opaque background to the calendar popover
2. Raise `z-index` above the table
3. Add drop shadow + border to define it as a floating layer
4. Anchor the popover directly below its trigger field
5. Add padding/breathing room to the header (month label + ‹ › arrows)
6. Add viewport-edge detection so the popover flips when there's no room below
