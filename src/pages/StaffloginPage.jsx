// src/pages/StaffLoginPage.jsx
import { useState, useEffect } from 'react'
import { useRouter } from '../context/RouterContext'
import { useAuth, useAuthGuard } from '../context/AuthContext'

const C = {
  skyBright:   '#00BFFF', skyMid:  '#009FD4', skyDeep: '#007BA8',
  skyFaint:    '#E0F7FF', skyFainter: '#F0FBFF', skyGhost: '#F8FEFF',
  white:       '#ffffff', mint: '#e8f3ee',
  textDark:    '#1a3a4a', textMid: '#2e6080', textLight: '#7a9aaa',
  border:      '#b0d4e8', borderFaint: '#daeef8',
}
const heroGrad = `linear-gradient(135deg,${C.skyDeep} 0%,${C.skyMid} 45%,${C.skyBright} 85%,#22d3ee 100%)`
const btnGrad  = `linear-gradient(135deg,${C.skyDeep} 0%,${C.skyBright} 100%)`

const CSS = `
  .staff-root {
    min-height: 100vh;
    background: ${C.skyGhost};
    display: flex;
    flex-direction: column;
  }
  .staff-strip { height: 4px; background: ${heroGrad}; }
  .staff-grid {
    flex: 1;
    display: grid;
    grid-template-columns: 1fr 1fr;
    min-height: calc(100vh - 4px);
  }
  .staff-left {
    background: ${heroGrad};
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: clamp(2rem,5vw,3rem) clamp(1.5rem,4vw,2.5rem);
    position: relative;
    overflow: hidden;
  }
  .staff-right {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: clamp(1.5rem,4vw,3rem) clamp(1rem,4vw,2rem);
    background: ${C.white};
    overflow-y: auto;
  }
  .staff-form-wrap { width: 100%; max-width: 440px; }
  .staff-input {
    width: 100%;
    padding: 0.85rem 1rem;
    border: 1.5px solid ${C.borderFaint};
    border-radius: 12px;
    font-family: var(--font-body);
    font-size: 0.92rem;
    color: ${C.textDark};
    background: ${C.white};
    outline: none;
    box-sizing: border-box;
    transition: all 0.2s;
  }
  .staff-input:focus {
    border-color: ${C.skyBright};
    background: ${C.skyGhost};
    box-shadow: 0 0 0 3.5px rgba(0,191,255,0.12);
  }
  .staff-submit {
    width: 100%;
    padding: 1rem;
    border-radius: 14px;
    border: none;
    background: ${btnGrad};
    color: white;
    font-family: var(--font-body);
    font-weight: 800;
    font-size: 1rem;
    cursor: pointer;
    box-shadow: 0 6px 22px rgba(0,191,255,0.35);
    transition: all 0.2s;
    letter-spacing: 0.02em;
  }
  .staff-submit:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
  .staff-submit:disabled { background: ${C.borderFaint}; color: ${C.textLight}; box-shadow: none; cursor: not-allowed; }
  .staff-client-btn {
    width: 100%;
    padding: 0.85rem;
    border-radius: 14px;
    border: 1.5px solid ${C.borderFaint};
    background: ${C.skyFainter};
    color: ${C.skyDeep};
    font-family: var(--font-body);
    font-weight: 700;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s;
  }
  .staff-client-btn:hover { background: ${C.skyFaint}; border-color: ${C.skyBright}; }
  .staff-feature-pill {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    background: rgba(255,255,255,0.12);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255,255,255,0.2);
    border-radius: 12px;
    padding: 0.65rem 1rem;
    margin-bottom: 0.6rem;
  }
  @media (max-width: 900px) {
    .staff-grid { grid-template-columns: 380px 1fr; }
  }
  @media (max-width: 680px) {
    .staff-grid { grid-template-columns: 1fr; }
    .staff-left  { display: none; }
    .staff-right { padding: 2rem 1.25rem; align-items: flex-start; }
    .staff-form-wrap { max-width: 100%; }
  }
`

function injectCSS() {
  if (document.getElementById('staff-login-css')) return
  const s = document.createElement('style')
  s.id = 'staff-login-css'; s.textContent = CSS
  document.head.appendChild(s)
}

function FloatingInput({ label, type = 'text', value, onChange, placeholder, required, rightSlot }) {
  const [focused, setFocused] = useState(false)
  const active = focused || value
  return (
    <div style={{ position: 'relative', marginBottom: '1.4rem' }}>
      <label style={{ position: 'absolute', left: '1rem', top: active ? '-0.55rem' : '0.85rem', fontSize: active ? '0.68rem' : '0.9rem', fontWeight: active ? 800 : 400, color: active ? C.skyMid : C.textLight, background: active ? C.white : 'transparent', padding: active ? '0 0.35rem' : '0', pointerEvents: 'none', transition: 'all 0.18s ease', letterSpacing: active ? '0.08em' : '0', textTransform: active ? 'uppercase' : 'none', fontFamily: 'var(--font-body)', zIndex: 1 }}>
        {label}{required && <span style={{ color: C.skyBright, marginLeft: 2 }}>*</span>}
      </label>
      <input
        className="staff-input"
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

export default function StaffLoginPage() {
  useEffect(() => { injectCSS() }, [])

  // ── FIX: replaces all pushState/popstate hacks ───────────────
  // Staff-specific: only staff/admin/therapist roles are redirected
  // to their dashboards. Clients who somehow land here are left on
  // the page (they'll get an "Access denied" error on submit).
  const { user, loading: authLoading } = useAuth()
  const { navigate }                   = useRouter()
  useEffect(() => {
    if (authLoading) return
    if (!user)       return
    if (['admin', 'staff'].includes(user.role)) navigate('/staff/admin')
    else if (user.role === 'therapist')         navigate('/staff/therapist')
    // Clients land here by mistake — don't redirect, let the form
    // reject them so they understand this page isn't for them.
  }, [user, authLoading])
  // ─────────────────────────────────────────────────────────────

  const { login }          = useAuth()
  const [email, setEmail]  = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [error, setError]       = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!email || !password) {
      setError('Please enter your email and password.')
      return
    }
    setSubmitting(true)
    try {
      const data = await login(email.trim().toLowerCase(), password)
      const role = data.user?.role
      if (!['admin', 'staff', 'therapist'].includes(role)) {
        setError('Access denied. This portal is for staff only. Use the main Sign In page.')
        setSubmitting(false)
      }
      // On success the useEffect above handles navigation
    } catch (err) {
      setError(err.message || 'Invalid email or password.')
      setSubmitting(false)
    }
  }

  if (authLoading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.skyGhost }}>
      <div style={{ textAlign: 'center', color: C.textLight }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🌿</div>
        <p style={{ fontFamily: 'var(--font-body)' }}>Checking session…</p>
      </div>
    </div>
  )

  return (
    <div className="staff-root">
      <div className="staff-strip" />
      <div className="staff-grid">

        {/* ── Left hero ── */}
        <div className="staff-left">
          <div style={{ position: 'absolute', top: -80, right: -80, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -60, left: -60, width: 240, height: 240, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', textAlign: 'center', maxWidth: 400, width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.85rem', marginBottom: '2rem' }}>
              <img
                src="/header.png"
                alt="Puja Samargi"
                style={{ height: 48, objectFit: 'contain' }}
                onError={e => e.target.style.display = 'none'}
              />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', color: 'white', fontWeight: 700 }}>Puja Samargi</div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.7rem', color: 'rgba(255,255,255,0.7)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Staff Portal</div>
              </div>
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem,3vw,2.2rem)', color: 'white', marginBottom: '1rem', lineHeight: 1.25 }}>
              Welcome Back,<br />Team Member
            </h1>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.75, marginBottom: '2rem' }}>
              Access your clinical dashboard, manage appointments, view client progress.
            </p>
            {[
              { icon: '📅', text: 'Manage appointments & sessions' },
              { icon: '📊', text: 'View client progress & notes' },
              { icon: '👥', text: 'Manage users and access' },
              { icon: '🔒', text: 'HIPAA-compliant & encrypted' },
            ].map((f, i) => (
              <div key={i} className="staff-feature-pill">
                <span style={{ fontSize: '1rem', flexShrink: 0 }}>{f.icon}</span>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>{f.text}</span>
              </div>
            ))}
            <button
              onClick={() => navigate('/')}
              style={{ marginTop: '2rem', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: 'rgba(255,255,255,0.8)', borderRadius: 100, padding: '0.4rem 1.2rem', fontFamily: 'var(--font-body)', fontSize: '0.78rem', cursor: 'pointer' }}
            >
              ← Back to Main Site
            </button>
          </div>
        </div>

        {/* ── Right form ── */}
        <div className="staff-right">
          <div className="staff-form-wrap">
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: `linear-gradient(135deg,${C.skyFaint},${C.mint})`, border: `1px solid ${C.borderFaint}`, borderRadius: 100, padding: '0.28rem 0.85rem', marginBottom: '0.85rem' }}>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.65rem', fontWeight: 800, color: C.skyDeep, textTransform: 'uppercase', letterSpacing: '0.1em' }}>🔐 Staff Access Only</span>
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem,3vw,1.9rem)', color: C.textDark, marginBottom: '0.4rem' }}>
                Staff Sign In
              </h2>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: C.textLight }}>
                Use your Puja Samargi staff credentials.
              </p>
            </div>

            {error && (
              <div style={{ background: '#fff0f0', border: '1.5px solid #f5a0a0', borderRadius: 10, padding: '0.85rem 1rem', marginBottom: '1.25rem', display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
                <span style={{ flexShrink: 0 }}>⚠️</span>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.84rem', color: '#c0392b', lineHeight: 1.5 }}>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <FloatingInput
                label="Staff Email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@pujasamargi.com.np"
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
                    style={{ background: 'none', border: 'none', color: C.textLight, cursor: 'pointer', fontSize: '0.75rem', fontFamily: 'var(--font-body)', fontWeight: 600 }}
                  >
                    {showPw ? 'Hide' : 'Show'}
                  </button>
                }
              />
              <div style={{ textAlign: 'right', marginTop: '-0.75rem', marginBottom: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => navigate('/update-password')}
                  style={{ background: 'none', border: 'none', color: C.skyMid, fontFamily: 'var(--font-body)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
                >
                  Forgot password?
                </button>
              </div>
              <button type="submit" className="staff-submit" disabled={submitting}>
                {submitting ? '⏳ Signing in…' : '→ Sign In to Staff Portal'}
              </button>
            </form>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1.5rem 0' }}>
              <div style={{ flex: 1, height: 1, background: C.borderFaint }} />
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: C.textLight }}>not a staff member?</span>
              <div style={{ flex: 1, height: 1, background: C.borderFaint }} />
            </div>

            <button className="staff-client-btn" onClick={() => navigate('/signin')}>
              Go to Client Sign In →
            </button>

            <div style={{ marginTop: '1.5rem', padding: '0.85rem 1rem', background: `linear-gradient(135deg,${C.skyFainter},${C.mint})`, borderRadius: 10, border: `1px solid ${C.borderFaint}` }}>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.7rem', color: C.textMid, lineHeight: 1.6, display: 'flex', gap: '0.5rem' }}>
                <span style={{ flexShrink: 0 }}>🔒</span>
                <span>This is a <strong>restricted portal</strong>. All access is logged. Not authorised? Use <strong>Client Sign In</strong> above.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}