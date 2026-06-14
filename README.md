# AI-Assisted QA Testing Course

A learning repository for an AI-assisted QA testing course. It tracks coursework across three chapters and includes prompt engineering artifacts, reusable prompt templates, and working test automation frameworks.

---

## Repository Structure

```
.
├── chapter_01_LLM_Basics/          — LLM fundamentals & attention mechanism visualizations
├── chapter_02_Prompt_Eng/          — Prompt engineering chapter
│   ├── Anti_Hallucinations_Rules.md
│   ├── templates/                  — Reusable RICE-POT prompt templates
│   ├── Project1_TC_Gen/            — Test case generation project
│   └── Project2_Selenium_Framework/— Selenium + TestNG framework (Salesforce)
├── Chapter_03_BLAST_FW/            — B.L.A.S.T Framework chapter
│   ├── B.L.A.S.T.md               — Framework protocol & phase definitions
│   ├── LLM.md                      — Data schemas & behavioral rules
│   ├── Objective.md                — Chapter objectives
│   ├── findings.md                 — Research & findings log
│   ├── progress.md                 — Progress tracking
│   ├── task_plan.md                — Implementation task plan
│   └── jira-test-plan-generator/  — React + Vite app (Jira → AI test plan)
├── Project_Assignment/             — Assignment deliverables
│   ├── RestfulFramework/           — RESTful API automation framework (Playwright)
│   │   ├── Problem.md
│   │   ├── SKILL.md
│   │   └── RICE-POT-RestAPI-Playwright-Prompt.md
│   ├── B.L.A.S.T_Framework/       — B.L.A.S.T Test Plan Generator (deployed to Vercel)
│   └── JOB_TRACKER_TOOL/          — CareerPulse job tracker (React app + Playwright tests)
│       ├── JobCommand/             — Main React application (Vite + TypeScript)
│       ├── Improvements/           — Playwright E2E suite & manual test checklist
│       ├── architecture/           — SOPs: CRUD, Kanban, persistence, search
│       ├── B.L.A.S.T.md           — B.L.A.S.T build protocol for this project
│       └── findings.md             — Research & design findings
├── VWO_Login_Dashboard_Test_Plan.md
└── RESTFUL_TEST_PLAN.md
```

---

## Chapter 3 — B.L.A.S.T Framework

**Location:** `Chapter_03_BLAST_FW/`

### The B.L.A.S.T Methodology

A 5-phase AI-assisted development framework for building structured, traceable test artifacts:

| Phase | Name | Purpose |
|-------|------|---------|
| **B** | Blueprint | Define data schemas, behavioral rules, and architectural invariants |
| **L** | Link | Connect Jira issues / requirements to the test plan generator |
| **A** | Architect | Design the React component tree, API proxy layer, and LLM prompt structure |
| **S** | Stylize | Apply Tailwind CSS dark/light mode, glassmorphism, and responsive layout |
| **T** | Trigger | Wire up user interactions — fetch Jira issue → generate test plan via GROQ LLM |

### Jira Test Plan Generator (React + Vite)

**Location:** `Chapter_03_BLAST_FW/jira-test-plan-generator/`

A React application that fetches a Jira issue and generates a structured B.L.A.S.T test plan using GROQ LLM.

**Stack:** React 18, Vite, Tailwind CSS, GROQ API (`llama-3.3-70b-versatile`)

```bash
cd Chapter_03_BLAST_FW/jira-test-plan-generator
npm install

# Run dev server + proxy together
npm run dev

# Build for production
npm run build
```

---

## Project Assignment — B.L.A.S.T Test Plan Generator (Deployed)

**Location:** `Project_Assignment/B.L.A.S.T_Framework/`

**Live URL:** [https://blastast.vercel.app](https://blastast.vercel.app)

A production-ready web application deployed to Vercel that generates structured QA test plans from Jira issues using GROQ LLM. No build step — React via CDN, Tailwind via CDN.

### Features

- **Jira Integration** — paste any Jira Issue ID (e.g. `SCRUM-6`); the app fetches summary, description, priority, status, type, and assignee via Jira REST API v3
- **B.L.A.S.T Test Plan Generation** — GROQ LLM produces a structured plan with test objectives, risk areas, test scenarios, acceptance criteria, and automation recommendations
- **E-Commerce Test Case Generator** — RICE-POT structured prompts across 10 modules (Auth, Product, Cart, Checkout, Payments, Search, Reviews, Orders, Performance, Security) and 9 test types
- **Dark / Light Mode** — Tailwind `darkMode: 'class'` with anti-flicker script; preference saved in `localStorage`
- **Glassmorphism UI** — sticky header, slide-in settings drawer, copy/download bar, shimmer loading, toast notifications
- **Anti-hallucination protocol** — LLM only uses data from the Jira issue; inferences tagged `[INFERENCE]`, assumptions tagged `[ASSUMPTION]`

### Architecture

```
B.L.A.S.T_Framework/
├── public/
│   └── index.html          ← Single-file React app (CDN React + Babel + Tailwind)
├── api/
│   ├── health.js           ← GET  /api/health   — env var status check
│   ├── generate.js         ← POST /api/generate — proxies to GROQ LLM
│   └── jira/
│       └── [issueId].js    ← GET  /api/jira/:id — proxies to Jira REST API v3
├── server.js               ← Express proxy server (local dev only, port 8787)
├── vercel.json             ← Vercel rewrites + serverless function config
├── package.json
├── LLM.md                  ← B.L.A.S.T Protocol 0: data schemas & behavioral rules
└── task_plan.md            ← Phase-by-phase implementation checklist
```

### Running Locally

```bash
cd Project_Assignment/B.L.A.S.T_Framework
npm install

# Start Express proxy + static server on http://localhost:8787
npm start
```

### Vercel Serverless Functions

| Route | Function | Purpose |
|-------|----------|---------|
| `GET /api/health` | `api/health.js` | Reports which env vars are loaded |
| `GET /api/jira/:issueId` | `api/jira/[issueId].js` | Fetches Jira issue with Basic Auth |
| `POST /api/generate` | `api/generate.js` | Calls GROQ LLM, returns Markdown test plan |

### Environment Variables (Vercel)

Set in Vercel project settings (not committed to git):

| Variable | Purpose |
|----------|---------|
| `GROQ_KEY` | GROQ API key |
| `JIRA_EMAIL` | Jira account email |
| `JIRA_API_TOKEN` | Jira API token |
| `JIRA_URL` | Jira base URL (e.g. `https://yourorg.atlassian.net`) |

User settings entered in the app's Settings drawer override server env vars via query params / request body.

---

## Project Assignment — RESTful API Automation Framework

**Location:** `Project_Assignment/RestfulFramework/`

A production-ready RESTful API test automation framework built from scratch using **Playwright (TypeScript)** with a two-page object model pattern.

### Stack

| Tool | Version | Purpose |
|------|---------|---------|
| `@playwright/test` | ^1.44.0 | API test runner and assertions |
| `TypeScript` | ^5.4.5 | Type-safe test code |
| `dotenv` | ^16.4.5 | Environment variable management |

### Framework Structure

```
RestfulFramework/
├── playwright.config.ts        ← Global config: baseURL, auth headers, HTML reporter
├── src/
│   ├── pages/
│   │   ├── BasePage.ts         ← Abstract base class (holds APIRequestContext)
│   │   ├── UsersPage.ts        ← Page Object 1: all /users endpoint operations
│   │   └── PostsPage.ts        ← Page Object 2: all /posts endpoint operations
│   ├── models/
│   │   ├── User.ts             ← TypeScript interface for User
│   │   └── Post.ts             ← TypeScript interface for Post
│   ├── config/
│   │   └── config.ts           ← Central config reader
│   └── utils/
│       ├── testData.ts         ← Deterministic test payloads (no random data)
│       └── schemaValidator.ts  ← Contract/schema assertion helper
└── tests/
    ├── users/users.spec.ts     ← 12 test cases for /users
    └── posts/posts.spec.ts     ← 12 test cases for /posts
```

### Setup and Run

```bash
cd Project_Assignment/RestfulFramework

npm install

# Run all 24 tests
npm test

# Run only users tests
npm run test:users

# Run only posts tests
npm run test:posts

# Open HTML report after a run
npm run test:report

# Type-check without running tests
npm run typecheck
```

### Test Coverage (24 tests — 100% pass)

| ID | Endpoint | Method | Type | Scenario |
|----|----------|--------|------|---------|
| TC-U-001 | /users | GET | Functional | Returns 200 with array |
| TC-U-002 | /users/:id | GET | Functional | Valid ID returns 200 |
| TC-U-003 | /users/:id | GET | Functional | Non-existent ID returns 404 |
| TC-U-004 | /users/:id | GET | Functional | Schema validation — required fields + types |
| TC-U-005 | /users | POST | Functional | Valid payload returns 201 |
| TC-U-006 | /users | POST | Functional | Missing field returns 400 |
| TC-U-007 | /users/:id | PUT | Functional | Full update returns 200 |
| TC-U-008 | /users/:id | PATCH | Functional | Partial update returns 200 |
| TC-U-009 | /users/:id | DELETE | Functional | Delete existing returns 200 |
| TC-U-010 | /users/:id | DELETE | Functional | Delete non-existent returns 404 |
| TC-U-011 | /users/:id | GET | Non-Functional | Content-Type header present |
| TC-U-012 | /users | GET | Non-Functional | Response time under threshold |
| TC-P-001 | /posts | GET | Functional | Returns 200 with array |
| TC-P-002 | /posts/:id | GET | Functional | Valid ID returns 200 |
| TC-P-003 | /posts/:id | GET | Functional | Non-existent ID returns 404 |
| TC-P-004 | /posts/:id | GET | Functional | Schema validation — required fields + types |
| TC-P-005 | /posts?userId | GET | Functional | Filter by userId returns matching posts |
| TC-P-006 | /posts | POST | Functional | Valid payload returns 201 |
| TC-P-007 | /posts | POST | Functional | Missing field returns 400 |
| TC-P-008 | /posts/:id | PUT | Functional | Full update returns 200 |
| TC-P-009 | /posts/:id | PATCH | Functional | Partial update returns 200 |
| TC-P-010 | /posts/:id | DELETE | Functional | Delete existing returns 200 |
| TC-P-011 | /posts/:id | DELETE | Functional | Delete non-existent returns 404 |
| TC-P-012 | /posts/:id | GET | Non-Functional | Content-Type header present |

---

## Project Assignment — CareerPulse Job Tracker

**Location:** `Project_Assignment/JOB_TRACKER_TOOL/JobCommand/`

A full-featured AI-assisted job application tracker built with React 18 + TypeScript, running entirely in the browser with zero cloud dependency (all data stored in IndexedDB).

### Stack

| Tool | Version | Purpose |
|------|---------|---------|
| React 18 + TypeScript | — | UI framework |
| Vite | ^5.x | Build tool & dev server |
| Zustand | — | Global state management |
| IndexedDB (`idb`) | — | Persistent local storage |
| Tailwind CSS | v3 | Styling |
| Framer Motion | — | Animated welcome splash & transitions |
| Recharts | — | Analytics & funnel charts |
| EmailJS REST API | — | Email notifications (200/month free) |
| canvas-confetti | — | Offer/Accepted celebration effect |

### Features

- **Dashboard** — stat cards (Total, Active, Interviews, Offers) + recent applications list
- **Pipeline** — drag-and-drop Kanban board with 8 status columns (Saved → Withdrawn)
- **Directory** — sortable/filterable table view with bulk select, move, delete
- **Calendars** — monthly calendar showing follow-up dates and interview appointments
- **Analytics & Funnels** — funnel chart, status distribution, application timeline
- **Resume Studio** — skill profile editor + master resume textarea with AI enhance
- **Interview Prep** — AI-generated Q&A by topic category
- **Job Discovery** — AI-powered job search interface
- **Cover Letter Gen** — two-panel generator: job selector → AI generate → editable textarea → save to job
- **Settings** — 6 AI providers (Groq, Gemini, OpenRouter, Mistral, OpenAI, Claude), notifications, data export/import
- **Theme Studio** — 15+ dark/light/colorful themes applied instantly
- **AI Assistant Panel** — floating chat panel powered by connected AI provider
- **Welcome Splash** — animated full-screen greeting with user's name after login
- **Real-time Offer Notifications** — browser popup + email via EmailJS fires immediately on status change (no daily-digest delay)

### Seed Data

8 QA-focused pre-loaded roles: Anthropic (Senior SDET), Vercel (QA Automation Lead), Stripe (Automation Test Engineer), Linear (QA Engineer), Cloudflare (Senior QA Automation Engineer), Netflix (Staff SDET), Figma (Automation QA Engineer), Slack (QA Lead).

### Run Locally

```bash
cd Project_Assignment/JOB_TRACKER_TOOL/JobCommand
npm install
npm run dev          # http://localhost:5173
npm run build        # production build to dist/
```

### Playwright E2E Test Suite

**Location:** `Project_Assignment/JOB_TRACKER_TOOL/Improvements/`

20 automated tests covering the full app tour — landing, welcome splash, dashboard, add job, pipeline, directory, calendars, analytics, resume studio, interview prep, job discovery, cover letter gen, settings, theme studio, AI panel, edit modal, offer confetti, bulk select, export, full nav tour.

```bash
cd Project_Assignment/JOB_TRACKER_TOOL/Improvements
npm install
npx playwright install chromium

# Start the app first (in a separate terminal):
# cd ../JobCommand && npm run dev

# Run all 20 tests (headed, with video + screenshots + traces)
npx playwright test --reporter=html

# Open HTML report
start playwright-report/index.html
```

**Output:** Screenshots saved to `screenshots/`, videos and traces in `test-results/`, HTML report at `playwright-report/index.html`.

### Manual Test Checklist

**File:** `Project_Assignment/JOB_TRACKER_TOOL/Improvements/TEST_CHECKLIST.md`

130+ manual test checkpoints across 20 sections including seed data verification, real-time offer notification, bulk actions, cover letter save flow, and cross-feature checks. Includes Bug Log and Test Summary tables.

---

## Project 2 — Selenium Framework (chapter_02_Prompt_Eng)

**Location:** `chapter_02_Prompt_Eng/Project2_Selenium_Framework/AdvanceSeleniumFramework/`

**Stack:** Java 11, Selenium 4.25.0, TestNG 7.10.2, Maven, Page Object Model

**Target:** Salesforce login page (two-page POM: LoginPage + Dashboard)

```bash
# Run full suite
mvn test

# Run smoke tests only
mvn test -Dsurefire.suiteXmlFiles=testng-smoke.xml
```

---

## RICE-POT Prompt Framework

Every prompt artifact in this repository follows the **RICE-POT** structure:

| Letter | Component | Purpose |
|--------|-----------|---------|
| R | Role | AI persona (e.g., "Senior QA Engineer with 15 years' experience") |
| I | Instructions | Ordered steps + explicit "Do NOT" list |
| C | Context | Background, product, attached documents |
| E | Example | Sample output row or format snippet |
| P | Parameters | Anti-hallucination block — deterministic, traceable, no invented content |
| O | Output | Exact format (CSV, Markdown, TypeScript), column spec |
| T | Tone | Communication style (technical, output-only) |

Prompt templates are in `chapter_02_Prompt_Eng/templates/`. The RESTful API prompt is in `Project_Assignment/RestfulFramework/RICE-POT-RestAPI-Playwright-Prompt.md`.

---

## VWO Login Dashboard Test Plan

**File:** `VWO_Login_Dashboard_Test_Plan.md`

A standalone manual test plan covering:
- Successful and failed login flows
- Password validation and reset
- Remember Me functionality
- Social login (Google)
- Role-based access (Manager, Viewer)
- Session timeout and multiple sessions
- Mobile responsiveness
