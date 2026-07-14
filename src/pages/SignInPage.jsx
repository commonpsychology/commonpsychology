// src/pages/SignInPage.jsx
import { useState, useEffect } from 'react'
import { useRouter } from '../context/RouterContext'
import { useAuth, useAuthGuard } from '../context/AuthContext'

const STAFF_ROLES = new Set(['admin', 'staff', 'therapist'])

const CSS = `
  .signin-root {
    min-height: 100vh;
    background: var(--green-mist);
    display: grid;
    grid-template-columns: 420px 1fr;
    align-items: stretch;
    overflow: hidden;
  }
  .signin-left {
    background: linear-gradient(160deg, rgba(255,255,255,0.75) 0%, rgba(214,238,252,0.55) 55%, rgba(255,255,255,0.7) 100%);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 3rem 2.5rem;
    border-right: 1px solid rgba(255,255,255,0.6);
    box-shadow: 0 4px 18px rgba(0,123,168,0.10), inset 0 1px 0 rgba(255,255,255,0.55);
    position: relative;
    overflow: hidden;
  }
  .signin-left::before {
    content: '';
    position: absolute;
    width: 340px;
    height: 340px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(0,191,255,0.14) 0%, rgba(255,255,255,0) 70%);
    top: -80px;
    right: -100px;
  }
  .signin-right {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: clamp(1.5rem, 4vw, 3rem) clamp(1rem, 4vw, 2rem);
    background: var(--green-mist);
  }
  .signin-card {
    background: linear-gradient(160deg, rgba(255,255,255,0.75) 0%, rgba(214,238,252,0.55) 55%, rgba(255,255,255,0.7) 100%);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    border: 1px solid rgba(255,255,255,0.6);
    border-radius: 20px;
    padding: clamp(1.75rem, 4vw, 2.5rem);
    width: 100%;
    max-width: 440px;
    box-shadow: 0 4px 18px rgba(0,123,168,0.10), inset 0 1px 0 rgba(255,255,255,0.55);
  }
  .signin-input {
    width: 100%;
    padding: 0.85rem 1rem;
    border: 2px solid var(--earth-cream, #e8e0d0);
    border-radius: 10px;
    font-family: var(--font-body);
    font-size: 0.95rem;
    outline: none;
    color: var(--text-dark);
    transition: border-color 0.2s;
    background: white;
    box-sizing: border-box;
  }
  .signin-input:focus { border-color: var(--green-soft, #4caf50); }
  .signin-btn {
    width: 100%;
    padding: 0.9rem;
    background: var(--green-deep, #1a5c38);
    color: white;
    border: none;
    border-radius: 10px;
    font-size: 1rem;
    font-weight: 700;
    cursor: pointer;
    transition: background 0.2s, transform 0.15s;
    font-family: var(--font-body);
  }
  .signin-btn:hover:not(:disabled) { background: #154a2d; transform: translateY(-1px); }
  .signin-btn:disabled { background: #aaa; cursor: not-allowed; }
  .signin-feature-pill {
    background: linear-gradient(160deg, rgba(255,255,255,0.75) 0%, rgba(214,238,252,0.55) 55%, rgba(255,255,255,0.7) 100%);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    border: 1px solid rgba(255,255,255,0.6);
    border-radius: 10px;
    padding: 0.65rem 1rem;
    font-size: 0.83rem;
    color: var(--text-mid);
    font-weight: 500;
    font-family: var(--font-body);
    box-shadow: 0 4px 18px rgba(0,123,168,0.10), inset 0 1px 0 rgba(255,255,255,0.55);
  }

  /* ── Inclusive welcome / enticing message block ── */
  .signin-welcome {
    background: rgba(255,255,255,0.55);
    border: 1px solid rgba(255,255,255,0.7);
    border-radius: 16px;
    padding: 1.1rem 1.15rem;
    margin: 1.35rem 0;
    backdrop-filter: blur(2px);
    text-align: left;
  }
  .signin-welcome-eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    font-family: var(--font-body);
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--green-deep, #1a5c38);
    margin-bottom: 0.5rem;
  }
  .signin-welcome-body {
    font-family: var(--font-body);
    font-size: 0.85rem;
    line-height: 1.65;
    color: var(--text-mid);
    margin: 0 0 0.6rem;
  }
  .signin-welcome-question {
    font-family: var(--font-display);
    font-size: 1.02rem;
    line-height: 1.4;
    color: var(--green-deep, #1a5c38);
    margin: 0;
  }

  /* ── Forgot password — high visibility ── */
  .signin-forgot-row {
    display: flex;
    justify-content: center;
    margin-top: -0.15rem;
  }
  .signin-forgot-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    background: #fff3e0;
    border: 1.5px solid #ffcc80;
    color: #b25e00;
    font-weight: 700;
    font-size: 0.85rem;
    font-family: var(--font-body);
    padding: 0.55rem 1rem;
    border-radius: 999px;
    cursor: pointer;
    transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
  }
  .signin-forgot-btn:hover {
    background: #ffe4b3;
    transform: translateY(-1px);
    box-shadow: 0 4px 14px rgba(178,94,0,0.18);
  }

  /* ── Enticing "Register Free" CTA ── */
  .signin-divider {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin: 1.6rem 0 1.1rem;
    font-family: var(--font-body);
    font-size: 0.75rem;
    color: var(--text-light);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .signin-divider::before, .signin-divider::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--earth-cream, #e8e0d0);
  }
  .signin-register-cta {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.15rem;
    padding: 1rem 1.25rem;
    border: none;
    border-radius: 14px;
    background: linear-gradient(135deg, #2e7d4f 0%, #1a5c38 100%);
    color: white;
    cursor: pointer;
    font-family: var(--font-body);
    box-shadow: 0 6px 20px rgba(26,92,56,0.28);
    transition: transform 0.18s, box-shadow 0.18s;
    position: relative;
    overflow: hidden;
  }
  .signin-register-cta:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 28px rgba(26,92,56,0.36);
  }
  .signin-register-cta-title {
    font-size: 1rem;
    font-weight: 800;
    letter-spacing: 0.01em;
  }
  .signin-register-cta-sub {
    font-size: 0.76rem;
    font-weight: 500;
    color: rgba(255,255,255,0.85);
  }
  .signin-register-cta-badge {
    position: absolute;
    top: 0.55rem;
    right: 0.65rem;
    background: rgba(255,255,255,0.18);
    border: 1px solid rgba(255,255,255,0.3);
    color: white;
    font-size: 0.62rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    padding: 0.2rem 0.5rem;
    border-radius: 999px;
  }

  /* ── Staff / Admin portals as small cards ── */
  .signin-portals {
    margin-top: 1.5rem;
    padding-top: 1.25rem;
    border-top: 1px dashed var(--earth-cream, #e8e0d0);
  }
  .signin-portals-label {
    text-align: center;
    font-family: var(--font-body);
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: var(--text-light);
    margin-bottom: 0.7rem;
  }
  .signin-portal-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.5rem;
  }
  .signin-portal-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.3rem;
    background: var(--earth-cream, #f5f1e8);
    border: 1px solid rgba(0,0,0,0.05);
    border-radius: 12px;
    padding: 0.65rem 0.4rem;
    cursor: pointer;
    font-family: var(--font-body);
    transition: background 0.2s, transform 0.15s;
  }
  .signin-portal-card:hover {
    background: #ece3cf;
    transform: translateY(-2px);
  }
  .signin-portal-card-icon { font-size: 1.15rem; }
  .signin-portal-card-label {
    font-size: 0.68rem;
    font-weight: 700;
    color: var(--text-mid);
    text-align: center;
    line-height: 1.25;
  }
  .signin-portal-card.rider {
    background: #E0F7FF;
    border-color: #b0d4e8;
  }
  .signin-portal-card.rider:hover { background: #cdeffb; }
  .signin-portal-card.rider .signin-portal-card-label { color: #007BA8; }

  /* ── Staff redirect overlay ── */
  .signin-staff-overlay {
    position: fixed;
    inset: 0;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    background: linear-gradient(160deg, #e8f5e9 0%, #c8e6c9 60%, #a5d6a7 100%);
    animation: siOverlayIn 0.22s ease both;
  }
  @keyframes siOverlayIn { from { opacity: 0; } to { opacity: 1; } }
  .signin-staff-overlay-icon {
    font-size: 2.5rem;
    animation: siPop 0.3s cubic-bezier(.22,1,.36,1) 0.1s both;
  }
  .signin-staff-overlay-title {
    font-family: var(--font-display, Georgia, serif);
    font-size: 1.4rem;
    color: var(--green-deep, #1a5c38);
    animation: siPop 0.3s cubic-bezier(.22,1,.36,1) 0.18s both;
  }
  .signin-staff-overlay-sub {
    font-family: var(--font-body, system-ui);
    font-size: 0.88rem;
    color: #4a7a5a;
    animation: siPop 0.3s cubic-bezier(.22,1,.36,1) 0.24s both;
  }
  .signin-staff-overlay-spinner {
    width: 22px; height: 22px;
    border: 2.5px solid rgba(26,92,56,0.2);
    border-top-color: var(--green-deep, #1a5c38);
    border-radius: 50%;
    animation: siSpin 0.7s linear infinite, siPop 0.3s cubic-bezier(.22,1,.36,1) 0.3s both;
  }
  @keyframes siSpin { to { transform: rotate(360deg); } }
  @keyframes siPop  { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }

  @media (max-width: 900px) {
    .signin-root { grid-template-columns: 340px 1fr; }
  }
  @media (max-width: 680px) {
    .signin-root { grid-template-columns: 1fr; }
    .signin-left  { display: none; }
    .signin-right { padding: 1.5rem 1rem; align-items: flex-start; padding-top: 2.5rem; }
    .signin-card  { border-radius: 16px; max-width: 100%; }
    .signin-portal-grid { grid-template-columns: repeat(3, 1fr); }
  }
`

function injectCSS() {
  if (document.getElementById('signin-css')) return
  const s = document.createElement('style')
  s.id = 'signin-css'; s.textContent = CSS
  document.head.appendChild(s)
}

// ── Smooth redirect overlay ───────────────────────────────────
function StaffRedirectOverlay({ role }) {
  const label =
    role === 'admin'     ? 'Admin Dashboard'   :
    role === 'therapist' ? 'Therapist Portal'  :
    role === 'rider'     ? 'Delivery Portal'   : 'Staff Portal'

  const icon =
    role === 'rider' ? '🚴' : '🔑'

  return (
    <div className="signin-staff-overlay">
      <div className="signin-staff-overlay-icon">{icon}</div>
      <div className="signin-staff-overlay-title">Redirecting to {label}</div>
      <div className="signin-staff-overlay-sub">Taking you to your portal…</div>
      <div className="signin-staff-overlay-spinner" />
    </div>
  )
}

export default function SignInPage() {
  useEffect(() => { injectCSS() }, [])
  useAuthGuard()

  const { navigate }               = useRouter()
  const { loginRaw, login, logout } = useAuth()
  const [form, setForm]            = useState({ email: '', password: '' })
  const [showPw, setShowPw]        = useState(false)
  const [error, setError]          = useState('')
  const [loading, setLoading]      = useState(false)
  const [staffRedirect, setStaffRedirect] = useState(null)

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!form.email || !form.password) {
      setError('Please enter your email and password.')
      return
    }
    setLoading(true)
    try {
      const data = await loginRaw(form.email, form.password)
      const role = data?.user?.role

      if (STAFF_ROLES.has(role)) {
        setStaffRedirect(role)
        await logout().catch(() => {})
        setTimeout(() => navigate('/staff'), 900)
        return
      }

      // Regular client — commit auth and go home
      await login(form.email, form.password)
      navigate('/')
    } catch (err) {
      setError(err.message || 'Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  if (staffRedirect) return <StaffRedirectOverlay role={staffRedirect} />

  return (
    <div className="signin-root">

      {/* ── Left panel ── */}
      <div className="signin-left">
        <div style={{ textAlign: 'center', width: '100%', maxWidth: 300, position: 'relative' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1.25rem' }}>🌿</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.85rem', color: 'var(--green-deep)', marginBottom: '0.9rem', lineHeight: 1.3 }}>
            Your Wellness<br />Journey Awaits
          </h2>
          <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', lineHeight: 1.75, maxWidth: 260, margin: '0 auto' }}>
            Access your therapy sessions, assessments, mood tracker, and more.
          </p>

          {/* ── Inclusive, enticing welcome message ── */}
          <div className="signin-welcome">
            <div className="signin-welcome-eyebrow">🤝 Everyone belongs here</div>
            <p className="signin-welcome-body">
              Whatever your caste, color, creed, or nationality — this space
              is yours. No labels, no judgment. Just a place that honors your
              values, your story, and your right to feel good.
            </p>
            <p className="signin-welcome-question">
              Ready to immerse yourself in a world of joy and balance? 🌸
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
            {['🔒 Private & confidential', '📋 Progress always saved', '🌿 Culturally sensitive care', '📱 Access from anywhere'].map((item, i) => (
              <div key={i} className="signin-feature-pill">{item}</div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right form ── */}
      <div className="signin-right">
        <div className="signin-card">
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', color: 'var(--green-deep)', marginBottom: '0.3rem' }}>
            Welcome back
          </h1>
          <p style={{ color: 'var(--text-light)', fontSize: '0.88rem', marginBottom: '1.75rem', fontFamily: 'var(--font-body)' }}>
            Sign in to continue your healing journey.
          </p>

          {error && (
            <div style={{ background: '#fff0f0', border: '1.5px solid #f5a0a0', borderRadius: 8, padding: '0.75rem 1rem', marginBottom: '1.25rem', color: '#c0392b', fontSize: '0.875rem', fontFamily: 'var(--font-body)' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-mid)', marginBottom: '0.4rem', fontFamily: 'var(--font-body)' }}>
                Email
              </label>
              <input
                className="signin-input"
                type="email"
                value={form.email}
                placeholder="you@example.com"
                autoComplete="email"
                onChange={e => update('email', e.target.value)}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-mid)', marginBottom: '0.4rem', fontFamily: 'var(--font-body)' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  className="signin-input"
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  onChange={e => update('password', e.target.value)}
                  style={{ paddingRight: '3.5rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  style={{ position: 'absolute', right: '0.85rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-light)', cursor: 'pointer', fontSize: '0.78rem', fontFamily: 'var(--font-body)', fontWeight: 600 }}
                >
                  {showPw ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <button type="submit" className="signin-btn" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In →'}
            </button>

            {/* ── Forgot password — now impossible to miss ── */}
            <div className="signin-forgot-row">
              <button
                type="button"
                onClick={() => navigate('/update-password')}
                className="signin-forgot-btn"
              >
                🔓 Forgot your password?
              </button>
            </div>
          </form>

          {/* ── Enticing Register CTA ── */}
          <div className="signin-divider">New here?</div>
          <button className="signin-register-cta" onClick={() => navigate('/register')}>
            <span className="signin-register-cta-badge">Free forever</span>
            <span className="signin-register-cta-title">✨ Register Free — Start Today</span>
            <span className="signin-register-cta-sub">Join a community that's ready to grow with you</span>
          </button>

          {/* ── Portal shortcuts — small cards ── */}
          <div className="signin-portals">
            <div className="signin-portals-label">Staff & Partner Access</div>
            <div className="signin-portal-grid">
              <button className="signin-portal-card" onClick={() => navigate('/staff')}>
                <span className="signin-portal-card-icon">⚙️</span>
                <span className="signin-portal-card-label">Admin / Staff</span>
              </button>
              <button className="signin-portal-card" onClick={() => navigate('/staff')}>
                <span className="signin-portal-card-icon">🩺</span>
                <span className="signin-portal-card-label">Therapist Portal</span>
              </button>
              <button className="signin-portal-card rider" onClick={() => navigate('/delivery/login')}>
                <span className="signin-portal-card-icon">🚴</span>
                <span className="signin-portal-card-label">Delivery Rider</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}