/**
 * Login.jsx — 4-step multi-factor login.
 *
 * Step 0: Enter Candidate ID
 * Step 1: Webcam face capture
 * Step 2: TOTP code → POST /auth/login → store token → navigate('/interview')
 *
 * Token is written to sessionStorage via setAuth() so it survives
 * React re-renders and Vite HMR module resets.
 */
import React, { useEffect, useRef, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api, { setAuth } from '../utils/api'
import styles from './Login.module.css'

// ── Step indicator ────────────────────────────────────────────────────────────
function StepBar({ current }) {
  const labels = ['Face', 'TOTP']
  return (
    <div className="steps" style={{ marginBottom: 28 }}>
      {labels.map((label, i) => {
        const n   = i + 1
        const cls = n < current ? 'done' : n === current ? 'active' : ''
        return (
          <React.Fragment key={n}>
            {i > 0 && <div className={`step-connector ${n <= current ? 'done' : ''}`} />}
            <div style={{ textAlign: 'center' }}>
              <div className={`step-dot ${cls}`}>{n < current ? '✓' : n}</div>
              <div style={{ fontSize: '0.68rem', color: 'var(--clr-text-muted)', marginTop: 3 }}>{label}</div>
            </div>
          </React.Fragment>
        )
      })}
    </div>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────

// ── Component ─────────────────────────────────────────────────────────────────
export default function Login() {
  const navigate = useNavigate()

  // Pre-fill candidate ID from enrollment if available
  const [candidateId, setCandidateId] = useState(
    () => localStorage.getItem('lastCandidateId') || ''
  )
  const [step,        setStep]        = useState(0)
  const [faceBlob,    setFaceBlob]    = useState(null)
  const [totpCode,    setTotpCode]    = useState('')
  const [error,       setError]       = useState('')
  const [loading,     setLoading]     = useState(false)

  // Camera
  const videoRef  = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const [camOn, setCamOn] = useState(false)

  // Prevent double-submit
  const doneRef = useRef(false)

  // ── Camera ──────────────────────────────────────────────────────────────────
  const startCam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      videoRef.current.srcObject = stream
      streamRef.current = stream
      await videoRef.current.play()
      setCamOn(true)
      setError('')
    } catch {
      setError('Camera access denied.')
    }
  }

  const stopCam = () => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    setCamOn(false)
  }

  const capturePhoto = () => {
    const v = videoRef.current, c = canvasRef.current
    c.width = v.videoWidth; c.height = v.videoHeight
    c.getContext('2d').drawImage(v, 0, 0)
    c.toBlob(blob => {
      setFaceBlob(blob)
      stopCam()
      setStep(2)       // → TOTP step
    }, 'image/jpeg', 0.9)
  }

  // Start cam when step 1 mounts
  useEffect(() => { if (step === 1) startCam() }, [step]) // eslint-disable-line

  // Cleanup cam on unmount
  useEffect(() => () => stopCam(), []) // eslint-disable-line

  // ── Submit ───────────────────────────────────────────────────────────────────
  const submit = async () => {
    if (doneRef.current) return
    if (totpCode.length !== 6) { setError('Enter the 6-digit TOTP code.'); return }

    doneRef.current = true
    setError('')
    setLoading(true)

    try {
      const fd = new FormData()
      fd.append('candidate_id', candidateId.trim())
      fd.append('face_image',   faceBlob,  'face.jpg')
      fd.append('totp_code',    totpCode)

      const { data } = await api.post('/auth/login', fd)
      console.log('[Login] Response OK:', data)

      // Write token + session to sessionStorage BEFORE navigating
      setAuth({
        token:       data.access_token,
        sessionId:   data.session_id,
        candidateId: candidateId.trim(),
      })
      console.log('[Login] Auth stored, navigating to /interview…')

      // Hard redirect — completely unmounts Login and mounts Interview
      window.location.href = '/interview'

    } catch (e) {
      doneRef.current = false   // allow retry
      console.error('[Login] Error:', e.response?.data || e.message)
      const detail = e.response?.data?.detail
      setError(typeof detail === 'string' ? detail : JSON.stringify(detail) || 'Login failed. Check console for details.')
    } finally {
      setLoading(false)
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="page-center">
      <div className="card" style={{ width: '100%', maxWidth: 480 }}>
        <div className="page-header">
          <div className="logo-mark">🛡</div>
          <h1>MIIC-Sec Login</h1>
        </div>

        {step > 0 && <StepBar current={step} />}
        {error && <div className="alert alert-danger" style={{ marginBottom: 16 }}>{error}</div>}

        {/* ── Step 0: Candidate ID ── */}
        {step === 0 && (
          <div className={styles.stepSlide}>
            <h2 style={{ marginBottom: 12 }}>Enter your Candidate ID</h2>
            <input
              className="input"
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              value={candidateId}
              onChange={e => setCandidateId(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && candidateId.trim() && setStep(1)}
              style={{ marginBottom: 16, fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}
              autoFocus
            />
            <button
              className="btn btn-primary"
              disabled={!candidateId.trim()}
              onClick={() => setStep(1)}
            >
              Continue →
            </button>
            <p style={{ marginTop: 16, fontSize: '0.82rem', color: 'var(--clr-text-muted)' }}>
              Not enrolled? <Link to="/enroll">Register here</Link>
            </p>
          </div>
        )}

        {/* ── Step 1: Face ── */}
        {step === 1 && (
          <div className={styles.stepSlide}>
            <h2 style={{ marginBottom: 12 }}>📷 Face Verification</h2>
            <p style={{ color: 'var(--clr-text-muted)', marginBottom: 12 }}>
              Look directly at the camera and click Capture.
            </p>
            <div className="webcam-frame" style={{ maxWidth: 380, margin: '0 auto 16px' }}>
              <video ref={videoRef} muted playsInline style={{ width: '100%' }} />
              <div className={`webcam-overlay ${camOn ? 'active' : ''}`} />
            </div>
            <canvas ref={canvasRef} style={{ display: 'none' }} />
            {faceBlob
              ? <p className="alert alert-success" style={{ margin: '0 0 12px' }}>✓ Photo captured</p>
              : (
                <button className="btn btn-primary" disabled={!camOn} onClick={capturePhoto}>
                  📸 Capture Face
                </button>
              )
            }
          </div>
        )}

        {/* ── Step 2: TOTP ── */}
        {step === 2 && (
          <div className={styles.stepSlide}>
            <h2 style={{ marginBottom: 12 }}>🔐 Enter TOTP Code</h2>
            <p style={{ color: 'var(--clr-text-muted)', marginBottom: 16 }}>
              Open your authenticator app and enter the current 6-digit code.
            </p>
            <input
              className="input"
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="000000"
              value={totpCode}
              onChange={e => setTotpCode(e.target.value.replace(/\D/g, ''))}
              onKeyDown={e => e.key === 'Enter' && totpCode.length === 6 && submit()}
              style={{
                fontSize: '1.8rem', letterSpacing: '0.35em',
                textAlign: 'center', maxWidth: 200, marginBottom: 20,
              }}
              autoFocus
            />
            <button
              className="btn btn-success"
              disabled={loading || totpCode.length !== 6}
              onClick={submit}
            >
              {loading ? <><span className="spinner" /> Verifying…</> : '✓ Login'}
            </button>
            {loading && (
              <p style={{ marginTop: 12, fontSize: '0.8rem', color: 'var(--clr-text-muted)' }}>
                ⏳ Processing biometrics — may take up to 60 seconds on first run…
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
