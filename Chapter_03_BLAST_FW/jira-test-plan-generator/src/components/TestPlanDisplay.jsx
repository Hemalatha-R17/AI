import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
    </svg>
  )
}

export default function TestPlanDisplay({ jiraIssue, testPlan, loading }) {
  const [copied, setCopied] = useState(false)

  const step1Done   = !!jiraIssue
  const step2Done   = !!testPlan
  const step1Active = loading && !jiraIssue
  const step2Active = loading && !!jiraIssue && !testPlan

  const getStepState = (done, active) => {
    if (done)   return 'done'
    if (active) return 'active'
    return 'pending'
  }

  const handleCopy = async () => {
    if (!testPlan) return
    await navigator.clipboard.writeText(testPlan)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    if (!testPlan || !jiraIssue) return
    const blob = new Blob([testPlan], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `test-plan-${jiraIssue.key}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="card test-plan-card">
      {/* ── Jira ticket header ── */}
      {jiraIssue && (
        <>
          <div className="jira-summary">
            <span className="jira-id-badge">{jiraIssue.key}</span>
            {jiraIssue.fields.summary}
          </div>
          <div className="jira-meta">
            <span className="meta-badge issue-type">
              {jiraIssue.fields.issuetype?.name || 'Issue'}
            </span>
            <span className="meta-badge priority">
              ⚡ {jiraIssue.fields.priority?.name || 'Medium'}
            </span>
            <span className="meta-badge status">
              {jiraIssue.fields.status?.name || 'Open'}
            </span>
          </div>
        </>
      )}

      {/* ── Step progress ── */}
      {loading && (
        <div className="loading-wrapper">
          <div className="loading-steps">
            {/* Step 1 */}
            <div className={`loading-step ${getStepState(step1Done, step1Active)}`}>
              <div className="step-icon">
                {step1Done
                  ? <CheckIcon />
                  : step1Active
                    ? <span className="step-mini-spinner" />
                    : '1'}
              </div>
              <div className="step-info">
                <div className="step-label">Fetch Jira Ticket</div>
                <div className="step-sub">
                  {step1Done ? 'Ticket retrieved successfully'
                    : step1Active ? 'Connecting to Jira...'
                    : 'Waiting'}
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className={`loading-step ${getStepState(step2Done, step2Active)}`}>
              <div className="step-icon">
                {step2Done
                  ? <CheckIcon />
                  : step2Active
                    ? <span className="step-mini-spinner" />
                    : '2'}
              </div>
              <div className="step-info">
                <div className="step-label">Generate Test Plan</div>
                <div className="step-sub">
                  {step2Done ? 'Test plan ready'
                    : step2Active ? 'GROQ AI is thinking...'
                    : 'Waiting for ticket'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Generated test plan ── */}
      {testPlan && (
        <>
          <div className="action-bar">
            <button
              className={`copy-btn${copied ? ' copied' : ''}`}
              onClick={handleCopy}
            >
              {copied
                ? <><CheckIcon /> Copied!</>
                : <>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                    </svg>
                    Copy Markdown
                  </>}
            </button>
            <button className="copy-btn" onClick={handleDownload}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 9h-4V3H9v6H5l7 7 7-7zm-8 2V5h2v6h1.17L12 13.17 9.83 11H11zm-6 7h14v2H5v-2z"/>
              </svg>
              Download .md
            </button>
          </div>
          <div className="plan-section-title">Generated Test Plan</div>
          <div className="plan-content">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {testPlan}
            </ReactMarkdown>
          </div>
        </>
      )}
    </div>
  )
}
