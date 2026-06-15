<div align="center">

<img src="https://img.shields.io/badge/MIIC--Sec-AI%20Interview%20Platform-6366f1?style=for-the-badge&logo=shield&logoColor=white" />

# 🛡️ MIIC-Sec
### AI-Powered Secure Mock Interview & Career Accelerator Platform

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
  <a href="#-api-reference">API Reference</a> •
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

```env
DEEPGRAM_API_KEY=your_deepgram_key    # Real-time STT
HF_TOKEN=hf_your_token               # Optional: PyAnnote diarization
OBJC_DISABLE_INITIALIZE_FORK_SAFETY=YES  # macOS only
```

> 💡 RSA keypair is auto-generated in `keys/` on first startup — no manual setup needed.

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

## 👨‍💻 Author

**Md. Athar Ali**  
Full-Stack Developer · AI/ML Enthusiast

- 🔗 GitHub: [@Athar786-Ali](https://github.com/Athar786-Ali)
- 📧 Contact via GitHub Issues

---

## 📜 License

This project is for educational and portfolio purposes.

---

<div align="center">
<b>Built with ❤️ — FastAPI · React · Ollama · Deepgram · DeepFace · YOLOv8 · RSA-2048</b>
</div>
