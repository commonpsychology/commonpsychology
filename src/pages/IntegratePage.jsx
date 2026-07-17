// IntegratePage.jsx
// Route this at /integrate (e.g. React Router: <Route path="/integrate" element={<IntegratePage />} />)
//
// This posts to your existing backend (same pattern as AuthContext's loginRaw),
// which does the actual Supabase write server-side with the service-role key.
// See integrateController.js / integrateRoutes.js for that side.
//
// Needs:
//   - /watermark.png    (the "eyes covered" community mark — put it in /public)
//   - /qrpayment.png    (your payment QR code — put it in /public)
//
// Design: deep-navy → blue glass, matching the umbrella hero it's linked from.
// Signature element: the watermark figure sits large and faint behind the glass,
// echoing the "we are one" idea — you join before you're fully seen, and that's fine.

import React, { useState } from 'react'

// Mirrors the constant in AuthContext.jsx — consider moving both to a shared
// src/config.js so there's only one source of truth for API_BASE.
const API_BASE = import.meta.env.VITE_API_URL || '/api'

const SEX_OPTIONS = ['Female', 'Male', 'Non-binary', 'Prefer not to say']

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const initialForm = {
  fullName: '',
  age: '',
  sex: '',
  email: '',
  phone: '',
  country: '',
  message: '',
  contribution: '',
}

export default function IntegratePage() {
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // idle | submitting | success | error
  const [serverError, setServerError] = useState('')

  const update = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }))
    setErrors((er) => ({ ...er, [key]: undefined }))
  }

  const validate = () => {
    const e = {}
    if (!form.fullName.trim() || form.fullName.trim().length < 2) {
      e.fullName = 'Tell us your name.'
    }
    const ageNum = Number(form.age)
    if (!form.age || Number.isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
      e.age = 'Enter a valid age.'
    }
    if (!form.sex) {
      e.sex = 'Pick one.'
    }
    if (!form.email.trim() || !EMAIL_RE.test(form.email.trim())) {
      e.email = 'Enter a valid email.'
    }
    if (form.contribution !== '' && Number(form.contribution) < 0) {
      e.contribution = 'Contribution can\'t be negative.'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    setServerError('')
    if (!validate()) return

    setStatus('submitting')
    try {
      const res = await fetch(`${API_BASE}/integrate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: form.fullName.trim(),
          age: Number(form.age),
          sex: form.sex,
          email: form.email.trim().toLowerCase(),
          phone: form.phone.trim() || undefined,
          country: form.country.trim() || undefined,
          message: form.message.trim() || undefined,
          contribution: form.contribution === '' ? 0 : Number(form.contribution),
        }),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        setStatus('error')
        setServerError(
          res.status === 409
            ? 'That email already joined — welcome back.'
            : data.message || 'Something went wrong. Please try again.'
        )
        return
      }

      setStatus('success')
      setForm(initialForm)
    } catch {
      setStatus('error')
      setServerError('Could not reach the server. Please try again.')
    }
  }

  return (
    <div style={styles.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

        .integrate-input {
          width: 100%;
          background: rgba(8, 18, 36, 0.55);
          border: 1px solid rgba(147, 197, 253, 0.18);
          border-radius: 10px;
          padding: 12px 14px;
          color: #eaf2ff;
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s ease, background 0.2s ease;
        }
        .integrate-input::placeholder { color: #5c7699; }
        .integrate-input:focus {
          border-color: #60a5fa;
          background: rgba(8, 18, 36, 0.8);
        }
        .integrate-input.has-error { border-color: #f2795a; }

        .integrate-select {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%2360a5fa'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 14px center;
        }

        .integrate-btn {
          font-family: 'Inter', sans-serif;
          font-weight: 600;
          font-size: 15px;
          letter-spacing: 0.2px;
          color: #0a1220;
          background: linear-gradient(135deg, #f5d06a, #f5a623);
          border: none;
          border-radius: 999px;
          padding: 14px 28px;
          cursor: pointer;
          box-shadow: 0 8px 24px rgba(245, 166, 35, 0.25);
          transition: transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease;
        }
        .integrate-btn:hover { transform: translateY(-1px); box-shadow: 0 10px 28px rgba(245, 166, 35, 0.35); }
        .integrate-btn:active { transform: translateY(0); }
        .integrate-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

        .integrate-field-error {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11.5px;
          color: #f2795a;
          margin-top: 5px;
        }

        @media (max-width: 860px) {
          .integrate-grid { grid-template-columns: 1fr !important; }
          .integrate-qr-col { order: -1; }
        }
      `}</style>

      {/* Ambient gradient orbs */}
      <div style={styles.orbBlue} />
      <div style={styles.orbGold} />

      {/* Background watermark */}
      <img
        src="/watermark.png"
        alt=""
        aria-hidden="true"
        style={styles.watermark}
      />

      <main style={styles.card}>
        <header style={styles.header}>
          <p style={styles.eyebrow}>हामी एक हौँ · under one umbrella</p>
          <h1 style={styles.title}>Let's Integrate</h1>
          <p style={styles.subtitle}>
            A few details, and you're one of us. Everything here stays between you and the community.
          </p>
        </header>

        {status === 'success' ? (
          <div style={styles.successBox}>
            <div style={styles.successGlyph}>✓</div>
            <h2 style={styles.successTitle}>You're in — welcome.</h2>
            <p style={styles.successText}>
              Your details are saved. We'll be in touch by email.
            </p>
            <button className="integrate-btn" onClick={() => setStatus('idle')}>
              Add another member
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="integrate-grid" style={styles.grid}>
            {/* Left: member details */}
            <section style={styles.formCol}>
              <Field label="Full name" error={errors.fullName}>
                <input
                  className={`integrate-input${errors.fullName ? ' has-error' : ''}`}
                  placeholder="Ram Kumar Thapa"
                  value={form.fullName}
                  onChange={update('fullName')}
                />
              </Field>

              <div style={styles.row}>
                <Field label="Age" error={errors.age} style={{ flex: 1 }}>
                  <input
                    className={`integrate-input${errors.age ? ' has-error' : ''}`}
                    type="number"
                    min="1"
                    max="120"
                    placeholder="27"
                    value={form.age}
                    onChange={update('age')}
                  />
                </Field>
                <Field label="Sex" error={errors.sex} style={{ flex: 1 }}>
                  <select
                    className={`integrate-input integrate-select${errors.sex ? ' has-error' : ''}`}
                    value={form.sex}
                    onChange={update('sex')}
                  >
                    <option value="" disabled>Select</option>
                    {SEX_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </Field>
              </div>

              <Field label="Email" error={errors.email}>
                <input
                  className={`integrate-input${errors.email ? ' has-error' : ''}`}
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={update('email')}
                />
              </Field>

              <div style={styles.row}>
                <Field label="Phone (optional)" style={{ flex: 1 }}>
                  <input
                    className="integrate-input"
                    placeholder="+977 98..."
                    value={form.phone}
                    onChange={update('phone')}
                  />
                </Field>
                <Field label="Country (optional)" style={{ flex: 1 }}>
                  <input
                    className="integrate-input"
                    placeholder="Nepal"
                    value={form.country}
                    onChange={update('country')}
                  />
                </Field>
              </div>

              <Field label="Why do you want to join? (optional)">
                <textarea
                  className="integrate-input"
                  rows={3}
                  placeholder="A line or two is plenty."
                  value={form.message}
                  onChange={update('message')}
                  style={{ resize: 'vertical', fontFamily: 'Inter, sans-serif' }}
                />
              </Field>
            </section>

            {/* Right: contribution + QR */}
            <aside className="integrate-qr-col" style={styles.qrCol}>
              <div style={styles.qrCard}>
                <p style={styles.qrLabel}>Scan to contribute</p>
                <img src="/qrpayment.png" alt="Payment QR code" style={styles.qrImg} />
                <p style={styles.qrHint}>Give what feels right — $0 or a billion, we welcome you either way.</p>

                <Field label="Contribution amount (optional)" error={errors.contribution}>
                  <input
                    className={`integrate-input${errors.contribution ? ' has-error' : ''}`}
                    type="number"
                    min="0"
                    step="any"
                    placeholder="0"
                    value={form.contribution}
                    onChange={update('contribution')}
                  />
                </Field>
              </div>

              {serverError && <p style={styles.serverError}>{serverError}</p>}

              <button
                type="submit"
                className="integrate-btn"
                disabled={status === 'submitting'}
                style={{ width: '100%', marginTop: 4 }}
              >
                {status === 'submitting' ? 'Joining…' : 'Become a Member'}
              </button>
            </aside>
          </form>
        )}
      </main>
    </div>
  )
}

function Field({ label, error, children, style }) {
  return (
    <label style={{ ...fieldStyles.wrap, ...style }}>
      <span style={fieldStyles.label}>{label}</span>
      {children}
      {error && <span className="integrate-field-error">{error}</span>}
    </label>
  )
}

const styles = {
  page: {
    position: 'relative',
    minHeight: '100vh',
    width: '100%',
    background: 'radial-gradient(ellipse at top, #0d1e36 0%, #060d1a 55%, #04080f 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px 20px',
    overflow: 'hidden',
    fontFamily: "'Inter', sans-serif",
  },
  orbBlue: {
    position: 'absolute',
    top: '-10%',
    left: '-8%',
    width: 420,
    height: 420,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(59,130,246,0.25), transparent 70%)',
    filter: 'blur(10px)',
    pointerEvents: 'none',
  },
  orbGold: {
    position: 'absolute',
    bottom: '-12%',
    right: '-6%',
    width: 380,
    height: 380,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(245,166,35,0.16), transparent 70%)',
    filter: 'blur(10px)',
    pointerEvents: 'none',
  },
  watermark: {
    position: 'absolute',
    right: '-6%',
    bottom: '-8%',
    width: 560,
    maxWidth: '70vw',
    opacity: 0.06,
    filter: 'grayscale(1) brightness(1.4)',
    pointerEvents: 'none',
    userSelect: 'none',
  },
  card: {
    position: 'relative',
    width: '100%',
    maxWidth: 860,
    background: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid rgba(147, 197, 253, 0.14)',
    borderRadius: 24,
    backdropFilter: 'blur(22px)',
    WebkitBackdropFilter: 'blur(22px)',
    boxShadow: '0 24px 80px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.06)',
    padding: '40px 36px 36px',
  },
  header: { marginBottom: 30, textAlign: 'center' },
  eyebrow: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 11.5,
    letterSpacing: 1.5,
    color: '#7aa8e0',
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  title: {
    fontFamily: "'Fraunces', serif",
    fontWeight: 600,
    fontSize: 'clamp(32px, 5vw, 44px)',
    color: '#f2f6ff',
    margin: 0,
    letterSpacing: 0.2,
  },
  subtitle: {
    marginTop: 10,
    color: '#9fb8d9',
    fontSize: 14.5,
    maxWidth: 460,
    marginLeft: 'auto',
    marginRight: 'auto',
    lineHeight: 1.55,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1.15fr 0.85fr',
    gap: 28,
    alignItems: 'start',
  },
  formCol: { display: 'flex', flexDirection: 'column', gap: 16 },
  row: { display: 'flex', gap: 14 },
  qrCol: { display: 'flex', flexDirection: 'column', gap: 14 },
  qrCard: {
    background: 'rgba(8, 18, 36, 0.5)',
    border: '1px solid rgba(147, 197, 253, 0.16)',
    borderRadius: 16,
    padding: 20,
    textAlign: 'center',
  },
  qrLabel: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 11,
    letterSpacing: 1,
    color: '#7aa8e0',
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  qrImg: {
    width: '100%',
    maxWidth: 180,
    aspectRatio: '1 / 1',
    objectFit: 'contain',
    background: '#fff',
    borderRadius: 12,
    padding: 10,
    margin: '0 auto',
    display: 'block',
  },
  qrHint: {
    fontSize: 12.5,
    color: '#8fa8cc',
    marginTop: 12,
    marginBottom: 16,
    lineHeight: 1.5,
  },
  serverError: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 12,
    color: '#f2795a',
    textAlign: 'center',
    margin: 0,
  },
  successBox: {
    textAlign: 'center',
    padding: '30px 10px 10px',
  },
  successGlyph: {
    width: 52,
    height: 52,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #f5d06a, #f5a623)',
    color: '#0a1220',
    fontSize: 24,
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 18px',
  },
  successTitle: {
    fontFamily: "'Fraunces', serif",
    fontSize: 26,
    color: '#f2f6ff',
    margin: '0 0 8px',
  },
  successText: { color: '#9fb8d9', fontSize: 14, marginBottom: 22 },
}

const fieldStyles = {
  wrap: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 11,
    letterSpacing: 0.4,
    color: '#7aa8e0',
  },
}