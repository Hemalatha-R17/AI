const BASE_URL = "http://localhost:8000";

function formatDetail(detail) {
  if (Array.isArray(detail)) {
    return detail.map((e) => e.msg || JSON.stringify(e)).join("; ");
  }
  return detail;
}

async function handle(response) {
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(formatDetail(body.detail) || `Request failed with status ${response.status}`);
  }
  return response.json();
}

async function streamNDJSON(response, onEvent) {
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(formatDetail(body.detail) || `Request failed with status ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let newlineIndex;
    while ((newlineIndex = buffer.indexOf("\n")) >= 0) {
      const line = buffer.slice(0, newlineIndex).trim();
      buffer = buffer.slice(newlineIndex + 1);
      if (!line) continue;
      const event = JSON.parse(line);
      if (event.type === "error") throw new Error(event.message);
      onEvent(event);
    }
  }
}

export function getStatus() {
  return fetch(`${BASE_URL}/api/status`).then(handle);
}

export function uploadFile(file) {
  const formData = new FormData();
  formData.append("file", file);
  return fetch(`${BASE_URL}/api/upload`, { method: "POST", body: formData }).then(handle);
}

export async function streamIngest(chunkSize, chunkOverlap, documentId, onEvent) {
  const response = await fetch(`${BASE_URL}/api/ingest/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chunk_size: chunkSize,
      chunk_overlap: chunkOverlap,
      document_id: documentId || null,
    }),
  });
  await streamNDJSON(response, onEvent);
}

export function activateDocument(documentId) {
  return fetch(`${BASE_URL}/api/documents/${encodeURIComponent(documentId)}/activate`, {
    method: "POST",
  }).then(handle);
}

export function deleteDocument(documentId) {
  return fetch(`${BASE_URL}/api/documents/${encodeURIComponent(documentId)}`, {
    method: "DELETE",
  }).then(handle);
}

export async function streamQuestion(question, topK, onEvent) {
  const response = await fetch(`${BASE_URL}/api/query/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, top_k: topK }),
  });
  await streamNDJSON(response, onEvent);
}
