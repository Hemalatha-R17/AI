# CareerPulse — Application Improvement Plan

Derived from source analysis of `JobCommand` (deployed at careerpulse-chi.vercel.app).

---

## 1. Multi-Device Sync

**Gap:** Data lives entirely in browser IndexedDB. Clearing the browser or switching devices loses all job data.

**Improvement:**
- Add optional cloud sync via a lightweight backend (Supabase / Firebase) or export/import via JSON file
- Keep local-first as default; sync is opt-in
- Show a "Backup" button that downloads all jobs as a JSON file and an "Restore" button to reload it

**Impact:** High — biggest usability blocker for real job seekers

---

## 2. CSV / PDF Export

**Gap:** No way to export job data from the UI. Data is locked in IndexedDB unless the user opens DevTools.

**Improvement:**
- Add "Export CSV" button on the Pipeline or Analytics page — one row per job with all key fields (company, role, status, applied date, salary, source, etc.)
- Add "Export PDF" option for a print-ready summary (useful for weekly progress reviews)
- Place export action in the Header or Settings page

**Impact:** High — users want to share progress or archive data

---

## 3. JD-Aware AI Prompting

**Gap:** AI panel fires generic prompts (e.g., "Write a cover letter for {role} at {company}"). No job description (JD) context is injected even though `jdText` is stored on the `Job` object.

**Improvement:**
- When opening the AI panel from a job card, prepend the stored `jdText` to the prompt automatically
- Add a "Paste JD" shortcut inside the Add/Edit modal that parses key requirements and pre-fills tags, role, and salary range
- Show a "JD loaded" indicator in the AI panel when context is attached

**Impact:** High — dramatically improves quality of AI-generated cover letters and interview prep

---

## 4. Follow-Up Reminder Notifications

**Gap:** Overdue follow-ups show a badge on the Dashboard but there is no proactive notification. Users must open the app to see them.

**Improvement:**
- Use the browser Notifications API to push a daily reminder for overdue follow-ups (opt-in)
- Add an in-app notification bell in the Header that lists upcoming follow-up dates for the next 7 days
- Allow setting reminder time (e.g., "remind me at 9 AM")

**Impact:** Medium — reduces missed follow-ups without requiring the user to check the app daily

---

## 5. JobDiscovery — Real Job API Integration

**Gap:** The `JobDiscovery` page exists in the router but its actual functionality is unclear — it may be a placeholder with no live job feed.

**Improvement:**
- Integrate a free job search API (e.g., Adzuna, Remotive, JSearch via RapidAPI, or GitHub Jobs RSS)
- Let users filter by role, location, job type, and salary range
- Add a one-click "Save to Pipeline" button that pre-fills the job card from the listing
- Show company favicon and direct link to the original posting

**Impact:** Medium — closes the loop from discovery to tracking inside one tool

---

## 6. Mobile / Responsive Layout

**Gap:** Layout uses fixed pixel widths (e.g., `width: 420` for the login panel, `width: 360` for the right column on Dashboard) that break on small screens. The Kanban board is horizontal-scroll-only on mobile.

**Improvement:**
- Replace fixed widths with `clamp()` / `minmax()` / `flex-wrap` responsive patterns
- On mobile, collapse the Sidebar into a bottom nav or hamburger menu
- Stack Kanban columns vertically on screens < 768px with a horizontal swipe gesture
- Test on iOS Safari and Android Chrome (currently untested per existing Playwright spec)

**Impact:** Medium — app is currently desktop-only despite being a PWA candidate

---

## 7. Duplicate Application Detection

**Gap:** No guard against adding the same company + role combination twice.

**Improvement:**
- On save in `AddEditModal`, check existing jobs for matching `company` + `role` (case-insensitive)
- Show a warning toast: "You already have a {role} application at {company} (Status: {status}). Add anyway?"
- Offer a "View existing" link that jumps to the duplicate in the Pipeline

**Impact:** Low-Medium — data hygiene, especially after bulk imports

---

## 8. Bulk Import from LinkedIn / CSV

**Gap:** Jobs must be added one at a time via the modal.

**Improvement:**
- Accept a CSV upload (columns: company, role, location, status, applied date, source, URL) and batch-insert jobs
- Add a LinkedIn Easy Apply export parser (LinkedIn lets users export applications as CSV)
- Show a preview table before confirming the import with row-level validation errors

**Impact:** Medium — lowers onboarding friction for users who already have a backlog of applications

---

## 9. Interview Timeline View

**Gap:** The `Calendars` page exists but there is no visual timeline of when interviews are scheduled relative to each other.

**Improvement:**
- Add a Gantt-style or week-view calendar that plots jobs with `interviewRound` and `followUpDate` on a timeline
- Color-code by status (purple = Interview, amber = Phone Screen, etc.)
- Click an event to open the job's edit modal directly

**Impact:** Low-Medium — useful when juggling multiple interview loops simultaneously

---

## 10. Analytics — Offer-to-Acceptance Rate & Time-to-Offer

**Gap:** Analytics tracks conversion funnel and source effectiveness but misses two key metrics job seekers care about:
- How long from "Submitted" to "Offer" (time-to-offer)
- Offer acceptance rate

**Improvement:**
- Calculate average days between `Submitted` history entry and `Offer` history entry per job
- Show "Avg. days to offer: X" as a stat card
- Show offer acceptance rate: `Accepted / (Accepted + Rejected at Offer stage)`
- Add a "Response rate" metric: jobs that moved past Submitted / total Submitted

**Impact:** Low — power-user insight, but differentiates from basic trackers

---

## Priority Summary

| # | Improvement | Impact | Effort |
|---|---|---|---|
| 1 | Multi-device sync / JSON backup | High | Medium |
| 2 | CSV / PDF export | High | Low |
| 3 | JD-aware AI prompts | High | Low |
| 4 | Follow-up notifications | Medium | Low |
| 5 | JobDiscovery real API | Medium | High |
| 6 | Mobile responsive layout | Medium | High |
| 7 | Duplicate detection | Medium | Low |
| 8 | Bulk CSV import | Medium | Medium |
| 9 | Interview timeline calendar | Medium | Medium |
| 10 | Advanced analytics metrics | Low | Low |
