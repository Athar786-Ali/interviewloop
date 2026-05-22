/**
 * Enrollment.jsx — 5-step candidate enrollment wizard (fixed).
 * step 1: Name + email
 * step 2: Face capture × 5
 * step 3: Create enrollment (no voice)
 * step 4: TOTP QR scan + code verify
 * step 5: Success screen
 */
import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import styles from './Enrollment.module.css'

// ─── Step Bar ─────────────────────────────────────────────────────────────────
function StepBar({ current }) {
  const labels = ['Info', 'Face', 'Enroll', 'TOTP', 'Done']
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
              <div style={{ fontSize: '0.68rem', color: 'var(--clr-text-muted)', marginTop: 3 }}>
                {label}
              </div>
            </div>
          </React.Fragment>
        )
      })}
    </div>
  )
}

// ─── Step 1: Info ─────────────────────────────────────────────────────────────
function InfoStep({ onNext }) {
  const [name,  setName]  = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  const next = () => {
    if (!name.trim() || !email.trim()) { setError('Name and email are required.'); return }
    if (!/\S+@\S+\.\S+/.test(email))   { setError('Enter a valid email address.'); return }
    onNext(name.trim(), email.trim())
  }

  return (
    <div className={styles.stepContent}>
      <h2>👤 Your Information</h2>
      <p style={{ color: 'var(--clr-text-muted)', marginBottom: 16 }}>
        Enter your details to begin the enrollment process.
      </p>
      {error && <div className="alert alert-danger" style={{ marginBottom: 12 }}>{error}</div>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
        <input
          className="input"
          placeholder="Full name"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && next()}
        />
        <input
          className="input"
          type="email"
          placeholder="Email address"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && next()}
        />
      </div>
      <button className="btn btn-primary" onClick={next}>Continue →</button>
    </div>
  )
}

// ─── Step 2: Face Capture ─────────────────────────────────────────────────────
function FaceStep({ onNext }) {
  const videoRef  = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)

  const [photos,  setPhotos]  = useState([])   // data URL previews
  const [blobs,   setBlobs]   = useState([])   // File Blobs for upload
  const [camOn,   setCamOn]   = useState(false)
  const [error,   setError]   = useState('')

  useEffect(() => () => stopCam(), [])

  const startCam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      videoRef.current.srcObject = stream
      streamRef.current = stream
      await videoRef.current.play()
      setCamOn(true)
      setError('')
    } catch {
      setError('Camera access denied — please allow camera permission and try again.')
    }
  }

  const stopCam = () => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    setCamOn(false)
  }

  const capture = async () => {
    if (photos.length >= 5 || !camOn) return
    const v = videoRef.current
    const c = canvasRef.current
    c.width  = v.videoWidth
    c.height = v.videoHeight
    c.getContext('2d').drawImage(v, 0, 0)
    const dataUrl = c.toDataURL('image/jpeg', 0.9)
    const blob = await new Promise(resolve => c.toBlob(resolve, 'image/jpeg', 0.9))
    if (!blob) { setError('Could not capture image. Please try again.'); return }
    // Important: only increment the photo count once the Blob is ready,
    // so we never end up with photos.length=5 but blobs.length<5.
    setBlobs(prev => [...prev, blob])
    setPhotos(prev => [...prev, dataUrl])
  }

  const proceed = () => {
    stopCam()
    onNext(blobs)
  }

  return (
    <div className={styles.stepContent}>
      <h2>📷 Face Capture</h2>
      <p style={{ color: 'var(--clr-text-muted)', marginBottom: 16 }}>
        Capture 5 clear photos of your face in good lighting.
      </p>

      {error && <div className="alert alert-danger" style={{ marginBottom: 12 }}>{error}</div>}

      <div className="webcam-frame" style={{ maxWidth: 420, margin: '0 auto 16px' }}>
        <video ref={videoRef} muted playsInline style={{ width: '100%' }} />
        <div className={`webcam-overlay ${camOn ? 'active' : ''}`} />
      </div>
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        {!camOn
          ? <button className="btn btn-primary" onClick={startCam}>▶ Start Camera</button>
          : <button className="btn btn-ghost"   onClick={stopCam}>■ Stop</button>
        }
        <button
          className="btn btn-primary"
          onClick={capture}
          disabled={!camOn || photos.length >= 5}
        >
          📸 Capture ({photos.length}/5)
        </button>
      </div>

      {/* Thumbnail row */}
      <div className="thumb-row" style={{ marginBottom: 20 }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="thumb">
            {photos[i]
              ? <><img src={photos[i]} alt={`cap-${i}`} /><div className="tick">✓</div></>
              : <div style={{ width: 60, height: 45, background: 'var(--clr-surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: 'var(--clr-text-muted)' }}>👤</div>
            }
          </div>
        ))}
      </div>

      <button
        className="btn btn-success"
        disabled={photos.length < 5}
        onClick={proceed}
      >
        Continue →
      </button>
    </div>
  )
}

// ─── Step 3: Submit Enrollment (no voice) ─────────────────────────────────────
function EnrollStep({ name, email, faceBlobs, onNext }) {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const startedRef = useRef(false)

  const submit = async () => {
    if (!name?.trim() || !email?.trim()) {
      setError('Missing name/email. Please go back and try again.')
      return
    }
    if (!faceBlobs || faceBlobs.length < 5) {
      setError('Please capture 5 face photos first.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const fd = new FormData()
      fd.append('candidate_name', name)
      fd.append('candidate_email', email)
      faceBlobs.forEach((b, i) => fd.append('face_images', b, `face_${i}.jpg`))
      // First enrollment can take longer due to one-time model downloads.
      const { data } = await api.post('/auth/enroll', fd, { timeout: 600000 })
      onNext(data)
    } catch (e) {
      const detail = e.response?.data?.detail
      const msg =
        (typeof detail === 'string' ? detail : null) ||
        e.message ||
        'Enrollment failed.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true
    submit()
  }, []) // eslint-disable-line

  return (
    <div className={styles.stepContent}>
      <h2>🧾 Creating Your Enrollment</h2>
      <p style={{ color: 'var(--clr-text-muted)', marginBottom: 16 }}>
        We are processing your face biometrics and generating your TOTP QR code.
      </p>

      {error && <div className="alert alert-danger" style={{ marginBottom: 12 }}>{error}</div>}

      <button
        className="btn btn-success"
        disabled={loading}
        onClick={submit}
      >
        {loading
          ? <><span className="spinner" style={{ marginRight: 8 }} /> Enrolling — first time can take a few minutes…</>
          : (error ? 'Retry Enrollment' : 'Starting…')}
      </button>

      {loading && (
        <p style={{ marginTop: 12, fontSize: '0.8rem', color: 'var(--clr-text-muted)' }}>
          ⏳ Processing face biometrics…
        </p>
      )}
    </div>
  )
}

// ─── Step 4: TOTP Setup ───────────────────────────────────────────────────────
function TotpStep({ enrollData, onNext }) {
  const [code,  setCode]  = useState('')
  const [error, setError] = useState('')

  const verify = () => {
    if (code.length !== 6) { setError('Enter the 6-digit code from your authenticator app.'); return }
    onNext()
  }

  return (
    <div className={styles.stepContent}>
      <h2>🔐 TOTP Setup</h2>
      <p style={{ color: 'var(--clr-text-muted)', marginBottom: 20 }}>
        Scan the QR code with <strong>Google Authenticator</strong> or <strong>Authy</strong>,
        then enter the 6-digit code below.
      </p>

      {enrollData?.totp_qr_code_base64 ? (
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <img
            src={`data:image/png;base64,${enrollData.totp_qr_code_base64}`}
            alt="TOTP QR Code"
            style={{ width: 200, height: 200, border: '4px solid white', borderRadius: 8 }}
          />
        </div>
      ) : (
        <div className="alert alert-warning" style={{ marginBottom: 16 }}>
          QR code unavailable — use the candidate ID to set up TOTP manually.
        </div>
      )}

      {error && <div className="alert alert-danger" style={{ marginBottom: 12 }}>{error}</div>}

      <input
        className="input"
        type="text"
        inputMode="numeric"
        maxLength={6}
        placeholder="000000"
        value={code}
        onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
        onKeyDown={e => e.key === 'Enter' && verify()}
        style={{ fontSize: '1.8rem', letterSpacing: '0.35em', textAlign: 'center', maxWidth: 200, marginBottom: 16 }}
        autoFocus
      />

      <button className="btn btn-success" onClick={verify} disabled={code.length !== 6}>
        ✓ Verify &amp; Complete →
      </button>
    </div>
  )
}

// ─── Step 5: Success ──────────────────────────────────────────────────────────
function SuccessStep({ enrollData }) {
  const navigate = useNavigate()

  // Save candidate_id to localStorage so the Login page can pre-fill it
  useEffect(() => {
    if (enrollData?.candidate_id) {
      localStorage.setItem('lastCandidateId', enrollData.candidate_id)
    }
    // Auto-redirect to login after 4 seconds
    const timer = setTimeout(() => navigate('/login', { replace: true }), 4000)
    return () => clearTimeout(timer)
  }, [])   // eslint-disable-line

  return (
    <div className={styles.stepContent} style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '4rem', marginBottom: 16 }}>🎉</div>
      <h2 style={{ color: 'var(--clr-success)', marginBottom: 8 }}>Enrollment Complete!</h2>
      <p style={{ color: 'var(--clr-text-muted)', marginBottom: 24 }}>
        Your biometric profile has been securely registered.
        Redirecting to login in 4 seconds…
      </p>
      <div className="card" style={{ textAlign: 'left', marginBottom: 24 }}>
        <p style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Your Candidate ID (saved automatically)
        </p>
        <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--clr-primary)', wordBreak: 'break-all', fontSize: '0.9rem' }}>
          {enrollData?.candidate_id}
        </p>
        <p style={{ fontSize: '0.8rem', color: 'var(--clr-warning)', marginTop: 10 }}>
          ⚠️ This ID has been saved in your browser. Keep a separate copy too.
        </p>
      </div>
      <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => navigate('/login', { replace: true })}>
        Proceed to Login →
      </button>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Enrollment() {
  const [step,       setStep]       = useState(1)
  const [name,       setName]       = useState('')
  const [email,      setEmail]      = useState('')
  const [faceBlobs,  setFaceBlobs]  = useState([])
  const [enrollData, setEnrollData] = useState(null)

  return (
    <div className="page-center">
      <div className="card" style={{ width: '100%', maxWidth: 560 }}>
        <div className="page-header">
          <div className="logo-mark">🛡</div>
          <h1>MIIC-Sec Enrollment</h1>
        </div>

        <StepBar current={step} />

        {step === 1 && (
          <InfoStep onNext={(n, e) => { setName(n); setEmail(e); setStep(2) }} />
        )}

        {step === 2 && (
          <FaceStep onNext={(blobs) => { setFaceBlobs(blobs); setStep(3) }} />
        )}

        {step === 3 && (
          <EnrollStep
            name={name}
            email={email}
            faceBlobs={faceBlobs}
            onNext={(data) => { setEnrollData(data); setStep(4) }}
          />
        )}

        {step === 4 && (
          <TotpStep enrollData={enrollData} onNext={() => setStep(5)} />
        )}

        {step === 5 && (
          <SuccessStep enrollData={enrollData} />
        )}
      </div>
    </div>
  )
}
