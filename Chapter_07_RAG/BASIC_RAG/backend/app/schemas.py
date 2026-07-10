from pydantic import BaseModel, Field, model_validator

from app.config import (
    CHUNK_OVERLAP,
    CHUNK_OVERLAP_MAX,
    CHUNK_OVERLAP_MIN,
    CHUNK_SIZE,
    CHUNK_SIZE_MAX,
    CHUNK_SIZE_MIN,
    TOP_K,
    TOP_K_MAX,
    TOP_K_MIN,
)


class UploadResponse(BaseModel):
    filename: str
    size_bytes: int


class IngestRequest(BaseModel):
    chunk_size: int = Field(default=CHUNK_SIZE, ge=CHUNK_SIZE_MIN, le=CHUNK_SIZE_MAX)
    chunk_overlap: int = Field(default=CHUNK_OVERLAP, ge=CHUNK_OVERLAP_MIN, le=CHUNK_OVERLAP_MAX)
    document_id: str | None = None

    @model_validator(mode="after")
    def check_overlap_smaller_than_size(self):
        if self.chunk_overlap >= self.chunk_size:
            raise ValueError("chunk_overlap must be smaller than chunk_size")
        return self


class IngestResponse(BaseModel):
    document_id: str
    source_pdf: str
    page_count: int
    chunk_count: int
    embedding_model: str
    embedding_dim: int
    collection_name: str
    chunk_size: int
    chunk_overlap: int
    sample_questions: list[str] = []


class DocumentInfo(BaseModel):
    id: str
    filename: str
    chunk_count: int
    chunk_size: int
    chunk_overlap: int
    sample_questions: list[str] = []
    ingested_at: str


class StatusResponse(BaseModel):
    ingested: bool
    chunk_count: int
    source_pdf: str | None
    embedding_model: str
    collection_name: str
    chunk_size: int | None = None
    chunk_overlap: int | None = None
    sample_questions: list[str] = []
    active_document_id: str | None = None
    documents: list[DocumentInfo] = []


class QueryRequest(BaseModel):
    question: str
    top_k: int = Field(default=TOP_K, ge=TOP_K_MIN, le=TOP_K_MAX)


class RetrievedChunk(BaseModel):
    rank: int
    chunk_id: str
    text: str
    page_number: int
    similarity: float


class PromptMessage(BaseModel):
    role: str
    content: str


class QueryResponse(BaseModel):
    question: str
    retrieved_chunks: list[RetrievedChunk]
    candidate_similarities: list[float] = []
    answer: str
    llm_model: str
    retrieval_ms: float
    generation_ms: float
    prompt: list[PromptMessage] = []
    prompt_tokens_est: int = 0
    completion_tokens_est: int = 0


class ResetResponse(BaseModel):
    ok: bool
