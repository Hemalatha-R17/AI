import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

BACKEND_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BACKEND_DIR.parent / "data" / "data"
CHROMA_DIR = BACKEND_DIR / "chroma_store"

COLLECTION_NAME = "vwo_prd"

EMBEDDING_MODEL_NAME = "nomic-ai/nomic-embed-text-v1.5"
EMBEDDING_DIM = 768

CHUNK_SIZE = 800
CHUNK_OVERLAP = 120
TOP_K = 4

CHUNK_SIZE_MIN, CHUNK_SIZE_MAX = 200, 1500
CHUNK_OVERLAP_MIN, CHUNK_OVERLAP_MAX = 0, 400
TOP_K_MIN, TOP_K_MAX = 1, 8

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_MODEL = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")
