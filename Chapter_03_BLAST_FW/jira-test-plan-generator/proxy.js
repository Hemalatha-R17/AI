// proxy.js — Local CORS proxy for Jira REST API
// Browser → http://localhost:3001/jira/* → https://yourname.atlassian.net/*
// Runs alongside Vite via `npm run dev` (concurrently)

import http from 'http'
import https from 'https'

const PORT = 3001

http.createServer((req, res) => {
  // Echo the request origin so credentials work with any Vite port
  const origin = req.headers.origin || 'http://localhost:5173'
  res.setHeader('Access-Control-Allow-Origin', origin)
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Accept, x-jira-base-url')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Vary', 'Origin')

  // Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204)
    return res.end()
  }

  const jiraBaseUrl = req.headers['x-jira-base-url']

  if (!jiraBaseUrl || !req.url.startsWith('/jira/')) {
    res.writeHead(400, { 'Content-Type': 'application/json' })
    return res.end(JSON.stringify({ error: 'Missing x-jira-base-url header or path must start with /jira/' }))
  }

  // Strip /jira prefix → forward the rest to Jira
  const apiPath = req.url.slice('/jira'.length)

  let target
  try {
    target = new URL(jiraBaseUrl.replace(/\/$/, '') + apiPath)
  } catch {
    res.writeHead(400, { 'Content-Type': 'application/json' })
    return res.end(JSON.stringify({ error: 'Invalid Jira base URL in x-jira-base-url header' }))
  }

  const transport = target.protocol === 'https:' ? https : http
  const options = {
    hostname: target.hostname,
    port: target.port || (target.protocol === 'https:' ? 443 : 80),
    path: target.pathname + target.search,
    method: 'GET',
    headers: {
      Authorization: req.headers.authorization || '',
      Accept: 'application/json',
      'User-Agent': 'jira-test-plan-generator/1.0',
    },
  }

  const proxyReq = transport.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, {
      'Content-Type': proxyRes.headers['content-type'] || 'application/json',
      'Access-Control-Allow-Origin': origin,
    })
    proxyRes.pipe(res)
  })

  proxyReq.on('error', (err) => {
    if (!res.headersSent) {
      res.writeHead(502, { 'Content-Type': 'application/json' })
    }
    res.end(JSON.stringify({ error: `Proxy upstream error: ${err.message}` }))
  })

  proxyReq.end()
}).listen(PORT, '127.0.0.1', () => {
  console.log(`\x1b[35m[proxy]\x1b[0m Jira CORS proxy  →  http://localhost:${PORT}`)
  console.log(`\x1b[35m[proxy]\x1b[0m Routes: /jira/* → {x-jira-base-url}/*`)
})
