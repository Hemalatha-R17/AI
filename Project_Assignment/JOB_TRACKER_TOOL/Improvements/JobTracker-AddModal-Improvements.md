# Job Application Tracker — Add Application Modal Improvements

> Based on a UI review of the "Add Application" modal at `localhost:3000/job-tracker.html`.

---

## 1. Form Structure & Fields

- **Salary Range is a single text field** ("$120k–$140k") — this makes sorting and filtering impossible.
  Split it into two numeric fields: **Min** and **Max** with a currency selector.
- **"Next Action" and "Follow-up Date" are separated** across the form but they're conceptually one
  thing — group them together side by side so the action and its deadline stay linked.
- **Notes is at the very bottom** but it's often filled in first (copy-pasting the JD summary) —
  consider moving it after the required fields so the flow feels natural.

---

## 2. Validation & Feedback

- **No real-time validation** — required fields (Company, Role, Status) only show errors on submit;
  highlight them as the user tabs away.
- **Salary Range has no format guidance** — the placeholder says "$120k–$140k" but a user could type
  "12 LPA" or "1,20,000" and break sorting. Use structured number inputs instead.
- **URL field has no validation** — a user can save "abc" as a job posting URL with no warning.
- **Application Date defaults to blank** — it should default to **today's date** since most people
  add entries the day they apply.

---

## 3. UX & Interaction

- **No keyboard shortcut to save** — `Ctrl+Enter` / `Cmd+Enter` should submit the form; power users
  adding 5–10 entries a day will feel this missing.
- **Cancel and Save buttons are far apart** visually — on mobile, "Cancel" can be accidentally tapped.
  Group them closer or make Cancel a text link.
- **No autofocus on first field** — the cursor should land in the Company field the moment the modal opens.
- **Modal has no scroll indicator** — on smaller screens the Notes textarea likely gets cut off with
  no hint there's more below.
- **Status dropdown says "Select status…"** — since most entries are added right after applying,
  default it to **"Applied"** to save a click every time.

---

## 4. Missing Fields to Consider

| Field | Why Useful |
|---|---|
| **Job Type** (Full-time / Contract / Internship) | Useful filter when searching across roles |
| **Priority** (High / Medium / Low) | Helps decide which applications to follow up on first |
| **Salary Currency** (INR / USD) | Important when tracking both Indian and global roles |
| **Interview Round** | Once status = Interview, capture which round (R1, R2, Final) |

---

## 5. Priority Recommendation

> **Single highest-impact fix:** **Split Salary into Min + Max numeric fields** — this unblocks
> correct sorting and filtering across the entire table view.

### Suggested Fix Order

1. Split Salary into Min + Max numeric fields — unblocks sorting
2. Default Application Date to today — removes a repetitive click
3. Default Status to "Applied" — removes another repetitive click
4. Real-time field validation (on blur, not just on submit)
5. URL format validation before save
6. `Cmd/Ctrl + Enter` keyboard shortcut to save
7. Autofocus on Company field on modal open
8. Add scroll indicator for smaller screens
9. Group Next Action + Follow-up Date side by side
10. Add Job Type, Priority, and Salary Currency fields
