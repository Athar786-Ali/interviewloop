"""
Tests for Phase 10: Password Recovery, Change Password, and unverified signup UX.
"""
import os
import sys

# ── Ensure backend/ is on the path ──────────────────────────────
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BACKEND_DIR = os.path.join(ROOT_DIR, "backend")
sys.path.insert(0, BACKEND_DIR)

import pytest
from fastapi.testclient import TestClient
from database import Candidate, OtpToken, Base, engine, SessionLocal
from main import app

@pytest.fixture(scope="module")
def db_session():
    # Setup testing db or just use local
    Base.metadata.create_all(bind=engine)
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()

@pytest.fixture(scope="module")
def client():
    return TestClient(app)

def test_signup_unverified_resends_otp(client: TestClient, db_session):
    # 1. Signup once
    client.post("/auth/signup", json={
        "name": "Phase 10 Test",
        "email": "p10@example.com",
        "password": "password123"
    })
    
    # Check OTP created
    token = db_session.query(OtpToken).filter_by(email="p10@example.com").first()
    assert token is not None
    
    # Backdate token to avoid 60s cooldown
    from datetime import datetime, timedelta, timezone
    token.created_at = datetime.now(timezone.utc) - timedelta(seconds=65)
    db_session.commit()
    
    # 2. Signup again with same email
    resp = client.post("/auth/signup", json={
        "name": "Phase 10 Test 2",
        "email": "p10@example.com",
        "password": "newpassword123"
    })
    
    assert resp.status_code == 400
    data = resp.json()
    assert data["error"] == "unverified_account"
    assert data["requires_email_verification"] is True
    
    # Check that a new OTP was sent
    otp_count_new = db_session.query(OtpToken).filter_by(email="p10@example.com").count()
    assert otp_count_new == 1

def test_forgot_password_generic_response(client: TestClient, db_session):
    from datetime import datetime, timedelta, timezone
    
    # 1. Create user
    client.post("/auth/signup", json={"name": "P11", "email": "p11@example.com", "password": "password123"})
    token = db_session.query(OtpToken).filter_by(email="p11@example.com").first()
    token.created_at = datetime.now(timezone.utc) - timedelta(seconds=65)
    db_session.commit()
    
    # Try non-existent email
    resp1 = client.post("/auth/forgot-password", json={"email": "nobody@example.com"})
    assert resp1.status_code == 200
    assert "sent a password reset code" in resp1.json()["message"]
    
    # Try existing email (from previous test)
    resp2 = client.post("/auth/forgot-password", json={"email": "p11@example.com"})
    assert resp2.status_code == 200
    assert "sent a password reset code" in resp2.json()["message"]
    
    # Trying again immediately should hit the 60s cooldown
    resp3 = client.post("/auth/forgot-password", json={"email": "p11@example.com"})
    assert resp3.status_code == 429
    assert "wait 60 seconds" in resp3.json()["detail"]

def test_reset_password_flow(client: TestClient, db_session):
    from datetime import datetime, timedelta, timezone
    # 1. Create a fully verified user
    client.post("/auth/signup", json={
        "name": "Reset Test",
        "email": "reset@example.com",
        "password": "oldpassword"
    })
    token_obj = db_session.query(OtpToken).filter_by(email="reset@example.com").first()
    client.post("/auth/verify-email", json={"email": "reset@example.com", "otp_code": token_obj.otp_code})
    
    # Shift token time to bypass 60s cooldown logic
    token_obj.created_at = datetime.now(timezone.utc) - timedelta(seconds=65)
    db_session.commit()
    
    # 2. Request forgot password
    client.post("/auth/forgot-password", json={"email": "reset@example.com"})
    
    # Find the new OTP
    new_token = db_session.query(OtpToken).filter(OtpToken.email == "reset@example.com", OtpToken.used == False).order_by(OtpToken.created_at.desc()).first()
    assert new_token is not None
    
    # 3. Attempt reset with wrong code
    bad_resp = client.post("/auth/reset-password", json={
        "email": "reset@example.com",
        "otp_code": "000000",
        "new_password": "newpassword123"
    })
    assert bad_resp.status_code == 400
    assert "invalid or has expired" in bad_resp.json()["detail"]
    
    # 4. Attempt reset with short password
    short_resp = client.post("/auth/reset-password", json={
        "email": "reset@example.com",
        "otp_code": new_token.otp_code,
        "new_password": "short"
    })
    assert short_resp.status_code == 400
    
    # 5. Successful reset
    good_resp = client.post("/auth/reset-password", json={
        "email": "reset@example.com",
        "otp_code": new_token.otp_code,
        "new_password": "newpassword123"
    })
    assert good_resp.status_code == 200
    
    # 6. Verify login with new password
    login_resp = client.post("/auth/password-login", json={
        "email": "reset@example.com",
        "password": "newpassword123"
    })
    assert login_resp.status_code == 200
    assert "access_token" in login_resp.json()

def test_change_password_authenticated(client: TestClient, db_session):
    # 1. Login to get token
    login_resp = client.post("/auth/password-login", json={
        "email": "reset@example.com",
        "password": "newpassword123"
    })
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # 2. Change password without auth
    unauth_resp = client.post("/auth/change-password", json={
        "old_password": "newpassword123",
        "new_password": "brandnewpassword"
    })
    if unauth_resp.status_code not in (401, 403):
        print("UNAUTH RESP:", unauth_resp.json())
    assert unauth_resp.status_code in (401, 403)
    
    # 3. Change password with wrong old password
    wrong_old = client.post("/auth/change-password", headers=headers, json={
        "old_password": "wrongpassword",
        "new_password": "brandnewpassword"
    })
    assert wrong_old.status_code == 401
    
    # 4. Change password successfully
    success_resp = client.post("/auth/change-password", headers=headers, json={
        "old_password": "newpassword123",
        "new_password": "brandnewpassword"
    })
    assert success_resp.status_code == 200
    
    # 5. Verify login with brand new password
    new_login = client.post("/auth/password-login", json={
        "email": "reset@example.com",
        "password": "brandnewpassword"
    })
    assert new_login.status_code == 200
