import json
from datetime import datetime, timezone
from functools import lru_cache

import chromadb
from chromadb.api.collection_configuration import CreateCollectionConfiguration, HNSWConfiguration

from app.config import CHROMA_DIR, COLLECTION_NAME

_HNSW_CONFIG = CreateCollectionConfiguration(hnsw=HNSWConfiguration(space="cosine"))
_REGISTRY_FILE = CHROMA_DIR / "documents.json"


@lru_cache(maxsize=1)
def get_client() -> chromadb.ClientAPI:
    CHROMA_DIR.mkdir(parents=True, exist_ok=True)
    return chromadb.PersistentClient(path=str(CHROMA_DIR))


def get_collection():
    client = get_client()
    return client.get_or_create_collection(name=COLLECTION_NAME, configuration=_HNSW_CONFIG)


def reset_collection():
    """Wipes every ingested document and the document registry."""
    client = get_client()
    try:
        client.delete_collection(COLLECTION_NAME)
    except Exception:
        pass
    save_registry({"active_id": None, "documents": {}})
    return client.get_or_create_collection(name=COLLECTION_NAME, configuration=_HNSW_CONFIG)


def load_registry() -> dict:
    if not _REGISTRY_FILE.exists():
        return {"active_id": None, "documents": {}}
    try:
        return json.loads(_REGISTRY_FILE.read_text(encoding="utf-8"))
    except (ValueError, OSError):
        return {"active_id": None, "documents": {}}


def save_registry(registry: dict):
    CHROMA_DIR.mkdir(parents=True, exist_ok=True)
    _REGISTRY_FILE.write_text(json.dumps(registry, indent=2), encoding="utf-8")


def get_active_document(registry: dict | None = None) -> dict | None:
    registry = registry if registry is not None else load_registry()
    active_id = registry.get("active_id")
    if not active_id:
        return None
    return registry.get("documents", {}).get(active_id)


def upsert_document(
    document_id: str,
    filename: str,
    chunk_size: int,
    chunk_overlap: int,
    chunk_count: int,
    sample_questions: list[str],
) -> dict:
    registry = load_registry()
    entry = {
        "id": document_id,
        "filename": filename,
        "chunk_size": chunk_size,
        "chunk_overlap": chunk_overlap,
        "chunk_count": chunk_count,
        "sample_questions": sample_questions,
        "ingested_at": datetime.now(timezone.utc).isoformat(),
    }
    registry.setdefault("documents", {})[document_id] = entry
    registry["active_id"] = document_id
    save_registry(registry)
    return registry


def activate_document(document_id: str) -> dict:
    registry = load_registry()
    if document_id not in registry.get("documents", {}):
        raise KeyError(document_id)
    registry["active_id"] = document_id
    save_registry(registry)
    return registry


def remove_document(collection, document_id: str) -> dict:
    collection.delete(where={"document_id": document_id})
    registry = load_registry()
    registry.get("documents", {}).pop(document_id, None)
    if registry.get("active_id") == document_id:
        remaining = list(registry.get("documents", {}).values())
        remaining.sort(key=lambda d: d["ingested_at"], reverse=True)
        registry["active_id"] = remaining[0]["id"] if remaining else None
    save_registry(registry)
    return registry
