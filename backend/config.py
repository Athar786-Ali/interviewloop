"""
MIIC-Sec Configuration
All constants and settings in one place.
"""

import os

# ─── Database ────────────────────────────────────────────────────
DATABASE_URL = "sqlite:///./miic_sec.db"

# ─── RSA Keys ────────────────────────────────────────────────────
PRIVATE_KEY_PATH = "keys/private_key.pem"
PUBLIC_KEY_PATH = "keys/public_key.pem"
KEY_PASSWORD = b"miicsec_secret"

# ─── JWT ─────────────────────────────────────────────────────────
JWT_ALGORITHM = "RS256"
JWT_EXPIRY_HOURS = 2

# ─── Face Verification ──────────────────────────────────────────
FACE_SIMILARITY_THRESHOLD = 0.35   # facenet-pytorch VGGFace2 cosine similarity

# ─── Voice Verification ─────────────────────────────────────────
VOICE_SIMILARITY_THRESHOLD = 0.60  # wav2vec2 cosine similarity (5s login vs 10s enroll)

# ─── Continuous Verification ────────────────────────────────────
CONTINUOUS_VERIFY_INTERVAL = 30          # seconds
MAX_FAILURES_BEFORE_TERMINATE = 2

# ─── Ollama (Local LLM) ─────────────────────────────────────────
OLLAMA_URL = os.environ.get("OLLAMA_URL", "http://localhost:11434")
OLLAMA_MODEL = "qwen2.5:7b"
OLLAMA_FALLBACK_MODEL = "qwen2.5:3b"

# ─── Deepgram (Speech-to-Text) ──────────────────────────────────
# API key is loaded from DEEPGRAM_API_KEY env var in backend/.env
DEEPGRAM_MODEL    = "nova-2"
DEEPGRAM_LANGUAGE = "en-IN"    # Indian English; change to "en" for global

# ─── YOLO (Object Detection) ────────────────────────────────────
YOLO_MODEL = "yolov8n.pt"
