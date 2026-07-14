// src/pages/ContactPage.jsx
import { useState } from 'react'

const API = import.meta.env.VITE_API_URL || '${import.meta.env.VITE_API_URL}/api'

const CONTACT_CSS = `
  .cp3 {
    font-family: var(--font-body);
    color: var(--text-dark);
  }

  .cp3-wrap {
    max-width: 1040px;
    margin: 3rem auto;
    padding: 0 1.25rem;
  }

  .cp3-card {
    border-radius: 28px;
    background: linear-gradient(180deg, #c7e3f7 0%, var(--white) 42%);
    border: 1px solid var(--blue-pale);
    box-shadow: var(--shadow-soft, 0 20px 50px rgba(15,52,96,0.08));
    overflow: hidden;
  }

  .cp3-head {
    padding: 2.75rem 3rem 1.75rem;
    text-align: center;
  }
  @media (max-width: 600px) {
    .cp3-head { padding: 2.25rem 1.5rem 1.25rem; }
  }

  .cp3-tag {
    display: inline-block;
    font-family: var(--font-body);
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    color: var(--green-deep);
    background: var(--green-mist);
    border: 1px solid var(--green-pale);
    padding: 0.3rem 0.85rem;
    border-radius: 100px;
    margin-bottom: 1rem;
  }

  .cp3-title {
    font-family: var(--font-display);
    font-size: clamp(1.7rem, 3.2vw, 2.3rem);
    font-weight: 700;
    color: var(--text-dark);
    margin: 0 0 0.6rem;
  }

  .cp3-sub {
    font-family: var(--font-body);
    font-size: 0.96rem;
    color: var(--text-light);
    max-width: 46ch;
    margin: 0 auto;
    line-height: 1.65;
  }

  .cp3-body {
    display: grid;
    grid-template-columns: 1fr 1.35fr;
    gap: 0;
    padding: 0.5rem 3rem 3rem;
  }
  @media (max-width: 760px) {
    .cp3-body { grid-template-columns: 1fr; padding: 0.5rem 1.5rem 2rem; gap: 2rem; }
  }

  /* ── info column: blends into the same card, no hard divider ── */
  .cp3-info {
    padding: 1.5rem 2rem 1.5rem 0;
  }
  @media (max-width: 760px) {
    .cp3-info { padding: 0; }
  }

  .cp3-info-item {
    padding: 0.95rem 0;
    border-bottom: 1px solid var(--blue-pale);
  }
  .cp3-info-item:last-of-type { border-bottom: none; }

  .cp3-info-label {
    font-family: var(--font-body);
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.03em;
    color: var(--sky);
    text-transform: uppercase;
    margin-bottom: 0.3rem;
  }
  .cp3-info-val {
    font-family: var(--font-body);
    font-size: 0.92rem;
    color: var(--text-mid);
    line-height: 1.5;
  }

  .cp3-crisis {
    margin-top: 1.5rem;
    padding: 1rem 1.15rem;
    border-radius: 16px;
    background: var(--off-white);
    border: 1px solid var(--blue-pale);
  }
  .cp3-crisis-label {
    font-family: var(--font-body);
    font-size: 0.72rem;
    font-weight: 700;
    color: var(--text-mid);
    margin-bottom: 0.3rem;
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }
  .cp3-crisis-text {
    font-family: var(--font-body);
    font-size: 0.85rem;
    color: var(--text-light);
    line-height: 1.55;
    margin: 0;
  }
  .cp3-crisis-text strong { color: var(--text-dark); }

  /* ── form column ── */
  .cp3-form-panel {
    background: var(--white);
    border-radius: 22px;
    border: 1px solid var(--blue-pale);
    padding: 1.75rem 2rem;
  }
  @media (max-width: 600px) {
    .cp3-form-panel { padding: 1.5rem; }
  }

  .cp3-field { margin-bottom: 1.1rem; }
  .cp3-row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
  @media (max-width: 480px) {
    .cp3-row2 { grid-template-columns: 1fr; }
  }

  .cp3-label {
    display: block;
    font-family: var(--font-body);
    font-size: 0.82rem;
    font-weight: 600;
    color: var(--text-mid);
    margin-bottom: 0.4rem;
  }
  .cp3-label .opt { font-weight: 400; color: var(--text-light); }

  .cp3-input, .cp3-select, .cp3-textarea {
    width: 100%;
    padding: 0.75rem 0.95rem;
    border: 1.5px solid var(--blue-pale);
    border-radius: 12px;
    font-family: var(--font-body);
    font-size: 0.93rem;
    color: var(--text-dark);
    background: var(--white);
    outline: none;
    transition: border-color 0.18s;
  }
  .cp3-input:focus, .cp3-select:focus, .cp3-textarea:focus {
    border-color: var(--sky);
  }
  .cp3-textarea { resize: vertical; min-height: 110px; }

  .cp3-error {
    background: #fdf1f1;
    border: 1px solid #f0bcbc;
    border-radius: 12px;
    padding: 0.7rem 1rem;
    color: #c0392b;
    font-size: 0.84rem;
    margin-bottom: 1.1rem;
  }

  .cp3-submit-row {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
    margin-top: 0.4rem;
  }

  .cp3-submit {
    padding: 0.85rem 1.6rem;
    background: linear-gradient(135deg, #0f3460 0%, #2980b9 100%);
    color: var(--white);
    border: none;
    border-radius: 100px;
    font-family: var(--font-body);
    font-size: 0.92rem;
    font-weight: 700;
    cursor: pointer;
    transition: opacity 0.18s, transform 0.18s;
  }
  .cp3-submit:hover:not(:disabled) { opacity: 0.92; }
  .cp3-submit:active:not(:disabled) { transform: translateY(1px); }
  .cp3-submit:disabled { background: var(--text-light); cursor: not-allowed; }

  .cp3-reassure {
    font-family: var(--font-body);
    font-size: 0.8rem;
    color: var(--text-light);
  }

  /* ── success ── */
  .cp3-success-wrap {
    max-width: 560px;
    margin: 5rem auto;
    padding: 0 1.25rem;
    text-align: center;
  }
  .cp3-success-card {
    border-radius: 28px;
    background: linear-gradient(180deg, #c7e3f7 0%, var(--white) 62%);
    border: 1px solid var(--blue-pale);
    padding: 3rem 2.5rem;
    box-shadow: var(--shadow-soft, 0 20px 50px rgba(15,52,96,0.08));
  }
  .cp3-success-title {
    font-family: var(--font-display);
    font-size: 1.7rem;
    font-weight: 700;
    color: var(--text-dark);
    margin: 0 0 0.65rem;
  }
  .cp3-success-text {
    font-family: var(--font-body);
    font-size: 0.94rem;
    color: var(--text-light);
    line-height: 1.65;
    margin-bottom: 1.75rem;
  }
  .cp3-success-btn {
    padding: 0.75rem 1.5rem;
    border-radius: 100px;
    border: 1.5px solid var(--blue-pale);
    background: var(--white);
    color: var(--text-dark);
    font-family: var(--font-body);
    font-size: 0.88rem;
    font-weight: 600;
    cursor: pointer;
    transition: border-color 0.18s;
  }
  .cp3-success-btn:hover { border-color: var(--sky); }
`

function injectContactCSS() {
  if (typeof document === 'undefined') return
  if (document.getElementById('contact-css-v3')) return
  const s = document.createElement('style')
  s.id = 'contact-css-v3'
  s.textContent = CONTACT_CSS
  document.head.appendChild(s)
}

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
    <div className="cp3">
      <div className="cp3-success-wrap">
        <div className="cp3-success-card">
          <h2 className="cp3-success-title">Your message is on its way</h2>
          <p className="cp3-success-text">
            Thank you for reaching out. A member of our team will read it and reply within one business day.
          </p>
          <button className="cp3-success-btn" onClick={() => setSuccess(false)}>Send another message</button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="cp3">
      <div className="cp3-wrap">
        <div className="cp3-card">

          <div className="cp3-head">
            <span className="cp3-tag">Get in touch</span>
            <h1 className="cp3-title">We'd like to hear from you</h1>
            <p className="cp3-sub">
              Send us a short message and our team will get back to you within 24 hours.
            </p>
          </div>

          <div className="cp3-body">

            {/* ── Info column ── */}
            <div className="cp3-info">
              <div className="cp3-info-item">
                <div className="cp3-info-label">Address</div>
                <div className="cp3-info-val">Thimi, Bhaktapur, Nepal</div>
              </div>
              <div className="cp3-info-item">
                <div className="cp3-info-label">Phone</div>
                <div className="cp3-info-val">+977 01-4412345</div>
              </div>
              <div className="cp3-info-item">
                <div className="cp3-info-label">Email</div>
                <div className="cp3-info-val">noreplypsychology@gmail.com</div>
              </div>
              <div className="cp3-info-item">
                <div className="cp3-info-label">Hours</div>
                <div className="cp3-info-val">Sun – Fri, 9:00 AM – 6:00 PM</div>
              </div>

              <div className="cp3-crisis">
                <div className="cp3-crisis-label">If this is urgent</div>
                <p className="cp3-crisis-text">
                  Call <strong>TPO Nepal: 1660-01-11002</strong>, free and available 24/7.
                </p>
              </div>
            </div>

            {/* ── Form column ── */}
            <div className="cp3-form-panel">
              {error && <div className="cp3-error">{error}</div>}

              <form onSubmit={handleSubmit}>
                <div className="cp3-row2">
                  <div className="cp3-field">
                    <label className="cp3-label" htmlFor="cp3-name">Full name *</label>
                    <input id="cp3-name" className="cp3-input" type="text" value={form.name}
                      placeholder="Your name" onChange={e=>update('name', e.target.value)} />
                  </div>
                  <div className="cp3-field">
                    <label className="cp3-label" htmlFor="cp3-email">Email *</label>
                    <input id="cp3-email" className="cp3-input" type="email" value={form.email}
                      placeholder="you@example.com" onChange={e=>update('email', e.target.value)} />
                  </div>
                </div>

                <div className="cp3-row2">
                  <div className="cp3-field">
                    <label className="cp3-label" htmlFor="cp3-phone">Phone <span className="opt">(optional)</span></label>
                    <input id="cp3-phone" className="cp3-input" type="tel" value={form.phone}
                      placeholder="98XXXXXXXX" onChange={e=>update('phone', e.target.value)} />
                  </div>
                  <div className="cp3-field">
                    <label className="cp3-label" htmlFor="cp3-type">Type</label>
                    <select id="cp3-type" className="cp3-select" value={form.type}
                      onChange={e=>update('type', e.target.value)}>
                      <option value="general">General inquiry</option>
                      <option value="appointment">Book appointment</option>
                      <option value="support">Support</option>
                      <option value="complaint">Complaint</option>
                      <option value="feedback">Feedback</option>
                    </select>
                  </div>
                </div>

                <div className="cp3-field">
                  <label className="cp3-label" htmlFor="cp3-subject">Subject <span className="opt">(optional)</span></label>
                  <input id="cp3-subject" className="cp3-input" type="text" value={form.subject}
                    placeholder="What is this about?" onChange={e=>update('subject', e.target.value)} />
                </div>

                <div className="cp3-field">
                  <label className="cp3-label" htmlFor="cp3-message">Message *</label>
                  <textarea id="cp3-message" className="cp3-textarea" value={form.message}
                    placeholder="Tell us how we can help you…" onChange={e=>update('message', e.target.value)} />
                </div>

                <div className="cp3-submit-row">
                  <button type="submit" className="cp3-submit" disabled={loading}>
                    {loading ? 'Sending…' : 'Send message'}
                  </button>
                  <span className="cp3-reassure">We typically reply within 24 hours.</span>
                </div>
              </form>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}