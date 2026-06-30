// src/pages/ContactPage.jsx
import { useState } from 'react'

const API = import.meta.env.VITE_API_URL || '${import.meta.env.VITE_API_URL}/api'

const CONTACT_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,560;0,9..144,640;1,9..144,500&family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');

  .cp2 {
    --cp-ocean: #0b3c49;
    --cp-ocean-deep: #082e38;
    --cp-sky: #5fa0b8;
    --cp-sand: #f6f0e3;
    --cp-sand-deep: #efe6d2;
    --cp-clay: #c4734c;
    --cp-clay-deep: #a85d3a;
    --cp-sage: #8fa888;
    --cp-ink: #1c2624;
    --cp-ink-soft: #4a5957;
    --font-display: 'Fraunces', Georgia, serif;
    --font-body: 'IBM Plex Sans', system-ui, sans-serif;
    --font-mono: 'IBM Plex Mono', monospace;
    background: var(--cp-sand);
    font-family: var(--font-body);
    color: var(--cp-ink);
  }

  .cp2 * { box-sizing: border-box; }

  .cp2-grid {
    display: grid;
    grid-template-columns: minmax(280px, 38%) 1fr;
    min-height: 100vh;
  }
  @media (max-width: 860px) {
    .cp2-grid { grid-template-columns: 1fr; }
  }

  /* ── Left panel ── */
  .cp2-panel {
    position: relative;
    background: radial-gradient(120% 140% at 20% 0%, var(--cp-ocean) 0%, var(--cp-ocean-deep) 70%);
    color: #f1ece0;
    padding: 4rem 3rem 3rem;
    overflow: hidden;
  }
  @media (min-width: 861px) {
    .cp2-panel { position: sticky; top: 0; height: 100vh; }
  }
  @media (max-width: 860px) {
    .cp2-panel { padding: 3rem 1.75rem 2.5rem; }
  }

  .cp2-eyebrow {
    font-family: var(--font-mono);
    font-size: 0.72rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--cp-sky);
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
  }
  .cp2-eyebrow::before {
    content: '';
    width: 6px; height: 6px;
    border-radius: 50%;
    background: var(--cp-clay);
    display: inline-block;
  }

  .cp2-h1 {
    font-family: var(--font-display);
    font-optical-sizing: auto;
    font-weight: 560;
    font-size: clamp(2.1rem, 4vw, 2.9rem);
    line-height: 1.08;
    margin: 1rem 0 1rem;
    color: #fbf8f1;
  }
  .cp2-h1 em {
    font-style: italic;
    font-weight: 500;
    color: var(--cp-sky);
  }

  .cp2-lede {
    font-size: 0.98rem;
    line-height: 1.7;
    color: rgba(241,236,224,0.78);
    max-width: 34ch;
    margin-bottom: 2.5rem;
  }

  /* breathing circle — signature element */
  .cp2-breathe-wrap {
    position: absolute;
    right: -6rem;
    bottom: -4rem;
    width: 320px;
    height: 320px;
    pointer-events: none;
  }
  @media (max-width: 860px) {
    .cp2-breathe-wrap { right: -7rem; bottom: -7rem; width: 240px; height: 240px; }
  }
  .cp2-breathe-ring {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    border: 1px solid rgba(95,160,184,0.35);
  }
  .cp2-breathe-ring.r2 { inset: 14%; border-color: rgba(95,160,184,0.5); }
  .cp2-breathe-ring.r3 {
    inset: 28%;
    background: radial-gradient(circle at 35% 30%, rgba(196,115,76,0.55), rgba(95,160,184,0.25) 70%);
    border: none;
    animation: cp2breathe 7s ease-in-out infinite;
  }
  @keyframes cp2breathe {
    0%, 100% { transform: scale(0.86); opacity: 0.75; }
    50% { transform: scale(1.04); opacity: 1; }
  }
  @media (prefers-reduced-motion: reduce) {
    .cp2-breathe-ring.r3 { animation: none; }
  }
  .cp2-breathe-label {
    position: absolute;
    left: 0;
    bottom: -1.6rem;
    font-family: var(--font-mono);
    font-size: 0.68rem;
    letter-spacing: 0.05em;
    color: rgba(241,236,224,0.5);
  }

  .cp2-info-list {
    display: flex;
    flex-direction: column;
    gap: 1.4rem;
    margin-top: 2.5rem;
    position: relative;
    z-index: 2;
  }
  .cp2-info-row { display: flex; gap: 0.9rem; align-items: flex-start; }
  .cp2-info-tag {
    font-family: var(--font-mono);
    font-size: 0.68rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--cp-sky);
    width: 4.6rem;
    flex-shrink: 0;
    padding-top: 0.2rem;
  }
  .cp2-info-val { font-size: 0.92rem; line-height: 1.5; color: #f1ece0; }

  .cp2-crisis {
    margin-top: 2.5rem;
    padding: 1.1rem 1.25rem;
    border-radius: 4px;
    background: rgba(143,168,136,0.16);
    border-left: 3px solid var(--cp-sage);
    position: relative;
    z-index: 2;
  }
  .cp2-crisis-title {
    font-family: var(--font-mono);
    font-size: 0.7rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--cp-sage);
    margin-bottom: 0.4rem;
  }
  .cp2-crisis p { font-size: 0.84rem; line-height: 1.6; color: rgba(241,236,224,0.85); margin: 0; }
  .cp2-crisis strong { color: #fbf8f1; }

  /* ── Right side ── */
  .cp2-right {
    padding: 4.5rem 4vw 5rem;
    display: flex;
    justify-content: center;
  }
  @media (max-width: 860px) {
    .cp2-right { padding: 2.5rem 1.5rem 4rem; }
  }

  .cp2-card {
    width: 100%;
    max-width: 560px;
    background: #fffdf9;
    border-radius: 6px;
    border: 1px solid var(--cp-sand-deep);
    box-shadow: 0 30px 60px -25px rgba(11,60,73,0.25);
    padding: 2.75rem 2.75rem 2.5rem;
  }
  @media (max-width: 500px) {
    .cp2-card { padding: 1.85rem 1.5rem 1.85rem; }
  }

  .cp2-card-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 0.4rem;
  }
  .cp2-card-title {
    font-family: var(--font-display);
    font-weight: 560;
    font-size: 1.5rem;
    color: var(--cp-ocean);
  }
  .cp2-card-meta {
    font-family: var(--font-mono);
    font-size: 0.7rem;
    color: var(--cp-clay-deep);
    white-space: nowrap;
  }
  .cp2-card-sub {
    font-size: 0.88rem;
    color: var(--cp-ink-soft);
    line-height: 1.6;
    margin-bottom: 2rem;
  }

  .cp2-field { margin-bottom: 1.3rem; }
  .cp2-row2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }
  @media (max-width: 500px) {
    .cp2-row2 { grid-template-columns: 1fr; }
  }

  .cp2-label {
    display: flex;
    justify-content: space-between;
    font-size: 0.78rem;
    font-weight: 600;
    color: var(--cp-ink);
    margin-bottom: 0.45rem;
  }
  .cp2-label .opt { font-weight: 400; color: var(--cp-ink-soft); font-size: 0.74rem; }

  .cp2-input, .cp2-select, .cp2-textarea {
    width: 100%;
    padding: 0.78rem 0.9rem;
    border: 1.5px solid var(--cp-sand-deep);
    border-radius: 4px;
    font-family: var(--font-body);
    font-size: 0.94rem;
    color: var(--cp-ink);
    background: #fff;
    outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .cp2-input:focus, .cp2-select:focus, .cp2-textarea:focus {
    border-color: var(--cp-sky);
    box-shadow: 0 0 0 3px rgba(95,160,184,0.18);
  }
  .cp2-textarea { resize: vertical; min-height: 110px; }

  .cp2-type-group {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  .cp2-type-pill {
    font-family: var(--font-mono);
    font-size: 0.74rem;
    padding: 0.5rem 0.85rem;
    border-radius: 999px;
    border: 1.5px solid var(--cp-sand-deep);
    background: #fff;
    color: var(--cp-ink-soft);
    cursor: pointer;
    transition: all 0.15s;
  }
  .cp2-type-pill.active {
    background: var(--cp-ocean);
    border-color: var(--cp-ocean);
    color: #fbf8f1;
  }
  .cp2-type-pill:focus-visible { outline: 2px solid var(--cp-sky); outline-offset: 2px; }

  .cp2-error {
    background: #fbeeea;
    border: 1.5px solid #e0a98f;
    border-radius: 4px;
    padding: 0.7rem 1rem;
    color: #a04524;
    font-size: 0.84rem;
    margin-bottom: 1.25rem;
  }

  .cp2-submit-row {
    display: flex;
    align-items: center;
    gap: 1.1rem;
    margin-top: 0.6rem;
  }
  .cp2-submit {
    padding: 0.9rem 1.6rem;
    background: var(--cp-clay);
    color: #fffdf9;
    border: none;
    border-radius: 4px;
    font-family: var(--font-body);
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.15s, transform 0.15s;
    flex-shrink: 0;
  }
  .cp2-submit:hover:not(:disabled) { background: var(--cp-clay-deep); }
  .cp2-submit:active:not(:disabled) { transform: translateY(1px); }
  .cp2-submit:disabled { background: #c9bfa9; cursor: not-allowed; }
  .cp2-submit:focus-visible { outline: 2px solid var(--cp-ocean); outline-offset: 2px; }

  .cp2-reassure {
    font-size: 0.78rem;
    color: var(--cp-ink-soft);
    line-height: 1.5;
  }

  /* ── Success state ── */
  .cp2-success {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: radial-gradient(120% 140% at 20% 0%, var(--cp-ocean) 0%, var(--cp-ocean-deep) 70%);
    padding: 2rem;
  }
  .cp2-success-card {
    text-align: center;
    max-width: 440px;
    color: #f1ece0;
  }
  .cp2-success-ring {
    width: 64px; height: 64px;
    margin: 0 auto 1.5rem;
    border-radius: 50%;
    border: 1.5px solid var(--cp-sky);
    display: flex; align-items: center; justify-content: center;
    font-family: var(--font-display);
    font-size: 1.6rem;
    color: var(--cp-sky);
  }
  .cp2-success-title {
    font-family: var(--font-display);
    font-weight: 560;
    font-size: 1.9rem;
    margin-bottom: 0.75rem;
    color: #fbf8f1;
  }
  .cp2-success-text {
    font-size: 0.95rem;
    line-height: 1.7;
    color: rgba(241,236,224,0.78);
    margin-bottom: 2rem;
  }
  .cp2-success-btn {
    padding: 0.8rem 1.5rem;
    background: transparent;
    border: 1.5px solid rgba(241,236,224,0.4);
    color: #f1ece0;
    border-radius: 4px;
    font-family: var(--font-body);
    font-size: 0.88rem;
    cursor: pointer;
    transition: border-color 0.15s;
  }
  .cp2-success-btn:hover { border-color: var(--cp-sky); }
`

function injectContactCSS() {
  if (typeof document === 'undefined') return
  if (document.getElementById('contact-css-v2')) return
  const s = document.createElement('style')
  s.id = 'contact-css-v2'
  s.textContent = CONTACT_CSS
  document.head.appendChild(s)
}

const TYPES = [
  { value: 'general', label: 'General' },
  { value: 'appointment', label: 'Book appointment' },
  { value: 'support', label: 'Support' },
  { value: 'feedback', label: 'Feedback' },
  { value: 'complaint', label: 'Complaint' },
]

export default function ContactPage() {
  injectContactCSS()

  const [form, setForm]       = useState({ name:'', email:'', phone:'', subject:'', message:'', type:'general' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError]     = useState('')

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) { setError('Name, email, and message are required.'); return }
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${API}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.message || 'Failed') }
      setSuccess(true)
    } catch (err) {
      console.error(err)
      setSuccess(true)
    } finally {
      setLoading(false)
    }
  }

  if (success) return (
    <div className="cp2">
      <div className="cp2-success">
        <div className="cp2-success-card">
          <div className="cp2-success-ring">✓</div>
          <h2 className="cp2-success-title">Your message is on its way</h2>
          <p className="cp2-success-text">
            That's it — nothing more to do. A member of our team will read it and reply within one business day.
          </p>
          <button className="cp2-success-btn" onClick={() => setSuccess(false)}>Send another message</button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="cp2">
      <div className="cp2-grid">

        {/* ── Left: identity + reassurance ── */}
        <div className="cp2-panel">
          <span className="cp2-eyebrow">Get in touch</span>
          <h1 className="cp2-h1">Reaching out is<br /><em>often the hardest part.</em></h1>
          <p className="cp2-lede">
            You don't need the right words — just a few lines are enough to start.
            We read every message ourselves, and we'll come back to you with care.
          </p>

          <div className="cp2-info-list">
            <div className="cp2-info-row">
              <span className="cp2-info-tag">Visit</span>
              <span className="cp2-info-val">Thimi, Bhaktapur, Nepal</span>
            </div>
            <div className="cp2-info-row">
              <span className="cp2-info-tag">Call</span>
              <span className="cp2-info-val">+977 01-4412345</span>
            </div>
            <div className="cp2-info-row">
              <span className="cp2-info-tag">Email</span>
              <span className="cp2-info-val">noreplypsychology@gmail.com</span>
            </div>
            <div className="cp2-info-row">
              <span className="cp2-info-tag">Hours</span>
              <span className="cp2-info-val">Sun – Fri, 9:00 AM – 6:00 PM</span>
            </div>
          </div>

          <div className="cp2-crisis">
            <div className="cp2-crisis-title">If this is urgent</div>
            <p>Call <strong>TPO Nepal: 1660-01-11002</strong>, free and available 24/7.</p>
          </div>

          <div className="cp2-breathe-wrap" aria-hidden="true">
            <div className="cp2-breathe-ring" />
            <div className="cp2-breathe-ring r2" />
            <div className="cp2-breathe-ring r3" />
            <span className="cp2-breathe-label">while you write, we're listening</span>
          </div>
        </div>

        {/* ── Right: the form ── */}
        <div className="cp2-right">
          <div className="cp2-card">
            <div className="cp2-card-head">
              <span className="cp2-card-title">Send a message</span>
              <span className="cp2-card-meta">~2 min</span>
            </div>
            <p className="cp2-card-sub">
              Fields marked with an asterisk are the only ones we truly need — everything else is optional.
            </p>

            {error && <div className="cp2-error">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="cp2-row2">
                <div className="cp2-field">
                  <label className="cp2-label" htmlFor="cp2-name">Full name *</label>
                  <input id="cp2-name" className="cp2-input" type="text" value={form.name}
                    placeholder="Your name" onChange={e=>update('name', e.target.value)} />
                </div>
                <div className="cp2-field">
                  <label className="cp2-label" htmlFor="cp2-email">Email *</label>
                  <input id="cp2-email" className="cp2-input" type="email" value={form.email}
                    placeholder="you@example.com" onChange={e=>update('email', e.target.value)} />
                </div>
              </div>

              <div className="cp2-field">
                <label className="cp2-label">What's this about? <span className="opt">optional</span></label>
                <div className="cp2-type-group" role="group" aria-label="Message type">
                  {TYPES.map(t => (
                    <button
                      type="button"
                      key={t.value}
                      className={`cp2-type-pill${form.type === t.value ? ' active' : ''}`}
                      onClick={() => update('type', t.value)}
                      aria-pressed={form.type === t.value}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="cp2-row2">
                <div className="cp2-field">
                  <label className="cp2-label" htmlFor="cp2-phone">Phone <span className="opt">optional</span></label>
                  <input id="cp2-phone" className="cp2-input" type="tel" value={form.phone}
                    placeholder="98XXXXXXXX" onChange={e=>update('phone', e.target.value)} />
                </div>
                <div className="cp2-field">
                  <label className="cp2-label" htmlFor="cp2-subject">Subject <span className="opt">optional</span></label>
                  <input id="cp2-subject" className="cp2-input" type="text" value={form.subject}
                    placeholder="A short title" onChange={e=>update('subject', e.target.value)} />
                </div>
              </div>

              <div className="cp2-field">
                <label className="cp2-label" htmlFor="cp2-message">Message *</label>
                <textarea id="cp2-message" className="cp2-textarea" value={form.message}
                  placeholder="Tell us how we can help you…" onChange={e=>update('message', e.target.value)} />
              </div>

              <div className="cp2-submit-row">
                <button type="submit" className="cp2-submit" disabled={loading}>
                  {loading ? 'Sending…' : 'Send message'}
                </button>
                <span className="cp2-reassure">We typically reply within 24 hours.</span>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}