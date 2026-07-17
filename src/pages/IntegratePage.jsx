// IntegratePage.jsx
// Route this at /integrate (e.g. React Router: <Route path="/integrate" element={<IntegratePage />} />)
//
// This posts to your existing backend (same pattern as AuthContext's loginRaw),
// which does the actual Supabase write server-side with the service-role key.
// See integrateController.js / integrateRoutes.js for that side.
//
// Needs:
//   - /watermark.png     (the "eyes covered" community mark — put it in /public)
//   - /payment-qr.png    (your payment QR code — put it in /public)
//
// Design: light blue-white glass, matching the app's existing signin-card /
// header language (rgba(255,255,255,..) + rgba(214,238,252,..) gradient,
// backdrop-blur, glossy rgba(0,191,255,..) highlights) rather than a separate
// dark theme — so this page feels native to the rest of the product.

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
          background: rgba(255, 255, 255, 0.55);
          border: 1.5px solid rgba(255, 255, 255, 0.7);
          border-radius: 10px;
          padding: 12px 14px;
          color: #0f3050;
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          outline: none;
          box-shadow: inset 0 1px 2px rgba(14,165,233,0.06);
          transition: border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
        }
        .integrate-input::placeholder { color: #7ba3c4; }
        .integrate-input:focus {
          border-color: #00bfff;
          background: rgba(255, 255, 255, 0.85);
          box-shadow: 0 0 0 3px rgba(0,191,255,0.14);
        }
        .integrate-input.has-error { border-color: #e2694f; }

        .integrate-select {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%2300a8d8'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 14px center;
        }

        .integrate-btn {
          font-family: 'Inter', sans-serif;
          font-weight: 700;
          font-size: 15px;
          letter-spacing: 0.2px;
          color: #ffffff;
          background: linear-gradient(160deg, #4fd6ff 0%, #00bfff 55%, #0ea5e9 100%);
          border: 1px solid rgba(255,255,255,0.55);
          border-radius: 999px;
          padding: 14px 28px;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          box-shadow: 0 8px 26px rgba(0,191,255,0.32), inset 0 1px 0 rgba(255,255,255,0.65), inset 0 -1px 0 rgba(255,255,255,0.12);
          transition: transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease;
        }
        .integrate-btn:hover { transform: translateY(-1px); box-shadow: 0 12px 30px rgba(0,191,255,0.4), inset 0 1px 0 rgba(255,255,255,0.7); }
        .integrate-btn:active { transform: translateY(0); }
        .integrate-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

        .integrate-field-error {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11.5px;
          color: #d9563d;
          margin-top: 5px;
        }

        @media (max-width: 860px) {
          .integrate-grid { grid-template-columns: 1fr !important; }
          .integrate-qr-col { order: -1; }
        }
      `}</style>

      {/* Ambient gradient orbs */}
      <div style={styles.orbBlue} />
      <div style={styles.orbSky} />

      {/* Background watermark */}
      <img
        src="/watermark.png"
        alt=""
        aria-hidden="true"
        style={styles.watermark}
      />

      <main style={styles.card}>
        {/* glossy diagonal shine, matching the rest of the app's glass surfaces */}
        <div style={styles.shine} />

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
                <img src="/payment-qr.png" alt="Payment QR code" style={styles.qrImg} />
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
    background: 'linear-gradient(175deg, #eef8ff 0%, #dff1fb 35%, #f3fbff 70%, #ffffff 100%)',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    // Generous top padding so this doesn't butt up against a fixed/sticky header —
    // tune the clamp() max if your header is taller/shorter than ~96px.
    padding: 'clamp(6.5rem, 14vh, 9rem) 20px 64px',
    overflow: 'hidden',
    fontFamily: "'Inter', sans-serif",
  },
  orbBlue: {
    position: 'absolute',
    top: '-8%',
    left: '-10%',
    width: 440,
    height: 440,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(0,191,255,0.16), transparent 70%)',
    filter: 'blur(6px)',
    pointerEvents: 'none',
  },
  orbSky: {
    position: 'absolute',
    bottom: '-12%',
    right: '-8%',
    width: 400,
    height: 400,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(214,238,252,0.9), transparent 70%)',
    filter: 'blur(6px)',
    pointerEvents: 'none',
  },
  watermark: {
    position: 'absolute',
    right: '-6%',
    bottom: '-6%',
    width: 560,
    maxWidth: '70vw',
    opacity: 0.05,
    filter: 'grayscale(1)',
    pointerEvents: 'none',
    userSelect: 'none',
  },
  card: {
    position: 'relative',
    width: '100%',
    maxWidth: 860,
    background: 'linear-gradient(160deg, rgba(255,255,255,0.75) 0%, rgba(214,238,252,0.55) 55%, rgba(255,255,255,0.7) 100%)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(255,255,255,0.6)',
    borderRadius: 24,
    boxShadow: '0 8px 30px rgba(0,123,168,0.14), inset 0 1px 0 rgba(255,255,255,0.65), inset 0 -1px 0 rgba(255,255,255,0.12)',
    padding: '40px 36px 36px',
    overflow: 'hidden',
  },
  shine: {
    position: 'absolute',
    top: '-60%',
    left: '-20%',
    width: '70%',
    height: '220%',
    background: 'linear-gradient(115deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0) 55%)',
    transform: 'rotate(8deg)',
    pointerEvents: 'none',
  },
  header: { marginBottom: 30, textAlign: 'center', position: 'relative' },
  eyebrow: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 11.5,
    letterSpacing: 1.5,
    color: '#0284c7',
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  title: {
    fontFamily: "'Fraunces', serif",
    fontWeight: 600,
    fontSize: 'clamp(32px, 5vw, 44px)',
    color: '#0c2d4d',
    margin: 0,
    letterSpacing: 0.2,
  },
  subtitle: {
    marginTop: 10,
    color: '#4c7595',
    fontSize: 14.5,
    maxWidth: 460,
    marginLeft: 'auto',
    marginRight: 'auto',
    lineHeight: 1.55,
  },
  grid: {
    position: 'relative',
    display: 'grid',
    gridTemplateColumns: '1.15fr 0.85fr',
    gap: 28,
    alignItems: 'start',
  },
  formCol: { display: 'flex', flexDirection: 'column', gap: 16 },
  row: { display: 'flex', gap: 14 },
  qrCol: { display: 'flex', flexDirection: 'column', gap: 14 },
  qrCard: {
    background: 'rgba(255, 255, 255, 0.55)',
    border: '1px solid rgba(255, 255, 255, 0.7)',
    borderRadius: 16,
    padding: 20,
    textAlign: 'center',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6)',
  },
  qrLabel: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 11,
    letterSpacing: 1,
    color: '#0284c7',
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
    boxShadow: '0 4px 16px rgba(0,123,168,0.12)',
  },
  qrHint: {
    fontSize: 12.5,
    color: '#5c85a3',
    marginTop: 12,
    marginBottom: 16,
    lineHeight: 1.5,
  },
  serverError: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 12,
    color: '#d9563d',
    textAlign: 'center',
    margin: 0,
  },
  successBox: {
    textAlign: 'center',
    padding: '30px 10px 10px',
    position: 'relative',
  },
  successGlyph: {
    width: 52,
    height: 52,
    borderRadius: '50%',
    background: 'linear-gradient(160deg, #4fd6ff 0%, #00bfff 55%, #0ea5e9 100%)',
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 18px',
    boxShadow: '0 8px 22px rgba(0,191,255,0.32)',
  },
  successTitle: {
    fontFamily: "'Fraunces', serif",
    fontSize: 26,
    color: '#0c2d4d',
    margin: '0 0 8px',
  },
  successText: { color: '#4c7595', fontSize: 14, marginBottom: 22 },
}

const fieldStyles = {
  wrap: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 11,
    letterSpacing: 0.4,
    color: '#0284c7',
  },
}