// src/pages/DeliveryLoginPage.jsx
// ─────────────────────────────────────────────────────────────
// Full delivery rider login flow:
//   1. Enter email + password → POST /api/delivery/check-credentials
//   2. On success → show DeliveryOTPModal (auto-sends OTP to email)
//   3. OTP verified → store token + rider in localStorage → navigate to /delivery/dashboard
// ─────────────────────────────────────────────────────────────

import { useState, useEffect, useRef } from 'react'
import { useRouter } from '../context/RouterContext'

const API = import.meta.env.VITE_API_URL || ''

// ── Color palette (matches existing delivery/staff portal theme) ──
const C = {
  skyBright:   '#00BFFF',
  skyMid:      '#009FD4',
  skyDeep:     '#007BA8',
  skyFaint:    '#E0F7FF',
  skyFainter:  '#F0FBFF',
  skyGhost:    '#F8FEFF',
  white:       '#ffffff',
  mint:        '#e8f3ee',
  textDark:    '#1a3a4a',
  textMid:     '#2e6080',
  textLight:   '#7a9aaa',
  border:      '#b0d4e8',
  borderFaint: '#daeef8',
}

const heroGrad = `linear-gradient(135deg,${C.skyDeep} 0%,${C.skyMid} 45%,${C.skyBright} 85%,#22d3ee 100%)`
const btnGrad  = `linear-gradient(135deg,${C.skyDeep} 0%,${C.skyBright} 100%)`

// ── CSS ───────────────────────────────────────────────────────
const CSS = `
  .dlv-login-root { min-height:100vh; background:${C.skyGhost}; display:flex; flex-direction:column; }
  .dlv-login-strip { height:4px; background:${heroGrad}; }
  .dlv-login-grid { flex:1; display:grid; grid-template-columns:1fr 1fr; min-height:calc(100vh - 4px); }
  .dlv-login-left { background:${heroGrad}; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:clamp(2rem,5vw,3rem) clamp(1.5rem,4vw,2.5rem); position:relative; overflow:hidden; }
  .dlv-login-right { display:flex; align-items:center; justify-content:center; padding:clamp(1.5rem,4vw,3rem) clamp(1rem,4vw,2rem); background:${C.white}; overflow-y:auto; }
  .dlv-form-wrap { width:100%; max-width:440px; }
  .dlv-input { width:100%; padding:0.85rem 1rem; border:1.5px solid ${C.borderFaint}; border-radius:12px; font-family:var(--font-body,sans-serif); font-size:0.92rem; color:${C.textDark}; background:${C.white}; outline:none; box-sizing:border-box; transition:all 0.2s; }
  .dlv-input:focus { border-color:${C.skyBright}; background:${C.skyGhost}; box-shadow:0 0 0 3.5px rgba(0,191,255,0.12); }
  .dlv-submit { width:100%; padding:1rem; border-radius:14px; border:none; background:${btnGrad}; color:white; font-family:var(--font-body,sans-serif); font-weight:800; font-size:1rem; cursor:pointer; box-shadow:0 6px 22px rgba(0,191,255,0.35); transition:all 0.2s; letter-spacing:0.02em; }
  .dlv-submit:hover:not(:disabled) { opacity:0.88; transform:translateY(-1px); }
  .dlv-submit:disabled { background:${C.borderFaint}; color:${C.textLight}; box-shadow:none; cursor:not-allowed; }
  .dlv-feature-pill { display:flex; align-items:center; gap:0.75rem; background:rgba(255,255,255,0.12); backdrop-filter:blur(8px); border:1px solid rgba(255,255,255,0.2); border-radius:12px; padding:0.65rem 1rem; margin-bottom:0.6rem; }
  .dlv-client-btn { width:100%; padding:0.85rem; border-radius:14px; border:1.5px solid ${C.borderFaint}; background:${C.skyFainter}; color:${C.skyDeep}; font-family:var(--font-body,sans-serif); font-weight:700; font-size:0.9rem; cursor:pointer; transition:all 0.2s; }
  .dlv-client-btn:hover { background:${C.skyFaint}; border-color:${C.skyBright}; }
  @media (max-width:900px) { .dlv-login-grid { grid-template-columns:340px 1fr; } }
  @media (max-width:680px) {
    .dlv-login-grid  { grid-template-columns:1fr; }
    .dlv-login-left  { display:none; }
    .dlv-login-right { padding:2rem 1.25rem; align-items:flex-start; }
    .dlv-form-wrap   { max-width:100%; }
  }
  @keyframes dlv-slide-up { from { transform:translateY(10px); opacity:0; } to { transform:none; opacity:1; } }
  @keyframes dlv-spin { to { transform:rotate(360deg); } }
  .dlv-spinner { display:inline-block; width:14px; height:14px; border:2px solid currentColor; border-right-color:transparent; border-radius:50%; animation:dlv-spin 0.6s linear infinite; vertical-align:middle; }
`

function injectCSS() {
  if (document.getElementById('dlv-login-css')) return
  const s = document.createElement('style')
  s.id = 'dlv-login-css'
  s.textContent = CSS
  document.head.appendChild(s)
}

// ── Floating label input (mirrors StaffLoginPage) ─────────────
function FloatingInput({ label, type = 'text', value, onChange, placeholder, required, rightSlot }) {
  const [focused, setFocused] = useState(false)
  const active = focused || value
  return (
    <div style={{ position: 'relative', marginBottom: '1.4rem' }}>
      <label style={{
        position: 'absolute', left: '1rem',
        top: active ? '-0.55rem' : '0.85rem',
        fontSize: active ? '0.68rem' : '0.9rem',
        fontWeight: active ? 800 : 400,
        color: active ? C.skyMid : C.textLight,
        background: active ? C.white : 'transparent',
        padding: active ? '0 0.35rem' : '0',
        pointerEvents: 'none',
        transition: 'all 0.18s ease',
        letterSpacing: active ? '0.08em' : '0',
        textTransform: active ? 'uppercase' : 'none',
        fontFamily: 'var(--font-body,sans-serif)',
        zIndex: 1,
      }}>
        {label}{required && <span style={{ color: C.skyBright, marginLeft: 2 }}>*</span>}
      </label>
      <input
        className="dlv-input"
        type={type}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={focused ? placeholder : ''}
        style={rightSlot ? { paddingRight: '4rem' } : {}}
      />
      {rightSlot && (
        <div style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}>
          {rightSlot}
        </div>
      )}
    </div>
  )
}

// ── OTP Modal (inline, no separate file dependency needed) ────
function DeliveryOTPModal({ email, name, user_id, onSuccess, onCancel }) {
  const [otp,       setOtp]       = useState(['', '', '', '', '', ''])
  const [error,     setError]     = useState('')
  const [info,      setInfo]      = useState('')
  const [sending,   setSending]   = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [resendCD,  setResendCD]  = useState(60)
  const inputRefs = useRef([])

  // Auto-send OTP on mount
  useEffect(() => { sendOTP() }, [])

  // Countdown timer
  useEffect(() => {
    if (resendCD <= 0) return
    const t = setTimeout(() => setResendCD(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [resendCD])

  async function sendOTP() {
    setSending(true); setError(''); setInfo('')
    try {
      const res = await fetch(`${API}/delivery/send-otp`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ user_id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to send OTP')
      setInfo(`Code sent to ${email}`)
      setResendCD(60)
    } catch (e) {
      setError(e.message)
    } finally {
      setSending(false)
    }
  }

  function handleDigit(index, value) {
    const digit = value.replace(/\D/g, '').slice(0, 1)
    const next = [...otp]
    next[index] = digit
    setOtp(next)
    if (digit && index < 5) inputRefs.current[index + 1]?.focus()
  }

  function handleKey(index, e) {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    if (e.key === 'Enter') handleVerify()
  }

  function handlePaste(e) {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!pasted) return
    const next = [...otp]
    pasted.split('').forEach((c, i) => { if (i < 6) next[i] = c })
    setOtp(next)
    inputRefs.current[Math.min(pasted.length, 5)]?.focus()
  }

  async function handleVerify() {
    const code = otp.join('')
    if (code.length < 6) { setError('Please enter all 6 digits.'); return }
    setVerifying(true); setError('')
    try {
      const res = await fetch(`${API}/delivery/verify-otp`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ user_id, otp: code }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Verification failed')
      // Pass token + rider back to parent
      onSuccess(data.token, data.rider)
    } catch (e) {
      setError(e.message)
      setOtp(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } finally {
      setVerifying(false)
    }
  }

  const digitStyle = (filled) => ({
    width: 52, height: 60,
    border: `2px solid ${filled ? C.skyBright : C.borderFaint}`,
    borderRadius: 12, textAlign: 'center',
    fontSize: '1.5rem', fontWeight: 800,
    color: C.textDark,
    background: filled ? C.skyFaint : C.white,
    outline: 'none', fontFamily: 'monospace',
    transition: 'all 0.15s',
    boxShadow: filled ? `0 0 0 3px rgba(0,191,255,0.15)` : 'none',
    cursor: 'text',
  })

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(2,6,23,0.65)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
    }}>
      <div style={{
        background: C.white, borderRadius: 20, width: '100%', maxWidth: 440,
        padding: '2rem', boxShadow: '0 20px 60px rgba(0,0,0,0.22)',
        border: `1px solid ${C.borderFaint}`,
        animation: 'dlv-slide-up 0.18s ease',
      }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🚴</div>
          <h2 style={{
            fontFamily: 'var(--font-display,sans-serif)', fontSize: '1.3rem',
            color: C.textDark, margin: '0 0 0.4rem',
          }}>
            Verify Your Identity
          </h2>
          <p style={{ fontFamily: 'var(--font-body,sans-serif)', fontSize: '0.84rem', color: C.textLight, lineHeight: 1.6 }}>
            Hi <strong style={{ color: C.textDark }}>{name}</strong>,<br />
            {sending ? 'Sending code…' : 'Enter the 6-digit code sent to'}
          </p>
          {!sending && (
            <p style={{ fontFamily: 'var(--font-body,sans-serif)', fontSize: '0.82rem', fontWeight: 700, color: C.skyMid, marginTop: '0.3rem' }}>
              {email}
            </p>
          )}
        </div>

        {/* 6-digit boxes */}
        <div
          style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '1.5rem' }}
          onPaste={handlePaste}
        >
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={el => inputRefs.current[i] = el}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={e => handleDigit(i, e.target.value)}
              onKeyDown={e => handleKey(i, e)}
              style={digitStyle(!!digit)}
              disabled={verifying || sending}
            />
          ))}
        </div>

        {/* Status messages */}
        {info && !error && (
          <div style={{
            background: C.skyFaint, border: `1px solid ${C.borderFaint}`,
            borderRadius: 10, padding: '0.65rem 0.9rem', marginBottom: '1rem',
            fontSize: '0.8rem', color: C.skyDeep, fontWeight: 600,
            textAlign: 'center', fontFamily: 'var(--font-body,sans-serif)',
          }}>
            ✅ {info}
          </div>
        )}
        {error && (
          <div style={{
            background: '#fff0f0', border: '1px solid #f5a0a0',
            borderRadius: 10, padding: '0.65rem 0.9rem', marginBottom: '1rem',
            fontSize: '0.8rem', color: '#c0392b', fontWeight: 600,
            textAlign: 'center', fontFamily: 'var(--font-body,sans-serif)',
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Verify button */}
        <button
          onClick={handleVerify}
          disabled={otp.join('').length < 6 || verifying || sending}
          style={{
            width: '100%', padding: '0.95rem', borderRadius: 14, border: 'none',
            background: btnGrad,
            color: 'white', fontFamily: 'var(--font-body,sans-serif)',
            fontWeight: 800, fontSize: '1rem', cursor: 'pointer',
            marginBottom: '1rem',
            boxShadow: '0 6px 20px rgba(0,191,255,0.28)', transition: 'all 0.2s',
            opacity: otp.join('').length < 6 || verifying || sending ? 0.5 : 1,
          }}
        >
          {verifying
            ? <><span className="dlv-spinner" /> Verifying…</>
            : '✓ Verify & Enter Portal'
          }
        </button>

        {/* Resend + Cancel */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            onClick={sendOTP}
            disabled={resendCD > 0 || sending}
            style={{
              background: 'none', border: 'none',
              cursor: resendCD > 0 ? 'not-allowed' : 'pointer',
              fontSize: '0.8rem', fontFamily: 'var(--font-body,sans-serif)',
              fontWeight: 600,
              color: resendCD > 0 ? C.textLight : C.skyMid,
            }}
          >
            {sending ? 'Sending…' : resendCD > 0 ? `Resend in ${resendCD}s` : '↺ Resend Code'}
          </button>
          <button
            onClick={onCancel}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '0.8rem', fontFamily: 'var(--font-body,sans-serif)',
              fontWeight: 600, color: C.textLight,
            }}
          >
            ← Back to login
          </button>
        </div>

        <p style={{
          textAlign: 'center', fontSize: '0.7rem', color: C.textLight,
          marginTop: '1.25rem', lineHeight: 1.6,
          fontFamily: 'var(--font-body,sans-serif)',
        }}>
          🔒 This code expires in 10 minutes. If you didn't request it, contact your supervisor.
        </p>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────
export default function DeliveryLoginPage() {
  useEffect(() => { injectCSS() }, [])

  const { navigate } = useRouter()

  // Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem('deliveryToken')
    const rider = localStorage.getItem('deliveryRider')
    if (token && rider) navigate('/delivery/dashboard')
  }, [])

  const [email,      setEmail]      = useState('')
  const [password,   setPassword]   = useState('')
  const [showPw,     setShowPw]     = useState(false)
  const [error,      setError]      = useState('')
  const [submitting, setSubmitting] = useState(false)

  // OTP modal state
  const [showOTP,    setShowOTP]    = useState(false)
  const [otpPayload, setOtpPayload] = useState(null) // { user_id, email, name }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!email.trim() || !password) {
      setError('Please enter your email and password.')
      return
    }

    setSubmitting(true)
    try {
      // Step 1: verify credentials only — does NOT create session
      const res = await fetch(`${API}/delivery/check-credentials`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          email:    email.trim().toLowerCase(),
          password,
        }),
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'Invalid email or password.')
      }

      // Step 2: store payload and show OTP modal
      // data.user = { id, full_name, email, phone, rider_id, area, vehicle_type }
      setOtpPayload({
        user_id: data.user.id,
        email:   data.user.email,
        name:    data.user.full_name || data.user.email,
      })
      setShowOTP(true)

    } catch (err) {
      setError(err.message || 'Invalid email or password.')
    } finally {
      setSubmitting(false)
    }
  }

  // Called by OTP modal with token + rider from verify-otp response
  function handleOTPSuccess(token, rider) {
    localStorage.setItem('deliveryToken', token)
    localStorage.setItem('deliveryRider', JSON.stringify(rider))
    setShowOTP(false)
    navigate('/delivery/dashboard')
  }

  function handleOTPCancel() {
    setShowOTP(false)
    setOtpPayload(null)
  }

  return (
    <>
      {/* OTP Modal — shown after credentials pass */}
      {showOTP && otpPayload && (
        <DeliveryOTPModal
          email={otpPayload.email}
          name={otpPayload.name}
          user_id={otpPayload.user_id}
          onSuccess={handleOTPSuccess}
          onCancel={handleOTPCancel}
        />
      )}

      <div className="dlv-login-root">
        <div className="dlv-login-strip" />
        <div className="dlv-login-grid">

          {/* ── Left hero panel ── */}
          <div className="dlv-login-left">
            {/* Decorative circles */}
            <div style={{ position: 'absolute', top: -80, right: -80, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: -60, left: -60, width: 240, height: 240, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />

            <div style={{ position: 'relative', textAlign: 'center', maxWidth: 400, width: '100%' }}>
              {/* Logo + brand */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.85rem', marginBottom: '2rem' }}>
                <img
                  src="/header.png"
                  alt="Common Psychology"
                  style={{ height: 48, objectFit: 'contain' }}
                  onError={e => e.target.style.display = 'none'}
                />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontFamily: 'var(--font-display,sans-serif)', fontSize: '1.35rem', color: 'white', fontWeight: 700 }}>Common Psychology</div>
                  <div style={{ fontFamily: 'var(--font-body,sans-serif)', fontSize: '0.7rem', color: 'rgba(255,255,255,0.7)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Delivery Portal</div>
                </div>
              </div>

              <h1 style={{ fontFamily: 'var(--font-display,sans-serif)', fontSize: 'clamp(1.5rem,3vw,2.2rem)', color: 'white', marginBottom: '1rem', lineHeight: 1.25 }}>
                Welcome Back,<br />Delivery Rider 🚴
              </h1>
              <p style={{ fontFamily: 'var(--font-body,sans-serif)', fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.75, marginBottom: '2rem' }}>
                Access your delivery dashboard, view assigned orders, and update delivery statuses on the go.
              </p>

              {[
                { icon: '📦', text: 'View your assigned orders' },
                { icon: '🗺️', text: 'See delivery addresses & notes' },
                { icon: '✅', text: 'Update status: picked up → delivered' },
                { icon: '🔐', text: 'Email 2FA on every login' },
              ].map((f, i) => (
                <div key={i} className="dlv-feature-pill">
                  <span style={{ fontSize: '1rem', flexShrink: 0 }}>{f.icon}</span>
                  <span style={{ fontFamily: 'var(--font-body,sans-serif)', fontSize: '0.82rem', color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>{f.text}</span>
                </div>
              ))}

              <button
                onClick={() => navigate('/')}
                style={{ marginTop: '2rem', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: 'rgba(255,255,255,0.8)', borderRadius: 100, padding: '0.4rem 1.2rem', fontFamily: 'var(--font-body,sans-serif)', fontSize: '0.78rem', cursor: 'pointer' }}
              >
                ← Back to Main Site
              </button>
            </div>
          </div>

          {/* ── Right form panel ── */}
          <div className="dlv-login-right">
            <div className="dlv-form-wrap">

              {/* Heading */}
              <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: `linear-gradient(135deg,${C.skyFaint},${C.mint})`, border: `1px solid ${C.borderFaint}`, borderRadius: 100, padding: '0.28rem 0.85rem', marginBottom: '0.85rem' }}>
                  <span style={{ fontFamily: 'var(--font-body,sans-serif)', fontSize: '0.65rem', fontWeight: 800, color: C.skyDeep, textTransform: 'uppercase', letterSpacing: '0.1em' }}>🚴 Rider Access Only</span>
                </div>
                <h2 style={{ fontFamily: 'var(--font-display,sans-serif)', fontSize: 'clamp(1.5rem,3vw,1.9rem)', color: C.textDark, marginBottom: '0.4rem' }}>
                  Rider Sign In
                </h2>
                <p style={{ fontFamily: 'var(--font-body,sans-serif)', fontSize: '0.85rem', color: C.textLight }}>
                  Use your delivery rider credentials. A 6-digit verification code will be sent to your email on every login.
                </p>
              </div>

              {/* Error banner */}
              {error && (
                <div style={{ background: '#fff0f0', border: '1.5px solid #f5a0a0', borderRadius: 10, padding: '0.85rem 1rem', marginBottom: '1.25rem', display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
                  <span style={{ flexShrink: 0 }}>⚠️</span>
                  <span style={{ fontFamily: 'var(--font-body,sans-serif)', fontSize: '0.84rem', color: '#c0392b', lineHeight: 1.5 }}>{error}</span>
                </div>
              )}

              {/* Login form */}
              <form onSubmit={handleSubmit}>
                <FloatingInput
                  label="Rider Email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your_email@example.com"
                  required
                />
                <FloatingInput
                  label="Password"
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Your password"
                  required
                  rightSlot={
                    <button
                      type="button"
                      onClick={() => setShowPw(v => !v)}
                      style={{ background: 'none', border: 'none', color: C.textLight, cursor: 'pointer', fontSize: '0.75rem', fontFamily: 'var(--font-body,sans-serif)', fontWeight: 600 }}
                    >
                      {showPw ? 'Hide' : 'Show'}
                    </button>
                  }
                />

                <button
                  type="submit"
                  className="dlv-submit"
                  disabled={submitting}
                >
                  {submitting
                    ? <><span className="dlv-spinner" /> Checking credentials…</>
                    : '→ Sign In to Delivery Portal'
                  }
                </button>
              </form>

              {/* Divider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1.5rem 0' }}>
                <div style={{ flex: 1, height: 1, background: C.borderFaint }} />
                <span style={{ fontFamily: 'var(--font-body,sans-serif)', fontSize: '0.72rem', color: C.textLight }}>not a rider?</span>
                <div style={{ flex: 1, height: 1, background: C.borderFaint }} />
              </div>

              <button className="dlv-client-btn" onClick={() => navigate('/signin')}>
                Go to Client Sign In →
              </button>

              {/* Security note */}
              <div style={{ marginTop: '1.5rem', padding: '0.85rem 1rem', background: `linear-gradient(135deg,${C.skyFainter},${C.mint})`, borderRadius: 10, border: `1px solid ${C.borderFaint}` }}>
                <div style={{ fontFamily: 'var(--font-body,sans-serif)', fontSize: '0.7rem', color: C.textMid, lineHeight: 1.6, display: 'flex', gap: '0.5rem' }}>
                  <span style={{ flexShrink: 0 }}>🔒</span>
                  <span>This is a <strong>restricted portal</strong>. All access is logged and verified by email 2FA. Not a rider? Use <strong>Client Sign In</strong> above.</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </>
  )
}