# RICE-POT Prompt Template — RESTful API Test Cases (Playwright API)

> A worked example of the **RICE-POT** prompt framework for generating enterprise-grade
> **RESTful API** test cases and runnable **Playwright API** tests from an OpenAPI/Swagger
> spec or API PRD. Copy the prompt in the second section into your AI tool of choice.

---

## Quick Reference: What RICE-POT Means

| Letter | Component    | What goes here |
|--------|--------------|----------------|
| **R**  | Role         | The persona the AI adopts |
| **I**  | Instructions | Step-by-step commands + mandatory rules and "Don't" lists |
| **C**  | Context      | Background — the *why* and *where* (endpoints, auth, base URL) |
| **E**  | Example      | A sample test spec/code that guides the output style |
| **P**  | Parameters   | Quality, accuracy, and style constraints |
| **O**  | Output       | The exact artifact and format to produce (Playwright spec) |
| **T**  | Tone         | Communication style |

---

## The Prompt (copy from here)

### R — Role
You are an **expert API Test Automation Engineer (SDET) with 15+ years of experience**.
You specialize in **RESTful API testing** — functional and non-functional — and in writing
enterprise-grade, traceable, runnable test suites using **Playwright's API testing capability**
(`@playwright/test` with the `request` fixture / `APIRequestContext`).

### I — Instructions
1. Read the attached **OpenAPI/Swagger spec**, **API PRD**, **Postman collection**, and any
   supporting documents carefully before writing anything.
2. Write test cases for the API under test covering **both functional and non-functional**
   requirements. Functional = correct behaviour per the spec; non-functional = performance
   (response time), reliability, security/authorization, and contract/schema conformance.
3. For **every documented endpoint**, cover:
   - **HTTP methods** as defined in the spec (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`).
   - **Positive (valid)** scenarios: well-formed requests returning the documented success
     status and response body.
   - **Negative (invalid)** scenarios: malformed/missing/invalid payloads, wrong types,
     boundary values, and the documented error status codes (e.g. `400`, `401`, `403`,
     `404`, `409`, `422`, `429`).
   - **Authentication & authorization**: valid token, missing token, expired token,
     wrong-role/forbidden access — **only if** the spec defines an auth mechanism.
   - **Contract/schema validation**: response body matches the documented schema (required
     fields, types, enums).
   - **Headers & content type**: `Content-Type`, `Authorization`, and any documented custom
     headers.
4. Generate a **minimum of 10 test cases**. Add more if endpoint/spec coverage requires it.
5. **Trace every test case back to a specific requirement / endpoint / response code** in the
   spec or PRD (e.g. `POST /v1/login → 401 Unauthorized`).
6. If a requirement is **missing, unclear, or ambiguous → STOP and ask clarifying questions
   first.** Do not proceed on assumptions.

**Mandatory "Don't" rules:**
- Do **not** invent endpoints, paths, query parameters, request/response fields, or enums.
- Do **not** invent HTTP status codes, error codes, error messages, or response schemas.
- Do **not** invent auth schemes, headers, rate limits, or SLAs not stated in the inputs.
- Do **not** assume default or "typical" REST behaviour (e.g. do not assume a `DELETE`
  returns `204` unless the spec says so).

### C — Context
- **API under test:** `<API name>` — base URL `<https://api.example.com>`.
- **Auth mechanism:** `<Bearer token / API key / OAuth2 / none>` — *as defined in the spec only.*
- You have been provided with the **OpenAPI/Swagger spec, API PRD, Postman collection, and
  supporting documents** as attachments.
- All test cases and code must be derived strictly from these provided inputs.
- Target framework: **Playwright Test (TypeScript)** using the built-in `request` fixture.

### E — Example
A single test spec should follow this shape (values illustrative only):

```typescript
// Traces to: PRD §3.1 — POST /v1/login → 200 / 401
import { test, expect } from '@playwright/test';

test.describe('POST /v1/login', () => {
  // TC-001 | Positive | Priority: High | Automated: Yes
  test('TC-001 valid credentials return 200 with auth token', async ({ request }) => {
    const res = await request.post('/v1/login', {
      data: { email: 'valid.user@example.com', password: 'ValidPass123' },
    });
    expect(res.status()).toBe(200);                 // documented success code
    const body = await res.json();
    expect(body).toHaveProperty('token');           // documented response field
    expect(typeof body.token).toBe('string');       // schema/type assertion
  });

  // TC-002 | Negative | Priority: High | Automated: Yes
  test('TC-002 invalid password returns 401', async ({ request }) => {
    const res = await request.post('/v1/login', {
      data: { email: 'valid.user@example.com', password: 'wrong' },
    });
    expect(res.status()).toBe(401);                 // documented error code
  });
});
```

### P — Parameters
- Output must be **deterministic** (same input → same output). Use fixed, illustrative test
  data; do not generate random values unless the spec requires randomized inputs.
- **Every assertion must be traceable** to a provided input (spec endpoint / response code /
  schema field / PRD line). Add a `// Traces to:` comment on each `describe` block.
- If information is missing or unclear, output exactly: **"Insufficient information to determine."**
- If a detail is inferred rather than stated, label it exactly with a comment:
  **`// Inference (low confidence)`**.
- Use only assertions backed by the spec: status code, response schema/fields/types, headers,
  and — where an SLA is documented — response time via `expect(res).toBeOK()` /
  timing assertions. Do **not** assert response time if no SLA is given.
- Enterprise-grade quality. **Zero invented content.**

### O — Output
Produce **two artifacts, in this order**, and nothing else (no preamble, no explanation):

**1. Traceability matrix — CSV only.** Columns in this exact order:

```
Scenario, TID, Endpoint, HTTP Method, Test Data, Test Case Description, Pre-Condition,
Test Steps, Expected Status, Expected Response/Schema, Auth, Type (Functional/Non-Functional),
Positive/Negative, Traces To (Req/Spec), Priority, Is Automated
```

**2. Playwright API test suite — TypeScript only.** A runnable suite that:
- Imports from `@playwright/test`.
- Groups tests per endpoint with `test.describe(...)`.
- Uses the `request` fixture / `APIRequestContext`; no UI/browser code.
- One `test(...)` per row in the CSV, with the matching `TID` in the test title.
- Includes a `// Traces to:` comment per `describe` block.

Optionally include a minimal `playwright.config.ts` snippet setting `use.baseURL`,
`use.extraHTTPHeaders` (for auth), and a timeout — **only** populated from values present in
the inputs. Leave placeholders (`<...>`) where the spec does not specify a value.

### T — Tone
Technical, precise, and enterprise-grade. Output only the requested artifacts — no commentary.

---

## Notes for Students
- **Order matters.** R and C set up *who* and *why* (incl. base URL + auth); I and P set the
  guardrails; O and T lock the format (CSV matrix + Playwright TS suite).
- **API-specific anti-hallucination is critical.** REST has strong conventions (`204` on
  delete, `201` on create, etc.) and an LLM will happily assume them. The "Don't" rules force
  every status code, field, and header to come from the spec — not from convention.
- **Functional vs non-functional split:** functional = does the endpoint do what the spec
  says (status, body, schema); non-functional = how well (response-time SLA, rate-limiting
  `429`, auth/security, contract stability). Only test the non-functional items the inputs
  actually define.
- **Trace, don't guess.** The `Traces To` CSV column and the `// Traces to:` code comments
  are what make the suite auditable for real QA sign-off.
- Always attach the **actual OpenAPI/Swagger spec (or Postman collection) and the API PRD** —
  the prompt is only as good as its inputs.
