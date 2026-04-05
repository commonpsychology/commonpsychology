// src/pages/VerifyAccountPage.jsx
// Flow:
//   1. On mount → send OTP to BOTH email + phone simultaneously (channel: 'both')
//   2. User enters ONE 6-digit code
//   3. Verify against email (single source of truth)
//   4. On success → navigate('/signin')
//   5. On fail → shake + error + retry

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from '../context/RouterContext'
import { sendOTP, verifyOTP } from '../services/otpService'

// ── Design tokens ─────────────────────────────────────────────
const G = {
  deep:   '#1a5c38',
  mid:    '#2d7a4f',
  soft:   '#4caf50',
  light:  '#a8d5b5',
  faint:  '#edf7f0',
  cream:  '#f5f0e8',
  text:   '#1a2e22',
  muted:  '#5a7a65',
  border: '#c8e0d0',
}

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,300&display=swap');

  .vfy-wrap {
    min-height: 100vh;
    background: ${G.cream};
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem 1rem;
    position: relative;
    overflow: hidden;
  }

  /* Decorative background blobs */
  .vfy-blob {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    pointer-events: none;
    opacity: 0.35;
  }
  .vfy-blob-1 {
    width: 500px; height: 500px;
    background: radial-gradient(circle, ${G.soft}55, transparent 70%);
    top: -150px; right: -100px;
  }
  .vfy-blob-2 {
    width: 350px; height: 350px;
    background: radial-gradient(circle, ${G.light}66, transparent 70%);
    bottom: -80px; left: -80px;
  }

  .vfy-card {
    position: relative;
    background: #fff;
    border-radius: 28px;
    padding: clamp(2rem, 5vw, 3.25rem);
    width: 100%;
    max-width: 460px;
    box-shadow:
      0 0 0 1px ${G.border},
      0 4px 6px rgba(26,92,56,0.04),
      0 20px 60px rgba(26,92,56,0.10),
      0 40px 80px rgba(26,92,56,0.06);
    animation: vfy-rise 0.5s cubic-bezier(0.16,1,0.3,1) both;
  }

  @keyframes vfy-rise {
    from { opacity: 0; transform: translateY(28px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0)    scale(1);    }
  }

  /* Logo mark */
  .vfy-mark {
    width: 64px; height: 64px;
    background: linear-gradient(135deg, ${G.deep}, ${G.soft});
    border-radius: 18px;
    display: flex; align-items: center; justify-content: center;
    font-size: 1.75rem;
    margin: 0 auto 1.5rem;
    box-shadow: 0 8px 24px ${G.soft}44;
  }

  /* OTP boxes */
  .vfy-boxes {
    display: flex;
    gap: 10px;
    justify-content: center;
    margin: 2rem 0 1.5rem;
  }
  .vfy-box {
    width: 54px; height: 64px;
    border: 2px solid ${G.border};
    border-radius: 14px;
    font-size: 1.75rem;
    font-weight: 700;
    text-align: center;
    color: ${G.deep};
    background: ${G.faint};
    outline: none;
    font-family: 'DM Serif Display', serif;
    caret-color: transparent;
    transition: border-color 0.18s, box-shadow 0.18s, background 0.18s, transform 0.15s;
  }
  .vfy-box:focus {
    border-color: ${G.soft};
    background: #fff;
    box-shadow: 0 0 0 4px ${G.soft}22;
    transform: translateY(-2px);
  }
  .vfy-box.vfy-filled {
    border-color: ${G.mid};
    background: #fff;
  }
  .vfy-box.vfy-err {
    border-color: #e53935;
    background: #fff8f8;
    animation: vfy-shake 0.4s cubic-bezier(0.36,0.07,0.19,0.97) both;
  }
  @keyframes vfy-shake {
    10%,90%  { transform: translateX(-3px); }
    20%,80%  { transform: translateX(5px);  }
    30%,50%,70% { transform: translateX(-5px); }
    40%,60%  { transform: translateX(5px);  }
  }

  /* Primary button */
  .vfy-btn {
    width: 100%;
    padding: 1rem;
    background: linear-gradient(135deg, ${G.deep} 0%, ${G.mid} 100%);
    color: #fff;
    border: none;
    border-radius: 14px;
    font-family: 'DM Sans', sans-serif;
    font-size: 1rem;
    font-weight: 600;
    letter-spacing: 0.01em;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 4px 14px ${G.deep}44;
    position: relative;
    overflow: hidden;
  }
  .vfy-btn::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, transparent, rgba(255,255,255,0.08));
  }
  .vfy-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px ${G.deep}55;
  }
  .vfy-btn:active:not(:disabled) { transform: translateY(0); }
  .vfy-btn:disabled {
    background: #d0d8d2;
    box-shadow: none;
    cursor: not-allowed;
  }

  /* Progress dots */
  .vfy-progress {
    display: flex;
    justify-content: center;
    gap: 6px;
    margin-bottom: 2rem;
  }
  .vfy-dot {
    width: 8px; height: 8px;
    border-radius: 50%;
    transition: all 0.3s;
  }
  .vfy-dot.active  { background: ${G.deep}; width: 24px; border-radius: 4px; }
  .vfy-dot.done    { background: ${G.soft}; }
  .vfy-dot.pending { background: ${G.border}; }

  /* Channels badge */
  .vfy-channels {
    display: flex;
    gap: 8px;
    justify-content: center;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
  }
  .vfy-chip {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    background: ${G.faint};
    border: 1px solid ${G.border};
    border-radius: 100px;
    padding: 0.3rem 0.75rem;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.75rem;
    font-weight: 500;
    color: ${G.muted};
  }
  .vfy-chip-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: ${G.soft};
    animation: vfy-pulse 2s ease-in-out infinite;
  }
  @keyframes vfy-pulse {
    0%,100% { opacity: 1; transform: scale(1); }
    50%      { opacity: 0.5; transform: scale(0.8); }
  }

  /* Timer */
  .vfy-timer-wrap {
    text-align: center;
    margin-top: 1.25rem;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.83rem;
    color: ${G.muted};
  }
  .vfy-timer-count {
    font-family: 'DM Serif Display', serif;
    font-size: 1rem;
    color: ${G.deep};
  }
  .vfy-timer-expired { color: #e53935; font-weight: 600; }

  /* Error box */
  .vfy-error {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    background: #fff5f5;
    border: 1.5px solid #fca5a5;
    border-radius: 10px;
    padding: 0.75rem 1rem;
    margin-bottom: 1rem;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.84rem;
    color: #b91c1c;
    line-height: 1.5;
    animation: vfy-rise 0.2s ease;
  }

  /* Success screen */
  .vfy-success-icon {
    width: 80px; height: 80px;
    background: linear-gradient(135deg, ${G.soft}, ${G.deep});
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 2rem;
    margin: 0 auto 1.5rem;
    box-shadow: 0 12px 32px ${G.soft}44;
    animation: vfy-pop 0.4s cubic-bezier(0.16,1,0.3,1) both;
  }
  @keyframes vfy-pop {
    from { transform: scale(0.5); opacity: 0; }
    to   { transform: scale(1);   opacity: 1; }
  }

  /* Resend / text buttons */
  .vfy-link {
    background: none; border: none;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.83rem;
    font-weight: 600;
    color: ${G.deep};
    cursor: pointer;
    text-decoration: underline;
    text-underline-offset: 2px;
    padding: 0;
    transition: opacity 0.2s;
  }
  .vfy-link:disabled { color: #aaa; text-decoration: none; cursor: default; }
  .vfy-link:hover:not(:disabled) { opacity: 0.7; }

  /* Sending state overlay */
  .vfy-sending {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 1.25rem;
    color: ${G.muted};
    font-family: 'DM Sans', sans-serif;
    font-size: 0.9rem;
  }
  .vfy-spinner {
    width: 20px; height: 20px;
    border: 2px solid ${G.border};
    border-top-color: ${G.soft};
    border-radius: 50%;
    animation: vfy-spin 0.8s linear infinite;
  }
  @keyframes vfy-spin { to { transform: rotate(360deg); } }

  @media (max-width: 400px) {
    .vfy-box { width: 44px; height: 54px; font-size: 1.4rem; }
    .vfy-boxes { gap: 7px; }
  }
`

function injectCSS() {
  if (document.getElementById('vfy-css2')) return
  const s = document.createElement('style')
  s.id = 'vfy-css2'; s.textContent = CSS
  document.head.appendChild(s)
}

// ── OTP 6-box input ───────────────────────────────────────────
function OTPBoxes({ value, onChange, hasError, disabled }) {
  const digits = (value + '      ').slice(0, 6).split('')
  const refs   = Array.from({ length: 6 }, () => useRef(null))

  useEffect(() => {
    setTimeout(() => refs[0].current?.focus(), 100)
  }, [])

  const handleKey = useCallback((i, e) => {
    if (e.key === 'Backspace') {
      const next = value.slice(0, -1)
      onChange(next)
      if (i > 0 && !digits[i].trim()) refs[i - 1].current?.focus()
      return
    }
    if (e.key === 'ArrowLeft'  && i > 0) { refs[i - 1].current?.focus(); return }
    if (e.key === 'ArrowRight' && i < 5) { refs[i + 1].current?.focus(); return }
    if (!/^\d$/.test(e.key)) return
    const next = (value + e.key).slice(0, 6)
    onChange(next)
    if (i < 5) refs[i + 1].current?.focus()
  }, [value, onChange])

  const handlePaste = useCallback((e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted) {
      onChange(pasted)
      refs[Math.min(pasted.length, 5)].current?.focus()
    }
    e.preventDefault()
  }, [onChange])

  return (
    <div className="vfy-boxes">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={refs[i]}
          className={[
            'vfy-box',
            d.trim() ? 'vfy-filled' : '',
            hasError  ? 'vfy-err'    : '',
          ].join(' ')}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d.trim()}
          readOnly
          disabled={disabled}
          onKeyDown={e => handleKey(i, e)}
          onPaste={handlePaste}
          onClick={() => refs[i].current?.focus()}
          aria-label={`Digit ${i + 1}`}
        />
      ))}
    </div>
  )
}

// ── Countdown hook ─────────────────────────────────────────────
function useCountdown(initialSeconds) {
  const [left, setLeft]   = useState(initialSeconds)
  const intervalRef       = useRef(null)

  const start = useCallback((s = initialSeconds) => {
    setLeft(s)
    clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => setLeft(l => {
      if (l <= 1) { clearInterval(intervalRef.current); return 0 }
      return l - 1
    }), 1000)
  }, [initialSeconds])

  useEffect(() => () => clearInterval(intervalRef.current), [])

  const mm = String(Math.floor(left / 60)).padStart(2, '0')
  const ss = String(left % 60).padStart(2, '0')
  return { left, display: `${mm}:${ss}`, start }
}

// ── Main Page ──────────────────────────────────────────────────
export default function VerifyAccountPage() {
  useEffect(() => { injectCSS() }, [])

  const { navigate, state } = useRouter()
  const payload  = state || JSON.parse(sessionStorage.getItem('verify_payload') || '{}')
  const { user_id = null, email = '', phone = '', name = 'there' } = payload

  // Bounce if no email
  useEffect(() => { if (!email) navigate('/register') }, [email])

  const [phase, setPhase]       = useState('sending')  // 'sending' | 'input' | 'verifying' | 'success'
  const [otp, setOtp]           = useState('')
  const [error, setError]       = useState('')
  const [shakeKey, setShakeKey] = useState(0)
  const [sendError, setSendError] = useState('')
  const timer = useCountdown(10 * 60)

  // ── Send OTP to both channels on mount ────────────────────────
  const doSend = useCallback(async () => {
    setPhase('sending')
    setSendError('')
    setOtp('')
    setError('')
    try {
      // channel 'both' sends to email + phone simultaneously
      // If no phone stored, fall back to email only
      await sendOTP({
        user_id,
        email,
        phone:    phone || undefined,
        otp_type: 'email_verify',
        name,
        channel:  phone ? 'both' : 'email',
      })
      setPhase('input')
      timer.start(10 * 60)
    } catch (err) {
      setSendError(err.message)
      setPhase('input')  // still show input — maybe partial send worked
    }
  }, [email, phone, user_id, name])

  useEffect(() => { if (email) doSend() }, [email])

  // ── Verify ────────────────────────────────────────────────────
  async function handleVerify() {
    if (otp.length < 6) { setError('Please enter all 6 digits.'); return }
    setPhase('verifying')
    setError('')
    try {
      await verifyOTP({ email, otp_code: otp, otp_type: 'email_verify' })
      setPhase('success')
    } catch (err) {
      setError(err.message)
      setShakeKey(k => k + 1)
      setOtp('')
      setPhase('input')
    }
  }

  // Auto-verify when all 6 digits entered
  useEffect(() => {
    if (otp.length === 6 && phase === 'input') handleVerify()
  }, [otp])

  // ── Resend ────────────────────────────────────────────────────
  async function handleResend() {
    await doSend()
  }

  // ── Success screen ────────────────────────────────────────────
  if (phase === 'success') return (
    <div className="vfy-wrap">
      <div className="vfy-blob vfy-blob-1" />
      <div className="vfy-blob vfy-blob-2" />
      <div className="vfy-card" style={{ textAlign: 'center' }}>
        <div className="vfy-success-icon">✓</div>
        <h2 style={{ fontFamily: '"DM Serif Display", serif', fontSize: '1.9rem', color: G.deep, margin: '0 0 0.75rem', lineHeight: 1.2 }}>
          Account Verified!
        </h2>
        <p style={{ fontFamily: '"DM Sans", sans-serif', color: G.muted, lineHeight: 1.75, margin: '0 0 2rem', fontSize: '0.95rem' }}>
          Your account has been successfully verified. You can now sign in and begin your journey.
        </p>
        {/* Verification summary chips */}
        <div className="vfy-channels" style={{ marginBottom: '2rem' }}>
          <span className="vfy-chip">✓ Email verified</span>
          {phone && <span className="vfy-chip">✓ SMS delivered</span>}
        </div>
        <button className="vfy-btn" onClick={() => {
          sessionStorage.removeItem('verify_payload')
          navigate('/signin')
        }}>
          Continue to Sign In →
        </button>
      </div>
    </div>
  )

  return (
    <div className="vfy-wrap">
      <div className="vfy-blob vfy-blob-1" />
      <div className="vfy-blob vfy-blob-2" />

      <div className="vfy-card">

        {/* Progress dots */}
        <div className="vfy-progress">
          <div className="vfy-dot active" />
          <div className="vfy-dot pending" />
        </div>

        {/* Logo mark */}
        <div className="vfy-mark">🧠</div>

        {/* Heading */}
        <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
          <h1 style={{ fontFamily: '"DM Serif Display", serif', fontSize: '1.75rem', color: G.deep, margin: '0 0 0.5rem', lineHeight: 1.2 }}>
            Verify your account
          </h1>
          <p style={{ fontFamily: '"DM Sans", sans-serif', color: G.muted, fontSize: '0.9rem', lineHeight: 1.65, margin: 0 }}>
            {phase === 'sending'
              ? 'Sending your verification code…'
              : <>We sent a 6-digit code to<br /><strong style={{ color: G.text }}>{email}</strong></>
            }
          </p>
        </div>

        {/* Channel chips */}
        {phase !== 'sending' && (
          <div className="vfy-channels">
            <span className="vfy-chip">
              <span className="vfy-chip-dot" /> Email sent
            </span>
            {phone && (
              <span className="vfy-chip">
                <span className="vfy-chip-dot" /> SMS sent
              </span>
            )}
          </div>
        )}

        {/* Sending spinner */}
        {phase === 'sending' && (
          <div className="vfy-sending">
            <div className="vfy-spinner" />
            Sending code to your email{phone ? ' & phone' : ''}…
          </div>
        )}

        {/* Send error */}
        {sendError && (
          <div className="vfy-error">
            <span>⚠</span>
            <span>{sendError} — try resending below.</span>
          </div>
        )}

        {/* OTP input */}
        {(phase === 'input' || phase === 'verifying') && (
          <>
            <OTPBoxes
              key={shakeKey}
              value={otp}
              onChange={v => { setOtp(v); setError('') }}
              hasError={!!error}
              disabled={phase === 'verifying'}
            />

            {error && (
              <div className="vfy-error">
                <span>⚠</span>
                <span>{error}</span>
              </div>
            )}

            <button
              className="vfy-btn"
              onClick={handleVerify}
              disabled={otp.length < 6 || phase === 'verifying'}
            >
              {phase === 'verifying'
                ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'vfy-spin 0.8s linear infinite' }} />
                    Verifying…
                  </span>
                : 'Verify & Continue →'
              }
            </button>

            {/* Timer + resend */}
            <div className="vfy-timer-wrap">
              {timer.left > 0 ? (
                <>
                  Code expires in{' '}
                  <span className="vfy-timer-count">{timer.display}</span>
                </>
              ) : (
                <span className="vfy-timer-expired">Code expired.</span>
              )}
              <br />
              <button
                className="vfy-link"
                onClick={handleResend}
                disabled={phase === 'verifying' || timer.left > 540}
                style={{ marginTop: '0.4rem', display: 'inline-block' }}
              >
                {timer.left > 540 ? `Resend available in ${timer.display}` : 'Resend code'}
              </button>
            </div>
          </>
        )}

        {/* Security note */}
        <div style={{ marginTop: '1.75rem', padding: '0.85rem 1rem', background: G.faint, borderRadius: 10, border: `1px solid ${G.border}` }}>
          <p style={{ margin: 0, fontFamily: '"DM Sans", sans-serif', fontSize: '0.75rem', color: G.muted, lineHeight: 1.6 }}>
            🔒 <strong>Never share this code.</strong> Puja Samargi staff will never ask for your OTP by phone or email.
          </p>
        </div>

        {/* Back link */}
        <div style={{ marginTop: '1.25rem', textAlign: 'center' }}>
          <button
            onClick={() => navigate('/register')}
            style={{ background: 'none', border: 'none', fontFamily: '"DM Sans", sans-serif', fontSize: '0.8rem', color: '#aaa', cursor: 'pointer' }}
          >
            ← Back to registration
          </button>
        </div>
      </div>
    </div>
  )
}