# RICE-POT Prompt — Ultimate AI Job Career Command Center
> A comprehensive prompt to build the most advanced, professional, AI-powered Job
> Application Tracker that beats every existing tool. Built on the RICE-POT framework.
> Uses React + TypeScript + Tailwind CSS + Framer Motion for a truly outstanding UI.
> Copy the prompt section into Claude or any AI tool.

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

## Competitor Analysis Summary
> Based on screenshots of two tools reviewed side-by-side:

### Competitor Strengths (AIJobTracker at Vercel)
- Real landing/sign-in page with tagline and trust badges
- Audit Log Timeline on dashboard
- Monthly Goal tracker with progress bar
- Calendar view with "Join Meet" links per interview
- Master Resume feed in settings (feeds AI automatically)
- Recruitment conversion funnel with detailed sourcing table
- Pipeline Priority Load chart
- ATS Yield Tips panel

### Your Current Tool Strengths
- Dark mode with gradient-accented stat cards
- Theme Studio (5 tabs: Colors/Styles/Image/Font/Layout)
- Multi-provider AI Assistant (Groq/Gemini/OpenRouter/Mistral/OpenAI/Claude)
- Salary Min/Max split with currency selector (INR/USD/GBP)
- Structured contact fields (Name/Role/Email/Phone)
- Source effectiveness + Salary distribution charts
- Follow-ups Due card + Active Pipeline metric
- Kanban board with priority dots

### What Neither Tool Has (Your Opportunity)
- Resume builder and analyzer
- Interview preparation module
- Job discovery / search integration
- Application health score
- Status timeline per entry
- Skill gap analysis
- Cover letter generator
- Company insights (Glassdoor, funding, culture)
- Confetti on Offer/Accepted
- Onboarding tour

---

## THE PROMPT (copy from here)

### R — Role
You are a **world-class senior full-stack engineer and UI/UX designer with 15+ years of
experience** building elite, award-winning SaaS dashboards. You have shipped products at
Linear, Vercel, and Notion. You specialize in:
- **React 18 + TypeScript + Vite** for type-safe, scalable architecture
- **Tailwind CSS + Framer Motion** for fluid, premium animations
- **shadcn/ui + Radix UI** for accessible, polished component primitives
- **Zustand** for bulletproof state management
- **Recharts + D3** for interactive data visualization
- **@dnd-kit** for smooth drag-and-drop
- **IndexedDB via idb** for robust local persistence

You do NOT build plain HTML/CSS/JS tools. You build React apps that look and feel like
Linear, Vercel, or Superhuman — pixel-perfect, fast, and memorable.

---

### I — Instructions

Build the **Ultimate AI Career Command Center** — a single-page React app that is the
most advanced, beautiful, and feature-complete job application tracker ever built.
It must visually and functionally beat every competitor including:
- `ai-job-tracker-mu-orpin.vercel.app`
- Any spreadsheet or Notion-based tracker
- Any paid SaaS tracker

---

#### SECTION 1: Tech Stack (mandatory)

```
Framework:       React 18 + TypeScript + Vite
Styling:         Tailwind CSS (CSS-variable theming for live Theme Studio)
Animation:       Framer Motion (page transitions, card reveals, micro-interactions)
Components:      shadcn/ui + Radix UI (modals, tooltips, dropdowns, popovers)
State:           Zustand with persist middleware (IndexedDB via idb)
Charts:          Recharts (funnel, bar, line, donut, salary histogram)
Drag-Drop:       @dnd-kit/core + @dnd-kit/sortable
Icons:           lucide-react
Dates:           date-fns
Utilities:       clsx, tailwind-merge
AI Calls:        Native fetch to provider APIs (keys stored only in browser)
```

**Do NOT use:** plain HTML/CSS/JS, jQuery, Bootstrap, Material UI, Create React App,
class components, or any deprecated library.

---

#### SECTION 2: Navigation Structure

Build a **left sidebar navigation** (like Linear/Vercel) with these sections:

```
MAIN
  Dashboard          (overview + metrics)
  Application Pipeline  (Kanban board)
  Directory Index    (table view)
  Calendars          (schedule + reminders)
  Analytics & Funnels (charts + insights)

CAREER TOOLS
  Resume Studio      (builder + AI analyzer)
  Interview Prep     (question bank + AI coach)
  Job Discovery      (search + bookmark roles)
  Cover Letter Gen   (AI-powered generator)

SETTINGS
  AI Assistant       (provider config + master resume)
  Theme Studio       (full visual customization)
  Profile & Backup   (goals + export/import)
```

Each section is a full page with its own layout and features described below.

---

#### SECTION 3: Landing / Sign-In Page

Build a **split-screen landing page** (shown before the app) with:

**Left panel (dark, branded):**
- App logo + name: "CareerOS" or "JobCommand"
- Bold hero headline: "Your AI-powered command center for the career climb."
- 3 trust badges: "100% Local · Zero Cloud · AI-Powered"
- Feature highlights: Kanban pipeline · Resume AI · Interview Coach · Smart Analytics
- Animated gradient background (Framer Motion)

**Right panel (white/light):**
- "Sign in" with a username input (local profile, no server needed)
- "Create new profile" link
- Profiles stored in IndexedDB
- After auth: animated transition into the dashboard

---

#### SECTION 4: Dashboard

**Stat cards row (responsive grid, 5 per row on desktop):**
- Total Applications · Saved · Submitted · Interviews
- Interview Rate (%) · Offers · Rejected · Follow-ups Due · Active Pipeline

Each card has:
- Colored gradient top-border accent
- Animated count-up number on load (Framer Motion)
- Relevant lucide icon
- Subtitle explaining the metric

**Below cards — two columns:**

LEFT (main, 65%):
- **Status Pipeline Distribution** — horizontal bar chart with %, counts, and color per status
- **Pipeline Velocity** — bar chart: applications added per week
- **Monthly Goal Tracker** — target vs actual with animated progress bar and emoji celebration

RIGHT (sidebar, 35%):
- **Audit Log Timeline** — every status change with timestamp, animated slide-in
- **Follow-ups Due Today** — list of overdue entries with one-click "Mark Done"
- **ATS Tips** — rotating AI tips for improving response rate

---

#### SECTION 5: Application Pipeline (Kanban)

Full-width Kanban board with:

**Columns (exact statuses):**
`Saved → Submitted → Phone Screen → Interview → Offer → Accepted → Rejected → Withdrawn`

**Each card shows:**
- Company favicon (auto-fetched from job URL domain)
- Company name + Role title (truncated)
- Priority dot: 🔴 High / 🟡 Medium / 🟢 Low / 🔥 Urgent
- Tech stack tags (e.g. React, TypeScript)
- Location with pin icon
- Salary (correctly abbreviated: ₹45L or $120k)
- Applied date
- Follow-up date (turns red + pulsing if overdue)
- Interview round badge if status = Interview (R1 / R2 / Final)
- Hover: reveal action buttons (Edit · AI Draft · Delete)

**Column features:**
- Count badge per column
- "+ Add role" button per column
- Drop highlight when dragging over
- Drag-drop with @dnd-kit updates status in store + logs to audit trail

**Card interactions:**
- Click → open detail drawer (right side-panel, not a modal)
- Double-click → open edit modal
- ✨ button → AI context menu (draft email, cover letter, prep questions)

---

#### SECTION 6: Directory Index (Table View)

Full-featured table with:

**Columns:**
Company · Role · Location · Status · Applied · Salary · Source ·
Follow-up · Contact · URL · Notes · Priority · Actions

**Features:**
- Header checkbox → select all visible rows
- Multi-select with bulk action bar (brand color, NOT red):
  - "N selected · Move to ▾ · Export ↓ · Delete 🗑 · Clear ×"
  - Delete requires confirmation modal
  - `Cmd+A` select all · `Esc` clear · `Delete` key = bulk delete
- Inline status change (dropdown in cell, no modal needed)
- Salary sorted numerically (not lexicographically)
- Overdue follow-up dates highlighted in red
- Notes: truncated with full tooltip on hover
- Source filter chips row (All · LinkedIn · Referral · Indeed · Naukri · etc.)
- Column sort on click (arrows showing sort direction)
- CSV + Excel export of visible/selected rows

---

#### SECTION 7: Calendars

Full month calendar view with:
- Interview events placed on correct dates (color-coded by company)
- Follow-up reminders on correct dates
- Click a date → see all events for that day
- "Join Meet" / "Join Zoom" link on each interview card (from entry's URL)
- Right sidebar: **Active Schedulers** panel listing upcoming events chronologically
- Event types: Technical Round · Manager Round · HR Round · Follow-up · Deadline
- "Add Event" button to manually add reminders

---

#### SECTION 8: Analytics & Funnels

Four chart panels in a 2×2 grid:

1. **Recruitment Conversion Funnel** (horizontal bar):
   - Submitted → Follow-up (60%) → Interviews (47%) → Offers (13%)
   - Labels: "Base-line Search Level" / "Outreach Frequency" / "Interview Yield Rate" / "Final Deals"

2. **Applications Per Week** (bar chart):
   - Weekly application velocity over past 12 weeks

3. **Sourcing Channel Yield** (table + bar):
   - Per source: Total Applications · Interview Invites · Interview Conversion Rate %
   - Color-coded rate bar (green = high, red = low)

4. **Salary Distribution** (histogram):
   - Distribution of salary ranges across all applications

**Right sidebar:**
- **Pipeline Priority Load** — Urgent/High/Medium/Low counts + bar
- **ATS Yield Tips** — AI-powered contextual advice

**Math rules (CRITICAL — fixes the 100% source bug):**
- Interview rate per source = (entries with status ≥ Phone Screen from that source) ÷ (total from that source) × 100
- Never show 100% if sample size < 3 — show "Insufficient data" instead
- All analytics read from the same Zustand store as the rest of the app

---

#### SECTION 9: Resume Studio

A full resume management section:

**Tab 1 — My Resumes:**
- Upload PDF resumes (stored in IndexedDB as base64)
- View, rename, delete resumes
- "Active Resume" toggle (used by AI tools automatically)
- Last used / last updated timestamp

**Tab 2 — AI Resume Analyzer:**
- Paste a job description
- AI compares it against the active resume
- Output: Match score (%) · Matching skills · Missing skills · Suggested improvements
- "Fix it for me" → AI rewrites the resume section targeting the JD

**Tab 3 — Skill Profile:**
- User defines their skills (comma-separated or tag input)
- Used by skill gap analysis across all applications

---

#### SECTION 10: Interview Prep

**Tab 1 — Question Bank:**
- Per-company/role question list tied to each application
- Question types: Behavioral · Technical · System Design · Culture Fit
- Mark questions: Practiced ✓ / Needs Work ⚠ / Not Started ○
- Add custom questions per entry

**Tab 2 — AI Coach:**
- Select an application → AI generates:
  - 10 likely interview questions for that specific role
  - STAR story prompts for behavioral questions
  - System design topics based on the tech stack tags
  - "Questions to ask the interviewer"
- Powered by the connected AI provider

**Tab 3 — Interview Checklist:**
- Reusable checklist per interview:
  - Research company ✓
  - Prepare STAR stories ✓
  - Test tech setup ✓
  - Prepare questions to ask ✓
  - Send thank-you note (post-interview reminder)

---

#### SECTION 11: Job Discovery

**Search interface:**
- Search bar: "Search roles, companies, or keywords"
- Source filter chips: LinkedIn · Indeed · Naukri · GitHub Jobs · AngelList
- AI-powered search: describe the role you want → AI generates search keywords

**Bookmarked Roles:**
- Save jobs from browsing (manual add with URL + notes)
- One-click "Apply" → converts bookmark to a Submitted application entry

**Job Description Parser:**
- Paste raw JD text or URL
- AI extracts: Required skills · Years of experience · Salary range · Location · Role summary
- Pre-fills the Add Application modal fields automatically

---

#### SECTION 12: Cover Letter Generator

- Select an application from a dropdown
- AI reads: company, role, JD text (from entry), notes, master resume
- Generates a tailored cover letter in seconds
- Tone selector: Professional · Enthusiastic · Concise · Creative
- Edit inline before copying/downloading
- Save to the application entry

---

#### SECTION 13: AI Assistant (Settings)

Right slide-in panel (resizable, pushes content left — does NOT overlap):

**Provider config:**
- Groq (FREE) · Gemini (FREE) · OpenRouter (FREE) · Mistral (FREE) · OpenAI (PAID) · Claude (PAID)
- API keys stored only in browser (IndexedDB), never sent to any server
- "Key stays in your browser. Never shared." trust badge
- Model selector per provider

**After connecting — Seeded prompts:**
- "Draft a follow-up email for [Company]"
- "Write a cover letter for this role"
- "Help me prep for my [Role] interview at [Company]"
- "Summarize this job description into key requirements"
- "What salary should I ask for this role in [Location]?"

**Context-aware per-entry actions (✨ button on every row/card):**
- Draft follow-up email (auto-reads: contact name, role, next action, company)
- Generate cover letter (auto-reads: company, role, JD text, notes)
- Interview prep (generates questions for that specific role)
- Salary benchmark (suggests range for role + location)

**Master Resume Feed:**
- Paste resume text once
- All AI tools read it automatically — no re-uploading per action

---

#### SECTION 14: Theme Studio

Trigger via the palette icon in the header. Full-screen modal with 5 tabs:

**Tab 1 — Colors:**
- 15 gradient presets: Default · Sunset · Ocean · Forest · Galaxy · Aurora · Rose ·
  Midnight · Candy · Arctic · Earth · Citrus · Lava · Mint · Slate
- Hover to preview live on the blurred app behind the modal
- Click to apply (sets CSS variables instantly)
- "Reset to default" link

**Tab 2 — Styles:**
- 5 UI modes with preview thumbnails:
  - Default (Glass + Gradient)
  - Cartoon (Bold + Comic — thick borders, bright fills)
  - Classic (Clean + Professional — flat, minimal)
  - Neon (Cyber + Glow — dark with glowing accents)
  - Retro (Terminal + Pixel — monospace, scanlines)
- Neon and Retro show: ⚠ "High contrast — best for personal use"

**Tab 3 — Image:**
- Upload a custom background image (URL or file upload)
- **Opacity slider** (0–100%) — prevents image from making data unreadable
- **Blur slider** (0–20px) — frosted glass effect behind content
- Live preview before applying

**Tab 4 — Font:**
- Display font: Inter · Poppins · Playfair Display · Space Grotesk · DM Sans
- Body font: Inter · Roboto · Source Sans · IBM Plex Sans
- Mono font (for data/code): JetBrains Mono · Fira Code · Cascadia Code

**Tab 5 — Layout:**
- Density: Compact · Comfortable · Spacious
- Sidebar: Collapsed icons only · Full labels · Hidden
- Cards: Rounded (default) · Sharp · Pill

---

#### SECTION 15: Profile & Backup (Settings)

**Tracker Parameters:**
- Target Applications Goal (monthly) — drives the dashboard progress bar
- Dark/Light mode toggle
- Default currency (INR / USD / GBP) — applied to all new entries

**Dump / Restore Database:**
- "Export Data Backup (.json)" — full IndexedDB dump
- "Restore / Import Backup" — re-import a JSON backup
- "Export & Wipe" — download + clear all data

**Account Control:**
- "Sign out of Profile" — return to landing page
- Multiple profiles supported (different job searches)

---

#### SECTION 16: Add / Edit Application Modal

**Trigger:** "+ Add Application" button or clicking any entry

**Layout:** Scrollable modal with sticky header + footer, section-grouped

**Section 1 — JOB DETAILS:**
- Company * (autofocus, autofetch favicon from URL)
- Role / Title *
- Status (default: Submitted)
- Location
- Currency selector + Salary Min + Salary Max
  - Helper: "Enter annual number e.g. 700000 for ₹7L"
- Job Type (default: Full-time)
- Priority (default: Medium)
- Tech Stack Tags (comma-separated chips)

**Section 2 — TRACKING:**
- Source (dropdown: LinkedIn/Referral/Indeed/Naukri/Company Site/Other)
- Application Date (default: today in YYYY-MM-DD)
- Next Action
- Follow-up Date
- Interview Round (only shown when Status = Interview):
  - Options: Phone Screen · Round 1 · Round 2 · Final · Panel
- Job Posting URL (validated: must start with http/https)
- Job Description Full Text (paste JD → unlocks AI matching)

**Section 3 — CONTACT & NOTES (collapsible, optional):**
- Contact Name
- Contact Role (Recruiter / HR / Hiring Manager / Referrer)
- Contact Email (click-to-email)
- Contact Phone (click-to-call)
- Notes (textarea)

**Validation (real-time on blur, not just on submit):**
- Company and Role are required
- URL must start with http:// or https://
- Salary Min must be ≤ Salary Max
- Block placeholder entries (single-char or "test" in Company/Role)
- Warn if Application Date is in the future

**Keyboard:** `Cmd/Ctrl+Enter` = save · `Esc` = close · Tab order logical

---

#### SECTION 17: Data Model

Each application entry stores:

```typescript
interface Job {
  id: string;
  createdAt: string;           // ISO date

  // Job Details
  company: string;
  role: string;
  location: string;
  status: Status;
  priority: 'High' | 'Medium' | 'Low' | 'Urgent';
  jobType: 'Full-time' | 'Contract' | 'Internship' | 'Part-time';
  currency: 'INR' | 'USD' | 'GBP';
  salaryMin: number | '';
  salaryMax: number | '';
  tags: string[];              // tech stack chips

  // Tracking
  source: string;
  appliedDate: string;         // YYYY-MM-DD
  nextAction: string;
  followUpDate: string;        // YYYY-MM-DD
  interviewRound: string;
  url: string;
  jdText: string;              // full job description for AI

  // Contact
  contactName: string;
  contactRole: string;
  contactEmail: string;
  contactPhone: string;

  // Notes & history
  notes: string;
  history: { status: Status; at: string }[]; // audit trail
  coverLetter: string;         // AI-generated, saved per entry
}
```

---

#### SECTION 18: Salary Formatting (CRITICAL BUG FIX)

The INR scaling bug ("₹7k" instead of "₹7L") must be fixed permanently:

```typescript
function formatSalary(amount: number, currency: string): string {
  if (currency === 'INR') {
    if (amount >= 10_000_000) return `₹${(amount/10_000_000).toFixed(1)}Cr`;
    if (amount >= 100_000)   return `₹${(amount/100_000).toFixed(1)}L`;
    if (amount >= 1_000)     return `₹${(amount/1_000).toFixed(0)}k`;
  }
  if (currency === 'USD') {
    if (amount >= 1_000_000) return `$${(amount/1_000_000).toFixed(1)}M`;
    if (amount >= 1_000)     return `$${(amount/1_000).toFixed(0)}k`;
  }
  return `${amount}`;
}
```

Always feed the **full annual number** (e.g. 700000) — NEVER a pre-abbreviated string.

---

#### SECTION 19: Analytics Math (CRITICAL BUG FIX)

Source effectiveness must NEVER show 100% for small samples:

```typescript
function sourceInterviewRate(jobs: Job[], source: string): string {
  const total = jobs.filter(j => j.source === source).length;
  if (total < 3) return 'Insufficient data';
  const interviewed = jobs.filter(j =>
    j.source === source &&
    statusOrder(j.status) >= statusOrder('Phone Screen') &&
    !['Rejected', 'Withdrawn'].includes(j.status)
  ).length;
  return `${Math.round((interviewed / total) * 100)}%`;
}
```

All analytics, dashboard counts, and funnel charts must read from the **same Zustand store**
so numbers never disagree between views.

---

#### SECTION 20: Outstanding UI Moments

These are the interactions that make this tool unforgettable:

- **Confetti burst** (canvas-confetti) when any entry moves to "Offer" or "Accepted"
- **Animated count-up** on all dashboard numbers on first load (Framer Motion)
- **Card flip animation** on Kanban when dragging starts
- **Smooth page transitions** between sidebar sections (Framer Motion layoutId)
- **Pulse animation** on overdue follow-up dates in table and Kanban
- **Streak indicator** on dashboard: "🔥 5-day application streak!"
- **Celebration banner** on Monthly Goal achievement: "🎉 You hit your June goal!"
- **Skeleton loaders** while IndexedDB hydrates
- **Toast notifications** for every action (add/edit/delete/move/export)
- **Empty state illustrations** per section with clear CTAs

---

### Mandatory "Don't" Rules

- Do **NOT** build in plain HTML/CSS/JS — use React + TypeScript + Tailwind only
- Do **NOT** use red for neutral states (selection count, info badges) — red = destructive only
- Do **NOT** let any popover/dropdown/modal have a transparent background — always solid + shadow + z-index
- Do **NOT** mix salary display formats — use the centralized formatter everywhere
- Do **NOT** show source effectiveness at 100% for samples < 3 — show "Insufficient data"
- Do **NOT** pre-fill junk/test data ("aloo", "aba", "uio", "sd") — seed realistic entries only
- Do **NOT** let the AI panel overlap content — it must push the main content left
- Do **NOT** require backend, login server, or any cloud service — everything is local-first
- Do **NOT** store API keys in plain localStorage — use IndexedDB with encryption
- Do **NOT** use heavy UI libraries (Material UI, Ant Design, Bootstrap) — shadcn/ui only
- If any requirement is **ambiguous → STOP and ask first.** Do not guess.

---

### C — Context

**Who:** A software engineer or tech professional actively managing 20–100+ job applications
across multiple companies, roles, and stages — based in India and/or targeting global roles.

**Pain points being solved:**
- Applications scattered across email, Notion, spreadsheets, with missed follow-ups
- No insight into which job sources (LinkedIn vs Referral) actually work
- No AI help drafting follow-up emails or prepping for interviews
- No central place for resume management and skill gap analysis
- Existing tools (spreadsheets, paid SaaS) either lack AI or charge monthly fees

**Why this beats the competition:**
- `ai-job-tracker-mu-orpin.vercel.app` has a calendar and audit log but no Resume Studio,
  Interview Prep, Job Discovery, Cover Letter Gen, or Theme Studio
- Paid tools (Teal, Huntr) charge $20+/month and have no local-first data model
- This tool is 100% free, 100% local, and more feature-complete than anything that exists

---

### E — Example

**Kanban card should look like:**
```
┌─────────────────────────────────────────┐
│ [A] Anthropic          🔴 HIGH · React  │
│ Frontend Engineer                        │
│ 📍 San Francisco, CA  💰 $180k–$230k   │
│ 📅 2026-05-20 · LinkedIn                │
│ 🎯 Round 2 Interview                    │
│ ▶ Send thank-you · 2026-06-15 ⚠️       │
│                          ✏️  ✨  🗑️   │
└─────────────────────────────────────────┘
```

**Dashboard goal tracker:**
```
MONTHLY GOAL — June 2026
████████████████████░░░░  12 of 10 applied — 120% 🎉
```

**Audit log entry:**
```
● Shifted Anthropic → "Offer" via Kanban drag
  Jun 14, 2026 at 3:01 PM
```

---

### P — Parameters

**Quality bar:**
- Working app on first response — no TODOs, stubs, or placeholder functions
- Every page, button, modal, chart, and animation must work end-to-end
- Fully keyboard-navigable (Tab, Enter, Esc, Cmd+Enter)
- WCAG AA contrast on all text
- Responsive: 360px (mobile) to 2560px (ultrawide)
- Skeleton loaders while data hydrates from IndexedDB
- Toast notifications for every mutating action
- Empty states with CTAs for every section

**Seed data (realistic, NOT junk):**
Use entries from: Linear, Figma, Stripe, Vercel, Anthropic, Cloudflare, Google, Slack,
Netflix, OpenAI, ByteDance — with realistic salaries, dates, statuses across all pipeline
stages.

**Date format:** Always YYYY-MM-DD in storage, display as "Jun 14, 2026" in UI.

**Salary format:** Always store as full integer (700000), display as abbreviated (₹7L / $120k).

---

### O — Output

A **complete, runnable React + TypeScript + Vite project** structured as:

```
src/
├── main.tsx
├── App.tsx
├── index.css                  # Tailwind + CSS theme variables
├── types/index.ts             # All TypeScript interfaces
├── store/useStore.ts          # Zustand store (single source of truth)
├── lib/
│   ├── constants.ts           # Statuses, sources, currencies, priorities
│   ├── format.ts              # Salary/date formatters (INR fix)
│   └── db.ts                  # IndexedDB via idb
├── data/seed.ts               # Realistic starter data
├── hooks/
│   ├── useAI.ts               # AI provider abstraction
│   └── useTheme.ts            # Theme Studio state
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx        # Left nav with all sections
│   │   ├── Header.tsx         # Top bar with view tabs + controls
│   │   └── Toast.tsx          # Toast notification system
│   ├── dashboard/
│   │   ├── StatCards.tsx
│   │   ├── PipelineDistribution.tsx
│   │   ├── VelocityChart.tsx
│   │   ├── MonthlyGoal.tsx
│   │   └── AuditLog.tsx
│   ├── kanban/
│   │   ├── KanbanBoard.tsx
│   │   ├── KanbanColumn.tsx
│   │   └── KanbanCard.tsx
│   ├── table/
│   │   ├── DirectoryIndex.tsx
│   │   ├── FilterBar.tsx
│   │   └── BulkActionBar.tsx
│   ├── calendar/
│   │   └── CalendarView.tsx
│   ├── analytics/
│   │   ├── ConversionFunnel.tsx
│   │   ├── SourceEffectiveness.tsx
│   │   ├── SalaryDistribution.tsx
│   │   └── VelocityChart.tsx
│   ├── resume/
│   │   ├── ResumeStudio.tsx
│   │   └── ResumeAnalyzer.tsx
│   ├── interview/
│   │   ├── InterviewPrep.tsx
│   │   └── AICoach.tsx
│   ├── jobs/
│   │   └── JobDiscovery.tsx
│   ├── coverletter/
│   │   └── CoverLetterGen.tsx
│   ├── modal/
│   │   ├── AddEditModal.tsx
│   │   └── ConfirmModal.tsx
│   ├── ai/
│   │   └── AIPanel.tsx
│   └── theme/
│       └── ThemeStudio.tsx
└── pages/
    ├── Landing.tsx            # Sign-in / profile select
    ├── Dashboard.tsx
    ├── Pipeline.tsx
    ├── Directory.tsx
    ├── Calendars.tsx
    ├── AnalyticsFunnels.tsx
    ├── ResumeStudioPage.tsx
    ├── InterviewPrepPage.tsx
    ├── JobDiscoveryPage.tsx
    ├── CoverLetterPage.tsx
    └── Settings.tsx
```

After the code, provide **5–8 bullet points** listing:
- What was built
- Assumptions made
- Any deferred items with rationale

---

### T — Tone

Opinionated, precise, and premium. Every default is deliberate. Every empty state has
direction. Every interaction has feedback. Build as if this is going in your portfolio
and a hiring manager at Linear will review it.

---

## Build Order (if phasing the work)

| Phase | What to build | Est. time |
|---|---|---|
| 1 | Types + Store + Constants + Formatters + Seed data | ½ day |
| 2 | Landing page + Sidebar layout + Header + Toast | ½ day |
| 3 | Dashboard (stat cards + charts + audit log + monthly goal) | 1 day |
| 4 | Directory Index (table + filters + bulk actions) | 1 day |
| 5 | Add/Edit Modal (all sections + validation + defaults) | 1 day |
| 6 | Kanban Pipeline (drag-drop + cards + detail drawer) | 1 day |
| 7 | Analytics & Funnels (all 4 charts + priority load) | 1 day |
| 8 | AI Assistant panel (providers + context-aware actions) | 1 day |
| 9 | Resume Studio + Interview Prep + Job Discovery + Cover Letter | 2 days |
| 10 | Calendar view + Theme Studio + Profile/Backup | 1.5 days |
| 11 | Polish: animations, confetti, toasts, empty states, mobile | 1 day |

**Total: ~11 days for the most advanced job tracker ever built.**

---

## Notes on Using This Prompt

- **Anti-hallucination guard:** the "Don't" rules block the most common failures seen
  in prior builds — junk seed data, transparent popovers, red for neutral states,
  salary format drift, analytics math bugs, AI panel overlapping content.
- **The salary formatter and source-rate guard** (Section 18 & 19) are non-negotiable.
  These were real bugs in the previous build and must be fixed structurally, not patched.
- **AI is context-aware, not generic.** The ✨ button reads the actual entry data —
  company, role, contact, JD text, notes — before calling the AI. This is the biggest
  differentiator vs every other tool.
- **IndexedDB over localStorage** because resumes (base64 PDFs) and large JD texts
  will exceed localStorage's 5MB limit.
- **TypeScript is mandatory** — not optional. It prevents the class of data-shape bugs
  that caused the salary/analytics issues in the vanilla HTML version.
