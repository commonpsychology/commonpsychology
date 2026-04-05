// src/components/StaffOTPModal.jsx
// Shown after admin/therapist enters correct credentials.
// Sends OTP to their email, blocks navigation until verified.
// On success → parent calls navigate('/staff/admin') or navigate('/staff/therapist')

import { useState, useEffect, useRef, useCallback } from 'react'
import { sendOTP, verifyOTP } from '../services/otpService'

const C = {
  deep:        '#007BA8',
  mid:         '#009FD4',
  bright:      '#00BFFF',
  faint:       '#E8F8FF',
  ghost:       '#F4FCFF',
  text:        '#0d2d3d',
  muted:       '#5a8090',
  border:      '#b0d8ea',
  borderFaint: '#d8eef8',
}

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');

  .smf-overlay {
    position: fixed;
    inset: 0;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    background: rgba(6, 26, 38, 0.6);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    animation: smf-fadein 0.25s ease both;
  }
  @keyframes smf-fadein {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  .smf-card {
    background: #fff;
    border-radius: 24px;
    width: 100%;
    max-width: 420px;
    overflow: hidden;
    box-shadow:
      0 0 0 1px ${C.borderFaint},
      0 24px 64px rgba(0, 60, 100, 0.22),
      0 8px 20px rgba(0, 60, 100, 0.12);
    animation: smf-rise 0.35s cubic-bezier(0.16,1,0.3,1) both;
  }
  @keyframes smf-rise {
    from { transform: translateY(24px) scale(0.96); opacity: 0; }
    to   { transform: translateY(0)    scale(1);    opacity: 1; }
  }

  /* Top accent bar */
  .smf-top {
    background: linear-gradient(135deg, ${C.deep} 0%, ${C.mid} 60%, ${C.bright} 100%);
    padding: 2rem 2rem 1.75rem;
    text-align: center;
    position: relative;
    overflow: hidden;
  }
  .smf-top::before {
    content: '';
    position: absolute;
    top: -60px; right: -60px;
    width: 180px; height: 180px;
    border-radius: 50%;
    background: rgba(255,255,255,0.07);
    pointer-events: none;
  }
  .smf-top::after {
    content: '';
    position: absolute;
    bottom: -40px; left: -40px;
    width: 130px; height: 130px;
    border-radius: 50%;
    background: rgba(255,255,255,0.05);
    pointer-events: none;
  }

  .smf-shield {
    width: 58px; height: 58px;
    background: rgba(255,255,255,0.15);
    border: 2px solid rgba(255,255,255,0.25);
    border-radius: 16px;
    display: flex; align-items: center; justify-content: center;
    font-size: 1.5rem;
    margin: 0 auto 1rem;
    backdrop-filter: blur(4px);
    position: relative;
  }

  /* OTP boxes */
  .smf-boxes {
    display: flex;
    gap: 9px;
    justify-content: center;
    margin: 0.25rem 0 1.5rem;
    padding: 0 0.5rem;
  }
  .smf-box {
    flex: 1;
    max-width: 54px;
    height: 62px;
    border: 2px solid ${C.borderFaint};
    border-radius: 12px;
    font-size: 1.6rem;
    font-weight: 700;
    text-align: center;
    color: ${C.deep};
    background: ${C.ghost};
    outline: none;
    font-family: 'Syne', sans-serif;
    caret-color: transparent;
    transition: border-color 0.18s, box-shadow 0.18s, background 0.18s, transform 0.12s;
  }
  .smf-box:focus {
    border-color: ${C.mid};
    background: #fff;
    box-shadow: 0 0 0 4px ${C.bright}22;
    transform: translateY(-2px);
  }
  .smf-box.smf-filled { border-color: ${C.deep}; background: ${C.faint}; }
  .smf-box.smf-err {
    border-color: #e53935;
    background: #fff5f5;
    animation: smf-shake 0.4s cubic-bezier(0.36,0.07,0.19,0.97) both;
  }
  @keyframes smf-shake {
    10%,90%     { transform: translateX(-3px); }
    20%,80%     { transform: translateX(5px);  }
    30%,50%,70% { transform: translateX(-5px); }
    40%,60%     { transform: translateX(5px);  }
  }

  /* Submit button */
  .smf-btn {
    width: 100%;
    padding: 1rem;
    background: linear-gradient(135deg, ${C.deep}, ${C.bright});
    color: #fff;
    border: none;
    border-radius: 12px;
    font-family: 'DM Sans', sans-serif;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 4px 16px ${C.bright}44;
    transition: all 0.2s;
    letter-spacing: 0.01em;
  }
  .smf-btn:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); box-shadow: 0 8px 20px ${C.bright}55; }
  .smf-btn:active:not(:disabled) { transform: translateY(0); }
  .smf-btn:disabled { background: #d8e8ef; color: #9bb0bc; box-shadow: none; cursor: not-allowed; }

  /* Spinner */
  .smf-spinner {
    width: 16px; height: 16px;
    border: 2px solid rgba(255,255,255,0.35);
    border-top-color: #fff;
    border-radius: 50%;
    display: inline-block;
    animation: smf-spin 0.75s linear infinite;
    vertical-align: middle;
    margin-right: 6px;
  }
  @keyframes smf-spin { to { transform: rotate(360deg); } }

  /* Error */
  .smf-error {
    display: flex;
    align-items: flex-start;
    gap: 7px;
    background: #fff5f5;
    border: 1.5px solid #fca5a5;
    border-radius: 10px;
    padding: 0.7rem 0.9rem;
    margin-bottom: 1rem;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.83rem;
    color: #b91c1c;
    line-height: 1.5;
    animation: smf-rise 0.2s ease;
  }

  /* Timer */
  .smf-timer {
    font-family: 'Syne', sans-serif;
    font-weight: 600;
    color: ${C.deep};
  }

  @media (max-width: 400px) {
    .smf-box { height: 52px; font-size: 1.35rem; }
    .smf-boxes { gap: 6px; }
  }
`

function injectCSS() {
  if (document.getElementById('smf-css')) return
  const s = document.createElement('style')
  s.id = 'smf-css'; s.textContent = CSS
  document.head.appendChild(s)
}

// ── OTP 6-box input ───────────────────────────────────────────
function OTPBoxes({ value, onChange, hasError, disabled }) {
  const digits = (value + '      ').slice(0, 6).split('')
  const refs   = Array.from({ length: 6 }, () => useRef(null))

  useEffect(() => { setTimeout(() => refs[0].current?.focus(), 150) }, [])

  const handleKey = useCallback((i, e) => {
    if (e.key === 'Backspace') {
      onChange(value.slice(0, -1))
      if (i > 0 && !digits[i].trim()) refs[i - 1].current?.focus()
      return
    }
    if (e.key === 'ArrowLeft'  && i > 0) { refs[i - 1].current?.focus(); return }
    if (e.key === 'ArrowRight' && i < 5) { refs[i + 1].current?.focus(); return }
    if (e.key === 'Enter' && value.length === 6) { e.target.closest('form')?.requestSubmit?.(); return }
    if (!/^\d$/.test(e.key)) return
    const next = (value + e.key).slice(0, 6)
    onChange(next)
    if (i < 5) refs[i + 1].current?.focus()
  }, [value, onChange])

  const handlePaste = useCallback((e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted) { onChange(pasted); refs[Math.min(pasted.length, 5)].current?.focus() }
    e.preventDefault()
  }, [onChange])

  return (
    <div className="smf-boxes">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={refs[i]}
          className={['smf-box', d.trim() ? 'smf-filled' : '', hasError ? 'smf-err' : ''].join(' ')}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d.trim()}
          readOnly
          disabled={disabled}
          onKeyDown={e => handleKey(i, e)}
          onPaste={handlePaste}
          onClick={() => refs[i].current?.focus()}
          aria-label={`Digit ${i + 1} of 6`}
        />
      ))}
    </div>
  )
}

// ── Countdown hook ─────────────────────────────────────────────
function useCountdown(initial) {
  const [left, setLeft] = useState(initial)
  const ref = useRef(null)

  const reset = useCallback((s = initial) => {
    clearInterval(ref.current)
    setLeft(s)
    ref.current = setInterval(() => setLeft(l => {
      if (l <= 1) { clearInterval(ref.current); return 0 }
      return l - 1
    }), 1000)
  }, [initial])

  useEffect(() => { reset(); return () => clearInterval(ref.current) }, [])

  const mm = String(Math.floor(left / 60)).padStart(2, '0')
  const ss = String(left % 60).padStart(2, '0')
  return { left, display: `${mm}:${ss}`, reset }
}

// ── Main component ─────────────────────────────────────────────
// Props:
//   email      — staff email
//   name       — staff name
//   user_id    — backend user ID
//   role       — 'admin' | 'therapist' (for display only)
//   onSuccess  — called with verifyOTP result → parent navigates
//   onCancel   — called when user cancels
export default function StaffOTPModal({ email, name, user_id, role = 'staff', onSuccess, onCancel }) {
  useEffect(() => { injectCSS() }, [])

  const [otp, setOtp]           = useState('')
  const [error, setError]       = useState('')
  const [phase, setPhase]       = useState('sending') // 'sending' | 'input' | 'verifying'
  const [shakeKey, setShakeKey] = useState(0)
  const timer                   = useCountdown(10 * 60)

  // ── Send OTP ──────────────────────────────────────────────────
  const doSend = useCallback(async () => {
    setPhase('sending')
    setOtp('')
    setError('')
    try {
      await sendOTP({
        user_id,
        email,
        otp_type: 'staff_login',
        name,
        channel:  'email',
      })
      setPhase('input')
      timer.reset(10 * 60)
    } catch (err) {
      setError(err.message || 'Failed to send code. Please try again.')
      setPhase('input')
    }
  }, [email, user_id, name])

  useEffect(() => { doSend() }, [])

  // ── Verify ────────────────────────────────────────────────────
  async function handleVerify() {
    if (otp.length < 6) { setError('Please enter all 6 digits.'); return }
    setPhase('verifying')
    setError('')
    try {
      const result = await verifyOTP({ email, otp_code: otp, otp_type: 'staff_login' })
      onSuccess(result)
    } catch (err) {
      setError(err.message)
      setShakeKey(k => k + 1)
      setOtp('')
      setPhase('input')
    }
  }

  // Auto-verify on complete input
  useEffect(() => {
    if (otp.length === 6 && phase === 'input') handleVerify()
  }, [otp])

  // Close on overlay click
  function handleOverlay(e) {
    if (e.target === e.currentTarget) onCancel()
  }

  const roleLabel = role === 'admin' ? 'Administrator' : role === 'therapist' ? 'Therapist' : 'Staff'

  return (
    <div className="smf-overlay" onClick={handleOverlay} role="dialog" aria-modal="true" aria-label="Staff login verification">
      <div className="smf-card">

        {/* Top gradient header */}
        <div className="smf-top">
          <div className="smf-shield">🔐</div>
          <h2 style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '1.3rem', color: '#fff', margin: '0 0 0.35rem' }}>
            Two-Factor Verification
          </h2>
          <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.82rem', color: 'rgba(255,255,255,0.78)', margin: 0, lineHeight: 1.6 }}>
            {phase === 'sending'
              ? 'Sending secure code to your email…'
              : <>Code sent to <strong style={{ color: '#fff' }}>{email}</strong></>
            }
          </p>
        </div>

        {/* Body */}
        <div style={{ padding: '1.75rem' }}>

          {/* Role badge */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 34, height: 34, background: C.faint, border: `1.5px solid ${C.borderFaint}`, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>
                {role === 'admin' ? '👑' : '🩺'}
              </div>
              <div>
                <div style={{ fontFamily: '"Syne", sans-serif', fontSize: '0.82rem', fontWeight: 700, color: C.text }}>{name || email}</div>
                <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.72rem', color: C.muted }}>{roleLabel} · Puja Samargi</div>
              </div>
            </div>
            <div style={{ background: C.faint, border: `1px solid ${C.borderFaint}`, borderRadius: 100, padding: '0.2rem 0.65rem', fontFamily: '"DM Sans", sans-serif', fontSize: '0.65rem', fontWeight: 700, color: C.deep, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              2FA Required
            </div>
          </div>

          {/* Sending state */}
          {phase === 'sending' && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '1.5rem 0', color: C.muted, fontFamily: '"DM Sans", sans-serif', fontSize: '0.88rem' }}>
              <div style={{ width: 20, height: 20, border: `2px solid ${C.borderFaint}`, borderTopColor: C.mid, borderRadius: '50%', animation: 'smf-spin 0.8s linear infinite' }} />
              Sending verification code…
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="smf-error">
              <span style={{ flexShrink: 0, marginTop: 1 }}>⚠</span>
              <span>{error}</span>
            </div>
          )}

          {/* OTP input */}
          {(phase === 'input' || phase === 'verifying') && (
            <>
              <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.82rem', color: C.muted, textAlign: 'center', margin: '0 0 0.25rem' }}>
                Enter the 6-digit code from your email
              </p>

              <OTPBoxes
                key={shakeKey}
                value={otp}
                onChange={v => { setOtp(v); setError('') }}
                hasError={!!error}
                disabled={phase === 'verifying'}
              />

              <button
                className="smf-btn"
                onClick={handleVerify}
                disabled={otp.length < 6 || phase === 'verifying'}
              >
                {phase === 'verifying'
                  ? <><span className="smf-spinner" />Verifying…</>
                  : 'Confirm & Access Dashboard →'
                }
              </button>

              {/* Timer + resend */}
              <div style={{ marginTop: '1rem', textAlign: 'center', fontFamily: '"DM Sans", sans-serif', fontSize: '0.8rem', color: C.muted }}>
                {timer.left > 0
                  ? <>Expires in <span className="smf-timer">{timer.display}</span></>
                  : <span style={{ color: '#e53935', fontWeight: 600 }}>Code expired.</span>
                }
                {' · '}
                <button
                  onClick={doSend}
                  disabled={phase === 'verifying' || timer.left > 540}
                  style={{ background: 'none', border: 'none', fontFamily: '"DM Sans", sans-serif', fontSize: '0.8rem', fontWeight: 600, cursor: (phase === 'verifying' || timer.left > 540) ? 'default' : 'pointer', color: (phase === 'verifying' || timer.left > 540) ? '#ccc' : C.deep, padding: 0 }}
                >
                  Resend
                </button>
              </div>
            </>
          )}

          {/* Security note */}
          <div style={{ marginTop: '1.25rem', padding: '0.7rem 0.9rem', background: C.ghost, border: `1px solid ${C.borderFaint}`, borderRadius: 10, display: 'flex', gap: 7, alignItems: 'flex-start' }}>
            <span style={{ flexShrink: 0, fontSize: '0.85rem' }}>🛡</span>
            <p style={{ margin: 0, fontFamily: '"DM Sans", sans-serif', fontSize: '0.73rem', color: C.muted, lineHeight: 1.6 }}>
              <strong style={{ color: C.deep }}>Every staff login</strong> requires 2FA. All access is logged. Never share your code.
            </p>
          </div>

          {/* Cancel */}
          <div style={{ marginTop: '1rem', textAlign: 'center', borderTop: `1px solid ${C.borderFaint}`, paddingTop: '1rem' }}>
            <button
              onClick={onCancel}
              style={{ background: 'none', border: 'none', fontFamily: '"DM Sans", sans-serif', fontSize: '0.78rem', color: '#aaa', cursor: 'pointer' }}
            >
              ← Cancel and go back
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}