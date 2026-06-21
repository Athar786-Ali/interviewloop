"""
Tests for Phase 11: Practice Mode Security Guard.

Verifies that:
1. POST /security/face-recheck returns {"status": "skipped"} when
   the session's pressure_mode is "practice" (no YOLO / DeepFace run).
2. The endpoint still processes the frame (or returns an expected error)
   when pressure_mode is "simulated" — regression check.
3. trigger_step_up_totp silently skips the challenge when the
   candidate has no TOTP secret enrolled.
"""
import io
import os
import sys

# ── Ensure backend/ is on the path ──────────────────────────────────
ROOT_DIR    = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BACKEND_DIR = os.path.join(ROOT_DIR, "backend")
sys.path.insert(0, BACKEND_DIR)

import pytest
import numpy as np
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session as OrmSession

from database import Base, Candidate, Session as DBSession, engine, SessionLocal
from main import app

# ── Helpers ──────────────────────────────────────────────────────────

def _make_tiny_jpeg() -> bytes:
    """Return a minimal 8×8 solid-black JPEG byte string."""
    import cv2
    img = np.zeros((8, 8, 3), dtype=np.uint8)
    _, buf = cv2.imencode(".jpg", img)
    return buf.tobytes()


def _get_token(client: TestClient, email: str, password: str) -> str:
    """Log in and return a JWT access token."""
    resp = client.post("/auth/password-login", json={"email": email, "password": password})
    assert resp.status_code == 200, f"Login failed: {resp.json()}"
    return resp.json()["access_token"]


# ── Fixtures ─────────────────────────────────────────────────────────

@pytest.fixture(scope="module")
def db():
    Base.metadata.create_all(bind=engine)
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture(scope="module")
def client():
    return TestClient(app)


@pytest.fixture(scope="module")
def practice_user(client: TestClient, db: OrmSession):
    """
    Email/password-only candidate (no face, no TOTP) with a practice
    session already created and a JWT that encodes that session_id.
    """
    email    = "practice_guard_test@example.com"
    password = "Practice123!"

    # Create candidate (ignore 400 if already exists)
    resp = client.post("/auth/signup", json={
        "name":     "Practice Guard",
        "email":    email,
        "password": password,
    })

    # Manually verify email so we can log in
    cand = db.query(Candidate).filter_by(email=email).first()
    if cand:
        cand.is_email_verified = True
        db.commit()
        db.refresh(cand)

    token = _get_token(client, email, password)
    return {"token": token, "candidate": cand}


# ── Tests ─────────────────────────────────────────────────────────────

class TestPracticeModeSecurityGuard:

    def _start_session(self, client, token: str, pressure_mode: str) -> str:
        """Start an interview session and return the updated JWT."""
        resp = client.post(
            "/interview/start",
            data={
                "job_role":           "Software Engineer",
                "max_questions":      "5",
                "time_limit_minutes": "10",
                "pressure_mode":      pressure_mode,
                "interview_mode":     "general",
                "selected_topics":    "[]",
            },
            headers={"Authorization": f"Bearer {token}"},
        )
        # If Ollama is not running the call returns 503; skip the test gracefully.
        if resp.status_code == 503:
            pytest.skip("Ollama not running — skipping interview start test")
        assert resp.status_code == 200, f"start failed: {resp.json()}"
        # The JWT returned by /auth/password-login already encodes a session_id
        # after /interview/start updates the DB row.  We reuse the original token.
        return token

    # ── Test 1: Practice mode → face-recheck must be skipped ─────────

    def test_face_recheck_skipped_in_practice_mode(self, client: TestClient, practice_user: dict, db: OrmSession):
        """
        When pressure_mode == 'practice', POST /security/face-recheck must
        return {"status": "skipped", ...} without running any YOLO/DeepFace.
        """
        token    = practice_user["token"]
        cand     = practice_user["candidate"]

        # Ensure there is an ACTIVE practice session for this candidate in DB
        session_row = db.query(DBSession).filter(
            DBSession.candidate_id == cand.id,
            DBSession.status       == "ACTIVE",
        ).first()

        if session_row is None:
            # Create one directly
            from datetime import datetime, timezone
            session_row = DBSession(
                candidate_id  = cand.id,
                status        = "ACTIVE",
                pressure_mode = "practice",
            )
            db.add(session_row)
            db.commit()
            db.refresh(session_row)
        else:
            session_row.pressure_mode = "practice"
            db.commit()

        jpeg = _make_tiny_jpeg()
        resp = client.post(
            "/security/face-recheck",
            files={"frame": ("frame.jpg", io.BytesIO(jpeg), "image/jpeg")},
            headers={"Authorization": f"Bearer {token}"},
        )

        assert resp.status_code == 200, f"Unexpected status: {resp.json()}"
        data = resp.json()
        assert data.get("status") == "skipped", (
            f"Expected status='skipped' in practice mode, got: {data}"
        )
        assert "message" in data

    # ── Test 2: Simulated mode → face-recheck processes the frame ────

    def test_face_recheck_processes_in_simulated_mode(self, client: TestClient, practice_user: dict, db: OrmSession):
        """
        When pressure_mode == 'simulated', /security/face-recheck must NOT
        return "skipped" — it should attempt processing (returning
        'identity_mismatch', 'error', or 'ok' depending on enrolment).
        """
        token = practice_user["token"]
        cand  = practice_user["candidate"]

        # Flip the session to simulated
        session_row = db.query(DBSession).filter(
            DBSession.candidate_id == cand.id,
            DBSession.status       == "ACTIVE",
        ).first()

        if session_row is None:
            from datetime import datetime, timezone
            session_row = DBSession(
                candidate_id  = cand.id,
                status        = "ACTIVE",
                pressure_mode = "simulated",
            )
            db.add(session_row)
            db.commit()
            db.refresh(session_row)
        else:
            session_row.pressure_mode = "simulated"
            db.commit()

        jpeg = _make_tiny_jpeg()
        resp = client.post(
            "/security/face-recheck",
            files={"frame": ("frame.jpg", io.BytesIO(jpeg), "image/jpeg")},
            headers={"Authorization": f"Bearer {token}"},
        )

        assert resp.status_code == 200, f"Unexpected status: {resp.json()}"
        data = resp.json()
        # Must NOT be "skipped" in simulated mode
        assert data.get("status") != "skipped", (
            f"face-recheck should NOT be skipped in simulated mode, got: {data}"
        )

    # ── Test 3: trigger_step_up_totp skips when no TOTP enrolled ─────

    def test_trigger_step_up_no_totp_skips_silently(self, client: TestClient, practice_user: dict, db: OrmSession):
        """
        When a candidate has no totp_secret, trigger_step_up_totp must
        return without sending any WebSocket event (no exception, no deadlock).
        """
        import asyncio
        from unittest.mock import AsyncMock, MagicMock
        from verification.continuous_verifier import trigger_step_up_totp

        cand = practice_user["candidate"]

        # Confirm candidate has no TOTP secret
        db.refresh(cand)
        assert not cand.totp_secret, "Test pre-condition failed: candidate should have no TOTP"

        # Build a minimal session row
        session_row = db.query(DBSession).filter(
            DBSession.candidate_id == cand.id,
        ).order_by(DBSession.started_at.desc()).first()
        assert session_row is not None

        # Mock ws_manager — send_to_candidate must NOT be called
        mock_ws = MagicMock()
        mock_ws.send_to_candidate = AsyncMock()

        # Run the function synchronously via asyncio.run
        asyncio.run(trigger_step_up_totp(
            session_id         = session_row.id,
            ws_manager         = mock_ws,
            db_session_factory = SessionLocal,
        ))

        # Assert NO WebSocket event was sent
        mock_ws.send_to_candidate.assert_not_called()
