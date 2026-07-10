import csv
import json
from pathlib import Path

from app.rag.pdf_loader import PageText, load_pdf_pages

SUPPORTED_EXTENSIONS = {".pdf", ".txt", ".csv", ".json"}


def load_txt_pages(path: Path) -> list[PageText]:
    text = path.read_text(encoding="utf-8", errors="ignore")
    return [PageText(page_number=1, text=text)] if text.strip() else []


def load_csv_pages(path: Path) -> list[PageText]:
    pages = []
    with path.open(encoding="utf-8", errors="ignore", newline="") as f:
        reader = csv.DictReader(f)
        for i, row in enumerate(reader, start=1):
            text = ", ".join(f"{k}: {v}" for k, v in row.items() if k)
            if text.strip():
                pages.append(PageText(page_number=i, text=text))
    return pages


def load_json_pages(path: Path) -> list[PageText]:
    data = json.loads(path.read_text(encoding="utf-8", errors="ignore"))
    pages = []
    if isinstance(data, list):
        for i, item in enumerate(data, start=1):
            text = json.dumps(item, ensure_ascii=False, indent=2)
            if text.strip():
                pages.append(PageText(page_number=i, text=text))
    else:
        text = json.dumps(data, ensure_ascii=False, indent=2)
        if text.strip():
            pages.append(PageText(page_number=1, text=text))
    return pages


def load_source_pages(path: Path) -> list[PageText]:
    suffix = path.suffix.lower()
    if suffix == ".pdf":
        return load_pdf_pages(path)
    if suffix == ".txt":
        return load_txt_pages(path)
    if suffix == ".csv":
        return load_csv_pages(path)
    if suffix == ".json":
        return load_json_pages(path)
    raise ValueError(f"Unsupported file type: {suffix}")


def find_source_file(data_dir: Path) -> Path:
    candidates = [p for p in data_dir.iterdir() if p.suffix.lower() in SUPPORTED_EXTENSIONS]
    if not candidates:
        raise FileNotFoundError(
            f"No supported file found in {data_dir}. Upload a PDF, TXT, CSV, or JSON file."
        )
    return max(candidates, key=lambda p: p.stat().st_mtime)
