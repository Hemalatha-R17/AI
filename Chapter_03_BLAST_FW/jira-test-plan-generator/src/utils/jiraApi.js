import { parseADF } from './adfParser'

export async function fetchJiraIssue(jiraId, config) {
  const { jiraEmail, jiraToken, jiraBaseUrl } = config
  const baseUrl = jiraBaseUrl.replace(/\/$/, '').replace(/\/browse.*$/, '')
  const credentials = btoa(`${jiraEmail}:${jiraToken}`)

  // Route through the local CORS proxy (proxy.js) instead of calling Jira directly.
  // Direct browser → Jira calls are blocked by CORS; the proxy forwards them server-side.
  let response
  try {
    response = await fetch(`http://localhost:3001/jira/rest/api/3/issue/${jiraId}`, {
      headers: {
        Authorization: `Basic ${credentials}`,
        'x-jira-base-url': baseUrl,
        Accept: 'application/json',
      },
    })
  } catch (err) {
    if (err.name === 'TypeError') {
      throw new Error(
        `Cannot reach the local proxy (localhost:3001). ` +
        `Make sure you started the app with "npm run dev" (not just "vite"), ` +
        `which runs the proxy alongside the UI.`
      )
    }
    throw err
  }

  if (response.status === 401)
    throw new Error('Jira authentication failed (401). Check your email and API token in Settings.')
  if (response.status === 403)
    throw new Error('Jira access denied (403). Your token may lack permission to view this issue.')
  if (response.status === 404)
    throw new Error(`Issue "${jiraId}" not found (404). Verify the ID and that your Base URL is correct.`)
  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Jira API error (${response.status}): ${text.slice(0, 300)}`)
  }

  return await response.json()
}

export function extractIssueText(issue) {
  const fields = issue.fields || {}
  const description = fields.description
    ? parseADF(fields.description).trim()
    : 'No description provided.'

  return {
    key: issue.key,
    summary: fields.summary || '',
    description,
    issueType: fields.issuetype?.name || 'Issue',
    priority: fields.priority?.name || 'Medium',
    status: fields.status?.name || 'Open',
    assignee: fields.assignee?.displayName || 'Unassigned',
    reporter: fields.reporter?.displayName || 'Unknown',
  }
}
