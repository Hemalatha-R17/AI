# AI-Assisted QA Testing Course

A learning repository for an AI-assisted QA testing course. It tracks coursework across two chapters and includes prompt engineering artifacts, reusable prompt templates, and two working test automation frameworks.

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
├── Project_Assignment/             — Assignment deliverables
│   ├── Problem.md
│   ├── SKILL.md
│   ├── RICE-POT-RestAPI-Playwright-Prompt.md
│   └── RestfulFramework/           — RESTful API automation framework (Playwright)
├── VWO_Login_Dashboard_Test_Plan.md
└── RESTFUL_TEST_PLAN.md
```

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

### Design Principles

- **Two-page object model** — `UsersPage` and `PostsPage` each extend `BasePage`. Tests never call `request.get/post/put/delete` directly; they go through the page object. If an endpoint URL changes, it changes in one place only.
- **Anti-hallucination (RICE-POT P rules)** — test data is fixed and deterministic; every assertion traces back to a documented endpoint/status code via `// Traces to:` comments.
- **Schema validation** — `schemaValidator.ts` asserts required fields and types on every GET response.
- **Traceability matrix** — a CSV matrix is embedded at the top of each spec file mapping every test to its endpoint, HTTP method, status code, and priority.

### Setup and Run

```bash
cd Project_Assignment/RestfulFramework

# Install dependencies
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

### Environment Variables

Copy `.env.example` to `.env` before running:

```bash
BASE_URL=https://jsonplaceholder.typicode.com
AUTH_TOKEN=          # leave empty for open APIs
```

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

Prompt templates are in `chapter_02_Prompt_Eng/templates/`. The RESTful API prompt is in `Project_Assignment/RICE-POT-RestAPI-Playwright-Prompt.md`.

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
