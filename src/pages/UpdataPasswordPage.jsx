import { useState } from 'react'
import { passwordApi } from '../services/api'
import { useRouter } from '../context/RouterContext'

const C = {
  skyBright: '#00BFFF', skyMid: '#009FD4', skyDeep: '#007BA8',
  skyFaint: '#E0F7FF', skyFainter: '#F0FBFF', skyGhost: '#F8FEFF',
  white: '#ffffff', mint: '#e8f3ee',
  textDark: '#1a3a4a', textMid: '#2e6080', textLight: '#7a9aaa',
  border: '#b0d4e8', borderFaint: '#daeef8',
}
const btnGrad  = `linear-gradient(135deg,#007BA8 0%,#00BFFF 100%)`
const heroGrad = `linear-gradient(135deg,#007BA8 0%,#009FD4 45%,#00BFFF 85%,#22d3ee 100%)`

function PasswordField({ label, value, onChange, placeholder }) {
  const [show, setShow]       = useState(false)
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ marginBottom: '1.1rem' }}>
      <label style={{
        display: 'block', fontFamily: 'var(--font-body)', fontSize: '0.68rem',
        fontWeight: 800, color: C.textLight, textTransform: 'uppercase',
        letterSpacing: '0.09em', marginBottom: '0.45rem',
      }}>
        {label} <span style={{ color: C.skyBright }}>*</span>
      </label>
      <div style={{ position: 'relative' }}>
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: '100%', padding: '0.82rem 3rem 0.82rem 1rem',
            border: `1.5px solid ${focused ? C.skyBright : C.borderFaint}`,
            borderRadius: 12, fontFamily: 'var(--font-body)', fontSize: '0.92rem',
            color: C.textDark, background: focused ? C.skyGhost : C.white,
            outline: 'none', boxSizing: 'border-box',
            boxShadow: focused ? `0 0 0 3px rgba(0,191,255,0.1)` : 'none',
            transition: 'all 0.2s ease',
          }}
        />
        <button
          type="button"
          onClick={() => setShow(s => !s)}
          style={{
            position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: '1rem', color: C.textLight, padding: '0.2rem',
            lineHeight: 1,
          }}
        >
          {show ? '🙈' : '👁️'}
        </button>
      </div>
    </div>
  )
}

function StrengthBar({ password }) {
  const score = (() => {
    let s = 0
    if (password.length >= 8)  s++
    if (/[A-Z]/.test(password)) s++
    if (/[0-9]/.test(password)) s++
    if (/[^A-Za-z0-9]/.test(password)) s++
    return s
  })()

  if (!password) return null

  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong']
  const colors = ['', '#ef4444', '#f97316', '#eab308', '#22c55e']

  return (
    <div style={{ marginBottom: '1.1rem', marginTop: '-0.5rem' }}>
      <div style={{ display: 'flex', gap: '4px', marginBottom: '0.3rem' }}>
        {[1,2,3,4].map(i => (
          <div key={i} style={{
            flex: 1, height: 4, borderRadius: 4,
            background: i <= score ? colors[score] : C.borderFaint,
            transition: 'background 0.3s',
          }} />
        ))}
      </div>
      <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.7rem', color: colors[score], fontWeight: 700 }}>
        {labels[score]}
      </span>
    </div>
  )
}

export default function UpdatePasswordPage() {
  const { navigate } = useRouter()

  const [form, setForm] = useState({ current: '', next: '', confirm: '' })
  const [status, setStatus] = useState('idle') // idle | saving | success | error
  const [errorMsg, setErrorMsg] = useState('')

  const upForm = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const passwordsMatch = form.next && form.next === form.confirm
  const formOK = form.current && form.next.length >= 8 && passwordsMatch

  async function handleSubmit() {
    if (!formOK || status === 'saving') return
    setStatus('saving')
    setErrorMsg('')

    try {
      await passwordApi.update(form.current, form.next)
      setStatus('success')
    } catch (err) {
      setStatus('error')
      setErrorMsg(err.message || 'Could not update password. Please try again.')
    }
  }

  if (status === 'success') return (
    <div className="page-wrapper" style={{ background: C.skyGhost }}>
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '5rem 1.5rem' }}>
        <div style={{
          background: C.white, borderRadius: 24,
          border: `1.5px solid ${C.borderFaint}`,
          boxShadow: `0 8px 40px rgba(0,191,255,0.12)`,
          overflow: 'hidden',
        }}>
          <div style={{ height: 4, background: btnGrad }} />
          <div style={{ padding: '3rem 2.5rem', textAlign: 'center' }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%', background: heroGrad,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.5rem', fontSize: '1.8rem',
              boxShadow: '0 8px 28px rgba(0,191,255,0.35)',
            }}>🔐</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.7rem', color: C.textDark, marginBottom: '0.65rem' }}>
              Password Updated
            </h2>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: C.textMid, lineHeight: 1.75, marginBottom: '2rem' }}>
              Your password has been changed successfully. Use your new password next time you log in.
            </p>
            <button
              onClick={() => navigate('/account')}
              style={{
                padding: '0.8rem 2.5rem', borderRadius: 12, border: 'none',
                background: btnGrad, color: 'white',
                fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '0.95rem',
                cursor: 'pointer', boxShadow: '0 4px 18px rgba(0,191,255,0.32)',
              }}
            >
              Back to Account
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="page-wrapper" style={{ background: C.skyGhost }}>

      {/* Hero */}
      <div style={{ background: heroGrad, padding: '4.5rem 4rem 3rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -50, right: -50, width: 220, height: 220, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 680, margin: '0 auto', position: 'relative' }}>
          <button
            onClick={() => navigate('/account')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: 'rgba(255,255,255,0.85)', borderRadius: 100, padding: '0.3rem 1rem', fontFamily: 'var(--font-body)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', marginBottom: '1.25rem' }}
          >
            ← Back to Account
          </button>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.6rem,3vw,2.1rem)', color: 'white', marginBottom: '0.4rem', lineHeight: 1.2 }}>
            Update Password
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.88rem', color: 'rgba(255,255,255,0.72)' }}>
            Choose a strong password to keep your account secure.
          </p>
        </div>
      </div>

      {/* Form */}
      <div style={{ maxWidth: 680, margin: '2.5rem auto', padding: '0 1.5rem 5rem' }}>
        <div style={{
          background: C.white, borderRadius: 20,
          border: `1.5px solid ${C.borderFaint}`,
          boxShadow: `0 4px 24px rgba(0,191,255,0.07)`,
          overflow: 'hidden',
        }}>
          {/* Card header */}
          <div style={{ padding: '1rem 1.75rem', background: `linear-gradient(135deg,${C.skyFainter},${C.mint})`, borderBottom: `1px solid ${C.borderFaint}`, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: btnGrad, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', boxShadow: '0 3px 10px rgba(0,191,255,0.3)' }}>🔑</div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: C.textDark }}>Change your password</span>
          </div>

          <div style={{ padding: '2rem 1.75rem' }}>

            {/* Error banner */}
            {status === 'error' && (
              <div style={{
                background: '#fef2f2', border: '1.5px solid #fca5a5', borderRadius: 10,
                padding: '0.85rem 1rem', marginBottom: '1.25rem',
                display: 'flex', alignItems: 'center', gap: '0.6rem',
              }}>
                <span style={{ fontSize: '1rem' }}>⚠️</span>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: '#b91c1c', fontWeight: 600 }}>{errorMsg}</span>
              </div>
            )}

            <PasswordField
              label="Current Password"
              value={form.current}
              onChange={e => { upForm('current', e.target.value); setStatus('idle') }}
              placeholder="Enter your current password"
            />

            <div style={{ height: 1, background: C.borderFaint, margin: '0.5rem 0 1.5rem' }} />

            <PasswordField
              label="New Password"
              value={form.next}
              onChange={e => upForm('next', e.target.value)}
              placeholder="At least 8 characters"
            />
            <StrengthBar password={form.next} />

            <PasswordField
              label="Confirm New Password"
              value={form.confirm}
              onChange={e => upForm('confirm', e.target.value)}
              placeholder="Re-enter new password"
            />

            {/* Mismatch warning */}
            {form.confirm && !passwordsMatch && (
              <div style={{ marginBottom: '1rem', marginTop: '-0.5rem' }}>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: '#ef4444', fontWeight: 600 }}>
                  ✕ Passwords do not match
                </span>
              </div>
            )}
            {form.confirm && passwordsMatch && (
              <div style={{ marginBottom: '1rem', marginTop: '-0.5rem' }}>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: '#22c55e', fontWeight: 600 }}>
                  ✓ Passwords match
                </span>
              </div>
            )}

            {/* Tips */}
            <div style={{ background: C.skyFainter, borderRadius: 10, padding: '0.85rem 1rem', border: `1px solid ${C.borderFaint}`, marginBottom: '1.75rem' }}>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.68rem', fontWeight: 800, color: C.textLight, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>Password tips</div>
              {['At least 8 characters', 'One uppercase letter', 'One number', 'One special character (!@#$…)'].map((tip, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span style={{ fontSize: '0.7rem', color: C.skyMid }}>•</span>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: C.textMid }}>{tip}</span>
                </div>
              ))}
            </div>

            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
  <button
    onClick={() => navigate('/forgot-password')}
    style={{ background: 'none', border: 'none', color: C.skyDeep, fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
  >
    Forgot your current password instead?
  </button>
</div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={!formOK || status === 'saving'}
              style={{
                width: '100%', padding: '0.88rem', borderRadius: 12, border: 'none',
                background: formOK && status !== 'saving' ? btnGrad : C.borderFaint,
                color: formOK && status !== 'saving' ? 'white' : C.textLight,
                fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '0.95rem',
                cursor: formOK && status !== 'saving' ? 'pointer' : 'not-allowed',
                boxShadow: formOK ? '0 6px 22px rgba(0,191,255,0.35)' : 'none',
                transition: 'all 0.2s', letterSpacing: '0.02em',
              }}
            >
              {status === 'saving' ? '⏳ Updating…' : '🔐 Update Password'}
            </button>

          </div>
        </div>
      </div>
    </div>
  )
}
