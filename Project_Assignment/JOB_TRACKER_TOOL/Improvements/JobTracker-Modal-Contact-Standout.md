# Job Application Tracker — Modal Fixes, Contact Fields & Standout Features

> Based on a review of the updated "Add Application" modal (salary split, Job Type,
> Priority, and default date already implemented). Covers reported issues, the contact-field
> question, and ideas to make the app stand out.

---

## 1. Reported Issues

### Follow-up Date — calendar icon is missing
- The **Application Date** field shows a clear calendar icon (📅), but the **Follow-up Date**
  field shows only a faint, barely-visible icon with "mm/dd/yyyy" text. The two date fields are
  styled inconsistently.
- **Fix:** Both date fields should use the **same date-picker component** with the same visible
  calendar icon on the right edge, so the user knows exactly where to click.

### The calendar UI looks unstyled
- The current picker is the **browser default / a barebones picker** — cramped and out of place
  against the polished modal.
- **Fixes:**
  - Add more padding and larger tap targets for each date.
  - Highlight **today** and the **selected date** in the brand purple (not gray).
  - Make the "Clear" / "Today" links match the accent color.
  - Replace the unusual ↑↓ month-navigation arrows with **left/right arrows (‹ ›)**, which users
    expect for previous/next month.

---

## 2. Contact Field — Name Only, or Name + Number?

**Recommendation: use structured contact fields** rather than one combined box.

| Field | Notes |
|---|---|
| **Contact Name** | e.g. "Jane Doe" |
| **Contact Role** | Small dropdown: Recruiter / HR / Hiring Manager / Referrer |
| **Contact Email** | Optional — enables click-to-email |
| **Contact Phone** | Optional — enables click-to-call |

**Why separate them:**
- During follow-ups you'll want to **click-to-email or click-to-call** directly from the entry —
  impossible if name + number are mashed into one text field.
- Keeping them as dedicated fields keeps data clean and actionable.
- **Avoid labeling it strictly "HR"** — your contact is often a recruiter, referrer, or hiring
  manager. A flexible **Contact Role** dropdown covers all cases.

---

## 3. What Would Make This App Stand Out

### High-impact differentiators
- **Overdue follow-up highlighting** — any entry past its follow-up date glows red on the dashboard
  and table. The single feature that makes a tracker genuinely better than a spreadsheet.
- **Status timeline per entry** — show the journey, not just current status:
  Applied (Jun 1) → Phone Screen (Jun 8) → Interview (Jun 15).
- **Email / calendar reminders** — even a simple browser notification when a follow-up is due today.

### Smart UX touches
- **Auto-fetch company info** — when a Job Posting URL is entered, attempt to pull the company
  name/logo (even just a favicon next to each company makes the list feel premium).
- **Duplicate detection** — warn if the same Company + Role already exists.
- **Quick-add from clipboard** — paste a job URL and pre-fill what's parseable.

### Data & insight features
- **Salary insights** — show average/median salary across applications once several exist.
- **Application velocity chart** — applications per week, to track pace.
- **Source effectiveness** — which source (LinkedIn vs Referral vs Naukri) gives the best response
  rate; helps decide where to spend effort.

---

## 4. UI Refinements

- **Field grouping with section headers** inside the modal: a "Job Details" section, a "Tracking"
  section, and a "Contact" section — reduces cognitive load on a long form.
- **Collapsible "Optional details"** — keep required fields (Company, Role, Status, Salary) always
  visible; tuck Contact/Notes/URL under an expandable "Add more details" section so quick entries
  stay fast.
- **Sticky modal header and footer** — the footer with Save is already sticky; pin the
  "Add Application" title too while scrolling.

---

## 5. Priority Recommendation

> **Single highest-impact fix:** **Overdue follow-up highlighting** — directly solves the
> "missed follow-ups" pain point the tool exists for.

### Suggested Fix Order

1. Fix Follow-up Date icon to match Application Date
2. Restyle the calendar picker (padding, brand colors, ‹ › navigation)
3. Split Contact into Name + Role + Email + Phone
4. Overdue follow-up highlighting (table + dashboard)
5. Status timeline per entry
6. Group form fields into sections with headers
7. Collapsible "Optional details" block
8. Source effectiveness insight
9. Duplicate detection on Company + Role
10. Auto-fetch company favicon/logo from URL
