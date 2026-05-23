// ═══════════════════════════════════════════════════════════════
// src/pages/DeliveryLoginPage.jsx
// Route: /delivery  (add to your RouterContext / routes)
// Mirrors StaffLoginPage exactly — same sky-blue design, same OTP flow
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect } from 'react'
import { useRouter } from '../context/RouterContext'
import DeliveryOTPModal from '../components/DeliveryOTPModal'

const API = import.meta.env.VITE_API_URL || ''

const C = {
  skyBright: '#00BFFF', skyMid: '#009FD4', skyDeep: '#007BA8',
  skyFaint: '#E0F7FF', skyFainter: '#F0FBFF', skyGhost: '#F8FEFF',
  white: '#ffffff', mint: '#e8f3ee',
  textDark: '#1a3a4a', textMid: '#2e6080', textLight: '#7a9aaa',
  border: '#b0d4e8', borderFaint: '#daeef8',
  orange: '#f97316', orangeLt: '#fff7ed',
}

// Delivery accent — slightly warmer orange-teal to distinguish from staff portal
const heroGrad = `linear-gradient(135deg,${C.skyDeep} 0%,${C.skyMid} 40%,#0ea5e9 75%,#22d3ee 100%)`
const btnGrad  = `linear-gradient(135deg,${C.skyDeep} 0%,${C.skyMid} 100%)`
const accentBg = `linear-gradient(135deg,#0f766e 0%,${C.skyMid} 60%,${C.skyBright} 100%)`

const CSS = `
  .dlv-root { min-height:100vh; background:${C.skyGhost}; display:flex; flex-direction:column; }
  .dlv-strip { height:4px; background:${heroGrad}; }
  .dlv-grid { flex:1; display:grid; grid-template-columns:1fr 1fr; min-height:calc(100vh - 4px); }
  .dlv-left { background:${heroGrad}; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:clamp(2rem,5vw,3rem) clamp(1.5rem,4vw,2.5rem); position:relative; overflow:hidden; }
  .dlv-right { display:flex; align-items:center; justify-content:center; padding:clamp(1.5rem,4vw,3rem) clamp(1rem,4vw,2rem); background:${C.white}; overflow-y:auto; }
  .dlv-form-wrap { width:100%; max-width:440px; }
  .dlv-input { width:100%; padding:0.85rem 1rem; border:1.5px solid ${C.borderFaint}; border-radius:12px; font-family:var(--font-body,sans-serif); font-size:0.92rem; color:${C.textDark}; background:${C.white}; outline:none; box-sizing:border-box; transition:all 0.2s; }
  .dlv-input:focus { border-color:${C.skyBright}; background:${C.skyGhost}; box-shadow:0 0 0 3.5px rgba(0,191,255,0.12); }
  .dlv-submit { width:100%; padding:1rem; border-radius:14px; border:none; background:${btnGrad}; color:white; font-family:var(--font-body,sans-serif); font-weight:800; font-size:1rem; cursor:pointer; box-shadow:0 6px 22px rgba(0,191,255,0.32); transition:all 0.2s; letter-spacing:0.02em; }
  .dlv-submit:hover:not(:disabled) { opacity:0.88; transform:translateY(-1px); }
  .dlv-submit:disabled { background:${C.borderFaint}; color:${C.textLight}; box-shadow:none; cursor:not-allowed; }
  .dlv-alt-btn { width:100%; padding:0.85rem; border-radius:14px; border:1.5px solid ${C.borderFaint}; background:${C.skyFainter}; color:${C.skyDeep}; font-family:var(--font-body,sans-serif); font-weight:700; font-size:0.9rem; cursor:pointer; transition:all 0.2s; }
  .dlv-alt-btn:hover { background:${C.skyFaint}; border-color:${C.skyBright}; }
  .dlv-pill { display:flex; align-items:center; gap:0.75rem; background:rgba(255,255,255,0.12); backdrop-filter:blur(8px); border:1px solid rgba(255,255,255,0.2); border-radius:12px; padding:0.65rem 1rem; margin-bottom:0.6rem; }
  @media (max-width:900px) { .dlv-grid { grid-template-columns:380px 1fr; } }
  @media (max-width:680px) {
    .dlv-grid { grid-template-columns:1fr; }
    .dlv-left  { display:none; }
    .dlv-right { padding:2rem 1.25rem; align-items:flex-start; }
    .dlv-form-wrap { max-width:100%; }
  }
`

function injectCSS() {
  if (document.getElementById('dlv-login-css')) return
  const s = document.createElement('style')
  s.id = 'dlv-login-css'; s.textContent = CSS
  document.head.appendChild(s)
}

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
        pointerEvents: 'none', transition: 'all 0.18s ease',
        letterSpacing: active ? '0.08em' : '0',
        textTransform: active ? 'uppercase' : 'none',
        fontFamily: 'var(--font-body,sans-serif)', zIndex: 1,
      }}>
        {label}{required && <span style={{ color: C.skyBright, marginLeft: 2 }}>*</span>}
      </label>
      <input
        className="dlv-input" type={type} value={value}
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

export default function DeliveryLoginPage() {
  useEffect(() => { injectCSS() }, [])

  const { navigate } = useRouter()

  // Check already logged-in rider
  useEffect(() => {
    const token = localStorage.getItem('deliveryToken')
    if (token) navigate('/delivery/dashboard')
  }, [])

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPw,   setShowPw]   = useState(false)
  const [error,    setError]    = useState('')
  const [submitting, setSubmitting] = useState(false)

  // OTP state — same pattern as StaffLoginPage
  const [showOTP,    setShowOTP]    = useState(false)
  const [otpPayload, setOtpPayload] = useState(null) // { user_id, email, name }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!email || !password) { setError('Please enter your email and password.'); return }

    setSubmitting(true)
    try {
      // Step 1 — verify credentials only, no session yet
      const res = await fetch(`${API}/api/delivery/check-credentials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Invalid email or password.')

      const { id: user_id, full_name, email: rEmail } = data.user

      // Step 2 — show OTP modal (same pattern as StaffLoginPage)
      setOtpPayload({ user_id, email: rEmail, name: full_name })
      setShowOTP(true)
    } catch (err) {
      setError(err.message || 'Invalid email or password.')
    } finally {
      setSubmitting(false)
    }
  }

  function handleOTPSuccess(token, rider) {
    // Store delivery-specific token (separate from staff accessToken)
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
      {showOTP && otpPayload && (
        <DeliveryOTPModal
          email={otpPayload.email}
          name={otpPayload.name}
          user_id={otpPayload.user_id}
          onSuccess={handleOTPSuccess}
          onCancel={handleOTPCancel}
        />
      )}

      <div className="dlv-root">
        <div className="dlv-strip" />
        <div className="dlv-grid">

          {/* ── Left hero panel ── */}
          <div className="dlv-left">
            <div style={{ position: 'absolute', top: -80, right: -80, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: -60, left: -60, width: 240, height: 240, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />

            <div style={{ position: 'relative', textAlign: 'center', maxWidth: 400, width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.85rem', marginBottom: '2rem' }}>
                <img src="/header.png" alt="Common Psychology" style={{ height: 48, objectFit: 'contain' }}
                  onError={e => e.target.style.display = 'none'} />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontFamily: 'var(--font-display,sans-serif)', fontSize: '1.35rem', color: 'white', fontWeight: 700 }}>Common Psychology</div>
                  <div style={{ fontFamily: 'var(--font-body,sans-serif)', fontSize: '0.7rem', color: 'rgba(255,255,255,0.7)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Delivery Portal</div>
                </div>
              </div>

              {/* Big bike icon */}
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🚴</div>

              <h1 style={{ fontFamily: 'var(--font-display,sans-serif)', fontSize: 'clamp(1.5rem,3vw,2.1rem)', color: 'white', marginBottom: '1rem', lineHeight: 1.25 }}>
                Welcome,<br />Delivery Rider
              </h1>
              <p style={{ fontFamily: 'var(--font-body,sans-serif)', fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.75, marginBottom: '2rem' }}>
                View your assigned orders, update delivery status, and manage your route.
              </p>

              {[
                { icon: '📦', text: 'See all orders assigned to you' },
                { icon: '🚀', text: 'Update status as you deliver' },
                { icon: '📍', text: 'View client address & details' },
                { icon: '🔐', text: 'Email 2FA on every login' },
              ].map((f, i) => (
                <div key={i} className="dlv-pill">
                  <span style={{ fontSize: '1rem', flexShrink: 0 }}>{f.icon}</span>
                  <span style={{ fontFamily: 'var(--font-body,sans-serif)', fontSize: '0.82rem', color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>{f.text}</span>
                </div>
              ))}

              <button onClick={() => navigate('/')}
                style={{ marginTop: '2rem', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: 'rgba(255,255,255,0.8)', borderRadius: 100, padding: '0.4rem 1.2rem', fontFamily: 'var(--font-body,sans-serif)', fontSize: '0.78rem', cursor: 'pointer' }}>
                ← Back to Main Site
              </button>
            </div>
          </div>

          {/* ── Right form panel ── */}
          <div className="dlv-right">
            <div className="dlv-form-wrap">
              <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: `linear-gradient(135deg,${C.skyFaint},${C.mint})`, border: `1px solid ${C.borderFaint}`, borderRadius: 100, padding: '0.28rem 0.85rem', marginBottom: '0.85rem' }}>
                  <span style={{ fontFamily: 'var(--font-body,sans-serif)', fontSize: '0.65rem', fontWeight: 800, color: C.skyDeep, textTransform: 'uppercase', letterSpacing: '0.1em' }}>🚴 Delivery Riders Only</span>
                </div>
                <h2 style={{ fontFamily: 'var(--font-display,sans-serif)', fontSize: 'clamp(1.5rem,3vw,1.9rem)', color: C.textDark, marginBottom: '0.4rem' }}>
                  Rider Sign In
                </h2>
                <p style={{ fontFamily: 'var(--font-body,sans-serif)', fontSize: '0.85rem', color: C.textLight }}>
                  Use the email and password your admin set for you. A verification code will be sent to your email on every login.
                </p>
              </div>

              {error && (
                <div style={{ background: '#fff0f0', border: '1.5px solid #f5a0a0', borderRadius: 10, padding: '0.85rem 1rem', marginBottom: '1.25rem', display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
                  <span style={{ flexShrink: 0 }}>⚠️</span>
                  <span style={{ fontFamily: 'var(--font-body,sans-serif)', fontSize: '0.84rem', color: '#c0392b', lineHeight: 1.5 }}>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <FloatingInput
                  label="Rider Email" type="email" value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your.email@commonpsychology.com" required
                />
                <FloatingInput
                  label="Password" type={showPw ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Your password" required
                  rightSlot={
                    <button type="button" onClick={() => setShowPw(v => !v)}
                      style={{ background: 'none', border: 'none', color: C.textLight, cursor: 'pointer', fontSize: '0.75rem', fontFamily: 'var(--font-body,sans-serif)', fontWeight: 600 }}>
                      {showPw ? 'Hide' : 'Show'}
                    </button>
                  }
                />

                <button type="submit" className="dlv-submit" disabled={submitting}>
                  {submitting ? '⏳ Checking credentials…' : '🚴 Sign In to Delivery Portal'}
                </button>
              </form>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1.5rem 0' }}>
                <div style={{ flex: 1, height: 1, background: C.borderFaint }} />
                <span style={{ fontFamily: 'var(--font-body,sans-serif)', fontSize: '0.72rem', color: C.textLight }}>not a rider?</span>
                <div style={{ flex: 1, height: 1, background: C.borderFaint }} />
              </div>

              <button className="dlv-alt-btn" onClick={() => navigate('/staff')}>
                Staff / Admin Portal →
              </button>

              <div style={{ marginTop: '1.5rem', padding: '0.85rem 1rem', background: `linear-gradient(135deg,${C.skyFainter},${C.mint})`, borderRadius: 10, border: `1px solid ${C.borderFaint}` }}>
                <div style={{ fontFamily: 'var(--font-body,sans-serif)', fontSize: '0.7rem', color: C.textMid, lineHeight: 1.6, display: 'flex', gap: '0.5rem' }}>
                  <span style={{ flexShrink: 0 }}>🔒</span>
                  <span>This portal is for <strong>delivery riders only</strong>. All logins are verified by email OTP. Don't have an account? Contact your admin to be registered.</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}