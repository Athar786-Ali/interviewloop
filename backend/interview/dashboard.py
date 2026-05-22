"""
MIIC-Sec — Student Dashboard API
GET /user/dashboard — Returns candidate profile, aggregate stats, and interview history.
"""
import json
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException

from database import get_db, Candidate, Session as DBSession, AuditLog, InterviewLog
from auth.jwt_manager import get_token_payload

router = APIRouter(prefix="/user", tags=["Dashboard"])


# ═══════════════════════════════════════════════════════════════════
# GET /user/dashboard
# ═══════════════════════════════════════════════════════════════════

@router.get("/dashboard")
async def get_dashboard(
    payload: dict = Depends(get_token_payload),
    db=Depends(get_db),
):
    """
    Return a complete student dashboard payload.

    Returns:
        {
            candidate: { id, name, email, member_since },
            stats: { total_interviews, average_score, best_score, interviews_this_month },
            sessions: [
                {
                    session_id, date, final_score, recommendation,
                    job_role, interview_mode, company_target, duration_minutes,
                    question_count
                },
                ...
            ]
        }
    """
    candidate_id: str = payload["candidate_id"]

    # ── Fetch candidate ──────────────────────────────────────────
    candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")

    # ── Fetch all COMPLETED sessions ─────────────────────────────
    sessions_rows = (
        db.query(DBSession)
        .filter(
            DBSession.candidate_id == candidate_id,
            DBSession.status == "COMPLETED",
        )
        .order_by(DBSession.started_at.desc())
        .all()
    )

    # ── For each session, pull job_role / company_target from audit log ──
    sessions_out = []
    all_scores   = []

    now = datetime.now(timezone.utc)

    for s in sessions_rows:
        score = float(s.final_score) if s.final_score is not None else 0.0
        all_scores.append(score)

        # Pull INTERVIEW_STARTED audit event for metadata
        audit_row = (
            db.query(AuditLog)
            .filter(
                AuditLog.session_id == s.id,
                AuditLog.event_type == "INTERVIEW_STARTED",
            )
            .first()
        )
        meta = {}
        if audit_row and audit_row.detail:
            try:
                meta = json.loads(audit_row.detail)
            except Exception:
                meta = {}

        # Count questions answered
        q_count = (
            db.query(InterviewLog)
            .filter(InterviewLog.session_id == s.id)
            .count()
        )

        # Compute duration
        duration = None
        if s.started_at and s.ended_at:
            duration = round((s.ended_at - s.started_at).total_seconds() / 60, 1)

        # Map score to recommendation using the new student-centric labels
        if score >= 7.5:
            recommendation = "EXCELLENT"
        elif score >= 5.0:
            recommendation = "NEEDS PRACTICE"
        else:
            recommendation = "POOR"

        sessions_out.append({
            "session_id":       s.id,
            "date":             s.started_at.isoformat() if s.started_at else None,
            "final_score":      score,
            "recommendation":   recommendation,
            "job_role":         meta.get("job_role", "Software Engineering"),
            "interview_mode":   meta.get("mode", "topic"),
            "company_target":   meta.get("company_target", ""),
            "duration_minutes": duration,
            "question_count":   q_count,
        })

    # ── Aggregate stats ──────────────────────────────────────────
    total_interviews = len(all_scores)
    average_score    = round(sum(all_scores) / len(all_scores), 2) if all_scores else 0.0
    best_score       = round(max(all_scores), 2) if all_scores else 0.0

    # Interviews this month
    this_month = sum(
        1 for s in sessions_rows
        if s.started_at and s.started_at.year == now.year and s.started_at.month == now.month
    )

    return {
        "candidate": {
            "id":            candidate_id,
            "name":          candidate.name,
            "email":         candidate.email,
            "member_since":  candidate.created_at.isoformat() if candidate.created_at else None,
        },
        "stats": {
            "total_interviews":      total_interviews,
            "average_score":         average_score,
            "best_score":            best_score,
            "interviews_this_month": this_month,
        },
        "sessions": sessions_out,
    }
