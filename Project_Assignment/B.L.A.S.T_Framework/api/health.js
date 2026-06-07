'use strict';

function jiraBase(raw) {
  return (raw || '')
    .replace(/\/browse\/.*$/, '')
    .replace(/\/rest\/.*/, '')
    .replace(/\/$/, '');
}

module.exports = function handler(_req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.json({
    ok: true,
    env: {
      hasGroqKey:   !!process.env.GROQ_KEY,
      hasJiraEmail: !!process.env.JIRA_EMAIL,
      hasJiraToken: !!process.env.JIRA_API_TOKEN,
      jiraBase:     jiraBase(process.env.JIRA_URL) || null,
    },
  });
};
