import { useState } from 'react'
import { useRouter } from '../context/RouterContext'
import { passwordApi } from '../services/api'

const C = {
  skyBright: '#00BFFF', skyMid: '#009FD4', skyDeep: '#007BA8', skyDeeper: '#005C82',
  skyFaint: '#E0F7FF', skyFainter: '#F0FBFF', skyGhost: '#F8FEFF',
  white: '#ffffff',
  textDark: '#0f2733', textMid: '#2e6080', textLight: '#7a9aaa', textFaint: '#a8c2d0',
  border: '#b0d4e8', borderFaint: '#e3f2fa',
  danger: '#e0504d', dangerBg: '#fdf1f0', dangerBorder: '#f3c7c5',
}
const btnGrad   = `linear-gradient(135deg,#007BA8 0%,#00BFFF 100%)`
const heroGrad  = `radial-gradient(120% 160% at 15% 0%, #00D2FF 0%, transparent 55%), radial-gradient(100% 140% at 100% 100%, #005C82 0%, transparent 60%), linear-gradient(135deg,#007BA8 0%,#009FD4 45%,#00BFFF 85%,#22d3ee 100%)`

const STAGES = ['email', 'otp', 'newPassword', 'success']
const STAGE_META = {
  email:       { step: 1, icon: '✉️', label: 'Verify it\u2019s you' },
  otp:         { step: 2, icon: '🔢', label: 'Enter your code' },
  newPassword: { step: 3, icon: '🔐', label: 'Choose new password' },
  success:     { step: 4, icon: '✅', label: 'All done' },
}

function ProgressRail({ stage }) {
  const current = STAGE_META[stage].step
  const steps = [1, 2, 3]
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: '2rem' }}>
      {steps.map((s, i) => {
        const done = current > s || stage === 'success'
        const active = current === s && stage !== 'success'
        return (
          <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 'initial' }}>
            <div style={{
              width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-body)', fontSize: '0.78rem', fontWeight: 800,
              background: done || active ? btnGrad : C.white,
              color: done || active ? 'white' : C.textFaint,
              border: done || active ? 'none' : `1.5px solid ${C.borderFaint}`,
              boxShadow: active ? '0 0 0 4px rgba(0,191,255,0.16)' : done ? '0 3px 10px rgba(0,123,168,0.25)' : 'none',
              transition: 'all 0.35s ease',
            }}>
              {done ? '✓' : s}
            </div>
            {i < steps.length - 1 && (
              <div style={{ flex: 1, height: 3, margin: '0 6px', borderRadius: 3, background: C.borderFaint, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', inset: 0, width: current > s ? '100%' : '0%', background: btnGrad, borderRadius: 3, transition: 'width 0.45s ease' }} />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function Field({ label, value, onChange, placeholder, type = 'text', maxLength, autoFocus }) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ marginBottom: '1.1rem' }}>
      <label style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: '0.68rem', fontWeight: 800, color: C.textLight, textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: '0.45rem' }}>
        {label} <span style={{ color: C.skyBright }}>*</span>
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        autoFocus={autoFocus}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: '100%', padding: '0.85rem 1rem',
          border: `1.5px solid ${focused ? C.skyBright : C.borderFaint}`,
          borderRadius: 12, fontFamily: 'var(--font-body)', fontSize: '0.96rem',
          color: C.textDark, background: focused ? C.skyGhost : C.skyFainter,
          outline: 'none', boxSizing: 'border-box',
          boxShadow: focused ? `0 0 0 4px rgba(0,191,255,0.12)` : 'none',
          transition: 'all 0.2s ease', letterSpacing: type === 'tel' ? '0.55em' : 'normal',
          textAlign: type === 'tel' ? 'center' : 'left',
          fontWeight: type === 'tel' ? 700 : 400,
        }}
      />
    </div>
  )
}

function StrengthBar({ password }) {
  const score = (() => {
    let s = 0
    if (password.length >= 8) s++
    if (/[A-Z]/.test(password)) s++
    if (/[0-9]/.test(password)) s++
    if (/[^A-Za-z0-9]/.test(password)) s++
    return s
  })()
  if (!password) return null
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong']
  const colors = ['', '#ef4444', '#f97316', '#eab308', '#16a34a']
  return (
    <div style={{ marginBottom: '1.1rem', marginTop: '-0.5rem' }}>
      <div style={{ display: 'flex', gap: '4px', marginBottom: '0.35rem' }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{ flex: 1, height: 4, borderRadius: 4, background: i <= score ? colors[score] : C.borderFaint, transition: 'background 0.3s' }} />
        ))}
      </div>
      <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: colors[score], fontWeight: 700 }}>{labels[score]}</span>
    </div>
  )
}

function Card({ children, badge }) {
  return (
    <div style={{
      background: `linear-gradient(180deg, ${C.white} 0%, ${C.skyGhost} 100%)`,
      borderRadius: 22,
      border: `1.5px solid ${C.borderFaint}`,
      boxShadow: `0 18px 48px -16px rgba(0,123,168,0.28), 0 4px 14px rgba(0,123,168,0.08)`,
      overflow: 'hidden', position: 'relative',
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: btnGrad }} />
      <div style={{ padding: '2.25rem 2rem 2rem' }}>
        {badge && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: C.skyFaint, color: C.skyDeep, borderRadius: 100,
            padding: '0.3rem 0.85rem', fontFamily: 'var(--font-body)', fontSize: '0.72rem',
            fontWeight: 800, marginBottom: '1.25rem', letterSpacing: '0.02em',
          }}>
            <span>{badge.icon}</span>{badge.label}
          </div>
        )}
        {children}
      </div>
    </div>
  )
}

export default function ForgotPasswordPage() {
  const { navigate } = useRouter()

  const [stage, setStage] = useState('email') // email | otp | newPassword | success
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [resetToken, setResetToken] = useState('')
  const [nextPw, setNextPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const passwordsMatch = nextPw && nextPw === confirmPw
  const newPwOK = nextPw.length >= 8 && passwordsMatch

  async function handleRequestOtp() {
    if (!email || loading) return
    setLoading(true); setError('')
    try {
      await passwordApi.requestOtp(email.trim())
      setStage('otp')
    } catch (err) {
      setError(err.message || 'Could not send code. Please try again.')
    } finally { setLoading(false) }
  }

  async function handleVerifyOtp() {
    if (otp.length !== 6 || loading) return
    setLoading(true); setError('')
    try {
      const res = await passwordApi.verifyOtp(email.trim(), otp.trim())
      setResetToken(res.resetToken)
      setStage('newPassword')
    } catch (err) {
      setError(err.message || 'Incorrect or expired code.')
    } finally { setLoading(false) }
  }

  async function handleSetNewPassword() {
    if (!newPwOK || loading) return
    setLoading(true); setError('')
    try {
      await passwordApi.resetWithToken(email.trim(), resetToken, nextPw)
      setStage('success')
    } catch (err) {
      setError(err.message || 'Could not reset password. Please try again.')
    } finally { setLoading(false) }
  }

  return (
    <div className="page-wrapper" style={{ margin: 0, padding: 0, display: 'block', background: `linear-gradient(180deg, ${C.skyGhost} 0%, ${C.skyFainter} 100%)`, minHeight: '100vh' }}>
      <style>{`html, body, #root { margin: 0; padding: 0; } .page-wrapper { margin: 0 !important; padding: 0 !important; }`}</style>
      <div style={{ background: heroGrad, padding: '4.5rem 4rem 4.25rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -60, right: -40, width: 260, height: 260, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -90, left: '12%', width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '35%', right: '22%', width: 90, height: 90, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 680, margin: '0 auto', position: 'relative' }}>
          <button onClick={() => navigate('/signin')} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.16)', border: '1px solid rgba(255,255,255,0.28)', color: 'rgba(255,255,255,0.9)', borderRadius: 100, padding: '0.32rem 1.05rem', fontFamily: 'var(--font-body)', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', marginBottom: '1.5rem', backdropFilter: 'blur(6px)' }}>
            ← Back to Sign In
          </button>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(255,255,255,0.16)', border: '1px solid rgba(255,255,255,0.28)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', marginBottom: '1.25rem', backdropFilter: 'blur(6px)' }}>
            🔐
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.7rem,3.2vw,2.3rem)', color: 'white', marginBottom: '0.5rem', lineHeight: 1.2, letterSpacing: '-0.01em' }}>
            Reset Your Password
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.92rem', color: 'rgba(255,255,255,0.78)', maxWidth: 440, lineHeight: 1.6 }}>
            {stage === 'email'       && "No worries — we'll send a 6-digit code to your email to get you back in."}
            {stage === 'otp'         && `Enter the code we sent to ${email}.`}
            {stage === 'newPassword' && 'Choose a strong new password for your account.'}
            {stage === 'success'     && 'All set — you can now sign in with your new password.'}
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 680, margin: '-2.5rem auto 0', padding: '0 1.5rem 5rem', position: 'relative' }}>
        <Card badge={stage !== 'success' ? { icon: STAGE_META[stage].icon, label: `Step ${STAGE_META[stage].step} of 3 · ${STAGE_META[stage].label}` } : null}>
          {stage !== 'success' && <ProgressRail stage={stage} />}

          {error && (
            <div style={{ background: C.dangerBg, border: `1.5px solid ${C.dangerBorder}`, borderRadius: 12, padding: '0.85rem 1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ fontSize: '1rem' }}>⚠️</span>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: '#a23330', fontWeight: 600 }}>{error}</span>
            </div>
          )}

          {stage === 'email' && (
            <>
              <Field label="Email Address" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" autoFocus />
              <button onClick={handleRequestOtp} disabled={!email || loading}
                style={{ width: '100%', padding: '0.9rem', borderRadius: 12, border: 'none', background: email && !loading ? btnGrad : C.borderFaint, color: email && !loading ? 'white' : C.textFaint, fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '0.96rem', cursor: email && !loading ? 'pointer' : 'not-allowed', boxShadow: email ? '0 8px 24px rgba(0,191,255,0.32)' : 'none', transition: 'transform 0.15s ease' }}>
                {loading ? '⏳ Sending…' : '📧 Send Code'}
              </button>
            </>
          )}

          {stage === 'otp' && (
            <>
              <Field label="6-Digit Code" type="tel" value={otp} maxLength={6} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))} placeholder="000000" autoFocus />
              <button onClick={handleVerifyOtp} disabled={otp.length !== 6 || loading}
                style={{ width: '100%', padding: '0.9rem', borderRadius: 12, border: 'none', background: otp.length === 6 && !loading ? btnGrad : C.borderFaint, color: otp.length === 6 && !loading ? 'white' : C.textFaint, fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '0.96rem', cursor: otp.length === 6 && !loading ? 'pointer' : 'not-allowed', boxShadow: otp.length === 6 ? '0 8px 24px rgba(0,191,255,0.32)' : 'none', marginBottom: '0.85rem' }}>
                {loading ? '⏳ Verifying…' : '✓ Verify Code'}
              </button>
              <button onClick={handleRequestOtp} disabled={loading} style={{ width: '100%', background: 'none', border: 'none', color: C.skyDeep, fontSize: '0.83rem', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 3 }}>
                Didn't get a code? Resend
              </button>
            </>
          )}

          {stage === 'newPassword' && (
            <>
              <Field label="New Password" type="password" value={nextPw} onChange={e => setNextPw(e.target.value)} placeholder="At least 8 characters" autoFocus />
              <StrengthBar password={nextPw} />
              <Field label="Confirm New Password" type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} placeholder="Re-enter new password" />
              {confirmPw && !passwordsMatch && (
                <div style={{ marginBottom: '1rem', marginTop: '-0.5rem' }}>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.76rem', color: '#ef4444', fontWeight: 700 }}>✕ Passwords do not match</span>
                </div>
              )}
              <button onClick={handleSetNewPassword} disabled={!newPwOK || loading}
                style={{ width: '100%', padding: '0.9rem', borderRadius: 12, border: 'none', background: newPwOK && !loading ? btnGrad : C.borderFaint, color: newPwOK && !loading ? 'white' : C.textFaint, fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '0.96rem', cursor: newPwOK && !loading ? 'pointer' : 'not-allowed', boxShadow: newPwOK ? '0 8px 24px rgba(0,191,255,0.32)' : 'none' }}>
                {loading ? '⏳ Saving…' : '🔐 Set New Password'}
              </button>
            </>
          )}

          {stage === 'success' && (
            <div style={{ textAlign: 'center', padding: '0.5rem 0 0.25rem' }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: heroGrad, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: '2rem', boxShadow: '0 12px 32px rgba(0,191,255,0.38)' }}>🔐</div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.55rem', color: C.textDark, marginBottom: '0.65rem', letterSpacing: '-0.01em' }}>Password Reset</h2>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.92rem', color: C.textMid, lineHeight: 1.75, marginBottom: '2rem', maxWidth: 360, margin: '0 auto 2rem' }}>
                Your password has been changed successfully. Sign in with your new password to continue.
              </p>
              <button onClick={() => navigate('/signin')} style={{ padding: '0.85rem 2.75rem', borderRadius: 12, border: 'none', background: btnGrad, color: 'white', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '0.96rem', cursor: 'pointer', boxShadow: '0 8px 24px rgba(0,191,255,0.32)' }}>
                Go to Sign In
              </button>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}