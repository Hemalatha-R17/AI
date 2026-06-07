import { extractIssueText } from './jiraApi'

export async function generateTestPlan(issue, config) {
  const { groqApiKey, groqModel = 'openai/gpt-oss-120b' } = config
  const data = extractIssueText(issue)
  const prompt = buildPrompt(data)

  let response
  try {
    response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: groqModel,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        max_tokens: 4096,
      }),
    })
  } catch (err) {
    throw new Error(`Network error reaching GROQ API: ${err.message}`)
  }

  if (response.status === 401)
    throw new Error('GROQ authentication failed (401). Check your API key in Settings.')
  if (response.status === 400) {
    const text = await response.text()
    throw new Error(`GROQ bad request (400) — model name may be wrong. Try "llama-3.3-70b-versatile" as fallback. Detail: ${text.slice(0, 200)}`)
  }
  if (response.status === 429)
    throw new Error('GROQ rate limit reached (429). Wait a moment and try again.')
  if (!response.ok) {
    const text = await response.text()
    throw new Error(`GROQ API error (${response.status}): ${text.slice(0, 200)}`)
  }

  const result = await response.json()
  return result.choices?.[0]?.message?.content || 'No content generated.'
}

function buildPrompt({ key, summary, description, issueType, priority, status, assignee, reporter }) {
  return `You are a Senior QA Engineer with 15 years of experience in functional, integration, and regression testing.

INSTRUCTIONS:
- Generate a comprehensive, professional test plan based ONLY on the Jira ticket data below
- Do NOT invent features, behaviors, UI elements, or API endpoints not mentioned in the ticket
- If a section cannot be determined from the ticket, write "To be determined based on requirements clarification"
- Generate a minimum of 5 distinct, meaningful test cases derived directly from the ticket content
- Mark any inference with "(Inference)"
- Output ONLY the test plan Markdown — no preamble, no commentary, no explanation

JIRA TICKET:
ID: ${key}
Type: ${issueType}
Priority: ${priority}
Status: ${status}
Assignee: ${assignee}
Reporter: ${reporter}
Summary: ${summary}

Description:
${description}

OUTPUT — follow this exact Markdown structure:

# Test Plan: ${key} — ${summary}

## 1. Test Objectives
[2–3 sentences explaining what is being tested and the quality goal]

## 2. Scope
### In Scope
[Bullet list of features/behaviors explicitly covered by this ticket]
### Out of Scope
[Bullet list of explicitly excluded or unrelated areas]

## 3. Test Approach
[Testing strategy: types of testing (functional, regression, edge cases, etc.), tools, methods]

## 4. Test Cases

| TC ID | Test Description | Preconditions | Test Steps | Expected Result | Priority |
|-------|-----------------|---------------|------------|-----------------|----------|
[Minimum 5 rows. Each row must be a distinct, actionable test case derived from the ticket]

## 5. Entry & Exit Criteria
### Entry Criteria
- [Prerequisites before testing begins]
### Exit Criteria
- [Conditions that define testing is complete]

## 6. Risk Analysis

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
[3–5 realistic testing risks with mitigations]

## 7. Test Environment Requirements
[Environment setup, test data, access, tools required]`
}
