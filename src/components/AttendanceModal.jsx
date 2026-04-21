// src/components/AttendanceModal.jsx
// Self-contained attendance/enrollment popup.
// Plugs into FloatingActions — call setPopup('attendance') to open.

import { useState, useEffect } from 'react'

const API_BASE = import.meta.env.VITE_API_URL || '${import.meta.env.VITE_API_URL}/api'

// ── Colour tokens matching the rest of the dark popup family ──
const C = {
  sky:     '#00BFFF',
  skyDeep: '#007BA8',
  skyFaint:'rgba(0,191,255,0.08)',
  border:  'rgba(0,191,255,0.18)',
  text:    'rgba(200,230,255,0.9)',
  muted:   'rgba(160,210,255,0.55)',
  bg:      '#0a1628',
  bgRow:   'rgba(255,255,255,0.04)',
  green:   '#22c55e',
  red:     '#ef4444',
  amber:   '#f59e0b',
}

const SEX_OPTIONS = [
  { value:'',                  label:'Select…'           },
  { value:'male',              label:'Male'              },
  { value:'female',            label:'Female'            },
  { value:'other',             label:'Other'             },
  { value:'prefer_not_to_say', label:'Prefer not to say' },
]

// ── Reusable field component ───────────────────────────────
function Field({ label, required, error, children }) {
  return (
    <div style={{ marginBottom:'0.95rem' }}>
      <label style={{ display:'block', fontSize:'0.65rem', fontWeight:800, letterSpacing:'0.1em', textTransform:'uppercase', color:error ? C.red : C.muted, marginBottom:'0.35rem' }}>
        {label}{required && <span style={{ color:C.amber, marginLeft:3 }}>*</span>}
      </label>
      {children}
      {error && <div style={{ fontSize:'0.68rem', color:C.red, marginTop:'0.3rem' }}>{error}</div>}
    </div>
  )
}

const inputStyle = (hasErr) => ({
  width:'100%', boxSizing:'border-box',
  padding:'0.6rem 0.85rem',
  background:'rgb(6, 6, 6)',
  border:`1.5px solid ${hasErr ? C.red : 'rgba(9, 64, 246, 0.2)'}`,
  borderRadius:10,
  color:'white', fontSize:'0.85rem',
  outline:'none', fontFamily:'inherit',
  transition:'border-color 0.15s',
})

// ── Success screen ─────────────────────────────────────────
function SuccessScreen({ eventTitle, onClose }) {
  return (
    <div style={{ padding:'2.5rem 2rem', textAlign:'center' }}>
      <div style={{ width:64, height:64, borderRadius:'50%', background:'rgba(34,197,94,0.15)', border:'2px solid rgba(34,197,94,0.4)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1.25rem', fontSize:'1.8rem' }}>✓</div>
      <h3 style={{ color:'white', fontFamily:'inherit', fontWeight:800, fontSize:'1.1rem', margin:'0 0 0.6rem' }}>Registration Successful!</h3>
      <p style={{ color:C.text, fontSize:'0.82rem', lineHeight:1.7, margin:'0 0 1.75rem' }}>
        You're registered for <strong style={{ color:'white' }}>{eventTitle}</strong>. We look forward to seeing you there!
      </p>
      <button onClick={onClose}
        style={{ padding:'0.75rem 2rem', background:`linear-gradient(135deg,${C.skyDeep},${C.sky})`, border:'none', borderRadius:100, color:'white', fontWeight:800, fontSize:'0.85rem', cursor:'pointer', fontFamily:'inherit' }}>
        Done
      </button>
    </div>
  )
}

// ── Main modal ─────────────────────────────────────────────
export default function AttendanceModal({ onClose }) {
  const [events,      setEvents]      = useState([])
  const [loadingEvts, setLoadingEvts] = useState(true)
  const [evtError,    setEvtError]    = useState('')

  const [form, setForm] = useState({
    event_id:'', full_name:'', email:'', phone:'',
    organization:'', age:'', sex:'', designation:'', district:'', notes:'',
  })
  const [fieldErrors, setFieldErrors] = useState({})
  const [submitting,  setSubmitting]  = useState(false)
  const [serverError, setServerError] = useState('')
  const [submitted,   setSubmitted]   = useState(false)
  const [doneEvent,   setDoneEvent]   = useState('')

  // Lock body scroll + Escape key
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [onClose])

  // Load events
  useEffect(() => {
    setLoadingEvts(true)
    fetch(`${API_BASE}/attendance/events`)
      .then(r => r.json())
      .then(d => { setEvents(d.events || []); setLoadingEvts(false) })
      .catch(() => { setEvtError('Could not load events. Please try again.'); setLoadingEvts(false) })
  }, [])

  function set(field, value) {
    setForm(f => ({ ...f, [field]:value }))
    setFieldErrors(fe => ({ ...fe, [field]:'' }))
    setServerError('')
  }

  function validate() {
    const errs = {}
    if (!form.event_id)           errs.event_id   = 'Please select an event.'
    if (!form.full_name.trim())   errs.full_name  = 'Full name is required.'
    if (!form.email.trim())       errs.email      = 'Email is required.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errs.email = 'Enter a valid email.'
    if (form.age && (isNaN(Number(form.age)) || Number(form.age) < 1 || Number(form.age) > 120)) {
      errs.age = 'Age must be between 1 and 120.'
    }
    return errs
  }

  async function handleSubmit() {
    const errs = validate()
    if (Object.keys(errs).length) { setFieldErrors(errs); return }

    setSubmitting(true); setServerError('')
    try {
      const payload = { ...form, age: form.age ? Number(form.age) : undefined }
      Object.keys(payload).forEach(k => { if (payload[k] === '' || payload[k] === undefined) delete payload[k] })

      const res  = await fetch(`${API_BASE}/attendance/register`, {
        method:'POST', headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()

      if (!res.ok) {
        setServerError(data.message || 'Registration failed.')
        return
      }

      setDoneEvent(events.find(e => e.id === form.event_id)?.title || 'the event')
      setSubmitted(true)
    } catch {
      setServerError('Network error. Please check your connection and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const selectedEvent = events.find(e => e.id === form.event_id)

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      style={{ position:'fixed', inset:0, background:'rgba(0,10,20,0.7)', backdropFilter:'blur(6px)', WebkitBackdropFilter:'blur(6px)', zIndex:10001, display:'flex', alignItems:'center', justifyContent:'center', padding:16, animation:'popup-overlay-in 0.22s ease both' }}>

      <div style={{ position:'relative', width:'min(520px,96vw)', maxHeight:'92vh', borderRadius:22, overflow:'hidden', background:C.bg, boxShadow:`0 32px 80px rgba(0,0,0,0.55), 0 0 0 1.5px ${C.border}, inset 0 1px 0 rgba(255,255,255,0.07)`, display:'flex', flexDirection:'column', animation:'popup-card-in 0.32s cubic-bezier(0.34,1.56,0.64,1) both' }}>

        {/* ── Header ── */}
        <div style={{ padding:'16px 18px 14px', background:'linear-gradient(180deg,rgba(7,18,38,0.97) 60%,transparent 100%)', display:'flex', alignItems:'center', gap:10, borderBottom:`1px solid ${C.border}`, flexShrink:0 }}>
          <div style={{ width:8, height:8, borderRadius:'50%', background:C.sky, boxShadow:`0 0 8px ${C.sky}`, flexShrink:0 }}/>
          <div style={{ flex:1 }}>
            <p style={{ fontSize:'0.65rem', fontWeight:800, letterSpacing:'0.1em', textTransform:'uppercase', color:'rgba(0,191,255,0.7)', margin:'0 0 2px' }}>Event Attendance</p>
            <h2 style={{ color:'white', margin:0, fontSize:'1.05rem', fontWeight:800, lineHeight:1.2 }}>Register Your Attendance</h2>
            <p style={{ fontSize:'0.68rem', color:'rgba(180,220,255,0.65)', margin:'2px 0 0' }}>Fill in your details to enroll in an event or program</p>
          </div>
          <button onClick={onClose}
            style={{ width:34, height:34, borderRadius:'50%', background:'linear-gradient(135deg,#dc2626,#ef4444)', border:'1.5px solid rgba(255,100,100,0.5)', color:'white', fontSize:'1rem', fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, lineHeight:1, boxShadow:'0 3px 14px rgba(220,38,38,0.5)', transition:'all 0.18s', outline:'none' }}
            onMouseEnter={e=>{e.currentTarget.style.transform='scale(1.1) rotate(90deg)'}}
            onMouseLeave={e=>{e.currentTarget.style.transform='none'}}
            aria-label="Close">✕</button>
        </div>

        {/* ── Body ── */}
        <div style={{ overflowY:'auto', flex:1 }}>
          {submitted ? (
            <SuccessScreen eventTitle={doneEvent} onClose={onClose}/>
          ) : (
            <div style={{ padding:'1.25rem 1.5rem 1.5rem' }}>

              {/* Event picker */}
              <Field label="Event / Program" required error={fieldErrors.event_id}>
                {loadingEvts ? (
                  <div style={{ ...inputStyle(false), color:C.muted }}>Loading events…</div>
                ) : evtError ? (
                  <div style={{ fontSize:'0.8rem', color:C.red }}>{evtError}</div>
                ) : (
                  <select value={form.event_id} onChange={e => set('event_id', e.target.value)}
                    style={{ ...inputStyle(!!fieldErrors.event_id), cursor:'pointer' }}>
                    <option value="">Select an event…</option>
                    {events.map(ev => (
                      <option key={ev.id} value={ev.id}>
                        {ev.title} {ev.starts_at ? `— ${new Date(ev.starts_at).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}` : ''}
                      </option>
                    ))}
                  </select>
                )}
              </Field>

              {/* Event info badge */}
              {selectedEvent && (
                <div style={{ background:'rgba(0,191,255,0.07)', border:'1px solid rgba(0,191,255,0.2)', borderRadius:10, padding:'0.65rem 0.9rem', marginBottom:'1.1rem', fontSize:'0.75rem', color:C.text, display:'flex', gap:'0.75rem', flexWrap:'wrap' }}>
                  {selectedEvent.location && <span>📍 {selectedEvent.location}</span>}
                  {selectedEvent.is_online && <span>💻 Online</span>}
                  {selectedEvent.starts_at && <span>📅 {new Date(selectedEvent.starts_at).toLocaleString('en-US',{weekday:'short',month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})}</span>}
                  {selectedEvent.capacity && <span>👥 {selectedEvent.capacity} seats</span>}
                </div>
              )}

              {/* Two-column grid for compact fields */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 1rem' }}>
                <div style={{ gridColumn:'1/-1' }}>
                  <Field label="Full Name" required error={fieldErrors.full_name}>
                    <input type="text" placeholder="Your full name" value={form.full_name}
                      onChange={e => set('full_name', e.target.value)}
                      style={inputStyle(!!fieldErrors.full_name)}/>
                  </Field>
                </div>

                <Field label="Email Address" required error={fieldErrors.email}>
                  <input type="email" placeholder="you@example.com" value={form.email}
                    onChange={e => set('email', e.target.value)}
                    style={inputStyle(!!fieldErrors.email)}/>
                </Field>

                <Field label="Phone Number" error={fieldErrors.phone}>
                  <input type="tel" placeholder="+977 98XXXXXXXX" value={form.phone}
                    onChange={e => set('phone', e.target.value)}
                    style={inputStyle(!!fieldErrors.phone)}/>
                </Field>

                <Field label="Organization / Institution" error={fieldErrors.organization}>
                  <input type="text" placeholder="Company, school, NGO…" value={form.organization}
                    onChange={e => set('organization', e.target.value)}
                    style={inputStyle(false)}/>
                </Field>

                <Field label="Designation / Role" error={fieldErrors.designation}>
                  <input type="text" placeholder="e.g. Student, Counselor" value={form.designation}
                    onChange={e => set('designation', e.target.value)}
                    style={inputStyle(false)}/>
                </Field>

                <Field label="Age" error={fieldErrors.age}>
                  <input type="number" placeholder="e.g. 25" min={1} max={120} value={form.age}
                    onChange={e => set('age', e.target.value)}
                    style={inputStyle(!!fieldErrors.age)}/>
                </Field>

                <Field label="Sex" error={fieldErrors.sex}>
                  <select value={form.sex} onChange={e => set('sex', e.target.value)}
                    style={{ ...inputStyle(false), cursor:'pointer' }}>
                    {SEX_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </Field>

                <Field label="District" error={fieldErrors.district}>
                  <input type="text" placeholder="Your district" value={form.district}
                    onChange={e => set('district', e.target.value)}
                    style={inputStyle(false)}/>
                </Field>

                <div style={{ gridColumn:'1/-1' }}>
                  <Field label="Additional Notes" error={fieldErrors.notes}>
                    <textarea placeholder="Any accessibility needs, questions, or comments…" rows={2}
                      value={form.notes} onChange={e => set('notes', e.target.value)}
                      style={{ ...inputStyle(false), resize:'vertical', minHeight:60 }}/>
                  </Field>
                </div>
              </div>

              {/* Server error */}
              {serverError && (
                <div style={{ background:'rgba(239,68,68,0.1)', border:'1.5px solid rgba(239,68,68,0.35)', borderRadius:10, padding:'0.75rem 1rem', marginBottom:'1rem', fontSize:'0.82rem', color:'#fca5a5', lineHeight:1.6 }}>
                  ⚠ {serverError}
                </div>
              )}

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={submitting || loadingEvts}
                style={{ width:'100%', padding:'0.85rem', background:submitting?'rgba(0,191,255,0.3)':`linear-gradient(135deg,${C.skyDeep},${C.sky})`, border:'none', borderRadius:12, color:'white', fontWeight:800, fontSize:'0.9rem', cursor:submitting?'not-allowed':'pointer', fontFamily:'inherit', transition:'opacity 0.15s', opacity:submitting?0.7:1 }}>
                {submitting ? 'Registering…' : 'Register Attendance →'}
              </button>

              <p style={{ fontSize:'0.65rem', color:C.muted, textAlign:'center', marginTop:'0.75rem', lineHeight:1.6 }}>
                Each person can only register once per event. Duplicate registrations with the same email are not allowed.
              </p>

            </div>
          )}
        </div>

      </div>
    </div>
  )
}
