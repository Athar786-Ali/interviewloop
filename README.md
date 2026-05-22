<div align="center">

<img src="https://img.shields.io/badge/MIIC--Sec-AI%20Interview%20Platform-6366f1?style=for-the-badge&logo=shield&logoColor=white" />

<h1>🛡️ MIIC-Sec</h1>
<h3>AI-Powered Secure Mock Interview & Career Accelerator Platform</h3>

<p>
  <img src="https://img.shields.io/badge/FastAPI-0.115-009688?style=flat-square&logo=fastapi&logoColor=white" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/Python-3.11+-3776AB?style=flat-square&logo=python&logoColor=white" />
  <img src="https://img.shields.io/badge/Ollama-Qwen2.5:7b-FF6B35?style=flat-square&logo=ollama&logoColor=white" />
  <img src="https://img.shields.io/badge/Deepgram-Real--time%20STT-00E599?style=flat-square&logo=deepgram&logoColor=black" />
  <img src="https://img.shields.io/badge/SQLite-SQLAlchemy-003B57?style=flat-square&logo=sqlite&logoColor=white" />
  <img src="https://img.shields.io/badge/Security-RSA--2048%20%7C%20JWT%20%7C%20TOTP-red?style=flat-square&logo=letsencrypt&logoColor=white" />
</p>

<p>
  <b>A fully self-hosted, production-grade AI mock interview platform</b><br/>
  with 5-tier biometric security, adaptive AI questioning, real-time transcription,<br/>
  cryptographically signed reports, and a student-centric career analytics dashboard.
</p>

<p>
  <a href="#-features">Features</a> •
  <a href="#-architecture">Architecture</a> •
  <a href="#-security-model">Security</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-api-reference">API Reference</a> •
  <a href="#-project-structure">Project Structure</a>
</p>

---

</div>

## ✨ Features

### 🎓 Student Career Accelerator Dashboard
- **Personalized Dashboard** — greets by name, shows total interviews, average score, personal best, and monthly activity
- **Score Progress Chart** — interactive area chart tracking growth over every session (recharts)
- **Interview History Table** — full searchable log of every mock, clicking any row opens the full report
- **Company-Specific AI Personas** — practice tailored to your exact target company type
- **Verified Public Reports** — cryptographically signed reports you can share on LinkedIn

### 🤖 AI-Powered Adaptive Interviewer
- **Local LLM** — Qwen2.5:7b via Ollama, fully self-hosted with zero data leaving your machine
- **Adaptive Difficulty** — dynamically adjusts question difficulty (easy / medium / hard) based on candidate performance using a sliding-window scoring algorithm
- **3 Interview Modes:**
  - 📚 **Topic Based** — select specific CS topics (OS, DBMS, DSA, OOP, CN, System Design, etc.)
  - 📄 **Resume Based** — AI reads your PDF resume and asks questions from your own projects & experience
  - 🔗 **Combined** — resume + selected topics together for a comprehensive mock
- **3 Company AI Personas:**
  | Persona | Style | Target |
  |---------|-------|--------|
  | 🏢 Service Based | CS fundamentals, OOP basics, SQL, verbal logic, straightforward questions | TCS, Wipro, Infosys |
  | 🚀 Product / FAANG | Deep CS, system design, edge cases, optimal complexity, cross-questioning | Google, Amazon, Microsoft |
  | ⚡ Startup | Practical skills, framework knowledge, project-based questions, pragmatism over theory | Fast-paced product startups |

### 🔐 5-Tier Biometric Security System
| Tier | Technology | What It Checks |
|------|-----------|---------------|
| **Tier 1** | DeepFace (ArcFace model) | Face biometric match against enrolled embedding |
| **Tier 2** | Dlib + blink detection | Liveness check — prevents photo spoofing |
| **Tier 3** | wav2vec2-base (HuggingFace) | Voice biometric match (cosine similarity ≥ 0.60) |
| **Tier 4** | PyOTP + TOTP | Time-based One-Time Password (Google Authenticator) |
| **Tier 5** | YOLO (YOLOv8) | Multi-person detection — flags if another person appears |

### 🎙️ Real-Time Voice Intelligence
- **Deepgram WebSocket** — live streaming speech-to-text with auto-revoking temporary tokens (security-first)
- **Voice Enrollment** — 8-second voice recording with animated waveform visualizer during enrollment
- **Speaker Diarization** — PyAnnote.audio detects multiple speakers in the audio stream (flags cheating)
- **Voice Login Verification** — voice required at every login if enrolled (falls back gracefully if not enrolled)

### 📊 Hyper-Actionable Feedback & Reports
- **Structured LLM Feedback** — AI generates Strengths, Weaknesses, Topics to Study, and Overall Assessment after every interview
- **Emotion Timeline** — gaze score and speech confidence tracked per question and plotted as a chart
- **Student-Centric Ratings:** `🏆 EXCELLENT` (≥7.5) · `📈 NEEDS PRACTICE` (≥5.0) · `📉 POOR` (<5.0)
- **Cryptographically Signed Reports** — RSA-2048 + SHA-256 tamper-evident JSON reports
- **Hash-Chain Audit Log** — every security event is linked by a SHA-256 hash chain (blockchain-style)
- **LinkedIn Share Button** — one-click pre-filled post to share your verified interview result

### 💻 Live Code Execution
- **Multi-Language Sandbox** — write and execute code (Python, JavaScript, Java) directly in the interview
- **Static Analysis** — checks for bad patterns, complexity issues before execution
- **Timeout Protection** — 5-second execution limit to prevent infinite loops

### 🏗️ Enterprise-Grade Infrastructure
- **JWT Authentication** — RS256-signed tokens with session binding
- **WebSocket Real-time** — live security event stream to candidate and monitor connections
- **Tab Switch Detection** — warns and terminates session after repeated tab switches
- **Continuous Identity Re-verification** — step-up TOTP challenge if face mismatch detected mid-interview
- **Emotion Analysis Pipeline** — threaded background analysis of gaze and audio confidence throughout the session

---

## 🏛️ Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         MIIC-Sec Platform                           │
│                                                                     │
│  ┌──────────────────────┐        ┌──────────────────────────────┐  │
│  │   React Frontend      │◄──────►│      FastAPI Backend          │  │
│  │   (Vite + Recharts)  │  HTTP  │      (port 8000)             │  │
│  │                      │◄──────►│                              │  │
│  │  /login              │  WS    │  /auth/*   — Biometrics      │  │
│  │  /enroll             │        │  /interview/* — LLM + AI     │  │
│  │  /dashboard          │        │  /user/*   — Dashboard       │  │
│  │  /interview          │        │  /report/* — Signed Reports  │  │
│  │  /report/:id         │        │  /security/* — Proctoring    │  │
│  └──────────────────────┘        │  /ws/*     — Live Events     │  │
│                                  └──────────────┬───────────────┘  │
│                                                 │                   │
│         ┌───────────────┬──────────────┬────────┴──────────┐       │
│         │               │              │                   │       │
│   ┌─────▼──────┐  ┌─────▼──────┐  ┌───▼──────┐  ┌────────▼─────┐ │
│   │  Ollama    │  │  Deepgram  │  │  SQLite  │  │  Local Keys  │ │
│   │ Qwen2.5:7b │  │  (STT WS)  │  │  + ORM   │  │  RSA-2048    │ │
│   └────────────┘  └────────────┘  └──────────┘  └──────────────┘ │
│                                                                     │
│         ┌───────────────┬──────────────┬────────────────────┐      │
│         │               │              │                    │      │
│   ┌─────▼──────┐  ┌─────▼──────┐  ┌───▼──────┐  ┌─────────▼───┐  │
│   │  DeepFace  │  │  wav2vec2  │  │   YOLO   │  │  PyAnnote   │  │
│   │ (ArcFace)  │  │  (HF)      │  │  (v8)    │  │  Diarization│  │
│   └────────────┘  └────────────┘  └──────────┘  └─────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

### Data Flow — Interview Session

```
Login (Face + Liveness + Voice + TOTP)
    │
    ▼
JWT Token issued → sessionStorage
    │
    ▼
Dashboard (/dashboard)
    │
    ▼
Interview Setup (Mode + Company Persona + Topics/Resume)
    │
    ▼
POST /interview/start ──► Ollama LLM ──► First Question
    │
    ▼
Interview Loop:
  Candidate answers (text or Deepgram voice)
    │
    ├──► POST /interview/respond ──► LLM evaluates + scores + next question
    │         │
    │         ├──► Adaptive difficulty update
    │         ├──► InterviewLog persisted to SQLite
    │         └──► WebSocket pushes security events
    │
    ├──► Background threads:
    │         ├── Emotion analysis (gaze + speech confidence)
    │         ├── YOLO multi-person detection
    │         └── Speaker diarization
    │
    └──► POST /interview/end
              │
              ├──► LLM generates Strengths / Weaknesses / Topics to Study
              ├──► Report signed with RSA-2048
              ├──► Audit hash-chain finalized
              └──► /report/:sessionId available
```

---

## 🔐 Security Model

### Enrollment Flow (One-Time)
```
Step 1: Name + Email
Step 2: 5 face captures → ArcFace embedding stored (pickled numpy, LargeBinary)
Step 3: 8-second voice recording → wav2vec2 768-d embedding stored
Step 4: Enrollment API → TOTP secret generated → QR code returned
Step 5: Scan QR with Google Authenticator / Authy → verify code
```

### Login Flow (Every Session)
```
Candidate ID
    │
    ▼
📷  Face biometric (DeepFace ArcFace cosine match)
    │
    ▼
👁  Liveness detection (blink detection, prevents photo attacks)
    │
    ▼
🎙  Voice biometric (wav2vec2 cosine similarity ≥ 0.60) [if enrolled]
    │
    ▼
🔑  TOTP 6-digit code (30-second rotating, RFC 6238)
    │
    ▼
✅  RS256 JWT issued — expires per session
```

### Report Integrity
```
Interview completes
    │
    ▼
Report JSON assembled (scores, feedback, security events, emotion timeline)
    │
    ▼
SHA-256 digest computed → signed with RSA-2048 private key
    │
    ▼
Signature + public key embedded in report
    │
    ▼
Anyone can verify: GET /report/:id/verify → { valid: true/false }
```

### Audit Hash Chain
Every security event is stored with:
```json
{
  "event_type": "QUESTION_ANSWERED",
  "detail": { "score": 8.5, "difficulty": "hard" },
  "previous_hash": "sha256(previous_entry)",
  "entry_hash":    "sha256(event + previous_hash)"
}
```
Breaking any event in the chain breaks all subsequent hashes → tamper-evident log.

---

## 🛠️ Tech Stack

### Backend
| Component | Technology | Purpose |
|-----------|-----------|---------|
| Web Framework | FastAPI 0.115 | Async REST API + WebSocket |
| ORM | SQLAlchemy + SQLite | Database models, session/audit storage |
| AI LLM | Ollama (Qwen2.5:7b) | Adaptive interview questions + feedback |
| Face Auth | DeepFace (ArcFace) | Biometric face verification |
| Voice Auth | HuggingFace wav2vec2-base | Voice embedding + cosine similarity |
| Liveness | Dlib + OpenCV | Anti-spoofing blink detection |
| Multi-person | YOLOv8 (Ultralytics) | Proctor monitor for extra people |
| Transcription | Deepgram WebSocket API | Real-time streaming speech-to-text |
| Diarization | PyAnnote.audio | Multiple speaker detection |
| Audio Decode | Librosa + SciPy | WebM/OGG/WAV decoding from browser |
| Cryptography | `cryptography` lib | RSA-2048 sign/verify, SHA-256 chain |
| Auth | PyJWT (RS256) + PyOTP | JWT tokens + TOTP 2FA |
| Resume Parse | PyMuPDF (fitz) | PDF text extraction |
| Code Sandbox | subprocess + AST | Safe code execution + static analysis |
| Emotion | OpenCV + librosa | Gaze + speech confidence analysis |

### Frontend
| Component | Technology | Purpose |
|-----------|-----------|---------|
| Framework | React 18 + Vite 5 | Fast SPA with HMR |
| Routing | React Router v6 | Client-side navigation + ProtectedRoute |
| HTTP Client | Axios | API calls with auth interceptor |
| Charts | Recharts | Score progress chart, emotion timeline |
| Auth State | sessionStorage | Tab-scoped token storage (secure) |
| Styling | Vanilla CSS | Dark glassmorphism design system |
| Fonts | Google Fonts (Inter) | Premium typography |
| WebSocket | Native WS API | Real-time security event stream |
| MediaRecorder | Web API | Voice enrollment + login recording |
| Deepgram | `@deepgram/sdk` | Browser-side streaming transcription |

---

## 📁 Project Structure

```
miic-sec/
│
├── backend/
│   ├── main.py                   # FastAPI app entry, CORS, lifespan, router registration
│   ├── database.py               # SQLAlchemy models: Candidate, Session, InterviewLog, AuditLog
│   ├── config.py                 # All constants: thresholds, URLs, paths, model names
│   │
│   ├── auth/
│   │   ├── routes.py             # POST /auth/enroll, /login, /totp-verify-enrollment
│   │   ├── face_auth.py          # DeepFace ArcFace enrollment + verification
│   │   ├── voice_auth.py         # wav2vec2 voice embedding + cosine similarity
│   │   ├── liveness.py           # Blink-detection liveness check
│   │   ├── totp_auth.py          # PyOTP TOTP generation + QR code
│   │   └── jwt_manager.py        # RS256 JWT creation + payload extraction
│   │
│   ├── interview/
│   │   ├── routes.py             # POST /start /respond /end /execute-code /upload-resume
│   │   ├── llm_interviewer.py    # Ollama chat, adaptive session, company personas, end_session
│   │   ├── adaptive_engine.py    # Sliding-window difficulty adjustment algorithm
│   │   ├── dashboard.py          # GET /user/dashboard — profile + stats + history
│   │   ├── topic_manager.py      # CS topic definitions + subtopic counts
│   │   ├── resume_parser.py      # PyMuPDF PDF → structured context extraction
│   │   ├── transcriber.py        # Audio transcription helpers
│   │   ├── emotion_analysis.py   # Threaded gaze + speech confidence analysis
│   │   └── code_sandbox.py       # Multi-language sandbox + AST static analysis
│   │
│   ├── crypto/
│   │   ├── report_signer.py      # RSA-2048 sign, collect_session_data, save_report
│   │   └── audit_log.py          # SHA-256 hash-chain audit log helpers
│   │
│   ├── report/
│   │   └── routes.py             # GET /report/:id, /verify, /download (JWT-protected)
│   │
│   ├── security/
│   │   └── routes.py             # POST /tab-switch, /step-up-totp, identity re-check
│   │
│   ├── verification/
│   │   ├── continuous_verifier.py # Periodic face re-check during interview
│   │   ├── diarization.py         # PyAnnote speaker diarization
│   │   └── proxy_detector.py      # YOLO multi-person detection
│   │
│   └── websocket/
│       └── ws_manager.py          # WS connection manager — candidate + recruiter channels
│
├── frontend/
│   └── src/
│       ├── main.jsx               # Router: /, /enroll, /login, /dashboard, /interview, /report/:id
│       ├── index.css              # Dark glassmorphism design system (CSS variables)
│       │
│       └── pages/
│           ├── Enrollment.jsx     # 6-step wizard: Info→Face→Voice→Enroll→TOTP→Done
│           ├── Login.jsx          # 4-step: Candidate ID→Face→Voice→TOTP
│           ├── Dashboard.jsx      # Stats, score chart, history table, LinkedIn share
│           ├── Interview.jsx      # Live interview: Deepgram STT, code editor, WebSocket
│           ├── InterviewSetup.jsx # Company persona + mode + topics + resume upload
│           └── Report.jsx         # Signed report, emotion chart, security log, LinkedIn share
│
├── keys/                          # RSA keypair (auto-generated on first boot)
│   ├── private_key.pem
│   └── public_key.pem
│
├── reports/                       # Signed JSON reports (per session)
└── requirements.txt               # All Python dependencies
```

---

## 🚀 Quick Start

### Prerequisites
```bash
# Python 3.11+
python --version

# Node.js 18+
node --version

# Ollama (local LLM runtime)
curl -fsSL https://ollama.com/install.sh | sh
ollama pull qwen2.5:7b

# (Optional) HuggingFace token for speaker diarization
export HF_TOKEN=your_hf_token
```

### 1. Clone & Setup Backend
```bash
git clone https://github.com/Athar786-Ali/miic-sec.git
cd miic-sec/backend

# Create virtual environment
python -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Configure Environment
Create `backend/.env`:
```env
# Deepgram API key (get free key at deepgram.com)
DEEPGRAM_API_KEY=your_deepgram_api_key

# HuggingFace token (for speaker diarization — optional)
HF_TOKEN=your_huggingface_token

# Ollama (default: local)
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=qwen2.5:7b
```

### 3. Start Backend
```bash
# In one terminal — start Ollama
ollama serve

# In another terminal — start FastAPI
cd miic-sec/backend
source venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Expected startup output:
```
✅ Database initialized — all tables created.

════════════════════════════════════════════════════
  MIIC-Sec — System Status
════════════════════════════════════════════════════
  Database                        ✅ ready
  RSA-2048 keys                   ✅ ready
  Ollama LLM                      ✅ connected
  Speaker diarization (HF_TOKEN)  ✅ enabled
════════════════════════════════════════════════════
  Docs:  http://localhost:8000/docs
  WS:    ws://localhost:8000/ws/candidate/{session_id}
════════════════════════════════════════════════════
```

### 4. Start Frontend
```bash
cd miic-sec/frontend
npm install
npm run dev
# → http://localhost:5173
```

### 5. First Use
1. Open `http://localhost:5173/enroll`
2. Enter your name and email
3. Capture 5 face photos
4. Record 8 seconds of voice
5. Scan the TOTP QR with Google Authenticator / Authy
6. Log in at `/login` → lands on your **Dashboard**
7. Click **Start New Mock Interview** → choose company persona + mode → practice!

---

## 📡 API Reference

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/enroll` | Enroll candidate (face + voice + TOTP setup) |
| `POST` | `/auth/login` | Login with face + voice + TOTP → JWT |
| `POST` | `/auth/totp-verify-enrollment` | Verify TOTP code during enrollment |

### Interview
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/interview/start` | ✅ JWT | Start session (mode, company_target, topics, resume) |
| `POST` | `/interview/respond` | ✅ JWT | Submit answer → get score + next question |
| `POST` | `/interview/end` | ✅ JWT | Finalise → generate LLM feedback + signed report |
| `GET`  | `/interview/status` | ✅ JWT | Live session progress |
| `POST` | `/interview/upload-resume` | ✅ JWT | Parse PDF resume → return context string |
| `GET`  | `/interview/topics` | ✅ JWT | Available CS topics with subtopic counts |
| `POST` | `/interview/execute-code` | ✅ JWT | Sandbox execute code (Python / JS / Java) |

### Dashboard
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET`  | `/user/dashboard` | ✅ JWT | Profile + stats + full session history |

### Reports
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET`  | `/report/{session_id}` | ✅ JWT | Full signed report JSON |
| `GET`  | `/report/{session_id}/verify` | ✅ JWT | Verify RSA signature integrity |
| `GET`  | `/report/{session_id}/download` | ✅ JWT | Download report as JSON file |

### Security / Proctoring
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/security/tab-switch` | ✅ JWT | Register tab-switch event |
| `POST` | `/security/step-up-totp` | ✅ JWT | Submit TOTP for identity re-challenge |
| `POST` | `/security/face-recheck` | ✅ JWT | Manual face re-verification |

### WebSocket
| URL | Description |
|-----|-------------|
| `ws://localhost:8000/ws/candidate/{session_id}` | Live security events for candidate |
| `ws://localhost:8000/ws/recruiter/{session_id}` | Live security event mirror for proctor |

**Interactive docs:** `http://localhost:8000/docs`

---

## 🎯 Interview Modes Explained

### 📚 Topic Based
Select one or more CS topics from:
> Data Structures & Algorithms · Operating Systems · Database Management Systems · Object-Oriented Programming · Computer Networks · System Design · Web Development · Machine Learning · Cloud Computing · Software Engineering Principles

### 📄 Resume Based
Upload your PDF resume → AI parses it and extracts:
- Skills, Technologies, Frameworks
- Work Experience and Projects
- Education History

The interviewer asks questions directly tied to **what you claim on your resume**.

### 🔗 Combined Mode
Resume-aware questions **+** selected topic questions, interleaved by the adaptive engine.

---

## 🏢 Company AI Personas

### 🏢 Service Based (TCS / Wipro / Infosys)
> **LLM Prompt Injection:** *"Focus on theoretical CS fundamentals, basic OOP definitions, commonly-asked HR concepts, straightforward logic questions, and SQL basics. Avoid extremely advanced topics. Keep questions clear and approachable."*

### 🚀 Product / FAANG (Google / Amazon / Microsoft)
> **LLM Prompt Injection:** *"Focus on deep conceptual understanding, algorithmic thinking, edge cases, system design trade-offs, and optimal time/space complexity analysis. Cross-question the candidate's reasoning. Challenge weak or vague answers. Ask follow-up questions to test depth."*

### ⚡ Startup
> **LLM Prompt Injection:** *"Focus almost entirely on practical implementation skills, framework-specific knowledge, real-world problem solving, and project-based questions from the candidate's resume. Ask about trade-offs they made in past projects, how they handle ambiguity, and their ability to ship working software quickly. Value pragmatism over theory."*

---

## 📊 Scoring & Recommendations

| Score Range | Label | Meaning |
|-------------|-------|---------|
| **≥ 7.5 / 10** | 🏆 EXCELLENT | Ready for placement — strong candidate |
| **≥ 5.0 / 10** | 📈 NEEDS PRACTICE | Good foundation, needs more depth |
| **< 5.0 / 10** | 📉 POOR | Significant gaps — keep practicing |

Scores are computed per-question by the LLM on a 0–10 scale, then averaged.  
The adaptive engine raises difficulty when recent scores are high, and lowers it when they are low.

---

## 🔒 Security Hardening Notes

- **No secrets in git** — `.env` file excluded via `.gitignore`
- **RSA keys auto-generated** on first boot and stored in `keys/` (also git-excluded)
- **Deepgram tokens** auto-revoke after the WebSocket session closes
- **sessionStorage** used for JWT (not localStorage) — cleared when tab closes
- **Voice tokens** are temp-keys requested server-side, never exposing the real API key to the browser
- **CORS** restricted to localhost origins in production
- **Code sandbox** uses subprocess with 5s timeout, blocked imports list, and static AST analysis before execution

---

## 🌐 Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DEEPGRAM_API_KEY` | ✅ Yes | — | Deepgram API key for real-time STT |
| `HF_TOKEN` | Optional | — | HuggingFace token for PyAnnote diarization |
| `OLLAMA_URL` | Optional | `http://localhost:11434` | Ollama server base URL |
| `OLLAMA_MODEL` | Optional | `qwen2.5:7b` | Primary LLM model name |
| `DATABASE_URL` | Optional | `sqlite:///./miic.db` | SQLAlchemy database connection string |
| `VOICE_SIMILARITY_THRESHOLD` | Optional | `0.60` | Minimum voice cosine similarity for auth |

---

## 🛣️ Roadmap

- [x] 5-tier biometric authentication (Face + Liveness + Voice + TOTP + Multi-person)
- [x] Adaptive AI interviewer (Ollama Qwen2.5)
- [x] Real-time voice transcription (Deepgram WebSocket)
- [x] Cryptographically signed tamper-evident reports (RSA-2048)
- [x] Hash-chain audit log (blockchain-style tamper detection)
- [x] Student dashboard with analytics + score progress chart
- [x] Company-specific AI personas (Service / FAANG / Startup)
- [x] LinkedIn verified report sharing
- [x] Live code execution sandbox (Python, JavaScript, Java)
- [x] Resume-based adaptive questioning
- [x] Voice enrollment + login biometrics
- [ ] Public shareable report URLs (dynamic routing)
- [ ] Multi-user admin panel for batch sessions
- [ ] Mobile-responsive layout improvements
- [ ] Docker Compose deployment setup
- [ ] LeetCode-style code editor (Monaco) integration
- [ ] Interview recording playback
- [ ] Email report delivery

---

## 👤 Author

**Md. Athar Ali**  
Full-Stack Developer | AI Systems Builder | Security Enthusiast

[![GitHub](https://img.shields.io/badge/GitHub-Athar786--Ali-181717?style=flat-square&logo=github)](https://github.com/Athar786-Ali)

---

## 📄 License

Private — All Rights Reserved © 2025 Md. Athar Ali

This project is built as a portfolio demonstration. All biometric data processed locally — never sent to any external server (except Deepgram for audio transcription and Ollama for LLM inference, both of which are opt-in).

---

<div align="center">
  <sub>Built end-to-end with ❤️ — FastAPI · React · Ollama · DeepFace · wav2vec2 · Deepgram · RSA-2048</sub>
</div>
