"""
MIIC-Sec — Auth Routes
FastAPI endpoints for enrollment, login, and TOTP setup.
"""

import asyncio
import io
import uuid
from datetime import datetime, timezone

import cv2
import numpy as np
from fastapi import APIRouter, File, Form, HTTPException, UploadFile, Depends
from pydantic import BaseModel

from database import get_db, Candidate, Session as DBSession
from auth.liveness import detect_liveness, load_liveness_model
from auth.face_auth import enroll_face, verify_face
from auth.totp_auth import enroll_totp, verify_totp
from auth.jwt_manager import create_session_token
from crypto.audit_log import log_event

router = APIRouter(prefix="/auth", tags=["Authentication"])

# Pre-load liveness model at module level
_liveness_model = None


def _get_liveness_model():
    """Lazy-load liveness model."""
    global _liveness_model
    if _liveness_model is None:
        _liveness_model = load_liveness_model()
    return _liveness_model


def _read_image(file_bytes: bytes) -> np.ndarray:
    """Convert uploaded file bytes to a numpy image array."""
    nparr = np.frombuffer(file_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError("Could not decode image")
    return img


def _read_audio(file_bytes: bytes) -> tuple[np.ndarray, int]:
    """
    Convert uploaded audio (WebM/OGG/WAV/MP3) to float32 numpy array at 16 kHz.
    Uses librosa which delegates to ffmpeg for format conversion — the same
    ffmpeg already used by the Whisper transcriber.

    Returns:
        (audio_array: np.ndarray[float32], sample_rate: int=16000)
    """
    try:
        import librosa
        buffer = io.BytesIO(file_bytes)
        audio_array, sample_rate = librosa.load(buffer, sr=16000, mono=True)
        return audio_array.astype(np.float32), sample_rate
    except Exception as exc:
        # Fallback: try scipy WAV parse (works if browser sent raw PCM WAV)
        try:
            from scipy.io import wavfile
            buffer = io.BytesIO(file_bytes)
            sample_rate, audio_data = wavfile.read(buffer)
            if audio_data.dtype == np.int16:
                audio_data = audio_data.astype(np.float32) / 32768.0
            elif audio_data.dtype == np.int32:
                audio_data = audio_data.astype(np.float32) / 2147483648.0
            else:
                audio_data = audio_data.astype(np.float32)
            if len(audio_data.shape) > 1:
                audio_data = audio_data.mean(axis=1)
            return audio_data, sample_rate
        except Exception as exc2:
            raise ValueError(
                f"Could not decode audio ({exc}). Fallback also failed: {exc2}. "
                "Make sure ffmpeg is installed: brew install ffmpeg"
            )


# ═════════════════════════════════════════════════════════════════
# POST /auth/enroll
# ═════════════════════════════════════════════════════════════════

@router.post("/enroll")
async def enroll_candidate(
    candidate_name:  str               = Form(...),
    candidate_email: str               = Form(...),
    face_images:     list[UploadFile]  = File(...),
    voice_audio:     UploadFile        = File(None),   # optional — 5-10 s recording
    db=Depends(get_db),
):
    """
    Enroll a new candidate with face, optional voice, and TOTP.

    Expects:
      - candidate_name:  str
      - candidate_email: str
      - face_images:     5 image files (JPEG/PNG)
      - voice_audio:     audio file (WebM/WAV/OGG) — optional but recommended

    Returns:
      { candidate_id, totp_qr_code_base64, voice_enrolled, message }
    """
    # ── Validate inputs ─────────────────────────────────────────
    if len(face_images) < 5:
        raise HTTPException(
            status_code=400,
            detail=f"Need 5 face images, got {len(face_images)}",
        )

    # ── Check if email already exists ────────────────────────────
    existing = db.query(Candidate).filter(Candidate.email == candidate_email).first()
    if existing:
        raise HTTPException(
            status_code=400,
            detail="Email already enrolled",
        )

    # ── Step 1: Create candidate record ──────────────────────────
    candidate_id = str(uuid.uuid4())
    candidate = Candidate(
        id=candidate_id,
        name=candidate_name,
        email=candidate_email,
        created_at=datetime.now(timezone.utc),
    )
    db.add(candidate)
    db.commit()

    # ── Step 2: Liveness check on first face image ───────────────
    try:
        first_image_bytes = await face_images[0].read()
        first_frame = _read_image(first_image_bytes)
        await face_images[0].seek(0)  # Reset for later use

        # Run liveness in a thread — CPU-heavy, must not block event loop
        liveness_result = await asyncio.to_thread(
            detect_liveness, first_frame, _get_liveness_model()
        )

        if not liveness_result["is_live"]:
            db.delete(candidate)
            db.commit()
            raise HTTPException(
                status_code=400,
                detail=f"Liveness check failed (confidence: {liveness_result['confidence']})",
            )
    except HTTPException:
        raise
    except Exception as e:
        print(f"\u26a0\ufe0f  Liveness check warning: {e} \u2014 continuing enrollment")

    # ── Step 3: Enroll face (all 5 images) ───────────────────────
    frames = []
    for img_file in face_images:
        img_bytes = await img_file.read()
        frame = _read_image(img_bytes)
        frames.append(frame)

    # Run DeepFace enroll in a thread (first run downloads model ~200 MB)
    face_result = await asyncio.to_thread(enroll_face, candidate_id, frames, db)
    if not face_result["success"]:
        db.delete(candidate)
        db.commit()
        raise HTTPException(status_code=400, detail=face_result["message"])

    # ── Step 4: Enroll voice (if provided) ───────────────────────
    voice_enrolled = False
    if voice_audio is not None:
        try:
            from auth.voice_auth import enroll_voice
            audio_bytes  = await voice_audio.read()
            if len(audio_bytes) > 1000:          # sanity: >1 KB
                audio_arr, sr = _read_audio(audio_bytes)
                if len(audio_arr) > sr * 2:      # at least 2 seconds of audio
                    # Run wav2vec2 in a thread (first run downloads model ~360 MB)
                    v_result = await asyncio.to_thread(
                        enroll_voice, candidate_id, audio_arr, sr, db
                    )
                    voice_enrolled = v_result["success"]
                    if not voice_enrolled:
                        print(f"\u26a0\ufe0f  Voice enrollment warning: {v_result['message']}")
                else:
                    print("\u26a0\ufe0f  Voice clip too short (<2 s) \u2014 skipping voice enrollment")
            else:
                print("\u26a0\ufe0f  Voice file too small \u2014 skipping voice enrollment")
        except Exception as e:
            # Non-fatal: voice enrollment failure does not block sign-up
            print(f"\u26a0\ufe0f  Voice enrollment error: {e} \u2014 continuing without voice")

    # ── Step 5: Generate TOTP ────────────────────────────────────
    totp_result = enroll_totp(candidate_id, db)

    # ── Log enrollment event ─────────────────────────────────────
    log_event(
        session_id=candidate_id,
        event_type="ENROLLMENT",
        detail={
            "candidate_name":  candidate_name,
            "candidate_email": candidate_email,
            "voice_enrolled":  voice_enrolled,
        },
        db_session=db,
    )

    return {
        "candidate_id":       candidate_id,
        "totp_qr_code_base64": totp_result["qr_code_base64"],
        "voice_enrolled":     voice_enrolled,
        "message":            "Enrollment successful \u2014 scan QR code in authenticator app",
    }


# ═════════════════════════════════════════════════════════════════
# POST /auth/login
# ═════════════════════════════════════════════════════════════════

@router.post("/login")
async def login_candidate(
    candidate_id: str        = Form(...),
    face_image:   UploadFile = File(...),
    totp_code:    str        = Form(...),
    voice_audio:  UploadFile = File(None),   # optional — required if voice enrolled
    db=Depends(get_db),
):
    """
    Multi-factor login: liveness → face → voice (if enrolled) → TOTP.

    Returns:
      { access_token, session_id, token_type: "bearer", voice_verified }
    """
    # ── Validate candidate exists ────────────────────────────────
    candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")

    # ── Step 1: Liveness check ───────────────────────────────────
    face_bytes = await face_image.read()
    face_frame = _read_image(face_bytes)

    try:
        liveness = await asyncio.to_thread(
            detect_liveness, face_frame, _get_liveness_model()
        )
        if not liveness["is_live"]:
            raise HTTPException(
                status_code=401,
                detail="Liveness check failed",
            )
    except HTTPException:
        raise
    except Exception as e:
        print(f"\u26a0\ufe0f  Liveness check warning: {e} — continuing login")

    # ── Step 2: Face verification ─────────────────────────────────────────────
    face_result = await asyncio.to_thread(verify_face, candidate_id, face_frame, db)
    if not face_result["verified"]:
        raise HTTPException(
            status_code=401,
            detail={
                "error": "Face verification failed",
                "similarity": face_result["similarity"],
            },
        )

    # ── Step 3: Voice verification (if candidate has voice enrolled) ──
    voice_verified   = False
    voice_similarity = None
    if candidate.voice_embedding is not None:
        if voice_audio is None:
            raise HTTPException(
                status_code=422,
                detail="Voice authentication is required for your account. Please provide a voice recording.",
            )
        try:
            from auth.voice_auth import verify_voice
            audio_bytes  = await voice_audio.read()
            audio_arr, sr = _read_audio(audio_bytes)
            v_result = await asyncio.to_thread(
                verify_voice, candidate_id, audio_arr, sr, db
            )
            voice_verified   = v_result["verified"]
            voice_similarity = v_result["similarity"]
            if not voice_verified:
                raise HTTPException(
                    status_code=401,
                    detail=f"Voice verification failed (similarity: {voice_similarity:.2%}). "
                           "Please speak clearly in a quiet environment.",
                )
        except HTTPException:
            raise
        except Exception as exc:
            print(f"\u26a0\ufe0f  Voice verification error: {exc} \u2014 blocking login")
            raise HTTPException(
                status_code=500,
                detail=f"Voice verification encountered an error: {exc}",
            )

    # ── Step 4: TOTP verification ────────────────────────────────
    if not candidate.totp_secret:
        raise HTTPException(status_code=401, detail="TOTP not enrolled")

    totp_result = verify_totp(candidate.totp_secret, totp_code)
    if not totp_result["verified"]:
        raise HTTPException(
            status_code=401,
            detail="TOTP verification failed",
        )

    # ── Step 5: Create session ───────────────────────────────────
    session_id = str(uuid.uuid4())
    session = DBSession(
        id=session_id,
        candidate_id=candidate_id,
        status="ACTIVE",
        started_at=datetime.now(timezone.utc),
    )
    db.add(session)
    db.commit()

    # ── Step 6: Create JWT ───────────────────────────────────────
    token = create_session_token(candidate_id, session_id)

    # ── Log login event ──────────────────────────────────────────
    log_event(
        session_id=session_id,
        event_type="LOGIN_SUCCESS",
        detail={
            "candidate_id":    candidate_id,
            "face_similarity": face_result["similarity"],
            "voice_verified":  voice_verified,
            "voice_similarity":voice_similarity,
        },
        db_session=db,
    )

    return {
        "access_token":   token,
        "session_id":     session_id,
        "token_type":     "bearer",
        "voice_verified": voice_verified,
    }


# ═════════════════════════════════════════════════════════════════
# GET /auth/totp-setup/{candidate_id}
# ═════════════════════════════════════════════════════════════════

@router.get("/totp-setup/{candidate_id}")
async def totp_setup(candidate_id: str, db=Depends(get_db)):
    """
    Return a fresh QR code for TOTP setup.
    """
    candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")

    if not candidate.totp_secret:
        raise HTTPException(status_code=400, detail="TOTP not enrolled for this candidate")

    from auth.totp_auth import get_totp_qr_code
    qr_b64 = get_totp_qr_code(candidate.totp_secret, candidate.email)

    return {
        "candidate_id": candidate_id,
        "qr_code_base64": qr_b64,
    }


# ═════════════════════════════════════════════════════════════════════════════
# POST /auth/totp-verify-enrollment
# ═════════════════════════════════════════════════════════════════════════════

class TotpEnrollVerifyRequest(BaseModel):
    candidate_id: str
    totp_code: str


@router.post("/totp-verify-enrollment")
async def totp_verify_enrollment(body: TotpEnrollVerifyRequest, db=Depends(get_db)):
    """
    Verify a TOTP code during enrollment (step 4) to confirm the authenticator
    app was set up correctly. No JWT required — candidate is not logged in yet.

    Returns:
        { verified: true } on success, 401 on failure.
    """
    candidate = db.query(Candidate).filter(Candidate.id == body.candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")

    if not candidate.totp_secret:
        raise HTTPException(status_code=400, detail="TOTP not enrolled for this candidate")

    result = verify_totp(candidate.totp_secret, body.totp_code)
    if not result["verified"]:
        raise HTTPException(
            status_code=401,
            detail="TOTP code is incorrect. Make sure your authenticator app is synced and try again.",
        )

    return {"verified": True, "message": "TOTP verified successfully"}
