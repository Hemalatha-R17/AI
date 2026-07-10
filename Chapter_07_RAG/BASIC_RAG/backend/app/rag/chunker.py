from dataclasses import dataclass

from app.rag.pdf_loader import PageText


@dataclass
class Chunk:
    id: str
    text: str
    page_number: int
    chunk_index: int


def chunk_pages(pages: list[PageText], chunk_size: int, chunk_overlap: int) -> list[Chunk]:
    """Splits each page's text into overlapping character-window chunks.

    A simple sliding window keeps the ingestion pipeline easy to follow end-to-end,
    which is the point of this demo app.
    """
    chunks: list[Chunk] = []
    global_index = 0

    for page in pages:
        text = " ".join(page.text.split())
        if not text:
            continue

        start = 0
        while start < len(text):
            end = min(start + chunk_size, len(text))
            piece = text[start:end].strip()
            if piece:
                chunks.append(
                    Chunk(
                        id=f"chunk-{global_index}",
                        text=piece,
                        page_number=page.page_number,
                        chunk_index=global_index,
                    )
                )
                global_index += 1
            if end == len(text):
                break
            start = end - chunk_overlap

    return chunks
