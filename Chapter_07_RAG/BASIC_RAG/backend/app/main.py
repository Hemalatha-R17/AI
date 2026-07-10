import json
import time
from pathlib import Path

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

from app.config import (
    COLLECTION_NAME,
    DATA_DIR,
    EMBEDDING_DIM,
    EMBEDDING_MODEL_NAME,
    GROQ_MODEL,
)
from app.rag.chunker import chunk_pages
from app.rag.embeddings import embed_documents
from app.rag.file_loader import SUPPORTED_EXTENSIONS, find_source_file, load_source_pages
from app.rag.llm import (
    build_messages,
    estimate_tokens,
    generate_answer,
    generate_sample_questions,
    get_client as get_llm_client,
    stream_answer,
)
from app.rag.pdf_loader import PageText
from app.rag.retriever import retrieve_chunks
from app.rag.vector_store import (
    activate_document,
    get_active_document,
    get_collection,
    load_registry,
    remove_document,
    reset_collection,
    upsert_document,
)
from app.schemas import (
    DocumentInfo,
    IngestRequest,
    IngestResponse,
    QueryRequest,
    QueryResponse,
    ResetResponse,
    StatusResponse,
    UploadResponse,
)

MAX_UPLOAD_BYTES = 20 * 1024 * 1024  # 20 MB
CANDIDATE_K = 12  # wider candidate pool shown in the similarity drop-off chart

app = FastAPI(title="RAG Explorer API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _build_status() -> StatusResponse:
    registry = load_registry()
    active_doc = get_active_document(registry)
    documents = sorted(
        registry.get("documents", {}).values(), key=lambda d: d["ingested_at"], reverse=True
    )
    return StatusResponse(
        ingested=active_doc is not None,
        chunk_count=active_doc["chunk_count"] if active_doc else 0,
        source_pdf=active_doc["filename"] if active_doc else None,
        embedding_model=EMBEDDING_MODEL_NAME,
        collection_name=COLLECTION_NAME,
        chunk_size=active_doc["chunk_size"] if active_doc else None,
        chunk_overlap=active_doc["chunk_overlap"] if active_doc else None,
        sample_questions=active_doc["sample_questions"] if active_doc else [],
        active_document_id=registry.get("active_id"),
        documents=[DocumentInfo(**d) for d in documents],
    )


@app.get("/api/status", response_model=StatusResponse)
def status():
    return _build_status()


@app.post("/api/reset", response_model=ResetResponse)
def reset():
    reset_collection()
    return ResetResponse(ok=True)


@app.post("/api/documents/{document_id}/activate", response_model=StatusResponse)
def activate(document_id: str):
    try:
        activate_document(document_id)
    except KeyError:
        raise HTTPException(status_code=404, detail=f"Document '{document_id}' not found.")
    return _build_status()


@app.delete("/api/documents/{document_id}", response_model=StatusResponse)
def delete_document(document_id: str):
    registry = load_registry()
    if document_id not in registry.get("documents", {}):
        raise HTTPException(status_code=404, detail=f"Document '{document_id}' not found.")
    collection = get_collection()
    remove_document(collection, document_id)
    return _build_status()


@app.post("/api/upload", response_model=UploadResponse)
async def upload(file: UploadFile = File(...)):
    suffix = Path(file.filename or "").suffix.lower()
    if suffix not in SUPPORTED_EXTENSIONS:
        allowed = ", ".join(sorted(SUPPORTED_EXTENSIONS))
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{suffix or 'unknown'}'. Allowed: {allowed}.",
        )

    contents = await file.read()
    if len(contents) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="File too large (max 20MB).")
    if not contents:
        raise HTTPException(status_code=422, detail="Uploaded file is empty.")

    safe_name = Path(file.filename).name
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    (DATA_DIR / safe_name).write_bytes(contents)

    return UploadResponse(filename=safe_name, size_bytes=len(contents))


def _prepare_ingest(request: IngestRequest) -> tuple[Path, list[PageText]]:
    if request.document_id:
        source_path = DATA_DIR / request.document_id
        if not source_path.exists():
            raise FileNotFoundError(
                f"'{request.document_id}' was not found in {DATA_DIR}. Re-upload it to ingest again."
            )
    else:
        # No specific document requested — pick the most recently uploaded file
        # (used for the very first ingest / the bundled sample PDF).
        source_path = find_source_file(DATA_DIR)
    try:
        pages = load_source_pages(source_path)
    except Exception as exc:
        raise ValueError(f"Could not parse file: {exc}")
    if not pages:
        raise ValueError("No extractable text found in file.")
    return source_path, pages


def _run_ingest(request: IngestRequest, source_path: Path, pages: list[PageText]):
    """Generator yielding real ingestion progress events, ending with a 'done' event
    shaped like IngestResponse."""
    yield {"type": "step", "message": f"Parsed {len(pages)} page(s) from {source_path.name}"}

    yield {
        "type": "step",
        "message": f"Chunking (size {request.chunk_size}, overlap {request.chunk_overlap})…",
    }
    chunks = chunk_pages(pages, chunk_size=request.chunk_size, chunk_overlap=request.chunk_overlap)
    if not chunks:
        raise ValueError("Chunking produced no chunks.")
    yield {"type": "step", "message": f"Created {len(chunks)} chunk(s)"}

    yield {"type": "step", "message": "Embedding chunks with Nomic Embed…"}
    embeddings = embed_documents([c.text for c in chunks])
    yield {"type": "step", "message": f"Embedded {len(chunks)} chunk(s)"}

    document_id = source_path.name
    collection = get_collection()

    yield {"type": "step", "message": "Storing in ChromaDB…"}
    remove_document(collection, document_id)  # idempotent re-ingest of the same file
    collection.add(
        ids=[f"{document_id}::{c.id}" for c in chunks],
        embeddings=embeddings,
        documents=[c.text for c in chunks],
        metadatas=[
            {"page_number": c.page_number, "chunk_index": c.chunk_index, "document_id": document_id}
            for c in chunks
        ],
    )
    yield {"type": "step", "message": f"Stored {len(chunks)} chunk(s) in ChromaDB"}

    yield {"type": "step", "message": "Generating sample questions…"}
    sample_questions: list[str] = []
    try:
        stride = max(1, len(chunks) // 6)
        sample_texts = [c.text for c in chunks[::stride]][:6]
        sample_questions = generate_sample_questions(sample_texts)
        yield {"type": "step", "message": f"Generated {len(sample_questions)} sample question(s)"}
    except Exception:
        yield {"type": "step", "message": "Sample question generation skipped (Groq unavailable)"}

    upsert_document(
        document_id,
        source_path.name,
        request.chunk_size,
        request.chunk_overlap,
        len(chunks),
        sample_questions,
    )

    yield {
        "type": "done",
        "document_id": document_id,
        "source_pdf": source_path.name,
        "page_count": len(pages),
        "chunk_count": len(chunks),
        "embedding_model": EMBEDDING_MODEL_NAME,
        "embedding_dim": EMBEDDING_DIM,
        "collection_name": COLLECTION_NAME,
        "chunk_size": request.chunk_size,
        "chunk_overlap": request.chunk_overlap,
        "sample_questions": sample_questions,
    }


@app.post("/api/ingest", response_model=IngestResponse)
def ingest(request: IngestRequest = IngestRequest()):
    try:
        source_path, pages = _prepare_ingest(request)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))

    result = None
    for event in _run_ingest(request, source_path, pages):
        if event["type"] == "done":
            result = event
    return IngestResponse(**{k: v for k, v in result.items() if k != "type"})


@app.post("/api/ingest/stream")
def ingest_stream(request: IngestRequest = IngestRequest()):
    try:
        source_path, pages = _prepare_ingest(request)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))

    def event_stream():
        try:
            for event in _run_ingest(request, source_path, pages):
                yield json.dumps(event) + "\n"
        except Exception as exc:
            yield json.dumps({"type": "error", "message": str(exc)}) + "\n"

    return StreamingResponse(event_stream(), media_type="application/x-ndjson")


@app.post("/api/query", response_model=QueryResponse)
def query(request: QueryRequest):
    if not request.question.strip():
        raise HTTPException(status_code=400, detail="Question must not be empty.")

    active_doc = get_active_document()
    if not active_doc:
        raise HTTPException(
            status_code=409, detail="No documents ingested yet. Run /api/ingest first."
        )

    collection = get_collection()
    retrieval_start = time.perf_counter()
    retrieved, candidate_similarities = retrieve_chunks(
        collection, request.question, request.top_k, active_doc["id"], candidate_k=CANDIDATE_K
    )
    retrieval_ms = (time.perf_counter() - retrieval_start) * 1000

    messages = build_messages(request.question, [c.text for c in retrieved])
    prompt_tokens_est = sum(estimate_tokens(m["content"]) for m in messages)

    generation_start = time.perf_counter()
    try:
        answer = generate_answer(messages)
    except RuntimeError as exc:
        raise HTTPException(status_code=500, detail=str(exc))
    generation_ms = (time.perf_counter() - generation_start) * 1000

    return QueryResponse(
        question=request.question,
        retrieved_chunks=retrieved,
        candidate_similarities=candidate_similarities,
        answer=answer,
        llm_model=GROQ_MODEL,
        retrieval_ms=retrieval_ms,
        generation_ms=generation_ms,
        prompt=messages,
        prompt_tokens_est=prompt_tokens_est,
        completion_tokens_est=estimate_tokens(answer),
    )


@app.post("/api/query/stream")
def query_stream(request: QueryRequest):
    if not request.question.strip():
        raise HTTPException(status_code=400, detail="Question must not be empty.")

    active_doc = get_active_document()
    if not active_doc:
        raise HTTPException(
            status_code=409, detail="No documents ingested yet. Run /api/ingest first."
        )

    try:
        get_llm_client()
    except RuntimeError as exc:
        raise HTTPException(status_code=500, detail=str(exc))

    collection = get_collection()
    retrieval_start = time.perf_counter()
    retrieved, candidate_similarities = retrieve_chunks(
        collection, request.question, request.top_k, active_doc["id"], candidate_k=CANDIDATE_K
    )
    retrieval_ms = (time.perf_counter() - retrieval_start) * 1000

    messages = build_messages(request.question, [c.text for c in retrieved])
    prompt_tokens_est = sum(estimate_tokens(m["content"]) for m in messages)

    def event_stream():
        yield json.dumps(
            {
                "type": "retrieved",
                "chunks": [c.model_dump() for c in retrieved],
                "candidate_similarities": candidate_similarities,
                "prompt": messages,
                "prompt_tokens_est": prompt_tokens_est,
            }
        ) + "\n"
        generation_start = time.perf_counter()
        answer_parts: list[str] = []
        try:
            for token in stream_answer(messages):
                answer_parts.append(token)
                yield json.dumps({"type": "token", "text": token}) + "\n"
        except Exception as exc:
            yield json.dumps({"type": "error", "message": str(exc)}) + "\n"
            return
        generation_ms = (time.perf_counter() - generation_start) * 1000
        yield json.dumps(
            {
                "type": "done",
                "llm_model": GROQ_MODEL,
                "retrieval_ms": retrieval_ms,
                "generation_ms": generation_ms,
                "completion_tokens_est": estimate_tokens("".join(answer_parts)),
            }
        ) + "\n"

    return StreamingResponse(event_stream(), media_type="application/x-ndjson")
