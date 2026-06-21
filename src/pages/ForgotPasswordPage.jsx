import { useState } from 'react'
import { useRouter } from '../context/RouterContext'
import { passwordApi } from '../services/api'

const C = {
  skyBright: '#00BFFF', skyMid: '#009FD4', skyDeep: '#007BA8',
  skyFaint: '#E0F7FF', skyFainter: '#F0FBFF', skyGhost: '#F8FEFF',
  white: '#ffffff', mint: '#e8f3ee',
  textDark: '#1a3a4a', textMid: '#2e6080', textLight: '#7a9aaa',
  border: '#b0d4e8', borderFaint: '#daeef8',
}
const btnGrad  = `linear-gradient(135deg,#007BA8 0%,#00BFFF 100%)`
const heroGrad = `linear-gradient(135deg,#007BA8 0%,#009FD4 45%,#00BFFF 85%,#22d3ee 100%)`

function Field({ label, value, onChange, placeholder, type = 'text', maxLength }) {
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
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: '100%', padding: '0.82rem 1rem',
          border: `1.5px solid ${focused ? C.skyBright : C.borderFaint}`,
          borderRadius: 12, fontFamily: 'var(--font-body)', fontSize: '0.92rem',
          color: C.textDark, background: focused ? C.skyGhost : C.white,
          outline: 'none', boxSizing: 'border-box',
          boxShadow: focused ? `0 0 0 3px rgba(0,191,255,0.1)` : 'none',
          transition: 'all 0.2s ease', letterSpacing: type === 'tel' ? '0.3em' : 'normal',
          textAlign: type === 'tel' ? 'center' : 'left',
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
  const colors = ['', '#ef4444', '#f97316', '#eab308', '#22c55e']
  return (
    <div style={{ marginBottom: '1.1rem', marginTop: '-0.5rem' }}>
      <div style={{ display: 'flex', gap: '4px', marginBottom: '0.3rem' }}>
        {[1,2,3,4].map(i => (
          <div key={i} style={{ flex: 1, height: 4, borderRadius: 4, background: i <= score ? colors[score] : C.borderFaint, transition: 'background 0.3s' }} />
        ))}
      </div>
      <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.7rem', color: colors[score], fontWeight: 700 }}>{labels[score]}</span>
    </div>
  )
}

function Card({ children }) {
  return (
    <div style={{ background: C.white, borderRadius: 20, border: `1.5px solid ${C.borderFaint}`, boxShadow: `0 4px 24px rgba(0,191,255,0.07)`, overflow: 'hidden' }}>
      <div style={{ padding: '2rem 1.75rem' }}>{children}</div>
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
    <div className="page-wrapper" style={{ background: C.skyGhost }}>
      <div style={{ background: heroGrad, padding: '4.5rem 4rem 3rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -50, right: -50, width: 220, height: 220, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 680, margin: '0 auto', position: 'relative' }}>
          <button onClick={() => navigate('/signin')} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: 'rgba(255,255,255,0.85)', borderRadius: 100, padding: '0.3rem 1rem', fontFamily: 'var(--font-body)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', marginBottom: '1.25rem' }}>
            ← Back to Sign In
          </button>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.6rem,3vw,2.1rem)', color: 'white', marginBottom: '0.4rem', lineHeight: 1.2 }}>
            Reset Your Password
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.88rem', color: 'rgba(255,255,255,0.72)' }}>
            {stage === 'email'       && "We'll send a 6-digit code to your email."}
            {stage === 'otp'         && `Enter the code we sent to ${email}.`}
            {stage === 'newPassword' && 'Choose a new password for your account.'}
            {stage === 'success'     && 'All set — you can now sign in with your new password.'}
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 680, margin: '2.5rem auto', padding: '0 1.5rem 5rem' }}>
        <Card>
          {error && (
            <div style={{ background: '#fef2f2', border: '1.5px solid #fca5a5', borderRadius: 10, padding: '0.85rem 1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ fontSize: '1rem' }}>⚠️</span>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: '#b91c1c', fontWeight: 600 }}>{error}</span>
            </div>
          )}

          {stage === 'email' && (
            <>
              <Field label="Email Address" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
              <button onClick={handleRequestOtp} disabled={!email || loading}
                style={{ width: '100%', padding: '0.88rem', borderRadius: 12, border: 'none', background: email && !loading ? btnGrad : C.borderFaint, color: email && !loading ? 'white' : C.textLight, fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '0.95rem', cursor: email && !loading ? 'pointer' : 'not-allowed', boxShadow: email ? '0 6px 22px rgba(0,191,255,0.35)' : 'none' }}>
                {loading ? '⏳ Sending…' : '📧 Send Code'}
              </button>
            </>
          )}

          {stage === 'otp' && (
            <>
              <Field label="6-Digit Code" type="tel" value={otp} maxLength={6} onChange={e => setOtp(e.target.value.replace(/\D/g,''))} placeholder="000000" />
              <button onClick={handleVerifyOtp} disabled={otp.length !== 6 || loading}
                style={{ width: '100%', padding: '0.88rem', borderRadius: 12, border: 'none', background: otp.length===6 && !loading ? btnGrad : C.borderFaint, color: otp.length===6 && !loading ? 'white' : C.textLight, fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '0.95rem', cursor: otp.length===6 && !loading ? 'pointer' : 'not-allowed', boxShadow: otp.length===6 ? '0 6px 22px rgba(0,191,255,0.35)' : 'none', marginBottom: '0.75rem' }}>
                {loading ? '⏳ Verifying…' : '✓ Verify Code'}
              </button>
              <button onClick={handleRequestOtp} disabled={loading} style={{ width: '100%', background: 'none', border: 'none', color: C.skyDeep, fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}>
                Didn't get a code? Resend
              </button>
            </>
          )}

          {stage === 'newPassword' && (
            <>
              <Field label="New Password" type="password" value={nextPw} onChange={e => setNextPw(e.target.value)} placeholder="At least 8 characters" />
              <StrengthBar password={nextPw} />
              <Field label="Confirm New Password" type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} placeholder="Re-enter new password" />
              {confirmPw && !passwordsMatch && (
                <div style={{ marginBottom: '1rem', marginTop: '-0.5rem' }}>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: '#ef4444', fontWeight: 600 }}>✕ Passwords do not match</span>
                </div>
              )}
              <button onClick={handleSetNewPassword} disabled={!newPwOK || loading}
                style={{ width: '100%', padding: '0.88rem', borderRadius: 12, border: 'none', background: newPwOK && !loading ? btnGrad : C.borderFaint, color: newPwOK && !loading ? 'white' : C.textLight, fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '0.95rem', cursor: newPwOK && !loading ? 'pointer' : 'not-allowed', boxShadow: newPwOK ? '0 6px 22px rgba(0,191,255,0.35)' : 'none' }}>
                {loading ? '⏳ Saving…' : '🔐 Set New Password'}
              </button>
            </>
          )}

          {stage === 'success' && (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: heroGrad, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: '1.8rem', boxShadow: '0 8px 28px rgba(0,191,255,0.35)' }}>🔐</div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: C.textDark, marginBottom: '0.65rem' }}>Password Reset</h2>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: C.textMid, lineHeight: 1.75, marginBottom: '2rem' }}>
                Your password has been changed. Sign in with your new password.
              </p>
              <button onClick={() => navigate('/signin')} style={{ padding: '0.8rem 2.5rem', borderRadius: 12, border: 'none', background: btnGrad, color: 'white', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', boxShadow: '0 4px 18px rgba(0,191,255,0.32)' }}>
                Go to Sign In
              </button>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}