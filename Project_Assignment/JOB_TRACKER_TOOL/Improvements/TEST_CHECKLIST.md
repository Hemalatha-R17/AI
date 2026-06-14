# CareerPulse — Manual Test Checklist

**App URL:** http://localhost:5173  
**Tester:** Hema Rajanna  
**Date:** ___________

---

## 1. Landing Page

- [ ] Page loads with CareerPulse logo (Activity/pulse icon)
- [ ] Headline: "Track every application. Land the role you deserve."
- [ ] Badges visible: 100% Local, Zero Cloud, AI-Powered
- [ ] Feature pills visible: Kanban Pipeline, AI Resume Coach, Interview Prep, Smart Analytics
- [ ] Name input field is auto-focused
- [ ] Typing a name in the field works
- [ ] Pressing Enter key triggers login
- [ ] "Enter CareerPulse" button is visible and clickable

---

## 2. Welcome Splash

- [ ] After clicking Enter CareerPulse, a full-screen dark splash appears
- [ ] CareerPulse logo icon animates (bounces in)
- [ ] "Welcome, [name]!" appears with purple-blue gradient on the name
- [ ] Progress bar animates left to right under the message
- [ ] Subtitle "Your career dashboard is ready." is visible
- [ ] Splash automatically disappears after ~2 seconds
- [ ] If no name entered: shows "Welcome, there!"

---

## 3. Dashboard

- [ ] Dashboard loads after the welcome splash
- [ ] Stat cards visible at the top (Total, Active, Interviews, Offers)
- [ ] Numbers in stat cards reflect the seed jobs
- [ ] Recent applications list is populated with QA-relevant seed jobs
- [ ] Sidebar navigation is visible on the left
- [ ] Header is visible at the top

### Seed Data Verification (QA Roles)
- [ ] Anthropic — Senior SDET
- [ ] Vercel — QA Automation Lead
- [ ] Stripe — Automation Test Engineer
- [ ] Linear — QA Engineer
- [ ] Cloudflare — Senior QA Automation Engineer
- [ ] Netflix — Staff SDET
- [ ] Figma — Automation QA Engineer
- [ ] Slack — QA Lead

---

## 4. Pipeline (Kanban View)

- [ ] Click "Pipeline" in sidebar → Kanban board loads
- [ ] All 8 status columns visible: Saved, Submitted, Phone Screen, Interview, Offer, Accepted, Rejected, Withdrawn
- [ ] Job cards appear in correct columns based on seed data status
- [ ] Job card shows company name and role
- [ ] Drag a card from one column to another — card moves
- [ ] Toast notification appears: "Moved to [status]"
- [ ] Moving to Offer → confetti animation fires
- [ ] Moving to Accepted → confetti animation fires

---

## 5. Directory (Table View)

- [ ] Click "Directory" in sidebar → table view loads
- [ ] Columns visible: Company, Role, Status, Date Applied, Salary, etc.
- [ ] All 8 seed jobs appear as rows
- [ ] Click on a row → Edit modal opens
- [ ] Search/filter bar works (if present)
- [ ] Sort columns by clicking headers (if supported)

### Bulk Actions
- [ ] Checkbox appears on each row (or on hover)
- [ ] Select one job → bulk action bar appears at bottom
- [ ] Select multiple jobs → bulk action bar shows count
- [ ] Bulk Move button works
- [ ] Bulk Delete button works (shows confirm prompt)

---

## 6. Add New Job

- [ ] Click "+" or "Add Application" button (header or dashboard)
- [ ] Modal opens with empty form
- [ ] Fill in: Company, Role, Status, Date Applied
- [ ] Optional fields: Salary, Location, Job URL, Notes, Follow-up date
- [ ] Status dropdown shows all 8 stages
- [ ] Click Save → modal closes
- [ ] New job appears in Dashboard and Directory
- [ ] Toast: "Added [Company] — [Role]"

---

## 7. Edit Existing Job

- [ ] Open edit modal for any job (click row in Directory or card in Pipeline)
- [ ] All previously saved fields are pre-filled
- [ ] Can update any field
- [ ] STATUS TIMELINE section shows history of status changes
- [ ] COVER LETTER section is visible at the bottom of the modal
- [ ] If cover letter saved: green "SAVED" badge shows
- [ ] Copy button copies cover letter text
- [ ] Clear button clears the saved cover letter
- [ ] Save button updates the job
- [ ] Toast: "Application updated"

---

## 8. Calendars

- [ ] Click "Calendars" → calendar view loads
- [ ] Jobs with follow-up dates appear on the calendar
- [ ] Can navigate months (prev/next arrows)
- [ ] Clicking a date shows jobs for that date

---

## 9. Analytics & Funnels

- [ ] Click "Analytics & Funnels" → charts load
- [ ] Funnel chart shows application pipeline counts
- [ ] Status distribution chart visible
- [ ] Application timeline chart visible
- [ ] Numbers match the actual job data

---

## 10. Resume Studio

- [ ] Click "Resume Studio" in sidebar
- [ ] Two tabs: Skill Profile and Master Resume (or similar layout)
- [ ] Skill Profile tab shows pre-filled QA skills:
  - Selenium, Playwright, TestNG, Java, Python, RestAssured, Cypress, Appium, CI/CD, Docker, AWS, BDD, Cucumber, API Testing, k6
- [ ] Can edit and save skill profile
- [ ] Master Resume tab has large textarea for resume content
- [ ] AI assistant button available to enhance content

---

## 11. Interview Prep

- [ ] Click "Interview Prep" in sidebar
- [ ] Page loads with interview question categories
- [ ] Can select a topic/category
- [ ] AI-generated questions appear (if AI provider connected)
- [ ] Questions relevant to QA/Automation engineering

---

## 12. Job Discovery

- [ ] Click "Job Discovery" in sidebar
- [ ] Search interface is visible
- [ ] Can enter job title and location
- [ ] Results load (requires internet/AI connection)

---

## 13. Cover Letter Generator

- [ ] Click "Cover Letter Gen" in sidebar
- [ ] Two-panel layout: left = editable textarea, right = AI panel
- [ ] Job selector dropdown shows all tracked jobs
- [ ] Select a job → job details auto-populate
- [ ] Click Generate button (with spinner while loading)
- [ ] Generated cover letter appears in the LEFT textarea (editable)
- [ ] Can manually edit the generated text
- [ ] "Save to Application" button saves cover letter to the selected job
- [ ] Toast: success message after save
- [ ] Going to edit modal for that job → Cover Letter section shows the saved text

---

## 14. Settings — AI Providers

- [ ] Click "Settings & Backup" in sidebar
- [ ] AI Providers section visible
- [ ] Provider cards: Groq, Gemini, OpenRouter, Mistral, OpenAI, Claude
- [ ] Each card shows: provider name, model dropdown, API key input
- [ ] Free badge on Groq and Gemini
- [ ] Groq default model: llama-3.3-70b-versatile (NOT gemma2-9b-it)
- [ ] Paste API key → Save → toast "Groq connected"
- [ ] Connected provider shows green indicator
- [ ] Can switch between connected providers

---

## 15. Settings — Notifications & Alerts

- [ ] Notifications card visible in Settings
- [ ] Browser Notifications panel:
  - [ ] "Enable Browser Alerts" button works
  - [ ] Browser permission prompt appears
  - [ ] After granting: button shows "Disable" or green state
  - [ ] If permission denied: warning message shows
- [ ] Email Notifications panel:
  - [ ] Email input field accepts email address
  - [ ] "EmailJS Config" collapsible section opens
  - [ ] Service ID, Template ID, Public Key fields visible
  - [ ] Enable Email Alerts button works
- [ ] Alert Types section:
  - [ ] Follow-up Reminders checkbox
  - [ ] Interview Alerts checkbox
  - [ ] Offer Notifications checkbox
- [ ] Save Notification Settings button works
- [ ] Send Test Notification button:
  - [ ] Browser popup fires (if browser enabled)
  - [ ] Email arrives (if email configured)

---

## 16. Settings — Data Management

- [ ] Export Data button → downloads JSON file named `jobcommand-backup-[date].json`
- [ ] Import Data button → file picker opens → can import JSON
- [ ] Clear All Data button → confirmation dialog appears → clears IndexedDB → jobs disappear
- [ ] After Clear + Refresh → seed data reloads

---

## 17. Theme Studio

- [ ] Click "Theme Studio" in sidebar bottom
- [ ] Panel slides in from right
- [ ] Multiple theme options visible (at least 15)
- [ ] Clicking a theme immediately applies it to the whole app
- [ ] Dark themes visible (default is dark)
- [ ] Light themes visible
- [ ] Colorful/gradient themes visible
- [ ] Close button closes the panel

---

## 18. AI Assistant Panel

- [ ] Click "AI Assistant" in sidebar bottom
- [ ] Panel slides in from the right side of the screen
- [ ] Chat interface with input box at bottom
- [ ] Can type a message and press Enter or click Send
- [ ] AI responds (requires connected provider)
- [ ] Provider selector visible at top of panel
- [ ] Panel closes when clicking × or clicking outside

---

## 19. Real-time Offer Notification

- [ ] Ensure browser notifications are enabled in Settings
- [ ] Go to Pipeline view
- [ ] Drag any job card to the "Offer" column
- [ ] Confetti fires immediately
- [ ] Desktop browser notification appears immediately (not on next day)
- [ ] Email arrives (if EmailJS configured) within 30 seconds
- [ ] Toast: "Moved to Offer"

---

## 20. Cross-feature Checks

- [ ] Data persists after page refresh (F5)
- [ ] Data persists after closing and reopening the browser tab
- [ ] Switching between all sidebar views works without errors
- [ ] No console errors (F12 → Console tab)
- [ ] App works on 1280×720 viewport
- [ ] App works on 1920×1080 viewport
- [ ] All toast notifications auto-dismiss after ~3.5 seconds

---

## Bug Log

| # | Feature | Bug Description | Severity | Fixed? |
|---|---------|-----------------|----------|--------|
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |

---

## Test Summary

| Section | Pass | Fail | Skip |
|---------|------|------|------|
| Landing + Welcome | | | |
| Dashboard | | | |
| Pipeline | | | |
| Directory | | | |
| Add/Edit Job | | | |
| Calendars | | | |
| Analytics | | | |
| Resume Studio | | | |
| Interview Prep | | | |
| Job Discovery | | | |
| Cover Letter Gen | | | |
| Settings — AI | | | |
| Settings — Notifications | | | |
| Settings — Data | | | |
| Theme Studio | | | |
| AI Panel | | | |
| Offer Notification | | | |
| **TOTAL** | | | |
