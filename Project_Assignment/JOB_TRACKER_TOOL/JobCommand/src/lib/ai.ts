interface AIMessage { role: 'user' | 'assistant'; content: string }
interface AIProviderCreds { id: string; apiKey: string; model: string }

export async function callAI(provider: AIProviderCreds, messages: AIMessage[]): Promise<string> {
  const msgs = messages.map((m) => ({ role: m.role, content: m.content }));

  if (provider.id === 'gemini') {
    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${provider.model}:generateContent?key=${provider.apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: msgs.map((m) => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }],
          })),
        }),
      }
    );
    if (!resp.ok) throw new Error(await resp.text());
    const data = await resp.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response';
  }

  if (provider.id === 'claude') {
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': provider.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({ model: provider.model, max_tokens: 2048, messages: msgs }),
    });
    if (!resp.ok) throw new Error(await resp.text());
    const data = await resp.json();
    return data.content?.[0]?.text || 'No response';
  }

  // OpenAI-compatible: Groq, OpenRouter, Mistral, OpenAI
  const baseUrls: Record<string, string> = {
    groq:       'https://api.groq.com/openai/v1',
    openrouter: 'https://openrouter.ai/api/v1',
    mistral:    'https://api.mistral.ai/v1',
    openai:     'https://api.openai.com/v1',
  };
  const baseUrl = baseUrls[provider.id] || 'https://api.openai.com/v1';
  const resp = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${provider.apiKey}` },
    body: JSON.stringify({ model: provider.model, messages: msgs, max_tokens: 2048 }),
  });
  if (!resp.ok) throw new Error(await resp.text());
  const data = await resp.json();
  return data.choices?.[0]?.message?.content || 'No response';
}
