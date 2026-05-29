/**
 * Enrollment.jsx — 6-step candidate enrollment wizard.
 * step 1: Name + email
 * step 2: Face capture × 5
 * step 3: Voice recording (5–10 s) ← NEW
 * step 4: Submit enrollment (face + voice → TOTP QR)
 * step 5: TOTP QR scan + code verify
 * step 6: Success
 */
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import styles from './Enrollment.module.css'

// ─── Step Bar ─────────────────────────────────────────────────────────────────
function StepBar({ current }) {
  const labels = ['Info', 'Face', 'Voice', 'Enroll', 'TOTP', 'Done']
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

  const [photos,  setPhotos]  = useState([])
  const [blobs,   setBlobs]   = useState([])
  const [camOn,   setCamOn]   = useState(false)
  const [error,   setError]   = useState('')

  useEffect(() => () => stopCam(), [])

  const startCam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      videoRef.current.srcObject = stream
      streamRef.current = stream
      await videoRef.current.play()
      setCamOn(true); setError('')
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
    const v = videoRef.current, c = canvasRef.current
    c.width = v.videoWidth; c.height = v.videoHeight
    c.getContext('2d').drawImage(v, 0, 0)
    const dataUrl = c.toDataURL('image/jpeg', 0.9)
    const blob = await new Promise(resolve => c.toBlob(resolve, 'image/jpeg', 0.9))
    if (!blob) { setError('Could not capture image. Please try again.'); return }
    setBlobs(prev => [...prev, blob])
    setPhotos(prev => [...prev, dataUrl])
  }

  const proceed = () => { stopCam(); onNext(blobs) }

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

      <button className="btn btn-success" disabled={photos.length < 5} onClick={proceed}>
        Continue →
      </button>
    </div>
  )
}

// ─── Step 3: Voice Recording ──────────────────────────────────────────────────
function VoiceStep({ onNext, onSkip }) {
  const mediaRef    = useRef(null)
  const chunksRef   = useRef([])
  const timerRef    = useRef(null)
  const animRef     = useRef(null)
  const analyserRef = useRef(null)
  const ctxRef      = useRef(null)

  const [phase,   setPhase]   = useState('idle')     // idle | recording | done | error
  const [secs,    setSecs]    = useState(8)           // countdown
  const [bars,    setBars]    = useState(Array(20).fill(3))
  const [blob,    setBlob]    = useState(null)
  const [error,   setError]   = useState('')

  // Animate waveform bars from AnalyserNode
  const animateWave = useCallback(() => {
    if (!analyserRef.current) return
    const data = new Uint8Array(analyserRef.current.frequencyBinCount)
    analyserRef.current.getByteFrequencyData(data)
    const step  = Math.floor(data.length / 20)
    const newBars = Array.from({ length: 20 }, (_, i) => {
      const val = data[i * step] || 0
      return Math.max(3, Math.round((val / 255) * 48))
    })
    setBars(newBars)
    animRef.current = requestAnimationFrame(animateWave)
  }, [])

  const startRecording = async () => {
    setError(''); setBlob(null); chunksRef.current = []
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })

      // Set up AudioContext for waveform visualisation
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
      ctxRef.current = audioCtx
      const source   = audioCtx.createMediaStreamSource(stream)
      const analyser = audioCtx.createAnalyser()
      analyser.fftSize = 256
      source.connect(analyser)
      analyserRef.current = analyser
      animRef.current = requestAnimationFrame(animateWave)

      // Pick best supported format
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : ''

      const rec = new MediaRecorder(stream, mimeType ? { mimeType } : {})
      mediaRef.current = rec

      rec.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      rec.onstop = () => {
        stream.getTracks().forEach(t => t.stop())
        cancelAnimationFrame(animRef.current)
        audioCtx.close()
        setBars(Array(20).fill(3))
        const recorded = new Blob(chunksRef.current, { type: mimeType || 'audio/webm' })
        setBlob(recorded)
        setPhase('done')
      }

      rec.start(100)
      setPhase('recording')

      // 8-second countdown
      let remaining = 8
      setSecs(remaining)
      timerRef.current = setInterval(() => {
        remaining -= 1
        setSecs(remaining)
        if (remaining <= 0) {
          clearInterval(timerRef.current)
          rec.stop()
        }
      }, 1000)

    } catch (e) {
      setError('Microphone access denied — please allow microphone permission and try again.')
      setPhase('error')
    }
  }

  const retry = () => {
    cancelAnimationFrame(animRef.current)
    clearInterval(timerRef.current)
    // Only close if not already closed
    if (ctxRef.current && ctxRef.current.state !== 'closed') {
      ctxRef.current.close().catch(() => {})
    }
    ctxRef.current = null
    setBlob(null); setPhase('idle'); setSecs(8); setBars(Array(20).fill(3)); setError('')
  }

  useEffect(() => () => {
    cancelAnimationFrame(animRef.current)
    clearInterval(timerRef.current)
    // Guard: only close AudioContext if it hasn't been closed already
    if (ctxRef.current && ctxRef.current.state !== 'closed') {
      ctxRef.current.close().catch(() => {})
    }
    mediaRef.current?.stream?.getTracks().forEach(t => t.stop())
  }, [])

  return (
    <div className={styles.stepContent}>
      <h2>🎙️ Voice Enrollment</h2>
      <p style={{ color: 'var(--clr-text-muted)', marginBottom: 20 }}>
        We'll record your voice for biometric authentication. Speak naturally for <strong>8 seconds</strong> — read
        the prompt below aloud.
      </p>

      {/* Prompt card */}
      <div style={{
        background: 'var(--clr-surface-2)', border: '1px solid var(--clr-border)',
        borderRadius: 'var(--r-md)', padding: '14px 18px', marginBottom: 20,
        fontStyle: 'italic', color: 'var(--clr-text)', lineHeight: 1.6, fontSize: '1rem',
      }}>
        "My name is [your name] and I am applying for a technical position. I confirm my identity
        for the MIIC secure interview platform."
      </div>

      {error && <div className="alert alert-danger" style={{ marginBottom: 12 }}>{error}</div>}

      {/* Waveform visualiser */}
      <div style={{
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        gap: 3, height: 56, marginBottom: 16,
      }}>
        {bars.map((h, i) => (
          <div key={i} style={{
            width: 6, height: h,
            borderRadius: 3,
            background: phase === 'recording'
              ? `hsl(${160 + i * 3}, 80%, 55%)`
              : phase === 'done'
                ? 'var(--clr-success)'
                : 'var(--clr-surface-3, var(--clr-border))',
            transition: 'height 0.08s ease',
          }} />
        ))}
      </div>

      {/* Status */}
      <div style={{ textAlign: 'center', marginBottom: 20, minHeight: 28 }}>
        {phase === 'idle'      && <span style={{ color: 'var(--clr-text-muted)' }}>Press the button below to start recording</span>}
        {phase === 'recording' && (
          <span style={{ color: 'var(--clr-success)', fontWeight: 600, fontSize: '1.1rem' }}>
            🔴 Recording… {secs}s remaining
          </span>
        )}
        {phase === 'done' && (
          <span style={{ color: 'var(--clr-success)', fontWeight: 600 }}>
            ✅ Voice recorded successfully!
          </span>
        )}
        {phase === 'error' && (
          <span style={{ color: 'var(--clr-danger)' }}>Microphone error</span>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {phase === 'idle' && (
          <button className="btn btn-primary" onClick={startRecording} style={{ flex: 1 }}>
            🎙️ Start Recording
          </button>
        )}
        {phase === 'recording' && (
          <button className="btn btn-ghost" disabled style={{ flex: 1 }}>
            <span className="spinner" style={{ marginRight: 8 }} /> Recording… {secs}s
          </button>
        )}
        {(phase === 'done' || phase === 'error') && (
          <button className="btn btn-ghost" onClick={retry} style={{ flex: 1 }}>
            🔄 Re-record
          </button>
        )}
        {phase === 'done' && (
          <button className="btn btn-success" onClick={() => onNext(blob)} style={{ flex: 1 }}>
            Continue →
          </button>
        )}
      </div>

      {/* Skip option */}
      <p style={{ marginTop: 20, fontSize: '0.78rem', color: 'var(--clr-text-muted)', textAlign: 'center' }}>
        Voice is strongly recommended for security.{' '}
        <button
          onClick={onSkip}
          style={{ background: 'none', border: 'none', color: 'var(--clr-primary)', cursor: 'pointer', textDecoration: 'underline', fontSize: 'inherit', padding: 0 }}
        >
          Skip voice enrollment
        </button>
        {' '}(you can add it later)
      </p>
    </div>
  )
}

// ─── Step 4: Submit Enrollment ────────────────────────────────────────────────
const ENROLL_STAGES = [
  { key: 'uploading',  label: 'Uploading biometric data…',             icon: '📤' },
  { key: 'face',       label: 'Processing face embeddings (DeepFace)…', icon: '👤' },
  { key: 'voice',      label: 'Processing voice embeddings (wav2vec2)…',icon: '🎙️' },
  { key: 'totp',       label: 'Generating TOTP secret & QR code…',      icon: '🔑' },
  { key: 'saving',     label: 'Saving your profile securely…',           icon: '💾' },
]

function EnrollStep({ name, email, faceBlobs, voiceBlob, onNext }) {
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [stageIdx, setStageIdx] = useState(0)
  const startedRef = useRef(false)
  const stageTimer = useRef(null)

  const startStageAnim = () => {
    let i = 0
    setStageIdx(0)
    stageTimer.current = setInterval(() => {
      i = Math.min(i + 1, ENROLL_STAGES.length - 1)
      setStageIdx(i)
    }, 4500)   // advance stage every 4.5 s
  }

  const stopStageAnim = () => {
    clearInterval(stageTimer.current)
  }

  const submit = async () => {
    if (!name?.trim() || !email?.trim()) { setError('Missing name/email.'); return }
    if (!faceBlobs || faceBlobs.length < 5) { setError('Please capture 5 face photos first.'); return }
    setLoading(true); setError(''); setStageIdx(0); startStageAnim()
    try {
      const fd = new FormData()
      fd.append('candidate_name',  name)
      fd.append('candidate_email', email)
      faceBlobs.forEach((b, i) => fd.append('face_images', b, `face_${i}.jpg`))
      if (voiceBlob && voiceBlob.size > 1000) {
        fd.append('voice_audio', voiceBlob, 'voice_enrollment.webm')
      }
      // Generous timeout — DeepFace + wav2vec2 first-run download can take 3-5 min
      const { data } = await api.post('/auth/enroll', fd, { timeout: 600000 })
      stopStageAnim()
      onNext(data)
    } catch (e) {
      stopStageAnim()
      const detail = e.response?.data?.detail
      const msg = (typeof detail === 'string' ? detail : null)
        || (typeof detail === 'object' && detail !== null ? JSON.stringify(detail) : null)
        || e.message
        || 'Enrollment failed — check the backend terminal for details.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true
    submit()
    return () => stopStageAnim()
  }, []) // eslint-disable-line

  const currentStage = ENROLL_STAGES[stageIdx]

  return (
    <div className={styles.stepContent}>
      <h2>🧾 Creating Your Enrollment</h2>
      <p style={{ color: 'var(--clr-text-muted)', marginBottom: 16 }}>
        Processing your face {voiceBlob ? '& voice ' : ''}biometrics and generating your TOTP QR code.
      </p>

      {/* Live stage progress */}
      {loading && (
        <div style={{ marginBottom: 20 }}>
          {ENROLL_STAGES.map((s, i) => (
            <div key={s.key} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 12px', borderRadius: 'var(--r-sm)', marginBottom: 6,
              background: i === stageIdx ? 'rgba(99,102,241,0.12)' : 'var(--clr-surface-2)',
              border: `1px solid ${i === stageIdx ? 'var(--clr-primary)' : 'var(--clr-border)'}`,
              opacity: i > stageIdx ? 0.4 : 1,
              transition: 'all 0.4s',
            }}>
              <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>
                {i < stageIdx ? '✅' : i === stageIdx ? <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2, display: 'inline-block' }} /> : s.icon}
              </span>
              <span style={{
                fontSize: '0.82rem', fontWeight: i === stageIdx ? 600 : 400,
                color: i === stageIdx ? 'var(--clr-text)' : 'var(--clr-text-muted)',
              }}>
                {s.label}
              </span>
              {i < stageIdx && (
                <span style={{ marginLeft: 'auto', fontSize: '0.72rem', color: 'var(--clr-success)' }}>Done</span>
              )}
              {i === stageIdx && (
                <span style={{ marginLeft: 'auto', fontSize: '0.72rem', color: 'var(--clr-primary)' }}>In progress…</span>
              )}
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="alert alert-danger" style={{ marginBottom: 16, fontSize: '0.88rem', wordBreak: 'break-word' }}>
          <strong>❌ Enrollment Failed</strong><br />
          {error}
          <div style={{ marginTop: 8, fontSize: '0.78rem', color: 'inherit', opacity: 0.8 }}>
            💡 Tip: First-time run downloads AI models (~500 MB). Check backend terminal for details.
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 10 }}>
        <button
          className={`btn ${loading ? 'btn-ghost' : error ? 'btn-danger' : 'btn-success'}`}
          disabled={loading}
          onClick={submit}
          style={{ flex: 1, padding: '12px' }}
        >
          {loading
            ? <><span className="spinner" style={{ marginRight: 8 }} />Enrolling — AI models may take a few minutes on first run…</>
            : error ? '🔄 Retry Enrollment' : '▶ Start Enrollment'}
        </button>
      </div>

      {loading && (
        <p style={{ marginTop: 12, fontSize: '0.78rem', color: 'var(--clr-text-muted)', textAlign: 'center', lineHeight: 1.5 }}>
          ⏳ <strong>Please don't close this tab.</strong><br />
          First run downloads DeepFace &amp; wav2vec2 models (~500 MB).<br />
          Subsequent enrollments take ~10–20 seconds.
        </p>
      )}
    </div>
  )
}

// ─── Step 5: TOTP Setup ───────────────────────────────────────────────────────
function TotpStep({ enrollData, onNext }) {
  const [code,    setCode]    = useState('')
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const verify = async () => {
    if (code.length !== 6) { setError('Enter the 6-digit code from your authenticator app.'); return }
    setLoading(true); setError('')
    try {
      await api.post('/auth/totp-verify-enrollment', {
        candidate_id: enrollData?.candidate_id,
        totp_code: code,
      })
      onNext()
    } catch (e) {
      const detail = e.response?.data?.detail
      setError(typeof detail === 'string' ? detail : 'TOTP code incorrect. Check your authenticator app and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.stepContent}>
      <h2>🔐 TOTP Setup</h2>
      <p style={{ color: 'var(--clr-text-muted)', marginBottom: 20 }}>
        Scan the QR code with <strong>Google Authenticator</strong> or <strong>Authy</strong>,
        then enter the 6-digit code below to confirm it's working.
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

      {enrollData?.voice_enrolled !== undefined && (
        <div className={`alert ${enrollData.voice_enrolled ? 'alert-success' : 'alert-warning'}`} style={{ marginBottom: 12 }}>
          {enrollData.voice_enrolled
            ? '🎙️ Voice biometric enrolled successfully'
            : '⚠️ Voice was not enrolled — login will use Face + TOTP only'}
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

      <button className="btn btn-success" onClick={verify} disabled={code.length !== 6 || loading}>
        {loading ? <><span className="spinner" style={{ marginRight: 8 }} /> Verifying…</> : '✓ Verify & Complete →'}
      </button>
    </div>
  )
}

// ─── Step 6: Success ──────────────────────────────────────────────────────────
function SuccessStep({ enrollData }) {
  const navigate = useNavigate()

  useEffect(() => {
    if (enrollData?.candidate_id) {
      localStorage.setItem('lastCandidateId', enrollData.candidate_id)
    }
    const timer = setTimeout(() => navigate('/login', { replace: true }), 4000)
    return () => clearTimeout(timer)
  }, []) // eslint-disable-line

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
        {enrollData?.voice_enrolled && (
          <p style={{ fontSize: '0.8rem', color: 'var(--clr-success)', marginTop: 10 }}>
            🎙️ Voice authentication enrolled — your login will include voice verification.
          </p>
        )}
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
  const [voiceBlob,  setVoiceBlob]  = useState(null)
  const [enrollData, setEnrollData] = useState(null)

  return (
    <div className="page-center">
      <div className="card" style={{ width: '100%', maxWidth: 580 }}>
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
          <VoiceStep
            onNext={(blob) => { setVoiceBlob(blob); setStep(4) }}
            onSkip={() => { setVoiceBlob(null); setStep(4) }}
          />
        )}

        {step === 4 && (
          <EnrollStep
            name={name}
            email={email}
            faceBlobs={faceBlobs}
            voiceBlob={voiceBlob}
            onNext={(data) => { setEnrollData(data); setStep(5) }}
          />
        )}

        {step === 5 && (
          <TotpStep enrollData={enrollData} onNext={() => setStep(6)} />
        )}

        {step === 6 && (
          <SuccessStep enrollData={enrollData} />
        )}
      </div>
    </div>
  )
}
