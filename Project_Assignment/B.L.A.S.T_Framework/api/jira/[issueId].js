'use strict';

function jiraBase(raw) {
  return (raw || '')
    .replace(/\/browse\/.*$/, '')
    .replace(/\/rest\/.*/, '')
    .replace(/\/$/, '');
}

module.exports = async function handler(req, res) {
  const { issueId } = req.query;

  const base  = req.query.jiraUrl   ? jiraBase(req.query.jiraUrl)  : jiraBase(process.env.JIRA_URL);
  const email = req.query.jiraEmail || process.env.JIRA_EMAIL;
  const token = req.query.jiraToken || process.env.JIRA_API_TOKEN;

  if (!base || !email || !token) {
    return res.status(400).json({
      error: 'Jira config missing. Open ⚙ Settings and fill in Jira fields.',
    });
  }

  const url  = `${base}/rest/api/3/issue/${encodeURIComponent(issueId)}`;
  const auth = Buffer.from(`${email}:${token}`).toString('base64');

  try {
    const r    = await fetch(url, {
      headers: { Authorization: `Basic ${auth}`, Accept: 'application/json' },
    });
    const body = await r.text();
    if (!r.ok) {
      return res.status(r.status).json({
        error:   `Jira returned ${r.status} ${r.statusText}`,
        details: body.slice(0, 800),
      });
    }
    res.json(JSON.parse(body));
  } catch (err) {
    res.status(500).json({ error: `Network error: ${err.message}` });
  }
};
