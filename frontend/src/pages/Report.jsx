import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import api from '../utils/api'
import styles from './Report.module.css'

function Check({ ok, label }) {
  return (
    <div className={styles.checkRow}>
      <span className={ok ? styles.checkPass : styles.checkFail}>{ok ? '✓' : '✗'}</span>
      <span>{label}</span>
    </div>
  )
}

function RecBadge({ rec }) {
  const cfg = {
    EXCELLENT:          { cls: 'badge-hire',   label: '🏆 EXCELLENT' },
    'NEEDS PRACTICE':   { cls: 'badge-review', label: '📈 NEEDS PRACTICE' },
    POOR:               { cls: 'badge-reject', label: '📉 POOR' },
    // Legacy (keep for old reports)
    HIRE:               { cls: 'badge-hire',   label: '✅ HIRE' },
    REVIEW:             { cls: 'badge-review', label: '🔍 REVIEW' },
    REJECT:             { cls: 'badge-reject', label: '❌ REJECT' },
  }
  const { cls, label } = cfg[rec] || { cls: 'badge-review', label: rec }
  return <span className={`badge ${cls}`} style={{ fontSize: '0.95rem', padding: '6px 18px' }}>{label}</span>
}

function SecurityEventIcon({ type }) {
  const map = {
    SESSION_TERMINATED: '⛔', TAB_SWITCH: '🔀', IDENTITY_MISMATCH: '👤',
    IDENTITY_VERIFIED: '✅', STEP_UP_PASSED: '🔐', STEP_UP_FAILED: '❌',
    MULTIPLE_PERSONS_DETECTED: '👥', MULTIPLE_SPEAKERS_DETECTED: '🎙',
    INTERVIEW_STARTED: '▶', INTERVIEW_COMPLETED: '🏁', QUESTION_ANSWERED: '💬',
    LOGIN_SUCCESS: '🔓', ENROLLMENT: '📝', CODE_EXECUTED: '💻', FACE_RECHECK: '📷',
  }
  return <span title={type}>{map[type] || '📌'}</span>
}

// ── Detailed Feedback Section ─────────────────────────────────────
function FeedbackSection({ feedback, mode, topics, duration, totalQ }) {
  if (!feedback) return (
    <div className="card" style={{ marginTop: 16 }}>
      <div className="empty-state">
        <div className="empty-state-icon">📋</div>
        <div className="empty-state-title">No Feedback Available</div>
        <div className="empty-state-desc">Feedback is generated after completing at least 3 questions in your interview session.</div>
        <Link to="/interview" className="btn btn-primary" style={{ marginTop: 4 }}>Start a New Interview</Link>
      </div>
    </div>
  )
  const modeLabel = mode === 'topic' ? 'Topic Based' : mode === 'resume' ? 'Resume Based' : mode === 'combined' ? 'Combined' : mode || '—'

  const cards = [
    {
      title: '✅ What You Did Well', items: feedback.strengths || [],
      icon: '✔', border: 'var(--clr-success)', itemColor: 'var(--clr-success)',
    },
    {
      title: '🎯 What to Work On', items: feedback.weaknesses || [],
      icon: '→', border: 'var(--clr-warning)', itemColor: 'var(--clr-warning)',
    },
    {
      title: '📚 Suggested Topics to Revisit', items: feedback.topics_to_study || [],
      icon: '📚', border: 'var(--clr-primary)', itemColor: 'var(--clr-primary)',
    },
  ]

  return (
    <div className="card" style={{ marginTop: 16 }}>
      <h2>🎯 Interview Feedback</h2>

      {/* Info row */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 20, padding: '12px 16px', background: 'var(--clr-surface-2)', borderRadius: 'var(--r-sm)' }}>
        <div>
          <div style={{ fontSize: '0.72rem', color: 'var(--clr-text-muted)', textTransform: 'uppercase' }}>Mode</div>
          <div style={{ fontWeight: 600, marginTop: 2 }}>{modeLabel}</div>
        </div>
        {topics?.length > 0 && (
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--clr-text-muted)', textTransform: 'uppercase' }}>Topics</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
              {topics.map(t => (
                <span key={t} className="badge badge-easy" style={{ fontSize: '0.72rem' }}>{t.toUpperCase()}</span>
              ))}
            </div>
          </div>
        )}
        <div>
          <div style={{ fontSize: '0.72rem', color: 'var(--clr-text-muted)', textTransform: 'uppercase' }}>Duration</div>
          <div style={{ fontWeight: 600, marginTop: 2 }}>{duration ? `${duration} min` : '—'}</div>
        </div>
        <div>
          <div style={{ fontSize: '0.72rem', color: 'var(--clr-text-muted)', textTransform: 'uppercase' }}>Questions</div>
          <div style={{ fontWeight: 600, marginTop: 2 }}>{totalQ}</div>
        </div>
      </div>

      {/* 3 feedback cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 14, marginBottom: 16 }}>
        {cards.map(card => (
          <div key={card.title} style={{ border: `2px solid ${card.border}`, borderRadius: 'var(--r-sm)', padding: 14 }}>
            <div style={{ fontWeight: 700, marginBottom: 10, color: card.border }}>{card.title}</div>
            {card.items.length === 0
              ? <div style={{ color: 'var(--clr-text-muted)', fontSize: '0.82rem' }}>—</div>
              : card.items.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6, fontSize: '0.85rem' }}>
                  <span style={{ color: card.itemColor, flexShrink: 0 }}>{card.icon}</span>
                  <span>{item}</span>
                </div>
              ))
            }
          </div>
        ))}
      </div>

      {/* Overall assessment */}
      {feedback.overall_assessment && (
        <div style={{ border: '2px solid var(--clr-border)', borderRadius: 'var(--r-sm)', padding: 14 }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>📝 Overall Assessment</div>
          <p style={{ margin: 0, lineHeight: 1.65, color: 'var(--clr-text-muted)', fontSize: '0.9rem' }}>
            {feedback.overall_assessment}
          </p>
        </div>
      )}
    </div>
  )
}

// ── Main Report page ──────────────────────────────────────────────
export default function Report() {
  const { sessionId } = useParams()
  const [report,    setReport]    = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState('')
  const [verifying, setVerifying] = useState(false)
  const [sigResult, setSigResult] = useState(null)

  useEffect(() => {
    api.get(`/report/${sessionId}`)
      .then(r => setReport(r.data))
      .catch(e => setError(e.response?.data?.detail || 'Report not found.'))
      .finally(() => setLoading(false))
  }, [sessionId])

  const verifySignature = async () => {
    setVerifying(true)
    try {
      const { data } = await api.get(`/report/${sessionId}/verify`)
      setSigResult({ valid: data.valid, verified_at: data.verified_at })
    } catch { setSigResult({ valid: false, verified_at: new Date().toISOString() }) }
    finally { setVerifying(false) }
  }

  if (loading) return (
    <div style={{ minHeight: '100vh' }}>
      <nav className="nav-bar">
        <div className="nav-logo">
          <div className="nav-logo-mark">🛡</div>
          <span className="nav-wordmark">InterviewLoop</span>
          <span className="nav-page-indicator">Report</span>
        </div>
        <Link to="/dashboard" className="btn btn-ghost" style={{ fontSize: '0.85rem', padding: '7px 14px' }}>← Dashboard</Link>
      </nav>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px' }}>
        <div className="skeleton" style={{ width: 300, height: 36, borderRadius: 8, marginBottom: 10 }} />
        <div className="skeleton skeleton-text medium" style={{ marginBottom: 32 }} />
        <div className="skeleton-card" style={{ height: 120, marginBottom: 24 }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
          {[1,2,3].map(i => <div key={i} className="skeleton-card" style={{ height: 100 }} />)}
        </div>
        <div className="skeleton-card" style={{ height: 280 }} />
      </div>
    </div>
  )
  if (error) return (
    <div className="page-center">
      <div className="card" style={{ maxWidth: 420, textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: 12 }}>📭</div>
        <h2 style={{ color: 'var(--clr-danger)' }}>Report Not Found</h2>
        <p style={{ color: 'var(--clr-text-muted)', marginBottom: 20 }}>{error}</p>
        <Link to="/login" className="btn btn-ghost">← Back to Login</Link>
      </div>
    </div>
  )

  const emotionData = (report.emotion_timeseries || []).map((e, i) => ({
    t: i + 1,
    gaze:   parseFloat((e.gaze_score || 0).toFixed(2)),
    speech: parseFloat((e.speech_confidence || 0).toFixed(2)),
  }))

  const t1        = report.tier_1_result || {}
  const secEvents = report.security_events || []
  const scores    = report.interview_scores || []
  const fb        = report.detailed_feedback || null

  return (
    <div style={{ minHeight: '100vh', paddingBottom: 64 }}>
      {/* Nav bar */}
      <nav className="nav-bar">
        <div className="nav-logo">
          <div className="nav-logo-mark">🛡</div>
          <span className="nav-wordmark">InterviewLoop</span>
          <span className="nav-page-indicator">Report</span>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <button className="btn btn-ghost" onClick={verifySignature} disabled={verifying} style={{ fontSize: '0.82rem', padding: '7px 14px' }}>
            {verifying ? <><span className="spinner" /> Verifying…</> : '🔏 Verify Signature'}
          </button>
          <button className="btn btn-ghost" style={{ fontSize: '0.82rem', padding: '7px 14px' }} onClick={async () => {
            try {
              const { data } = await api.get(`/report/${sessionId}/download`, { responseType: 'blob' })
              const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }))
              const a = document.createElement('a'); a.href = url; a.download = `${sessionId}_report.json`
              document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url)
            } catch { alert('Download failed.') }
          }}>⬇ JSON</button>
          <button className="btn btn-ghost" style={{ fontSize: '0.82rem', padding: '7px 14px' }} onClick={async () => {
            try {
              const resp = await api.get(`/report/${sessionId}/pdf`, { responseType: 'blob' })
              const url  = URL.createObjectURL(resp.data)
              const a    = document.createElement('a'); a.href = url; a.download = `report_${sessionId.slice(0,8)}.pdf`
              document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url)
            } catch { alert('PDF generation failed.') }
          }}>📄 PDF</button>
          <button
            className="btn"
            style={{ background: '#0a66c2', color: '#fff', fontSize: '0.82rem', padding: '7px 14px' }}
            onClick={() => {
              const score = report?.average_score?.toFixed(1) || '—'
              const rec   = report?.recommendation || ''
              const text  = encodeURIComponent(`🏆 Just completed a Verified Mock Interview on InterviewLoop!\n\n📊 Score: ${score}/10 — ${rec}\n#MockInterview #CareerPrep`)
              window.open(`https://www.linkedin.com/feed/?shareActive=true&text=${text}`, '_blank')
            }}
          >🔗 Share</button>
          <Link to="/dashboard" className="btn btn-primary" style={{ fontSize: '0.82rem', padding: '7px 14px' }}>← Dashboard</Link>
        </div>
      </nav>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>

      {sigResult && (
        <div className={`alert ${sigResult.valid ? 'alert-success' : 'alert-danger'}`} style={{ marginBottom: 16 }}>
          {sigResult.valid
            ? `✅ SIGNATURE VALID — Verified at ${new Date(sigResult.verified_at).toLocaleString()}`
            : '🚨 REPORT TAMPERED — Signature verification failed.'}
        </div>
      )}

      <div className={styles.grid}>
        {/* Tier 1 */}
        <div className="card">
          <h2>🔐 Identity Verification</h2>
          <Check ok={t1.face_verified}   label="Face biometric verified" />
          <Check ok={t1.voice_verified}  label="Voice biometric verified" />
          <Check ok={t1.totp_verified}   label="TOTP 2FA verified" />
          <Check ok={t1.liveness_passed} label="Liveness check passed" />
        </div>

        {/* Overall */}
        <div className="card" style={{ textAlign: 'center' }}>
          <h2>📊 Overall Result</h2>
          <div style={{ fontSize: '3rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--clr-primary)', marginBottom: 8 }}>
            {report.average_score?.toFixed(1)}<span style={{ fontSize: '1rem', color: 'var(--clr-text-muted)' }}>/10</span>
          </div>
          <RecBadge rec={report.recommendation} />
          <div className="divider" />
          <div style={{ fontSize: '0.8rem', color: 'var(--clr-text-muted)' }}>
            <div>Session: <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem' }}>{report.session_id}</span></div>
            <div>Candidate: <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem' }}>{report.candidate_id}</span></div>
            <div>Generated: {report.generated_at ? new Date(report.generated_at).toLocaleString() : '—'}</div>
            <div style={{ marginTop: 4 }}>
              Audit chain:&nbsp;
              <span style={{ color: report.audit_chain_valid ? 'var(--clr-success)' : 'var(--clr-danger)', fontWeight: 600 }}>
                {report.audit_chain_valid ? '✓ INTACT' : '✗ BROKEN'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Score table */}
      <div className="card" style={{ marginTop: 16 }}>
        <h2>💬 Question Scores</h2>
        {scores.length === 0
          ? <p style={{ color: 'var(--clr-text-muted)' }}>No interview data recorded.</p>
          : (
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr><th>#</th><th>Question</th><th>Response (excerpt)</th><th>Difficulty</th><th>Score</th></tr>
                </thead>
                <tbody>
                  {scores.map((s, i) => (
                    <tr key={i}>
                      <td style={{ fontFamily: 'var(--font-mono)' }}>{s.question_number}</td>
                      <td style={{ maxWidth: 280 }}>{s.question || '—'}</td>
                      <td style={{ maxWidth: 220, color: 'var(--clr-text-muted)' }}>
                        {s.response ? s.response.slice(0, 80) + (s.response.length > 80 ? '…' : '') : '—'}
                      </td>
                      <td><span className={`badge badge-${s.difficulty}`}>{s.difficulty}</span></td>
                      <td>
                        <span style={{ fontWeight: 700, color: s.score >= 7.5 ? 'var(--clr-success)' : s.score >= 5 ? 'var(--clr-warning)' : 'var(--clr-danger)' }}>
                          {s.score?.toFixed(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        }
      </div>

      {/* Detailed Feedback */}
      <FeedbackSection
        feedback={fb}
        mode={report.interview_mode}
        topics={report.topics_covered}
        duration={report.time_taken_minutes}
        totalQ={report.total_questions}
      />

      {/* Emotion chart */}
      {emotionData.length > 0 && (
        <div className="card" style={{ marginTop: 16 }}>
          <h2>😶 Emotion Timeline</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={emotionData} margin={{ top: 4, right: 16, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,119,179,0.12)" />
              <XAxis dataKey="t" tick={{ fontSize: 11, fill: 'var(--clr-text-muted)' }} />
              <YAxis domain={[0, 1]} tick={{ fontSize: 11, fill: 'var(--clr-text-muted)' }} />
              <Tooltip contentStyle={{ background: 'var(--clr-surface-2)', border: '1px solid var(--clr-border)', borderRadius: 6, fontSize: 12 }}
                formatter={(v, n) => [`${(v * 100).toFixed(0)}%`, n === 'gaze' ? 'Gaze' : 'Speech']} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="gaze"   stroke="var(--clr-primary)" strokeWidth={2} dot={false} name="Gaze score" />
              <Line type="monotone" dataKey="speech" stroke="var(--clr-accent)"  strokeWidth={2} dot={false} name="Speech confidence" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Security events */}
      <div className="card" style={{ marginTop: 16 }}>
        <h2>🔍 Security Event Log ({secEvents.length})</h2>
        {secEvents.length === 0
          ? <p style={{ color: 'var(--clr-text-muted)' }}>No security events recorded.</p>
          : (
            <div className={styles.eventList}>
              {secEvents.map((e, i) => (
                <div key={i} className={styles.eventRow}>
                  <SecurityEventIcon type={e.event_type} />
                  <div className={styles.eventBody}>
                    <span className={styles.eventType}>{e.event_type}</span>
                    <span className={styles.eventTime}>{e.timestamp ? new Date(e.timestamp).toLocaleTimeString() : ''}</span>
                  </div>
                  {e.detail && Object.keys(e.detail).length > 0 && (
                    <span className={styles.eventDetail}>
                      {Object.entries(e.detail).slice(0, 3).map(([k, v]) => `${k}: ${v}`).join(' · ')}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )
        }
      </div>

      </div>

      <div style={{ textAlign: 'center', marginTop: 24 }}>
        <Link to="/dashboard" className="btn btn-ghost">← Back to Dashboard</Link>
      </div>
    </div>
  )
}
