"""
InterviewLoop — JWT Manager
RS256-based JWT creation and verification using RSA keypair.
"""

from datetime import datetime, timedelta, timezone

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt

import config


def load_private_key() -> str:
    """
    Load and decrypt the RSA private key from disk.

    Returns:
        PEM-encoded private key as string.
    """
    from cryptography.hazmat.primitives import serialization

    with open(config.PRIVATE_KEY_PATH, "rb") as f:
        private_key = serialization.load_pem_private_key(
            f.read(),
            password=config.KEY_PASSWORD,
        )

    # Re-serialize without encryption for python-jose
    pem_bytes = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption(),
    )

    return pem_bytes.decode("utf-8")


def load_public_key() -> str:
    """
    Load the RSA public key from disk.

    Returns:
        PEM-encoded public key as string.
    """
    with open(config.PUBLIC_KEY_PATH, "r") as f:
        return f.read()


def create_session_token(candidate_id: str, session_id: str) -> str:
    """
    Create a signed JWT token for an authenticated session.

    Payload includes candidate_id, session_id, mfa_passed flag,
    issued-at, and expiration time.

    Args:
        candidate_id: UUID of the authenticated candidate.
        session_id: UUID of the interview session.

    Returns:
        Signed JWT string.
    """
    now = datetime.now(timezone.utc)
    payload = {
        "candidate_id": candidate_id,
        "session_id": session_id,
        "mfa_passed": True,
        "iat": now,
        "exp": now + timedelta(hours=config.JWT_EXPIRY_HOURS),
    }

    private_key = load_private_key()
    token = jwt.encode(payload, private_key, algorithm=config.JWT_ALGORITHM)

    return token


def verify_token(token: str) -> dict | None:
    """
    Verify and decode a JWT token.

    Args:
        token: JWT string to verify.

    Returns:
        Decoded payload dict if valid, None if expired/invalid.
    """
    try:
        public_key = load_public_key()
        payload = jwt.decode(
            token,
            public_key,
            algorithms=[config.JWT_ALGORITHM],
        )
        return payload
    except JWTError:
        return None


def get_current_candidate(token: str) -> dict:
    """
    FastAPI dependency — extracts and validates the current candidate
    from a Bearer token.

    Args:
        token: JWT Bearer token string.

    Returns:
        Decoded payload with candidate_id and session_id.

    Raises:
        HTTPException 401 if token is invalid or expired.
    """
    payload = verify_token(token)

    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return payload


# ── Reusable FastAPI Bearer dependency ───────────────────────────────
_bearer_scheme = HTTPBearer(auto_error=True)


def get_token_payload(
    credentials: HTTPAuthorizationCredentials = Depends(_bearer_scheme),
) -> dict:
    """
    FastAPI dependency — extracts the Bearer token from the Authorization
    header and returns the verified JWT payload.

    Import this wherever you need a protected endpoint:

        from auth.jwt_manager import get_token_payload

        @router.get("/protected")
        async def protected(payload: dict = Depends(get_token_payload)):
            candidate_id = payload["candidate_id"]
    """
    return get_current_candidate(credentials.credentials)
