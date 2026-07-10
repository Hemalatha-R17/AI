import json
from functools import lru_cache
from typing import Iterator

from groq import Groq

from app.config import GROQ_API_KEY, GROQ_MODEL

SAMPLE_QUESTIONS_PROMPT = (
    "You write example questions for a document Q&A demo. Given the excerpts "
    "below from a single document, write {count} short, diverse questions a "
    "curious reader could ask that are answerable from these excerpts. "
    "Respond with ONLY a JSON array of {count} strings, no markdown, no commentary."
)

SYSTEM_PROMPT = (
    "You are a helpful assistant answering questions about a document uploaded "
    "by the user. Answer strictly using the provided context chunks. "
    "If the context does not contain the answer, say you don't have enough "
    "information in the document. Keep answers concise and cite which chunk "
    "number(s) you used, e.g. [chunk 1]. Respond in plain text only: no markdown "
    "formatting, no asterisks, no numbered or bulleted list syntax."
)


@lru_cache(maxsize=1)
def get_client() -> Groq:
    if not GROQ_API_KEY:
        raise RuntimeError(
            "GROQ_API_KEY is not set. Add it to backend/.env before querying."
        )
    return Groq(api_key=GROQ_API_KEY)


def build_messages(question: str, context_chunks: list[str]) -> list[dict]:
    context_block = "\n\n".join(
        f"[chunk {i + 1}]\n{chunk}" for i, chunk in enumerate(context_chunks)
    )
    user_prompt = (
        f"Context chunks retrieved from the document:\n\n{context_block}\n\n"
        f"Question: {question}"
    )
    return [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": user_prompt},
    ]


def estimate_tokens(text: str) -> int:
    """Rough token estimate (~4 chars/token for English) — Groq's streaming
    API doesn't return real usage counts, so this is an approximation."""
    return max(1, round(len(text) / 4))


def generate_answer(messages: list[dict]) -> str:
    client = get_client()
    completion = client.chat.completions.create(
        model=GROQ_MODEL,
        messages=messages,
        temperature=0.2,
        max_tokens=800,
    )
    return completion.choices[0].message.content


def generate_sample_questions(chunks: list[str], count: int = 4) -> list[str]:
    excerpt = "\n\n".join(chunks)[:4000]
    client = get_client()
    completion = client.chat.completions.create(
        model=GROQ_MODEL,
        messages=[
            {"role": "system", "content": SAMPLE_QUESTIONS_PROMPT.format(count=count)},
            {"role": "user", "content": excerpt},
        ],
        temperature=0.4,
        max_tokens=300,
    )
    raw = completion.choices[0].message.content.strip()
    raw = raw.removeprefix("```json").removeprefix("```").removesuffix("```").strip()
    questions = json.loads(raw)
    return [str(q).strip() for q in questions if str(q).strip()][:count]


def stream_answer(messages: list[dict]) -> Iterator[str]:
    client = get_client()
    stream = client.chat.completions.create(
        model=GROQ_MODEL,
        messages=messages,
        temperature=0.2,
        max_tokens=800,
        stream=True,
    )
    for chunk in stream:
        delta = chunk.choices[0].delta.content
        if delta:
            yield delta
