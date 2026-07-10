from app.rag.embeddings import embed_query
from app.schemas import RetrievedChunk


def retrieve_chunks(
    collection, question: str, top_k: int, document_id: str, candidate_k: int = 0
) -> tuple[list[RetrievedChunk], list[float]]:
    """Returns the top-k retrieved chunks plus a wider list of candidate
    similarity scores (for visualizing the retrieval drop-off), both scoped
    to the given document."""
    query_embedding = embed_query(question)
    n_results = max(top_k, candidate_k) or top_k
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=n_results,
        where={"document_id": document_id},
        include=["documents", "metadatas", "distances"],
    )

    ids = results["ids"][0]
    docs = results["documents"][0]
    metas = results["metadatas"][0]
    distances = results["distances"][0]
    similarities = [round(1 - d, 4) for d in distances]

    retrieved: list[RetrievedChunk] = []
    for rank, (chunk_id, text, meta, similarity) in enumerate(
        zip(ids, docs, metas, similarities), start=1
    ):
        if rank > top_k:
            break
        retrieved.append(
            RetrievedChunk(
                rank=rank,
                chunk_id=chunk_id,
                text=text,
                page_number=meta["page_number"],
                similarity=similarity,
            )
        )

    return retrieved, similarities
