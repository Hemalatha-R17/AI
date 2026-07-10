from functools import lru_cache

from sentence_transformers import SentenceTransformer

from app.config import EMBEDDING_MODEL_NAME

# Nomic Embed expects task-specific prefixes on the raw text.
DOCUMENT_PREFIX = "search_document: "
QUERY_PREFIX = "search_query: "


@lru_cache(maxsize=1)
def get_embedding_model() -> SentenceTransformer:
    return SentenceTransformer(EMBEDDING_MODEL_NAME, trust_remote_code=True)


def embed_documents(texts: list[str]) -> list[list[float]]:
    model = get_embedding_model()
    prefixed = [DOCUMENT_PREFIX + t for t in texts]
    vectors = model.encode(prefixed, normalize_embeddings=True, show_progress_bar=False)
    return vectors.tolist()


def embed_query(text: str) -> list[float]:
    model = get_embedding_model()
    vector = model.encode(QUERY_PREFIX + text, normalize_embeddings=True, show_progress_bar=False)
    return vector.tolist()
