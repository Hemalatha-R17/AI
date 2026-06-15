# Interview Question Bank — Feature Prompt

## Overview

Build a company-wise interview question bank inside the **Interview Prep** module with status tracking, notes, search, and multi-format export/import support.

---

## 1. Data Model

Each question entry should store the following fields:

| Field | Type | Description |
|---|---|---|
| `id` | string | Unique identifier |
| `company` | string | Company name (e.g., Anthropic) |
| `role` | string | Job role (e.g., Senior SDET) |
| `question` | string | The interview question text |
| `category` | enum | `Behavioral`, `Technical`, `System Design`, `HR`, `Coding` |
| `status` | enum | `To Prepare`, `Practicing`, `Practiced`, `Asked in Interview`, `Skipped` |
| `notes` | string | Personal notes or answer outline |
| `dateAdded` | timestamp | When the question was added |
| `interviewDate` | date (optional) | Scheduled or past interview date |
| `source` | string (optional) | Where the question came from (e.g., Glassdoor, Recruiter) |

---

## 2. Core Features

### 2.1 Company-wise Storage
- Questions are scoped to a **company + role** combination.
- Selecting a company from the dropdown shows **only that company's questions**.
- Each company-role pair acts as an independent question set.

### 2.2 Status Tracking

Each question must have a visible, toggleable status badge:

```
To Prepare  →  Practicing  →  Practiced  →  Asked in Interview
                                          ↘  Skipped
```

Status colors:
- `To Prepare` — Gray
- `Practicing` — Yellow
- `Practiced` — Blue
- `Asked in Interview` — Green
- `Skipped` — Red

### 2.3 Notes Per Question
- Each question card has an expandable **Notes** section.
- Notes can be edited inline (click to edit, auto-save).
- Supports plain text or simple markdown (bold, bullets).

### 2.4 Interview Date Tag
- Each company-role entry can have an **Interview Date** field.
- Show a label on the question list: `Interview on June 20, 2025` or `Interview was on March 5, 2025 (Past)`.

---

## 3. Search & Filter

### Search Bar
- Searches across all stored questions by **company name**, **role**, or **question text**.
- Results are grouped:
  ```
  Anthropic — Senior SDET  (12 questions)
  Google — SWE II           (8 questions)
  ```

### Filters (inside a company view)
- Filter by **Category**: Behavioral / Technical / System Design / HR / Coding
- Filter by **Status**: To Prepare / Practiced / Asked in Interview / etc.
- Sort by: Date Added / Category / Status

---

## 4. Add Questions

### Manual Entry Form
Fields:
- Question text (required)
- Category (dropdown)
- Status (dropdown, default: `To Prepare`)
- Notes (optional textarea)
- Source (optional)

### Bulk Import (CSV / Excel)
- Upload a `.csv` or `.xlsx` file.
- Column mapping UI: user maps file columns to app fields.
- Required columns: `Question`, `Category`
- Optional columns: `Status`, `Notes`, `Source`, `Interview Date`

---

## 5. Export Options

Export should be available **per company-role** or **all questions**.

### CSV / Excel Export
Columns: `Company`, `Role`, `Question`, `Category`, `Status`, `Notes`, `Date Added`, `Interview Date`

### PDF Export
- Grouped by **Category** with headings.
- Each question shows: question text, status badge, notes.
- Header: Company name, Role, Export date.

### Word (.docx) Export
- Structured document with:
  - Title: `Interview Questions — Anthropic, Senior SDET`
  - Sections per Category (Heading 1)
  - Each question as a numbered list item
  - Status and Notes shown below each question

---

## 6. UI Changes Required

### Question Card
```
┌──────────────────────────────────────────────────────┐
│  Q: Tell me about a time you handled a production    │
│     incident under pressure.                         │
│                                                      │
│  [Behavioral]  [● Practiced]                        │
│                                                      │
│  📝 Notes: Used STAR method. Talked about the        │
│            Redis outage at XYZ Corp.         [Edit]  │
└──────────────────────────────────────────────────────┘
```

### Top Bar Additions
- **Search** bar (global, searches across all companies)
- **Export** button → dropdown: `CSV | Excel | PDF | Word`
- **Import** button → file upload

### Company Dropdown
- Acts as both filter and search.
- Shows question count per company: `Anthropic — Senior SDET (12)`

---

## 7. AI Coach Integration (Optional Enhancement)

When a question is selected, the AI Coach tab can:
- Suggest a model answer using STAR method (for Behavioral).
- Highlight key concepts to cover (for Technical/System Design).
- Let the user type their answer and get feedback.

---

## 8. Sample CSV Import Format

```csv
Company,Role,Question,Category,Status,Notes,Interview Date
Anthropic,Senior SDET,How do you approach test automation for ML models?,Technical,To Prepare,,2025-06-20
Google,SWE II,Design a URL shortener,System Design,Practiced,Drew diagram with load balancer + Redis,
Amazon,SDE II,Tell me about a time you disagreed with your manager,Behavioral,Asked in Interview,Used STAR. Went well.,2025-03-05
```

---

## 9. Implementation Notes

- Store all data in **localStorage** (or a backend DB if auth exists) keyed by `company:role`.
- On search, query across all keys and return grouped results.
- Export functions should use:
  - `SheetJS (xlsx)` for CSV/Excel
  - `jsPDF` or server-side rendering for PDF
  - `docx` npm package for Word export
- Status changes should auto-save without a submit button.
- Notes should debounce-save after 500ms of inactivity.
