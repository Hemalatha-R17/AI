'use strict';

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { prompt, model, groqKey: bodyKey } = req.body || {};
  const apiKey  = bodyKey || process.env.GROQ_KEY;
  const modelId = model  || 'llama-3.3-70b-versatile';

  if (!apiKey) return res.status(400).json({ error: 'GROQ API key missing. Open ⚙ Settings.' });
  if (!prompt) return res.status(400).json({ error: 'No prompt provided.' });

  try {
    const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
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

    const text = await r.text();
    if (!r.ok) {
      return res.status(r.status).json({ error: `GROQ error ${r.status}`, details: text.slice(0, 800) });
    }

    const data    = JSON.parse(text);
    const content = data.choices?.[0]?.message?.content || '';
    res.json({ content, model: data.model, usage: data.usage });
  } catch (err) {
    res.status(500).json({ error: `Request failed: ${err.message}` });
  }
};
