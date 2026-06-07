# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Purpose

This is a learning repository for an AI-assisted QA testing course. It tracks coursework across two chapters and includes prompt engineering artifacts, reusable prompt templates, and a working Selenium automation framework.

## Structure

- `chapter_01_LLM_Basics/` — LLM fundamentals notes and interactive HTML visualizations (attention mechanisms)
- `chapter_02_Prompt_Eng/` — Prompt engineering chapter:
  - `Anti_Hallucinations_Rules.md` — Core anti-hallucination system prompt (basis for all QA prompts)
  - `templates/` — Reusable prompt templates for test case generation, API testing, security, regression
  - `Project1_TC_Gen/` — Test case generation project using the RICE-POT framework
  - `Project2_Selenium_Framework/` — Selenium + TestNG Maven framework for Salesforce login testing
- `VWO_Login_Dashboard_Test_Plan.md` — Standalone manual test plan for VWO login
- `Project_Assignment/` — Assignment deliverables

## RICE-POT Prompt Framework

The primary prompt-building methodology used throughout this repo. Every prompt artifact should follow this structure:

| Letter | Component | Purpose |
|--------|-----------|---------|
| R | Role | AI persona (e.g., "Senior QA Engineer with 15 years' experience") |
| I | Instructions | Ordered steps + explicit "Do NOT" list |
| C | Context | Background, product, attached documents |
| E | Example | Sample output row or format snippet |
| P | Parameters | Quality/accuracy constraints; default to the anti-hallucination block |
| O | Output | Exact format (CSV, Markdown table, JSON), column spec |
| T | Tone | Communication style (technical, output-only, etc.) |

The anti-hallucination parameter block (from `Anti_Hallucinations_Rules.md`) should be included in any prompt generating factual/technical output:
- Output must be deterministic
- Every assertion traceable to a provided input
- Missing info → respond "Insufficient information to determine."
- Inferences → label "Inference (low confidence)"
- Do not invent features, APIs, error codes, UI elements, or behavior

The `SKILL.md` file in `Project2_Selenium_Framework/` is a registered Claude Code skill that guides RICE-POT prompt construction interactively.

## Selenium Framework (Project2)

**Location:** `chapter_02_Prompt_Eng/Project2_Selenium_Framework/AdvanceSeleniumFramework/`

**Stack:** Java 11, Selenium 4.25.0, TestNG 7.10.2, Maven, Page Object Model

### Build and run tests

```bash
# Run full suite (from AdvanceSeleniumFramework/)
mvn test

# Run smoke tests only
mvn test -Dsurefire.suiteXmlFiles=testng-smoke.xml

# Run a single test class
mvn test -Dtest=InvalidLoginTest
```

### Architecture

- `BaseTest.java` — Abstract base; `@BeforeMethod` spins up headless Chrome, `@AfterMethod` quits. All tests extend this.
- `pages/LoginPage.java` — Page Object for Salesforce login; use PageFactory pattern when adding new pages.
- `utils/ConfigReader.java` — Reads `src/main/resources/config.properties`; use `ConfigReader.get(key)` and `ConfigReader.getInt(key)`.
- `testng.xml` — Full suite (ValidLogin + InvalidLogin); `testng-smoke.xml` — smoke subset.

### Configuration

Edit `src/main/resources/config.properties` before running `ValidLoginTest` — it requires real Salesforce credentials (the test guards against placeholder values). `InvalidLoginTest` does not require real credentials.

```properties
app.url=https://login.salesforce.com/?locale=in
app.username=REPLACE_WITH_VALID_SF_USER
app.password=REPLACE_WITH_VALID_SF_PASSWORD
timeout.explicit=20
timeout.implicit=10
```

## Prompt Templates

Located in `chapter_02_Prompt_Eng/templates/`. When adding new templates, follow the same RICE-POT structure and store output examples in a sibling `output/` directory (see `Project1_TC_Gen/output/`).
