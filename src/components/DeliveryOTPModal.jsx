// ═══════════════════════════════════════════════════════════════
// src/components/DeliveryOTPModal.jsx
// Mirrors StaffOtpModal exactly.
// Called by DeliveryLoginPage after credentials pass.
// On success returns (token, rider) to parent.
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useRef } from 'react'

const API = import.meta.env.VITE_API_URL || ''

const C = {
  skyBright: '#00BFFF', skyMid: '#009FD4', skyDeep: '#007BA8',
  skyFaint: '#E0F7FF', skyGhost: '#F8FEFF',
  white: '#ffffff', mint: '#e8f3ee',
  textDark: '#1a3a4a', textLight: '#7a9aaa', borderFaint: '#daeef8',
}

export default function DeliveryOTPModal({ email, name, user_id, onSuccess, onCancel }) {
  const [otp,       setOtp]       = useState(['','','','','',''])
  const [error,     setError]     = useState('')
  const [info,      setInfo]      = useState('')
  const [sending,   setSending]   = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [resendCD,  setResendCD]  = useState(60)    // 60s countdown before resend
  const inputRefs = useRef([])

  // Auto-send OTP on mount
  useEffect(() => { sendOTP() }, [])

  // Countdown timer for resend button
  useEffect(() => {
    if (resendCD <= 0) return
    const t = setTimeout(() => setResendCD(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [resendCD])

  async function sendOTP() {
    setSending(true); setError(''); setInfo('')
    try {
      const res = await fetch(`${API}/api/delivery/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to send OTP')
      setInfo(`A 6-digit code was sent to ${email}`)
      setResendCD(60)
    } catch (e) {
      setError(e.message)
    } finally {
      setSending(false)
    }
  }

  function handleDigit(index, value) {
    const digits = value.replace(/\D/g, '').slice(0, 1)
    const next = [...otp]
    next[index] = digits
    setOtp(next)
    if (digits && index < 5) inputRefs.current[index + 1]?.focus()
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
      const res = await fetch(`${API}/api/delivery/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id, otp: code }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Verification failed')
      // Pass token + rider back to DeliveryLoginPage
      onSuccess(data.token, data.rider)
    } catch (e) {
      setError(e.message)
      setOtp(['','','','','',''])
      inputRefs.current[0]?.focus()
    } finally {
      setVerifying(false)
    }
  }

  const digitStyle = (filled) => ({
    width: 52, height: 60, border: `2px solid ${filled ? C.skyBright : C.borderFaint}`,
    borderRadius: 12, textAlign: 'center', fontSize: '1.5rem', fontWeight: 800,
    color: C.textDark, background: filled ? C.skyFaint : C.white,
    outline: 'none', fontFamily: 'monospace', transition: 'all 0.15s',
    boxShadow: filled ? `0 0 0 3px rgba(0,191,255,0.15)` : 'none',
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
        border: `1px solid ${C.borderFaint}`, animation: 'slideUp .18s ease',
      }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🚴</div>
          <h2 style={{ fontFamily: 'var(--font-display,sans-serif)', fontSize: '1.3rem', color: C.textDark, margin: '0 0 0.4rem' }}>
            Verify Your Identity
          </h2>
          <p style={{ fontFamily: 'var(--font-body,sans-serif)', fontSize: '0.84rem', color: C.textLight, lineHeight: 1.6 }}>
            Hi <strong style={{ color: C.textDark }}>{name}</strong>,<br />
            {sending ? 'Sending code…' : `Enter the 6-digit code sent to`}
          </p>
          {!sending && (
            <p style={{ fontFamily: 'var(--font-body,sans-serif)', fontSize: '0.82rem', fontWeight: 700, color: C.skyMid, marginTop: '0.3rem' }}>
              {email}
            </p>
          )}
        </div>

        {/* 6-digit input boxes */}
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '1.5rem' }}
          onPaste={handlePaste}>
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={el => inputRefs.current[i] = el}
              type="text" inputMode="numeric" maxLength={1}
              value={digit}
              onChange={e => handleDigit(i, e.target.value)}
              onKeyDown={e => handleKey(i, e)}
              style={digitStyle(!!digit)}
              disabled={verifying || sending}
            />
          ))}
        </div>

        {/* Status messages */}
        {info && (
          <div style={{ background: C.skyFaint, border: `1px solid ${C.borderFaint}`, borderRadius: 10, padding: '0.65rem 0.9rem', marginBottom: '1rem', fontSize: '0.8rem', color: C.skyDeep, fontWeight: 600, textAlign: 'center', fontFamily: 'var(--font-body,sans-serif)' }}>
            ✅ {info}
          </div>
        )}
        {error && (
          <div style={{ background: '#fff0f0', border: '1px solid #f5a0a0', borderRadius: 10, padding: '0.65rem 0.9rem', marginBottom: '1rem', fontSize: '0.8rem', color: '#c0392b', fontWeight: 600, textAlign: 'center', fontFamily: 'var(--font-body,sans-serif)' }}>
            ⚠️ {error}
          </div>
        )}

        {/* Verify button */}
        <button
          onClick={handleVerify}
          disabled={otp.join('').length < 6 || verifying || sending}
          style={{
            width: '100%', padding: '0.95rem', borderRadius: 14, border: 'none',
            background: `linear-gradient(135deg,${C.skyDeep},${C.skyBright})`,
            color: 'white', fontFamily: 'var(--font-body,sans-serif)', fontWeight: 800,
            fontSize: '1rem', cursor: 'pointer', marginBottom: '1rem',
            boxShadow: '0 6px 20px rgba(0,191,255,0.28)', transition: 'all 0.2s',
            opacity: otp.join('').length < 6 || verifying || sending ? 0.5 : 1,
          }}>
          {verifying ? '⏳ Verifying…' : '✓ Verify & Enter Portal'}
        </button>

        {/* Resend + Cancel */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            onClick={sendOTP}
            disabled={resendCD > 0 || sending}
            style={{
              background: 'none', border: 'none', cursor: resendCD > 0 ? 'not-allowed' : 'pointer',
              fontSize: '0.8rem', fontFamily: 'var(--font-body,sans-serif)', fontWeight: 600,
              color: resendCD > 0 ? C.textLight : C.skyMid,
            }}>
            {sending ? 'Sending…' : resendCD > 0 ? `Resend in ${resendCD}s` : '↺ Resend Code'}
          </button>
          <button
            onClick={onCancel}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'var(--font-body,sans-serif)', fontWeight: 600, color: C.textLight }}>
            ← Back to login
          </button>
        </div>

        <p style={{ textAlign: 'center', fontSize: '0.7rem', color: C.textLight, marginTop: '1.25rem', lineHeight: 1.6, fontFamily: 'var(--font-body,sans-serif)' }}>
          🔒 This code expires in 10 minutes. If you didn't request it, contact your supervisor.
        </p>
      </div>
    </div>
  )
}