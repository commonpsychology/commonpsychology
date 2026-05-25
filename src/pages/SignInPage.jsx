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
    background: linear-gradient(160deg, #e8f5e9 0%, #c8e6c9 40%, #a5d6a7 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 3rem 2.5rem;
    border-right: 1px solid rgba(0,0,0,0.06);
  }
  .signin-right {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: clamp(1.5rem, 4vw, 3rem) clamp(1rem, 4vw, 2rem);
    background: var(--green-mist);
  }
  .signin-card {
    background: var(--white, #ffffff);
    border-radius: 20px;
    padding: clamp(1.75rem, 4vw, 2.5rem);
    width: 100%;
    max-width: 440px;
    box-shadow: 0 8px 48px rgba(0,0,0,0.1);
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
    background: white;
    border-radius: 10px;
    padding: 0.65rem 1rem;
    font-size: 0.83rem;
    color: var(--text-mid);
    font-weight: 500;
    font-family: var(--font-body);
  }

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
  const [showStaffMenu, setShowStaffMenu] = useState(false)
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
        <div style={{ textAlign: 'center', width: '100%', maxWidth: 300 }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1.25rem' }}>🌿</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.85rem', color: 'var(--green-deep)', marginBottom: '0.9rem', lineHeight: 1.3 }}>
            Your Wellness<br />Journey Awaits
          </h2>
          <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', lineHeight: 1.75, maxWidth: 260, margin: '0 auto 1.5rem' }}>
            Access your therapy sessions, assessments, mood tracker, and more.
          </p>
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
            <div style={{ textAlign: 'right', marginTop: '-0.25rem' }}>
              <button
                type="button"
                onClick={() => navigate('/update-password')}
                style={{ background: 'none', border: 'none', color: 'var(--green-deep)', fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'var(--font-body)' }}
              >
                Forgot password?
              </button>
            </div>
            <button type="submit" className="signin-btn" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In →'}
            </button>
          </form>

          <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-light)', fontFamily: 'var(--font-body)' }}>
            Don't have an account?{' '}
            <button
              onClick={() => navigate('/register')}
              style={{ background: 'none', border: 'none', color: 'var(--green-deep)', fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem' }}
            >
              Create one free →
            </button>
          </div>

          {/* ── Portal shortcuts ── */}
          <div style={{ marginTop: '1.25rem', textAlign: 'center' }}>
            <button
              onClick={() => setShowStaffMenu(v => !v)}
              style={{ background: 'none', border: '1px solid var(--earth-cream)', borderRadius: 6, padding: '0.4rem 0.85rem', fontSize: '0.78rem', color: 'var(--text-light)', cursor: 'pointer', fontFamily: 'var(--font-body)' }}
            >
              🔑 Staff / Admin Login
            </button>

            {showStaffMenu && (
              <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <button
                  onClick={() => navigate('/staff')}
                  style={{ background: 'var(--earth-cream)', border: 'none', borderRadius: 6, padding: '0.5rem', fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'var(--font-body)' }}
                >
                  ⚙️ Admin / Staff Dashboard
                </button>
                <button
                  onClick={() => navigate('/staff')}
                  style={{ background: 'var(--earth-cream)', border: 'none', borderRadius: 6, padding: '0.5rem', fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'var(--font-body)' }}
                >
                  🩺 Therapist Portal
                </button>
                {/* ── Delivery rider portal ── */}
                <button
                  onClick={() => navigate('/delivery')}
                  style={{ background: '#E0F7FF', border: '1px solid #b0d4e8', borderRadius: 6, padding: '0.5rem', fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'var(--font-body)', color: '#007BA8', fontWeight: 600 }}
                >
                  🚴 Delivery Rider Portal
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}