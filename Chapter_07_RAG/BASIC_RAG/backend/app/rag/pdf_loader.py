from dataclasses import dataclass
from pathlib import Path

from pypdf import PdfReader


@dataclass
class PageText:
    page_number: int
    text: str


def load_pdf_pages(pdf_path: Path) -> list[PageText]:
    reader = PdfReader(str(pdf_path))
    pages = []
    for i, page in enumerate(reader.pages, start=1):
        text = page.extract_text() or ""
        if text.strip():
            pages.append(PageText(page_number=i, text=text))
    return pages
