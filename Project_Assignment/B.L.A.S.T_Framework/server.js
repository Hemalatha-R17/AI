'use strict';
require('dotenv').config();
const express = require('express');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 8787;

app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

/* ── helpers ─────────────────────────────────────────────────── */

const jiraBase = (raw) =>
  (raw || '')
    .replace(/\/browse\/.*$/,  '')
    .replace(/\/rest\/.*/,     '')
    .replace(/\/$/,            '');

/* ── health / env probe ──────────────────────────────────────── */

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    env: {
      hasGroqKey:   !!process.env.GROQ_KEY,
      hasJiraEmail: !!process.env.JIRA_EMAIL,
      hasJiraToken: !!process.env.JIRA_API_TOKEN,
      jiraBase:     jiraBase(process.env.JIRA_URL) || null,
    },
  });
});

/* ── Jira proxy ──────────────────────────────────────────────── */

app.get('/api/jira/:issueId', async (req, res) => {
  const { issueId } = req.params;

  const base  = req.query.jiraUrl   ? jiraBase(req.query.jiraUrl)  : jiraBase(process.env.JIRA_URL);
  const email = req.query.jiraEmail || process.env.JIRA_EMAIL;
  const token = req.query.jiraToken || process.env.JIRA_API_TOKEN;

  if (!base || !email || !token) {
    return res.status(400).json({ error: 'Jira config missing. Open ⚙ Settings and fill in Jira fields.' });
  }

  const url  = `${base}/rest/api/3/issue/${encodeURIComponent(issueId)}`;
  const auth = Buffer.from(`${email}:${token}`).toString('base64');

  try {
    const r    = await fetch(url, { headers: { Authorization: `Basic ${auth}`, Accept: 'application/json' } });
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
});

/* ── GROQ proxy ──────────────────────────────────────────────── */

app.post('/api/generate', async (req, res) => {
  const { prompt, model, groqKey: bodyKey } = req.body;
  const apiKey  = bodyKey || process.env.GROQ_KEY;
  const modelId = model  || 'llama-3.3-70b-versatile';

  if (!apiKey)  return res.status(400).json({ error: 'GROQ API key missing. Open ⚙ Settings.' });
  if (!prompt)  return res.status(400).json({ error: 'No prompt provided.' });

  try {
    const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: modelId,
        messages: [
          {
            role: 'system',
            content:
              'You are a Senior QA Engineer with 15+ years of experience. ' +
              'Generate precise, professional, structured test artifacts in clean Markdown. ' +
              'Follow the B.L.A.S.T Framework (Blueprint → Link → Architect → Stylize → Trigger). ' +
              'Never invent data not present in the input. Mark inferences with [INFERENCE] and assumptions with [ASSUMPTION].',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.2,
        max_tokens:  4096,
      }),
    });

    const body = await r.text();
    if (!r.ok) {
      return res.status(r.status).json({ error: `GROQ error ${r.status}`, details: body.slice(0, 800) });
    }

    const data    = JSON.parse(body);
    const content = data.choices?.[0]?.message?.content || '';
    res.json({ content, model: data.model, usage: data.usage });
  } catch (err) {
    res.status(500).json({ error: `Request failed: ${err.message}` });
  }
});

/* ── start ───────────────────────────────────────────────────── */

app.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════════╗
  ║  🚀  B.L.A.S.T Test Plan Generator       ║
  ║      http://localhost:${PORT}               ║
  ╚═══════════════════════════════════════════╝
  `);
});
