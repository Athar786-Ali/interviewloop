<div align="center">

<img src="https://img.shields.io/badge/MIIC--Sec-AI%20Interview%20Platform-6366f1?style=for-the-badge&logo=shield&logoColor=white" />

# 🛡️ MIIC-Sec
### AI-Powered Secure Mock Interview & Career Accelerator Platform

<p>
  <img src="https://img.shields.io/github/stars/Athar786-Ali/miic-sec?style=flat-square&logo=github&label=Stars&color=FFD700" />
  <img src="https://img.shields.io/github/forks/Athar786-Ali/miic-sec?style=flat-square&logo=github&label=Forks&color=6366f1" />
  <img src="https://img.shields.io/github/issues/Athar786-Ali/miic-sec?style=flat-square&logo=github&label=Issues&color=orange" />
  <img src="https://img.shields.io/github/issues-pr/Athar786-Ali/miic-sec?style=flat-square&logo=github&label=PRs&color=brightgreen" />
  <img src="https://img.shields.io/github/last-commit/Athar786-Ali/miic-sec?style=flat-square&logo=git&label=Last%20Commit&color=blue" />
</p>

<p>
  <img src="https://img.shields.io/badge/FastAPI-0.115-009688?style=flat-square&logo=fastapi&logoColor=white" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Python-3.11+-3776AB?style=flat-square&logo=python&logoColor=white" />
  <img src="https://img.shields.io/badge/Ollama-Qwen2.5:7b-FF6B35?style=flat-square" />
  <img src="https://img.shields.io/badge/Deepgram-nova--2-00E599?style=flat-square" />
  <img src="https://img.shields.io/badge/Security-RSA--2048%20%7C%20TOTP%20%7C%20Biometric-red?style=flat-square" />
  <img src="https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker&logoColor=white" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" />
</p>

<p>
  <b>A fully self-hosted, production-ready AI mock interview platform</b><br/>
  with 5-tier biometric security · adaptive LLM questioning · real-time Deepgram transcription<br/>
  cryptographically signed reports · live code editor · student career analytics
</p>

<p>
  <a href="#-what-this-project-does">What It Does</a> •
  <a href="#-live-demo--screenshots">Screenshots</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-architecture">Architecture</a> •
  <a href="#-security-model">Security</a> •
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-system-requirements">Requirements</a> •
  <a href="#-api-reference">API Reference</a> •
  <a href="#-changelog">Changelog</a> •
  <a href="#-privacy--data-policy">Privacy</a> •
  <a href="#-author">Author</a>
</p>

---

</div>

## 🎯 What This Project Does

MIIC-Sec is a **full-stack AI mock interview system** built as a major academic/personal project. It solves a real problem — students preparing for tech interviews have no way to practice in a secure, proctored, feedback-rich environment that mirrors real company interview conditions.

The platform combines:
- A **local AI interviewer** (Qwen2.5:7b via Ollama) that adapts difficulty in real-time
- **Biometric security** (face + voice + liveness + TOTP + multi-person detection) to prevent impersonation
- **Real-time voice transcription** via Deepgram (live streaming, no upload lag)
- **Cryptographically signed reports** (RSA-2048) that students can verify and share
- A **Monaco code editor** for coding questions (same engine as VS Code / LeetCode)

> **Built entirely from scratch** — no off-the-shelf interview platform, no pre-built auth library. Every security tier, AI pipeline, and UI component was designed and implemented independently.

---

## 🖼️ Live Demo & Screenshots

| Screen | Description |
|--------|-------------|
| `/enroll` | Multi-step biometric enrollment — face capture (5 angles) + voice + TOTP QR |
| `/login` | Face → Liveness → Voice → TOTP sequential auth with live camera feed |
| `/dashboard` | Score progress chart, interview history table, stats cards |
| `/interview` | 3-column layout: security panel + Q&A + stats. Voice or text input |
| `/report/:id` | Detailed per-question scores, emotion timeline, security audit, RSA signature |

---

## ✨ Key Features

### 🤖 Adaptive AI Interviewer
- **Local LLM** — Qwen2.5:7b via Ollama. Fully self-hosted. Zero data leaves your machine.
- **Adaptive difficulty** — sliding-window algorithm adjusts easy/medium/hard in real-time based on last 3 scores
- **3 Interview Modes** — Topic Based · Resume Based (AI reads your PDF) · Combined
- **3 Company AI Personas:**

| Persona | Target | AI Style |
|---------|--------|----------|
| 🏢 Service Based | TCS / Wipro / Infosys | CS fundamentals, OOP, SQL, verbal logic |
| 🚀 Product / FAANG | Google / Amazon / Microsoft | System design, edge cases, optimal complexity, cross-questioning |
| ⚡ Startup | Fast-paced product cos | Practical skills, frameworks, real-world problem solving |

### 🔐 5-Tier Biometric Security
| Tier | Technology | What It Checks |
|------|-----------|----------------|
| **1 — Face** | DeepFace (ArcFace model) | Biometric face match against enrolled embedding |
| **2 — Liveness** | Dlib + blink detection | Prevents photo/video spoofing |
| **3 — Voice** | wav2vec2-base (HuggingFace) | Voice biometric (cosine similarity ≥ 0.60) |
| **4 — TOTP** | PyOTP (RFC 6238) | 6-digit rotating code — Google Authenticator |
| **5 — Proctoring** | YOLOv8 + PyAnnote | Multi-person/speaker detection during interview |

### 🎙️ Real-Time Voice with Deepgram
- **Live WebSocket streaming** — Deepgram nova-2 model, `en-IN` language, smart formatting
- Short-lived **temp API keys** issued per session and revoked immediately after recording ends
- Fallback to typed input if microphone unavailable

### 📊 Cryptographic Reports
- **RSA-2048 + SHA-256** signed report JSON after every interview
- **Blockchain-style audit log** — every event linked by SHA-256 hash chain
- **Publicly verifiable** — `GET /report/:id/verify` returns `{ valid: true/false }`
- Shareable on LinkedIn

### 💻 Live Code Editor (Monaco)
- VS Code engine (same as LeetCode, GitHub Codespaces)
- 4 languages: Python · JavaScript · Java · C++
- Isolated Docker sandbox per execution (`--network none --memory 128m --cpus 0.5`)
- Bandit static analysis + custom pattern scanner before running

---

## 🛠️ Tech Stack

### Backend
| Layer | Technology | Why |
|-------|-----------|-----|
| API Framework | **FastAPI 0.115** | Async, fast, automatic OpenAPI docs |
| Database | **SQLAlchemy + SQLite** | Simple, portable, no external DB needed |
| AI / LLM | **Ollama + Qwen2.5:7b** | Self-hosted, private, no API cost |
| Face Auth | **DeepFace (ArcFace)** | State-of-the-art face recognition |
| Voice Auth | **HuggingFace wav2vec2** | Proven voice embedding model |
| Liveness | **Dlib + OpenCV** | Blink-based anti-spoofing |
| Multi-person | **YOLOv8 (Ultralytics)** | Real-time person detection |
| Transcription | **Deepgram nova-2 REST + WS** | Fast, accurate, Indian English optimised |
| Diarization | **PyAnnote.audio** | Multi-speaker detection |
| Cryptography | **`cryptography` (RSA-2048)** | Report signing, key management |
| Auth | **PyJWT (RS256) + PyOTP** | Stateless JWT + TOTP 2FA |
| Resume Parse | **PyPDF** | PDF text extraction |

### Frontend
| Layer | Technology | Why |
|-------|-----------|-----|
| Framework | **React 18 + Vite 5** | Fast HMR, optimised builds |
| Routing | **React Router v6** | Protected routes, SPA navigation |
| HTTP | **Axios** | Auth interceptor, 401 redirect |
| Charts | **Recharts** | Score progress + emotion timeline |
| Code Editor | **Monaco Editor** | VS Code engine in-browser |
| Styling | **Vanilla CSS** | Dark glassmorphism, no framework bloat |
| WebSocket | **Native WS API** | Real-time security events |

---

## 🏛️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        MIIC-Sec Platform                        │
│                                                                 │
│  React Frontend (Vite)         FastAPI Backend (port 8000)      │
│  ┌─────────────────┐           ┌───────────────────────────┐   │
│  │ /enroll         │◄──HTTP───►│ /auth/*   Biometrics      │   │
│  │ /login          │◄──WS─────►│ /interview/* LLM + AI     │   │
│  │ /dashboard      │           │ /user/*   Dashboard       │   │
│  │ /interview      │           │ /report/* Signed Reports  │   │
│  │ /report/:id     │           │ /security/* Proctoring    │   │
│  └─────────────────┘           │ /ws/*    Live Events      │   │
│                                └───────────┬───────────────┘   │
│                                            │                    │
│          ┌─────────────┬──────────┬────────┴──────────┐         │
│    ┌─────▼──────┐ ┌────▼─────┐ ┌──▼──────┐ ┌─────────▼──┐     │
│    │  Ollama    │ │ Deepgram │ │ SQLite  │ │  RSA-2048  │     │
│    │ Qwen2.5:7b │ │ nova-2   │ │ SQLAlch │ │  Keys/JWT  │     │
│    └────────────┘ └──────────┘ └─────────┘ └────────────┘     │
│                                                                 │
│    ┌────────────┐ ┌──────────┐ ┌─────────┐ ┌─────────────┐    │
│    │  DeepFace  │ │ wav2vec2 │ │  YOLO   │ │  PyAnnote   │    │
│    │  ArcFace   │ │   HF     │ │   v8    │ │ Diarization │    │
│    └────────────┘ └──────────┘ └─────────┘ └─────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

### Interview Session Data Flow

```
Enroll (face 5× + voice 8s + TOTP QR)
    ↓
Login: Face → Liveness → Voice → TOTP → RS256 JWT
    ↓
Dashboard → Interview Setup (mode + persona + topics/resume)
    ↓
POST /interview/start → Ollama LLM → First Question
    ↓
Loop per question:
  Deepgram live voice / type answer
    → POST /interview/respond → LLM score + feedback + next Q
    → Adaptive difficulty update
    → InterviewLog persisted to SQLite
    → YOLO + emotion + diarization in background threads
    ↓
POST /interview/end
  → LLM: Strengths / Weaknesses / Study Topics
  → RSA-2048 sign report → save JSON
  → /report/:sessionId
```

---

## 🔐 Security Model

### Login Flow (Sequential, must pass all 4)
```
① Face biometric     DeepFace ArcFace cosine match vs enrolled embedding
② Liveness check     Dlib blink detection — blocks photo/video attacks
③ Voice biometric    wav2vec2 cosine similarity ≥ 0.60
④ TOTP 6-digit       30-second rotating code (RFC 6238)
                     ↓
                   RS256 JWT issued
```

### Continuous Proctoring (During Interview)
- YOLO checks webcam frame every 30s → multiple persons detected → TOTP step-up challenge
- Tab switch detected → warning → 3 warnings → session terminated
- Voice stream analyzed for multiple speakers (PyAnnote diarization)
- Face re-verification mid-session — mismatch triggers step-up

### Cryptographic Report Integrity
```python
report_json = json.dumps(report, sort_keys=True)  # deterministic
signature   = private_key.sign(report_json, PKCS1v15(), SHA256())
# Embed base64 signature in report JSON
# Verify: GET /report/:id/verify → { "valid": true }
```

### Audit Hash Chain
Every security event stored with:
```json
{
  "event_type": "QUESTION_ANSWERED",
  "detail":     { "score": 8.5, "q_num": 3 },
  "prev_hash":  "sha256(previous_event)",
  "hash":       "sha256(this_event + prev_hash)"
}
```
Tamper any one event → all subsequent hashes break → detectable.

---

## 📁 Project Structure

```
miic-sec/
├── backend/
│   ├── main.py                 # FastAPI app, CORS, lifespan, router registration
│   ├── config.py               # All constants: thresholds, model names, paths
│   ├── database.py             # SQLAlchemy models: Candidate, Session, InterviewLog, AuditLog
│   │
│   ├── auth/
│   │   ├── routes.py           # POST /auth/enroll, /login, /totp-verify-enrollment
│   │   ├── face_auth.py        # DeepFace ArcFace enrollment + verification
│   │   ├── voice_auth.py       # wav2vec2 voice embedding + cosine similarity
│   │   ├── liveness.py         # Dlib blink-detection anti-spoofing
│   │   ├── totp_auth.py        # PyOTP TOTP generation + QR code
│   │   └── jwt_manager.py      # RS256 JWT issue + decode + middleware
│   │
│   ├── interview/
│   │   ├── routes.py           # /interview/start, /respond, /end, /transcribe
│   │   ├── llm_interviewer.py  # Adaptive Ollama LLM question/evaluation engine
│   │   ├── transcriber.py      # Deepgram REST transcription (replaces Whisper)
│   │   └── dashboard.py        # GET /user/dashboard — stats + history
│   │
│   ├── security/
│   │   └── routes.py           # /security/face-recheck, /tab-switch, /step-up-verify
│   │
│   ├── report/
│   │   └── routes.py           # GET /report/:id, /report/:id/verify
│   │
│   ├── crypto/
│   │   ├── report_signer.py    # RSA-2048 sign/verify + report assembly
│   │   └── audit_log.py        # SHA-256 hash-chain audit events
│   │
│   ├── verification/
│   │   ├── proxy_detector.py   # YOLOv8 multi-person detection
│   │   └── continuous_verifier.py # Background identity re-check loop
│   │
│   ├── websocket/
│   │   └── ws_manager.py       # WebSocket ConnectionManager + event types
│   │
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.jsx        # 5-step sequential biometric login
│   │   │   ├── Enroll.jsx       # Multi-step enrollment wizard
│   │   │   ├── Dashboard.jsx    # Stats + score chart + history
│   │   │   ├── Interview.jsx    # Main interview UI (Monaco + Deepgram voice)
│   │   │   ├── InterviewSetup.jsx # Mode / persona / topic picker
│   │   │   └── Report.jsx       # Full report viewer
│   │   ├── utils/
│   │   │   └── api.js           # Axios instance + sessionStorage auth store
│   │   ├── App.jsx              # Router + ProtectedRoute
│   │   └── index.css            # Dark glassmorphism design system
│   ├── vite.config.js           # Dev proxy for /auth, /interview, /ws etc.
│   └── Dockerfile
│
├── docker/
│   └── Dockerfile.backend
├── docker-compose.yml
├── keys/                        # RSA keypair (auto-generated on first run)
├── reports/                     # Signed JSON reports
└── .env.example
```

---

## 💻 System Requirements

### Minimum (runs everything on CPU)
| Component | Minimum | Recommended |
|-----------|---------|-------------|
| **RAM** | 8 GB | 16 GB |
| **CPU** | 4-core (x86-64 or Apple Silicon) | 8-core M2 / Ryzen 7 |
| **Storage** | 10 GB free | 20 GB free |
| **OS** | macOS 13+, Ubuntu 22.04+, Windows 11 (WSL2) | macOS 14 / Ubuntu 24.04 |
| **Python** | 3.11 | 3.11 or 3.12 |
| **Node.js** | 18.x | 20.x LTS |
| **Webcam** | Any 720p USB/built-in | 1080p with good low-light |
| **Microphone** | Any built-in mic | Headset / dedicated mic |

### GPU (Optional)
The entire stack runs **without a GPU**. If you have an NVIDIA GPU with CUDA, DeepFace and YOLOv8 will automatically use it for faster inference — no code changes required.

> ⚡ **Apple Silicon (M1/M2/M3)**: Fully supported. Ollama uses Metal acceleration automatically.

---

## 🚀 Quick Start

### Prerequisites

| Tool | Install |
|------|---------|
| Python 3.11+ | [python.org](https://python.org) |
| Node.js 18+ | [nodejs.org](https://nodejs.org) |
| Ollama | `brew install ollama` (macOS) |
| Docker + Compose | [docker.com](https://docker.com) |

### Option A — Local Development (Recommended)

```bash
# 1. Clone
git clone https://github.com/Athar786-Ali/miic-sec.git
cd miic-sec

# 2. Pull LLM model (one-time, ~4 GB)
ollama pull qwen2.5:7b
ollama serve            # keep running

# 3. Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# 4. Frontend (new terminal)
cd frontend
npm install
npm run dev
```

| Service | URL |
|---------|-----|
| 🌐 Frontend | http://localhost:3000 |
| ⚙️ Backend API | http://localhost:8000 |
| 📖 Swagger UI | http://localhost:8000/docs |

### Option B — Docker Compose

```bash
cd miic-sec
docker compose up --build

# First time: pull the LLM inside the container
docker exec -it miic_ollama ollama pull qwen2.5:7b
```

### Environment Variables (`backend/.env`)

Copy `.env.example` to `backend/.env` and fill in the values:

```env
# ── Speech-to-Text ──────────────────────────────────────────────
DEEPGRAM_API_KEY=your_deepgram_key       # Required for live voice transcription
                                          # Free tier: 200 hrs/month at deepgram.com

# ── AI / Diarization ────────────────────────────────────────────
HF_TOKEN=hf_your_token                   # Optional — needed only for PyAnnote
                                          # multi-speaker diarization
                                          # Get one free at huggingface.co/settings/tokens

# ── Platform ────────────────────────────────────────────────────
OLLAMA_BASE_URL=http://localhost:11434   # Ollama server URL (change for Docker)
SECRET_KEY=change_me_in_production       # Used for additional HMAC operations
ALLOWED_ORIGINS=http://localhost:3000    # CORS — add your domain for cloud deploy

# ── macOS only ──────────────────────────────────────────────────
OBJC_DISABLE_INITIALIZE_FORK_SAFETY=YES  # Prevents multiprocessing crashes on macOS
```

> 💡 RSA keypair is **auto-generated** in `keys/` on first startup — no manual setup needed.
> 💡 All sensitive keys are read at startup; restart the backend after editing `.env`.

---

## 📡 API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/enroll` | Register: face + voice + TOTP setup |
| `POST` | `/auth/login` | Biometric login → JWT |
| `POST` | `/auth/totp-verify-enrollment` | Confirm TOTP setup |

### Interview
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/interview/start` | Start session with mode/persona/topics |
| `POST` | `/interview/respond` | Submit answer → score + next question |
| `POST` | `/interview/end` | End session → sign report |
| `POST` | `/interview/transcribe` | Audio → Deepgram text (REST) |
| `GET`  | `/interview/deepgram-token` | Issue temporary Deepgram key |
| `POST` | `/interview/upload-resume` | Parse PDF resume |

### Security
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/security/face-recheck` | YOLO + face mid-session check |
| `POST` | `/security/tab-switch` | Log tab switch event |
| `POST` | `/security/step-up-verify` | TOTP step-up after mismatch |

### Reports & Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/report/:session_id` | Fetch signed report |
| `GET`  | `/report/:session_id/verify` | Verify RSA signature |
| `GET`  | `/user/dashboard` | Stats + full interview history |
| `WS`   | `/ws/candidate/:session_id` | Real-time security event stream |

---

## 🗄️ Database Schema

```
Candidate       — id, name, email, face_embedding (blob), voice_embedding (blob), totp_secret
Session         — id, candidate_id, status, started_at, ended_at, final_score
InterviewLog    — id, session_id, question_number, question_text, response_text, score, difficulty
AuditLog        — id, session_id, event_type, detail (json), prev_hash, entry_hash, timestamp
```

---

## 🧠 AI Pipeline Details

### Adaptive Difficulty Algorithm
```python
# After each answer, recalculate difficulty from last 3 scores
window = scores[-3:]
avg = mean(window)
if avg >= 7.5:   next_difficulty = "hard"
elif avg >= 4.5: next_difficulty = "medium"
else:            next_difficulty = "easy"
```

### Ollama LLM Prompt Structure
Each question prompt includes:
- Candidate's job role + company persona system instructions
- Conversation history (Q&A pairs)
- Current difficulty target
- Resume context (if resume mode)
- Selected topics (if topic mode)

### Voice Authentication Flow
```python
# Enrollment: 10s recording → wav2vec2 → 768-d embedding → stored as pickle blob
# Login:       5s recording  → wav2vec2 → 768-d embedding
# Verify:      cosine_similarity(stored, live) >= 0.60 → pass
```

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| `ollama: connection refused` | Run `ollama serve` in a separate terminal |
| `CUDA out of memory` | App runs on CPU — no GPU needed |
| `Face not detected` | Ensure good lighting, face camera directly |
| `TOTP code invalid` | Check phone clock is synced (NTP) |
| `Deepgram token error` | Check `DEEPGRAM_API_KEY` in `backend/.env` |
| `Module not found` | Run `pip install -r requirements.txt` again |
| `Port 8000 in use` | `lsof -ti:8000 \| xargs kill -9` |

---

## ⚡ Performance & Benchmarks

All benchmarks measured on a **MacBook Pro M2 (16 GB RAM)** running Ollama locally.

| Operation | Avg. Latency | Notes |
|-----------|-------------|-------|
| Face enrollment (5 angles) | ~3–5 s | DeepFace ArcFace embedding |
| Liveness check (blink detect) | ~0.3 s / frame | Dlib 68 landmarks |
| Voice embedding (wav2vec2) | ~1.2 s | 8 s clip → 768-d vector |
| TOTP verification | < 50 ms | In-memory PyOTP check |
| LLM question generation | ~4–8 s | Qwen2.5:7b on CPU via Ollama |
| Deepgram live transcription | < 300 ms | WebSocket streaming |
| RSA-2048 sign report | ~15 ms | Python `cryptography` library |
| YOLOv8 person detection | ~80 ms / frame | `yolov8n.pt` nano model |

> **No GPU required** — the entire stack runs comfortably on a modern laptop CPU/Apple Silicon.

---

## 📋 Changelog

### v1.2.0 — Latest
- ✅ **Expanded test suite** — 6 dedicated phase files covering every subsystem
- ✅ **Full environment variable documentation** — all config keys explained with defaults
- ✅ **Nginx HTTPS deployment guide** added to README
- ✅ **Competitor comparison table** — MIIC-Sec vs. HireVue, Interviewing.io, LeetCode
- ✅ README enriched with detailed troubleshooting, FAQ, and deployment tips

### v1.1.0
- ✅ Replaced Whisper with **Deepgram nova-2** for real-time WebSocket STT (300 ms latency)
- ✅ Ephemeral Deepgram key management — keys issued per session and immediately revoked
- ✅ Non-blocking biometric pipeline — parallel face + voice enrollment with animated progress UI
- ✅ Improved Docker Compose setup with Ollama service and health checks
- ✅ Added SHA-256 hash-chain audit log for tamper-evident event history
- ✅ Full Swagger / ReDoc auto-documentation at `/docs` and `/redoc`

### v1.0.0 — Initial Release
- ✅ 5-tier biometric authentication (Face → Liveness → Voice → TOTP → Proctoring)
- ✅ Adaptive Ollama LLM interviewer with 3 modes (Topic / Resume / Combined) and 3 personas
- ✅ Monaco code editor with isolated Docker sandbox execution
- ✅ RSA-2048 signed interview reports with public verification endpoint
- ✅ Full-stack React + FastAPI + SQLite implementation
- ✅ Docker Compose single-command deployment

---

## 🗺️ Roadmap

### ✅ Completed (v1.0)
- [x] 5-tier biometric security (face · liveness · voice · TOTP · proctoring)
- [x] Adaptive Ollama LLM interviewer with 3 personas and 3 modes
- [x] Real-time Deepgram voice transcription (WebSocket)
- [x] Monaco code editor with Docker sandbox execution
- [x] RSA-2048 signed + SHA-256 hash-chained reports
- [x] Full Docker Compose deployment

### 🔄 In Progress (v1.1)
- [ ] **Resume parsing improvements** — structured JSON extraction via LLM
- [ ] **Email report delivery** — SMTP integration to send signed PDF reports
- [ ] **LinkedIn share card** — auto-generate OG image for report sharing

### 🔮 Planned (v2.0)
- [ ] **Multimodal LLM upgrade** — LLaVA / Gemma3 for image-based whiteboard questions
- [ ] **PostgreSQL support** — migration path from SQLite for multi-user deployments
- [ ] **Admin dashboard** — institution-level monitoring, bulk enrollment, analytics
- [ ] **Mobile PWA** — responsive layout + camera/mic access on mobile browsers
- [ ] **Emotion heatmap export** — timeline visualization exportable as PNG
- [ ] **Interview replay** — recorded session review with synchronized transcript
- [ ] **Group interview mode** — multi-candidate, single interviewer session

---

## 🌐 Production Deployment (Nginx + HTTPS)

For cloud or institutional deployment, put **Nginx** in front to handle SSL termination and proxy to FastAPI + Vite.

```nginx
server {
    listen 443 ssl;
    server_name your.domain.com;

    ssl_certificate     /etc/letsencrypt/live/your.domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your.domain.com/privkey.pem;

    # Frontend (Vite production build)
    location / {
        root /var/www/miic-sec/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location ~ ^/(auth|interview|security|report|user|ws)/ {
        proxy_pass         http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection "upgrade";  # WebSocket support
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
    }
}

# Redirect HTTP → HTTPS
server {
    listen 80;
    server_name your.domain.com;
    return 301 https://$host$request_uri;
}
```

> 🔑 **HTTPS is mandatory** — browsers block webcam and microphone access on plain HTTP.
> Use [Certbot](https://certbot.eff.org/) for a free Let's Encrypt certificate.

Build the frontend for production before deploying:
```bash
cd frontend && npm run build   # outputs to frontend/dist/
```

---

## ⚖️ How MIIC-Sec Compares

| Feature | **MIIC-Sec** | HireVue | Interviewing.io | LeetCode Mock |
|---------|:---:|:---:|:---:|:---:|
| **Self-hosted / Privacy-first** | ✅ Yes | ❌ Cloud only | ❌ Cloud only | ❌ Cloud only |
| **Biometric anti-cheat** | ✅ 5-tier | ✅ AI proctoring | ❌ No | ❌ No |
| **Adaptive AI Interviewer** | ✅ Local LLM | ✅ Proprietary | ✅ Human peers | ❌ No |
| **Live code editor + sandbox** | ✅ Monaco + Docker | ❌ No | ✅ Yes | ✅ Yes |
| **Cryptographically signed reports** | ✅ RSA-2048 | ❌ No | ❌ No | ❌ No |
| **Resume-based questions** | ✅ PDF → LLM | ✅ Yes | ❌ No | ❌ No |
| **Free / open source** | ✅ Free | 💰 Paid | 🔄 Freemium | 🔄 Freemium |
| **Zero data to third parties** | ✅ (except STT) | ❌ All data | ❌ All data | ❌ All data |

> MIIC-Sec is the **only open-source** platform combining enterprise-grade biometric proctoring with a fully local AI interviewer.

---

## 🔒 Security Considerations & Threat Model

### Addressed Threats
| Threat | Mitigation |
|--------|-----------|
| **Photo/video spoofing** | Dlib blink-based liveness detection |
| **Voice replay attack** | Short enrollment window + cosine threshold |
| **JWT theft** | RS256 signing, short-lived tokens, sessionStorage (not localStorage) |
| **Code injection (code editor)** | Bandit static analysis + `--network none` Docker sandbox |
| **Report tampering** | RSA-2048 signature + SHA-256 hash chain |
| **Proxy impersonation** | YOLOv8 multi-person detection + mid-session TOTP step-up |
| **Tab switching / browser escape** | JS `visibilitychange` events → warning → termination |
| **Deepgram key leakage** | Ephemeral keys issued per session, revoked immediately after use |

### Known Limitations
- Voice biometric threshold (0.60) may allow false positives in noisy environments — adjustable in `config.py`
- SQLite is single-writer; switch to PostgreSQL for concurrent multi-user deployments
- Liveness detection requires adequate lighting — low-light environments may fail
- LLM responses are non-deterministic; scoring may vary slightly between runs

---

## 🧪 Testing

```bash
# Run all tests
pytest

# Run with verbose output
pytest -v

# Run a specific test file
pytest tests/test_phase1.py -v

# Check test coverage
pytest --cov=backend tests/
```

The test suite is organised into **6 phases** that mirror the build progression of the platform:

| Phase | File | What It Tests |
|-------|------|---------------|
| **Phase 1** | `test_phase1.py` | Database models, schema creation, Candidate/Session CRUD |
| **Phase 2** | `test_phase2.py` | Auth endpoints — enrollment (face + voice + TOTP), login flow, JWT issuance |
| **Phase 3** | `test_phase3.py` | Interview lifecycle — `/start`, `/respond` (adaptive scoring), `/end`, resume upload |
| **Phase 4** | `test_phase4.py` | Cryptography — RSA-2048 sign/verify, SHA-256 hash-chain audit log integrity |
| **Phase 5** | `test_phase5.py` | Security endpoints — tab-switch logging, face re-check, TOTP step-up challenge |
| **Phase 6** | `test_phase6.py` | WebSocket event stream, real-time security event delivery |

> Run phases individually during development to isolate failures quickly.

---

## 🤝 Contributing

Contributions are welcome! Whether it's a bug fix, feature suggestion, or documentation improvement — all PRs are appreciated.

### Getting Started

```bash
# 1. Fork the repository on GitHub
# 2. Clone your fork
git clone https://github.com/<your-username>/miic-sec.git
cd miic-sec

# 3. Create a feature branch
git checkout -b feature/your-feature-name

# 4. Install dependencies
cd backend && pip install -r requirements.txt
cd ../frontend && npm install

# 5. Make your changes and commit
git commit -m "feat: add your feature description"

# 6. Push and open a pull request
git push origin feature/your-feature-name
```

### Code Style
- **Python**: Follow PEP 8, use type hints where possible
- **JavaScript/React**: ESLint default rules, functional components with hooks
- **Commits**: Use [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`, `chore:`)

### Reporting Issues
Please use [GitHub Issues](https://github.com/Athar786-Ali/miic-sec/issues) with:
- Steps to reproduce
- Expected vs. actual behaviour
- OS, Python version, Node version, browser

---

## ❓ FAQ

<details>
<summary><b>Does MIIC-Sec send any data to the cloud?</b></summary>

By default, only **Deepgram** (speech-to-text) receives audio data during live voice transcription. All other processing — face recognition, voice biometrics, LLM inference — happens **100% locally on your machine**. You can replace Deepgram with a local Whisper model to go fully offline.
</details>

<details>
<summary><b>Can I use a different LLM instead of Qwen2.5:7b?</b></summary>

Yes! Any model available in Ollama works. Change `MODEL_NAME` in `backend/config.py`:
```python
OLLAMA_MODEL = "llama3:8b"   # or mistral, gemma2, phi3, etc.
```
Larger models (13B+) give better interview quality but are slower on CPU.
</details>

<details>
<summary><b>How accurate is the face recognition?</b></summary>

DeepFace with ArcFace model achieves ~99.4% accuracy on LFW benchmark. In practice, performance depends on lighting and camera quality. The cosine similarity threshold is configurable in `config.py`.
</details>

<details>
<summary><b>Can I deploy this on a cloud server?</b></summary>

Yes — Docker Compose works on any Linux server. For cloud deployment:
- Use a server with ≥ 8 GB RAM for the LLM
- Set `ALLOWED_ORIGINS` in `config.py` to your domain
- Put Nginx in front for HTTPS (required for webcam/mic in browsers)
- Consider mounting an external volume for `keys/` and `reports/`
</details>

<details>
<summary><b>What if I don't have a Deepgram API key?</b></summary>

You can still use the platform with **typed text input** — the voice transcription is optional. Create a free Deepgram account at [deepgram.com](https://deepgram.com) to get 200 free hours/month.
</details>

<details>
<summary><b>Is my interview data stored permanently?</b></summary>

Data is stored locally in `backend/miic_sec.db` (SQLite) and `reports/` (JSON). No data is uploaded anywhere. You can delete these files at any time to clear all records.
</details>

---

## 🔏 Privacy & Data Policy

MIIC-Sec is designed with a **privacy-first** philosophy. Here is a clear breakdown of what goes where:

| Data | Stored | Location | Sent to Cloud? |
|------|--------|----------|----------------|
| Face biometric embedding | ✅ Yes | Local SQLite DB | ❌ Never |
| Voice biometric embedding | ✅ Yes | Local SQLite DB | ❌ Never |
| TOTP secret | ✅ Yes | Local SQLite DB | ❌ Never |
| Interview Q&A text | ✅ Yes | Local SQLite DB | ❌ Never |
| LLM prompts & responses | ❌ Not persisted | Ollama (local process) | ❌ Never |
| Audio during voice STT | 🔄 Streamed | Deepgram API (cloud) | ✅ Yes — audio only |
| Interview report JSON | ✅ Yes | Local `reports/` folder | ❌ Never |
| RSA private key | ✅ Yes | Local `keys/` folder | ❌ Never |

> **Note on Deepgram**: Audio is streamed to Deepgram's API solely for speech-to-text transcription. No audio is stored by the platform. You can eliminate this cloud dependency by replacing Deepgram with a local [Whisper](https://github.com/openai/whisper) model — see the FAQ for details.

### GDPR / Institutional Compliance
- All PII (face, voice, email) is stored **only on your own infrastructure**
- No analytics, telemetry, or tracking of any kind
- Data can be fully deleted by removing `backend/miic_sec.db` and `reports/`
- No third-party cookies, no CDN-hosted assets in the core application

---

## 📚 Academic Citation

If you use MIIC-Sec as a reference for research, coursework, or a technical report, please cite it as:

```bibtex
@software{miicsec2025,
  author    = {Ali, Md. Athar},
  title     = {MIIC-Sec: AI-Powered Secure Mock Interview \& Career Accelerator Platform},
  year      = {2025},
  url       = {https://github.com/Athar786-Ali/miic-sec},
  note      = {Self-hosted mock interview system with 5-tier biometric security,
               adaptive LLM questioning, real-time transcription, and
               cryptographically signed interview reports}
}
```

Or in plain text:
> Md. Athar Ali. *MIIC-Sec: AI-Powered Secure Mock Interview & Career Accelerator Platform*. 2025. https://github.com/Athar786-Ali/miic-sec

---

## 👨‍💻 Author

**Md. Athar Ali**  
Full-Stack Developer · AI/ML Enthusiast · Security Researcher

- 🔗 GitHub: [@Athar786-Ali](https://github.com/Athar786-Ali)
- 🐛 Bug Reports: [GitHub Issues](https://github.com/Athar786-Ali/miic-sec/issues)
- 💼 Open to collaborations, research partnerships, and internship opportunities

> *"Building security-first AI systems that respect user privacy."*

---

## 📜 License

This project is licensed for educational and portfolio purposes.  
Feel free to fork, learn from, and build upon it — attribution appreciated.

---

<div align="center">
<b>Built with ❤️ — FastAPI · React · Ollama · Deepgram · DeepFace · YOLOv8 · RSA-2048</b>

<br/><br/>

⭐ <b>If you found this project useful, please give it a star!</b> ⭐

</div>
