# CareerPulse — AI-Powered Job Tracker

A full-featured job application tracker built with React 18, TypeScript, and Vite. Track every stage of your job search, prep for interviews with AI, and never lose a lead.

**Live app:** https://careerpulse-tracker.vercel.app

---

## Features

### Job Pipeline
- Kanban-style pipeline across 8 statuses: Saved → Submitted → Phone Screen → Interview → Offer → Accepted / Rejected / Withdrawn
- Add/edit jobs with full details: company, role, salary range, tags, source, contact info, JD text, resume upload
- Status history with timestamps and notes
- Priority, job type, currency — all configurable
- Follow-up date and next action reminders

### Interview Preparation
- **Question Bank** — per company/role buckets; import CSV/JSON/TXT/Markdown; export with STAR columns
- **Mock Interview Mode** — shuffled sessions, question hidden until revealed, 1–5 rating per answer, optional countdown timer (30s–3min), session summary with weakest questions
- **AI Coach** — generates 10 role-specific questions, STAR tips, study topics, and interview questions to ask; numbered questions get a "Mark Asked" button that syncs status to bank
- **AI Answer Grader** — paste your answer on any question, get a score + gap analysis + improved version from AI
- **STAR Accordion** — structured Situation/Task/Action/Result fields on every question
- **Spaced Repetition** — "Due for Review" badge and filter surfaces questions with confidence ≤ 2 older than 7 days
- **Role Templates** — one-click load 20 starter questions for SDE, QA Automation, PM, Data Scientist, DevOps
- **Custom Checklist** — 12 default pre-interview items; add/delete your own; per-job check state persisted
- **Multi-round Date Tracking** — per-round interview dates (Phone Screen / Technical Round 1 / Technical Round 2 / HR Round / Final Round)
- Category cycling, inline question edit, difficulty cycling, confidence stars, practice trend arrows (↑ ↓ →)

### AI Integration
- Supports 6 providers: **Groq**, **Gemini**, **OpenRouter**, **Mistral**, **OpenAI**, **Claude**
- All free-tier friendly (Groq + Gemini have generous free quotas)
- Cover letter generator with company/role/JD context
- Resume analyzer — matches JD against master resume or skill profile
- AI Coach for interview prep
- AI answer grader with STAR scoring

### Job Discovery
- Bookmark interesting jobs with company, role, URL, source, and notes
- Convert bookmarks to tracked applications (status defaults to "Saved")
- JD parser — paste raw JD text to extract company/role/skills
- Create applications directly from parsed JD
- Duplicate check (case-insensitive company + role) on all creation paths
- Inline edit and delete on bookmarks
- Bookmarks stored in IndexedDB; included in JSON export/import

### Analytics & Calendar
- Applications over time chart, status distribution, success funnel
- Monthly goal tracking with progress indicator
- Calendar view of interview events (uses scheduled interview date, falls back to history timestamp)

### Settings
- CSV import with column mapping, validation, quoted-field parser, and status value warnings
- JSON backup export/import (jobs + bookmarks)
- Multiple user profiles with independent data
- AI provider configuration with key management
- Resume vault (IndexedDB-backed multi-resume library)
- Theme studio (dark/light, accent color, font size)

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 18 + TypeScript |
| Build | Vite |
| State | Zustand |
| Persistence | IndexedDB via `idb` |
| Charts | Recharts |
| Icons | Lucide React |
| Styling | CSS variables (no framework) |
| Deploy | Vercel |

---

## Local Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Type check
npx tsc --noEmit

# Build for production
npm run build
```

Requires Node 18+.

---

## Project Structure

```
src/
├── components/
│   ├── ai/           # AIPanel sidebar
│   ├── modal/        # AddEditModal (add/edit job)
│   ├── theme/        # ThemeStudio
│   └── ui/           # CustomSelect, CustomDatePicker, ToastContainer
├── lib/
│   ├── ai.ts         # callAI() — provider-agnostic API wrapper
│   ├── constants.ts  # SOURCES, INTERVIEW_ROUNDS, STATUS_COLORS, …
│   ├── db.ts         # IndexedDB schema + CRUD (jobs, profiles, resumes, bookmarks)
│   ├── format.ts     # formatDate, formatCurrency, …
│   ├── notifications.ts
│   ├── questionParser.ts  # Multi-format import parser (CSV/JSON/TXT/MD)
│   └── theme.ts
├── pages/
│   ├── Analytics.tsx
│   ├── Calendars.tsx
│   ├── CoverLetter.tsx
│   ├── Dashboard.tsx
│   ├── Directory.tsx
│   ├── InterviewPrep.tsx  # Question bank, mock interview, AI coach, checklist
│   ├── JobDiscovery.tsx   # Bookmarks + JD parser
│   ├── Landing.tsx
│   ├── Pipeline.tsx
│   ├── ResumeStudio.tsx
│   └── Settings.tsx
├── store/
│   └── useStore.ts    # Zustand store; hydrates from IndexedDB on load
└── types/
    └── index.ts       # Job, UserProfile, Bookmark, AIProvider, …
```

---

## AI Provider Setup

Go to **Settings → AI Providers** and add an API key for any provider:

| Provider | Free tier | Notes |
|---|---|---|
| Groq | Yes (generous) | Fastest; recommended for free users |
| Gemini | Yes | Google AI Studio key |
| OpenRouter | Yes (limited) | Access to many models |
| Mistral | Yes (limited) | |
| OpenAI | No | GPT-4o etc. |
| Claude | No | claude-sonnet-4-6 etc. |

---

## Data & Privacy

All data lives in your browser's IndexedDB. Nothing is sent to any server except direct API calls to your chosen AI provider using your own key. Export a JSON backup anytime from Settings.

---

## Deployment

Deployed on Vercel with zero configuration. `npm run build` produces a static `dist/` folder.

```bash
vercel --prod --yes
```
