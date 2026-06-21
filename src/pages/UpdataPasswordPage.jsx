import { useState, useEffect, useRef } from 'react'

/* ----------------------------------------------------------------
   Design tokens — "Tidal" system
   A deep-to-bright blue gradient world, paired with a warm ivory
   surface so the blue reads as water against shore, not as a
   generic SaaS gradient. Display serif for headlines (a quiet
   nod to ink on water), a clean grotesk for body/UI.
------------------------------------------------------------------ */
const C = {
  abyss:    '#04263F',   // deepest water, headline color on light bg
  deep:     '#0A4D78',
  mid:      '#0E78AC',
  bright:   '#15A6D6',
  foam:     '#7FDDEE',
  sand:     '#FBF7EE',   // warm ivory surface (the "shore")
  sandDeep: '#F1EADA',
  sandLine: '#E4DBC4',
  ink:      '#0F2A38',
  inkSoft:  '#4A6B78',
  inkFaint: '#8FA9B2',
  white:    '#FFFFFF',
  coral:    '#E0654A',   // sole warm accent for error/alert states
  kelp:     '#1F9D6F',   // success
}

const waterGrad   = `linear-gradient(160deg, ${C.abyss} 0%, ${C.deep} 38%, ${C.mid} 68%, ${C.bright} 100%)`
const buttonGrad  = `linear-gradient(135deg, ${C.deep} 0%, ${C.mid} 100%)`
const displayFont = `'Fraunces', 'Iowan Old Style', 'Palatino Linotype', Georgia, serif`
const bodyFont    = `'Inter', 'Helvetica Neue', Arial, sans-serif`
const monoFont    = `'IBM Plex Mono', 'SF Mono', Menlo, monospace`

const FontImports = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@500&display=swap');
    * { box-sizing: border-box; }
    @keyframes drift {
      0%   { transform: translateX(0) translateY(0); }
      50%  { transform: translateX(-6px) translateY(3px); }
      100% { transform: translateX(0) translateY(0); }
    }
    @keyframes riseIn {
      from { opacity: 0; transform: translateY(14px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes waterFill {
      from { transform: scaleY(0); }
      to   { transform: scaleY(1); }
    }
    .twp-field:focus { outline: none; }
    .twp-card { animation: riseIn 0.55s cubic-bezier(.2,.8,.2,1) both; }
    @media (prefers-reduced-motion: reduce) {
      .twp-card { animation: none; }
      .twp-wave { animation: none !important; }
    }
  `}</style>
)

/* ---------------- Tide gauge — the signature element ----------------
   A vertical water vessel that fills with an actual animated water
   surface as password strength increases. Replaces the generic
   four-segment bar with something literal to the "Tidal" concept. */

function strengthOf(pw) {
  let s = 0
  if (pw.length >= 8) s++
  if (pw.length >= 12) s++
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++
  if (/[0-9]/.test(pw)) s++
  if (/[^A-Za-z0-9]/.test(pw)) s++
  return Math.min(s, 4)
}

const TIDE_LABELS  = ['Shallow', 'Shallow', 'Rising', 'Deep', 'High Tide']
const TIDE_COLORS  = [C.inkFaint, C.coral, '#D9A441', C.mid, C.kelp]

function TideGauge({ password }) {
  const score = strengthOf(password)
  const pct = password ? [8, 30, 55, 78, 100][score] : 0

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', margin: '0.85rem 0 1.5rem' }}>
      <div style={{
        position: 'relative', width: 30, height: 46, borderRadius: '6px 6px 9px 9px',
        border: `2px solid ${C.sandLine}`, overflow: 'hidden', background: C.white, flexShrink: 0,
      }}>
        <div className="twp-wave" style={{
          position: 'absolute', left: -4, right: -4, bottom: 0,
          height: `${pct}%`, transformOrigin: 'bottom',
          animation: password ? 'waterFill 0.5s cubic-bezier(.2,.8,.2,1) both' : 'none',
          background: `linear-gradient(180deg, ${TIDE_COLORS[score]}cc, ${TIDE_COLORS[score]})`,
          transition: 'height 0.45s cubic-bezier(.2,.8,.2,1), background 0.3s',
        }}>
          <div style={{
            position: 'absolute', top: -3, left: 0, right: 0, height: 6,
            background: `radial-gradient(ellipse at 30% 50%, ${C.white}55, transparent 70%)`,
          }} />
        </div>
      </div>
      <div>
        <div style={{
          fontFamily: monoFont, fontSize: '0.66rem', fontWeight: 500, letterSpacing: '0.08em',
          textTransform: 'uppercase', color: password ? TIDE_COLORS[score] : C.inkFaint,
          transition: 'color 0.3s', marginBottom: '0.2rem',
        }}>
          {password ? TIDE_LABELS[score] : 'Enter a password'}
        </div>
        <div style={{ fontFamily: bodyFont, fontSize: '0.78rem', color: C.inkSoft, lineHeight: 1.5 }}>
          {password
            ? ['Add length and variety to rise further.', 'Try mixing in a number or symbol.', 'Good — a longer phrase would help.', 'Strong. One more touch reaches high tide.', 'Excellent depth of protection.'][score]
            : 'The gauge fills as your password gets stronger.'}
        </div>
      </div>
    </div>
  )
}

/* ---------------------- Password input ---------------------- */

function PasswordField({ label, value, onChange, placeholder, hint }) {
  const [show, setShow] = useState(false)
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ marginBottom: '1.3rem' }}>
      <label style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
        fontFamily: bodyFont, fontSize: '0.74rem', fontWeight: 700, color: C.ink,
        marginBottom: '0.5rem', letterSpacing: '0.01em',
      }}>
        <span>{label}</span>
        {hint && <span style={{ fontFamily: bodyFont, fontWeight: 500, fontSize: '0.7rem', color: C.inkFaint }}>{hint}</span>}
      </label>
      <div style={{ position: 'relative' }}>
        <input
          className="twp-field"
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: '100%', padding: '0.9rem 3rem 0.9rem 1.05rem',
            border: `1.5px solid ${focused ? C.mid : C.sandLine}`,
            borderRadius: 10, fontFamily: bodyFont, fontSize: '0.95rem',
            color: C.ink, background: focused ? C.white : C.sand,
            boxShadow: focused ? `0 0 0 4px ${C.mid}1a` : 'none',
            transition: 'all 0.18s ease',
          }}
        />
        <button
          type="button"
          onClick={() => setShow(s => !s)}
          aria-label={show ? 'Hide password' : 'Show password'}
          style={{
            position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
            background: 'none', border: 'none', cursor: 'pointer', padding: '0.4rem',
            color: C.inkFaint, display: 'flex', alignItems: 'center',
          }}
        >
          {show ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a18.6 18.6 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 7 11 7a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/></svg>
          )}
        </button>
      </div>
    </div>
  )
}

/* ---------------------- Success state ---------------------- */

function SuccessView({ onDone }) {
  return (
    <div style={{ minHeight: '100vh', background: C.sand, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
      <FontImports />
      <div className="twp-card" style={{
        maxWidth: 440, width: '100%', background: C.white, borderRadius: 20,
        border: `1px solid ${C.sandLine}`, boxShadow: '0 24px 60px -16px rgba(10,77,120,0.18)',
        overflow: 'hidden', textAlign: 'center',
      }}>
        <div style={{ height: 5, background: waterGrad }} />
        <div style={{ padding: '3.2rem 2.5rem' }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%', margin: '0 auto 1.6rem',
            background: waterGrad, display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 10px 30px -8px rgba(10,77,120,0.45)',
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5"/>
            </svg>
          </div>
          <h2 style={{ fontFamily: displayFont, fontSize: '1.7rem', fontWeight: 600, color: C.abyss, marginBottom: '0.6rem' }}>
            Password updated
          </h2>
          <p style={{ fontFamily: bodyFont, fontSize: '0.92rem', color: C.inkSoft, lineHeight: 1.7, marginBottom: '2.1rem' }}>
            Your new password is active. Use it the next time you sign in.
          </p>
          <button
            onClick={onDone}
            style={{
              width: '100%', padding: '0.9rem', borderRadius: 10, border: 'none',
              background: buttonGrad, color: 'white', fontFamily: bodyFont,
              fontWeight: 700, fontSize: '0.92rem', cursor: 'pointer',
              boxShadow: '0 8px 24px -6px rgba(10,77,120,0.45)',
            }}
          >
            Back to account
          </button>
        </div>
      </div>
    </div>
  )
}

/* ---------------------- Main page ---------------------- */

export default function UpdatePasswordPage({ onNavigate = () => {} }) {
  const [form, setForm] = useState({ current: '', next: '', confirm: '' })
  const [status, setStatus] = useState('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const upForm = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const passwordsMatch = form.next && form.next === form.confirm
  const formOK = form.current && form.next.length >= 8 && passwordsMatch

  async function handleSubmit() {
    if (!formOK || status === 'saving') return
    setStatus('saving')
    setErrorMsg('')
    try {
      // await passwordApi.update(form.current, form.next)
      await new Promise((res, rej) => setTimeout(() => res(), 900))
      setStatus('success')
    } catch (err) {
      setStatus('error')
      setErrorMsg(err?.message || 'Could not update your password. Please try again.')
    }
  }

  if (status === 'success') {
    return <SuccessView onDone={() => onNavigate('/account')} />
  }

  return (
    <div style={{ minHeight: '100vh', background: C.sand }}>
      <FontImports />

      {/* ---------- Hero ---------- */}
      <div style={{ position: 'relative', background: waterGrad, padding: '4.2rem 1.5rem 6.5rem', overflow: 'hidden' }}>
        {/* drifting light texture, decorative only */}
        <div className="twp-wave" style={{
          position: 'absolute', top: -120, right: -100, width: 360, height: 360, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.10), transparent 70%)',
          animation: 'drift 9s ease-in-out infinite',
        }} />
        <div className="twp-wave" style={{
          position: 'absolute', bottom: -140, left: -80, width: 320, height: 320, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(127,221,238,0.16), transparent 70%)',
          animation: 'drift 11s ease-in-out infinite reverse',
        }} />

        <div style={{ maxWidth: 600, margin: '0 auto', position: 'relative' }}>
          <button
            onClick={() => onNavigate('/account')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.22)',
              color: 'rgba(255,255,255,0.92)', borderRadius: 100, padding: '0.4rem 1.1rem 0.4rem 0.85rem',
              fontFamily: bodyFont, fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
              marginBottom: '2rem', backdropFilter: 'blur(6px)',
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Account
          </button>

          <div style={{
            fontFamily: monoFont, fontSize: '0.7rem', fontWeight: 500, letterSpacing: '0.16em',
            textTransform: 'uppercase', color: C.foam, marginBottom: '0.9rem',
          }}>
            Account security
          </div>
          <h1 style={{
            fontFamily: displayFont, fontSize: 'clamp(2rem, 4.4vw, 2.7rem)', fontWeight: 600,
            color: 'white', lineHeight: 1.12, marginBottom: '0.85rem', maxWidth: 420,
          }}>
            Update your password
          </h1>
          <p style={{ fontFamily: bodyFont, fontSize: '0.95rem', color: 'rgba(255,255,255,0.78)', maxWidth: 380, lineHeight: 1.65 }}>
            A strong, unique password is your first line of defense. This change applies the moment you save it.
          </p>
        </div>
      </div>

      {/* ---------- Form card, overlapping the hero ---------- */}
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '0 1.5rem 5rem', marginTop: '-3.6rem', position: 'relative' }}>
        <div className="twp-card" style={{
          background: C.white, borderRadius: 18,
          border: `1px solid ${C.sandLine}`,
          boxShadow: '0 30px 70px -20px rgba(10,38,63,0.22)',
          overflow: 'hidden',
        }}>
          <div style={{ padding: '2.4rem 2.2rem 2.2rem' }}>

            {status === 'error' && (
              <div style={{
                background: '#FDF1EE', border: `1.5px solid ${C.coral}55`, borderRadius: 10,
                padding: '0.9rem 1.05rem', marginBottom: '1.5rem',
                display: 'flex', alignItems: 'flex-start', gap: '0.7rem',
              }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={C.coral} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <span style={{ fontFamily: bodyFont, fontSize: '0.85rem', color: '#9B3A26', fontWeight: 600, lineHeight: 1.5 }}>{errorMsg}</span>
              </div>
            )}

            <PasswordField
              label="Current password"
              value={form.current}
              onChange={e => { upForm('current', e.target.value); setStatus('idle') }}
              placeholder="Enter your current password"
            />

            <div style={{ height: 1, background: C.sandLine, margin: '0.3rem 0 1.6rem' }} />

            <PasswordField
              label="New password"
              value={form.next}
              onChange={e => upForm('next', e.target.value)}
              placeholder="At least 8 characters"
              hint={`${form.next.length} chars`}
            />
            <TideGauge password={form.next} />

            <PasswordField
              label="Confirm new password"
              value={form.confirm}
              onChange={e => upForm('confirm', e.target.value)}
              placeholder="Re-enter new password"
            />

            {form.confirm && (
              <div style={{
                marginBottom: '0.4rem', marginTop: '-0.7rem', display: 'flex', alignItems: 'center', gap: '0.4rem',
                fontFamily: bodyFont, fontSize: '0.8rem', fontWeight: 600,
                color: passwordsMatch ? C.kelp : C.coral,
              }}>
                {passwordsMatch ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                )}
                {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
              </div>
            )}

            {/* Tips, restyled as a quiet checklist rather than a boxed callout */}
            <div style={{ margin: '1.7rem 0 0.4rem', padding: '1rem 1.1rem', background: C.sand, borderRadius: 10, border: `1px solid ${C.sandLine}` }}>
              <div style={{ fontFamily: monoFont, fontSize: '0.64rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.inkFaint, marginBottom: '0.65rem' }}>
                For a deeper tide
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem 1rem' }}>
                {[
                  ['8+ characters', form.next.length >= 8],
                  ['Upper & lowercase', /[A-Z]/.test(form.next) && /[a-z]/.test(form.next)],
                  ['A number', /[0-9]/.test(form.next)],
                  ['A symbol', /[^A-Za-z0-9]/.test(form.next)],
                ].map(([label, met]) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <span style={{
                      width: 14, height: 14, borderRadius: '50%', flexShrink: 0,
                      border: `1.5px solid ${met ? C.kelp : C.sandLine}`,
                      background: met ? C.kelp : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.2s',
                    }}>
                      {met && <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>}
                    </span>
                    <span style={{ fontFamily: bodyFont, fontSize: '0.79rem', color: met ? C.ink : C.inkSoft, fontWeight: met ? 600 : 500 }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ textAlign: 'center', margin: '1.5rem 0 0.3rem' }}>
              <button
                onClick={() => onNavigate('/forgot-password')}
                style={{ background: 'none', border: 'none', color: C.mid, fontFamily: bodyFont, fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}
              >
                Forgot your current password instead?
              </button>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!formOK || status === 'saving'}
              style={{
                width: '100%', padding: '0.95rem', borderRadius: 10, border: 'none',
                marginTop: '0.6rem',
                background: formOK ? buttonGrad : C.sandDeep,
                color: formOK ? 'white' : C.inkFaint,
                fontFamily: bodyFont, fontWeight: 700, fontSize: '0.95rem',
                cursor: formOK && status !== 'saving' ? 'pointer' : 'not-allowed',
                boxShadow: formOK ? '0 10px 28px -8px rgba(10,77,120,0.5)' : 'none',
                transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              }}
            >
              {status === 'saving' ? 'Updating…' : 'Update password'}
            </button>

          </div>
        </div>
      </div>
    </div>
  )
}