// src/pages/ContactPage.jsx
import { useState } from 'react'

const API = import.meta.env.VITE_API_URL || '/api'

const CONTACT_CSS = `
  .cp3 {
    font-family: var(--font-body);
    color: var(--text-dark);
  }

  .cp3-wrap {
    max-width: 1440px;
    margin: 3rem auto;
    padding: 0 2rem;
  }
  @media (max-width: 700px) {
    .cp3-wrap { padding: 0 1rem; margin: 1.5rem auto; }
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

  /* ── main layout: narrow info sidebar + wide right side (map + form) ── */
  .cp3-body {
    display: grid;
    grid-template-columns: 300px 1fr;
    align-items: start;
    gap: 2rem;
    padding: 0.5rem 3rem 3rem;
  }
  @media (max-width: 1100px) {
    .cp3-body { grid-template-columns: 260px 1fr; gap: 1.5rem; padding: 0.5rem 2rem 2.5rem; }
  }
  @media (max-width: 800px) {
    .cp3-body { grid-template-columns: 1fr; padding: 0.5rem 1.5rem 2rem; gap: 1.75rem; }
  }

  /* ── info sidebar ── */
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

  /* ── right side: map on top, roomy form below ── */
  .cp3-right {
    display: flex;
    flex-direction: column;
    gap: 1.75rem;
    min-width: 0;
  }

  /* ── map panel ── */
  .cp3-map-panel {
    position: relative;
    border-radius: 22px;
    padding: 1.1rem 1.25rem;
    background: linear-gradient(160deg, rgba(255,255,255,0.8) 0%, rgba(214,238,252,0.55) 55%, rgba(255,255,255,0.78) 100%);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(255,255,255,0.65);
    box-shadow: 0 10px 34px rgba(0,123,168,0.14), inset 0 1px 0 rgba(255,255,255,0.6);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
    box-sizing: border-box;
  }
  .cp3-map-panel-cracks {
    position: absolute;
    inset: 0;
    opacity: 0.22;
    pointer-events: none;
  }
  .cp3-map-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-family: var(--font-body);
    font-size: 0.78rem;
    font-weight: 700;
    color: var(--sky);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    position: relative;
    z-index: 1;
  }
  .cp3-map-frame-wrap {
    position: relative;
    border-radius: 16px;
    overflow: hidden;
    border: 1.5px solid rgba(120,190,230,0.55);
    box-shadow: 0 4px 18px rgba(0,90,140,0.10);
    height: 260px;
    z-index: 1;
  }
  @media (max-width: 800px) {
    .cp3-map-frame-wrap { height: 220px; }
  }
  .cp3-map-frame-wrap iframe {
    width: 100%;
    height: 100%;
    border: none;
    display: block;
    filter: saturate(1.05);
  }
  .cp3-map-click-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    padding-bottom: 0.75rem;
    background: linear-gradient(to top, rgba(15,52,96,0.35) 0%, transparent 45%);
    cursor: pointer;
    text-decoration: none;
    transition: background 0.2s ease;
  }
  .cp3-map-click-overlay:hover {
    background: linear-gradient(to top, rgba(15,52,96,0.5) 0%, transparent 50%);
  }
  .cp3-map-open-pill {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    background: rgba(255,255,255,0.92);
    color: var(--text-dark);
    font-family: var(--font-body);
    font-size: 0.76rem;
    font-weight: 700;
    padding: 0.4rem 0.9rem;
    border-radius: 100px;
    box-shadow: 0 4px 14px rgba(0,0,0,0.18);
  }
  .cp3-map-coords {
    font-family: var(--font-body);
    font-size: 0.74rem;
    color: var(--text-light);
    position: relative;
    z-index: 1;
  }
  .cp3-map-coords strong { color: var(--text-mid); font-family: monospace; }

  /* ── form panel: now full width of the right column, so fields get room ── */
  .cp3-form-panel {
    background: var(--white);
    border-radius: 22px;
    border: 1px solid var(--blue-pale);
    padding: 2rem 2.25rem;
  }
  @media (max-width: 600px) {
    .cp3-form-panel { padding: 1.5rem; }
  }

  .cp3-field { margin-bottom: 1.25rem; }
  .cp3-row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; }
  @media (max-width: 520px) {
    .cp3-row2 { grid-template-columns: 1fr; }
  }

  .cp3-label {
    display: block;
    font-family: var(--font-body);
    font-size: 0.84rem;
    font-weight: 600;
    color: var(--text-mid);
    margin-bottom: 0.4rem;
  }
  .cp3-label .opt { font-weight: 400; color: var(--text-light); }

  .cp3-input, .cp3-select, .cp3-textarea {
    width: 100%;
    padding: 0.8rem 1rem;
    border: 1.5px solid var(--blue-pale);
    border-radius: 12px;
    font-family: var(--font-body);
    font-size: 0.95rem;
    color: var(--text-dark);
    background: var(--white);
    outline: none;
    transition: border-color 0.18s;
    box-sizing: border-box;
  }
  .cp3-input:focus, .cp3-select:focus, .cp3-textarea:focus {
    border-color: var(--sky);
  }
  .cp3-textarea { resize: vertical; min-height: 130px; }

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
    padding: 0.9rem 1.8rem;
    background: linear-gradient(135deg, #0f3460 0%, #2980b9 100%);
    color: var(--white);
    border: none;
    border-radius: 100px;
    font-family: var(--font-body);
    font-size: 0.94rem;
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
  const existing = document.getElementById('contact-css-v3')
  if (existing) existing.remove()
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
      setError('Something went wrong sending your message. Please try again in a moment.')
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

            {/* ── Left: narrow info sidebar ── */}
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

            {/* ── Right: map on top, full-width form below ── */}
            <div className="cp3-right">
              <div className="cp3-map-panel">
                <svg className="cp3-map-panel-cracks" viewBox="0 0 300 260" preserveAspectRatio="none">
                  <polyline points="0,20 40,45 70,18 120,50" stroke="white" strokeWidth="0.6" fill="none" />
                  <polyline points="120,50 160,28 200,55" stroke="white" strokeWidth="0.5" fill="none" />
                  <polyline points="0,180 35,210 65,175 100,225" stroke="white" strokeWidth="0.5" fill="none" />
                  <polyline points="200,150 235,120 300,155" stroke="white" strokeWidth="0.5" fill="none" />
                  <polyline points="150,230 175,195 220,235" stroke="white" strokeWidth="0.4" fill="none" />
                </svg>

                <div className="cp3-map-label">📍 Find Our Office</div>

                <div className="cp3-map-frame-wrap">
                  <iframe
                    title="Office location"
                    src="https://www.google.com/maps?q=85.58,25.5&z=15&output=embed"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                  <a
                    className="cp3-map-click-overlay"
                    href="https://www.google.com/maps?q=85.58,25.5"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Open location in Google Maps"
                  >
                    <span className="cp3-map-open-pill">🧭 Open in Google Maps →</span>
                  </a>
                </div>

                <div className="cp3-map-coords">
                  Exact pin: <strong>25.88, 85.5</strong>
                </div>
              </div>

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
    </div>
  )
}