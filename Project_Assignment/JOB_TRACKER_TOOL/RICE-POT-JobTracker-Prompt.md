# RICE-POT Prompt Template — Job Application Tracker Tool

> A worked example of the **RICE-POT** prompt framework for generating a self-contained
> job application tracker web app. Copy the prompt in the second section into your AI tool of choice.

---

## Quick Reference: What RICE-POT Means

| Letter | Component    | What goes here |
|--------|--------------|----------------|
| **R**  | Role         | The persona the AI adopts |
| **I**  | Instructions | Step-by-step commands + mandatory rules and "Don't" lists |
| **C**  | Context      | Background — the *why* and *where* |
| **E**  | Example      | A sample row/format that guides the output style |
| **P**  | Parameters   | Quality, accuracy, and style constraints |
| **O**  | Output       | The exact artifact and format to produce |
| **T**  | Tone         | Communication style |

---

## The Prompt (copy from here)

### R — Role
You are an **expert full-stack product engineer with 10+ years of experience** building polished,
single-page productivity web apps. You specialize in clean UX, accessible interfaces, and shipping
self-contained, bug-free tools.

### I — Instructions
1. Build a **Job Application Tracker** — a single-page web app that lets a job seeker manage every
   application from "saved" to "offer."
2. Implement these core capabilities:
   - Add, edit, and delete job entries.
   - Each entry captures: **Company, Role/Title, Location (or Remote), Salary range, Source,
     Application date, Status, Job posting URL, Contact name, Next action / follow-up date, Notes.**
   - Status pipeline (use these exact values):
     **Wishlist → Applied → Phone Screen → Interview → Offer → Accepted → Rejected.**
   - Two views: a **table view** (sortable columns) and a **Kanban board** grouped by status with
     drag-and-drop between columns.
   - A **search box** (filters by company or role) plus filters by status and source.
   - A **summary dashboard**: total applications, count per status, and response rate
     (interviews ÷ applied).
   - Persist all data locally so it survives a page reload.
3. Make it **responsive** (usable on mobile and desktop).
4. If any requirement is **ambiguous or conflicting → STOP and ask clarifying questions first.**
   Do not silently guess.

**Mandatory "Don't" rules:**
- Do **not** add features I didn't request (no login, no backend, no external accounts) unless you ask first.
- Do **not** require API keys, sign-ups, or paid services.
- Do **not** ship placeholder/"lorem ipsum" data — seed with at most 2–3 clearly-labeled sample rows
  the user can delete.

### C — Context
- This is a **personal tool** for one person managing an active job search across many companies at once.
- The user wants a **single file they can open in a browser and use immediately** — no install, no server.
- Pain point being solved: applications scattered across email, spreadsheets, and memory, with missed follow-ups.

### E — Example
A single job entry should be structured like this (values illustrative only):

```
Company: Acme Corp | Role: Senior QA Engineer | Location: Remote (US) |
Salary: $120k–$140k | Source: LinkedIn | Applied: 2026-06-01 |
Status: Interview | URL: https://acme.com/careers/123 |
Contact: Jane Doe (Recruiter) | Next Action: Send thank-you note by 2026-06-15 |
Notes: Strong culture fit; second round scheduled.
```

### P — Parameters
- Deliver a **working tool on the first response** — no TODOs, stubs, or unfinished functions.
- Every interaction (add / edit / delete / drag / filter / search) must work without errors.
- Use only **standard web tech** (HTML/CSS/JS or a single React component file) with no paid dependencies.
- **Accessible**: keyboard-navigable, sufficient color contrast, labeled inputs.
- Clean, modern, uncluttered visual design.

### O — Output
- A **single self-contained file** that runs as-is (one `.html` with inline CSS/JS, or one React component file).
- Inline comments only where logic is non-obvious.
- After the code, list in **3–5 bullets** exactly what was built and any assumptions made.

### T — Tone
Practical and professional. Prioritize a tool that works and feels good to use over decorative extras.

---

## Notes for Students
- **Order matters.** R and C set up *who* and *why*; I and P set the guardrails; O and T lock the format.
- The **anti-hallucination block** from the test-case template maps here to a **scope-creep guard**
  ("don't add unrequested features, don't require accounts") — same trust mechanism, repurposed for building.
- **Watch the persistence requirement.** "Survives reload" assumes the target platform allows browser
  storage. If pasting into a sandbox that blocks `localStorage` (e.g. Claude Artifacts), swap that line
  for "keep data in memory for the session" or use the platform's native storage instead.
