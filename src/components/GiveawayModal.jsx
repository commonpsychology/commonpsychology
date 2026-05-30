// src/components/GiveawayModal.jsx

// Props:
//   onClose  — fn()       called when modal should close
//   user     — object     Supabase auth user ({ email, id, ... })
//
// Usage in FloatingActions:
//   {popup === 'giveaway' && <GiveawayModal onClose={() => setPopup(null)} user={user} />}

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

// ── Supabase client ─────────────────────────────────────────
// Replace with your actual Supabase project URL and anon key
const SUPABASE_URL  ='https://agtzdsoadxzxmzwtifjw.supabase.co'
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFndHpkc29hZHh6eG16d3RpZmp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0Mzc4NDUsImV4cCI6MjA4OTAxMzg0NX0.hqTBnNzP6sdlbMNxk32P0iwvwVupunHHfhfleJv4FhM'
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON)

// ── Colour tokens — same dark family ───────────────────────
const C = {
  gold:      '#F5B942',
  goldDeep:  '#C8871A',
  goldGlow:  'rgba(245,185,66,0.22)',
  goldBorder:'rgba(245,185,66,0.28)',
  text:      'rgba(200,230,255,0.9)',
  muted:     'rgba(160,210,255,0.55)',
  bg:        '#0a1628',
  red:       '#ef4444',
  amber:     '#f59e0b',
  green:     '#22c55e',
}

// ── Unique ticket generator ─────────────────────────────────
function generateTicketNumber() {
  const ts   = Date.now().toString(36).toUpperCase()
  const rand = Math.random().toString(36).substring(2, 7).toUpperCase()
  return `GW-${ts}-${rand}`
}

// ── Reusable field component ────────────────────────────────
function Field({ label, required, error, children }) {
  return (
    <div style={{ marginBottom: '0.95rem' }}>
      <label style={{
        display: 'block',
        fontSize: '0.65rem',
        fontWeight: 800,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: error ? C.red : C.muted,
        marginBottom: '0.35rem',
      }}>
        {label}
        {required && <span style={{ color: C.amber, marginLeft: 3 }}>*</span>}
      </label>
      {children}
      {error && (
        <div style={{ fontSize: '0.68rem', color: C.red, marginTop: '0.3rem' }}>{error}</div>
      )}
    </div>
  )
}

const inputStyle = (hasErr) => ({
  width: '100%',
  boxSizing: 'border-box',
  padding: '0.6rem 0.85rem',
  background: 'rgb(6,6,6)',
  border: `1.5px solid ${hasErr ? C.red : 'rgba(245,185,66,0.18)'}`,
  borderRadius: 10,
  color: 'white',
  fontSize: '0.85rem',
  outline: 'none',
  fontFamily: 'inherit',
  transition: 'border-color 0.15s',
})

// ── Ticket stub shown after success ────────────────────────
function SuccessScreen({ ticketNumber, giveawayName, onClose }) {
  return (
    <div style={{ padding: '2.5rem 2rem', textAlign: 'center' }}>
      {/* Confetti-ish burst */}
      <div style={{
        fontSize: '2.8rem',
        marginBottom: '0.75rem',
        animation: 'gw-pop 0.5s cubic-bezier(0.34,1.56,0.64,1) both',
      }}>🎉</div>

      <h3 style={{ color: 'white', fontWeight: 800, fontSize: '1.15rem', margin: '0 0 0.4rem' }}>
        You're in the draw!
      </h3>
      <p style={{ color: C.text, fontSize: '0.82rem', lineHeight: 1.7, margin: '0 0 1.5rem' }}>
        You've been registered for <strong style={{ color: 'white' }}>{giveawayName}</strong>.
        Keep this ticket number safe — you'll need it if you win!
      </p>

      {/* Ticket stub */}
      <div style={{
        background: 'rgba(245,185,66,0.08)',
        border: '1.5px dashed rgba(245,185,66,0.45)',
        borderRadius: 14,
        padding: '1rem 1.25rem',
        marginBottom: '1.75rem',
        display: 'inline-block',
        minWidth: 240,
      }}>
        <p style={{ fontSize: '0.6rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.gold, margin: '0 0 6px' }}>
          🎟 Your Ticket Number
        </p>
        <p style={{
          fontFamily: 'monospace',
          fontSize: '1.05rem',
          fontWeight: 700,
          color: 'white',
          letterSpacing: '0.08em',
          margin: 0,
          wordBreak: 'break-all',
        }}>
          {ticketNumber}
        </p>
      </div>

      <br />
      <button
        onClick={onClose}
        style={{
          padding: '0.75rem 2rem',
          background: `linear-gradient(135deg,${C.goldDeep},${C.gold})`,
          border: 'none',
          borderRadius: 100,
          color: '#1a0f00',
          fontWeight: 800,
          fontSize: '0.85rem',
          cursor: 'pointer',
          fontFamily: 'inherit',
        }}
      >
        Done
      </button>
    </div>
  )
}

// ── Main modal ──────────────────────────────────────────────
export default function GiveawayModal({ onClose, user }) {
  const [form, setForm] = useState({
    full_name:   '',
    email:       user?.email || '',
    phone:       '',
    district:    '',
    age:         '',
    sex:         '',
    why_deserve: '',
  })
  const [fieldErrors, setFieldErrors] = useState({})
  const [submitting,  setSubmitting]  = useState(false)
  const [serverError, setServerError] = useState('')
  const [submitted,   setSubmitted]   = useState(false)
  const [ticketNumber, setTicketNumber] = useState('')

  // Current giveaway info — customise or load from Supabase
  const GIVEAWAY_NAME = 'Common Psychology Giveaway 2025'
  const GIVEAWAY_ID   = 'giveaway-2025-q3'   // a stable slug for this round
  const PRIZE_DESC    = '🏆 Win a free one-on-one counselling session + wellness kit worth NPR 5,000!'

  // Lock body scroll + Escape key
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }))
    setFieldErrors(fe => ({ ...fe, [field]: '' }))
    setServerError('')
  }

  function validate() {
    const errs = {}
    if (!form.full_name.trim()) errs.full_name = 'Full name is required.'
    if (!form.email.trim())     errs.email     = 'Email is required.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errs.email = 'Enter a valid email.'
    if (!form.phone.trim())     errs.phone     = 'Phone number is required.'
    if (form.age && (isNaN(Number(form.age)) || Number(form.age) < 1 || Number(form.age) > 120)) {
      errs.age = 'Age must be between 1 and 120.'
    }
    return errs
  }

  async function handleSubmit() {
    const errs = validate()
    if (Object.keys(errs).length) { setFieldErrors(errs); return }

    setSubmitting(true)
    setServerError('')

    const ticket = generateTicketNumber()

    try {
      const payload = {
        ticket_number:  ticket,
        giveaway_id:    GIVEAWAY_ID,
        giveaway_name:  GIVEAWAY_NAME,
        full_name:      form.full_name.trim(),
        email:          form.email.trim().toLowerCase(),
        phone:          form.phone.trim(),
        district:       form.district.trim() || null,
        age:            form.age ? Number(form.age) : null,
        sex:            form.sex || null,
        why_deserve:    form.why_deserve.trim() || null,
        user_id:        user?.id || null,        // Supabase auth UID if logged in
        registered_at:  new Date().toISOString(),
      }

      const { error } = await supabase
        .from('giveaway')
        .insert([payload])

      if (error) {
        // Unique constraint on email+giveaway_id gives code 23505
        if (error.code === '23505') {
          setServerError('You have already entered this giveaway with this email address.')
        } else {
          setServerError(error.message || 'Registration failed. Please try again.')
        }
        return
      }

      setTicketNumber(ticket)
      setSubmitted(true)
    } catch (err) {
      setServerError('Network error. Please check your connection and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      {/* One-shot keyframe for the success emoji pop */}
      <style>{`
        @keyframes gw-pop {
          from { transform: scale(0) rotate(-20deg); opacity: 0; }
          to   { transform: scale(1) rotate(0deg);   opacity: 1; }
        }
        @keyframes gw-shimmer {
          0%,100% { opacity: 0.7; }
          50%     { opacity: 1;   }
        }
      `}</style>

      <div
        onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,10,20,0.72)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          zIndex: 10001,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 16,
          animation: 'popup-overlay-in 0.22s ease both',
        }}
      >
        <div style={{
          position: 'relative',
          width: 'min(520px,96vw)',
          maxHeight: '92vh',
          borderRadius: 22,
          overflow: 'hidden',
          background: C.bg,
          boxShadow: `0 32px 80px rgba(0,0,0,0.55), 0 0 0 1.5px ${C.goldBorder}, inset 0 1px 0 rgba(255,255,255,0.07)`,
          display: 'flex', flexDirection: 'column',
          animation: 'popup-card-in 0.32s cubic-bezier(0.34,1.56,0.64,1) both',
        }}>

          {/* ── Header ── */}
          <div style={{
            padding: '16px 18px 14px',
            background: 'linear-gradient(180deg,rgba(7,18,38,0.97) 60%,transparent 100%)',
            display: 'flex', alignItems: 'center', gap: 10,
            borderBottom: `1px solid ${C.goldBorder}`,
            flexShrink: 0,
          }}>
            {/* Gold pulse dot */}
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              background: C.gold,
              boxShadow: `0 0 8px ${C.gold}`,
              flexShrink: 0,
              animation: 'gw-shimmer 1.6s ease-in-out infinite',
            }}/>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(245,185,66,0.75)', margin: '0 0 2px' }}>
                ✨ Limited Entry
              </p>
              <h2 style={{ color: 'white', margin: 0, fontSize: '1.05rem', fontWeight: 800, lineHeight: 1.2 }}>
                Enter the Giveaway
              </h2>
              <p style={{ fontSize: '0.68rem', color: 'rgba(245,185,66,0.6)', margin: '2px 0 0' }}>
                {PRIZE_DESC}
              </p>
            </div>
            <button
              onClick={onClose}
              style={{
                width: 34, height: 34, borderRadius: '50%',
                background: 'linear-gradient(135deg,#dc2626,#ef4444)',
                border: '1.5px solid rgba(255,100,100,0.5)',
                color: 'white', fontSize: '1rem', fontWeight: 700,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, lineHeight: 1,
                boxShadow: '0 3px 14px rgba(220,38,38,0.5)',
                transition: 'all 0.18s', outline: 'none',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1) rotate(90deg)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none' }}
              aria-label="Close"
            >✕</button>
          </div>

          {/* ── Body ── */}
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {submitted ? (
              <SuccessScreen
                ticketNumber={ticketNumber}
                giveawayName={GIVEAWAY_NAME}
                onClose={onClose}
              />
            ) : (
              <div style={{ padding: '1.25rem 1.5rem 1.5rem' }}>

                {/* Logged-in notice */}
                {user?.email && (
                  <div style={{
                    background: C.goldGlow,
                    border: `1px solid ${C.goldBorder}`,
                    borderRadius: 10,
                    padding: '0.6rem 0.9rem',
                    marginBottom: '1.1rem',
                    fontSize: '0.73rem',
                    color: 'rgba(245,185,66,0.85)',
                    display: 'flex', gap: 8, alignItems: 'center',
                  }}>
                    <span>⚡</span>
                    <span>Signed in as <strong style={{ color: C.gold }}>{user.email}</strong> — email pre-filled</span>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>

                  {/* Full name — full width */}
                  <div style={{ gridColumn: '1/-1' }}>
                    <Field label="Full Name" required error={fieldErrors.full_name}>
                      <input
                        type="text"
                        placeholder="Your full name"
                        value={form.full_name}
                        onChange={e => set('full_name', e.target.value)}
                        style={inputStyle(!!fieldErrors.full_name)}
                      />
                    </Field>
                  </div>

                  {/* Email — full width, pre-filled & locked if logged in */}
                  <div style={{ gridColumn: '1/-1' }}>
                    <Field label="Email Address" required error={fieldErrors.email}>
                      <div style={{ position: 'relative' }}>
                        <input
                          type="email"
                          placeholder="you@example.com"
                          value={form.email}
                          onChange={e => set('email', e.target.value)}
                          readOnly={!!user?.email}
                          style={{
                            ...inputStyle(!!fieldErrors.email),
                            paddingRight: user?.email ? '2.8rem' : undefined,
                            opacity: user?.email ? 0.8 : 1,
                            cursor:  user?.email ? 'not-allowed' : 'text',
                          }}
                        />
                        {user?.email && (
                          <span style={{
                            position: 'absolute', right: 12, top: '50%',
                            transform: 'translateY(-50%)',
                            fontSize: '0.7rem', color: C.gold, userSelect: 'none',
                          }}>🔒</span>
                        )}
                      </div>
                    </Field>
                  </div>

                  {/* Phone */}
                  <Field label="Phone Number" required error={fieldErrors.phone}>
                    <input
                      type="tel"
                      placeholder="+977 98XXXXXXXX"
                      value={form.phone}
                      onChange={e => set('phone', e.target.value)}
                      style={inputStyle(!!fieldErrors.phone)}
                    />
                  </Field>

                  {/* District */}
                  <Field label="District" error={fieldErrors.district}>
                    <input
                      type="text"
                      placeholder="Your district"
                      value={form.district}
                      onChange={e => set('district', e.target.value)}
                      style={inputStyle(false)}
                    />
                  </Field>

                  {/* Age */}
                  <Field label="Age" error={fieldErrors.age}>
                    <input
                      type="number"
                      placeholder="e.g. 25"
                      min={1} max={120}
                      value={form.age}
                      onChange={e => set('age', e.target.value)}
                      style={inputStyle(!!fieldErrors.age)}
                    />
                  </Field>

                  {/* Sex */}
                  <Field label="Sex" error={fieldErrors.sex}>
                    <select
                      value={form.sex}
                      onChange={e => set('sex', e.target.value)}
                      style={{ ...inputStyle(false), cursor: 'pointer' }}
                    >
                      <option value="">Select…</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="prefer_not_to_say">Prefer not to say</option>
                    </select>
                  </Field>

                  {/* Why do you deserve this — full width, optional */}
                  <div style={{ gridColumn: '1/-1' }}>
                    <Field label="Why do you want to win? (optional)" error={fieldErrors.why_deserve}>
                      <textarea
                        placeholder="Tell us a little about yourself or why this prize matters to you…"
                        rows={3}
                        value={form.why_deserve}
                        onChange={e => set('why_deserve', e.target.value)}
                        style={{ ...inputStyle(false), resize: 'vertical', minHeight: 72 }}
                      />
                    </Field>
                  </div>

                </div>

                {/* Server error */}
                {serverError && (
                  <div style={{
                    background: 'rgba(239,68,68,0.1)',
                    border: '1.5px solid rgba(239,68,68,0.35)',
                    borderRadius: 10,
                    padding: '0.75rem 1rem',
                    marginBottom: '1rem',
                    fontSize: '0.82rem',
                    color: '#fca5a5',
                    lineHeight: 1.6,
                  }}>
                    ⚠ {serverError}
                  </div>
                )}

                {/* Submit */}
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  style={{
                    width: '100%',
                    padding: '0.85rem',
                    background: submitting
                      ? 'rgba(245,185,66,0.25)'
                      : `linear-gradient(135deg,${C.goldDeep},${C.gold})`,
                    border: 'none',
                    borderRadius: 12,
                    color: submitting ? 'rgba(255,220,100,0.6)' : '#1a0f00',
                    fontWeight: 800,
                    fontSize: '0.9rem',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    fontFamily: 'inherit',
                    transition: 'all 0.15s',
                    opacity: submitting ? 0.7 : 1,
                  }}
                >
                  {submitting ? 'Entering…' : '🎟 Enter Giveaway →'}
                </button>

                <p style={{ fontSize: '0.65rem', color: C.muted, textAlign: 'center', marginTop: '0.75rem', lineHeight: 1.6 }}>
                  One entry per person. Duplicate emails will be rejected. Winner notified by email.
                </p>

              </div>
            )}
          </div>

        </div>
      </div>
    </>
  )
}